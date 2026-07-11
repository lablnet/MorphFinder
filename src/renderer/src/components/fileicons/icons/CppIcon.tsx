import React from 'react';
import type { IconProps } from '../FileTemplates';

export const CppIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <rect width="64" height="64" rx="8" fill="#00599C" />
    <text x="32" y="38" fontFamily="system-ui, sans-serif" fontWeight="bold" fontSize="20" fill="#FFFFFF" textAnchor="middle">C++</text>
  </svg>
);
