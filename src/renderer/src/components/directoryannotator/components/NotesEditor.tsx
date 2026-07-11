interface NotesEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function NotesEditor({ value, onChange }: NotesEditorProps): React.JSX.Element {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-40 w-full resize-none rounded-shell border border-shell-border bg-transparent p-3 text-sm leading-6 outline-none transition-colors focus:border-[color:var(--shell-accent)]"
      placeholder="Write markdown notes for this file or folder..."
      spellCheck
    />
  );
}
