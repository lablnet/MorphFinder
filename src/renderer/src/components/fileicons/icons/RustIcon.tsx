import React from 'react';
import type { IconProps } from '../FileTemplates';

export const RustIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <circle cx="12" cy="12" r="8" stroke="#E05B2B" strokeWidth="2.5" fill="none" />
    <circle cx="12" cy="12" r="5" fill="#E05B2B" opacity="0.3" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="#E05B2B" strokeWidth="2.5" strokeLinecap="round" />
    <text x="12" y="15.5" fontFamily="system-ui, sans-serif" fontWeight="bold" fontSize="10" fill="#E05B2B" textAnchor="middle">R</text>
  </svg>
);
