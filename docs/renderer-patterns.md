# Renderer Patterns

## State

Use Zustand for durable application state: active tabs, shell/theme, layout, pinned folders, annotations, and snapshots.
Use React hooks for ephemeral state: current directory listing, loading state, progress cards, open dialogs, selection gestures, and local search state.

## Actions

File actions should flow through shared action runners where possible.
`useFileActionRunner` is the common path for context-menu file commands and can be reused by toolbars or keyboard shortcuts when they need the same behavior.

## Virtual Locations

Use `src/shared/virtualLocations.ts` to decide whether a path is virtual, watchable, or a smart collection.
Avoid repeating `path === SOME_CONSTANT` chains in components or hooks.

## UI

Prefer shared primitives under `src/renderer/src/components/ui` and shell tokens from `src/renderer/src/styles/globals.css`.
Feature components can compose their own layout, but repeated controls such as buttons, panels, empty states, progress rows, and stat cells should graduate into shared components once duplication is real.
