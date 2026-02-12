# Module Layer Analysis Report

## Analysis Coverage

| Feature       | Analysis Status | Problem Count | Report Location  |
| ------------- | --------------- | ------------- | ---------------- |
| Chat Feature  | ✅ Complete     | 4 Major       | modules/chat.md  |
| GitHub Agent  | ✅ Complete     | 2 Major       | modules/agent.md |
| Auth/Services | ✅ Complete     | 1 Major       | modules/auth.md  |

## Problem Summary

### Resources Not Reused (P1)

| Module | Problem          | Location                   | Should Use                        |
| ------ | ---------------- | -------------------------- | --------------------------------- |
| Chat   | Hardcoded Colors | `ChatInput`, `ChatMessage` | Theme Variables (`bg-card`, etc.) |

### Code Quality (P1)

| Module | Problem              | Location     | Fix Suggestion                        |
| ------ | -------------------- | ------------ | ------------------------------------- |
| Chat   | Excessive `any`      | `ChatPage`   | Use strict types for User and useChat |
| Agent  | Inconsistent Returns | `tools/*.ts` | Standard `ToolResult<T>` wrapper      |

### Inconsistent Patterns (P2)

| Module | Problem              | Current        | Should Unify To                         |
| ------ | -------------------- | -------------- | --------------------------------------- |
| Chat   | Logic in View        | `ChatPage`     | Custom Hook (`useChatLogic`)            |
| Auth   | Direct Supabase Call | `use-chats.ts` | Service Layer (`lib/services/chats.ts`) |

## Module Layer Refactoring Tasks

### Chat Module

1. [M-001] Refactor `ChatPage`: Extract logic to `hooks/use-chat-controller.ts`.
2. [M-002] Fix Theming: Replace hex codes with semantic tokens in Chat components.
3. [M-003] Fix Types: Remove `any` usage in Chat module.
4. [M-004] Extract `<EmptyState />` component.

### Agent Module

5. [M-005] Create `ToolResult<T>` interface and standardized error handler.
6. [M-006] Refactor all tools to return `ToolResult<T>`.

### Auth & Services

7. [M-007] Create `lib/services/chats.ts` and migrate `use-chats.ts` to use it.
