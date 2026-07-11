import type { Config } from 'tailwindcss';

/**
 * Content globs include ../ui/src so shell tokens (see layouts/<shell>/tokens.ts)
 * and any Tailwind classes used inside the linked @lablnet/ui source are not purged.
 */
export default {
  darkMode: 'class',
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{ts,tsx}',
    '../ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        shell: {
          accent: 'var(--shell-accent)',
          surface: 'var(--shell-surface)',
          sidebar: 'var(--shell-sidebar)',
          border: 'var(--shell-border)',
        },
      },
      fontFamily: {
        shell: 'var(--shell-font)',
      },
      borderRadius: {
        shell: 'var(--shell-radius)',
      },
      spacing: {
        'row-shell': 'var(--shell-row-height)',
      },
    },
  },
  plugins: [],
} satisfies Config;
