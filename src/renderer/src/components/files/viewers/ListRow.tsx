import React from 'react';
import type { ListChildComponentProps } from 'react-window';
import { ListFileItem } from './items/ListFileItem';
import type { RowData } from './FileListTable';

export function ListRow({ index, style, data }: ListChildComponentProps<RowData>): React.JSX.Element | null {
  const node = data.nodes[index];
  if (node === undefined) return null;

  return <ListFileItem node={node} data={data} style={style} />;
}
