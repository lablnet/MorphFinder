import { basename, extname, join } from 'node:path';
import { access, cp, rename as fsRename } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import type { WebContents } from 'electron';
import type { FileOperationRequest } from '@shared/types/fileSystem';
import { trashPaths } from './fileSystemService';

/**
 * Runs a copy/move/trash batch and streams progress over `fs:operationProgress`.
 * Resolves after the batch completes so callers can refresh the directory at the
 * right time instead of racing the filesystem.
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

async function executeOperation(
  operationId: string,
  request: FileOperationRequest,
  webContents: WebContents,
): Promise<void> {
  const total = request.sourcePaths.length;
  const send = (completed: number, currentPath: string, done: boolean, error?: string): void => {
    if (webContents.isDestroyed()) return;
    webContents.send('fs:operationProgress', { operationId, completed, total, currentPath, done, error });
  };

  try {
    send(0, request.sourcePaths[0] ?? '', false);
    for (const [index, sourcePath] of request.sourcePaths.entries()) {
      if (request.kind === 'trash') {
        await trashPaths([sourcePath]);
      } else {
        if (request.destinationDir === undefined) {
          throw new Error(`${request.kind} requires a destinationDir`);
        }
        if (request.kind === 'copy') {
          const destination = await uniqueCopyDestination(request.destinationDir, sourcePath);
          await cp(sourcePath, destination, { recursive: true, errorOnExist: false, force: true });
        } else {
          const destination = join(request.destinationDir, basename(sourcePath));
          await fsRename(sourcePath, destination);
        }
      }
      send(index + 1, sourcePath, index + 1 === total);
    }
  } catch (cause) {
    send(0, '', true, cause instanceof Error ? cause.message : String(cause));
  }
}
