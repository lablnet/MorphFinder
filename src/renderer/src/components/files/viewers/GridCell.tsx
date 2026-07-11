import React from 'react';
import type { GridChildComponentProps } from 'react-window';
import { GridFileItem } from './items/GridFileItem';
import type { GridItemData } from './FileGrid';

export function GridCell({ columnIndex, rowIndex, style, data }: GridChildComponentProps<GridItemData>): React.JSX.Element | null {
  const index = rowIndex * data.columnCount + columnIndex;
  const node = data.nodes[index];
  if (node === undefined) return null;

  return <GridFileItem node={node} data={data} style={style} />;
}
