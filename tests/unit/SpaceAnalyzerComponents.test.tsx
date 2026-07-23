import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Header } from '@renderer/components/spaceanalyzer/components/Header';
import { Footer } from '@renderer/components/spaceanalyzer/components/Footer';
import { LoadingState } from '@renderer/components/spaceanalyzer/components/LoadingState';
import { DonutView } from '@renderer/components/spaceanalyzer/components/DonutView';
import { ListView } from '@renderer/components/spaceanalyzer/components/ListView';
import type { SpaceAnalyzerNode } from '@shared/types/spaceAnalyzer';

const analyzerNodes: SpaceAnalyzerNode[] = [
  { name: 'src', path: '/repo/src', size: 600, children: [], isDirectory: true, fileCount: 10, dirCount: 2 },
  { name: 'README.md', path: '/repo/README.md', size: 300, children: [], isDirectory: false, fileCount: 1, dirCount: 0 },
  { name: '[Other Files & Folders]', path: '__other__', size: 100, children: [], isDirectory: true, fileCount: 4, dirCount: 1 },
];

describe('SpaceAnalyzer Sub-Components', () => {
  it('renders Header with path and controls', () => {
    render(
      <Header
        currentPathInput="/Users/test"
        setCurrentPathInput={vi.fn()}
        viewedPath="/Users/test"
        isScanning={false}
        viewMode="treemap"
        onTriggerScan={vi.fn()}
        onCancelScan={vi.fn()}
        onChangeViewMode={vi.fn()}
        wellKnownDirs={{ home: '/Users/test', desktop: '/Users/test/Desktop', documents: '/Users/test/Docs', downloads: '/Users/test/Dl' }}
        browseFolder={vi.fn()}
        history={[]}
        onNavigateUp={vi.fn()}
      />
    );
    expect(screen.getByText('Storage Analyzer')).toBeDefined();
  });

  it('renders Footer statistics', () => {
    render(<Footer totalBytes={1024 * 1024 * 100} fileCount={10} dirCount={2} scannedPath="/Users/test" />);
    expect(screen.getByText(/Ready|Scan/)).toBeDefined();
  });

  it('renders LoadingState', () => {
    render(<LoadingState progress={{ fileCount: 10, size: 1024, scannedPath: '/Users/test' }} />);
    expect(screen.getByText('Scanning Storage...')).toBeDefined();
  });

  it('renders and interacts with DonutView slices and legend rows', () => {
    const onDrillDown = vi.fn();
    const setHoveredPath = vi.fn();
    const onSelectNode = vi.fn();
    const { container, rerender } = render(
      <DonutView
        children={analyzerNodes}
        totalSize={1000}
        onDrillDown={onDrillDown}
        hoveredPath="/repo/src"
        setHoveredPath={setHoveredPath}
        selectedPath="/repo/src"
        onSelectNode={onSelectNode}
      />,
    );

    expect(screen.getByText('Subdirectory Allocation')).toBeDefined();
    expect(screen.getByText('60.0%')).toBeDefined();
    expect(screen.getAllByText('src').length).toBeGreaterThan(1);

    const slices = container.querySelectorAll('svg circle.cursor-pointer');
    fireEvent.mouseEnter(slices[0]!);
    fireEvent.mouseLeave(slices[0]!);
    fireEvent.click(slices[0]!);
    fireEvent.doubleClick(slices[0]!);
    expect(setHoveredPath).toHaveBeenCalledWith('/repo/src');
    expect(setHoveredPath).toHaveBeenCalledWith(null);
    expect(onSelectNode).toHaveBeenCalledWith('/repo/src');
    expect(onDrillDown).toHaveBeenCalledWith(analyzerNodes[0]);

    fireEvent.doubleClick(screen.getByText('README.md').closest('div')!);
    expect(onDrillDown).toHaveBeenCalledWith(analyzerNodes[1]);

    rerender(
      <DonutView
        children={analyzerNodes}
        totalSize={0}
        onDrillDown={onDrillDown}
        hoveredPath={null}
        setHoveredPath={setHoveredPath}
        selectedPath={null}
        onSelectNode={onSelectNode}
      />,
    );
    expect(screen.getByText('--')).toBeDefined();
  });

  it('renders and interacts with ListView rows, empty state, selection, and drilldown rules', () => {
    const onDrillDown = vi.fn();
    const setHoveredPath = vi.fn();
    const onSelectNode = vi.fn();
    const { rerender } = render(
      <ListView
        children={analyzerNodes}
        totalSize={1000}
        onDrillDown={onDrillDown}
        hoveredPath="/repo/README.md"
        setHoveredPath={setHoveredPath}
        selectedPath="/repo/src"
        onSelectNode={onSelectNode}
      />,
    );

    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('600 B')).toBeDefined();
    expect(screen.getByText('60.0%')).toBeDefined();

    fireEvent.click(screen.getByRole('table'));
    expect(onSelectNode).toHaveBeenCalledWith(null);

    const srcRow = screen.getByText('src').closest('tr')!;
    fireEvent.mouseEnter(srcRow);
    fireEvent.mouseLeave(srcRow);
    fireEvent.click(srcRow);
    fireEvent.doubleClick(srcRow);
    expect(setHoveredPath).toHaveBeenCalledWith('/repo/src');
    expect(setHoveredPath).toHaveBeenCalledWith(null);
    expect(onSelectNode).toHaveBeenCalledWith('/repo/src');
    expect(onDrillDown).toHaveBeenCalledWith(analyzerNodes[0]);

    fireEvent.doubleClick(screen.getByText('README.md').closest('tr')!);
    fireEvent.click(screen.getByText('[Other Files & Folders]').closest('tr')!);
    fireEvent.doubleClick(screen.getByText('[Other Files & Folders]').closest('tr')!);
    expect(onSelectNode).toHaveBeenCalledWith(null);
    expect(onDrillDown).toHaveBeenCalledTimes(1);

    rerender(
      <ListView
        children={[]}
        totalSize={0}
        onDrillDown={onDrillDown}
        hoveredPath={null}
        setHoveredPath={setHoveredPath}
        selectedPath={null}
        onSelectNode={onSelectNode}
      />,
    );
    expect(screen.getByText('No displayable items found inside this folder.')).toBeDefined();
  });
});
