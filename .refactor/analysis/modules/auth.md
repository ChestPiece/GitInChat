# Feature Analysis: Auth & Services

## Basic Information
- **Entry**: `lib/auth.ts`, `lib/supabase/*`
- **Files Involved**:
    - `lib/auth.ts`
    - `lib/supabase/client.ts`
    - `lib/supabase/server.ts`
- **Call Chain**: `UI -> Auth Helper -> Supabase Client`

## Vibe Coding Problem Detection

### 1. Pattern Consistency
- **Auth Access**:
    - `lib/auth.ts` exports `getUser` which uses `createClient` (server).
    - `app/chat/page.tsx` uses `getUser` directly.
    - **Consistency**: Good, `getUser` serves as a unified entry point for server-side user retrieval.

### 2. Code Quality
- **Cookie Handling**:
    - `lib/supabase/server.ts` uses `cookieStore` from `next/headers` correctly for Next.js 14.
- **Type Safety**:
    - `getUser` returns `User | null`. This is verified.

## Refactoring Suggestions
1.  **Consolidate Auth**: The current setup is clean. No major refactoring needed for `auth.ts`.
2.  **Service Layer**: Ensure all DB access goes through `lib/services/*` (like `messages.ts`) rather than direct Supabase calls in components. `hooks/use-chats.ts` currently calls Supabase directly - this violates the pattern if we want a strict service layer.
    - **Task**: Migrate `use-chats.ts` data fetching to `lib/services/chats.ts`.
