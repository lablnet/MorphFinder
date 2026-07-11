export type GitFileStatus = 'added' | 'modified' | 'untracked' | 'ignored' | 'staged';

export interface GitStatus {
  isInstalled: boolean;
  isRepo: boolean;
  branch: string;
  repoRoot: string;
  statusMap: Record<string, GitFileStatus>; // absolute path -> git file status
}

export interface GitCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
}
