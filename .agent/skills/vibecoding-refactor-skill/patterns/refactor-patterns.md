# Refactoring Patterns

Standard refactoring patterns for Vibe Coding problems.

## Pattern Overview

```
Problem → Pattern
├── Multiple implementations coexist → Unification pattern
├── Patch code → Cleanup pattern
├── Over-defensive → Simplification pattern
├── Copy-paste → Extraction pattern
└── Architecture decay → Restructuring pattern
```

---

## Pattern 1: Unify Multiple Implementations

### Scenario
Same functionality has multiple implementation methods (e.g., API calls, error handling, state management)

### Strategy

```
1. Identify all implementation methods
2. Evaluate pros and cons of each
3. Select best implementation as target
4. Plan migration
5. Migrate in one go
```

### Execution Steps

```markdown
Step 1: Identify
- Search all implementation methods
- Count usage frequency
- List advantages and disadvantages of each

Step 2: Select
- Choose most complete implementation
- Prefer existing over creating new
- Consider team familiarity

Step 3: Migrate
- Ensure target implementation is complete
- Migrate by dependency order
- Verify after each migration

Step 4: Cleanup
- Delete deprecated implementations
- Delete compatibility code
- Update documentation
```

### Example: Unify API Calls

```typescript
// Target: Unify to ApiClient

// Before (3 methods)
// Method A
import { invoke } from '@tauri-apps/api/core';
await invoke('cmd', { data });

// Method B  
await fetch('/api/cmd', { body: data });

// Method C
await apiClient.invoke('cmd', { data });

// After (unified to Method C)
import { api } from '@/infrastructure/api';
await api.invoke('cmd', { data });
```

---

## Pattern 2: Clean Up Patch Code

### Scenario
Lots of temporary fixes, compatibility layers, sync code exist

### Strategy

```
1. Identify all temporary code
2. Evaluate if can be removed
3. Complete related migrations
4. Delete in one go
```

### Execution Steps

```markdown
Step 1: Identify
- Search TODO/FIXME/HACK
- Search backward/legacy/deprecated
- Find sync code

Step 2: Classify
- Can delete directly (outdated)
- Need to complete migration first
- Need to keep (necessary compatibility)

Step 3: Process
- Complete unfinished migrations
- Delete unnecessary compatibility layers
- Standardize necessary compatibility

Step 4: Verify
- Ensure functionality works
- No runtime errors
```

### Example: Clean Up Store Sync Code

```typescript
// Identify: storeSync.ts exists connecting old and new Store

// Check old Store usage
rg "OldStore" --type ts -l

// Confirm new Store is feature complete
// Compare interfaces, ensure all functionality covered

// Migrate remaining usage
// Before
OldStore.getInstance().addMessage(msg);
// After
useNewStore.getState().addMessage(msg);

// Delete
// - Delete storeSync.ts
// - Delete OldStore.ts
// - Update related imports
```

---

## Pattern 3: Simplify Over-Defensive Code

### Scenario
Too many null checks, any types, try-catch

### Strategy

```
1. Process from core outward
2. Strengthen type definitions
3. Unify error handling at boundaries
4. Delete redundant checks
```

### Execution Steps

```markdown
Step 1: Strengthen Types
- Define explicit types
- Replace any with concrete types
- Use unknown + type guards

Step 2: Unify Error Handling
- Catch errors at boundaries
- Use Result pattern internally
- Avoid layered try-catch

Step 3: Simplify Checks
- Use optional chaining ?.
- Use nullish coalescing ??
- Delete redundant && checks

Step 4: Clean Up Logging
- Delete debug logs
- Keep necessary error logs
```

### Example: Eliminate any

```typescript
// Before
const data: any = await fetchData();
function process(input: any): any {
  return input.value;
}

// After
interface FetchResult {
  value: string;
  metadata: Record<string, unknown>;
}

const data: FetchResult = await fetchData();

function process(input: FetchResult): string {
  return input.value;
}
```

---

## Pattern 4: Extract Duplicate Code

### Scenario
Similar code blocks repeated in multiple places

### Strategy

```
1. Identify duplicate patterns
2. Find differences
3. Design common abstraction
4. Extract to shared location
5. Replace all usage points
```

### Execution Steps

```markdown
Step 1: Identify
- Search similar code blocks
- Compare differences
- Evaluate abstraction feasibility

Step 2: Design
- Extract common logic
- Parameterize differences
- Keep simple, don't over-abstract

Step 3: Implement
- Create shared function/component
- Add necessary parameters
- Write tests (if applicable)

Step 4: Replace
- Replace usage points one by one
- Verify after each replacement
- Delete original duplicate code
```

### Example: Merge Duplicate Components

```typescript
// Before: Two similar components
// FileCard.tsx
export const FileCard = ({ file }) => (
  <Card>
    <Icon name="file" />
    <Title>{file.name}</Title>
  </Card>
);

// FolderCard.tsx  
export const FolderCard = ({ folder }) => (
  <Card>
    <Icon name="folder" />
    <Title>{folder.name}</Title>
  </Card>
);

// After: Unified component
// ItemCard.tsx
interface ItemCardProps {
  type: 'file' | 'folder';
  name: string;
}

export const ItemCard = ({ type, name }: ItemCardProps) => (
  <Card>
    <Icon name={type} />
    <Title>{name}</Title>
  </Card>
);
```

---

## Pattern 5: Decouple Circular Dependencies

### Scenario
Module A depends on B, B also depends on A

### Strategy

```
Option 1: Extract common part
Option 2: Introduce interface layer
Option 3: Dependency injection
Option 4: Event-driven
```

### Execution Steps

```markdown
Strategy 1: Extract Common Part
- Identify root cause of circular dependency
- Extract common logic to new module C
- A → C, B → C

Strategy 2: Introduce Interface Layer
- Create interface module
- Both A and B depend on interface
- Implementation separate from interface

Strategy 3: Dependency Injection
- Pass dependency as parameter
- Avoid direct import

Strategy 4: Event-Driven
- Use events for decoupling
- A emits event, B listens
```

### Example: Extract Common Part

```
Before:
A.ts: import { funcB } from './B';
B.ts: import { funcA } from './A';

Analysis:
- A uses B's utils function
- B uses A's types

After:
common.ts: Common utils and types
A.ts: import { ... } from './common';
B.ts: import { ... } from './common';
```

---

## Pattern 6: Rebuild Module Boundaries

### Scenario
Module boundaries blurry, responsibilities unclear

### Strategy

```
1. Analyze current responsibilities
2. Redefine boundaries
3. Determine public API
4. Migrate internal implementation
5. Update dependencies
```

### Execution Steps

```markdown
Step 1: Analyze
- List all current module functionality
- Identify core responsibilities
- Identify functionality to split

Step 2: Design
- Define new module boundaries
- Design public API (index.ts)
- Plan internal structure

Step 3: Refactor
- Create new directory structure
- Move files
- Update imports

Step 4: Encapsulate
- Export public API through index.ts
- Hide internal implementation
- Update external dependencies
```

---

## Verification Checklist

After each refactoring:

```bash
# Compile verification
cargo check --workspace
npm run build

# Code quality
cargo clippy --workspace
npm run lint

# Tests (if available)
cargo test --workspace
npm run test

# Functionality verification
# Start app, verify related functionality
```
