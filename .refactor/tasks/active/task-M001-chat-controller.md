# Task M-001: Refactor Chat Controller

**Goal**: Extract business logic from `app/chat/page.tsx` into a custom hook `useChatController` to improve separation of concerns and testability.

## Context

Currently, `ChatPage` handles:

- User authentication check
- Chat initialization (creating new chat if none exists)
- Message loading from Supabase
- Integration with Vercel AI SDK (`useChat`)

This logic should be moved to a hook.

## Steps

- [x] Create `hooks/use-chat-controller.ts` <!-- id: 0 -->
  - Should start with specific logic from `page.tsx`.
  - Should return `{ messages, input, handleInputChange, handleSubmit, isLoading, ... }`.
- [x] Refactor `app/chat/page.tsx` to use `useChatController` <!-- id: 1 -->
- [x] Verify functionality (send message, load history, new chat) <!-- id: 2 -->
