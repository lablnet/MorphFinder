import {
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder,
  type LucideIcon,
} from 'lucide-react';
import type { FileSystemNode } from '@shared/types/fileSystem';

const ICON_BY_EXTENSION: Record<string, LucideIcon> = {
  // Documents
  txt: FileText, md: FileText, pdf: FileText, doc: FileText, docx: FileText, rtf: FileText,
  // Spreadsheets
  csv: FileSpreadsheet, xls: FileSpreadsheet, xlsx: FileSpreadsheet,
  // Images
  png: FileImage, jpg: FileImage, jpeg: FileImage, gif: FileImage, svg: FileImage, webp: FileImage, heic: FileImage,
  // Audio
  mp3: FileAudio, wav: FileAudio, flac: FileAudio, aac: FileAudio,
  // Video
  mp4: FileVideo, mov: FileVideo, mkv: FileVideo, avi: FileVideo, webm: FileVideo,
  // Archives
  zip: FileArchive, tar: FileArchive, gz: FileArchive, rar: FileArchive, '7z': FileArchive,
  // Code
  ts: FileCode, tsx: FileCode, js: FileCode, jsx: FileCode, json: FileCode, py: FileCode,
  rs: FileCode, go: FileCode, swift: FileCode, html: FileCode, css: FileCode, yml: FileCode, yaml: FileCode,
};

/** Falls back to a generic file/folder glyph — real thumbnails are a Phase 8
 *  (native Swift QuickLook) concern, layered on top of this via nativeBridge. */
export function iconForNode(node: FileSystemNode): LucideIcon {
  if (node.kind === 'directory') return Folder;
  return ICON_BY_EXTENSION[node.extension] ?? FileText;
}
