import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { useLayoutShell, useWellKnownDirs } from '@renderer/hooks';
import { useAppStore } from '@renderer/store';

interface SlotProps {
  children: ReactNode;
}

/** Named slots — a page composes `<ShellLayout.TabArea>`, `<ShellLayout.PathArea>`,
 *  `<ShellLayout.Content>`, `<ShellLayout.StatusArea>` as children in any order;
 *  ShellLayout below pulls each one out and places it into the active shell's grid. */
function TabArea({ children }: SlotProps): React.JSX.Element {
  return <>{children}</>;
}
function PathArea({ children }: SlotProps): React.JSX.Element {
  return <>{children}</>;
}
function Content({ children }: SlotProps): React.JSX.Element {
  return <>{children}</>;
}
function StatusArea({ children }: SlotProps): React.JSX.Element {
  return <>{children}</>;
}

function extractSlot(children: ReactNode, slot: (props: SlotProps) => React.JSX.Element): ReactNode {
  const match = Children.toArray(children).find(
    (child): child is ReactElement<SlotProps> => isValidElement(child) && child.type === slot,
  );
  return match?.props.children ?? null;
}

export interface ShellLayoutProps {
  children: ReactNode;
}

/**
 * The single strategy consumer: looks up the active ShellDefinition in the registry
 * and arranges its WindowChrome/Sidebar/StatusBar regions around the page's slotted
 * content. No per-OS if/else — adding a fourth shell never touches this file.
 */
export function ShellLayout({ children }: ShellLayoutProps): React.JSX.Element {
  const { shell } = useLayoutShell();
  useWellKnownDirs();

  const wellKnownDirs = useAppStore((state) => state.wellKnownDirs);
  const activeTabId = useAppStore((state) => state.activeTabId);
  const activePath = useAppStore((state) => state.activeTab()?.path ?? '');
  const navigateActiveTab = useAppStore((state) => state.navigateActiveTab);
  const openTab = useAppStore((state) => state.openTab);

  const handleSidebarNavigate = (path: string): void => {
    if (activeTabId === null) openTab(path);
    else navigateActiveTab(path);
  };

  const tabArea = extractSlot(children, TabArea);
  const pathArea = extractSlot(children, PathArea);
  const content = extractSlot(children, Content);
  const statusArea = extractSlot(children, StatusArea);

  const { WindowChrome, Sidebar, StatusBar } = shell.regions;

  return (
    <div className="flex h-full flex-col overflow-hidden font-shell" data-shell={shell.id} data-testid="morph-shell">
      <WindowChrome>{tabArea}</WindowChrome>
      <div className="flex min-h-0 flex-1">
        <Sidebar wellKnownDirs={wellKnownDirs} activePath={activePath} onNavigate={handleSidebarNavigate} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-shell-border bg-shell-surface">{pathArea}</div>
          <div className="min-h-0 flex-1 overflow-hidden bg-shell-surface">{content}</div>
        </div>
      </div>
      <StatusBar>{statusArea}</StatusBar>
    </div>
  );
}

ShellLayout.TabArea = TabArea;
ShellLayout.PathArea = PathArea;
ShellLayout.Content = Content;
ShellLayout.StatusArea = StatusArea;
