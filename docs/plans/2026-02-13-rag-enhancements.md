# Agentic RAG Enhancements Design

Date: 2026-02-13

## Goal

Transform the current "Search Tool" into a fully "Agentic" RAG system that can reason, explore, and synthesize information across multiple steps.

## Principles

1.  **Multi-Step Reasoning**: The agent should not just "search and answer". It should "search, read, refine, and answer".
2.  **Transparent Execution**: The user should see the agent's "thought process" via tool call visualizations.
3.  **Deep Context**: The agent must be able to read full files, not just snippets.

## Architecture Changes

### 1. New Tool: `readProjectFile`

- **Purpose**: Allow the agent to read the full content of a file found via search.
- **Input**: `filePath` (string).
- **Safety**: Must validate path is within project root and not in restricted headers (env files).
- **Implementation**: `lib/ai/tools/read-file.ts`.

### 2. Tool Enhancement: `searchCodebase`

- **Current**: Returns a string formatted with markdown.
- **Change**: Return a structured JSON object `{ results: [{ file, content, similarity }] }` (or keep string for LLM readability but add UI handling).
- **Decision**: Keep string return for LLM simplicity, but ensure the UI handles the string output gracefully or parses it if needed. Actually, let's keep it simple for now.

### 3. System Prompt Update

- **File**: `lib/ai/prompts.ts`.
- **Change**: Add specific instructions for RAG loop:
  - "When asked a technical question, always search the codebase first."
  - "If the search results are incomplete, read the full file using `readProjectFile`."
  - "If no results found, try a broader query."

### 4. UI Rendering (`ChatToolInvocation`)

- **File**: `components/chat-tool-invocation.tsx`.
- **Change**: Add specific case for `searchCodebase` to render results in a scrollable, syntax-highlighted list instead of a raw JSON dump or plain text block.
- **Change**: Add specific case for `readProjectFile` to show a "File Redad" badge or collapsible content.

## Workflow

1.  **User**: "How does the auth system work?"
2.  **Agent**: Calls `searchCodebase({ query: "auth flows" })`.
3.  **UI**: Shows "Searching codebase for 'auth flows'..." -> "Found 5 snippets".
4.  **Agent**: Analyzes snippets. Decides to read `lib/auth.ts`.
5.  **Agent**: Calls `readProjectFile({ filePath: "lib/auth.ts" })`.
6.  **UI**: Shows "Reading lib/auth.ts...".
7.  **Agent**: Synthesizes answer and replies to user.

## Implementation Steps

1.  Create `readProjectFile` tool.
2.  Register tool in `index.ts`.
3.  Update `components/chat-tool-invocation.tsx` to handle `searchCodebase` and `readProjectFile` nicely.
4.  Update System Prompt.
5.  Verify with a multi-step query.
