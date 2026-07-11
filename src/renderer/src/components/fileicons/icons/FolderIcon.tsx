import React from 'react';
import type { IconProps } from '../FileTemplates';

export const FolderIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="folder-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
      <linearGradient id="folder-front-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
      <filter id="folder-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.15" />
      </filter>
    </defs>
    {/* Folder back */}
    <path
      d="M2 5a2 2 0 0 1 2-2h5l2.7 2.7c.2.2.4.3.7.3H20a2 2 0 0 1 2 2v2H2V5z"
      fill="url(#folder-grad)"
    />
    {/* Folder front with a slight shadow to pop */}
    <path
      d="M2 9h20v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9z"
      fill="url(#folder-front-grad)"
      filter="url(#folder-shadow)"
    />
    {/* Inside folder document peeking out slightly */}
    <path d="M6 6h12v3H6V6z" fill="#ffffff" opacity="0.35" />
  </svg>
);
