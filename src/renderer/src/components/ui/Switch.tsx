import React from 'react';
import { cn } from '@lablnet/ui';

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'size'> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  size?: 'sm' | 'default';
  shellId?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      onCheckedChange,
      label,
      size = 'default',
      shellId,
      disabled,
      className,
      id,
      onClick,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const isSm = size === 'sm';

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
      onClick?.(e);
      if (!e.defaultPrevented && !disabled) {
        onCheckedChange?.(!checked);
      }
    };

    const switchElement = (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
        disabled={disabled}
        ref={ref}
        id={id}
        onClick={handleClick}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer items-center transition-colors duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-shell-accent disabled:cursor-not-allowed disabled:opacity-40',
          isSm ? 'h-5 w-9 rounded-full' : 'h-6 w-11 rounded-full',
          shellId === 'explorer' ? 'rounded-sm' : 'rounded-full',
          checked
            ? 'bg-[color:var(--shell-accent)]'
            : 'bg-black/25 dark:bg-white/25 hover:bg-black/35 dark:hover:bg-white/35',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none inline-block transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out dark:bg-neutral-100',
            isSm ? 'h-4 w-4' : 'h-5 w-5',
            shellId === 'explorer' && 'rounded-xs',
            checked
              ? isSm ? 'translate-x-[18px]' : 'translate-x-[22px]'
              : 'translate-x-[2px]'
          )}
        />
      </button>
    );

    if (!label) return switchElement;

    return (
      <label
        htmlFor={id}
        className={cn(
          'inline-flex items-center gap-2 select-none text-xs font-medium text-current/80 cursor-pointer hover:text-current',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {switchElement}
        <span>{label}</span>
      </label>
    );
  }
);

Switch.displayName = 'Switch';
