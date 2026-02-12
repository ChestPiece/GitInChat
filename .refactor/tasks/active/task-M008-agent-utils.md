# Task M-008: Define Agent Utilities

**Goal**: Create standard types and utilities for the GitHub Agent tools.

## Context

Tools currently return inconsistent structures. We need a `ToolResult<T>` type to standardize success/error/metadata.

## Steps

- [ ] Create `lib/ai/types.ts` <!-- id: 0 -->
  - `interface ToolResult<T>`
- [ ] Create `lib/ai/utils.ts` <!-- id: 1 -->
  - Helper to create success result
  - Helper to create error result
- [ ] Verify build <!-- id: 2 -->
