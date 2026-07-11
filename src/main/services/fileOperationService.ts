import { basename, join } from 'node:path';
import { cp, rename as fsRename } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import type { WebContents } from 'electron';
import type { FileOperationRequest } from '@shared/types/fileSystem';
import { trashPaths } from './fileSystemService';

/**
 * Runs a copy/move/trash batch and streams progress over `fs:operationProgress`.
 * Fires and forgets from the caller's perspective — the renderer subscribes to the
 * operationId returned by `fs:operate` rather than awaiting the whole batch.
 */
export function runFileOperation(request: FileOperationRequest, webContents: WebContents): string {
  const operationId = randomUUID();
  void executeOperation(operationId, request, webContents);
  return operationId;
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
        const destination = join(request.destinationDir, basename(sourcePath));
        if (request.kind === 'copy') {
          await cp(sourcePath, destination, { recursive: true, errorOnExist: false, force: true });
        } else {
          await fsRename(sourcePath, destination);
        }
      }
      send(index + 1, sourcePath, index + 1 === total);
    }
  } catch (cause) {
    send(0, '', true, cause instanceof Error ? cause.message : String(cause));
  }
}
