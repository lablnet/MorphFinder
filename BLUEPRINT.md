# MorphFinder — Execution Blueprint

> Multi-platform file manager (macOS / Windows / Linux) with a runtime-switchable
> **Tri-UI shell engine**: Finder, Explorer, and Dolphin skins over one shared behavior core.

---

## 1. Architecture Decisions (locked before code)

| Concern | Decision | Why |
| --- | --- | --- |
| Bundler | **electron-vite** + electron-builder | One config for main/preload/renderer, renderer HMR, main-process hot restart; builder handles codesign/notarize. |
| UI kit | **`@lablnet/ui`** via `"file:../ui"` (dev) / `github:lablnet/ui` (CI) | `Sidebar`, `Tabs`, `Breadcrumb`, `Menubar`, `Table`, `TopBar`, `ScrollArea` map 1:1 onto file-manager chrome. |
| Tailwind | **v3.4.x** (match the UI lib) + import `@lablnet/ui/styles.css` | The lib is built on TW 3.4 tokens; mixing TW 4 in the app would fork the design tokens. |
| State | **Zustand v5**, slice pattern, `useShallow` selectors | One store, domain slices, zero unnecessary re-renders. |
| IPC | **Single typed `IpcContract`** in `src/shared/` | Channel names + payload types have exactly one source of truth; both processes derive from it. |
| Security | `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`, CSP, nav guards | Renderer never touches Node; everything crosses the typed preload bridge. |
| FS watching | **`@parcel/watcher`** in main (uses FSEvents/ReadDirectoryChangesW/inotify natively) | Cross-platform native watching without writing our own bindings for the baseline. |
| Swift module | **Node-API addon via `node-swift`**, *soft-loaded* with JS fallback | Reserved for what Node genuinely can't do: Finder tags, Spotlight metadata, QuickLook thumbnails, "Open With" enumeration. App must run fine without it. |
| Trash / reveal / open | Electron `shell.trashItem` / `showItemInFolder` / `openPath` | Already native and cross-platform — no custom code. |

---

## 2. Folder Architecture

```
MorphFinder/
├── package.json
├── electron.vite.config.ts
├── electron-builder.yml
├── tsconfig.json                    # project references → node + web
├── tsconfig.node.json               # main + preload (strict)
├── tsconfig.web.json                # renderer (strict)
├── tailwind.config.ts
├── postcss.config.js
├── .github/workflows/ci.yml         # lint + typecheck + unit + e2e matrix
│
├── native/                          # compiled separately from the TS tree
│   └── macos/
│       ├── Package.swift            # SwiftPM manifest (node-swift)
│       ├── Sources/MorphNative/
│       │   ├── MorphNative.swift    # NAPI module entry / exports
│       │   ├── FinderTags.swift     # NSURL resource values (tags, label colors)
│       │   ├── SpotlightMeta.swift  # NSMetadataItem attributes
│       │   ├── Thumbnails.swift     # QLThumbnailGenerator previews
│       │   └── OpenWith.swift       # NSWorkspace app enumeration
│       └── build.mjs                # compiles + copies .node into resources
│
├── src/
│   ├── shared/                      # imported by BOTH processes; zero Electron/DOM imports
│   │   ├── ipc/contract.ts          # IpcContract — the single IPC source of truth
│   │   ├── types/
│   │   │   ├── fileSystem.ts        # FileSystemNode, DirectoryListing, FileOperation
│   │   │   ├── tabs.ts              # TabMetadata, TabHistory
│   │   │   └── layout.ts            # UIShell, UIThemeMode, ViewMode
│   │   └── constants.ts
│   │
│   ├── main/                        # Electron main process
│   │   ├── index.ts                 # app lifecycle only — delegates everything
│   │   ├── security.ts              # CSP, navigation guards, permission handlers
│   │   ├── window/createMainWindow.ts   # per-OS chrome (hiddenInset vs titleBarOverlay)
│   │   ├── ipc/
│   │   │   ├── registerHandlers.ts  # binds IpcContract keys → services, fully typed
│   │   │   ├── fs.handlers.ts
│   │   │   ├── shell.handlers.ts    # openPath, trashItem, showItemInFolder
│   │   │   └── native.handlers.ts   # tags / metadata / thumbnails (Swift-backed)
│   │   └── services/
│   │       ├── fileSystemService.ts # readdir/stat/copy/move/rename via node:fs/promises
│   │       ├── watcherService.ts    # @parcel/watcher subscriptions → fs:changed pushes
│   │       └── nativeBridge.ts      # soft-requires the .node addon; JS fallback if absent
│   │
│   ├── preload/
│   │   └── index.ts                 # contextBridge.exposeInMainWorld('morph', typed api)
│   │
│   └── renderer/
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx              # providers + ShellLayout — nothing else
│           ├── pages/               # LOGICLESS — layout composition only
│           │   └── ExplorerPage.tsx
│           ├── layouts/             # ★ the Tri-UI shell engine
│           │   ├── types.ts         # ShellDefinition, ShellRegions, ShellTokens
│           │   ├── registry.ts      # Record<UIShell, ShellDefinition>
│           │   ├── ShellLayout.tsx  # single strategy consumer — no per-OS if/else
│           │   ├── finder/          # macOS: unified toolbar, sidebar, path bar, columns
│           │   ├── explorer/        # Win 11: command bar, address bar, details pane
│           │   └── dolphin/         # KDE: places panel, split view, terminal statusbar
│           ├── components/          # shell-agnostic behavior components
│           │   ├── files/           # FileGrid, FileListTable, FileColumnView, FileItem
│           │   ├── navigation/      # TabStrip, PathBreadcrumb, HistoryButtons
│           │   └── feedback/        # EmptyState, TransferProgress
│           ├── hooks/               # ★ ALL renderer logic lives here
│           │   ├── useFileSystem.ts
│           │   ├── useTabs.ts
│           │   ├── useLayoutShell.ts
│           │   ├── useSelection.ts
│           │   ├── useFileOperations.ts
│           │   ├── useContextMenu.ts
│           │   └── useKeyboardShortcuts.ts
│           ├── store/               # Zustand domain slices
│           │   ├── index.ts         # combine slices; persist(layout); devtools
│           │   ├── tabs.slice.ts
│           │   ├── fileSystem.slice.ts
│           │   ├── layout.slice.ts
│           │   └── selection.slice.ts
│           ├── services/ipc.ts      # window.morph wrapper — the only IPC touchpoint
│           └── styles/globals.css   # tailwind layers + @lablnet/ui/styles.css
│
└── tests/
    ├── unit/                        # vitest: hooks, slices, services
    └── e2e/                         # playwright _electron: launch + smoke flows
```

**The Tri-UI strategy in one paragraph:** every skin is a `ShellDefinition` — a set of
region components (`WindowChrome`, `Navigation`, `CommandArea`, `StatusBar`) plus a
`ShellTokens` object (density, radii, accent, font stack) published as CSS variables.
`ShellLayout` reads the active shell from the store, looks it up in `registry.ts`, and
composes the regions into a grid. Behavior components (`FileGrid`, `TabStrip`, …) are
shell-agnostic and restyle themselves purely from tokens — switching shells swaps
composition and tokens, never logic. Adding a fourth skin = one folder + one registry entry.

---

## 3. Execution Checklist

### Phase 0 — Foundation & Tooling
- [x] `pnpm init` + electron-vite scaffold (React + TS template), Electron latest stable
- [x] Strict TypeScript: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`; project references for node/web targets
- [x] ESLint (typescript-eslint strict) + Prettier; forbid `any` via `@typescript-eslint/no-explicit-any: error`
- [x] Tailwind 3.4 + PostCSS; import `@lablnet/ui/styles.css` in `globals.css`
- [x] Link `@lablnet/ui` via `"file:../ui"`; verify `Button` renders in the scaffold
- [x] Path aliases: `@shared/*`, `@renderer/*`, `@main/*` in tsconfig + electron-vite
- [x] CI workflow: lint → typecheck → unit tests on macOS/Windows/Linux runners
- [ ] First commit: booting empty window

### Phase 1 — Process Architecture & Security
- [x] `createMainWindow`: `titleBarStyle: 'hidden'` + `trafficLightPosition` (mac) / `titleBarOverlay` (win/linux) so all three skins can draw their own chrome
- [x] Harden: `contextIsolation`, `sandbox`, `nodeIntegration: false`, CSP header, `will-navigate` / `setWindowOpenHandler` guards
- [x] Define `IpcContract` in `src/shared/ipc/contract.ts`
- [x] Preload bridge: generic typed `invoke` + `on` derived from the contract, exposed as `window.morph`
- [x] `registerHandlers.ts`: compile-time exhaustive mapping of contract keys → service calls
- [x] Renderer `services/ipc.ts` wrapper + `window.d.ts` global typing

### Phase 2 — Shared Types & Store Core
- [x] `FileSystemNode`, `DirectoryListing`, `TabMetadata`, `UIShell`, `UIThemeMode`, `ViewMode`
- [x] Store scaffold: slice pattern with cross-slice `StateCreator` typing
- [x] `layout.slice.ts` with `persist` middleware (shell + theme + view prefs survive restarts)
- [x] `tabs.slice.ts`, `fileSystem.slice.ts`, `selection.slice.ts`
- [x] Unit tests for every slice action (vitest, no DOM needed)

### Phase 3 — File System Domain
- [x] `fileSystemService`: `readDirectory` (batched `Dirent` + `stat`, partial-failure tolerant), `rename`, `createFolder`
- [x] `watcherService`: one `@parcel/watcher` subscription per unique open directory, refcounted by tabs; debounced `fs:changed` pushes
- [x] Hidden-file rules per platform (dotfiles vs `FILE_ATTRIBUTE_HIDDEN`)
- [x] `useFileSystem` hook: load-on-navigate, live refresh on `fs:changed`, error surface
- [x] Home/Desktop/Documents/Downloads well-known paths via `app.getPath`

### Phase 4 — Tabs
- [x] `useTabs` hook: open/close/activate/reorder, per-tab back-forward history
- [x] `TabStrip` behavior component (middle-click close, drag reorder) skinned per shell
- [x] Keyboard: Cmd/Ctrl+T, Cmd/Ctrl+W, Ctrl+Tab cycling
- [x] Session restore: persist open tabs, rehydrate on launch

### Phase 5 — Tri-UI Shell Engine ★
- [x] `ShellDefinition` / `ShellRegions` / `ShellTokens` types + `registry.ts`
- [x] `ShellLayout` grid composer + token → CSS-variable publisher
- [x] **Finder shell** (reference implementation): sidebar favorites, unified toolbar, path bar, status bar
- [x] **Explorer shell**: command bar, address bar + breadcrumb, navigation pane, details pane
- [x] **Dolphin shell**: places panel, split-view toggle, information statusbar
- [x] `useLayoutShell` hook: switch shell at runtime, default to `process.platform` mapping on first launch
- [x] Shell switcher UI (menubar entry + Cmd/Ctrl+Shift+U cycle)

### Phase 6 — File Views
- [x] `FileGrid` (icons view) — virtualized from day one
- [x] `FileListTable` (details view) — sortable columns via `@lablnet/ui` Table
- [x] `FileColumnView` (Miller columns, Finder-style)
- [x] Per-tab `ViewMode` with per-shell default (`icons` on Finder, `list` on Explorer/Dolphin)
- [x] File-type icon mapping (lucide baseline; native thumbnails later)

### Phase 7 — Interactions
- [x] `useSelection`: click / Cmd-click / Shift-range / marquee, keyboard navigation
- [x] `useFileOperations`: copy/cut/paste, move, trash (with progress events for bulk ops)
- [x] Inline rename (F2 / Enter-on-mac semantics per shell)
- [x] Context menus (per-shell styling, shared action model)
- [x] Drag & drop: internal moves + external `startDrag` out of the app
- [x] `useKeyboardShortcuts`: platform-aware accelerator map

### Phase 8 — Native macOS Module (Swift)
- [x] SwiftPM package with node-swift; `build.mjs` producing `MorphNative.node`
- [x] `nativeBridge.ts` soft-loader — feature flags for tags/metadata/thumbnails, JS fallbacks
- [x] Finder tags read/write; Spotlight metadata; QuickLook thumbnail generation; "Open With" list
- [x] electron-builder `extraResources` wiring + darwin-only build step in CI

### Phase 9 — Performance & Polish
- [x] Virtualized rendering audit for 50k+ entry directories
- [x] Thumbnail LRU cache (main process, capped)
- [x] Light/dark/system theming across all three shells
- [x] Empty states, permission-denied states, ejected-volume handling

### Phase 10 — Packaging & Release
- [ ] electron-builder targets: dmg/zip (mac universal), nsis (win), AppImage/deb (linux)
- [ ] macOS hardened runtime + notarization; Windows signing
- [ ] Auto-update (electron-updater) + GitHub Releases pipeline
- [x] Playwright smoke suite gating release CI

---

## 4. Boilerplate Reference

Canonical examples live in this order: shared types → IPC contract → store slice →
hook → logicless page. See the project README section "Architecture" once scaffolded.
(Full code for each is in the initial blueprint discussion / will land in Phase 1–2 PRs.)

## 5. Risks & Notes

- **`@lablnet/ui` via GitHub**: the package publishes only `dist/`. Installing from
  `github:lablnet/ui` requires either committing `dist/` or adding a `prepare` script
  to the lib. Until then, `file:../ui` locally and a tarball/registry publish for CI.
- **lucide-react**: the lib depends on `^0.475`; the app should match the major to avoid
  bundling two icon sets.
- **Tailwind 4**: do not upgrade the app ahead of the UI lib — token pipeline differs.
- **node-swift**: pin its version; NAPI ABI must match the Electron Node version, so the
  addon rebuilds via `electron-rebuild`-style flow in `build.mjs`.
