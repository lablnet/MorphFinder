# MorphFinder Architecture

MorphFinder is split into four main surfaces:

- `src/main`: Electron main process, filesystem/native services, IPC handlers, app windows.
- `src/preload`: sandbox-safe bridge exposed as `window.morph`.
- `src/shared`: IPC contracts, app constants, shared domain types, and cross-process registries.
- `src/renderer`: React UI, Zustand durable state, feature hooks, shell layouts, and components.

## Boundaries

Renderer code calls main process capabilities only through `src/renderer/src/services/ipc.ts`.
Main process request handlers are registered in `src/main/ipc/registerHandlers.ts`, where runtime validation happens before dispatch.

Compile-time IPC typing lives in `src/shared/ipc/contract.ts`; runtime request validation lives in `src/main/ipc/validation.ts`.
Both layers are needed because TypeScript types do not protect the app from malformed runtime payloads.

## Virtual Locations

App-owned routes such as `morph://cache-cleaner` and `morph://smart-collections` are centralized in `src/shared/virtualLocations.ts`.
Use this registry instead of hardcoding virtual-path checks in feature code.

## Filesystem Safety

Main-process filesystem services must validate dangerous operations through `src/main/services/pathPolicy.ts`.
Do not allow virtual paths, empty path lists, filesystem roots, or the user home directory into permanent-delete operations.

## Renderer Reuse

Durable app state belongs in Zustand slices under `src/renderer/src/store`.
Ephemeral feature state belongs in hooks.
Shared behavior that can be invoked from context menus, toolbars, shortcuts, or command palette should live in reusable hooks such as `useFileActionRunner`.
