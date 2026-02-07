---
name: error-handling-patterns
description: Master error handling patterns across languages including exceptions, Result types, error propagation, and graceful degradation to build resilient applications. Use when implementing error handling, designing APIs, or improving application reliability.
---

# Error Handling Patterns

Build resilient applications with robust error handling strategies that gracefully handle failures and provide excellent debugging experiences.

## When to Use This Skill

- Implementing error handling in new features
- Designing error-resilient APIs
- Debugging production issues
- Improving application reliability
- Creating better error messages for users and developers
- Implementing retry and circuit breaker patterns
- Handling async/concurrent errors
- Building fault-tolerant distributed systems

## Core Concepts

### 1. Error Handling Philosophies

**Exceptions vs Result Types:**

- **Exceptions:** Traditional try-catch, disrupts control flow. Use for unexpected errors, exceptional conditions.
- **Result Types:** Explicit success/failure, functional approach. Use for expected errors, validation failures.
- **Error Codes:** C-style, requires discipline.
- **Option/Maybe Types:** For nullable values.
- **Panics/Crashes:** Unrecoverable errors, programming bugs.

### 2. Error Categories

**Recoverable Errors:**

- Network timeouts, Missing files, Invalid user input, API rate limits.

**Unrecoverable Errors:**

- Out of memory, Stack overflow, Programming bugs (null pointer, etc.).

## Language-Specific Patterns

### Python Error Handling

**Custom Exception Hierarchy:**

```python
class ApplicationError(Exception):
    """Base exception for all application errors."""
    def __init__(self, message: str, code: str = None, details: dict = None):
        super().__init__(message)
        self.code = code
        self.details = details or {}
        self.timestamp = datetime.utcnow()

class ValidationError(ApplicationError):
    pass

class NotFoundError(ApplicationError):
    pass
```

**Context Managers for Cleanup:**

```python
from contextlib import contextmanager

@contextmanager
def database_transaction(session):
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        raise
    finally:
        session.close()
```

**Retry with Exponential Backoff:**

```python
# (See full implementation in scripts if needed, or inline)
# ... retry decorator logic ...
@retry(max_attempts=3, exceptions=(NetworkError,))
def fetch_data(url: str) -> dict:
    response = requests.get(url, timeout=5)
    response.raise_for_status()
    return response.json()
```

### TypeScript/JavaScript Error Handling

**Custom Error Classes:**

```typescript
class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

**Result Type Pattern:**

```typescript
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
// ... helper functions Ok, Err ...
```

### Rust & Go Error Handling

_(Support for Result types, Option types, and explicit error returns - see full docs for details)_

## Universal Patterns

### Pattern 1: Circuit Breaker

Prevent cascading failures in distributed systems.
_(Example implementation available in Python/TS)_

### Pattern 2: Error Aggregation

Collect multiple errors instead of failing on first error.

### Pattern 3: Graceful Degradation

Provide fallback functionality when errors occur.

```python
def with_fallback(primary, fallback):
    try:
        return primary()
    except Exception:
        return fallback()
```

## Best Practices

- **Fail Fast:** Validate input early, fail quickly.
- **Preserve Context:** Include stack traces, metadata, timestamps.
- **Meaningful Messages:** Explain what happened and how to fix it.
- **Log Appropriately:** Error = log, expected failure = don't spam logs.
- **Clean Up Resources:** Use try-finally, context managers, defer.

## Common Pitfalls

- Catching Too Broadly (`except Exception`).
- Empty Catch Blocks.
- Logging and Re-throwing (duplicate logs).
- Not Cleaning Up.

## Resources

- `references/exception-hierarchy-design.md`
- `references/error-recovery-strategies.md`
- `references/async-error-handling.md`
- `assets/error-handling-checklist.md`
- `scripts/error-analyzer.py`
