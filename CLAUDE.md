# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Is

GitInChat is an AI-powered GitHub management assistant. Users authenticate via GitHub OAuth and chat with an AI agent that can manage repos, issues, PRs, and branches in natural language. Supports real-time GitHub event streaming via webhooks and RAG-powered semantic code search.

## Tech Stack

### Framework
- **Next.js 15+ App Router** — `app/` directory, Server Components by default, `"use client"` only when needed
- **TypeScript** strict mode — always type props and return values
- **React 19**

### Styling & UI
- **Tailwind CSS** — use `cn()` from `lib/utils` for conditional classes
- **shadcn/ui** — ALL UI components from `components/ui/`. Never install raw Radix primitives. Add with `npx shadcn@latest add <component>`
- **Lucide React** — icons
- **GSAP** (`@gsap/react`) — primary animation lib; plugins registered in `lib/gsap.ts`. Framer Motion also present but prefer GSAP for complex animations.
- **Sonner** — toasts (`toast.success`, `toast.error`)

### AI / LLM
- **Vercel AI SDK** (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`) — use `streamText`, `useChat`, `tool()`. No raw OpenAI/Anthropic SDK calls in chat routes.
- Models: OpenAI `gpt-4o-mini` (agent), embeddings via OpenAI
- Tools use `inputSchema: z.object({...})` (AI SDK v6 — NOT `parameters`)
- Agent: `lib/ai/agent.ts` (`ToolLoopAgent`), tools: `lib/ai/tools/`

### Backend & Database
- **Supabase** (Postgres + Auth + Realtime + pgvector)
  - Server client: `lib/supabase/server.ts` | Client: `lib/supabase/client.ts`
  - Auth: GitHub OAuth via Supabase Auth (`lib/auth.ts`)
  - RLS enabled on all tables — always respect row-level security
  - Migrations: `supabase/migrations/` as `.sql` files

### GitHub Integration
- **Octokit** (`lib/github/client.ts`) — all GitHub API calls go through this
- Webhooks verified via `@octokit/webhooks` in `app/api/webhooks/github/route.ts`
- Real-time events → Supabase Realtime → `components/realtime-github-listener.tsx`

### RAG / Embeddings
- pgvector `vector(1536)` in `documents` table, scoped per `user_id`. `match_documents` RPC requires `filter_user_id`.
- Indexing: `lib/rag/indexer.ts` | Search: `lib/rag/search.ts` | Embeddings: `lib/rag/embeddings.ts`

## Project Structure

```
app/
  api/chat/route.ts          # Main streaming chat endpoint
  api/webhooks/github/       # GitHub webhook receiver
  auth/                      # Login, signup, callback, error
  chat/                      # Chat list + [id] individual chat
  actions/                   # Server Actions
components/
  ui/                        # shadcn components (DO NOT edit directly)
  chat-*.tsx                 # Chat UI components
  layout/                    # Header, Sidebar
lib/
  ai/agent.ts                # ToolLoopAgent (GPT-4o-mini, max 5 steps)
  ai/tools/                  # 25+ GitHub tools, export via index.ts
  ai/prompts.ts              # System prompts
  rag/                       # Embeddings, indexing, search
  services/                  # chats.ts, messages.ts, events.ts
  github/                    # Octokit + webhook dispatcher
  safety/                    # Content moderation (SuperAgent)
  auth.ts                    # GitHub OAuth
hooks/
  use-chat-controller.ts     # Main chat state
supabase/migrations/         # SQL migrations (versioned)
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `chats` | Chat sessions per user |
| `messages` | Messages per chat (role: user/assistant) |
| `documents` | RAG chunks — `embedding vector(1536)`, `user_id` for tenant isolation |
| `github_events` | Incoming GitHub webhook events |

## Key Conventions

### API Routes
- Chat route: `createAgentUIStreamResponse` + `ToolLoopAgent` (30s `maxDuration`); assistant text persisted once via `onFinish`, not per step
- Validate chat ownership + run safety check before processing
- Fetch RAG context in parallel; pass `session.user.id` into `searchSimilarDocuments`
- **Local dev:** `POST /api/chat` skips session check when `NODE_ENV === 'development'` but `provider_token` still required — never disable in staging/prod

### AI Tools
- `tool()` from `ai` package; `inputSchema: z.object({})` (AI SDK v6)
- Tools in `lib/ai/tools/`, grouped by domain; export all from `lib/ai/tools/index.ts`

### Components
- `cn()` for Tailwind class merging; prefer Server Components; `"use client"` only for hooks/interactivity

### Auth
- `middleware.ts` protects all routes except `/`, `/auth/*`
- GitHub OAuth token from Supabase session as `provider_token`

## Environment Variables

```env
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GITHUB_WEBHOOK_SECRET=
SUPERAGENT_API_KEY=
OPENAI_API_KEY=
```

## Dev Commands

```bash
npm run dev          # Next.js + webhook proxy (concurrently)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (all)
npx vitest tests/chat-route.test.ts  # Single test file
```

## Deployment

Vercel. Env vars in Vercel dashboard. `next.config.mjs` has CSP headers for Supabase + GitHub origins.

## Skill Routing

Invoke skills via the Skill tool BEFORE any other action when matched.

| Signal | Skill |
|--------|-------|
| Product ideas, brainstorming | `office-hours` |
| Bugs, errors, 500s | `investigate` |
| Ship, deploy, PR | `ship` |
| QA, find bugs | `qa` |
| Code review | `review` |
| Update docs post-ship | `document-release` |
| Weekly retro | `retro` |
| Design system/brand | `design-consultation` |
| Visual polish | `design-review` |
| Architecture review | `plan-eng-review` |
| Save/resume progress | `checkpoint` |
| Code quality | `health` |
