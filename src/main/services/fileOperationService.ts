import { basename, extname, join } from 'node:path';
import { access, cp, mkdir, readdir, rename as fsRename, stat } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import type { WebContents } from 'electron';
import type { FileOperationRequest } from '@shared/types/fileSystem';
import { trashPaths } from './fileSystemService';

interface ActiveFileTask {
  controller: AbortController;
}

const activeFileTasks = new Map<string, ActiveFileTask>();

export function cancelFileOperation(operationId: string): void {
  const task = activeFileTasks.get(operationId);
  if (task) {
    task.controller.abort();
    activeFileTasks.delete(operationId);
  }
}

async function countItemsRecursively(paths: string[]): Promise<number> {
  let count = 0;
  for (const p of paths) {
    try {
      const s = await stat(p);
      if (s.isDirectory()) {
        count += 1; // Count directory itself
        const entries = await readdir(p);
        count += await countItemsRecursively(entries.map((e) => join(p, e)));
      } else {
        count += 1;
      }
    } catch {
      count += 1;
    }
  }
  return count;
}

/**
 * Runs a copy/move/trash batch and streams progress over `fs:operationProgress`.
 */
export async function runFileOperation(request: FileOperationRequest, webContents: WebContents): Promise<string> {
  const operationId = randomUUID();
  await executeOperation(operationId, request, webContents);
  return operationId;
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function uniqueCopyDestination(destinationDir: string, sourcePath: string): Promise<string> {
  const sourceName = basename(sourcePath);
  const firstDestination = join(destinationDir, sourceName);
  if (!(await pathExists(firstDestination))) return firstDestination;

  const extension = extname(sourceName);
  const stem = extension.length > 0 ? sourceName.slice(0, -extension.length) : sourceName;

  for (let index = 1; index < 10_000; index += 1) {
    const suffix = index === 1 ? '_copy' : `_copy_${index}`;
    const destination = join(destinationDir, `${stem}${suffix}${extension}`);
    if (!(await pathExists(destination))) return destination;
  }

  throw new Error(`Could not find an available copy name for ${sourceName}`);
}

async function copyWithLiveProgress(
  src: string,
  dest: string,
  signal: AbortSignal,
  onItemDone: (currentPath: string) => void,
): Promise<void> {
  if (signal.aborted) throw new Error('Operation canceled');
  let isDir = false;
  try {
    const s = await stat(src);
    isDir = s.isDirectory();
  } catch {
    isDir = false;
  }

  if (isDir) {
    await mkdir(dest, { recursive: true });
    onItemDone(src);
    let entries: string[] = [];
    try {
      entries = await readdir(src);
    } catch {
      entries = [];
    }
    for (const entry of entries) {
      if (signal.aborted) throw new Error('Operation canceled');
      await copyWithLiveProgress(join(src, entry), join(dest, entry), signal, onItemDone);
    }
  } else {
    await cp(src, dest, { recursive: true, errorOnExist: false, force: true });
    onItemDone(src);
  }
}

async function executeOperation(
  operationId: string,
  request: FileOperationRequest,
  webContents: WebContents,
): Promise<void> {
  const controller = new AbortController();
  activeFileTasks.set(operationId, { controller });

  const isCopy = request.kind === 'copy';
  const totalItems = isCopy ? await countItemsRecursively(request.sourcePaths) : request.sourcePaths.length;
  let completedItems = 0;

  const send = (completed: number, currentPath: string, done: boolean, error?: string): void => {
    if (webContents.isDestroyed()) return;
    webContents.send('fs:operationProgress', {
      operationId,
      completed,
      total: totalItems,
      currentPath,
      done,
      error,
    });
  };

  try {
    send(0, request.sourcePaths[0] ?? '', false);
    for (const [index, sourcePath] of request.sourcePaths.entries()) {
      if (controller.signal.aborted) throw new Error('Operation canceled');

      if (request.kind === 'trash') {
        await trashPaths([sourcePath]);
        completedItems += 1;
        send(completedItems, sourcePath, index + 1 === totalItems);
      } else {
        if (request.destinationDir === undefined) {
          throw new Error(`${request.kind} requires a destinationDir`);
        }
        if (request.kind === 'copy') {
          const destination = await uniqueCopyDestination(request.destinationDir, sourcePath);
          await copyWithLiveProgress(sourcePath, destination, controller.signal, (currentPath) => {
            completedItems += 1;
            send(completedItems, currentPath, completedItems === totalItems);
          });
        } else {
          const destination = join(request.destinationDir, basename(sourcePath));
          await fsRename(sourcePath, destination);
          completedItems += 1;
          send(completedItems, sourcePath, completedItems === totalItems);
        }
      }
    }
  } catch (cause) {
    const error = cause instanceof Error ? cause.message : String(cause);
    send(completedItems, '', true, error);
  } finally {
    activeFileTasks.delete(operationId);
  }
}
