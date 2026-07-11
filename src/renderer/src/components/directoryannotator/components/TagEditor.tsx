import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@lablnet/ui';
import type { DirectoryAnnotationTag } from '@shared/types/directoryAnnotations';
import { Button } from '@renderer/components/ui/Button';
import { Input } from '@renderer/components/ui/Input';

const TAG_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'] as const;
const DEFAULT_TAG_COLOR = TAG_COLORS[0];

interface TagEditorProps {
  tags: DirectoryAnnotationTag[];
  onChange: (tags: DirectoryAnnotationTag[]) => void;
}

function makeTagId(label: string, color: string): string {
  return `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${color.replace('#', '')}-${Date.now()}`;
}

export function TagEditor({ tags, onChange }: TagEditorProps): React.JSX.Element {
  const [label, setLabel] = useState('');
  const [color, setColor] = useState<string>(DEFAULT_TAG_COLOR);

  const canAdd = label.trim().length > 0;
  const tagLabels = useMemo(() => new Set(tags.map((tag) => tag.label.toLowerCase())), [tags]);

  const addTag = (): void => {
    const nextLabel = label.trim();
    if (nextLabel.length === 0 || tagLabels.has(nextLabel.toLowerCase())) return;
    onChange([...tags, { id: makeTagId(nextLabel, color), label: nextLabel, color }]);
    setLabel('');
  };

  const removeTag = (id: string): void => {
    onChange(tags.filter((tag) => tag.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {tags.length === 0 ? (
          <span className="text-xs text-current/45">No tags yet</span>
        ) : tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex h-7 max-w-full items-center gap-1 rounded-full border border-shell-border bg-shell-sidebar px-2 text-xs"
            title={tag.label}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} />
            <span className="truncate">{tag.label}</span>
            <button
              type="button"
              className="ml-0.5 text-current/50 hover:text-current"
              onClick={() => removeTag(tag.id)}
              title={`Remove ${tag.label}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') addTag();
          }}
          placeholder="Tag name"
          className="h-8 min-w-0"
        />
        <Button size="icon" variant="outline" onClick={addTag} disabled={!canAdd} title="Add tag">
          <Plus size={15} />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5" aria-label="Tag colors">
        {TAG_COLORS.map((tagColor) => (
          <button
            key={tagColor}
            type="button"
            className={cn(
              'h-5 w-5 rounded-full border transition-transform',
              color === tagColor ? 'scale-110 border-current' : 'border-transparent',
            )}
            style={{ backgroundColor: tagColor }}
            onClick={() => setColor(tagColor)}
            title={tagColor}
          />
        ))}
      </div>
    </div>
  );
}
