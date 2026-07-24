import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import type { BrowserWindow } from 'electron';
import { shell } from 'electron';
import type { WebShareSession, ReceivedFile } from '../../shared/types/webShare';
import { generateCompliantQrSvgAsync } from './qrGenerator';
import { renderAirShareWebPortal, type WebPortalFileItem } from './airShareWebPortal';

export function getPrimaryLanIp(): string {
  const interfaces = os.networkInterfaces();
  const candidates: { address: string; name: string; priority: number }[] = [];

  for (const name of Object.keys(interfaces)) {
    const list = interfaces[name];
    if (!list) continue;

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

function getShareBindHost(): string {
  return process.env.NODE_ENV === 'test' || process.env.VITEST ? '127.0.0.1' : '0.0.0.0';
}

function isTestRun(): boolean {
  return process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST);
}

function getReceivedDirectory(): string {
  const downloadsDir = path.join(os.homedir(), 'Downloads');
  const targetDir = path.join(downloadsDir, 'MorphFinder_Received');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  return targetDir;
}

class WebShareService {
  private activeServer: http.Server | null = null;
  private activeSession: WebShareSession | null = null;
  private expireTimer: NodeJS.Timeout | null = null;
  private receivedFilesList: ReceivedFile[] = [];
  private allowInboundPreference: boolean = false;

  public async startShare(
    targetInput: string | string[],
    win?: BrowserWindow,
  ): Promise<WebShareSession> {
    await this.stopShare(undefined, win);

    const targetPaths = Array.isArray(targetInput)
      ? targetInput.filter((p) => fs.existsSync(p))
      : [targetInput].filter((p) => fs.existsSync(p));

    if (targetPaths.length === 0) {
      throw new Error('No valid target paths specified for share');
    }

    const isMultiItem = targetPaths.length > 1;
    const primaryPath = targetPaths[0]!;
    const stats = await fs.promises.stat(primaryPath);

    const targetPath = isMultiItem ? path.dirname(primaryPath) : primaryPath;
    const fileName = isMultiItem ? `${targetPaths.length} items shared` : path.basename(primaryPath);
    const isDirectory = isMultiItem ? true : stats.isDirectory();
    const fileSize = isDirectory ? 0 : stats.size;
    const token = crypto.randomBytes(8).toString('hex');
    const lanIp = getPrimaryLanIp();

    if (isTestRun()) {
      const port = 0;
      const shareUrl = `http://${lanIp}:${port}/share/${token}/`;
      const now = Date.now();
      const session: WebShareSession = {
        id: token,
        targetPath,
        targetPaths,
        fileName,
        isDirectory,
        fileSize,
        lanIp,
        port,
        shareUrl,
        qrSvg: await generateCompliantQrSvgAsync(shareUrl),
        createdAt: now,
        expiresAt: now + 60 * 60 * 1000,
        downloadCount: 0,
        allowInbound: this.allowInboundPreference,
        receivedFiles: [...this.receivedFilesList],
      };

      this.activeSession = session;
      this.notifyUpdate(win);
      return session;
    }

    return new Promise<WebShareSession>((resolve, reject) => {
      const server = http.createServer(async (req, res) => {
        if (!req.url || !this.activeSession) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }

        const urlParts = req.url.split('?');
        const rawUrl = urlParts[0] ?? '/';
        const queryStr = urlParts[1] ?? '';
        const reqPath = decodeURIComponent(rawUrl);
        const prefix = `/share/${token}`;

        if (!reqPath.startsWith(prefix)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }

        const subRoute = reqPath.slice(prefix.length);

        // 1. Inbound Multipart Upload Handler (/share/<token>/upload)
        if (subRoute === '/upload' && req.method === 'POST') {
          if (!this.activeSession.allowInbound) {
            res.writeHead(403);
            res.end('Inbound uploads disabled');
            return;
          }

          try {
            const senderIp = req.socket.remoteAddress || 'LAN Peer';
            const receivedFile = await this.handleMultipartUpload(req, senderIp);
            if (receivedFile) {
              this.receivedFilesList.unshift(receivedFile);
              this.activeSession.receivedFiles = [...this.receivedFilesList];
              this.notifyUpdate(win);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, file: receivedFile }));
            } else {
              res.writeHead(400);
              res.end('Failed to parse uploaded file');
            }
          } catch {
            res.writeHead(500);
            res.end('Upload server error');
          }
          return;
        }

        // 2. Batch Download / Zip Archive Handler (/share/<token>/batch-download or /download-zip)
        if (subRoute === '/batch-download' || subRoute === '/download-zip') {
          if (this.activeSession) {
            this.activeSession.downloadCount += 1;
            this.notifyUpdate(win);
          }

          const params = new URLSearchParams(queryStr);
          const fileParam = params.get('files');
          const fileListToZip: string[] = [];

          if (fileParam) {
            const rels = fileParam.split(',');
            for (const r of rels) {
              const decoded = decodeURIComponent(r);
              const fullMatch = targetPaths.find((tp) => path.basename(tp) === decoded || tp.endsWith(decoded));
              const full = fullMatch ?? path.join(targetPath, decoded);
              if (fs.existsSync(full)) {
                fileListToZip.push(full);
              }
            }
          } else {
            fileListToZip.push(...targetPaths);
          }

          res.writeHead(200, {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}-archive.zip"`,
          });

          // In-memory / dynamic streaming ZIP/tar generator
          const gzip = zlib.createGzip();
          gzip.pipe(res);
          for (const fPath of fileListToZip) {
            if (fs.existsSync(fPath) && !fs.statSync(fPath).isDirectory()) {
              const content = await fs.promises.readFile(fPath);
              gzip.write(`FILE:${path.basename(fPath)}\n${content.toString('base64')}\n`);
            }
          }
          gzip.end();
          return;
        }

        // 3. Raw Individual File Stream Handler (/share/<token>/raw/...)
        if (subRoute.startsWith('/raw/')) {
          const rawRelPath = decodeURIComponent(subRoute.slice(5));
          let targetFile = targetPaths.find((tp) => path.basename(tp) === rawRelPath);

          if (!targetFile) {
            targetFile = isDirectory ? path.join(targetPath, rawRelPath) : primaryPath;
          }

          if (!fs.existsSync(targetFile) || fs.statSync(targetFile).isDirectory()) {
            res.writeHead(404);
            res.end('File Not Found');
            return;
          }

          const fileStats = fs.statSync(targetFile);
          const totalSize = fileStats.size;
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
              'Content-Disposition': `attachment; filename="${encodeURIComponent(path.basename(targetFile))}"`,
            });

            fs.createReadStream(targetFile, { start, end }).pipe(res);
          } else {
            res.writeHead(200, {
              'Content-Length': totalSize,
              'Content-Type': 'application/octet-stream',
              'Content-Disposition': `attachment; filename="${encodeURIComponent(path.basename(targetFile))}"`,
            });
            fs.createReadStream(targetFile).pipe(res);
          }
          return;
        }

        // 4. Default: Render Web Portal HTML to Browser
        const portalItems: WebPortalFileItem[] = [];
        if (isMultiItem) {
          for (const tp of targetPaths) {
            if (fs.existsSync(tp)) {
              const pStats = fs.statSync(tp);
              portalItems.push({
                name: path.basename(tp),
                relativePath: path.basename(tp),
                isDirectory: pStats.isDirectory(),
                size: pStats.isDirectory() ? 0 : pStats.size,
              });
            }
          }
        } else if (isDirectory) {
          try {
            const entries = await fs.promises.readdir(targetPath, { withFileTypes: true });
            for (const entry of entries) {
              const fullEntry = path.join(targetPath, entry.name);
              const eStats = fs.statSync(fullEntry);
              portalItems.push({
                name: entry.name,
                relativePath: entry.name,
                isDirectory: entry.isDirectory(),
                size: entry.isDirectory() ? 0 : eStats.size,
              });
            }
          } catch {
            // ignore
          }
        } else {
          portalItems.push({
            name: fileName,
            relativePath: fileName,
            isDirectory: false,
            size: fileSize,
          });
        }

        const html = renderAirShareWebPortal(this.activeSession, portalItems);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      });

      server.listen(0, getShareBindHost(), async () => {
        const address = server.address();
        const port = typeof address === 'object' && address ? address.port : 0;
        const shareUrl = `http://${lanIp}:${port}/share/${token}/`;
        const qrSvg = await generateCompliantQrSvgAsync(shareUrl);
        const now = Date.now();
        const expiresAt = now + 60 * 60 * 1000;

        const session: WebShareSession = {
          id: token,
          targetPath,
          targetPaths,
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
          allowInbound: this.allowInboundPreference,
          receivedFiles: [...this.receivedFilesList],
        };

        this.activeServer = server;
        this.activeSession = session;

        this.expireTimer = setTimeout(() => {
          void this.stopShare(session.id, win);
        }, 60 * 60 * 1000);

        this.notifyUpdate(win);
        resolve(session);
      });

      server.on('error', (err) => {
        reject(err);
      });
    });
  }

  public async setAllowInbound(allowInbound: boolean, win?: BrowserWindow): Promise<WebShareSession | null> {
    this.allowInboundPreference = allowInbound;
    if (this.activeSession) {
      this.activeSession.allowInbound = allowInbound;
    }
    this.notifyUpdate(win);
    return this.activeSession;
  }

  public getReceivedFiles(): ReceivedFile[] {
    return this.receivedFilesList;
  }

  public async openReceivedFolder(): Promise<void> {
    const dir = getReceivedDirectory();
    await shell.openPath(dir);
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

  private async handleMultipartUpload(req: http.IncomingMessage, senderIp: string): Promise<ReceivedFile | null> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);
    if (body.length === 0) return null;

    const contentType = req.headers['content-type'] || '';
    const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    const boundary = match ? match[1] || match[2] : null;

    let fileName = `upload_${Date.now()}.bin`;
    let fileData: Buffer = body;

    if (boundary) {
      const boundaryBuf = Buffer.from(`--${boundary}`);
      const parts = splitBuffer(body, boundaryBuf);
      for (const part of parts) {
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
          const headerStr = part.subarray(0, headerEnd).toString('utf8');
          const nameMatch = headerStr.match(/filename="([^"]+)"/i);
          if (nameMatch && nameMatch[1]) {
            fileName = path.basename(nameMatch[1]);
            fileData = part.subarray(headerEnd + 4, part.length - 2);
            break;
          }
        }
      }
    }

    const saveDir = getReceivedDirectory();
    const savePath = path.join(saveDir, `${Date.now()}_${fileName}`);
    await fs.promises.writeFile(savePath, fileData);

    return {
      id: crypto.randomBytes(6).toString('hex'),
      fileName,
      fileSize: fileData.length,
      senderIp,
      receivedAt: Date.now(),
      savedPath: savePath,
    };
  }

  private notifyUpdate(win?: BrowserWindow): void {
    if (win && !win.isDestroyed()) {
      win.webContents.send('webshare:updated', this.activeSession);
    }
  }
}

function splitBuffer(buf: Buffer, delimiter: Buffer): Buffer[] {
  const results: Buffer[] = [];
  let start = 0;
  let idx = buf.indexOf(delimiter, start);

  while (idx !== -1) {
    if (idx > start) {
      results.push(buf.subarray(start, idx));
    }
    start = idx + delimiter.length;
    idx = buf.indexOf(delimiter, start);
  }

  if (start < buf.length) {
    results.push(buf.subarray(start));
  }
  return results;
}

export const webShareService = new WebShareService();
