import type { IpcChannel } from '@shared/ipc/contract';
import { isVirtualPath } from '@shared/virtualLocations';

type Validator = (request: unknown) => void;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertRecord(value: unknown, channel: IpcChannel): Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`Invalid IPC payload for ${channel}: expected object.`);
  return value;
}

function assertVoid(value: unknown, channel: IpcChannel): void {
  if (value !== undefined && value !== null) {
    throw new Error(`Invalid IPC payload for ${channel}: expected no payload.`);
  }
}

function assertString(value: unknown, channel: IpcChannel, key: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Invalid IPC payload for ${channel}: ${key} must be a non-empty string.`);
  }
  return value;
}

function assertOptionalString(value: unknown, channel: IpcChannel, key: string): string | undefined {
  if (value === undefined) return undefined;
  return assertString(value, channel, key);
}

function assertBoolean(value: unknown, channel: IpcChannel, key: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`Invalid IPC payload for ${channel}: ${key} must be a boolean.`);
  }
  return value;
}

function assertPositiveNumber(value: unknown, channel: IpcChannel, key: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid IPC payload for ${channel}: ${key} must be a positive number.`);
  }
  return value;
}

function assertStringArray(value: unknown, channel: IpcChannel, key: string): string[] {
  if (!Array.isArray(value) || value.length === 0 || !value.every((item) => typeof item === 'string' && item.length > 0)) {
    throw new Error(`Invalid IPC payload for ${channel}: ${key} must be a non-empty string array.`);
  }
  return value;
}

function assertRealPath(value: unknown, channel: IpcChannel, key: string): string {
  const path = assertString(value, channel, key);
  if (isVirtualPath(path)) throw new Error(`Invalid IPC payload for ${channel}: ${key} must be a filesystem path.`);
  return path;
}

function objectWithPath(channel: IpcChannel, key = 'path'): Validator {
  return (request) => {
    const payload = assertRecord(request, channel);
    assertRealPath(payload[key], channel, key);
  };
}

function objectWithPaths(channel: IpcChannel, key = 'paths'): Validator {
  return (request) => {
    const payload = assertRecord(request, channel);
    const paths = assertStringArray(payload[key], channel, key);
    for (const path of paths) {
      if (isVirtualPath(path)) throw new Error(`Invalid IPC payload for ${channel}: ${key} cannot include virtual paths.`);
    }
  };
}

const validators: Partial<Record<IpcChannel, Validator>> = {
  'archive:compress': (request) => {
    const payload = assertRecord(request, 'archive:compress');
    objectWithPaths('archive:compress')(payload);
    assertOptionalString(payload.destinationZipPath, 'archive:compress', 'destinationZipPath');
  },
  'archive:extract': (request) => {
    const payload = assertRecord(request, 'archive:extract');
    assertRealPath(payload.archivePath, 'archive:extract', 'archivePath');
    assertOptionalString(payload.destinationDir, 'archive:extract', 'destinationDir');
  },
  'archive:list': (request) => {
    const payload = assertRecord(request, 'archive:list');
    assertRealPath(payload.archivePath, 'archive:list', 'archivePath');
  },
  'archive:cancel': (request) => {
    const payload = assertRecord(request, 'archive:cancel');
    assertString(payload.operationId, 'archive:cancel', 'operationId');
  },
  'snapshots:list': (request) => assertVoid(request, 'snapshots:list'),
  'snapshots:delete': (request) => {
    const payload = assertRecord(request, 'snapshots:delete');
    assertString(payload.id, 'snapshots:delete', 'id');
  },
  'snapshots:export': (request) => {
    const payload = assertRecord(request, 'snapshots:export');
    assertString(payload.snapshotId, 'snapshots:export', 'snapshotId');
  },
  'snapshots:import': (request) => assertVoid(request, 'snapshots:import'),
  'fs:readDirectory': (request) => {
    const payload = assertRecord(request, 'fs:readDirectory');
    assertRealPath(payload.path, 'fs:readDirectory', 'path');
    assertBoolean(payload.includeHidden, 'fs:readDirectory', 'includeHidden');
  },
  'fs:rename': (request) => {
    const payload = assertRecord(request, 'fs:rename');
    assertRealPath(payload.path, 'fs:rename', 'path');
    assertString(payload.newName, 'fs:rename', 'newName');
  },
  'fs:createFolder': (request) => {
    const payload = assertRecord(request, 'fs:createFolder');
    assertRealPath(payload.parentPath, 'fs:createFolder', 'parentPath');
    assertString(payload.name, 'fs:createFolder', 'name');
  },
  'fs:operate': (request) => {
    const payload = assertRecord(request, 'fs:operate');
    if (payload.kind !== 'copy' && payload.kind !== 'move' && payload.kind !== 'trash') {
      throw new Error('Invalid IPC payload for fs:operate: kind is not supported.');
    }
    objectWithPaths('fs:operate', 'sourcePaths')(payload);
    if (payload.kind !== 'trash') assertRealPath(payload.destinationDir, 'fs:operate', 'destinationDir');
  },
  'fs:cancel': (request) => {
    const payload = assertRecord(request, 'fs:cancel');
    assertString(payload.operationId, 'fs:cancel', 'operationId');
  },
  'fs:wellKnownDirs': (request) => assertVoid(request, 'fs:wellKnownDirs'),
  'fs:watch': objectWithPath('fs:watch'),
  'fs:unwatch': objectWithPath('fs:unwatch'),
  'fs:readFile': (request) => {
    const payload = assertRecord(request, 'fs:readFile');
    assertRealPath(payload.path, 'fs:readFile', 'path');
    if (payload.maxBytes !== undefined) assertPositiveNumber(payload.maxBytes, 'fs:readFile', 'maxBytes');
  },
  'shell:trash': objectWithPaths('shell:trash'),
  'shell:deletePermanently': objectWithPaths('shell:deletePermanently'),
  'shell:emptyTrash': (request) => assertVoid(request, 'shell:emptyTrash'),
  'shell:restoreFromTrash': objectWithPaths('shell:restoreFromTrash'),
  'shell:open': objectWithPath('shell:open'),
  'shell:newWindow': (request) => {
    const payload = assertRecord(request, 'shell:newWindow');
    if (payload.path !== undefined) assertRealPath(payload.path, 'shell:newWindow', 'path');
  },
  'shell:showInFolder': objectWithPath('shell:showInFolder'),
  'shell:startDrag': objectWithPaths('shell:startDrag'),
  'shell:openWith': objectWithPath('shell:openWith'),
  'shell:selectFolder': (request) => {
    const payload = assertRecord(request, 'shell:selectFolder');
    if (payload.defaultPath !== undefined && !isVirtualPath(String(payload.defaultPath))) {
      assertString(payload.defaultPath, 'shell:selectFolder', 'defaultPath');
    }
  },
  'native:capabilities': (request) => assertVoid(request, 'native:capabilities'),
  'native:getLocations': (request) => assertVoid(request, 'native:getLocations'),
  'native:metadata': objectWithPath('native:metadata'),
  'native:setTags': (request) => {
    const payload = assertRecord(request, 'native:setTags');
    assertRealPath(payload.path, 'native:setTags', 'path');
    if (!Array.isArray(payload.tags)) throw new Error('Invalid IPC payload for native:setTags: tags must be an array.');
  },
  'native:thumbnail': (request) => {
    const payload = assertRecord(request, 'native:thumbnail');
    assertRealPath(payload.path, 'native:thumbnail', 'path');
    assertPositiveNumber(payload.width, 'native:thumbnail', 'width');
    assertPositiveNumber(payload.height, 'native:thumbnail', 'height');
    assertPositiveNumber(payload.scale, 'native:thumbnail', 'scale');
  },
  'native:openWithApps': objectWithPath('native:openWithApps'),
  'search:files': (request) => {
    const payload = assertRecord(request, 'search:files');
    assertRealPath(payload.rootPath, 'search:files', 'rootPath');
    assertString(payload.query, 'search:files', 'query');
  },
  'duplicates:cancel': (request) => assertVoid(request, 'duplicates:cancel'),
  'analyzer:scan': objectWithPath('analyzer:scan'),
  'analyzer:cancel': (request) => assertVoid(request, 'analyzer:cancel'),
  'git:status': objectWithPath('git:status'),
  'git:history': objectWithPath('git:history'),
  'devpanel:scan': objectWithPath('devpanel:scan'),
  'devpanel:runScript': (request) => {
    const payload = assertRecord(request, 'devpanel:runScript');
    assertRealPath(payload.cwd, 'devpanel:runScript', 'cwd');
    assertString(payload.command, 'devpanel:runScript', 'command');
  },
  'annotations:get': objectWithPath('annotations:get'),
  'annotations:list': (request) => assertVoid(request, 'annotations:list'),
  'terminal:create': objectWithPath('terminal:create', 'cwd'),
  'terminal:write': (request) => {
    const payload = assertRecord(request, 'terminal:write');
    assertString(payload.id, 'terminal:write', 'id');
    if (typeof payload.data !== 'string') throw new Error('Invalid IPC payload for terminal:write: data must be a string.');
  },
  'terminal:resize': (request) => {
    const payload = assertRecord(request, 'terminal:resize');
    assertString(payload.id, 'terminal:resize', 'id');
    assertPositiveNumber(payload.cols, 'terminal:resize', 'cols');
    assertPositiveNumber(payload.rows, 'terminal:resize', 'rows');
  },
  'terminal:kill': (request) => {
    const payload = assertRecord(request, 'terminal:kill');
    assertString(payload.id, 'terminal:kill', 'id');
  },
  'webshare:stop': (request) => {
    const payload = assertRecord(request, 'webshare:stop');
    assertOptionalString(payload.sessionId, 'webshare:stop', 'sessionId');
  },
  'webshare:getActive': (request) => assertVoid(request, 'webshare:getActive'),
  'webshare:generateQr': (request) => {
    const payload = assertRecord(request, 'webshare:generateQr');
    assertString(payload.text, 'webshare:generateQr', 'text');
  },
  'airshare:toggleInbound': (request) => {
    const payload = assertRecord(request, 'airshare:toggleInbound');
    assertBoolean(payload.allowInbound, 'airshare:toggleInbound', 'allowInbound');
  },
  'airshare:getReceived': (request) => assertVoid(request, 'airshare:getReceived'),
  'airshare:openReceivedFolder': (request) => assertVoid(request, 'airshare:openReceivedFolder'),
};

function validateOptionalPathList(request: unknown, channel: IpcChannel): void {
  const payload = assertRecord(request, channel);
  const path = assertOptionalString(payload.path, channel, 'path');
  if (path !== undefined && isVirtualPath(path)) throw new Error(`Invalid IPC payload for ${channel}: path must be a filesystem path.`);
  if (payload.paths !== undefined) objectWithPaths(channel)(payload);
}

validators['webshare:start'] = (request) => validateOptionalPathList(request, 'webshare:start');
validators['airshare:setFolder'] = (request) => validateOptionalPathList(request, 'airshare:setFolder');

export function validateIpcRequest(channel: IpcChannel, request: unknown): void {
  validators[channel]?.(request);
}
