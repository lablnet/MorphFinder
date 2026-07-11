export type FileSystemErrorKind = 'permission' | 'unavailable' | 'generic';

export function classifyFileSystemError(message: string): FileSystemErrorKind {
  const normalized = message.toLowerCase();
  if (normalized.includes('eacces') || normalized.includes('eperm') || normalized.includes('permission denied')) return 'permission';
  if (
    normalized.includes('enoent') ||
    normalized.includes('enodev') ||
    normalized.includes('estale') ||
    normalized.includes('not mounted') ||
    normalized.includes('ejected')
  ) return 'unavailable';
  return 'generic';
}
