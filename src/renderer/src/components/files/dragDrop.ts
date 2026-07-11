export const MORPH_FILE_PATHS_TYPE = 'application/x-morphfinder-paths';

export function writeDraggedPaths(dataTransfer: DataTransfer, paths: string[]): void {
  const encoded = JSON.stringify(paths);
  dataTransfer.effectAllowed = 'move';
  dataTransfer.setData(MORPH_FILE_PATHS_TYPE, encoded);
  dataTransfer.setData('text/plain', encoded);
}

export function readDraggedPaths(dataTransfer: DataTransfer): string[] {
  const encoded = dataTransfer.getData(MORPH_FILE_PATHS_TYPE) || dataTransfer.getData('text/plain');
  try {
    const parsed = JSON.parse(encoded) as unknown;
    return Array.isArray(parsed) && parsed.every((path) => typeof path === 'string') ? parsed : [];
  } catch {
    return [];
  }
}

export function pathsForDrag(path: string, selectedPaths: ReadonlySet<string>): string[] {
  return selectedPaths.has(path) ? [...selectedPaths] : [path];
}
