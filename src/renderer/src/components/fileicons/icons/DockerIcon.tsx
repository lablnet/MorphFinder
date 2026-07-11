import React from 'react';
import type { IconProps } from '../FileTemplates';

export const DockerIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <rect width="64" height="64" rx="8" fill="#2496ED" />
    <rect x="22" y="16" width="8" height="6" fill="#FFFFFF" rx="1" />
    <rect x="34" y="16" width="8" height="6" fill="#FFFFFF" rx="1" />
    <rect x="16" y="24" width="8" height="6" fill="#FFFFFF" rx="1" />
    <rect x="28" y="24" width="8" height="6" fill="#FFFFFF" rx="1" />
    <rect x="40" y="24" width="8" height="6" fill="#FFFFFF" rx="1" />
    <path d="M10 36c4 4 10 6 22 6s18-2 22-6" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
  </svg>
);
