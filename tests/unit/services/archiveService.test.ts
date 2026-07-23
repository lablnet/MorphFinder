import { archiveService } from '@main/services/archiveService';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { BrowserWindow } from 'electron';

describe('ArchiveService', () => {
  const tmpDir = path.join(__dirname, 'tmp_archive_test');

  beforeEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
    await fs.mkdir(tmpDir, { recursive: true });
  });

  it('compresses files into a zip archive and extracts them', async () => {
    const file1 = path.join(tmpDir, 'test1.txt');
    const file2 = path.join(tmpDir, 'test2.txt');
    await fs.writeFile(file1, 'Hello World 1', 'utf-8');
    await fs.writeFile(file2, 'Hello World 2', 'utf-8');

    const mockWin = { webContents: { send: vi.fn() } } as unknown as BrowserWindow;
    const zipResult = await archiveService.compress(mockWin, [file1, file2]);
    expect(zipResult.archivePath).toBeTruthy();
    expect(zipResult.archivePath.endsWith('.zip')).toBe(true);

    const extractResult = await archiveService.extract(zipResult.archivePath);
    expect(extractResult.extractedDir).toBeTruthy();

    const extractedFiles = await fs.readdir(extractResult.extractedDir);
    expect(extractedFiles).toContain('test1.txt');
    expect(extractedFiles).toContain('test2.txt');

    await fs.rm(tmpDir, { recursive: true, force: true });
  });
});
