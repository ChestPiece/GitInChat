# Feature Analysis: GitHub Agent

## Basic Information

- **Entry**: `lib/ai/agent.ts`
- **Files Involved**:
  - `lib/ai/agent.ts`
  - `lib/ai/tools/index.ts`
  - `lib/ai/tools/**/*.ts`
- **Call Chain**: `AI SDK -> Agent -> Tool -> GitHub API`

## Vibe Coding Problem Detection

### 1. Pattern Consistency Detection

- **Error Handling**:
  - `createRepository`: Uses `try-catch` and returns a string message on error.
  - `listRepositories`: Returns result directly.
  - **Inconsistent**: Some tools return structured objects `{ success: boolean, data?: any, error?: string }` while others return raw data or string messages.
- **Return Types**:
  - `Tool` return types vary wildly. Should unify to a standard `ToolResult<T>`.

### 2. Code Quality Detection

- **Type Safety**:
  - `any` usage in `catch` blocks is common (e.g., `error: any`). Should use `induceError(error)` utility or strictly type the error.
  - **Zod Schema**: Defined inline in many tools. Could be extracted for reuse if needed.

## Refactoring Suggestions

1.  **Standardize Tool Result**: Implement a `ToolResult<T>` wrapper class/interface for all tools to return consistent `{ success, data, error }` structure.
2.  **Unified Error Handling**: Create a `handleToolError(error)` utility to standardize error message formatting.
3.  **Schema Extraction**: Move Zod schemas to `lib/ai/schemas/` if they become complex or shared.
