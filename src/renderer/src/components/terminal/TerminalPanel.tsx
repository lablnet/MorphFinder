import React, { useState } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { cn } from '@lablnet/ui';
import { useTerminal } from '../../hooks/ui/useTerminal';
import { TerminalContainer } from './components/TerminalContainer';
import { Button } from '../ui/Button';

export function TerminalPanel(): React.JSX.Element | null {
  const {
    isOpen,
    height,
    output,
    setHeight,
    setOpen,
    writeData,
    resizeSession,
    restart,
  } = useTerminal();

  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return; // Disable resizing when maximized
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY - moveEvent.clientY;
      setHeight(startHeight + deltaY);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleToggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <div
      style={{ height: isMaximized ? 'calc(100vh - 40px)' : `${height}px` }}
      className={cn(
        'w-full flex flex-col border-t border-shell-border bg-shell-surface/85 backdrop-blur-md text-current overflow-hidden z-40 transition-[height] duration-150 relative shadow-[0_-8px_30px_rgb(0,0,0,0.12)]',
        isMaximized && 'rounded-t-lg'
      )}
    >
      {/* Drag handle for resizing */}
      {!isMaximized && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-shell-accent/40 select-none z-50 transition-colors"
          title="Drag to resize console"
        />
      )}

      {/* Header bar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-shell-border/60 px-4 bg-shell-sidebar/20 select-none">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-shell-accent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-current/70">
            Console Shell
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Restart shell */}
          <Button
            onClick={() => void restart()}
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded hover:bg-shell-sidebar"
            title="Restart Shell Session"
          >
            <RotateCcw size={12} className="text-current/60 hover:text-current" />
          </Button>

          {/* Maximize toggle */}
          <Button
            onClick={handleToggleMaximize}
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded hover:bg-shell-sidebar"
            title={isMaximized ? 'Restore Terminal Size' : 'Maximize Terminal'}
          >
            {isMaximized ? (
              <Minimize2 size={12} className="text-current/60 hover:text-current" />
            ) : (
              <Maximize2 size={12} className="text-current/60 hover:text-current" />
            )}
          </Button>

          {/* Close terminal */}
          <Button
            onClick={() => setOpen(false)}
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded hover:bg-shell-sidebar"
            title="Close Console"
          >
            <X size={12} className="text-current/60 hover:text-current" />
          </Button>
        </div>
      </div>

      {/* Actual terminal renderer */}
      <div className="flex-1 min-h-0 w-full flex flex-col bg-shell-surface/40">
        <TerminalContainer
          output={output}
          onData={writeData}
          onResize={resizeSession}
        />
      </div>
    </div>
  );
}
