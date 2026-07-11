import React from 'react';
import { Trash2, RefreshCw, Info, Search, CheckCircle, ShieldAlert } from 'lucide-react';
import { useCacheCleaner, formatBytes } from '../../hooks/files/useCacheCleaner';
import { useAppStore } from '@renderer/store';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

// Subcomponents
import { SpaceDashboard } from './components/SpaceDashboard';
import { CacheTable } from './components/CacheTable';
import { ConfirmDialogs } from './components/ConfirmDialogs';
import { ProgressDialog } from './components/ProgressDialog';
import { UnsupportedPlatform } from './components/UnsupportedPlatform';

export function CacheCleaner(): React.JSX.Element {
  const activeShell = useAppStore((state) => state.activeShell);
  const {
    isSupported,
    targets,
    selectedIds,
    scanning,
    cleaning,
    freedMessage,
    errors,
    searchQuery,
    setSearchQuery,
    sortBy,
    sortOrder,
    showFirstConfirm,
    setShowFirstConfirm,
    showSecondConfirm,
    setShowSecondConfirm,
    progressState,
    performScan,
    handleToggleSelect,
    handleToggleSelectAll,
    handleClean,
    toggleSort,
    sortedTargets,
    totalScannedSize,
    totalSelectedSize,
    hasApplicationSupportSelected,
  } = useCacheCleaner();

  if (isSupported === false) {
    return <UnsupportedPlatform />;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-shell-surface text-sm relative">
      {/* View Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-shell-border p-4 bg-shell-surface/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-shell bg-shell-accent/10 text-shell-accent">
            <Trash2 size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-current">Cache Cleaner Dashboard</h2>
            <p className="text-xs text-current/50">Analyze and clean up developer dependencies and app support bloat.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => void performScan()} disabled={scanning || cleaning} variant="ghost" size="icon">
            <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
          </Button>
          <Button
            onClick={() => setShowFirstConfirm(true)}
            disabled={cleaning || scanning || selectedIds.size === 0}
            variant="accent"
            className="flex items-center gap-2 shadow-sm font-semibold animate-fade-in"
          >
            <Trash2 size={14} />
            Clean {formatBytes(totalSelectedSize)}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Banner Messages */}
        {freedMessage && (
          <div className="flex items-start gap-3 rounded-shell bg-green-500/10 border border-green-500/20 p-3 text-green-700 dark:text-green-400 animate-fade-in">
            <CheckCircle className="shrink-0 mt-0.5" size={16} />
            <div className="flex-1">
              <p className="font-semibold text-xs leading-none mb-1">Clean Complete</p>
              <p className="text-xs opacity-90">{freedMessage}</p>
            </div>
          </div>
        )}

        {hasApplicationSupportSelected && (
          <div className="flex items-start gap-3 rounded-shell bg-yellow-500/10 border border-yellow-500/20 p-3 text-yellow-700 dark:text-yellow-400 animate-fade-in">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-xs leading-none mb-1">Application Reset Warning</p>
              <p className="text-xs opacity-90">
                You have selected Application Data folders (e.g. Cursor, Claude). Cleaning these folders completely resets local settings, cache history, and active sessions for those apps.
              </p>
            </div>
          </div>
        )}

        {/* Space Overview Dashboard */}
        <SpaceDashboard
          scanning={scanning}
          totalScannedSize={totalScannedSize}
          totalSelectedSize={totalSelectedSize}
          selectedCount={selectedIds.size}
          totalCount={targets.length}
        />

        {/* Search Action Toolbar */}
        <div className="relative flex items-center rounded-shell">
          <Search size={16} className="absolute left-3 text-current/35 pointer-events-none z-10" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cache folders by name, path or description..."
            className="text-current border-shell-border w-full"
            style={{
              paddingLeft: '2.25rem',
              backgroundColor: 'var(--shell-sidebar)',
              color: 'currentColor',
            }}
          />
        </div>

        {/* Cache List */}
        <CacheTable
          scanning={scanning}
          sortedTargets={sortedTargets}
          selectedIds={selectedIds}
          errors={errors}
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleToggleSelect={handleToggleSelect}
          handleToggleSelectAll={handleToggleSelectAll}
          toggleSort={toggleSort}
        />
      </div>

      {/* Sticky Info Footer */}
      <div className="flex shrink-0 items-start gap-2 border-t border-shell-border bg-shell-sidebar p-3 text-xs text-current/50">
        <Info size={14} className="shrink-0 text-shell-accent mt-0.5" />
        <p className="leading-normal">
          Clearing caches removes temporary download and build files. Active packages in use by current projects may take slightly longer to fetch or build the next time they are run. System operations do not require administrator password since all targets reside within user boundaries.
        </p>
      </div>

      {/* Confirmation overlays */}
      <ConfirmDialogs
        activeShell={activeShell}
        showFirstConfirm={showFirstConfirm}
        setShowFirstConfirm={setShowFirstConfirm}
        showSecondConfirm={showSecondConfirm}
        setShowSecondConfirm={setShowSecondConfirm}
        selectedIds={selectedIds}
        totalSelectedSize={totalSelectedSize}
        targets={targets}
        hasApplicationSupportSelected={hasApplicationSupportSelected}
        handleClean={handleClean}
      />

      {/* Copy deletion progress overlay */}
      <ProgressDialog
        activeShell={activeShell}
        cleaning={cleaning}
        progressState={progressState}
      />
    </div>
  );
}
