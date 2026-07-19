import { describe, it, expect, vi, beforeEach } from 'vitest';
import { archiveService } from '../../src/main/services/archiveService';

const mockWin: any = {
  webContents: { send: vi.fn() },
};

describe('archiveService Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles cancel and invalid path compression', async () => {
    archiveService.cancel('non-existent-op');

    await expect(archiveService.compress(mockWin, [])).rejects.toThrow('No paths provided');
  });

  it('handles non-existent archive extraction', async () => {
    await expect(archiveService.extract('/non/existent/file.zip')).rejects.toThrow('Archive file not found');
  });
});
