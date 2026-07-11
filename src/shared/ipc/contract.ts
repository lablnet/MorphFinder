import type { DirectoryListing, FileOperationRequest, FileSystemNode } from '../types/fileSystem';
import type { FileContentResponse } from '../types/fileViewer';
import type { FinderTag, NativeCapabilities, NativeMetadata, NativeThumbnail, OpenWithApp } from '../types/native';
import type { CacheCleanRequest, CacheCleanResult, CacheScanResult } from '../types/cache';
import type { SpaceAnalyzerResult } from '../types/spaceAnalyzer';
import type { GitStatus, GitCommit } from '../types/git';


/**
 * Every request/response channel in one map. Preload, main handlers, and the renderer
 * client all derive from this — a payload mismatch on either side is a compile error,
 * never a runtime surprise.
 */
export interface IpcContract {
  'fs:readDirectory': {
    request: { path: string; includeHidden: boolean };
    response: DirectoryListing;
  };
  'fs:rename': {
    request: { path: string; newName: string };
    response: FileSystemNode;
  };
  'fs:createFolder': {
    request: { parentPath: string; name: string };
    response: FileSystemNode;
  };
  'fs:operate': {
    request: FileOperationRequest;
    response: { operationId: string };
  };
  'fs:wellKnownDirs': {
    request: void;
    response: { home: string; desktop: string; documents: string; downloads: string };
  };
  'fs:watch': { request: { path: string }; response: void };
  'fs:unwatch': { request: { path: string }; response: void };
  'shell:trash': { request: { paths: string[] }; response: void };
  'shell:open': { request: { path: string }; response: void };
  'shell:showInFolder': { request: { path: string }; response: void };
  'shell:startDrag': { request: { paths: string[] }; response: void };
  'native:capabilities': { request: void; response: NativeCapabilities };
  'native:metadata': { request: { path: string }; response: NativeMetadata };
  'native:setTags': { request: { path: string; tags: FinderTag[] }; response: void };
  'native:thumbnail': {
    request: { path: string; width: number; height: number; scale: number };
    response: NativeThumbnail | null;
  };
  'native:openWithApps': { request: { path: string }; response: OpenWithApp[] };
  'fs:readFile': {
    request: { path: string; maxBytes?: number };
    response: FileContentResponse;
  };
  'shell:openWith': { request: { path: string; appBundleId?: string }; response: void };
  'cache:scan': {
    request: void;
    response: CacheScanResult;
  };
  'cache:clean': {
    request: CacheCleanRequest;
    response: CacheCleanResult;
  };
  'analyzer:scan': {
    request: { path: string };
    response: SpaceAnalyzerResult;
  };
  'shell:selectFolder': {
    request: { defaultPath?: string };
    response: string | null;
  };
  'analyzer:cancel': {
    request: void;
    response: void;
  };
  'git:status': {
    request: { path: string };
    response: GitStatus;
  };
  'git:history': {
    request: { path: string };
    response: GitCommit[];
  };
}

export type IpcChannel = keyof IpcContract;
export type IpcRequest<C extends IpcChannel> = IpcContract[C]['request'];
export type IpcResponse<C extends IpcChannel> = IpcContract[C]['response'];

/** Main → renderer pushes (watcher updates, background operation progress). */
export interface IpcEvents {
  'fs:changed': { path: string };
  'fs:operationProgress': {
    operationId: string;
    completed: number;
    total: number;
    currentPath: string;
    done: boolean;
    error?: string;
  };
  'command-palette:toggle': void;
  'analyzer:progress': {
    scannedPath: string;
    fileCount: number;
    size: number;
  };
}

export type IpcEventChannel = keyof IpcEvents;
