import React, { useState, useEffect } from 'react';
import type { FileSystemNode } from '@shared/types/fileSystem';
import { ipc } from '@renderer/services/ipc';
import {
  FolderIcon,
  CUSTOM_ICONS,
  DefaultFileIcon,
} from './FileTemplates';

export interface FileIconProps {
  node: FileSystemNode;
  size?: number;
  className?: string;
}

// Simple in-memory cache for loaded thumbnails to make scrolling super smooth
const thumbnailDataUrlCache = new Map<string, string>();

// extensions we can fetch native thumbnails for
const PREVIEWABLE_EXTENSIONS = [
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'heic', 'bmp', 'tiff',
  'mp4', 'mov', 'mkv', 'avi', 'webm',
  'pdf',
  'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'pages', 'key', 'numbers'
];

export const FileIcon: React.FC<FileIconProps> = ({
  node,
  size = 24,
  className = '',
}) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const extension = node.extension === '' && node.name.startsWith('.')
    ? node.name.slice(1).toLowerCase()
    : node.extension.toLowerCase();
  const isDirectory = node.kind === 'directory';

  useEffect(() => {
    // Reset state for new node path
    setThumbnailUrl(null);

    if (isDirectory) return;

    if (!PREVIEWABLE_EXTENSIONS.includes(extension)) return;

    // Check memory cache first
    const cacheKey = `${node.path}:${size}`;
    const cached = thumbnailDataUrlCache.get(cacheKey);
    if (cached) {
      setThumbnailUrl(cached);
      return;
    }

    let isMounted = true;

    // Invoke main process native quicklook thumbnail generator
    ipc.invoke('native:thumbnail', {
      path: node.path,
      width: size * 2, // high DPI / retina backing
      height: size * 2,
      scale: 2,
    })
      .then((thumbnail) => {
        if (!isMounted) return;
        if (thumbnail?.dataUrl) {
          thumbnailDataUrlCache.set(cacheKey, thumbnail.dataUrl);
          setThumbnailUrl(thumbnail.dataUrl);
        }
      })
      .catch((err) => {
        console.warn('Failed to load native thumbnail for:', node.path, err);
      });

    return () => {
      isMounted = false;
    };
  }, [node.path, extension, isDirectory, size]);

  // 1. Folders
  if (isDirectory) {
    return <FolderIcon size={size} className={className} />;
  }

  // 2. Previews / Thumbnails (loaded successfully)
  if (thumbnailUrl) {
    return (
      <div
        className={`relative shrink-0 flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10 ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: size > 20 ? '4px' : '2px',
        }}
      >
        <img
          src={thumbnailUrl}
          alt=""
          className="w-full h-full object-cover select-none pointer-events-none"
        />
      </div>
    );
  }

  // 3. Custom File Icons (or fallbacks)
  const TargetIcon = CUSTOM_ICONS[extension] ?? DefaultFileIcon;
  return <TargetIcon size={size} className={className} />;
};
