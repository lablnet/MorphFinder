import type { ViewMode } from '@shared/types/layout';
import { FileColumnView } from './viewers/FileColumnView';
import { FileGrid } from './viewers/FileGrid';
import { FileListTable } from './viewers/FileListTable';
import type { FileViewProps } from './types';

export interface RoutedFileViewProps extends FileViewProps {
  viewMode: ViewMode;
}

export function FileView({ viewMode, ...props }: RoutedFileViewProps): React.JSX.Element {
  if (viewMode === 'icons' || viewMode === 'gallery') return <FileGrid {...props} />;
  if (viewMode === 'columns') return <FileColumnView {...props} />;
  return <FileListTable {...props} />;
}
