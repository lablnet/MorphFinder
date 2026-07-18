import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  HardDrive, 
  Copy, 
  History, 
  Trash2, 
  GitBranch, 
  Terminal, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Command, 
  X,
  Compass,
  Zap,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { BaseDialog } from '@renderer/components/ui/BaseDialog';
import { Button } from '@renderer/components/ui/Button';
import { useAppStore } from '@renderer/store';
import { ShellId } from '@shared/types';
import { cn } from '@lablnet/ui';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps): React.JSX.Element | null {
  const [step, setStep] = useState<number>(0);
  const activeShell = useAppStore((state) => state.activeShell);
  const setShell = useAppStore((state) => state.setShell);

  if (!isOpen) return null;

  const totalSteps = 4;

  const handleNext = (): void => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = (): void => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const shellPresets: { id: ShellId; name: string; desc: string; icon: string }[] = [
    {
      id: 'finder',
      name: 'macOS Finder Shell',
      desc: 'Unified macOS toolbar with Miller columns, Spotlight metadata, and QuickLook previews.',
      icon: '🍏',
    },
    {
      id: 'explorer',
      name: 'Windows 11 Explorer Shell',
      desc: 'Fluent command bar, instant breadcrumb navigation, and details pane inspector.',
      icon: '🪟',
    },
    {
      id: 'dolphin',
      name: 'KDE Dolphin Shell',
      desc: 'KDE split-view workspace, places panel, and terminal status engine.',
      icon: '🐧',
    },
  ];

  const features = [
    {
      icon: <HardDrive className="text-blue-500" size={20} />,
      title: 'Enterprise Space Analyzer',
      desc: 'Multi-view disk visualization (Treemap, Donut, Inspector) with sub-second directory parsing.',
    },
    {
      icon: <Copy className="text-amber-500" size={20} />,
      title: 'AI-Powered Duplicate Finder',
      desc: 'SHA-256 deep content hashing to safely detect and eliminate byte-for-byte duplicate clutter.',
    },
    {
      icon: <History className="text-purple-500" size={20} />,
      title: 'Time Machine File Stream',
      desc: 'Real-time file mutation timeline integrated directly with local Git commit logs.',
    },
    {
      icon: <Trash2 className="text-emerald-500" size={20} />,
      title: 'Smart Cache Purger',
      desc: 'Auto-detect and wipe bloated npm, Yarn, Gradle, Homebrew, and system build caches.',
    },
    {
      icon: <GitBranch className="text-rose-500" size={20} />,
      title: 'Git Radar Console',
      desc: 'Live branch health tracking, dirty state indicators, staged diff previews, and commit drawer.',
    },
    {
      icon: <Terminal className="text-cyan-500" size={20} />,
      title: 'Developer Control Suite',
      desc: 'Automated project stack detector, script launcher, package inspector, and node-pty terminal.',
    },
  ];

  const enterpriseHighlights = [
    {
      icon: <Crown className="text-amber-400 shrink-0" size={18} />,
      title: '100% Free & Unlocked Pro Suite',
      desc: 'Zero subscriptions, no feature gates, and no paywalls. All enterprise features are unlocked out of the box.',
    },
    {
      icon: <Zap className="text-blue-400 shrink-0" size={18} />,
      title: 'Blazing Fast Native Core',
      desc: 'Powered by real-time event-driven file monitoring and native OS kernel integrations.',
    },
    {
      icon: <ShieldCheck className="text-emerald-400 shrink-0" size={18} />,
      title: 'Zero Data Collection & Air-Gapped Security',
      desc: 'Your files never leave your machine. Strict CSP isolation with 100% offline local privacy guarantee.',
    },
  ];

  const shortcuts = [
    { key: 'Cmd / Ctrl + K', desc: 'Open Command Palette' },
    { key: 'Cmd / Ctrl + Shift + F', desc: 'Cycle Shell Theme Engine' },
    { key: 'Ctrl + `', desc: 'Toggle Embedded Terminal' },
    { key: 'Space', desc: 'QuickLook File Preview' },
  ];

  return (
    <BaseDialog activeShell={activeShell} size="lg" onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-shell-border">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-shell-accent/15 text-shell-accent">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold leading-tight">Welcome to MorphFinder</h2>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-500/15 text-amber-500 border border-amber-500/30">
                PRO UNLOCKED
              </span>
            </div>
            <p className="text-xs text-current/60">Step {step + 1} of {totalSteps}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-current/50 hover:bg-shell-surface/80 hover:text-current transition-colors"
          title="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content Step Body */}
      <div className="py-6 min-h-[320px] flex flex-col justify-center">
        {step === 0 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <Compass className="text-shell-accent" size={20} />
                Tri-UI Runtime Shell Engine
              </h3>
              <p className="text-xs text-current/65 max-w-md mx-auto">
                Switch instantly between 3 world-class file manager paradigms without restarting or losing your active tab session!
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-2">
              {shellPresets.map((preset) => {
                const isSelected = activeShell === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setShell(preset.id)}
                    className={cn(
                      'flex items-start gap-3 p-3 text-left rounded-xl border transition-all cursor-pointer',
                      isSelected
                        ? 'border-shell-accent bg-shell-accent/10 shadow-sm'
                        : 'border-shell-border bg-shell-surface/40 hover:bg-shell-surface/80'
                    )}
                  >
                    <span className="text-2xl select-none">{preset.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{preset.name}</span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-xs text-shell-accent font-semibold">
                            <Check size={14} /> Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-current/60 mt-0.5">{preset.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <Layers className="text-shell-accent" size={20} />
                Next-Gen Power Suite
              </h3>
              <p className="text-xs text-current/65 max-w-md mx-auto">
                Everything you need for enterprise storage management, codebase navigation, and system maintenance.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg border border-shell-border bg-shell-surface/30"
                >
                  <div className="p-1.5 rounded-md bg-shell-surface shrink-0 shadow-xs">
                    {feat.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold">{feat.title}</h4>
                    <p className="text-[11px] text-current/60 leading-tight mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <Crown className="text-amber-400" size={20} />
                Enterprise Suite — 100% Unlocked
              </h3>
              <p className="text-xs text-current/65 max-w-md mx-auto">
                Enjoy full enterprise power for free with complete privacy and native execution speed.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {enterpriseHighlights.map((eh, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl border border-shell-border bg-shell-surface/40"
                >
                  <div className="p-2 rounded-lg bg-shell-surface shadow-xs">
                    {eh.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-current">{eh.title}</h4>
                    <p className="text-xs text-current/65 leading-relaxed mt-0.5">{eh.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <Command className="text-shell-accent" size={20} />
                Keyboard Shortcuts & Pro Tips
              </h3>
              <p className="text-xs text-current/65 max-w-md mx-auto">
                Navigate rapidly like a senior engineer with keyboard accelerators.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {shortcuts.map((sc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-shell-border bg-shell-surface/30"
                >
                  <span className="text-xs text-current/80 font-medium">{sc.desc}</span>
                  <kbd className="px-2 py-1 text-xs font-mono rounded bg-shell-surface border border-shell-border text-shell-accent font-semibold shadow-xs">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-shell-border">
        {/* Step Indicators */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-200',
                i === step ? 'w-5 bg-shell-accent' : 'w-1.5 bg-current/20'
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {step > 0 && (
            <Button onClick={handlePrev} variant="outline" size="sm">
              <ChevronLeft size={16} className="mr-1" /> Back
            </Button>
          )}
          <Button onClick={handleNext} variant="accent" size="sm">
            {step === totalSteps - 1 ? (
              'Launch Workspace'
            ) : (
              <>
                Next <ChevronRight size={16} className="ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}
