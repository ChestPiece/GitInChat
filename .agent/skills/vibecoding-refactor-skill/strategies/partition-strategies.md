# Partition Strategies

Choose appropriate task partition strategies based on refactoring type.

## Strategy Selection

```
Refactoring Type Assessment
    │
    ├── Structural Refactoring → Directory Partition Strategy
    │   • No logic changes involved
    │   • File/directory level operations
    │   • Can execute in parallel
    │
    ├── Logic Refactoring → Functional Module Partition Strategy
    │   • Logic changes involved
    │   • Function/module level operations
    │   • Requires dependency sorting
    │
    └── Mixed Type → Structure First, Then Logic
        • Complete structural cleanup first
        • Then proceed with logic refactoring
```

---

## Structural Refactoring (Directory Partition Strategy)

### Applicable Scenarios

- Naming convention unification (file names, variable names, function names)
- Code formatting (indentation, spaces, line breaks)
- Delete unused code (unreferenced functions, variables, files)
- Directory structure adjustment (move files, reorganize modules)
- Comments and documentation updates
- Import organization (sorting, deduplication, path optimization)

### Partition Method

```
Step 1: Scan directory structure
Step 2: Assess directory independence
Step 3: Group parallel tasks
Step 4: Generate task list
```

### Example

```
Project structure:
src/
├── infrastructure/    # Infrastructure
├── component-library/ # Component library
├── tools/             # Tool modules
│   ├── editor/
│   ├── terminal/
│   └── git/
└── features/          # Feature modules

Partition result:
Group A (Base layer, priority):
├── task-001: infrastructure/ structure cleanup

Group B (Parallel):
├── task-002: component-library/ structure cleanup
├── task-003: tools/editor/ structure cleanup
├── task-004: tools/terminal/ structure cleanup
├── task-005: tools/git/ structure cleanup
└── task-006: features/ structure cleanup

Execution strategy:
1. Group A and Group B can run in parallel (no dependencies)
2. Tasks within Group B can run in parallel
3. Each task verified independently before merging
```

### Task Template

```markdown
## Task: [Directory Name] Structure Cleanup

### Scope
- Directory: [path]
- File count: [number]

### Operation List
- [ ] Delete unused files
- [ ] Unify naming conventions
- [ ] Organize imports
- [ ] Format code

### Verification
- [ ] Compile passes
- [ ] No new warnings
```

---

## Logic Refactoring (Functional Module Partition Strategy)

### Applicable Scenarios

- Unify error handling patterns
- Unify state management solutions
- Unify API call methods
- Merge duplicate components/functions
- Refactor data flow
- Decouple circular dependencies
- Adjust module boundaries

### Partition Method

```
Step 1: Identify functional boundaries
Step 2: Analyze module dependencies
Step 3: Topological sort (no dependencies first)
Step 4: Plan by phases
```

### Dependency Analysis

```bash
# Analyze which modules module A depends on
rg "^import|^from" moduleA/ | grep -v node_modules

# Analyze which modules depend on module A
rg "from ['\"].*moduleA" --type ts -l
```

### Example: Unify Error Handling

```
Module analysis involved:
crates/core/util/errors.rs      → Core definition (no dependencies)
crates/core/service/*           → Service layer (depends on errors.rs)
crates/api-layer/*              → API layer (depends on service)
apps/desktop/src/api/*          → App layer (depends on api-layer)
packages/web-ui/infrastructure/ → Frontend (depends on backend API)

Dependency graph:
errors.rs
    ↓
service/*
    ↓
api-layer/*, desktop/api/*
    ↓
web-ui/*

Partition result:
Phase 1: Core Definition [No dependencies]
├── task-001: Unify error types in errors.rs

Phase 2: Service Layer [Depends on Phase 1]
├── task-002: Migrate service/workspace/
├── task-003: Migrate service/config/
└── task-004: Migrate service/git/

Phase 3: API Layer [Depends on Phase 2]
├── task-005: Migrate api-layer/
└── task-006: Migrate desktop/api/

Phase 4: Frontend [Depends on Phase 3]
└── task-007: Migrate web-ui/infrastructure/
```

### Phase Boundary Rules

```
Phase completion conditions:
- All tasks completed
- Compile verification passed
- Test verification passed
- Checkpoint created

Next Phase start conditions:
- Previous Phase completed
- No blocking issues
```

---

## Mixed Type Refactoring

### Execution Order

```
1. Complete structural refactoring first
   ├── Delete unused code
   ├── Unify naming conventions
   ├── Organize directory structure
   └── Clean up imports
   
2. Then proceed with logic refactoring
   ├── Code clearer, easier to analyze
   ├── Dependencies more explicit
   └── Reduce interference factors
```

### Reason

- Structural refactoring is low risk, quick results
- Cleaned code easier to analyze dependencies
- Avoid complex refactoring on messy code

### Example Planning

```
Phase 0: Structural Cleanup [Parallel]
├── task-001: Delete unused code
├── task-002: Unify naming conventions
└── task-003: Organize imports

--- Checkpoint: Structure cleanup complete ---

Phase 1-N: Logic Refactoring [By dependency order]
├── Phase 1: Core layer
├── Phase 2: Service layer
└── Phase 3: UI layer
```

---

## Parallel Execution Rules

### Parallel Conditions

- No dependencies between tasks
- Modified files don't overlap
- Won't produce conflicts

### Parallel Strategy

```
Structural refactoring:
- Different directory tasks can run in parallel
- Within same directory, parallel by file

Logic refactoring:
- Within same Phase, tasks without dependencies can run in parallel
- Different Phases must execute sequentially
```

### Merge Verification

```
After parallel tasks complete:
1. Merge all changes
2. Overall compile verification
3. Check for conflicts
4. If problems, rollback and execute serially
```
