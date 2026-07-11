import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { useAppStore } from '@renderer/store';
import 'xterm/css/xterm.css';

interface TerminalContainerProps {
  onXtermInstance: (term: Terminal | null) => void;
  onData: (data: string) => void;
  onResize: (cols: number, rows: number) => void;
}

const darkTheme = {
  background: '#1e1e2e',
  foreground: '#f1f1f1',
  cursor: 'rgba(255, 255, 255, 0.5)',
  cursorAccent: '#1e1e2e',
  selectionBackground: 'rgba(255, 255, 255, 0.15)',
  black: '#1e1e2e',
  red: '#f38ba8',
  green: '#a6e3a1',
  yellow: '#f9e2af',
  blue: '#89b4fa',
  magenta: '#cba6f7',
  cyan: '#89dceb',
  white: '#cdd6f4',
  brightBlack: '#585b70',
  brightRed: '#f38ba8',
  brightGreen: '#a6e3a1',
  brightYellow: '#f9e2af',
  brightBlue: '#89b4fa',
  brightMagenta: '#cba6f7',
  brightCyan: '#89dceb',
  brightWhite: '#a6adc8',
};

const lightTheme = {
  background: '#eff1f5',
  foreground: '#313244',
  cursor: 'rgba(0, 0, 0, 0.4)',
  cursorAccent: '#eff1f5',
  selectionBackground: 'rgba(0, 0, 0, 0.1)',
  black: '#4c4f69',
  red: '#d20f39',
  green: '#40a02b',
  yellow: '#df8e1d',
  blue: '#1e66f5',
  magenta: '#8839ef',
  cyan: '#179287',
  white: '#eff1f5',
  brightBlack: '#6c6f85',
  brightRed: '#d20f39',
  brightGreen: '#40a02b',
  brightYellow: '#df8e1d',
  brightBlue: '#1e66f5',
  brightMagenta: '#8839ef',
  brightCyan: '#179287',
  brightWhite: '#ccd0da',
};

export function TerminalContainer({
  onXtermInstance,
  onData,
  onResize,
}: TerminalContainerProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const themeMode = useAppStore((state) => state.themeMode);
  const activeShell = useAppStore((state) => state.activeShell);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Initialize terminal
  useEffect(() => {
    if (!containerRef.current) return;

    const theme = isDark ? darkTheme : lightTheme;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: activeShell === 'finder' ? 12 : 13,
      fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
      theme,
      allowProposedApi: true,
      windowOptions: {
        fullscreenWin: true,
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(containerRef.current);
    fitAddon.fit();

    terminalRef.current = term;
    fitAddonRef.current = fitAddon;
    onXtermInstance(term);

    // Initial message
    term.write('\x1b[1;32mWelcome to MorphFinder Terminal\x1b[0m\r\n');
    term.write('Type commands to run them here. Synchronizes with file explorer.\r\n\r\n');

    // Keystroke bindings
    term.onData((data) => {
      onData(data);
    });

    // Resize bindings
    term.onResize(({ cols, rows }) => {
      onResize(cols, rows);
    });

    // Trigger initial resize sync
    onResize(term.cols, term.rows);

    // Resize listener
    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
        onResize(term.cols, term.rows);
      } catch (e) {
        // Safe catch for detached resizing
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      term.dispose();
      onXtermInstance(null);
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, [activeShell, onXtermInstance, isDark]);

  // Sync theme when app theme state changes
  useEffect(() => {
    if (!terminalRef.current) return;
    terminalRef.current.options.theme = isDark ? darkTheme : lightTheme;
  }, [isDark]);

  return (
    <div className={`w-full h-full min-h-0 flex-1 relative overflow-hidden ${isDark ? 'bg-[#1e1e2e]' : 'bg-[#eff1f5]'}`}>
      <div ref={containerRef} className="absolute inset-0 p-2" />
    </div>
  );
}

