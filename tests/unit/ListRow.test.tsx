import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { ListRow } from '@renderer/components/files/viewers/ListRow';
import type { RowData } from '@renderer/components/files/viewers/FileListTable';

describe('ListRow', () => {
  it('returns null if node index is out of bounds', () => {
    const data: RowData = {
      nodes: [],
      selectedPaths: new Set(),
      focusedPath: null,
      onSelect: () => {},
      onOpen: () => {},
      onContextMenu: () => {},
    };

    const { container } = render(<ListRow index={0} style={{}} data={data} />);
    expect(container.firstChild).toBeNull();
  });
});
