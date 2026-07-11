import React from 'react';
import type { IconProps } from '../FileTemplates';

export const DartIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <rect width="64" height="64" rx="8" fill="#00B4AB" />
    <path d="M32 12l18 18-18 18-18-18z" stroke="#FFFFFF" strokeWidth="3.5" fill="none" strokeLinejoin="round" />
  </svg>
);
