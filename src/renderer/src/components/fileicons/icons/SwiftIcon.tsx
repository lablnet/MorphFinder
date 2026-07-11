import React from 'react';
import type { IconProps } from '../FileTemplates';

export const SwiftIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <rect width="64" height="64" rx="8" fill="#F05138" />
    <path d="M48 43C42 45 30 43 22 34c-4-4-8-12-8-18 8 9 14 11 16 11-4-5-4-10-3-11 4 5 11 9 17 11-1-3 0-7 2-8 0 5 4 8 9 10-6 2-10 6-12 11 8-2 15 1 20 4-5-1-10-2-15 0z" fill="#FFFFFF" />
  </svg>
);
