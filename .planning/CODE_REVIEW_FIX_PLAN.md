# Code Review Fix Plan

Issues from review of commits `81a65cd` → `1c8a663`.
Fix order: Critical → Important → Suggestions.

---

## Critical

### CR-1: `getSession()` used for identity in RAG writes
**File**: `lib/ai/tools/rag/index-repository.ts` lines 21, 81  
**Risk**: `getSession()` reads local storage, no JWT re-verification. `supabaseAdmin` bypasses RLS — userId from unverified session scopes RAG writes. Attacker with cookie control writes to wrong user's namespace.  
**Fix**: Replace `getSession()` with `getUser()` for userId extraction.  
**Skill**: `sparc:security-review`  
**Agent**: `security-auditor`

### CR-2: Security headers gap (proxy.ts / next.config.mjs)
**File**: `next.config.mjs`  
**Risk**: `middleware.ts` deleted. CSP, HSTS, X-Frame-Options no longer applied globally unless `next.config.mjs` `headers()` covers all routes.  
**Fix**: Audit `next.config.mjs` headers config. Add any missing security headers. Update `proxy.ts` if route-level guards needed for API routes.  
**Skill**: `security-review`  
**Agent**: `security-architect`

---

## Important

### IMP-1: `read-file.ts` — sensitive file blocklist on raw path
**File**: `lib/ai/tools/read-file.ts`  
**Risk**: `.env` substring check runs on user-supplied `filePath`, not resolved path. `lib/../.env` passes check but resolves within project root → readable.  
**Fix**: Apply blocklist to resolved relative path (post-`realpath`), not raw input.  
**Skill**: `sparc:security-review`  
**Agent**: `security-auditor`

### IMP-2: `getRecentEvents` dual-signature fragile
**File**: `lib/services/events.ts` line 63  
**Risk**: Old `(limit: number)` signature leaves `userId=undefined`. Guard prevents harm now but `.eq("user_id", undefined)` → `WHERE user_id IS NULL` in Postgres if guard removed.  
**Fix**: Remove old signature entirely. Single `(userId: string, limit?: number)` form only.  
**Skill**: `sparc:coder`  
**Agent**: `coder`

### IMP-3: `ALLOW_DEV_UNAUTHENTICATED_CHAT` bypass broken
**File**: `app/api/chat/route.ts`  
**Risk**: Bypass skips null-session block but `provider_token` check still fires — bypass does nothing. Confusing dead code.  
**Fix**: Either fix bypass to also skip `provider_token` check in dev, or remove bypass entirely and document dev workflow requires a real session.  
**Skill**: `sparc:coder`  
**Agent**: `coder`

---

## Suggestions

### SUG-1: Structured logging in RAG layer
**Files**: `lib/rag/search.ts`, `lib/rag/indexer.ts`  
**Issue**: 35+ `console.*` calls. Chat route uses structured `logger`. Inconsistent for prod observability.  
**Fix**: Replace `console.*` with `logger` from `lib/logger`.  
**Skill**: `health`  
**Agent**: `code-simplifier:code-simplifier`

### SUG-2: `validatePathInput` allows `//` double-slash
**File**: `lib/ai/tools/` (path validator)  
**Fix**: Add consecutive-slash check to `VALIDATE_PATH_REGEX`.  
**Agent**: `coder`

### SUG-3: `getIndexStats` unbounded memory fetch
**File**: `lib/rag/search.ts` lines 172–177  
**Issue**: Fetches all `documents` rows to aggregate `repo_name` in application code.  
**Fix**: Move to SQL `GROUP BY metadata->>'repo_name'` via Supabase RPC.  
**Skill**: `supabase:supabase-postgres-best-practices`  
**Agent**: `backend-dev`

---

## Execution Order

```
1. CR-1  → security-auditor (getUser fix)
2. CR-2  → security-architect (headers audit)
3. IMP-1 → security-auditor (blocklist on resolved path)
4. IMP-2 → coder (remove dual-signature)
5. IMP-3 → coder (fix or remove dev bypass)
6. SUG-1 → code-simplifier (structured logging)
7. SUG-2 → coder (regex fix)
8. SUG-3 → backend-dev (SQL aggregation)
```

Run `/review` after each Critical fix before proceeding.
