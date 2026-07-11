import React from 'react';
import { Trash2, Layers } from 'lucide-react';

export function UnsupportedPlatform(): React.JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 bg-shell-surface text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-shell-accent to-purple-600 opacity-30 blur-md"></div>
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-shell-sidebar border border-shell-border text-current/80">
          <Trash2 size={30} className="animate-pulse" />
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-2 tracking-tight text-current">Cache Cleaner</h2>
      <p className="text-current/60 max-w-md mb-6 leading-relaxed">
        Storage scanning and automated cleaning is currently available on macOS to clean pnpm, npm, Gradle, and Apple Application Support caches.
      </p>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-shell-accent/10 text-shell-accent border border-shell-accent/25">
        <Layers size={12} />
        Windows & Linux Support Coming Soon
      </span>
    </div>
  );
}
