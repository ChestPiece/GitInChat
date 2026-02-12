# Task M-009: Refactor Tools to use ToolResult

**Goal**: Standardize tool returns using `ToolResult<T>` and handle them in frontend.

## Context

Tools currently return raw data or strings. We want `{ success, data, error }` structure.

## Steps

- [ ] Inspect tools in `lib/ai/tools` <!-- id: 0 -->
- [x] Update `components/chat-tool-invocation.tsx` to handle `ToolResult` <!-- id: 1 -->
- [x] Refactor tools (Batch 1: Repo Tools) <!-- id: 2 -->
- [x] Refactor tools (Batch 2: Issue/PR Tools) <!-- id: 3 -->
- [x] Refactor tools (Batch 3: User/Search Tools) <!-- id: 4 -->
- [x] Verify build <!-- id: 5 -->
