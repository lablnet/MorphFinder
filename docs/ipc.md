# IPC Guidelines

1. Add request and response types to `src/shared/ipc/contract.ts`.
2. Add a runtime validator in `src/main/ipc/validation.ts` for any channel that accepts user-controlled data.
3. Register the handler in the relevant `src/main/ipc/*.handlers.ts` module.
4. Call the channel from renderer code through `src/renderer/src/services/ipc.ts`.
5. Add a focused unit test for malformed payloads when the channel touches filesystem, native, terminal, network sharing, or script execution behavior.

Validation rules should reject:

- Virtual `morph://` paths where a real filesystem path is required.
- Empty path lists.
- Non-positive numeric dimensions, terminal sizes, or byte caps.
- Destructive actions with ambiguous or protected targets.

The IPC contract gives compile-time correctness. The validation layer gives runtime safety.
