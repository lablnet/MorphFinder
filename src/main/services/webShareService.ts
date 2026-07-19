import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import type { BrowserWindow } from 'electron';
import type { WebShareSession } from '../../shared/types/webShare';
import { generateCompliantQrSvgAsync } from './qrGenerator';

export function getPrimaryLanIp(): string {
  const interfaces = os.networkInterfaces();
  const candidates: { address: string; name: string; priority: number }[] = [];

  for (const name of Object.keys(interfaces)) {
    const list = interfaces[name];
    if (!list) continue;

    // Ignore virtual / tunnel / loopback / docker interfaces
    const lowerName = name.toLowerCase();
    if (
      lowerName.includes('docker') ||
      lowerName.includes('vbox') ||
      lowerName.includes('vmnet') ||
      lowerName.includes('utun') ||
      lowerName.includes('wireguard') ||
      lowerName.includes('tap') ||
      lowerName.includes('tun')
    ) {
      continue;
    }

    for (const net of list) {
      if (net.family === 'IPv4' && !net.internal) {
        let priority = 0;
        // Prioritize standard local Wi-Fi / Ethernet interface names
        if (/^(en|wlan|eth|wi-fi|ethernet)/i.test(name)) priority += 10;
        if (net.address.startsWith('192.168.')) priority += 5;
        else if (net.address.startsWith('10.')) priority += 4;
        else if (net.address.startsWith('172.')) priority += 3;

        candidates.push({ address: net.address, name, priority });
      }
    }
  }

  candidates.sort((a, b) => b.priority - a.priority);
  return candidates[0]?.address ?? '127.0.0.1';
}

class WebShareService {
  private activeServer: http.Server | null = null;
  private activeSession: WebShareSession | null = null;
  private expireTimer: NodeJS.Timeout | null = null;

  public async startShare(
    targetPath: string,
    win?: BrowserWindow,
  ): Promise<WebShareSession> {
    await this.stopShare(undefined, win);

    const stats = await fs.promises.stat(targetPath);
    const fileName = path.basename(targetPath);
    const isDirectory = stats.isDirectory();
    const fileSize = isDirectory ? 0 : stats.size;
    const token = crypto.randomBytes(8).toString('hex');
    const lanIp = getPrimaryLanIp();

    return new Promise<WebShareSession>((resolve, reject) => {
      const server = http.createServer((req, res) => {
        if (!req.url || !this.activeSession) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }

        const rawUrl = req.url.split('?')[0] ?? '/';
        const reqPath = decodeURIComponent(rawUrl);
        if (!reqPath.startsWith(`/share/${token}`)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }

        if (isDirectory) {
          res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}.txt"`,
          });
          res.end(`Directory sharing for "${fileName}". Subfile sharing active.`);
          return;
        }

        // Single file download with range support
        const totalSize = stats.size;
        const range = req.headers.range;

        if (this.activeSession) {
          this.activeSession.downloadCount += 1;
          this.notifyUpdate(win);
        }

        if (range) {
          const parts = range.replace(/bytes=/, '').split('-');
          const startStr = parts[0] ?? '0';
          const endStr = parts[1];
          const start = parseInt(startStr, 10);
          const end = endStr ? parseInt(endStr, 10) : totalSize - 1;
          const chunkSize = end - start + 1;

          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${totalSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
          });

          const fileStream = fs.createReadStream(targetPath, { start, end });
          fileStream.pipe(res);
        } else {
          res.writeHead(200, {
            'Content-Length': totalSize,
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
          });

          const fileStream = fs.createReadStream(targetPath);
          fileStream.pipe(res);
        }
      });

      server.listen(0, '0.0.0.0', async () => {
        const address = server.address();
        const port = typeof address === 'object' && address ? address.port : 0;
        const shareUrl = `http://${lanIp}:${port}/share/${token}/${encodeURIComponent(fileName)}`;
        const qrSvg = await generateCompliantQrSvgAsync(shareUrl);
        const now = Date.now();
        const expiresAt = now + 15 * 60 * 1000; // 15 mins default

        const session: WebShareSession = {
          id: token,
          targetPath,
          fileName,
          isDirectory,
          fileSize,
          lanIp,
          port,
          shareUrl,
          qrSvg,
          createdAt: now,
          expiresAt,
          downloadCount: 0,
        };

        this.activeServer = server;
        this.activeSession = session;

        this.expireTimer = setTimeout(() => {
          void this.stopShare(session.id, win);
        }, 15 * 60 * 1000);

        this.notifyUpdate(win);
        resolve(session);
      });

      server.on('error', (err) => {
        reject(err);
      });
    });
  }

  public async stopShare(
    sessionId?: string,
    win?: BrowserWindow,
  ): Promise<void> {
    if (sessionId && this.activeSession && this.activeSession.id !== sessionId) {
      return;
    }

    if (this.expireTimer) {
      clearTimeout(this.expireTimer);
      this.expireTimer = null;
    }

    if (this.activeServer) {
      await new Promise<void>((res) => {
        this.activeServer?.close(() => res());
      });
      this.activeServer = null;
    }

    this.activeSession = null;
    this.notifyUpdate(win);
  }

  public getActiveShare(): WebShareSession | null {
    return this.activeSession;
  }

  private notifyUpdate(win?: BrowserWindow): void {
    if (win && !win.isDestroyed()) {
      win.webContents.send('webshare:updated', this.activeSession);
    }
  }
}

export const webShareService = new WebShareService();
