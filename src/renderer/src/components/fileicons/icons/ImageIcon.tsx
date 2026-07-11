import React from 'react';
import type { IconProps } from '../FileTemplates';

export const ImageIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="image-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    <path
      d="M4 0 H28 L40 12 V44 C40 46.2 38.2 48 36 48 H4 C1.8 48 0 46.2 0 44 V4 C0 1.8 1.8 0 4 0 Z"
      fill="url(#image-bg)"
    />
    <path d="M28 0 V12 H40 Z" fill="#059669" />
    {/* Mountain & Sun layout for image representation */}
    <circle cx="15" cy="18" r="3" fill="#FFFFFF" opacity="0.9" />
    <path d="M8 32 L18 20 L26 28 L32 24 L34 26 V34 H8 Z" fill="#FFFFFF" opacity="0.9" />
  </svg>
);
