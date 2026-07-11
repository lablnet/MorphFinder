import React from 'react';
import type { IconProps } from '../FileTemplates';

export const ZipIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <defs>
      <linearGradient id="zip-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
    </defs>
    <path d="M4 0 H28 L40 12 V44 C40 46.2 38.2 48 36 48 H4 C1.8 48 0 46.2 0 44 V4 C0 1.8 1.8 0 4 0 Z" fill="url(#zip-bg)" />
    <path d="M28 0 V12 H40 Z" fill="#b45309" />
    <rect x="18" y="14" width="4" height="20" fill="#FFFFFF" opacity="0.3" rx="1" />
    <line x1="17" y1="18" x2="23" y2="18" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
    <line x1="17" y1="22" x2="23" y2="22" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
    <line x1="17" y1="26" x2="23" y2="26" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
    <line x1="17" y1="30" x2="23" y2="30" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
    <text x="20" y="43" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="9" fill="#FFFFFF" textAnchor="middle">ZIP</text>
  </svg>
);
