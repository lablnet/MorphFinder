import { useEffect, useRef, useState } from 'react';
import { ipc } from '@renderer/services/ipc';
import type { editor } from 'monaco-editor';

/** Map file extensions to Monaco language IDs. */
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  ts: 'typescript', tsx: 'typescript', mts: 'typescript', cts: 'typescript',
  js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
  py: 'python', rb: 'ruby', rs: 'rust', go: 'go',
  java: 'java', kt: 'kotlin', kts: 'kotlin', scala: 'scala',
  c: 'c', h: 'c', cpp: 'cpp', hpp: 'cpp', cc: 'cpp', cxx: 'cpp', cs: 'csharp',
  swift: 'swift', dart: 'dart', lua: 'lua', r: 'r', pl: 'perl', php: 'php',
  sh: 'shell', bash: 'shell', zsh: 'shell', bat: 'bat', ps1: 'powershell',
  html: 'html', htm: 'html',
  css: 'css', scss: 'scss', sass: 'scss', less: 'less',
  json: 'json', jsonc: 'json', json5: 'json',
  yaml: 'yaml', yml: 'yaml', toml: 'ini', ini: 'ini',
  xml: 'xml', xsl: 'xml', xslt: 'xml', xsd: 'xml', svg: 'xml',
  sql: 'sql', graphql: 'graphql',
  dockerfile: 'dockerfile', makefile: 'plaintext',
  vue: 'html', svelte: 'html', astro: 'html',
  md: 'markdown', mdx: 'markdown', markdown: 'markdown',
  diff: 'plaintext', patch: 'plaintext',
  ex: 'plaintext', exs: 'plaintext', erl: 'plaintext',
  hs: 'plaintext', elm: 'plaintext', clj: 'clojure',
  zig: 'plaintext', nim: 'plaintext',
};

function languageForExtension(ext: string): string {
  return EXTENSION_TO_LANGUAGE[ext.toLowerCase()] ?? 'plaintext';
}

interface UseCodeViewerOptions {
  filePath: string;
  extension: string;
}

export function useCodeViewer({ filePath, extension }: UseCodeViewerOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    let disposed = false;

    async function initEditor(): Promise<void> {
      try {
        const [monaco, fileContent] = await Promise.all([
          import('monaco-editor'),
          ipc.invoke('fs:readFile', { path: filePath }),
        ]);

        if (disposed || containerRef.current === null) return;

        if (fileContent.encoding !== 'utf-8') {
          setError('This file appears to be binary and cannot be displayed as code.');
          setIsLoading(false);
          return;
        }

        setTruncated(fileContent.truncated);

        // Determine theme based on current document's color scheme
        const isDark = document.documentElement.classList.contains('dark');
        const theme = isDark ? 'vs-dark' : 'vs';

        const editor = monaco.editor.create(containerRef.current, {
          value: fileContent.content,
          language: languageForExtension(extension),
          theme,
          readOnly: true,
          minimap: { enabled: true },
          lineNumbers: 'on',
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          fontSize: 13,
          fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', Menlo, monospace",
          padding: { top: 12 },
          automaticLayout: true,
          renderLineHighlight: 'none',
          domReadOnly: true,
          contextmenu: false,
        });

        editorRef.current = editor;
        setIsLoading(false);
      } catch (cause) {
        if (!disposed) {
          setError(cause instanceof Error ? cause.message : String(cause));
          setIsLoading(false);
        }
      }
    }

    void initEditor();

    return () => {
      disposed = true;
      editorRef.current?.dispose();
      editorRef.current = null;
    };
  }, [filePath, extension]);

  // React to theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      import('monaco-editor').then((monaco) => {
        monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
      }).catch(() => { /* ignore */ });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return {
    containerRef,
    isLoading,
    error,
    truncated,
  };
}
