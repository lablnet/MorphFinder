# Security Model

MorphFinder is a local-first file manager, so the main risks are filesystem mutation, native integration, local network sharing, terminals, and untrusted file previews.

## Electron Defaults

Main windows are created with:

- `contextIsolation: true`
- `sandbox: true`
- `nodeIntegration: false`
- a preload-only bridge
- guarded navigation and window opening
- a Content Security Policy from `src/main/security.ts`

Renderer code should not import Electron or Node APIs directly.

## IPC Boundary

Renderer requests cross into the main process through `window.morph` and `src/renderer/src/services/ipc.ts`.
`src/main/ipc/registerHandlers.ts` validates every request with `src/main/ipc/validation.ts` before dispatching to feature handlers.

Add validation for every new channel that accepts user-controlled input, especially paths, dimensions, command text, session ids, or network-sharing state.

## Filesystem Operations

Filesystem services must reject virtual `morph://` paths before calling Node or Electron filesystem APIs.
Permanent delete is extra sensitive and must reject empty path lists, filesystem roots, and the user home directory through `src/main/services/pathPolicy.ts`.

Prefer moving files to trash over permanent deletion whenever the product flow allows it.

## Script and Terminal Execution

Developer Panel script execution is intentionally constrained by `isValidDevScript`.
Terminal creation must receive a real filesystem `cwd`.
Do not pass arbitrary shell strings through IPC; prefer executable plus argument arrays with `shell: false`.

## File Preview and Sharing

File previews should respect the `morph-file://` safety checks in `src/main/security.ts`.
Local sharing should avoid serving secrets, keys, environment files, and system paths.
Inbound file writes should remain scoped to the intended received-files directory.
