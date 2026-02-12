# Task M-010: Implement Global Error Boundary (Next.js)

## 1. Context

Current Phase: Phase 5 (Finalize & Verify)
Goal: Implement robust error handling for the entire application using Next.js file conventions.
Current State: Missing `app/error.tsx`, `app/global-error.tsx`, and `app/not-found.tsx`.

## 2. Requirements (Vibe Coding & Error Handling Patterns)

### Vibe Coding Principles:

- **Deep Analysis First**: Verified missing files. Checked `layout.tsx` (next step).
- **Quality Standards**:
  - Unified error handling (Next.js Error Boundary).
  - Meaningful error messages (user-friendly UI).
  - Retry mechanism (using `reset` function).
  - Logging (log error to console/service).

### Error Handling Patterns:

- **Recoverable Errors**: Use `error.tsx` with retry button.
- **Unrecoverable Errors**: Use `global-error.tsx` fallback.
- **Not Found**: Use `not-found.tsx` with friendly navigation options.

## 3. Implementation Plan

- [x] Analyze `app/layout.tsx` for root HTML structure. <!-- id: 0 -->
- [x] Create `app/error.tsx` (Route Segment Error Boundary). <!-- id: 1 -->
  - Client component.
  - Props: `error: Error & { digest?: string }`, `reset: () => void`.
  - UI: Friendly message, error details (in dev), "Try again" button.
- [x] Create `app/global-error.tsx` (Root Error Boundary). <!-- id: 2 -->
  - Must include `<html>` and `<body>` tags.
  - Catch-all for root layout errors.
- [x] Create `app/not-found.tsx`. <!-- id: 3 -->
  - UI: 404 message, link to home.
- [x] Verify error handling by triggering test errors (optional/manual). <!-- id: 4 -->

## 4. Progress

- [x] Start Task <!-- id: 5 -->
