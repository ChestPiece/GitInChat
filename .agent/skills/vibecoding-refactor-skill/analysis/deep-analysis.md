# Deep Analysis Methods

**Deep analysis guide for Vibe Coding generated code**

This document guides how to perform in-depth analysis on each key feature, discovering typical problems in AI-generated code.

---

## Core Principles

### The Essential Problem of Vibe Coding

**Context disruption** leads to:
- AI starts "fresh" in each conversation, unaware of previously written code
- AI tends to "create new" rather than "reuse existing"
- Result: Same functionality implemented in multiple places, existing resources left unused

### Two Layers of Analysis

```
┌─────────────────────────────────────────────────────────────┐
│  Architecture Layer Analysis (Global)                        │
│  - Are layering dependencies correct                         │
│  - Are there circular dependencies                           │
│  - Is directory structure reasonable                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Module Layer Analysis (Per-function deep dive) ⭐ Focus     │
│  - Does this feature reuse existing resources?               │
│  - Does this feature have duplicate implementations?         │
│  - Is this feature's pattern consistent with other modules?  │
└─────────────────────────────────────────────────────────────┘
```

**Module layer analysis is core, must analyze each key feature one by one.**

---

## Dimension 1: Duplicate Implementation Detection

### 1.1 API Call Duplication

**Problem Description**: Same backend API has multiple different wrappers in frontend

**Detection Method**:

```bash
# 1. Find all invoke calls
rg "invoke\(['\"](\w+)['\"]" --type ts -o | sort | uniq -c | sort -rn

# 2. Find each command's call locations
rg "invoke\(['\"]save_file['\"]" --type ts -l

# 3. Check if wrapper layer exists
rg "export.*save|export.*Save" --type ts
```

**Output Format**:

| API Command | Call Count | Wrapper Count | Call Locations | Problem |
|-------------|------------|---------------|----------------|---------|
| save_file | 5 | 3 | file1.ts, file2.ts, file3.ts | 3 different wrappers |
| load_config | 8 | 1 | config-service.ts | Good |

**Typical Problem Example**:

```typescript
// Location A: Direct call
await invoke('save_file', { path, content });

// Location B: Wrapped as function
async function saveFile(path: string, content: string) {
  return invoke('save_file', { path, content });
}

// Location C: Wrapped as class method
class FileService {
  async save(path: string, content: string) {
    return invoke('save_file', { path, content });
  }
}

// Problem: Three call patterns, high maintenance cost
```

---

### 1.2 Component Duplication

**Problem Description**: Similar UI components have multiple implementations

**Detection Method**:

```bash
# 1. Search for similar component definitions
rg "const \w*Button\s*=" --type tsx -l
rg "const \w*Card\s*=" --type tsx -l
rg "const \w*Modal\s*=" --type tsx -l
rg "const \w*Input\s*=" --type tsx -l
rg "const \w*Dialog\s*=" --type tsx -l

# 2. Search for FC type components
rg ": React\.FC|: FC<" --type tsx -l | xargs -I {} basename {}

# 3. Check component file naming patterns
fd "Button|Card|Modal|Input" -e tsx
```

**Output Format**:

| Component Type | Component Name | Location | Lines | Duplication Possibility |
|----------------|----------------|----------|-------|-------------------------|
| Button | Button | component-library/ | 80 | Original |
| Button | ActionButton | tools/editor/ | 45 | Possibly duplicate |
| Button | SubmitButton | features/ | 30 | Possibly duplicate |
| Card | Card | component-library/ | 120 | Original |
| Card | ToolCard | tools/ | 65 | Possibly duplicate |

---

### 1.3 Utility Function Duplication

**Problem Description**: Same utility function implemented in multiple places

**High-frequency duplicated function types**:
- Date formatting (formatDate, formatTime, formatDateTime)
- String processing (capitalize, truncate, slugify)
- Array operations (unique, groupBy, sortBy)
- Object operations (deepClone, merge, pick, omit)
- Type checking (isArray, isObject, isEmpty)
- Delay/throttle (debounce, throttle)

**Detection Method**:

```bash
# Search for common utility functions
rg "function format|const format" --type ts
rg "function parse|const parse" --type ts
rg "function debounce|const debounce" --type ts
rg "function throttle|const throttle" --type ts
rg "function deepClone|const deepClone" --type ts

# Search utils directories
fd utils --type d
```

**Output Format**:

| Function Type | Function Name | Location | Duplication Detection |
|---------------|---------------|----------|----------------------|
| Date format | formatDate | shared/utils/date.ts | Original |
| Date format | formatDate | features/utils/time.ts | Duplicate |
| Date format | formatDateTime | tools/editor/helpers.ts | Duplicate |

---

### 1.4 Type Definition Duplication

**Problem Description**: Same concept's type definition exists in multiple places

**Detection Method**:

```bash
# Search for similar interface names
rg "^(export )?interface \w+" --type ts -o | sort | uniq -c | sort -rn | head -30

# Search for similar type names
rg "^(export )?type \w+" --type ts -o | sort | uniq -c | sort -rn | head -30

# Search for same-name definitions
rg "interface User|type User" --type ts
rg "interface Config|type Config" --type ts
```

**Output Format**:

| Type Name | Definition Location | Field Count | Consistent |
|-----------|---------------------|-------------|------------|
| User | shared/types/user.ts | 8 | - |
| User | features/types/index.ts | 6 | Inconsistent |
| Config | shared/types/config.ts | 15 | - |
| Config | tools/editor/types.ts | 12 | Inconsistent |

---

### 1.5 State Management Duplication

**Problem Description**: Same state managed in multiple places

**Detection Method**:

```bash
# Search for store definitions
rg "create\(|createStore|createSlice" --type ts -l

# Search for useState usage
rg "useState<" --type tsx

# Search for same-name state
rg "isLoading|isOpen|isVisible|currentUser" --type tsx -l | sort | uniq -c
```

---

## Dimension 2: Resource Reuse Analysis

### 2.1 Component Library Usage Rate

**Goal**: Check if project's component library is fully utilized

**Detection Method**:

```bash
# Step 1: List all components exported from component library
rg "^export \{" component-library/*/index.ts
rg "^export \* from" component-library/index.ts

# Step 2: Count usage of each component
components=$(rg "^export" component-library/*/index.ts -o | grep -oP "\w+")
for comp in $components; do
  count=$(rg "import.*$comp.*from.*component-library|<$comp[ />]" --type tsx -l 2>/dev/null | wc -l)
  echo "$count $comp"
done | sort -rn

# Step 3: Identify unused components
# Components with 0 usage need attention
```

**Output Table**:

| Component | Export Location | Usage Count | Usage Location Example | Status |
|-----------|-----------------|-------------|------------------------|--------|
| Button | component-library/Button | 45 | Multiple | Normal |
| Card | component-library/Card | 12 | Multiple | Normal |
| Tooltip | component-library/Tooltip | 0 | - | Unused |
| Tabs | component-library/Tabs | 2 | Editor.tsx | Low usage |

### 2.2 Self-Made Wheel Detection

**Goal**: Find business code's self-implemented components that duplicate component library

```bash
# Search for similarly named components in non-component-library directories
rg "const \w*Button|const \w*Card|const \w*Modal" --type tsx -l | grep -v component-library

# Compare self-made components with component library components' functionality
# Manually compare each self-made component's Props with corresponding component library component
```

**Output Table**:

| Self-Made Component | Location | Library Equivalent | Functional Difference | Recommendation |
|---------------------|----------|--------------------|-----------------------|----------------|
| ActionButton | tools/editor/ActionButton.tsx | Button | No substantial difference | Delete, use Button |
| IconButton | features/IconButton.tsx | Button + icon prop | Library supports | Delete, use Button |
| CustomCard | tools/Card.tsx | Card | Added collapse feature | Consider extending Card |

### 2.3 Utility Function Library Usage Rate

Similar to component library, check usage of functions in `shared/utils/`:

```bash
# List utility functions
rg "^export (const|function)" shared/utils/*.ts -o

# Check each function's usage count
for fn in formatDate debounce throttle deepClone ...; do
  count=$(rg "$fn\(" --type ts -l | wc -l)
  echo "$count $fn"
done | sort -rn
```

---

## Dimension 3: Pattern Consistency Analysis

### 3.1 Error Handling Patterns

**Check Items**:

```bash
# TypeScript error handling
rg "try \{" --type ts -c          # try-catch count
rg "\.catch\(" --type ts -c       # Promise catch count
rg "as Error" --type ts -c        # Type assertion to Error
rg "throw new" --type ts          # Error throwing patterns

# Rust error handling
rg "Result<.*AppError" --type rust -c
rg "anyhow::Result" --type rust -c
rg "Result<.*String>" --type rust -c
rg "unwrap\(\)|expect\(" --type rust -c  # Dangerous operations
```

**Output**:

| Pattern | Usage Count | Location Example | Recommendation |
|---------|-------------|------------------|----------------|
| try-catch | 45 | Multiple | Keep |
| .catch() | 23 | Multiple | Unify to try-catch |
| Result<T, AppError> | 89 | Multiple | Standard |
| anyhow::Result | 12 | Few locations | Migrate to AppError |
| Result<T, String> | 5 | Old code | Migrate to AppError |

### 3.2 API Call Patterns

```bash
# Direct call vs wrapped call
rg "invoke\(['\"]" --type ts -l | wc -l        # Direct call file count
rg "apiClient\.|api\." --type ts -l | wc -l   # Wrapped call file count

# Analyze call hierarchy
rg "invoke\(" --type ts | head -20  # View call context
```

### 3.3 State Management Patterns

```bash
# Identify state management solutions used
rg "zustand|create\(" --type ts -c
rg "redux|createStore" --type ts -c
rg "useContext|createContext" --type tsx -c
rg "useState" --type tsx -c

# Determine if unified
```

### 3.4 Logging Patterns

```bash
# Frontend logging
rg "console\.(log|debug|info|warn|error)" --type ts -c

# Backend logging
rg "(debug|info|warn|error)!" --type rust -c
```

---

---

# Architecture Layer Analysis

**Goal**: Discover global architecture problems (module-independent)

## 1. Layering Dependency Check

**Correct dependency direction**:

```
UI Layer → Application Layer → Infrastructure Layer → Core Layer

UI Layer: components/, pages/, views/
Application Layer: services/, store/, hooks/
Infrastructure Layer: api/, storage/, utils/
Core Layer: types/, constants/
```

**Detect Violations**:

```bash
# Core layer should not depend on upper layers
rg "from ['\"].*(components|services|store)" core/ types/ constants/

# Infrastructure should not depend on UI
rg "from ['\"].*components" infrastructure/ api/

# Component library should not depend on business code
rg "from ['\"].*(tools|features|modules)" component-library/
```

## 2. Circular Dependency Detection

```bash
# Check for A -> B and B -> A situations
```

## 3. Directory Structure Evaluation

- Is directory responsibility clear?
- Are there misplaced files?
- Are module boundaries clear?

## 4. Output: Architecture Layer Report

```markdown
# Architecture Layer Analysis Report

## Layering Violations
| Location | Wrong Dependency | Fix Recommendation |
|----------|------------------|-------------------|
| ... | ... | ... |

## Circular Dependencies
| Module A | Module B | Fix Recommendation |
|----------|----------|-------------------|
| ... | ... | ... |

## Architecture Layer Refactoring Tasks
- [A-001] ...
- [A-002] ...
```

---

# Module Layer Analysis (Core!)

**Goal**: Perform in-depth analysis on each key feature, discovering Vibe Coding problems

**⚠️ This is the most important part, must analyze each feature in depth**

## Analysis Flow

```
1. Get key feature list from Phase 1
2. Get resource inventory from Phase 0 (component library, utility library, etc.)
3. Analyze each feature one by one
4. Generate analysis report for each feature
5. Summarize to create module layer report
```

## Single Feature Analysis Template

For each key feature, create `.refactor/analysis/modules/[feature-name].md`:

```markdown
# Feature Analysis: [Feature Name]

## Basic Information
- Entry Point: [file:line]
- Files Involved: 
  - file1.tsx
  - file2.ts
  - ...
- Call Chain:
  Entry -> Service -> API -> Backend

---

## Resource Reuse Analysis (Compare with Phase 0 Inventory)

### Component Library Usage

Phase 0 inventoried component library: Button, Card, Modal, Input, Select...

| Component Used in This Feature | Source | Problem | Recommendation |
|--------------------------------|--------|---------|----------------|
| ActionButton | Self-made(Editor.tsx:45) | Not using library | Migrate to Button |
| CustomCard | Self-made(Panel.tsx:23) | Not using library | Migrate to Card |
| Modal | component-library | ✅ Correct | - |

### Utility Function Usage

Phase 0 inventoried utility functions: formatDate, debounce, deepClone...

| Function Used in This Feature | Source | Problem | Recommendation |
|-------------------------------|--------|---------|----------------|
| formatTime | Self-made(utils.ts:12) | Not using library | Use shared/utils/formatDate |
| debounce | lodash | ✅ OK | - |

### Type Definition Usage

Phase 0 inventoried public types: User, Config, Message...

| Type Defined in This Feature | Location | Problem | Recommendation |
|------------------------------|----------|---------|----------------|
| EditorConfig | types.ts:5 | Duplicates shared/types/Config | Use public type |

### Service Usage

Phase 0 inventoried public services: FileService, ConfigService...

| API Call in This Feature | Method | Problem | Recommendation |
|--------------------------|--------|---------|----------------|
| save_file | Direct invoke | Not using service layer | Use FileService |
| load_config | ConfigService | ✅ Correct | - |

### Infrastructure Usage (Important!)

Phase 0 inventoried infrastructure: logger, eventBus, i18n, theme, errorHandler...

| Infra Type | This Feature's Usage | Project Standard | Problem | Recommendation |
|------------|---------------------|------------------|---------|----------------|
| Logging | console.log | logger.info() | Not using logging system | Migrate to logger |
| Events | props callback | eventBus | ✅ OK | - |
| i18n | Hardcoded text | t('key') | Not using i18n | Extract to language pack |
| Theme | Hardcoded colors | theme.colors | Not using theme | Use theme variables |
| Error Handling | try-catch print | ErrorHandler | Not unified | Use error handler |
| Config | Hardcoded values | config.get() | Not using config | Migrate to config |

---

## Duplicate Implementation Detection

### Same Functionality Check
Does this feature have similar implementations elsewhere?

| Functionality | Current Location | Duplicate Location | Recommendation |
|---------------|------------------|-------------------|----------------|
| File save | Editor.tsx:100 | FilePanel.tsx:50 | Merge to FileService |

### Similar Code Check
Are there similar codes that can be merged?

---

## Pattern Consistency Detection

| Pattern Type | This Feature Uses | Project Standard | Consistent | Recommendation |
|--------------|-------------------|------------------|------------|----------------|
| API Call | Direct invoke | Service layer | ❌ | Migrate to service layer |
| Error Handling | .catch | try-catch | ❌ | Unify to try-catch |
| State Management | zustand | zustand | ✅ | - |

---

## Problem Summary

| # | Problem Type | Description | Location | Severity |
|---|--------------|-------------|----------|----------|
| 1 | Resource not reused | Self-made Button not using library | Editor.tsx:45 | P1 |
| 2 | Resource not reused | Self-made formatTime not using library | utils.ts:12 | P1 |
| 3 | Duplicate implementation | File save implemented in two places | Editor.tsx, FilePanel.tsx | P1 |
| 4 | Inconsistent pattern | Direct invoke not using service layer | Editor.tsx:100 | P2 |

---

## Refactoring Tasks

Based on above analysis, refactoring tasks for this feature:

1. [M-xxx-01] Migrate self-made Button to component library Button
2. [M-xxx-02] Migrate self-made formatTime to utility library
3. [M-xxx-03] Merge file save implementation to FileService
4. [M-xxx-04] Use service layer for API calls
```

---

## Module Layer Summary Report

After completing all feature analyses, create `.refactor/analysis/module-report.md`:

```markdown
# Module Layer Analysis Report

## Analysis Coverage

| Feature | Analysis Status | Problem Count | Report Location |
|---------|-----------------|---------------|-----------------|
| File Editor | ✅ | 5 | modules/file-editor.md |
| Chat | ✅ | 8 | modules/chat.md |
| Terminal | ✅ | 3 | modules/terminal.md |
| Git Operations | ✅ | 4 | modules/git.md |

---

## Problem Summary (By Type)

### Resources Not Reused (P1)

| Module | Problem | Location | Should Use |
|--------|---------|----------|------------|
| File Editor | Self-made Button | Editor.tsx:45 | component-library/Button |
| Chat | Self-made Card | ChatCard.tsx:20 | component-library/Card |
| Chat | Self-made formatDate | utils.ts:12 | shared/utils/date |
| Terminal | Self-made debounce | helpers.ts:5 | shared/utils/debounce |

**Statistics**: Component library usage rate 60%, Utility library usage rate 40%

### Infrastructure Not Used (P1)

| Module | Infra Type | Current Method | Should Use | Location |
|--------|------------|----------------|------------|----------|
| File Editor | Logging | console.log | logger | Editor.tsx:23 |
| Chat | i18n | Hardcoded text | t() | Chat.tsx:45 |
| Terminal | Theme | Hardcoded color #333 | theme.colors | Terminal.scss:12 |
| Git | Events | Props callback drilling | eventBus | GitPanel.tsx |

**Statistics**: Logging system usage 30%, i18n coverage 50%, Theme variable usage 40%

### Duplicate Implementations (P1)

| Functionality | Duplicate Locations | Recommendation |
|---------------|---------------------|----------------|
| File save | Editor.tsx, FilePanel.tsx | Merge to FileService |
| Config read | config.ts, settings.ts | Unify to ConfigService |
| Date format | 4 different implementations | Unify to shared/utils/date |

### Inconsistent Patterns (P2)

| Module | API Call Method | Error Handling | State Management |
|--------|-----------------|----------------|------------------|
| File Editor | Direct invoke ❌ | try-catch ✅ | zustand ✅ |
| Chat | Service layer ✅ | .catch ❌ | zustand ✅ |
| Terminal | Direct invoke ❌ | try-catch ✅ | useState ❌ |

---

## Module Layer Refactoring Tasks

### Resource Reuse Migration
- [M-001] File Editor: Migrate self-made Button to component library
- [M-002] Chat: Migrate self-made Card to component library
- [M-003] Chat: Migrate self-made formatDate to utility library
- [M-004] Terminal: Migrate self-made debounce to utility library

### Infrastructure Migration
- [M-005] Global: Migrate console.log to logger
- [M-006] Global: Extract hardcoded text to i18n
- [M-007] Global: Migrate hardcoded colors to theme variables
- [M-008] Git: Change props callback to eventBus

### Merge Duplicate Implementations
- [M-010] Merge file save implementation to FileService
- [M-011] Unify config read to ConfigService
- [M-012] Unify date format implementation

### Unify Patterns
- [M-020] Unify API call method to service layer
- [M-021] Unify error handling to try-catch
- [M-022] Unify state management to zustand
```

---

## Analysis Report Template

Create `.refactor/analysis/deep-analysis.md`:

```markdown
# Deep Analysis Report

Analysis Date: YYYY-MM-DD
Analysis Scope: [Project/Module]

---

## 1. Duplicate Implementation Detection

### 1.1 API Call Duplication
| API Command | Call Count | Wrapper Count | Problem | Recommendation |
|-------------|------------|---------------|---------|----------------|
| ... | ... | ... | ... | ... |

### 1.2 Component Duplication
| Component Type | Duplicate Count | Location | Recommendation |
|----------------|-----------------|----------|----------------|
| ... | ... | ... | ... |

### 1.3 Utility Function Duplication
| Function Type | Duplicate Count | Location | Recommendation |
|---------------|-----------------|----------|----------------|
| ... | ... | ... | ... |

### 1.4 Type Definition Duplication
| Type Name | Duplicate Count | Consistent | Recommendation |
|-----------|-----------------|------------|----------------|
| ... | ... | ... | ... |

---

## 2. Resource Reuse Analysis

### 2.1 Component Library Usage Rate
| Component | Usage Count | Status |
|-----------|-------------|--------|
| ... | ... | ... |

**Unused Components**: [list]
**Low Usage Components**: [list]

### 2.2 Self-Made Wheel List
| Self-Made Component | Location | Can Replace With | Recommendation |
|---------------------|----------|------------------|----------------|
| ... | ... | ... | ... |

---

## 3. Pattern Consistency

### 3.1 Error Handling
- Main Pattern: [try-catch / Result<T, E>]
- Consistency Level: [High/Medium/Low]
- Needs Migration: [list]

### 3.2 API Calls
- Main Pattern: [Direct invoke / Wrapped service]
- Consistency Level: [High/Medium/Low]
- Needs Migration: [list]

### 3.3 State Management
- Main Pattern: [zustand / redux / context]
- Consistency Level: [High/Medium/Low]
- Needs Migration: [list]

---

## 4. Architecture Reasonability

### 4.1 Layer Violations
| Violation Type | Location | Depends On | Recommendation |
|----------------|----------|------------|----------------|
| Core depends on UI | core/x.ts | components/y | Decouple |
| ... | ... | ... | ... |

### 4.2 Circular Dependencies
- moduleA <-> moduleB: [description]
- ...

### 4.3 High Coupling Modules
| Module | Inward Coupling | Outward Coupling | Assessment |
|--------|-----------------|------------------|------------|
| ... | ... | ... | ... |

---

## 5. Problem Summary

### P0 (Blocking)
- [ ] ...

### P1 (High Priority)
- [ ] ...

### P2 (Medium Priority)
- [ ] ...

### P3 (Low Priority)
- [ ] ...

---

## 6. Refactoring Recommendations

Based on above analysis, recommended refactoring order:

1. Resolve P0 problems
2. Unify component library usage, remove self-made wheels
3. Merge duplicate utility functions
4. Unify patterns (error handling, API calls)
5. Fix layer violations and circular dependencies
```

---

## Analysis Quality Check

After analysis is complete, ensure the following standards are met:

```markdown
## Analysis Quality Self-Check

### Coverage
- [ ] All major directories scanned
- [ ] All core features traced
- [ ] All duplication types detected

### Depth
- [ ] Each problem has specific location (file:line)
- [ ] Each problem has severity assessment
- [ ] Each problem has specific fix recommendation

### Actionability
- [ ] Problems sorted by priority
- [ ] Recommendations can be directly converted to tasks
- [ ] Fix effort estimated
```
