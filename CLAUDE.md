# GitInChat — Project Guide for Claude

## What This App Is

GitInChat is an AI-powered GitHub management assistant. Users authenticate via GitHub OAuth and chat with an AI agent that can manage their repositories, issues, pull requests, branches, and more — all in natural language. It also supports real-time GitHub event streaming via webhooks and RAG-powered semantic code search.

---

## Tech Stack (ALWAYS follow these patterns)

### Framework
- **Next.js 15+ App Router** — use `app/` directory conventions, Server Components by default, Client Components only when needed (`"use client"`)
- **TypeScript** — strict mode, always type props and return values
- **React 19**

### Styling & UI
- **Tailwind CSS** — utility-first, use `cn()` from `lib/utils` for conditional classes
- **shadcn/ui** — ALL UI components come from `components/ui/`. Never install raw Radix UI primitives directly — use the shadcn wrappers. Add new components with `npx shadcn@latest add <component>`
- **Lucide React** — for icons
- **Framer Motion** — for animations
- **Sonner** — for toasts (`toast.success`, `toast.error`)

### AI / LLM
- **Vercel AI SDK** (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`) — use `streamText`, `useChat`, `tool()` from this SDK. Do NOT use raw OpenAI/Anthropic SDK calls in chat routes
- Models: OpenAI `gpt-4o-mini` (agent), embeddings via OpenAI
- Tools are defined with `inputSchema: z.object({...})` (AI SDK v6 style — NOT `parameters`)
- Agent loop lives in `lib/ai/agent.ts`, tools in `lib/ai/tools/`

### Backend & Database
- **Supabase** (Postgres + Auth + Realtime + pgvector)
  - Server client: `lib/supabase/server.ts` (use in Server Components & API routes)
  - Client: `lib/supabase/client.ts` (use in Client Components)
  - Auth: GitHub OAuth via Supabase Auth (`lib/auth.ts`)
  - RLS is enabled — always write queries that respect row-level security
  - Migrations go in `supabase/migrations/` as `.sql` files

### GitHub Integration
- **Octokit** (`lib/github/client.ts`) — all GitHub API calls go through this
- Webhooks verified via `@octokit/webhooks` in `app/api/webhooks/github/route.ts`
- Real-time events broadcast over Supabase Realtime → `components/realtime-github-listener.tsx`

### RAG / Embeddings
- pgvector (`vector(1536)`) for OpenAI embeddings stored in `documents` table
- Indexing: `lib/rag/indexer.ts`, Search: `lib/rag/search.ts`, Embeddings: `lib/rag/embeddings.ts`

---

## Project Structure

```
app/
  api/chat/route.ts          # Main streaming chat endpoint
  api/webhooks/github/       # GitHub webhook receiver
  auth/                      # Login, signup, callback, error
  chat/                      # Chat list + [id] individual chat
  profile/ settings/         # User pages
  actions/                   # Server Actions

components/
  ui/                        # shadcn components (DO NOT edit these directly)
  chat-*.tsx                 # Chat UI components
  layout/                    # Header, Sidebar, etc.

lib/
  ai/
    agent.ts                 # ToolLoopAgent (GPT-4o-mini, max 5 steps)
    tools/                   # 25+ GitHub tools
    prompts.ts               # System prompts
  rag/                       # Embeddings, indexing, search
  supabase/                  # DB client setup
  services/                  # chats.ts, messages.ts, events.ts
  github/                    # Octokit + webhook dispatcher
  safety/                    # Content moderation (SuperAgent)
  auth.ts                    # GitHub OAuth

hooks/
  use-chat-controller.ts     # Main chat state
  use-chats.ts
  use-messages.ts

supabase/migrations/         # SQL migrations (versioned)
```

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `chats` | Chat sessions per user |
| `messages` | Messages per chat (role: user/assistant) |
| `documents` | RAG chunks with `embedding vector(1536)` |
| `github_events` | Incoming GitHub webhook events |

RLS is enabled on all tables. Users can only access their own data.

---

## Key Conventions

### API Routes
- Chat route uses `streamText` from Vercel AI SDK with 30s timeout
- Always validate chat ownership and run safety check before processing
- Fetch RAG context in parallel with other setup work

### AI Tools
- Defined using `tool()` from `ai` package
- `inputSchema` must be a `z.object({})` (AI SDK v6 — not `parameters`)
- Tools live in `lib/ai/tools/`, grouped by domain (repository/, rag/, etc.)
- Export all tools from `lib/ai/tools/index.ts`

### Components
- Use shadcn components from `components/ui/`
- Use `cn()` for merging Tailwind classes
- Prefer Server Components; add `"use client"` only for interactivity/hooks

### Auth
- Middleware (`middleware.ts`) protects all routes except `/`, `/auth/*`
- GitHub OAuth token retrieved from Supabase session as `provider_token`

---

## Environment Variables

```env
# Public
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Private
SUPABASE_SERVICE_ROLE_KEY=
GITHUB_WEBHOOK_SECRET=
SUPERAGENT_API_KEY=
```

OpenAI key for AI SDK is set via standard `OPENAI_API_KEY`.

---

## Dev Commands

```bash
npm run dev          # Next.js dev server + webhook proxy (concurrently)
npm run build        # Production build
npm run test         # Vitest
```

---

## Deployment

Hosted on **Vercel**. Environment variables set in Vercel dashboard. `next.config.mjs` includes security headers for CSP allowing Supabase + GitHub API origins.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
