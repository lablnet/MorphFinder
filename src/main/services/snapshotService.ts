import { app, dialog } from 'electron';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { SnapshotExportPayload, WorkspaceSnapshot } from '../../shared/types/workspaceSnapshots';

class SnapshotService {
  private get StoragePath(): string {
    const dir = path.join(app.getPath('userData'), 'snapshots');
    return path.join(dir, 'workspace-snapshots.json');
  }

  private async ensureDirectory(): Promise<void> {
    const dir = path.dirname(this.StoragePath);
    await fs.mkdir(dir, { recursive: true });
  }

  async listSnapshots(): Promise<WorkspaceSnapshot[]> {
    try {
      await this.ensureDirectory();
      const content = await fs.readFile(this.StoragePath, 'utf-8');
      return JSON.parse(content) as WorkspaceSnapshot[];
    } catch {
      return [];
    }
  }

  async saveSnapshot(
    payload: Omit<WorkspaceSnapshot, 'id' | 'createdAt' | 'updatedAt'> & { id?: string | undefined },
  ): Promise<WorkspaceSnapshot> {
    const snapshots = await this.listSnapshots();
    const now = new Date().toISOString();
    
    let snapshot: WorkspaceSnapshot;
    const existingIndex = payload.id ? snapshots.findIndex((s) => s.id === payload.id) : -1;

    if (existingIndex >= 0 && snapshots[existingIndex]) {
      snapshot = {
        ...snapshots[existingIndex],
        ...payload,
        id: snapshots[existingIndex].id,
        createdAt: snapshots[existingIndex].createdAt,
        updatedAt: now,
      };
      if (payload.description !== undefined) {
        snapshot.description = payload.description;
      }
      snapshots[existingIndex] = snapshot;
    } else {
      snapshot = {
        id: crypto.randomUUID(),
        name: payload.name,
        createdAt: now,
        updatedAt: now,
        tabs: payload.tabs,
        activeTabPath: payload.activeTabPath,
        shell: payload.shell,
        themeMode: payload.themeMode,
      };
      if (payload.description !== undefined) {
        snapshot.description = payload.description;
      }
      snapshots.unshift(snapshot);
    }

    await this.ensureDirectory();
    await fs.writeFile(this.StoragePath, JSON.stringify(snapshots, null, 2), 'utf-8');
    return snapshot;
  }

  async deleteSnapshot(id: string): Promise<void> {
    const snapshots = await this.listSnapshots();
    const filtered = snapshots.filter((s) => s.id !== id);
    await this.ensureDirectory();
    await fs.writeFile(this.StoragePath, JSON.stringify(filtered, null, 2), 'utf-8');
  }

  async exportSnapshot(snapshotId: string): Promise<boolean> {
    const snapshots = await this.listSnapshots();
    const target = snapshots.find((s) => s.id === snapshotId);
    if (!target) return false;

    const result = await dialog.showSaveDialog({
      title: 'Export Workspace Snapshot',
      defaultPath: `${target.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.morphws`,
      filters: [{ name: 'MorphFinder Workspace Snapshot', extensions: ['morphws', 'json'] }],
    });

    if (result.canceled || !result.filePath) return false;

    const exportPayload: SnapshotExportPayload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      snapshot: target,
    };

    await fs.writeFile(result.filePath, JSON.stringify(exportPayload, null, 2), 'utf-8');
    return true;
  }

  async importSnapshot(): Promise<WorkspaceSnapshot | null> {
    const result = await dialog.showOpenDialog({
      title: 'Import Workspace Snapshot',
      filters: [{ name: 'MorphFinder Workspace Snapshot', extensions: ['morphws', 'json'] }],
      properties: ['openFile'],
    });

    if (result.canceled || !result.filePaths[0]) return null;

    try {
      const raw = await fs.readFile(result.filePaths[0], 'utf-8');
      const parsed = JSON.parse(raw) as Partial<SnapshotExportPayload> & Partial<WorkspaceSnapshot>;
      const snapshot: WorkspaceSnapshot = 'snapshot' in parsed && parsed.snapshot ? parsed.snapshot : (parsed as WorkspaceSnapshot);

      if (!snapshot.name || !Array.isArray(snapshot.tabs)) {
        throw new Error('Invalid workspace snapshot file structure');
      }

      const importPayload: Omit<WorkspaceSnapshot, 'id' | 'createdAt' | 'updatedAt'> = {
        name: `${snapshot.name} (Imported)`,
        tabs: snapshot.tabs,
        activeTabPath: snapshot.activeTabPath,
        shell: snapshot.shell || 'finder',
        themeMode: snapshot.themeMode || 'system',
      };
      if (snapshot.description) {
        importPayload.description = snapshot.description;
      }

      return await this.saveSnapshot(importPayload);
    } catch {
      return null;
    }
  }
}

export const snapshotService = new SnapshotService();
