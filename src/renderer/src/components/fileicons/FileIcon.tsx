import React from 'react';
import type { FileSystemNode } from '@shared/types/fileSystem';
import { useFileThumbnail } from '@renderer/hooks';
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

export const FileIcon: React.FC<FileIconProps> = ({
  node,
  size = 24,
  className = '',
}) => {
  const { thumbnailUrl } = useFileThumbnail(node, size);
  const isDirectory = node.kind === 'directory';

  const extension = node.extension === '' && node.name.startsWith('.')
    ? node.name.slice(1).toLowerCase()
    : node.extension.toLowerCase();

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

