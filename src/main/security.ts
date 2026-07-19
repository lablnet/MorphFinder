import { session, type WebContents } from 'electron';

/** electron-vite serves the renderer from this dev-server origin in `pnpm dev`;
 *  packaged builds only ever load `file://`. Both are legitimate app origins. */
const devServerUrl = process.env.ELECTRON_RENDERER_URL;
const ALLOWED_NAVIGATION_ORIGINS = new Set<string>(
  devServerUrl !== undefined ? ['file://', devServerUrl] : ['file://'],
);

/** Locks down the default session CSP; renderer only ever loads local build output (or the dev server). */
export function applyContentSecurityPolicy(): void {
  const connectSrc = devServerUrl !== undefined ? `'self' ${devServerUrl} ws://localhost:*` : "'self'";
  const scriptSrc = devServerUrl !== undefined ? "'self' 'unsafe-inline'" : "'self'";
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          [
            `default-src 'self'`,
            `script-src ${scriptSrc}`,
            `style-src 'self' 'unsafe-inline'`,
            `img-src 'self' data: morph-file: blob:`,
            `media-src 'self' morph-file: blob:`,
            `frame-src 'self' morph-file: blob:`,
            `object-src 'self' morph-file: blob:`,
            `connect-src ${connectSrc}`,
            `worker-src 'self' blob:`,
          ].join('; ') + ';',
        ],
      },
    });
  });
}

/** Blocks navigation away from the packaged app and forces external links out to the OS browser. */
export function guardNavigation(webContents: WebContents): void {
  webContents.on('before-input-event', (event, input) => {
    // Disable DevTools keyboard shortcuts: F12, CmdOrCtrl+Shift+I, CmdOrCtrl+Shift+J, CmdOrCtrl+Shift+C, CmdOrCtrl+Option+I
    const isDevToolsShortcut =
      input.key === 'F12' ||
      ((input.control || input.meta) &&
        input.shift &&
        ['I', 'i', 'J', 'j', 'C', 'c'].includes(input.key)) ||
      ((input.control || input.meta) &&
        input.alt &&
        ['I', 'i'].includes(input.key));

    if (isDevToolsShortcut) {
      event.preventDefault();
    }
  });

  webContents.on('will-navigate', (event, url) => {
    const isAllowed = [...ALLOWED_NAVIGATION_ORIGINS].some((origin) => url.startsWith(origin));
    if (!isAllowed) event.preventDefault();
  });

  webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
}

const FORBIDDEN_PATH_PATTERNS = [
  /\/\.ssh(\/|$)/i,
  /\/\.aws(\/|$)/i,
  /\/\.gnupg(\/|$)/i,
  /\/\.env(\.|$)/i,
  /^(?:\/etc\/|\/proc\/|\/sys\/|\/dev\/)/i,
  /^[a-z]:\/windows\/(?:system32|syswow64)/i,
];

const FORBIDDEN_FILENAMES = new Set([
  '.env',
  '.env.local',
  '.env.production',
  'id_rsa',
  'id_ed25519',
  'shadow',
  'passwd',
]);

const FORBIDDEN_EXTENSIONS = new Set([
  '.exe',
  '.dll',
  '.dylib',
  '.so',
  '.pem',
  '.key',
  '.p12',
  '.crt',
  '.cer',
  '.pfx',
]);

/** Validates whether a file path is safe to be served via morph-file:// protocol. */
export function isSafeMorphFilePath(filePath: string): boolean {
  if (!filePath || typeof filePath !== 'string') return false;
  const normalized = filePath.replace(/\\/g, '/');

  for (const pattern of FORBIDDEN_PATH_PATTERNS) {
    if (pattern.test(normalized)) return false;
  }

  const parts = normalized.split('/');
  const fileName = parts[parts.length - 1] ?? '';
  if (FORBIDDEN_FILENAMES.has(fileName.toLowerCase())) return false;

  const extIndex = fileName.lastIndexOf('.');
  if (extIndex !== -1) {
    const ext = fileName.slice(extIndex).toLowerCase();
    if (FORBIDDEN_EXTENSIONS.has(ext)) return false;
  }

  return true;
}

