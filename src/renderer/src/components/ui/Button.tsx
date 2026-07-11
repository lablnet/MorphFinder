import React from 'react';
import { cn } from '@lablnet/ui';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'accent' | 'outline' | 'ghost';
  size?: 'default' | 'icon' | 'sm';
  shellId?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', shellId, type = 'button', ...props }, ref) => {
    return (
      <button
        type={type}
        ref={ref}
        className={cn(
          'flex items-center justify-center font-medium transition-colors outline-none disabled:opacity-30',
          shellId === 'explorer' ? 'rounded' : 'rounded-shell',
          size === 'icon' ? 'h-7 w-7 text-current/70' : 'px-3 py-1.5 text-sm',
          // Variants
          variant === 'accent' && 'bg-[color:var(--shell-accent)] text-white hover:bg-[color:var(--shell-accent)]/90',
          variant === 'outline' && 'border border-shell-border hover:bg-shell-sidebar',
          variant === 'ghost' && 'hover:bg-black/5 dark:hover:bg-white/5',
          variant === 'default' && (
            size === 'icon'
              ? (shellId === 'explorer' ? 'hover:bg-black/5 dark:hover:bg-white/5' : 'hover:bg-shell-sidebar')
              : 'border border-shell-border hover:bg-shell-sidebar'
          ),
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
