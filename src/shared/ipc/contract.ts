import type { DirectoryListing, FileOperationRequest, FileSystemNode } from '../types/fileSystem';
import type { FileContentResponse } from '../types/fileViewer';
import type { FinderTag, NativeCapabilities, NativeMetadata, NativeThumbnail, OpenWithApp, SystemLocation } from '../types/native';
import type { CacheCleanRequest, CacheCleanResult, CacheScanResult } from '../types/cache';
import type { SpaceAnalyzerResult } from '../types/spaceAnalyzer';
import type { DevPanelInfo } from '../types/devPanel';
import type { GitStatus, GitCommit } from '../types/git';
import type { DirectoryAnnotation, DirectoryAnnotationUpdate } from '../types/directoryAnnotations';
import type { FileSearchRequest, FileSearchResult } from '../types/fileSearch';
import type { SmartCollectionRequest, SmartCollectionResult } from '../types/smartCollections';
import type { DuplicateGroup, DuplicateScanRequest, DuplicateScanResult } from '../types/duplicates';
import type { FileTimelineScanRequest, FileTimelineScanResult } from '../types/fileTimeline';
import type { WorkspaceSnapshot } from '../types/workspaceSnapshots';


/**
 * Every request/response channel in one map. Preload, main handlers, and the renderer
 * client all derive from this — a payload mismatch on either side is a compile error,
 * never a runtime surprise.
 */
export interface IpcContract {
  'archive:compress': {
    request: { paths: string[]; destinationZipPath?: string | undefined };
    response: { archivePath: string };
  };
  'archive:extract': {
    request: { archivePath: string; destinationDir?: string | undefined };
    response: { extractedDir: string };
  };
  'archive:cancel': {
    request: { operationId: string };
    response: void;
  };
  'snapshots:list': {
    request: undefined | void;
    response: WorkspaceSnapshot[];
  };
  'snapshots:save': {
    request: Omit<WorkspaceSnapshot, 'id' | 'createdAt' | 'updatedAt'> & { id?: string | undefined };
    response: WorkspaceSnapshot;
  };
  'snapshots:delete': {
    request: { id: string };
    response: void;
  };
  'snapshots:export': {
    request: { snapshotId: string };
    response: boolean;
  };
  'snapshots:import': {
    request: undefined | void;
    response: WorkspaceSnapshot | null;
  };
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
  'fs:cancel': {
    request: { operationId: string };
    response: void;
  };
  'fs:wellKnownDirs': {
    request: void;
    response: { home: string; desktop: string; documents: string; downloads: string };
  };
  'fs:watch': { request: { path: string }; response: void };
  'fs:unwatch': { request: { path: string }; response: void };
  'shell:trash': { request: { paths: string[] }; response: void };
  'shell:deletePermanently': { request: { paths: string[] }; response: void };
  'shell:emptyTrash': { request: void; response: void };
  'shell:restoreFromTrash': { request: { paths: string[] }; response: void };
  'shell:open': { request: { path: string }; response: void };
  'shell:newWindow': { request: { path?: string }; response: void };
  'shell:showInFolder': { request: { path: string }; response: void };
  'shell:startDrag': { request: { paths: string[] }; response: void };
  'native:capabilities': { request: void; response: NativeCapabilities };
  'native:getLocations': { request: void; response: SystemLocation[] };
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
  'search:files': {
    request: FileSearchRequest;
    response: FileSearchResult;
  };
  'smartCollections:scan': {
    request: SmartCollectionRequest;
    response: SmartCollectionResult;
  };
  'duplicates:scan': {
    request: DuplicateScanRequest;
    response: DuplicateScanResult;
  };
  'duplicates:cancel': {
    request: void;
    response: void;
  };
  'timeline:scan': {
    request: FileTimelineScanRequest;
    response: FileTimelineScanResult;
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
  'devpanel:scan': {
    request: { path: string };
    response: DevPanelInfo;
  };
  'devpanel:runScript': {
    request: { cwd: string; command: string };
    response: void;
  };
  'annotations:get': {
    request: { path: string };
    response: DirectoryAnnotation;
  };
  'annotations:set': {
    request: DirectoryAnnotationUpdate;
    response: DirectoryAnnotation;
  };
  'annotations:list': {
    request: void;
    response: DirectoryAnnotation[];
  };
  'terminal:create': {
    request: { cwd: string };
    response: { id: string };
  };
  'terminal:write': {
    request: { id: string; data: string };
    response: void;
  };
  'terminal:resize': {
    request: { id: string; cols: number; rows: number };
    response: void;
  };
  'terminal:kill': {
    request: { id: string };
    response: void;
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
    bytesProcessed?: number | undefined;
    totalBytes?: number | undefined;
    percent?: number | undefined;
    currentPath: string;
    done: boolean;
    error?: string | undefined;
  };
  'command-palette:toggle': void;
  'analyzer:progress': {
    scannedPath: string;
    fileCount: number;
    size: number;
  };
  'duplicates:progress': {
    phase: 'scanning' | 'hashing';
    scannedCount: number;
    hashedCount: number;
    groupsFound: number;
    currentPath: string;
    groups: DuplicateGroup[];
  };
  'archive:progress': {
    operationId: string;
    type: 'compress' | 'extract';
    currentPath: string;
    bytesProcessed: number;
    totalBytes: number;
    percent: number;
    done: boolean;
    error?: string;
  };
  'terminal:data': {
    id: string;
    data: string;
  };
  'terminal:exit': {
    id: string;
    exitCode: number;
  };
}

export type IpcEventChannel = keyof IpcEvents;
