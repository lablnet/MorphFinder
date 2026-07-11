import React from 'react';
import type { IconProps } from '../FileTemplates';

export const GitIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <rect width="64" height="64" rx="8" fill="#F05032" />
    <circle cx="24" cy="32" r="5" fill="#FFFFFF" />
    <circle cx="40" cy="20" r="5" fill="#FFFFFF" />
    <circle cx="40" cy="44" r="5" fill="#FFFFFF" />
    <line x1="24" y1="32" x2="40" y2="20" stroke="#FFFFFF" strokeWidth="3.5" />
    <line x1="24" y1="32" x2="40" y2="44" stroke="#FFFFFF" strokeWidth="3.5" />
  </svg>
);
