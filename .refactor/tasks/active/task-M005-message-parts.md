# Task M-005: Extract Message Content

**Goal**: Split `ChatMessage` into smaller components (e.g., `MessageContent`, `ToolInvocation`) to improve readability and maintainability.

## Context

`ChatMessage` currently handles:

- User vs Assistant styling
- Markdown rendering
- Tool invocation rendering
- Copy button logic?

We should extract the content rendering logic.

## Steps

- [ ] Analyze `components/chat-message.tsx` <!-- id: 0 -->
- [ ] Create `components/message-content.tsx` <!-- id: 1 -->
  - Handle Markdown rendering
- [ ] Create `components/tool-invocation.tsx` <!-- id: 2 -->
  - Handle tool results (if complex)
- [ ] Refactor `chat-message.tsx` to use new components <!-- id: 3 -->
- [ ] Verify build <!-- id: 4 -->
