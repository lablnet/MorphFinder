import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
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

    const rawUrl = `${session.shareUrl}raw/${encodeURIComponent(session.fileName)}`;
    const resText = await new Promise<string>((resolve, reject) => {
      http.get(rawUrl, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
        res.on('error', reject);
      });
    });

    expect(resText).toBe('Hello File 1!');

    await webShareService.stopShare(session.id);
    expect(webShareService.getActiveShare()).toBeNull();
  });

  it('starts sharing multiple selected files in one LAN share session', async () => {
    const session = await webShareService.startShare([tempFilePath1, tempFilePath2]);
    expect(session.id).toBeDefined();
    expect(session.fileName).toBe('2 items shared');
    expect(session.targetPaths).toHaveLength(2);

    const rawUrl1 = `${session.shareUrl}raw/${encodeURIComponent(path.basename(tempFilePath1))}`;
    const resText1 = await new Promise<string>((resolve, reject) => {
      http.get(rawUrl1, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
        res.on('error', reject);
      });
    });

    expect(resText1).toBe('Hello File 1!');
  });
});
