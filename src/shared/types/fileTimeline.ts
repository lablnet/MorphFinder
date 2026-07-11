import type { GitFileStatus } from './git';

export type FileTimelineEventKind = 'created' | 'modified';

export interface FileTimelineItem {
  path: string;
  name: string;
  extension: string;
  sizeInBytes: number;
  createdAt: number;
  modifiedAt: number;
  eventAt: number;
  eventKind: FileTimelineEventKind;
  gitStatus?: GitFileStatus;
}

export interface FileTimelineScanRequest {
  rootPath: string;
  includeHidden: boolean;
  days: number;
  maxItems: number;
}

export interface FileTimelineScanResult {
  rootPath: string;
  items: FileTimelineItem[];
  scannedCount: number;
  isGitRepo: boolean;
  repoRoot: string;
}
