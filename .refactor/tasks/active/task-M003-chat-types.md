# Task M-003: Fix Types in Chat Module

**Goal**: Remove `any` types usage in `useChatController` and `useChats` to ensure type safety.

## Context

`useChatController` currently uses `as any` to bypass type checks for `useChat`. We need to fix this.
Also ensure `messages` are properly typed as `Message` or `UIMessage`.

## Steps

- [x] Inspect strict types for `useChat` <!-- id: 0 -->
- [x] Refactor `hooks/use-chat-controller.ts` <!-- id: 1 -->
  - Remove `as any`
  - Use `Message` type from `ai`
- [x] Refactor `hooks/use-chats.ts` <!-- id: 2 -->
  - Ensure strict typing for Supabase returns
- [x] Verify build <!-- id: 3 -->
