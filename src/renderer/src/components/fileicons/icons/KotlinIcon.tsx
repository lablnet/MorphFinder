import React from 'react';
import type { IconProps } from '../FileTemplates';

export const KotlinIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <defs>
      <linearGradient id="kotlin-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#7F52FF" />
        <stop offset="50%" stopColor="#C711E1" />
        <stop offset="100%" stopColor="#E24429" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="8" fill="url(#kotlin-grad)" />
    <text x="32" y="39" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="24" fill="#FFFFFF" textAnchor="middle">K</text>
  </svg>
);
