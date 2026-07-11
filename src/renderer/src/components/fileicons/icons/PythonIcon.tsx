import React from 'react';
import type { IconProps } from '../FileTemplates';

export const PythonIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <path d="M55 2C25.7 2 27.5 14.5 27.5 14.5L27.6 27.4H55.4V31.3H17C17 31.3 2 30.1 2 59.2C2 88.3 14 87.2 14 87.2H25.1V71.6C25.1 71.6 23.9 53 42.4 53H70.3C70.3 53 87.3 53 87.3 35.8V17.8C87.3 17.8 89.2 2 55 2Z" fill="#3776AB" />
    <path d="M55 108C84.3 108 82.5 95.5 82.5 95.5L82.4 82.6H54.6V78.7H93C93 78.7 108 79.9 108 50.8C108 21.7 96 22.8 96 22.8H84.9V38.4C84.9 38.4 86.1 57 67.6 57H39.7C39.7 57 22.7 57 22.7 74.2V92.2C22.7 92.2 20.8 108 55 108Z" fill="#FFD343" />
    <circle cx="39" cy="15" r="5" fill="#FFFFFF" />
    <circle cx="71" cy="95" r="5" fill="#111111" />
  </svg>
);
