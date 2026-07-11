import React from 'react';
import type { IconProps } from '../FileTemplates';

export const MarkdownIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <rect width="64" height="64" rx="8" fill="#4B0082" />
    <text x="32" y="38" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="22" fill="#FFFFFF" textAnchor="middle">M↓</text>
  </svg>
);
