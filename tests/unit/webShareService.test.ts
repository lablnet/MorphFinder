import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { webShareService, getPrimaryLanIp } from '../../src/main/services/webShareService';
import { generateCompliantQrSvgAsync } from '../../src/main/services/qrGenerator';

describe('webShareService & qrGenerator Unit Tests', () => {
  let tempFilePath: string;

  beforeEach(async () => {
    tempFilePath = path.join(os.tmpdir(), `webshare-test-${Date.now()}.txt`);
    await fs.promises.writeFile(tempFilePath, 'Hello MorphFinder Local WebShare Unit Test!');
  });

  afterEach(async () => {
    await webShareService.stopShare();
    if (fs.existsSync(tempFilePath)) {
      await fs.promises.unlink(tempFilePath);
    }
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

  it('starts sharing a file and responds to HTTP requests', async () => {
    const session = await webShareService.startShare(tempFilePath);
    expect(session.id).toBeDefined();
    expect(session.fileName).toBe(path.basename(tempFilePath));
    expect(session.shareUrl).toContain(session.lanIp);

    const activeSession = webShareService.getActiveShare();
    expect(activeSession).not.toBeNull();
    expect(activeSession?.id).toBe(session.id);

    // Make an HTTP GET request to the shareUrl
    const resText = await new Promise<string>((resolve, reject) => {
      http.get(session.shareUrl, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
        res.on('error', reject);
      });
    });

    expect(resText).toBe('Hello MorphFinder Local WebShare Unit Test!');

    // Stop share session
    await webShareService.stopShare(session.id);
    expect(webShareService.getActiveShare()).toBeNull();
  });
});
