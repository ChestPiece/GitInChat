# Vercel AI SDK Documentation for Next.js - GitHub Management Agent

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Core Concepts](#core-concepts)
4. [Building Agents](#building-agents)
5. [AI SDK UI - Chat Interface](#ai-sdk-ui---chat-interface)
6. [Tool Calling](#tool-calling)
7. [Provider Management](#provider-management)
8. [Authentication with Supabase](#authentication-with-supabase)
9. [Deployment](#deployment)
10. [Best Practices](#best-practices)

---

## Introduction

The Vercel AI SDK is a TypeScript toolkit designed to help developers build AI-powered applications and agents with React, Next.js, Vue, Svelte, Node.js, and more.

### Why Use the AI SDK?

- **Provider Agnostic**: Standardizes integrating AI models across supported providers (OpenAI, Anthropic, Google, etc.)
- **Unified API**: Consistent interface regardless of model provider
- **Built-in Streaming**: Real-time response streaming
- **Tool Calling**: Extend LLM capabilities with custom tools
- **Agent Support**: Built-in support for multi-step agentic workflows
- **Framework Integration**: First-class support for Next.js, React, and other frameworks

### Key Libraries

1. **AI SDK Core**: Unified API for generating text, structured objects, tool calls, and building agents
2. **AI SDK UI**: Framework-agnostic hooks for building chat and generative user interfaces
3. **AI SDK RSC**: React Server Components support

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm, npm, or yarn
- Vercel AI Gateway API key (or provider-specific API keys)

### Installation

```bash
# Create Next.js app
pnpm create next-app@latest my-github-agent

# Navigate to directory
cd my-github-agent

# Install AI SDK packages
pnpm add ai @ai-sdk/react zod

# For specific providers (optional)
pnpm add @ai-sdk/openai @ai-sdk/anthropic
```

### Environment Variables

Create `.env.local`:

```env
# Vercel AI Gateway (recommended - access all providers with one key)
AI_GATEWAY_API_KEY=your_api_key_here

# Or use specific providers
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Supabase (for auth)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# GitHub (for OAuth and API)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_TOKEN=your_github_personal_access_token
```

---

## Core Concepts

### 1. Generating Text

Basic text generation with streaming:

```typescript
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = streamText({
    model: 'anthropic/claude-sonnet-4.5',
    messages,
  });
  
  return result.toDataStreamResponse();
}
```

### 2. Provider Configuration

#### Using Vercel AI Gateway (Default)

```typescript
import { generateText } from 'ai';

const { text } = await generateText({
  model: 'anthropic/claude-sonnet-4.5', // or 'openai/gpt-4', etc.
  prompt: 'Hello!',
});
```

#### Using Direct Provider

```typescript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const { text } = await generateText({
  model: openai('gpt-4'),
  prompt: 'Hello!',
});
```

### 3. Messages Format

The AI SDK uses two message types:

**UIMessage**: For UI components (includes metadata)
```typescript
type UIMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: MessagePart[];
  timestamp?: Date;
  // ... other UI metadata
}
```

**ModelMessage**: For model API calls (stripped metadata)
```typescript
import { convertToModelMessages } from 'ai';

const modelMessages = await convertToModelMessages(uiMessages);
```

---

## Building Agents

### What are Agents?

Agents are LLMs that use tools in a loop to accomplish tasks. They handle:
- **Tool execution**: Calling external functions/APIs
- **Context management**: Maintaining conversation history
- **Stopping conditions**: Determining when the task is complete

### Agent Class (Recommended)

The `ToolLoopAgent` class simplifies agent creation:

```typescript
import { ToolLoopAgent, tool } from 'ai';
import { z } from 'zod';

const githubAgent = new ToolLoopAgent({
  model: 'anthropic/claude-sonnet-4.5',
  system: 'You are a helpful GitHub management assistant.',
  tools: {
    listRepos: tool({
      description: 'List all repositories for the authenticated user',
      inputSchema: z.object({}),
      execute: async () => {
        // Call GitHub API
        const response = await fetch('https://api.github.com/user/repos', {
          headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          },
        });
        return await response.json();
      },
    }),
  },
});
```

### Multi-Step Workflows with stopWhen

Control when the agent loop stops:

```typescript
import { streamText, stepCountIs } from 'ai';

const result = streamText({
  model: 'anthropic/claude-sonnet-4.5',
  messages,
  stopWhen: stepCountIs(5), // Allow up to 5 steps
  tools: {
    // your tools
  },
  onStepFinish: ({ toolResults }) => {
    console.log('Step completed:', toolResults);
  },
});
```

### Agent Workflow Pattern

```typescript
// app/api/agent/route.ts
import { ToolLoopAgent } from 'ai';

const agent = new ToolLoopAgent({
  model: 'anthropic/claude-sonnet-4.5',
  system: `You are a GitHub management agent. Help users manage their repositories,
           issues, pull requests, and other GitHub operations.`,
  tools: {
    // Define your GitHub tools here
  },
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = await agent.execute({
    messages,
  });
  
  return result.toDataStreamResponse();
}
```

---

## AI SDK UI - Chat Interface

### useChat Hook

The `useChat` hook abstracts chat interface complexity:

```typescript
'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  
  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          {message.role}: {message.content}
        </div>
      ))}
      
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about your repos..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

### useChat with sendMessage (New API)

```typescript
'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();
  
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto">
      {messages.map(message => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <div key={`${message.id}-${i}`}>{part.text}</div>;
              case 'tool-listRepos':
                return (
                  <pre key={`${message.id}-${i}`}>
                    {JSON.stringify(part, null, 2)}
                  </pre>
                );
            }
          })}
        </div>
      ))}
      
      <form
        onSubmit={e => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput('');
        }}
      >
        <input
          value={input}
          placeholder="Say something..."
          onChange={e => setInput(e.currentTarget.value)}
        />
      </form>
    </div>
  );
}
```

### Message Parts

Messages contain an ordered array of `parts`:

```typescript
type MessagePart = 
  | { type: 'text'; text: string }
  | { type: 'tool-{toolName}'; toolCallId: string; args: any; result: any }
  | { type: 'image'; image: string }
  // ... more types

// Rendering parts
{message.parts.map((part, i) => {
  switch (part.type) {
    case 'text':
      return <div>{part.text}</div>;
    case 'tool-listRepos':
      return <RepoList data={part.result} />;
    default:
      return null;
  }
})}
```

---

## Tool Calling

### Defining Tools

Tools extend LLM capabilities to interact with external systems:

```typescript
import { tool } from 'ai';
import { z } from 'zod';

const githubTools = {
  listRepos: tool({
    description: 'List all repositories for the authenticated user',
    inputSchema: z.object({
      sort: z.enum(['created', 'updated', 'pushed', 'full_name']).optional(),
      direction: z.enum(['asc', 'desc']).optional(),
    }),
    execute: async ({ sort = 'updated', direction = 'desc' }) => {
      const response = await fetch(
        `https://api.github.com/user/repos?sort=${sort}&direction=${direction}`,
        {
          headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      return await response.json();
    },
  }),
  
  createIssue: tool({
    description: 'Create a new issue in a repository',
    inputSchema: z.object({
      owner: z.string().describe('Repository owner'),
      repo: z.string().describe('Repository name'),
      title: z.string().describe('Issue title'),
      body: z.string().describe('Issue description').optional(),
      labels: z.array(z.string()).optional(),
    }),
    execute: async ({ owner, repo, title, body, labels }) => {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues`,
        {
          method: 'POST',
          headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, body, labels }),
        }
      );
      return await response.json();
    },
  }),
  
  listPullRequests: tool({
    description: 'List pull requests for a repository',
    inputSchema: z.object({
      owner: z.string(),
      repo: z.string(),
      state: z.enum(['open', 'closed', 'all']).default('open'),
    }),
    execute: async ({ owner, repo, state }) => {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}`,
        {
          headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      return await response.json();
    },
  }),
  
  mergePullRequest: tool({
    description: 'Merge a pull request',
    inputSchema: z.object({
      owner: z.string(),
      repo: z.string(),
      pull_number: z.number(),
      merge_method: z.enum(['merge', 'squash', 'rebase']).optional(),
    }),
    execute: async ({ owner, repo, pull_number, merge_method = 'merge' }) => {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/merge`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ merge_method }),
        }
      );
      return await response.json();
    },
  }),
};
```

### Tool Approval (Human-in-the-Loop)

For sensitive operations, require approval:

```typescript
const deleteRepoTool = tool({
  description: 'Delete a repository (DESTRUCTIVE)',
  needsApproval: true, // Require user approval
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
  }),
  execute: async ({ owner, repo }) => {
    // This only runs after user approves
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        },
      }
    );
    return { deleted: response.ok };
  },
});
```

Conditional approval:

```typescript
needsApproval: ({ args }) => {
  // Auto-approve listing operations
  if (args.operation === 'list') return false;
  // Require approval for destructive operations
  return args.operation === 'delete';
}
```

### Handling Tool Approval in UI

```typescript
'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, sendMessage, addToolApprovalResponse } = useChat();
  
  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          {message.parts.map((part, i) => {
            if (part.type.startsWith('tool-') && part.state === 'awaiting-approval') {
              return (
                <div key={i}>
                  <p>Approve deleting repo: {part.args.repo}?</p>
                  <button onClick={() => addToolApprovalResponse(part.toolCallId, true)}>
                    Approve
                  </button>
                  <button onClick={() => addToolApprovalResponse(part.toolCallId, false)}>
                    Deny
                  </button>
                </div>
              );
            }
            return <div key={i}>{/* render other parts */}</div>;
          })}
        </div>
      ))}
    </div>
  );
}
```

---

## Provider Management

### Global Provider Configuration

Set a default provider for your entire application:

```typescript
// lib/ai-config.ts
import { openai } from '@ai-sdk/openai';
import { setGlobalProvider } from 'ai';

// Set OpenAI as the default provider
setGlobalProvider(openai);
```

Now use string references everywhere:

```typescript
import { generateText } from 'ai';

// Uses OpenAI because it's the global provider
const { text } = await generateText({
  model: 'gpt-4',
  prompt: 'Hello',
});
```

### Multiple Providers

```typescript
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

// Use different models for different tasks
const summaryResult = await generateText({
  model: openai('gpt-4'),
  prompt: 'Summarize...',
});

const codeResult = await generateText({
  model: anthropic('claude-sonnet-4'),
  prompt: 'Write code...',
});
```

---

## Authentication with Supabase

### Setup Supabase Client

```typescript
// lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();
```

### GitHub OAuth Flow

```typescript
// app/auth/page.tsx
'use client';

import { supabase } from '@/lib/supabase';

export default function Auth() {
  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'repo user',
      },
    });
    
    if (error) console.error('Error:', error);
  };
  
  return (
    <button onClick={signInWithGitHub}>
      Sign in with GitHub
    </button>
  );
}
```

### Auth Callback

```typescript
// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }
  
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
```

### Protected Routes

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session && req.nextUrl.pathname.startsWith('/chat')) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }
  
  return res;
}

export const config = {
  matcher: ['/chat/:path*'],
};
```

### Get User's GitHub Token

```typescript
// app/api/chat/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Get GitHub access token
  const githubToken = session.provider_token;
  
  // Use token in GitHub API calls
  const result = streamText({
    model: 'anthropic/claude-sonnet-4.5',
    messages,
    tools: {
      listRepos: tool({
        execute: async () => {
          const response = await fetch('https://api.github.com/user/repos', {
            headers: {
              'Authorization': `token ${githubToken}`,
            },
          });
          return await response.json();
        },
      }),
    },
  });
  
  return result.toDataStreamResponse();
}
```

---

## Deployment

### Vercel Deployment

1. **Push to GitHub**
2. **Import to Vercel**
3. **Configure Environment Variables**
4. **Deploy**

```bash
# Or use Vercel CLI
pnpm i -g vercel
vercel
```

### Fluid Compute Benefits

Vercel's Fluid Compute is ideal for AI agents:
- Minimal cold starts
- Background task support
- Extended function durations (60-800s depending on plan)
- Automatic scaling

```typescript
// app/api/agent/route.ts
export const maxDuration = 300; // 5 minutes

export async function POST(req: Request) {
  // Your agent logic
}
```

---

## Best Practices

### 1. Error Handling

```typescript
import { streamText } from 'ai';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const result = streamText({
      model: 'anthropic/claude-sonnet-4.5',
      messages,
      tools: githubTools,
    });
    
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Agent error:', error);
    return new Response('Error processing request', { status: 500 });
  }
}
```

### 2. Tool Descriptions

Write clear, specific tool descriptions:

```typescript
// ❌ Bad
description: 'List repos'

// ✅ Good
description: `List all repositories for the authenticated user. 
Returns repository name, description, stars, and last updated timestamp.
Use this when the user asks to see their repos or wants an overview of their GitHub projects.`
```

### 3. Input Validation

Always use Zod schemas for validation:

```typescript
inputSchema: z.object({
  repo: z.string().min(1).describe('Repository name (required)'),
  owner: z.string().min(1).describe('Repository owner username'),
  issue_number: z.number().positive().describe('Issue number to update'),
}),
```

### 4. Streaming for Better UX

Always stream responses for real-time feedback:

```typescript
// Use streamText, not generateText for user-facing features
const result = streamText({
  model: 'anthropic/claude-sonnet-4.5',
  messages,
});

return result.toDataStreamResponse();
```

### 5. Context Management

Keep conversation history relevant:

```typescript
// Limit message history
const recentMessages = messages.slice(-10);

const result = streamText({
  model: 'anthropic/claude-sonnet-4.5',
  messages: recentMessages,
});
```

### 6. Rate Limiting

Implement rate limiting for API calls:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for');
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  // Continue with agent logic
}
```

### 7. Monitoring and Observability

Use AI SDK DevTools for debugging:

```typescript
import { generateText } from 'ai';

const result = await generateText({
  model: 'anthropic/claude-sonnet-4.5',
  prompt: 'Hello',
  experimental_telemetry: {
    isEnabled: true,
    functionId: 'my-github-agent',
  },
});
```

### 8. Type Safety

Leverage TypeScript for tool outputs:

```typescript
type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  updated_at: string;
};

const listRepos = tool({
  description: 'List repositories',
  inputSchema: z.object({}),
  execute: async (): Promise<GitHubRepo[]> => {
    const response = await fetch('https://api.github.com/user/repos');
    return await response.json();
  },
});
```

---

## Complete Example: GitHub Agent

```typescript
// app/api/chat/route.ts
import { streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Get authenticated user's GitHub token
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    const githubToken = session.provider_token;
    
    const result = streamText({
      model: 'anthropic/claude-sonnet-4.5',
      messages,
      system: `You are a helpful GitHub management assistant. 
               Help users manage their repositories, issues, and pull requests.
               Always confirm before performing destructive operations.`,
      stopWhen: stepCountIs(10),
      tools: {
        listRepos: tool({
          description: 'List all repositories for the authenticated user',
          inputSchema: z.object({
            sort: z.enum(['created', 'updated', 'pushed']).optional(),
          }),
          execute: async ({ sort = 'updated' }) => {
            const response = await fetch(
              `https://api.github.com/user/repos?sort=${sort}&per_page=50`,
              {
                headers: {
                  'Authorization': `token ${githubToken}`,
                  'Accept': 'application/vnd.github.v3+json',
                },
              }
            );
            return await response.json();
          },
        }),
        
        createIssue: tool({
          description: 'Create a new issue in a repository',
          inputSchema: z.object({
            owner: z.string(),
            repo: z.string(),
            title: z.string(),
            body: z.string().optional(),
          }),
          execute: async ({ owner, repo, title, body }) => {
            const response = await fetch(
              `https://api.github.com/repos/${owner}/${repo}/issues`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `token ${githubToken}`,
                  'Accept': 'application/vnd.github.v3+json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, body }),
              }
            );
            return await response.json();
          },
        }),
        
        listIssues: tool({
          description: 'List issues for a repository',
          inputSchema: z.object({
            owner: z.string(),
            repo: z.string(),
            state: z.enum(['open', 'closed', 'all']).default('open'),
          }),
          execute: async ({ owner, repo, state }) => {
            const response = await fetch(
              `https://api.github.com/repos/${owner}/${repo}/issues?state=${state}`,
              {
                headers: {
                  'Authorization': `token ${githubToken}`,
                  'Accept': 'application/vnd.github.v3+json',
                },
              }
            );
            return await response.json();
          },
        }),
      },
      onStepFinish: ({ toolResults }) => {
        console.log('Step completed:', toolResults);
      },
    });
    
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
```

```typescript
// app/chat/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, isLoading } = useChat();
  
  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">GitHub Agent</h1>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`p-4 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-100 ml-auto max-w-[80%]' 
                : 'bg-gray-100 mr-auto max-w-[80%]'
            }`}
          >
            <div className="font-semibold mb-2">
              {message.role === 'user' ? 'You' : 'Agent'}
            </div>
            {message.parts.map((part, i) => {
              switch (part.type) {
                case 'text':
                  return <div key={i}>{part.text}</div>;
                case 'tool-listRepos':
                  return (
                    <div key={i} className="mt-2">
                      <div className="font-mono text-sm">
                        <div className="font-semibold">Repositories:</div>
                        {part.result.map((repo: any) => (
                          <div key={repo.id} className="ml-4">
                            • {repo.name} ({repo.stargazers_count} ⭐)
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>
        ))}
        {isLoading && <div className="text-gray-500">Thinking...</div>}
      </div>
      
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage({ text: input });
          setInput('');
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me to manage your GitHub repos..."
          className="flex-1 p-3 border rounded-lg"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
```

---

## Additional Resources

- **Official Docs**: https://ai-sdk.dev/docs
- **GitHub**: https://github.com/vercel/ai
- **Community**: https://community.vercel.com
- **Examples**: https://vercel.com/templates?type=ai
- **API Reference**: https://ai-sdk.dev/docs/reference

---

## Summary

This documentation provides a comprehensive guide to building a GitHub management agent using:
- ✅ Vercel AI SDK for agent orchestration
- ✅ Next.js App Router for the application framework
- ✅ Supabase for GitHub OAuth authentication
- ✅ shadcn/ui for UI components
- ✅ Multi-step tool calling for complex GitHub operations
- ✅ Real-time streaming for better UX

The combination of these technologies allows you to build a powerful, production-ready agentic interface for GitHub management that reduces manual work and automates repetitive tasks.