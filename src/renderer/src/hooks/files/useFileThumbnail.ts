import { useState, useEffect } from 'react';
import type { FileSystemNode } from '@shared/types/fileSystem';
import { ipc } from '@renderer/services/ipc';

// Simple in-memory cache for loaded thumbnails to make scrolling super smooth
const thumbnailDataUrlCache = new Map<string, string>();

// extensions we can fetch native thumbnails for
const PREVIEWABLE_EXTENSIONS = [
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'heic', 'bmp', 'tiff',
  'mp4', 'mov', 'mkv', 'avi', 'webm',
  'pdf',
  'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'pages', 'key', 'numbers'
];

export function useFileThumbnail(node: FileSystemNode, size: number) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const extension = node.extension === '' && node.name.startsWith('.')
    ? node.name.slice(1).toLowerCase()
    : node.extension.toLowerCase();
  const isDirectory = node.kind === 'directory';
  const isPreviewable = !isDirectory && PREVIEWABLE_EXTENSIONS.includes(extension);

  useEffect(() => {
    // Reset state for new node path
    setThumbnailUrl(null);
    if (!isPreviewable) return;

    // Check memory cache first
    const cacheKey = `${node.path}:${size}`;
    const cached = thumbnailDataUrlCache.get(cacheKey);
    if (cached) {
      setThumbnailUrl(cached);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

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
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [node.path, extension, isPreviewable, size]);

  return { thumbnailUrl, isLoading, isPreviewable };
}
