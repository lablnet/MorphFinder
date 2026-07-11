import React from 'react';
import { cn } from '@lablnet/ui';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'h-9 w-full rounded-shell border bg-transparent px-3 text-sm outline-none transition-colors',
          error
            ? 'border-red-500 focus:border-red-500'
            : 'border-shell-border focus:border-[color:var(--shell-accent)]',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
