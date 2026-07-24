# MorphFinder

[![codecov](https://codecov.io/gh/lablnet/MorphFinder/graph/badge.svg?token=0XOV8MZ6JK)](https://codecov.io/gh/lablnet/MorphFinder)

A multi-platform file manager with a runtime-switchable **Tri-UI shell engine** (Finder, Explorer, Dolphin) over a single shared behavior core.

## Overview

MorphFinder is a modern, high-performance file manager built on Electron, React, and TypeScript. Unlike traditional file managers, MorphFinder decouples the visual presentation (skins/shells) from the underlying file system logic. This enables users to switch between three distinct user interface paradigms at runtime:

- **Finder Shell**: macOS style with unified toolbar, sidebar, path bar, and Miller columns.
- **Explorer Shell**: Windows 11 style with command bar, address bar, navigation pane, and details pane.
- **Dolphin Shell**: KDE style with places panel, split-view toggle, and terminal status bar.

MorphFinder achieves this through a `ShellDefinition` strategy that swaps visual tokens and component composition without duplicating state management or file operation logic.

---

## Features

- 🌐 **Morph AirShare & Local WebShare (`morph://airshare`)**: Zero-cloud peer file server & inbound file drop zone over local Wi-Fi / Ethernet. Right-click any file/folder or open AirShare Hub under Tools to share instantly via vector QR code. Visiting mobile devices get a mobile web portal with multi-select batch downloads, streaming ZIP folder archives, and inbound file uploads straight to `~/Downloads/MorphFinder_Received`.
- ✨ **Interactive Welcome Onboarding & Tour**: First-time launch wizard offering live shell selection, key accelerator tutorials, and feature highlights (accessible anytime via Command Palette).
- 👑 **100% Unlocked Enterprise Suite**: Free, subscription-free access to enterprise-grade disk storage analytics, byte-hash duplicate cleaning, time-machine file history, and dev control suites.
- 🎭 **Tri-UI Shell Engine**: Switch dynamically between Finder, Explorer, and Dolphin skins.
- ⚡ **Native Performance**: Main-process file system operations using `@parcel/watcher` for cross-platform file monitoring.
- 🍏 **Native macOS Swift Module**: Optional native Swift API addon (via `node-swift`) supporting Finder tags, Spotlight metadata, QuickLook thumbnail generation, and "Open With" app enumeration.
- 🗂️ **Tab Management**: Robust multi-tab support with middle-click closing, drag-and-drop reordering, and browser-style session restoration.
- 📸 **Workspace Snapshots & Session Freeze**: Save multi-tab setups, open paths, view modes, and active shell theme into named snapshots; export and import `.morphws` files.
- 📦 **File & Folder Compression / Extraction**: Right-click to compress single or multiple items to `.zip` archives or unpack `.zip`, `.tar`, and `.tgz` archives in place.
- 🔍 **Multiple View Modes**:
  - **Grid View**: Virtualized icon grid for folders with large file counts.
  - **List View**: Sortable details table using `@lablnet/ui`.
  - **Column View**: macOS-style Miller columns.
- 📊 **Storage Analyzer**: Treemap, donut, list, and inspector views to visualize folder space usage before drilling down.
- 🔍 **Duplicate Finder**: Deep scope scanning with hash-based duplicate grouping to clean up disk space safely.
- 🕒 **File Timeline**: Chronological file activity stream enriched with Git history and commit context.
- 🧹 **Cache Cleaner**: Intelligent target detection for npm, Yarn, Gradle, Homebrew, Python, Puppeteer, app, and system caches.
- 🌿 **Git Radar**: In-app Git integration displaying current branch status, dirty states, staged/unstaged changes, and commit history.
- 🛠️ **Developer Panel & Integrated Terminal**: Embedded project detection, package script execution, dependency inspect, and project-scoped terminal sessions (`node-pty`).
- 🏷️ **Directory Annotations & Smart Collections**: Custom tags/notes attached to folders, queryable via high-signal smart collection groups.
- 👁️ **Built-in File Viewer**: Multi-format quick preview supporting images, video, audio, Markdown, code, PDFs, Office files, and binary metadata.
- 🛡️ **Hardened Security**: Context isolation, sandboxed processes, strict Content Security Policy (CSP), and navigation guards.
- ⌨️ **Keyboard Navigation & Command Palette**: Keyboard-first launcher, hotkey accelerators, and platform-aware shortcut mappings.

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

# Run unit tests with coverage
pnpm test:coverage

# Run End-to-End tests (Playwright)
pnpm test:e2e

# Run linter
pnpm lint
```

Coverage runs in GitHub Actions, uploads `coverage/lcov.info` to Codecov, and keeps the HTML report as a workflow artifact. For this private repository, add the Codecov repository upload token as the GitHub Actions secret `CODECOV_TOKEN`.
