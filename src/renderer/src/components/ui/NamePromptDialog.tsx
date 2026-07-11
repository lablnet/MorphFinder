import React from 'react';
import { Button } from './Button';
import { Input } from './Input';

export interface NamePromptState {
  title: string;
  defaultValue: string;
  value: string;
}

export interface NamePromptDialogProps {
  prompt: NamePromptState;
  onChange: (value: string) => void;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function NamePromptDialog({
  prompt,
  onChange,
  onConfirm,
  onCancel,
}: NamePromptDialogProps): React.JSX.Element {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 px-4"
      role="presentation"
      onMouseDown={onCancel}
    >
      <form
        className="w-full max-w-sm rounded-shell border border-shell-border bg-shell-surface p-4 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm(prompt.value);
        }}
      >
        <label className="block text-sm font-medium text-current" htmlFor="name-prompt-input">
          {prompt.title}
        </label>
        <Input
          id="name-prompt-input"
          autoFocus
          value={prompt.value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={(event) => event.currentTarget.select()}
          onKeyDown={(event) => {
            if (event.key === 'Escape') onCancel();
          }}
          className="mt-3"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button type="submit" variant="accent">
            OK
          </Button>
        </div>
      </form>
    </div>
  );
}
