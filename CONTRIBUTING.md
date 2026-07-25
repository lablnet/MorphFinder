# Contributing to MorphFinder 🚀

Thank you for your interest in contributing to **MorphFinder**! MorphFinder is an open-source, cross-platform (macOS / Windows / Linux) file manager powered by a runtime-switchable **Tri-UI shell engine** (Finder, Explorer, Dolphin) and a shared high-performance core.

We welcome all contributions—whether you are fixing a bug, improving UI shell components, optimizing file operations, or building new features for our upcoming roadmap!

---

## 🗺️ Feature Roadmap & Priority Areas

We actively invite contributors to help build key roadmap features:

1. 📡 **Built-in FTP / SFTP / WebDAV Client**:
   - Remote file browsing, inline file previewing, and background file synchronization over SSH / FTP.
2. ☁️ **Cloud Storage Integration**:
   - Mounting and managing S3 buckets, Google Drive, and WebDAV endpoints directly within MorphFinder layouts.
3. 🛍️ **Microsoft Store (Windows) & Linux Package Distribution**:
   - Packaging for Microsoft Store (MSIX / Windows App SDK) and Linux ecosystem (Snap, Flatpak, Arch AUR).

---

## 🛠️ Local Development & Build Guide

### Prerequisites
- **Node.js**: v22+
- **PNPM**: v9+ (`corepack enable` or `npm i -g pnpm`)
- **Git**

### 1. Clone & Install
```bash
git clone https://github.com/lablnet/MorphFinder.git
cd MorphFinder
pnpm install
```

### 2. Start Development Server
```bash
pnpm dev
```
This launches the Electron main process and Vite renderer server with hot module replacement (HMR).

### 3. Running Quality Checks
Before submitting a PR, make sure typechecks, linters, and unit tests pass cleanly:
```bash
# Typecheck TypeScript (Main, Preload, Renderer)
pnpm typecheck

# Lint codebase
pnpm lint

# Run unit tests (Vitest)
pnpm test
```

---

## 📦 Building for Platform Targets

### macOS
- **Standard Mac Distribution (DMG & ZIP)**:
  ```bash
  pnpm build:mac
  ```
- **Mac App Store (MAS `.pkg`)**:
  ```bash
  pnpm build:mas
  ```

### Windows (Microsoft Store & Installer)
- **Windows NSIS Installer**:
  ```bash
  pnpm build:win
  ```
  Generates `release/MorphFinder Setup <version>.exe`.
- **Microsoft Store (MSIX Package)**:
  ```bash
  pnpm native:build && pnpm build && npx electron-builder --win msix
  ```

### Linux (AppImage & DEB)
- **Linux Packages**:
  ```bash
  pnpm build:linux
  ```
  Generates `release/MorphFinder-<version>-x86_64.AppImage` and `.deb`.

---

## 🤝 Submitting a Pull Request (PR)

1. **Fork the Repository**: Click **Fork** on GitHub.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/ftp-client-support
   ```
3. **Commit your Changes**: Use descriptive commit messages.
4. **Run Verification**: Ensure `pnpm typecheck` and `pnpm test` pass.
5. **Open a PR**: Submit a pull request against the `main` branch of `lablnet/MorphFinder`.

---

## 📜 License
By contributing to MorphFinder, you agree that your contributions will be licensed under the project's **Apache-2.0 License**.
