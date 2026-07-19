# MorphFinder Project Context & Antigravity Instructions

This file serves as the project context and agent operating guidelines for **MorphFinder** when using **Antigravity**.

---

## 1. Project Summary

**MorphFinder** is a cross-platform (macOS / Windows / Linux) file manager featuring a runtime-switchable **Tri-UI shell engine** (Finder, Explorer, Dolphin) powered by a single shared behavior core.

### Core Stack
- **Desktop Runtime**: Electron `v39.8.x` (main process + isolated renderer process)
- **Bundler & Build Tooling**: `electron-vite` v5 with Vite 6 & `electron-builder` v26
- **Frontend Framework**: React `v19.2.x`, TypeScript `v5.7.x`
- **State Management**: Zustand `v5.0.x` (slice pattern with `useShallow` selectors)
- **Styling & UI**: `@lablnet/ui` (`v1.0.1`), TailwindCSS `v3.4.17` (matching design tokens)
- **File System Watching**: `@parcel/watcher` (`v2.5.1`) in main process
- **Native macOS Extension**: Node-API addon via `node-swift` (soft-loaded with pure JS fallbacks)
- **Testing**: Vitest (`v3.0.x`), Playwright (`v1.61.x`)

---

## 2. Architectural Blueprint & Conventions

### Process Isolation & Security
- Main process handles OS integration, Node `fs` / `promises`, watcher management, and Swift native bridge.
- Preload process exposes typed `window.morph` API using `contextBridge.exposeInMainWorld`.
- Renderer process runs with `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`. Zero Node.js or DOM-level OS calls in renderer.

### IPC Communication
- **Single Source of Truth**: All IPC channels, request parameters, and response structures are defined in `src/shared/ipc/contract.ts` via `IpcContract`.
- Both `src/main/ipc/registerHandlers.ts` and `src/preload/index.ts` strictly enforce `IpcContract` types. Never invent ad-hoc string channel names or untyped IPC calls.

### Tri-UI Shell Layout Engine
- Layout views are located in `src/renderer/src/layouts/`:
  - `finder/`: macOS-style unified toolbar, sidebar, path bar, and column views.
  - `explorer/`: Windows 11-style command bar, address bar, and details pane.
  - `dolphin/`: KDE Dolphin-style places panel, split view, and terminal status bar.
- Logic strategy: Pages in `src/renderer/src/pages/` are **logicless** layout compositions. All domain logic resides in custom hooks (`src/renderer/src/hooks/`) and Zustand store slices.

### Swift Module Soft-Loading
- Native platform calls (e.g. Finder tags, Spotlight metadata, QuickLook thumbnails, application enumeration) use `src/main/services/nativeBridge.ts`.
- The native `.node` addon is soft-required. If absent or failing, `nativeBridge` MUST seamlessly fall back to standard Node.js/OS operations without crashing.

---

## 3. Full-Stack Quality & Review Guidelines

When reviewing, designing, or implementing code in MorphFinder, follow the **full-stack-quality** standards (`.agents/skills/full-stack-quality/SKILL.md`):

1. **Read-Only Audits**: Audit and review requests are read-only. Do not modify source code, schemas, build configs, or lockfiles unless explicitly requested by the user.
2. **Evidence-Based Findings**: Every audit finding must cite specific file paths, line ranges or symbols, observed issues, potential impact, and clear recommendations.
3. **Strict Typing & Boundaries**: Maintain clean boundary separation between `src/shared/`, `src/main/`, `src/preload/`, and `src/renderer/`. Never import Electron or Node modules inside `src/shared/` or `src/renderer/`.
4. **Design System Consistency**: Prefer `@lablnet/ui` components and Tailwind v3 design tokens over custom inline CSS or duplicate components.
5. **No Bloat**: Avoid introducing new dependencies or complex abstractions when built-in or existing helpers suffice.

---

## 4. Key Directory Map

```text
MorphFinder/
├── .agents/                        # Agent skills, rules, and workspace context
│   ├── AGENTS.md                   # Workspace agent instructions (this file)
│   ├── rules/                      # Workspace agent rules
│   └── skills/                     # Workspace skills (e.g., full-stack-quality)
├── native/                         # Native Swift N-API module (node-swift)
├── src/
│   ├── shared/                     # Cross-process contracts, types, and constants
│   │   └── ipc/contract.ts         # IpcContract definition
│   ├── main/                       # Electron main process (lifecycle, IPC, services)
│   │   ├── ipc/                    # Typed IPC handlers
│   │   └── services/               # File system, watcher, and native bridge services
│   ├── preload/                    # Secure contextBridge bindings
│   └── renderer/                   # React 19 renderer application
│       └── src/
│           ├── layouts/            # Finder, Explorer, Dolphin UI shells
│           ├── hooks/              # Business logic hooks
│           ├── components/         # Reusable UI components
│           └── pages/              # Logicless page compositions
├── tests/                          # Vitest & Playwright test suites
└── electron.vite.config.ts         # Multi-target build configuration
```

---

## 5. Standard Commands

- **Development**: `pnpm dev` (Launches electron-vite dev server with main process hot restart)
- **Typecheck**: `pnpm typecheck` (`tsc` for `node` and `web` targets)
- **Lint**: `pnpm lint` (`eslint . --max-warnings 0`)
- **Unit Tests**: `pnpm test` (`vitest run`)
- **Native Build**: `pnpm native:build` (`node native/build.mjs`)
- **Production Build**: `pnpm build`
