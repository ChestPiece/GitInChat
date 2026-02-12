# Task M-004: Extract Empty State

**Goal**: Extract the empty state UI from `ChatPage` into a reusable `ChatEmptyState` component.

## Context

Currently, `app/chat/page.tsx` has inline JSX for the empty state. `app/chat/[id]/page.tsx` has a different inline empty state. We should unify and extract them.

## Steps

- [ ] Create `components/chat-empty-state.tsx` <!-- id: 0 -->
  - Move JSX from `app/chat/page.tsx`
  - Add props for customization (title, description)
- [ ] Refactor `app/chat/page.tsx` <!-- id: 1 -->
  - Use `<ChatEmptyState />`
- [ ] Refactor `app/chat/[id]/page.tsx` <!-- id: 2 -->
  - Use `<ChatEmptyState />` (unify UI)
- [ ] Verify visual consistency <!-- id: 3 -->
