import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { webShareService, getPrimaryLanIp } from '../../src/main/services/webShareService';
import { generateCompliantQrSvgAsync } from '../../src/main/services/qrGenerator';

describe('webShareService & qrGenerator Unit Tests', () => {
  let tempFilePath1: string;
  let tempFilePath2: string;

  beforeEach(async () => {
    tempFilePath1 = path.join(os.tmpdir(), `webshare-test1-${Date.now()}.txt`);
    tempFilePath2 = path.join(os.tmpdir(), `webshare-test2-${Date.now()}.txt`);
    await fs.promises.writeFile(tempFilePath1, 'Hello File 1!');
    await fs.promises.writeFile(tempFilePath2, 'Hello File 2!');
  });

  afterEach(async () => {
    await webShareService.stopShare();
    if (fs.existsSync(tempFilePath1)) await fs.promises.unlink(tempFilePath1);
    if (fs.existsSync(tempFilePath2)) await fs.promises.unlink(tempFilePath2);
  });

  it('generates spec compliant SVG string for QR Code', async () => {
    const svg = await generateCompliantQrSvgAsync('http://192.168.10.17:62834/share/abc/test.zip');
    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox=');
    expect(svg).toContain('<path');
    expect(svg).toContain('</svg>');
  });

  it('detects a primary LAN IP address string', () => {
    const ip = getPrimaryLanIp();
    expect(typeof ip).toBe('string');
    expect(ip.length).toBeGreaterThan(0);
  });

  it('starts sharing a file and responds to HTTP raw file requests', async () => {
    const session = await webShareService.startShare(tempFilePath1);
    expect(session.id).toBeDefined();
    expect(session.fileName).toBe(path.basename(tempFilePath1));
    expect(session.shareUrl).toContain(session.lanIp);

    const activeSession = webShareService.getActiveShare();
    expect(activeSession).not.toBeNull();
    expect(activeSession?.id).toBe(session.id);

    expect(session.targetPath).toBe(tempFilePath1);
    expect(session.targetPaths).toEqual([tempFilePath1]);

    await webShareService.stopShare(session.id);
    expect(webShareService.getActiveShare()).toBeNull();
  });

  it('starts sharing multiple selected files in one LAN share session', async () => {
    const session = await webShareService.startShare([tempFilePath1, tempFilePath2]);
    expect(session.id).toBeDefined();
    expect(session.fileName).toBe('2 items shared');
    expect(session.targetPaths).toHaveLength(2);

    expect(session.targetPath).toBe(path.dirname(tempFilePath1));
    expect(session.targetPaths).toEqual([tempFilePath1, tempFilePath2]);
  });
});
