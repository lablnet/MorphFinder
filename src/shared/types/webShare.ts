export interface WebShareSession {
  id: string;
  targetPath: string;
  fileName: string;
  isDirectory: boolean;
  fileSize: number;
  lanIp: string;
  port: number;
  shareUrl: string;
  qrSvg: string;
  createdAt: number;
  expiresAt: number;
  downloadCount: number;
}

export interface StartWebShareRequest {
  path: string;
}

export interface StopWebShareRequest {
  sessionId?: string;
}
