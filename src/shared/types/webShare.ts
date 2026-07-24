export interface ReceivedFile {
  id: string;
  fileName: string;
  fileSize: number;
  senderIp: string;
  receivedAt: number;
  savedPath: string;
}

export interface WebShareSession {
  id: string;
  targetPath: string;
  targetPaths: string[];
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
  allowInbound: boolean;
  receivedFiles: ReceivedFile[];
}

export interface StartWebShareRequest {
  path?: string;
  paths?: string[];
}

export interface StopWebShareRequest {
  sessionId?: string;
}
