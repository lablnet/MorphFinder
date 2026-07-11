import React from 'react';
import type { IconProps } from '../FileTemplates';

export const WordIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <defs>
      <linearGradient id="word-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </linearGradient>
    </defs>
    <path d="M4 0 H28 L40 12 V44 C40 46.2 38.2 48 36 48 H4 C1.8 48 0 46.2 0 44 V4 C0 1.8 1.8 0 4 0 Z" fill="url(#word-bg)" />
    <path d="M28 0 V12 H40 Z" fill="#1d4ed8" />
    <text x="20" y="34" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="11" fill="#FFFFFF" textAnchor="middle">DOC</text>
  </svg>
);
