import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { useAppStore } from '@renderer/store';
import 'xterm/css/xterm.css';

interface TerminalContainerProps {
  output: string;
  onData: (data: string) => void;
  onResize: (cols: number, rows: number) => void;
}

const darkTheme = {
  background: '#1e1e2e',
  foreground: '#f1f1f1',
  cursor: 'rgba(255, 255, 255, 0.5)',
  selectionBackground: 'rgba(255, 255, 255, 0.15)',
};

const lightTheme = {
  background: '#eff1f5',
  foreground: '#313244',
  cursor: 'rgba(0, 0, 0, 0.4)',
  selectionBackground: 'rgba(0, 0, 0, 0.1)',
};

export function TerminalContainer({
  output,
  onData,
  onResize,
}: TerminalContainerProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const lastOutputLengthRef = useRef(0);
  const commandBufferRef = useRef('');
  const themeMode = useAppStore((state) => state.themeMode);
  const activeShell = useAppStore((state) => state.activeShell);
  const isDark = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    if (containerRef.current === null || terminalRef.current !== null) return;

    const term = new Terminal({
      cols: 120,
      rows: 28,
      cursorBlink: true,
      convertEol: true,
      fontSize: activeShell === 'finder' ? 12 : 13,
      fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
      theme: isDark ? darkTheme : lightTheme,
    });

    term.open(containerRef.current);
    term.write('Welcome to MorphFinder Terminal\r\n\r\n$ ');
    terminalRef.current = term;
    onResize(term.cols, term.rows);
    term.focus();

    const dataDisposable = term.onData((data) => {
      const code = data.charCodeAt(0);
      if (data === '\r') {
        const command = commandBufferRef.current.trimEnd();
        commandBufferRef.current = '';
        term.write('\r\n');
        if (command.length > 0) onData(`${command}\n`);
        window.setTimeout(() => {
          if (terminalRef.current !== null) terminalRef.current.write('$ ');
        }, 30);
        return;
      }
      if (data === '\u007F') {
        if (commandBufferRef.current.length === 0) return;
        commandBufferRef.current = commandBufferRef.current.slice(0, -1);
        term.write('\b \b');
        return;
      }
      if (code < 32) return;
      commandBufferRef.current += data;
      term.write(data);
    });

    return () => {
      dataDisposable.dispose();
      terminalRef.current = null;
      term.dispose();
    };
  }, [activeShell, isDark, onData, onResize]);

  useEffect(() => {
    const term = terminalRef.current;
    if (term === null) return;
    if (output.length < lastOutputLengthRef.current) {
      term.clear();
      lastOutputLengthRef.current = 0;
    }
    const nextChunk = output.slice(lastOutputLengthRef.current);
    if (nextChunk.length > 0) {
      term.write(nextChunk.replace(/\n/g, '\r\n'));
      lastOutputLengthRef.current = output.length;
    }
  }, [output]);

  useEffect(() => {
    if (terminalRef.current === null) return;
    terminalRef.current.options.theme = isDark ? darkTheme : lightTheme;
  }, [isDark]);

  return (
    <div className={`terminal-container h-full min-h-0 w-full overflow-hidden ${isDark ? 'bg-[#1e1e2e]' : 'bg-[#eff1f5]'}`}>
      <div ref={containerRef} className="h-full w-full p-2" />
    </div>
  );
}
