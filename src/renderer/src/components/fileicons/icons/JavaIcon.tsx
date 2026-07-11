import React from 'react';
import type { IconProps } from '../FileTemplates';

export const JavaIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <rect width="64" height="64" rx="8" fill="#ED8B00" />
    <path d="M18 42c0 2.2 1.8 4 4 4h18c2.2 0 4-1.8 4-4V28H18v14zm26-10c2.2 0 4-1.8 4-4s-1.8-4-4-4v8zM24 16c2-4 5-4 5-4m-3 8c2-4 5-4 5-4" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
  </svg>
);
