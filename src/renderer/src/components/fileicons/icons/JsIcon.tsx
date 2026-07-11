import React from 'react';
import type { IconProps } from '../FileTemplates';

export const JsIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <rect width="64" height="64" rx="8" fill="#F7DF1E" />
    <text x="54" y="54" fontFamily="system-ui, sans-serif" fontWeight="bold" fontSize="24" fill="#000000" textAnchor="end">JS</text>
  </svg>
);
