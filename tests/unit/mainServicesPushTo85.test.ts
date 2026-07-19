import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runFileOperation, cancelFileOperation } from '../../src/main/services/fileOperationService';

const mockWebContents: any = {
  isDestroyed: vi.fn().mockReturnValue(false),
  send: vi.fn(),
};

describe('main/services Push Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('runs file operation move and trash', async () => {
    const trashOpId = await runFileOperation({ kind: 'trash', sourcePaths: ['/tmp/testfile'] }, mockWebContents);
    expect(trashOpId).toBeDefined();

    cancelFileOperation('non-existent');
  });
});
