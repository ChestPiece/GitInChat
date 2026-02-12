# Task M-007: Extract Chat Service

**Goal**: Move Supabase logic from `use-chats.ts` to `lib/services/chats.ts`.

## Context

`use-chats.ts` currently contains direct database calls. We should extract them to a service layer for better separation of concerns and reusability.
We should follow the pattern in `lib/services/messages.ts`.

## Steps

- [ ] Inspect `lib/services/messages.ts` for pattern <!-- id: 0 -->
- [ ] Create `lib/services/chats.ts` <!-- id: 1 -->
  - `getChats()`
  - `createChat(title, userId)`
  - `deleteChat(id)`
  - `updateChat(id, title)`
- [ ] Refactor `hooks/use-chats.ts` to use service <!-- id: 2 -->
- [ ] Verify build <!-- id: 3 -->
