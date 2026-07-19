import { useEffect } from 'react';
import { useAppStore } from '@renderer/store';
import { useTabs } from '../ui/useTabs';

/** Detects the platform accelerator modifier once — Cmd on macOS, Ctrl everywhere else. */
function isPrimaryModifier(event: KeyboardEvent): boolean {
  return navigator.platform.toLowerCase().includes('mac') ? event.metaKey : event.ctrlKey;
}

/** App-wide accelerators: new/close tab, tab cycling, shell switching, hidden files.
 *  Per-view shortcuts (rename, delete, copy/paste) live with the component they act on. */
export function useKeyboardShortcuts(): void {
  const tabs = useTabs();
  const cycleShell = useAppStore((state) => state.cycleShell);
  const toggleHiddenFiles = useAppStore((state) => state.toggleHiddenFiles);
  const toggleTerminal = useAppStore((state) => state.toggleTerminal);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (!isPrimaryModifier(event)) return;

      switch (event.key.toLowerCase()) {
        case '`':
          event.preventDefault();
          toggleTerminal();
          break;
        case 't':
          event.preventDefault();
          tabs.openHome();
          break;
        case 'w':
          if (tabs.activeId !== null) {
            event.preventDefault();
            tabs.close(tabs.activeId);
          }
          break;
        case 'tab': {
          event.preventDefault();
          const currentIndex = tabs.all.findIndex((tab) => tab.id === tabs.activeId);
          const step = event.shiftKey ? -1 : 1;
          const nextTab = tabs.all[(currentIndex + step + tabs.all.length) % tabs.all.length];
          if (nextTab !== undefined) tabs.activate(nextTab.id);
          break;
        }
        case 'u':
          if (event.shiftKey) {
            event.preventDefault();
            cycleShell();
          }
          break;
        case '.':
          event.preventDefault();
          toggleHiddenFiles();
          break;
        case '[':
          event.preventDefault();
          tabs.back();
          break;
        case ']':
          event.preventDefault();
          tabs.forward();
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, cycleShell, toggleHiddenFiles, toggleTerminal]);
}
