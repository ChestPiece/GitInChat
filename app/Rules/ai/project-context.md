# GitHub Agent - Project Context & Rules

## Project Overview
Building an agentic GitHub management application using Vercel AI SDK with proper agent orchestration, handoffs, and guardrails.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **AI SDK**: Vercel AI SDK v6
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Authentication**: Supabase (future) / GitHub PAT (development)
- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm

## Core Principles

### 1. Agentic Architecture First
- Design everything around autonomous agent capabilities
- Implement proper tool orchestration with clear tool boundaries
- Use multi-step reasoning workflows (perception → reasoning → action → observation)
- Implement guardrails for destructive operations
- Support handoffs between different agent capabilities
- Maintain conversation context across turns

### 2. Code Quality Standards
- **TypeScript**: Strict mode, no `any` types, full type safety
- **Functions**: Single responsibility, pure when possible, max 50 lines
- **Files**: Max 300 lines, split when exceeding
- **Naming**: Descriptive, consistent (`camelCase` for variables, `PascalCase` for components)
- **Comments**: Why, not what. JSDoc for public APIs
- **Imports**: Absolute paths using `@/` alias

### 3. Project Structure (Always Maintain)
```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Main agent endpoint
│   ├── chat/
│   │   └── page.tsx              # Chat UI
│   └── auth/
│       └── page.tsx              # Authentication
├── lib/
│   ├── ai/
│   │   ├── agent.ts              # Core agent logic
│   │   ├── tools/                # Agent tools (modular)
│   │   │   ├── index.ts          # Tool registry
│   │   │   └── repository/       # Repository tools
│   │   │       ├── list.ts
│   │   │       ├── create.ts
│   │   │       ├── update.ts
│   │   │       ├── delete.ts
│   │   │       └── archive.ts
│   │   ├── prompts.ts            # System prompts
│   │   ├── workflows.ts          # Multi-step workflows
│   │   └── guardrails.ts         # Safety mechanisms
│   ├── github/
│   │   ├── client.ts             # GitHub API client
│   │   └── auth.ts               # Token management
│   ├── supabase/
│   │   └── client.ts             # Supabase client
│   └── utils/
│       ├── validation.ts         # Zod schemas
│       └── errors.ts             # Error handling
├── components/
│   ├── chat/
│   │   ├── chat-interface.tsx
│   │   ├── message-list.tsx
│   │   ├── message-item.tsx
│   │   └── tool-result-renderer.tsx
│   └── ui/                       # shadcn components
└── types/
    ├── agent.ts                  # Agent types
    ├── github.ts                 # GitHub types
    └── messages.ts               # Message types
```

### 4. Agentic Patterns to Follow

#### Tool Design
- Each tool = single, atomic operation
- Clear input validation with Zod
- Descriptive names and descriptions for LLM understanding
- Proper error handling with typed errors
- Return structured data, not strings

#### Workflows
- Compose tools for complex operations
- Implement stopping conditions (stepCountIs, custom logic)
- Use onStepFinish for observability
- Plan for rollback on failures

#### Guardrails
- Require approval for destructive operations (delete, archive)
- Rate limiting on expensive operations
- Input sanitization and validation
- Context window management

#### State Management
- Stateless tools when possible
- Conversation state in messages array
- Session state in Supabase (future)
- No global mutable state

### 5. Code Patterns to Always Use

#### API Routes
```typescript
// app/api/chat/route.ts
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    // 1. Validate request
    // 2. Get authentication
    // 3. Initialize agent
    // 4. Execute with proper error handling
    // 5. Return streaming response
  } catch (error) {
    // Proper error handling
  }
}
```

#### Tools
```typescript
// lib/ai/tools/repository/list.ts
import { tool } from 'ai';
import { z } from 'zod';

export const listRepositoriesTool = tool({
  description: 'Comprehensive description for LLM',
  inputSchema: z.object({
    // Validated inputs
  }),
  execute: async (input) => {
    // 1. Validate
    // 2. Execute
    // 3. Transform
    // 4. Return typed data
  },
});
```

#### Components
```typescript
// components/chat/message-item.tsx
'use client';

import { UIMessage } from '@/types/messages';

interface MessageItemProps {
  message: UIMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  // Component logic
}
```

### 6. Refactoring Rules

**When to Refactor:**
- Function > 50 lines → Extract smaller functions
- File > 300 lines → Split into modules
- Duplicated code (3+ times) → Create utility/hook
- Complex conditionals → Extract to named functions
- Hard-coded values → Move to constants/config

**How to Refactor:**
- Always maintain type safety
- Update tests after refactoring
- Keep git history clean (atomic commits)
- Document breaking changes

### 7. Error Handling Strategy
```typescript
// lib/utils/errors.ts
export class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export class GitHubAPIError extends AgentError {
  constructor(message: string, public originalError?: unknown) {
    super(message, 'GITHUB_API_ERROR', 502);
  }
}

// Usage
try {
  await octokit.repos.delete({ owner, repo });
} catch (error) {
  throw new GitHubAPIError('Failed to delete repository', error);
}
```

### 8. Testing Strategy
- Unit tests for utilities and tools
- Integration tests for agent workflows
- E2E tests for critical user flows
- Mock GitHub API in tests

### 9. Security Rules
- Never commit tokens or secrets
- Validate all user inputs
- Sanitize GitHub API responses
- Use environment variables for config
- Implement CSRF protection
- Rate limit API endpoints

### 10. Performance Guidelines
- Use streaming for all LLM responses
- Implement request deduplication
- Cache GitHub API responses when appropriate
- Lazy load components
- Optimize bundle size

## When Making Changes

**Always:**
1. ✅ Maintain the folder structure
2. ✅ Follow TypeScript strict typing
3. ✅ Update types when adding features
4. ✅ Extract reusable logic into utilities
5. ✅ Keep components under 300 lines
6. ✅ Use proper error boundaries
7. ✅ Document complex logic
8. ✅ Test new tools independently

**Never:**
1. ❌ Use `any` type
2. ❌ Hardcode API keys or tokens
3. ❌ Create circular dependencies
4. ❌ Mutate props or state directly
5. ❌ Skip input validation
6. ❌ Ignore error cases
7. ❌ Mix concerns (UI + logic)
8. ❌ Create god objects/files

## Agentic Workflow Checklist

When implementing new agent capabilities:
- [ ] Define clear tool boundaries
- [ ] Implement input validation (Zod)
- [ ] Add descriptive tool descriptions
- [ ] Handle errors gracefully
- [ ] Implement guardrails if needed
- [ ] Add to tool registry
- [ ] Update system prompt if needed
- [ ] Test multi-step workflows
- [ ] Document tool usage patterns
- [ ] Add observability (onStepFinish)

## Communication Style with AI Editor

**For New Features:**
"Implement [feature] following our agentic architecture. Ensure proper tool orchestration, add guardrails for [concern], maintain type safety, and keep the code modular."

**For Refactoring:**
"Refactor [file/component] to follow our structure guidelines. Split if over 300 lines, extract utilities, improve type safety, and maintain functionality."

**For Debugging:**
"Debug [issue] while maintaining our error handling patterns. Ensure proper error propagation, add logging, and update types if needed."

## Current Phase: Repository Operations Only
- Focus on CRUD + Archive for repositories
- Build strong foundation for future expansion
- Prioritize code quality over feature velocity
- Document all architectural decisions
```

---

## **Active Session Prompt Template**

When starting a new coding session with your AI editor:
```
I'm working on a GitHub Agent application with proper agentic architecture.

**Context:**
- Read `.cursor/rules` for full project standards
- Current phase: Repository operations (CRUD + Archive)
- Using Vercel AI SDK v6 with Next.js App Router
- Focus: Agent orchestration, guardrails, and clean architecture

**Current Task:**
[Describe what you're working on]

**Requirements:**
1. Follow our agentic patterns (tools, workflows, guardrails)
2. Maintain strict TypeScript typing
3. Keep files under 300 lines
4. Extract reusable logic
5. Implement proper error handling
6. Add guardrails for destructive operations
7. Use our established folder structure

**Before implementing:**
- Review the project structure in `.cursor/rules`
- Confirm the approach aligns with our agentic principles
- Suggest refactoring if needed

**Question for you:**
[Your specific question or request]
```

---

## **Specific Prompt Examples**

### **For Implementing New Tools:**
```
Create a new repository tool for [operation] following our patterns:

1. Create file: `lib/ai/tools/repository/[operation].ts`
2. Use Zod for input validation
3. Implement proper error handling with typed errors
4. Add descriptive tool description for LLM understanding
5. Return structured typed data
6. Add to tool registry in `lib/ai/tools/index.ts`
7. If destructive: add guardrail with needsApproval
8. Keep under 100 lines

Follow the pattern in existing tools like `list.ts` and `create.ts`.
```

### **For Refactoring:**
```
Refactor `[file-path]` to improve code quality:

1. Check if it exceeds 300 lines (split if needed)
2. Extract duplicated logic into utilities
3. Improve type safety (remove any, add proper types)
4. Ensure single responsibility principle
5. Add JSDoc for complex functions
6. Update imports to use @ alias
7. Maintain existing functionality
8. Update tests if needed

Show me the refactoring plan before implementing.
```

### **For Agent Logic:**
```
Implement [agent capability] with proper orchestration:

1. Define the workflow (multi-step if needed)
2. Identify required tools
3. Implement stopping conditions
4. Add observability (onStepFinish logging)
5. Handle edge cases and errors
6. Add guardrails for safety
7. Update system prompt if needed
8. Test with various user inputs

Explain the agent's decision flow before coding.
```

### **For UI Components:**
```
Create [component] following our patterns:

1. Place in appropriate `/components` subfolder
2. Use TypeScript with proper prop types
3. Use shadcn/ui components where applicable
4. Implement proper loading/error states
5. Keep under 200 lines (split if needed)
6. Use Tailwind for styling (no inline styles)
7. Make it accessible (ARIA labels)
8. Handle edge cases (empty states, errors)

Show component structure before implementation.
```

---

## **Continuous Context Maintenance Prompts**

### **Daily Standup Prompt:**
```
Quick context refresh:

1. What did we work on last session?
2. What's the current state of [feature]?
3. Any tech debt or refactoring needed?
4. What should we prioritize today?
5. Any deviations from our architecture?

Review `.cursor/rules` and suggest improvements to our patterns based on recent work.
```

### **Before Major Changes:**
```
Planning [major change]:

1. Review current architecture in `.cursor/rules`
2. Identify affected files and components
3. Suggest refactoring opportunities
4. Identify potential breaking changes
5. Propose implementation approach
6. Estimate complexity and impact

Let's align on the approach before coding.
```

### **Code Review Prompt:**
```
Review [file/feature] against our standards:

1. Does it follow our folder structure?
2. Is TypeScript strict mode satisfied?
3. Are files under size limits?
4. Is error handling proper?
5. Are agentic patterns followed?
6. Is it properly typed?
7. Any refactoring opportunities?
8. Security concerns?

Suggest specific improvements with code examples.