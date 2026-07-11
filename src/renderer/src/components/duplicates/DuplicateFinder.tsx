import { DuplicateFinderHeader } from './components/DuplicateFinderHeader';
import { DuplicateEmptyState } from './components/DuplicateEmptyState';
import { DuplicateGroups } from './components/DuplicateGroups';
import { DuplicateLoadingState } from './components/DuplicateLoadingState';
import { DuplicateProgress } from './components/DuplicateProgress';
import { DuplicateScopePicker } from './components/DuplicateScopePicker';
import { DuplicateStats } from './components/DuplicateStats';
import { useDuplicateFinder } from '@renderer/hooks/duplicates/useDuplicateFinder';

export function DuplicateFinder(): React.JSX.Element {
  const duplicateFinder = useDuplicateFinder();
  const hasGroups = duplicateFinder.groups.length > 0;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-shell-surface text-sm">
      <DuplicateFinderHeader
        scanning={duplicateFinder.scanning}
        cleaning={duplicateFinder.cleaning}
        groupsCount={duplicateFinder.groups.length}
        selectedCount={duplicateFinder.selectedPaths.size}
        selectedBytes={duplicateFinder.selectedBytes}
        onScan={() => void duplicateFinder.scan()}
        onStop={() => void duplicateFinder.stopScan()}
        onKeepNewest={duplicateFinder.keepNewest}
        onTrashSelected={() => void duplicateFinder.trashSelected()}
      />

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <DuplicateScopePicker
          scanScope={duplicateFinder.scanScope}
          customFolder={duplicateFinder.customFolder}
          disabled={duplicateFinder.scanning || duplicateFinder.cleaning}
          onScopeChange={duplicateFinder.setScanScope}
          onChooseFolder={() => void duplicateFinder.chooseFolder()}
        />

        {duplicateFinder.message !== null ? (
          <div className="mb-4 rounded-shell border border-shell-border bg-shell-sidebar/40 p-3 text-xs text-current/70">{duplicateFinder.message}</div>
        ) : null}

        <DuplicateStats groupsCount={duplicateFinder.groups.length} selectedCount={duplicateFinder.selectedPaths.size} scanMeta={duplicateFinder.scanMeta} />

        {duplicateFinder.scanning ? <DuplicateProgress progress={duplicateFinder.progress} /> : null}

        {duplicateFinder.scanning && !hasGroups ? (
          <DuplicateLoadingState progress={duplicateFinder.progress} />
        ) : hasGroups ? (
          <DuplicateGroups groups={duplicateFinder.groups} selectedPaths={duplicateFinder.selectedPaths} togglePath={duplicateFinder.togglePath} />
        ) : (
          <DuplicateEmptyState />
        )}
      </div>
    </div>
  );
}
