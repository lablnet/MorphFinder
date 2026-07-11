# MorphFinder

A multi-platform file manager with a runtime-switchable **Tri-UI shell engine** (Finder, Explorer, Dolphin) over a single shared behavior core.

## Overview

MorphFinder is a modern, high-performance file manager built on Electron, React, and TypeScript. Unlike traditional file managers, MorphFinder decouples the visual presentation (skins/shells) from the underlying file system logic. This enables users to switch between three distinct user interface paradigms at runtime:

- **Finder Shell**: macOS style with unified toolbar, sidebar, path bar, and Miller columns.
- **Explorer Shell**: Windows 11 style with command bar, address bar, navigation pane, and details pane.
- **Dolphin Shell**: KDE style with places panel, split-view toggle, and terminal status bar.

MorphFinder achieves this through a `ShellDefinition` strategy that swaps visual tokens and component composition without duplicating state management or file operation logic.

---

## Features

- 🎭 **Tri-UI Shell Engine**: Switch dynamically between Finder, Explorer, and Dolphin skins.
- ⚡ **Native Performance**: Main-process file system operations using `@parcel/watcher` for cross-platform file monitoring.
- 🍏 **Native macOS Swift Module**: Optional native Swift API addon (via `node-swift`) supporting Finder tags, Spotlight metadata, QuickLook thumbnail generation, and "Open With" app enumeration.
- 🗂️ **Tab Management**: Robust multi-tab support with middle-click closing, drag-and-drop reordering, and browser-style session restoration.
- 🔍 **Multiple View Modes**:
  - **Grid View**: Virtualized icon grid for folders with large file counts.
  - **List View**: Sortable details table using `@lablnet/ui`.
  - **Column View**: macOS-style Miller columns.
- 🛡️ **Hardened Security**: Context isolation, sandboxed processes, strict Content Security Policy (CSP), and navigation guards.
- ⌨️ **Keyboard Navigation**: Platform-aware hotkeys and keyboard accelerators (e.g., inline renaming with `Enter` on macOS vs. `F2` on Windows/Linux).

---

## How to Run

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+) and [pnpm](https://pnpm.io/) installed.

### Installation

Clone the repository and install the dependencies:

```bash
pnpm install
```

### Development

Start the development server with Hot Module Replacement (HMR):

```bash
pnpm dev
```

### Native macOS Module Build (Optional)

To compile the Swift native module (for macOS features like Finder tags and Spotlight metadata):

```bash
pnpm native:build
```

### Building & Packaging

To compile the TypeScript project and package the application for your current platform:

```bash
pnpm build
```

To package for specific target platforms:

```bash
# Package for macOS
pnpm build:mac

# Package for Windows
pnpm build:win

# Package for Linux
pnpm build:linux
```

### Testing & Linting

Run automated tests and linting check:

```bash
# Run unit tests (Vitest)
pnpm test

# Run End-to-End tests (Playwright)
pnpm test:e2e

# Run linter
pnpm lint
```
