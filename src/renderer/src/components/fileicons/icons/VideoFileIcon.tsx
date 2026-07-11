import React from 'react';
import type { IconProps } from '../FileTemplates';

export const VideoFileIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <defs>
      <linearGradient id="video-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#4338ca" />
      </linearGradient>
    </defs>
    <path d="M4 0 H28 L40 12 V44 C40 46.2 38.2 48 36 48 H4 C1.8 48 0 46.2 0 44 V4 C0 1.8 1.8 0 4 0 Z" fill="url(#video-bg)" />
    <path d="M28 0 V12 H40 Z" fill="#6366f1" />
    <path d="M12 21h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H12a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zm14 1.5l4-2.5v12l-4-2.5v-7z" fill="#FFFFFF" opacity="0.85" />
  </svg>
);
