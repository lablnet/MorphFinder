import React from 'react';
import type { IconProps } from '../FileTemplates';

export const BookIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="book-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#854d0e" />
        <stop offset="100%" stopColor="#451a03" />
      </linearGradient>
    </defs>
    <path
      d="M4 0 H28 L40 12 V44 C40 46.2 38.2 48 36 48 H4 C1.8 48 0 46.2 0 44 V4 C0 1.8 1.8 0 4 0 Z"
      fill="url(#book-bg)"
    />
    <path d="M28 0 V12 H40 Z" fill="#713f12" />
    {/* Book open pages */}
    <path
      d="M12 22c2.5-.8 5 .5 8 1.5 3-1 5.5-2.3 8-1.5M12 34c2.5-.8 5 .5 8 1.5 3-1 5.5-2.3 8-1.5M12 22v12M20 23.5v12M28 22v12"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.9"
    />
  </svg>
);
