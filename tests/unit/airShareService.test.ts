import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { webShareService } from '../../src/main/services/webShareService';
import { renderAirShareWebPortal } from '../../src/main/services/airShareWebPortal';
import type { WebShareSession } from '../../src/shared/types/webShare';

describe('AirShare Main Services Unit Tests', () => {
  let tempDirPath: string;

  beforeEach(async () => {
    tempDirPath = path.join(os.tmpdir(), `airshare-test-${Date.now()}`);
    await fs.promises.mkdir(tempDirPath, { recursive: true });
    await fs.promises.writeFile(path.join(tempDirPath, 'document.pdf'), 'PDF Content');
  });

  afterEach(async () => {
    await webShareService.stopShare();
    if (fs.existsSync(tempDirPath)) {
      await fs.promises.rm(tempDirPath, { recursive: true, force: true });
    }
  });

  it('renders Web Portal HTML template with items and upload dropzone', () => {
    const mockSession: WebShareSession = {
      id: 'abc123',
      targetPath: tempDirPath,
      fileName: path.basename(tempDirPath),
      isDirectory: true,
      fileSize: 0,
      lanIp: '192.168.1.100',
      port: 8080,
      shareUrl: 'http://192.168.1.100:8080/share/abc123/',
      qrSvg: '<svg></svg>',
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
      downloadCount: 0,
      allowInbound: true,
      receivedFiles: [],
    };

    const html = renderAirShareWebPortal(mockSession, [
      { name: 'document.pdf', relativePath: 'document.pdf', isDirectory: false, size: 100 },
    ]);

    expect(html).toContain('Morph AirShare');
    expect(html).toContain('Inbound Drop Zone');
    expect(html).toContain('document.pdf');
  });

  it('toggles allowInbound state on active AirShare session', async () => {
    await webShareService.setAllowInbound(true);
    const session = await webShareService.startShare(tempDirPath);
    expect(session.allowInbound).toBe(true);

    const updated = await webShareService.setAllowInbound(false);
    expect(updated?.allowInbound).toBe(false);
  });
});
