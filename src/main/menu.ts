import { app, Menu, BrowserWindow } from 'electron';
import type { MenuItemConstructorOptions } from 'electron';

export function setupApplicationMenu(): void {
  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    // { role: 'appMenu' }
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Go to Folder...',
          accelerator: 'CmdOrCtrl+Shift+G',
          click: (_menuItem, browserWindow) => {
            if (browserWindow && browserWindow instanceof BrowserWindow) {
              browserWindow.webContents.send('command-palette:toggle');
            }
          },
        },
        { type: 'separator' as const },
        isMac ? { role: 'close' as const } : { role: 'quit' as const },
      ],
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' as const },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' as const },
              { role: 'delete' as const },
              { role: 'selectAll' as const },
              { type: 'separator' as const },
              {
                label: 'Speech',
                submenu: [{ role: 'startSpeaking' as const }, { role: 'stopSpeaking' as const }],
              },
            ]
          : [{ role: 'delete' as const }, { type: 'separator' as const }, { role: 'selectAll' as const }]),
      ],
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'reload' as const },
        { role: 'forceReload' as const },
        { role: 'toggleDevTools' as const },
        { type: 'separator' as const },
        { role: 'resetZoom' as const },
        { role: 'zoomIn' as const },
        { role: 'zoomOut' as const },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const },
        { type: 'separator' as const },
        {
          label: 'Toggle Command Palette',
          accelerator: 'CmdOrCtrl+K',
          click: (_menuItem, browserWindow) => {
            if (browserWindow && browserWindow instanceof BrowserWindow) {
              browserWindow.webContents.send('command-palette:toggle');
            }
          },
        },
      ],
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' as const },
        { role: 'zoom' as const },
        ...(isMac
          ? [{ type: 'separator' as const }, { role: 'front' as const }, { type: 'separator' as const }, { role: 'window' as const }]
          : [{ role: 'close' as const }]),
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { shell } = await import('electron');
            await shell.openExternal('https://morphfinder.lablnet.com/');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  if (isMac && app.dock) {
    const dockMenu = Menu.buildFromTemplate([
      {
        label: 'Go to Folder...',
        click: () => {
          const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
          if (win) {
            if (win.isMinimized()) win.restore();
            win.show();
            win.focus();
            win.webContents.send('command-palette:toggle');
          }
        },
      },
    ]);
    app.dock.setMenu(dockMenu);
  }
}
