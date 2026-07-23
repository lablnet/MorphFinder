import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { type ChildProcess, execFile, type ExecFileOptions } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

import type { BrowserWindow } from 'electron';

class ArchiveService {
  private activeProcesses = new Map<string, ChildProcess>();

  cancel(operationId: string): void {
    const child = this.activeProcesses.get(operationId);
    if (child) {
      try {
        child.kill('SIGKILL');
      } catch {
        // Process might already be dead
      }
      this.activeProcesses.delete(operationId);
    }
  }

  private async calculateTotalSize(paths: string[]): Promise<number> {
    let total = 0;
    for (const p of paths) {
      try {
        const stat = await fs.stat(p);
        if (stat.isDirectory()) {
          const entries = await fs.readdir(p, { withFileTypes: true });
          const childPaths = entries.map((e) => path.join(p, e.name));
          total += await this.calculateTotalSize(childPaths);
        } else {
          total += stat.size;
        }
      } catch {
        // Ignore unreadable files
      }
    }
    return total;
  }

  async compress(
    window: BrowserWindow,
    paths: string[],
    destinationZipPath?: string,
  ): Promise<{ archivePath: string }> {
    if (paths.length === 0) {
      throw new Error('No paths provided for compression');
    }

    const operationId = crypto.randomUUID();
    const firstPath = paths[0]!;
    const parentDir = path.dirname(firstPath);

    let zipPath = destinationZipPath;
    if (!zipPath) {
      const baseName = paths.length === 1 ? path.basename(firstPath) : 'Archive';
      const cleanName = baseName.replace(/\.[^/.]+$/, '');
      zipPath = path.join(parentDir, `${cleanName}.zip`);

      let counter = 1;
      while (await this.fileExists(zipPath)) {
        zipPath = path.join(parentDir, `${cleanName}_${counter}.zip`);
        counter++;
      }
    }

    const totalBytes = await this.calculateTotalSize(paths);
    let intervalTimer: NodeJS.Timeout | null = null;

    const emitProgress = (done = false, error?: string) => {
      fs.stat(zipPath!).then((stat) => {
        const bytesProcessed = stat.size;
        const percent = totalBytes > 0 ? Math.min(99, Math.round((bytesProcessed / totalBytes) * 100)) : 0;
        window.webContents.send('archive:progress', {
          operationId,
          type: 'compress',
          currentPath: zipPath!,
          bytesProcessed,
          totalBytes,
          percent: done ? 100 : percent,
          done,
          error,
        });
      }).catch(() => {
        window.webContents.send('archive:progress', {
          operationId,
          type: 'compress',
          currentPath: zipPath!,
          bytesProcessed: 0,
          totalBytes,
          percent: done ? 100 : 0,
          done,
          error,
        });
      });
    };

    // Emit initial progress synchronously
    emitProgress(false);

    // Poll size progress every 200ms during heavy compression
    intervalTimer = setInterval(() => {
      emitProgress(false);
    }, 200);

    const runChild = (file: string, args: string[], options?: ExecFileOptions) => {
      return new Promise<void>((resolve, reject) => {
        const child = execFile(file, args, options, (error) => {
          this.activeProcesses.delete(operationId);
          if (error) reject(error);
          else resolve();
        });
        this.activeProcesses.set(operationId, child);
      });
    };

    try {
      if (process.platform === 'darwin') {
        const relativeItems = paths.map((p) => path.basename(p));
        if (paths.length === 1 && relativeItems[0]) {
          await runChild('ditto', ['-c', '-k', '--sequesterRsrc', relativeItems[0], zipPath], {
            cwd: parentDir,
          });
        } else {
          await runChild('zip', ['-r', zipPath, ...relativeItems], {
            cwd: parentDir,
          });
        }
      } else if (process.platform === 'win32') {
        const itemsList = paths.map((p) => `'${p.replace(/'/g, "''")}'`).join(',');
        const psCommand = `Compress-Archive -Path ${itemsList} -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force`;
        await runChild('powershell', ['-NoProfile', '-NonInteractive', '-Command', psCommand]);
      } else {
        const relativeItems = paths.map((p) => path.basename(p));
        await runChild('zip', ['-r', zipPath, ...relativeItems], {
          cwd: parentDir,
        });
      }

      if (intervalTimer) clearInterval(intervalTimer);
      void emitProgress(true);
      return { archivePath: zipPath };
    } catch (err) {
      if (intervalTimer) clearInterval(intervalTimer);
      const errorMsg = err instanceof Error ? err.message : String(err);
      window.webContents.send('archive:progress', {
        operationId,
        type: 'compress',
        currentPath: zipPath,
        bytesProcessed: 0,
        totalBytes,
        percent: 0,
        done: true,
        error: errorMsg,
      });
      throw err;
    }
  }

  async extract(archivePath: string, destinationDir?: string): Promise<{ extractedDir: string }> {
    if (!(await this.fileExists(archivePath))) {
      throw new Error(`Archive file not found: ${archivePath}`);
    }

    const parentDir = path.dirname(archivePath);
    const archiveName = path.basename(archivePath).replace(/\.[^/.]+$/, '');

    let targetDir = destinationDir;
    if (!targetDir) {
      targetDir = path.join(parentDir, archiveName);
      let counter = 1;
      while (await this.fileExists(targetDir)) {
        targetDir = path.join(parentDir, `${archiveName}_${counter}`);
        counter++;
      }
    }

    await fs.mkdir(targetDir, { recursive: true });

    if (process.platform === 'darwin' || process.platform === 'linux') {
      if (archivePath.endsWith('.tar.gz') || archivePath.endsWith('.tgz')) {
        await execFileAsync('tar', ['-xzf', archivePath, '-C', targetDir]);
      } else if (archivePath.endsWith('.tar')) {
        await execFileAsync('tar', ['-xf', archivePath, '-C', targetDir]);
      } else {
        // Default zip extraction
        if (process.platform === 'darwin') {
          await execFileAsync('ditto', ['-x', '-k', archivePath, targetDir]);
        } else {
          await execFileAsync('unzip', ['-q', archivePath, '-d', targetDir]);
        }
      }
    } else {
      // Windows: PowerShell Expand-Archive
      const psCommand = `Expand-Archive -Path '${archivePath.replace(/'/g, "''")}' -DestinationPath '${targetDir.replace(/'/g, "''")}' -Force`;
      await execFileAsync('powershell', ['-NoProfile', '-NonInteractive', '-Command', psCommand]);
    }

    return { extractedDir: targetDir };
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

export const archiveService = new ArchiveService();
