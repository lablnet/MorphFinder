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
  webContents.on('will-navigate', (event, url) => {
    const isAllowed = [...ALLOWED_NAVIGATION_ORIGINS].some((origin) => url.startsWith(origin));
    if (!isAllowed) event.preventDefault();
  });

  webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
}
