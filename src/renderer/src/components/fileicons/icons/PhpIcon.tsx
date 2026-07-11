import React from 'react';
import type { IconProps } from '../FileTemplates';

export const PhpIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <rect width="64" height="64" rx="12" fill="#777BB4" />
    <ellipse cx="32" cy="32" rx="24" ry="16" fill="#8892BF" />
    <text x="32" y="38" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="18" fill="#FFFFFF" textAnchor="middle">php</text>
  </svg>
);
