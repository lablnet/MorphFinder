import type { UIShell, UIThemeMode } from './layout';
import type { TabMetadata } from './tabs';

export interface WorkspaceSnapshot {
  id: string;
  name: string;
  description?: string | undefined;
  createdAt: string;
  updatedAt: string;
  tabs: TabMetadata[];
  activeTabPath: string | null;
  shell: UIShell;
  themeMode: UIThemeMode;
}

export interface SnapshotExportPayload {
  version: '1.0';
  exportedAt: string;
  snapshot: WorkspaceSnapshot;
}
