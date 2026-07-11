import React from 'react';
import type { IconProps } from '../FileTemplates';

export const DbIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <defs>
      <linearGradient id="db-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0ea5e9" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
    </defs>
    <path d="M4 0 H28 L40 12 V44 C40 46.2 38.2 48 36 48 H4 C1.8 48 0 46.2 0 44 V4 C0 1.8 1.8 0 4 0 Z" fill="url(#db-bg)" />
    <path d="M28 0 V12 H40 Z" fill="#0284c7" />
    <ellipse cx="20" cy="18" rx="8" ry="2.5" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.8" />
    <path d="M12 18v6c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-6" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.8" />
    <path d="M12 24v6c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-6" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.8" />
  </svg>
);
