import React from 'react';
import type { IconProps } from '../FileTemplates';

export const RubyIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <path d="M6 2L2 8l10 14L22 8l-4-6H6z" fill="#CC342D" />
    <path d="M12 22l10-14H12v14z" fill="#9B111E" opacity="0.3" />
    <path d="M6 2l6 6H2L6 2z" fill="#FF6B6B" opacity="0.4" />
    <path d="M18 2l-6 6h10l-4-6z" fill="#D32F2F" opacity="0.2" />
  </svg>
);
