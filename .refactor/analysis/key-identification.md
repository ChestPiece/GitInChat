# Phase 1: Key Identification

## 1.1 Core Feature List

### Feature 1: Chat Interface

- **User Story**: User interacts with the AI agent to manage GitHub repositories.
- **Entry Point**: `app/chat/page.tsx` (UI), `app/api/chat/route.ts` (API)
- **Involved Modules**:
  - `components/chat-message.tsx`
  - `components/chat-input.tsx`
  - `hooks/use-chats.ts`
  - `lib/services/messages.ts` (Persistence)
- **Complexity**: High (Real-time streaming, Tool invocations, Optimistic updates)

### Feature 2: GitHub Agent & Tools

- **User Story**: The AI processes natural language requests and executes GitHub operations.
- **Entry Point**: `lib/ai/agent.ts`
- **Involved Modules**:
  - `lib/ai/tools/index.ts` (Tool Registry)
  - `lib/ai/tools/repository/*` (Specific Tools)
  - `lib/ai/prompts.ts` (System Prompt)
- **Complexity**: High (Tool orchestration, Error handling, Multi-step logic)

### Feature 3: Authentication & User Session

- **User Story**: User logs in via GitHub/Supabase to access their data.
- **Entry Point**: `app/auth/login/page.tsx` (implied), `lib/auth.ts`
- **Involved Modules**:
  - `lib/supabase/client.ts`
  - `lib/supabase/server.ts`
  - `app/api/chat/route.ts` (Session validation)
- **Complexity**: Medium (Session management, RLS)

## 1.2 High-Frequency Code

1.  **`components/ui/*`**: Standard UI components used across all pages.
2.  **`lib/utils.ts` (`cn`)**: CSS class merging, used in almost every component.
3.  **`lib/services/messages.ts`**: Used by both UI (fetch history) and API (save messages).
4.  **`lib/supabase/server.ts`**: Used in API routes and Server Actions.

## 1.3 Key Path Tracing: Chat Message Flow

1.  **User Input**: `ChatInput` component (`app/chat/page.tsx`) captures text.
2.  **Client-Side Send**: `handleSendMessage` calls `useChat.sendMessage`.
3.  **API Request**: POST to `/api/chat` with message history.
4.  **Auth Check**: `route.ts` verifies Supabase session.
5.  **Persistence (User)**: `route.ts` saves user message via `messagesService.createMessage`.
6.  **AI Processing**: `createAgentUIStreamResponse` invokes `githubAgent`.
7.  **Tool Execution**: `githubAgent` calls imports from `lib/ai/tools` (e.g., `listRepositories`).
8.  **Streaming Response**: Steps and text stream back to client.
9.  **Persistence (Assistant)**: `onStepFinish` saves assistant response.
10. **UI Update**: `useChat` updates `messages` state, `ChatMessage` renders new content.
