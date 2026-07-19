import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const electronMock = vi.hoisted(() => ({
  userDataPath: '',
  saveResult: { canceled: false, filePath: '' as string | undefined },
  openResult: { canceled: false, filePaths: [] as string[] },
}));

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => electronMock.userDataPath),
  },
  dialog: {
    showSaveDialog: vi.fn(async () => electronMock.saveResult),
    showOpenDialog: vi.fn(async () => electronMock.openResult),
  },
}));

describe('snapshotService', () => {
  beforeEach(async () => {
    electronMock.userDataPath = await mkdtemp(join(tmpdir(), 'morphfinder-snapshots-'));
    electronMock.saveResult = { canceled: false, filePath: join(electronMock.userDataPath, 'export.morphws') };
    electronMock.openResult = { canceled: false, filePaths: [] };
    vi.resetModules();
  });

  afterEach(async () => {
    await rm(electronMock.userDataPath, { recursive: true, force: true });
  });

  async function loadService() {
    return (await import('../../../src/main/services/snapshotService')).snapshotService;
  }

  it('creates, updates, lists, and deletes snapshots', async () => {
    const service = await loadService();

    const created = await service.saveSnapshot({
      name: 'Work',
      description: 'Initial',
      tabs: [{ id: 'tab-1', path: '/work', title: 'Work' }],
      activeTabPath: '/work',
      shell: 'finder',
      themeMode: 'dark',
    });

    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBe(created.updatedAt);

    const updated = await service.saveSnapshot({
      ...created,
      name: 'Work Updated',
      description: '',
    });

    expect(updated.id).toBe(created.id);
    expect(updated.createdAt).toBe(created.createdAt);
    expect(updated.updatedAt).not.toBe('');
    expect(updated.name).toBe('Work Updated');
    expect(updated.description).toBe('');

    expect(await service.listSnapshots()).toHaveLength(1);

    await service.deleteSnapshot(created.id);
    expect(await service.listSnapshots()).toEqual([]);
  });

  it('exports selected snapshots and imports both wrapped and raw payloads', async () => {
    const service = await loadService();
    const snapshot = await service.saveSnapshot({
      name: 'Client Space',
      tabs: [],
      activeTabPath: null,
      shell: 'explorer',
      themeMode: 'system',
    });

    expect(await service.exportSnapshot(snapshot.id)).toBe(true);
    const exported = JSON.parse(await readFile(electronMock.saveResult.filePath!, 'utf-8'));
    expect(exported.snapshot.id).toBe(snapshot.id);
    expect(exported.version).toBe('1.0');

    electronMock.openResult = { canceled: false, filePaths: [electronMock.saveResult.filePath!] };
    const importedWrapped = await service.importSnapshot();
    expect(importedWrapped?.name).toBe('Client Space (Imported)');
    expect(importedWrapped?.id).not.toBe(snapshot.id);

    const rawPath = join(electronMock.userDataPath, 'raw.morphws');
    await writeFile(rawPath, JSON.stringify(snapshot), 'utf-8');
    electronMock.openResult = { canceled: false, filePaths: [rawPath] };
    const importedRaw = await service.importSnapshot();
    expect(importedRaw?.shell).toBe('explorer');
  });

  it('returns safe fallbacks for missing, canceled, or invalid snapshot operations', async () => {
    const service = await loadService();

    expect(await service.exportSnapshot('missing')).toBe(false);

    const snapshot = await service.saveSnapshot({
      name: 'Draft',
      tabs: [],
      activeTabPath: null,
      shell: 'finder',
      themeMode: 'light',
    });

    electronMock.saveResult = { canceled: true, filePath: undefined };
    expect(await service.exportSnapshot(snapshot.id)).toBe(false);

    electronMock.openResult = { canceled: true, filePaths: [] };
    expect(await service.importSnapshot()).toBeNull();

    const invalidPath = join(electronMock.userDataPath, 'invalid.morphws');
    await writeFile(invalidPath, JSON.stringify({ tabs: 'nope' }), 'utf-8');
    electronMock.openResult = { canceled: false, filePaths: [invalidPath] };
    expect(await service.importSnapshot()).toBeNull();
  });
});
