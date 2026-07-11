import React from 'react';

interface BaseDialogProps {
  activeShell: string;
  size?: 'sm' | 'lg';
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  onClose?: () => void;
}

export function BaseDialog({
  activeShell,
  size = 'lg',
  children,
  className = '',
  overlayClassName = '',
  onClose,
}: BaseDialogProps): React.JSX.Element {
  const shell = activeShell === 'explorer' || activeShell === 'dolphin' ? activeShell : 'finder';

  const overlayClasses = {
    explorer: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity',
    dolphin: 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity',
    finder: 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity',
  }[shell];

  const sizeClasses = {
    explorer: {
      sm: 'max-w-sm',
      lg: 'max-w-lg',
    },
    dolphin: {
      sm: 'max-w-sm',
      lg: 'max-w-lg',
    },
    finder: {
      sm: 'max-w-xs',
      lg: 'max-w-md',
    },
  }[shell][size];

  const paddingClass = shell === 'finder' && size === 'lg' ? 'p-6' : 'p-5';

  const contentClasses = {
    explorer: `w-full ${sizeClasses} rounded-none border-2 border-[#0067c0] dark:border-[#4cc2ff] bg-shell-surface ${paddingClass} shadow-2xl flex flex-col font-sans text-current`,
    dolphin: `w-full ${sizeClasses} rounded-shell border border-shell-border bg-shell-surface ${paddingClass} shadow-xl flex flex-col text-current`,
    finder: `w-full ${sizeClasses} rounded-2xl border border-shell-border shadow-2xl flex flex-col ${paddingClass} backdrop-blur-xl text-current`,
  }[shell];

  const contentStyle = shell === 'finder'
    ? {
        backgroundColor: 'color-mix(in srgb, var(--shell-surface) 92%, transparent)',
        color: 'currentColor',
      }
    : undefined;

  return (
    <div
      className={`${overlayClasses} ${overlayClassName}`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`${contentClasses} ${className}`}
        style={contentStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
