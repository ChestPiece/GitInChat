# Refactoring Master Plan

## Phase 1: Architecture Layer [Finished]

- [x] Analyze Directory Structure (Phase 0)
- [x] Identify Core Features (Phase 1)
- [x] Check Layering Violations (Phase 2)
- Note: No immediate architecture refactoring required.

## Phase 2: Module Layer Refactoring [Pending]

### Group 1: Chat Feature (Highest User Impact)

- [ ] **Task M-001**: Refactor `ChatPage` logic to `hooks/use-chat-controller.ts`.
- [ ] **Task M-002**: Fix Theming in Chat components (remove hardcoded hex).
- [ ] **Task M-003**: Fix Types in Chat module (remove `any`).
- [ ] **Task M-004**: Extract `<EmptyState />` component.

### Group 2: Service Layer & Data Fetching (Foundation)

- [ ] **Task M-007**: Create `lib/services/chats.ts` and migrate `use-chats.ts`.

### Group 3: GitHub Agent (Backend Stability)

- [ ] **Task M-005**: Define `ToolResult<T>` and error handling utilities.
- [ ] **Task M-006**: Refactor all tools to use `ToolResult<T>`.

## Phase 5: Finalize & Verify [Pending]

- [x] **Task M-010**: Implement Global Error Boundary (error.tsx, global-error.tsx, not-found.tsx).
- [x] **Task M-011**: Final Verification & Cleanup.

## Phase 6: Post-Refactor Fixes

- [x] **Task M-012**: Post-Refactor Cleanup & Verification.

## Execution Order

1.  **Group 1 (Chat)**: Immediate visible value and code cleanup.
2.  **Group 2 (Services)**: Solidify the data layer used by Group 1.
3.  **Group 3 (Agent)**: Robustness for the AI backend.
