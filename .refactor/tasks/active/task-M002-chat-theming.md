# Task M-002: Fix Theming in Chat Components

**Goal**: Replace hardcoded hex colors in Chat components with semantic Tailwind CSS variables to support theming (light/dark mode) and consistency.

## Context

Code analysis revealed hardcoded GitHub-specific hex colors in `ChatInput` and `ChatMessage` (e.g., `#0d1117`, `#30363d`). These should be replaced with `shadcn/ui` semantic tokens.

## Steps

- [x] Inspect `globals.css` and `tailwind.config.ts` for available tokens <!-- id: 0 -->
- [x] Refactor `components/chat-input.tsx` <!-- id: 1 -->
  - Replace `#0d1117` with `bg-background` / `bg-card`
  - Replace `#30363d` with `border-border`
  - Replace `#c9d1d9` with `text-foreground`
  - Replace `#8b949e` with `text-muted-foreground`
- [x] Refactor `components/chat-message.tsx` <!-- id: 2 -->
  - Similar replacements
- [x] Refactor `app/chat/page.tsx` (loading state colors) <!-- id: 3 -->
- [x] Verify visual consistency <!-- id: 4 -->
