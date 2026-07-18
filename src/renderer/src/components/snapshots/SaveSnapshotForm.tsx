import React, { useState } from 'react';
import { Button, Input } from '@lablnet/ui';
import { Camera } from 'lucide-react';

interface SaveSnapshotFormProps {
  defaultName: string;
  onSave: (name: string, description?: string) => Promise<void>;
  onCancel: () => void;
}

export function SaveSnapshotForm({ defaultName, onSave, onCancel }: SaveSnapshotFormProps) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await onSave(name.trim(), description.trim() || undefined);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50" onSubmit={handleSubmit}>
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
        <Camera className="size-4 text-teal-600 dark:text-teal-400" />
        <span>Save New Workspace Snapshot</span>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          Snapshot Name
        </label>
        <Input
          className="mt-1"
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Frontend Refactor Setup"
          required
          value={name}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          Description (Optional)
        </label>
        <Input
          className="mt-1"
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Tab 1: components, Tab 2: styles"
          value={description}
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button onClick={onCancel} type="button" variant="outline" size="sm">
          Cancel
        </Button>
        <Button disabled={!name.trim() || isSaving} type="submit" size="sm">
          {isSaving ? 'Saving...' : 'Save Snapshot'}
        </Button>
      </div>
    </form>
  );
}
