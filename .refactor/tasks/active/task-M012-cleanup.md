# Task M-012: Post-Refactor Cleanup & Verification

## 1. Context

Current Phase: Phase 6 (Post-Refactor Fixes)
Goal: Fix build errors remaining after refactoring.
Issues:

- Legacy file `lib/agent/tools.ts` causing duplicates and errors.
- `scripts/test-chat.ts` has broken imports and type errors.
- `app/chat/[id]/page.tsx` and `hooks/use-chat-controller.ts` have minor type mismatches.

## 2. Plan

- [x] Delete `lib/agent/tools.ts` (Legacy). <!-- id: 0 -->
- [x] Fix `scripts/test-chat.ts`. <!-- id: 1 -->
  - Update imports to point to `lib/ai/tools/repository/*`.
  - Fix `maxSteps` and type access errors.
- [x] Fix `app/chat/[id]/page.tsx` type errors. <!-- id: 2 -->
- [x] Fix `hooks/use-chat-controller.ts` types. <!-- id: 3 -->
- [x] Verify build `npm run build`. <!-- id: 4 -->

## 3. Progress

- [x] Start Task <!-- id: 5 -->
