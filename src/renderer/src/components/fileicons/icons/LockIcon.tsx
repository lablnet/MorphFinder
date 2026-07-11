import React from 'react';
import type { IconProps } from '../FileTemplates';

export const LockIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="lock-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
    </defs>
    <path
      d="M4 0 H28 L40 12 V44 C40 46.2 38.2 48 36 48 H4 C1.8 48 0 46.2 0 44 V4 C0 1.8 1.8 0 4 0 Z"
      fill="url(#lock-bg)"
    />
    <path d="M28 0 V12 H40 Z" fill="#d97706" />
    {/* Lock shape */}
    <rect x="13" y="24" width="14" height="10" rx="1.5" fill="#FFFFFF" opacity="0.9" />
    <path
      d="M16 24v-4c0-2.2 1.8-4 4-4s4 1.8 4 4v4"
      stroke="#FFFFFF"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.9"
    />
  </svg>
);
