import { FolderSearch } from 'lucide-react';

export function DuplicateEmptyState(): React.JSX.Element {
  return (
    <div className="flex h-72 flex-col items-center justify-center gap-3 text-current/50">
      <FolderSearch size={30} />
      <span>No exact duplicate groups found.</span>
    </div>
  );
}
