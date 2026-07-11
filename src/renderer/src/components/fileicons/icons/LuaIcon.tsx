import React from 'react';
import type { IconProps } from '../FileTemplates';

export const LuaIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <rect width="64" height="64" rx="8" fill="#000080" />
    <circle cx="32" cy="32" r="16" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
    <circle cx="32" cy="32" r="6" fill="#FFFFFF" />
    <circle cx="48" cy="32" r="3" fill="#FFFFFF" />
  </svg>
);
