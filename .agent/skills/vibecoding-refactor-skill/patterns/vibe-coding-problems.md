# Vibe Coding Problem Classification

Typical problem patterns in AI-generated code and identification methods.

---

## ⚠️ Core Problem: Context Disruption

**The essential problem of Vibe Coding is context disruption:**

- AI starts "fresh" in each conversation, unaware of previously written code
- AI tends to "create new" rather than "reuse existing"
- Users typically don't proactively tell AI "the project has a component library"
- Result: Same functionality implemented in multiple places, existing resources unused

**Consequences of this problem:**

1. **Duplicate functionality** - Same functionality has 2-5 implementations
2. **Unused component library** - Library exists but nobody uses it, self-made wheels everywhere
3. **Pattern chaos** - Each module uses different patterns
4. **Maintenance nightmare** - Modifying one feature requires changing N places

---

## Problem Overview

```
Vibe Coding Typical Problems
│
├── 1. Resource Waste (Most Common)
│   ├── Component library unused ⭐⭐⭐
│   ├── Utility functions reimplemented ⭐⭐⭐
│   ├── Type definitions in multiple places ⭐⭐
│   └── Public services not reused ⭐⭐
│
├── 2. Context Disruption
│   ├── Multiple implementations coexist
│   ├── Inconsistent patterns
│   ├── Inconsistent naming
│   └── Duplicate abstractions
│
├── 3. Patch-Style Fixes
│   ├── TODO/FIXME accumulation
│   ├── Compatibility shims
│   ├── Sync code
│   └── Migration guide remnants
│
├── 4. Over-Defensive Coding
│   ├── Redundant null checks
│   ├── Type assertion abuse
│   ├── Excessive try-catch
│   └── Excessive logging
│
├── 5. Copy-Paste Proliferation
│   ├── Similar code blocks
│   ├── Hardcoded values
│   └── Duplicate components
│
└── 6. Architecture Decay
    ├── Circular dependencies
    ├── Global state abuse
    ├── Layer confusion
    └── Unclear responsibilities
```

---

## 1. Resource Waste (Most Common Problem)

**This is the most prevalent problem in Vibe Coding, must detect first.**

### 1.1 Component Library Unused ⭐⭐⭐

**Problem Description**: Project has component library but business code doesn't use it, implements similar components itself

**Why it happens**:
- AI doesn't know project has component library
- User didn't mention component library
- AI thinks "writing a simple one" is easier

**Identification Method**:

```bash
# Step 1: Find component library location
fd "component-library|components/ui|shared/components" --type d

# Step 2: List component library exports
rg "^export" component-library/*/index.ts

# Step 3: Check if business code references component library
rg "from.*component-library" --type tsx -l | wc -l

# Step 4: Check self-made similar components
rg "const \w*(Button|Card|Modal|Input|Select|Dialog|Tooltip)" --type tsx -l | grep -v component-library
```

**Comparison Analysis**:

| Check Item | Library Has | Business Self-Made | Problem Severity |
|------------|-------------|-------------------|------------------|
| Button | ✓ | ✓ 3 places | Severe |
| Card | ✓ | ✓ 5 places | Severe |
| Modal | ✓ | ✓ 2 places | Medium |
| Input | ✓ | ✗ | Good |

**Fix Plan**:
1. List all self-made components
2. Compare with library functionality
3. If functionality same → Delete self-made, use library
4. If extra functionality → Consider extending library

---

### 1.2 Utility Function Reimplementation ⭐⭐⭐

**Problem Description**: Project has utils but utility functions written everywhere

**High-frequency duplicated functions**:
- `formatDate`, `formatTime`, `parseDate`
- `debounce`, `throttle`
- `deepClone`, `deepMerge`
- `isEmpty`, `isNil`, `isObject`
- `capitalize`, `truncate`, `slugify`
- `classNames`, `cx`, `cn`

**Identification Method**:

```bash
# Find utility function library location
fd "utils|helpers|lib" --type d

# Search for duplicate function definitions
rg "function formatDate|const formatDate" --type ts
rg "function debounce|const debounce" --type ts
rg "function deepClone|const deepClone" --type ts

# Count definition count for each function (>1 is duplicate)
for fn in formatDate debounce throttle deepClone isEmpty; do
  count=$(rg "(function|const) $fn" --type ts | wc -l)
  echo "$fn: $count definitions"
done
```

**Fix Plan**:
1. Choose one as standard implementation (usually in shared/utils/)
2. Delete other duplicate implementations
3. Update all references

---

### 1.3 Type Definition in Multiple Places ⭐⭐

**Problem Description**: Same concept's type defined in multiple places

**Identification Method**:

```bash
# Search for same-name interfaces
rg "^(export )?interface (\w+)" --type ts -o | sort | uniq -d

# Search for same-name types
rg "^(export )?type (\w+)" --type ts -o | sort | uniq -d

# Specific check
rg "interface User\b" --type ts
rg "interface Config\b" --type ts
rg "interface Message\b" --type ts
```

**Comparison Example**:

```typescript
// shared/types/user.ts
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// features/types/index.ts  
interface User {
  id: string;
  username: string;  // Different field name!
  email: string;
}

// Problem: Two User definitions inconsistent, easy to confuse
```

---

### 1.4 Public Services Not Reused ⭐⭐

**Problem Description**: Existing API services, state management not reused

**Identification Method**:

```bash
# Find service layer
fd "services|api" --type d

# Check if services are referenced
for svc in $(fd -e ts -p ".*Service.*\.ts$"); do
  name=$(basename "$svc" .ts)
  count=$(rg "$name" --type ts -l | wc -l)
  echo "$name: referenced by $count files"
done

# Check direct invoke calls instead of using services
rg "invoke\(" --type ts | grep -v "service" | head -20
```

---

## 1. Context Disruption

AI lacks global perspective when generating code in different sessions.

### 1.1 Multiple Implementations Coexist

**Manifestation**: Same functionality has 2-3 different implementation methods

**Example**:
```typescript
// File A: Direct call
import { invoke } from '@tauri-apps/api/core';
await invoke('command', { data });

// File B: Wrapped class
await apiClient.invoke('command', { data });

// File C: Service layer
await commandService.execute(data);
```

**Identification**:
```bash
# Search API call methods
rg "invoke\(" --type ts -l | head -20
rg "fetch\(" --type ts -l | head -20

# Search error handling methods
rg "try \{|\.catch\(|Result<" --type ts -l
```

### 1.2 Inconsistent Patterns

**Manifestation**: Same scenario uses different handling patterns

**Example**:
```rust
// File A: Uses AppError
fn do_a() -> Result<(), AppError> { ... }

// File B: Uses anyhow
fn do_b() -> anyhow::Result<()> { ... }

// File C: Uses String
fn do_c() -> Result<(), String> { ... }
```

**Identification**:
```bash
# Rust error handling
rg "-> Result<.*AppError" --type rust -c
rg "-> anyhow::Result" --type rust -c
rg "-> Result<.*String>" --type rust -c
```

### 1.3 Inconsistent Naming

**Manifestation**: Similar concepts use different naming

**Example**:
```
config vs configuration
user vs currentUser vs activeUser
data vs payload vs content
```

**Identification**:
```bash
# Search similar naming
rg "config[^u]" --type ts | head
rg "configuration" --type ts | head

# Check spelling errors
rg "configration|configuraiton" --type ts
```

### 1.4 Duplicate Abstractions

**Manifestation**: Multiple similar utility functions, type definitions

**Identification**:
```bash
# Search similar function signatures
rg "function format.*Date" --type ts
rg "function parse.*JSON" --type ts

# Search duplicate type definitions
rg "interface.*Props \{" --type tsx -l
```

---

## 2. Patch-Style Fixes

Temporary code added to quickly solve problems.

### 2.1 TODO/FIXME Accumulation

**Identification**:
```bash
# Count quantity
rg "TODO|FIXME|HACK|XXX|TEMP" -c

# View specific content
rg "TODO|FIXME" --type ts --type rust

# Count by file
rg "TODO|FIXME" -l | xargs -I {} sh -c 'echo "$(rg -c "TODO|FIXME" {}) {}"' | sort -rn
```

### 2.2 Compatibility Shims

**Manifestation**: `// for backward compatibility` comments

**Identification**:
```bash
rg "backward|legacy|deprecated|compat" --type ts --type rust
rg "// old|// legacy|// deprecated"
```

### 2.3 Sync Code

**Manifestation**: Sync code connecting old and new systems

**Identification**:
```bash
rg "sync|Sync" --type ts -l
fd "sync" --type f
rg "subscribe.*setState|watch.*update"
```

### 2.4 Migration Guide Remnants

**Identification**:
```bash
fd "MIGRATION|UPGRADE|CHANGELOG|BREAKING"
rg "migration|migrate|upgrade" --type md
```

---

## 3. Over-Defensive Coding

Excessive protection added due to uncertain context.

### 3.1 Redundant Null Checks

**Manifestation**:
```typescript
if (data && data.items && data.items.length && data.items.length > 0) {
  // ...
}
```

**Identification**:
```bash
# Multi-layer && checks
rg "\&\&.*\&\&.*\&\&" --type ts

# Excessive optional chaining
rg "\?\.\w+\?\.\w+\?\." --type ts
```

### 3.2 Type Assertion Abuse

**Manifestation**:
```typescript
const data = response as any;
const user = data as unknown as User;
```

**Identification**:
```bash
rg "as any|as unknown" --type ts -c
rg "as any|as unknown" --type ts
```

### 3.3 Excessive Try-Catch

**Manifestation**: Every function wrapped in try-catch

**Identification**:
```bash
# Count try-catch quantity
rg "try \{" --type ts -c
rg "catch \(" --type ts -c

# Find empty catch
rg "catch.*\{\s*\}" --type ts
```

### 3.4 Excessive Logging

**Identification**:
```bash
rg "console\.(log|debug|info|warn)" --type ts -c
rg "debug!|info!|warn!" --type rust -c
```

---

## 4. Copy-Paste Proliferation

AI tends to copy existing code rather than abstract for reuse.

### 4.1 Similar Code Blocks

**Identification**:
```bash
# Search similar function signatures
rg "async function \w+\(.*request" --type ts

# Search similar component structures
rg "export const \w+: React.FC" --type tsx
```

### 4.2 Hardcoded Values

**Identification**:
```bash
# Magic numbers
rg "\b[0-9]{3,}\b" --type ts | grep -v "test\|spec"

# Repeated string constants
rg "'[^']{10,}'" --type ts | sort | uniq -c | sort -rn | head
```

### 4.3 Duplicate Components

**Identification**:
```bash
# Similar component file names
fd "Button|Card|Modal" --type f -e tsx

# Similar component definitions
rg "const \w+Card" --type tsx -l
```

---

## 5. Architecture Decay

Original architecture boundaries broken as features increase.

### 5.1 Circular Dependencies

**Identification**:
```bash
# Check if A depends on B
rg "from.*moduleB" moduleA/

# Check if B depends on A
rg "from.*moduleA" moduleB/

# If both have results, circular dependency exists
```

### 5.2 Global State Abuse

**Identification**:
```bash
# Singleton pattern
rg "getInstance\(\)|\.instance" --type ts
rg "static mut|static ref|lazy_static" --type rust

# Global variables
rg "^(export )?let |^(export )?var " --type ts
rg "static " --type rust
```

### 5.3 Layer Confusion

**Identification**:
```bash
# UI layer directly calls lower layer
rg "from.*infrastructure|from.*core" components/

# Core depends on upper layer
rg "from.*components|from.*pages" core/
```

### 5.4 Unclear Responsibilities

**Identification**:
```bash
# Excessive file lines
fd -e ts | xargs wc -l | sort -rn | head -20

# Too many imports
for f in $(fd -e ts); do
  count=$(rg "^import" $f | wc -l)
  [ $count -gt 15 ] && echo "$count $f"
done | sort -rn
```

---

## Problem Priority

### Priority Matrix

| Problem Type | Impact Scope | Fix Difficulty | Priority | Notes |
|--------------|--------------|----------------|----------|-------|
| **Resource Waste** |
| Component library unused | High | Low | **P1** | Delete self-made, use library |
| Utility function duplicate | Medium | Low | **P1** | Delete duplicate, keep one |
| Type definition duplicate | Medium | Low | **P1** | Merge and unify |
| Public service not reused | Medium | Medium | **P1** | Migrate to using service |
| **Architecture Issues** |
| Circular dependency | High | High | **P0** | Blocks compile, must resolve |
| Layer confusion | High | High | **P1** | Affects maintainability |
| Unclear responsibility | Medium | Medium | **P2** | Needs splitting |
| **Pattern Issues** |
| Multiple implementations coexist | Medium | Medium | **P1** | Unify pattern |
| Inconsistent patterns | Medium | Medium | **P2** | Choose standard, migrate |
| Inconsistent naming | Low | Low | **P3** | Batch rename |
| **Code Quality** |
| Type assertion abuse | Medium | Medium | **P2** | Increase type safety |
| TODO accumulation | Low | Low | **P3** | Process or delete one by one |
| Excessive logging | Low | Low | **P3** | Clean useless logs |
| Over-defensive | Low | Low | **P3** | Simplify code |

### Priority Explanation

- **P0**: Blocking level, must resolve immediately
- **P1**: High priority, significantly affects maintenance cost
- **P2**: Medium priority, affects code quality
- **P3**: Low priority, improves readability

### Recommended Processing Order

```
1. P0 Circular dependencies → Resolve compile/runtime blocking
2. P1 Resource waste → Delete duplicates, unify to component/utility library (best ROI)
3. P1 Multiple implementations → Unify pattern
4. P1 Layer confusion → Adjust architecture
5. P2 Pattern unification → Gradual migration
6. P3 Code quality → Continuous improvement
```
