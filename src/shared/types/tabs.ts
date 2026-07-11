import type { ViewMode } from './layout';

export interface TabHistory {
  back: string[];
  forward: string[];
}

export interface TabMetadata {
  id: string;
  path: string;
  /** Cached basename of `path` so the tab strip never re-derives it per render. */
  title: string;
  /** Paths only — listings are re-fetched on navigation so back/forward is never stale. */
  history: TabHistory;
  viewMode: ViewMode;
  isPinned: boolean;
}
