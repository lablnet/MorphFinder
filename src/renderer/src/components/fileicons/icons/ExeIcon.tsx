import React from 'react';
import type { IconProps } from '../FileTemplates';

export const ExeIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <defs>
      <linearGradient id="exe-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4b5563" />
        <stop offset="100%" stopColor="#1f2937" />
      </linearGradient>
    </defs>
    <path d="M4 0 H28 L40 12 V44 C40 46.2 38.2 48 36 48 H4 C1.8 48 0 46.2 0 44 V4 C0 1.8 1.8 0 4 0 Z" fill="url(#exe-bg)" />
    <path d="M28 0 V12 H40 Z" fill="#374151" />
    <rect x="8" y="18" width="24" height="16" fill="none" stroke="#FFFFFF" strokeWidth="2" rx="2" opacity="0.7" />
    <circle cx="13" cy="23" r="1.5" fill="#FFFFFF" opacity="0.7" />
    <circle cx="18" cy="23" r="1.5" fill="#FFFFFF" opacity="0.7" />
    <text x="20" y="42" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="8" fill="#FFFFFF" textAnchor="middle">BIN</text>
  </svg>
);
