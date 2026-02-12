# Parallel Execution Strategies

Maximize parallel execution efficiency while ensuring safety.

## Parallel Principles

```
Parallel conditions:
1. No dependencies between tasks
2. Modified files don't overlap
3. Won't produce merge conflicts
```

---

## Parallel Modes

### Mode 1: Directory-Level Parallel

Suitable for structural refactoring, different directory tasks can run in parallel.

```
src/
├── tools/editor/    → Task A (parallel)
├── tools/terminal/  → Task B (parallel)
├── tools/git/       → Task C (parallel)
└── features/        → Task D (parallel)

Execution method:
- 4 tasks execute simultaneously
- Each verifies independently
- Merge verification at end
```

### Mode 2: File-Level Parallel

Within same directory, different file modifications can run in parallel.

```
service/
├── workspace.rs  → Task A.1 (parallel)
├── config.rs     → Task A.2 (parallel)
└── git.rs        → Task A.3 (needs to wait for A.2)

Execution method:
- A.1 and A.2 can run in parallel
- A.3 depends on A.2, needs to wait
```

### Mode 3: Within-Phase Parallel

Within same Phase, modules without dependencies can run in parallel.

```
Phase 2: Service Layer Refactoring
├── task-002: workspace (no internal dependencies) → parallel
├── task-003: config (no internal dependencies)    → parallel
└── task-004: git (depends on config)              → wait for task-003
```

---

## Parallel Safety Checks

### Check File Overlap

```bash
# List files involved in Task A
task_a_files=$(rg "pattern_a" -l)

# List files involved in Task B
task_b_files=$(rg "pattern_b" -l)

# Check overlap
comm -12 <(echo "$task_a_files" | sort) <(echo "$task_b_files" | sort)

# If overlap exists, cannot run in parallel
```

### Check Type/Interface Dependencies

```bash
# Types modified by Task A
types_a=$(rg "interface |type |struct " taskA_files -o)

# Types used by Task B
types_b=$(rg ": TypeName|<TypeName>" taskB_files -o)

# Check if B uses types modified by A
# If so, cannot run in parallel
```

---

## Execution Strategies

### Strategy 1: Full Parallel (Structural Refactoring)

```
Suitable for: Independent operations in different directories

Execution:
1. Start all tasks
2. Mark complete when each finishes
3. Merge verification when all complete
4. If conflicts, rollback and run serially

Rollback strategy:
- Use git stash or branches
- One commit per task
- Can selectively rollback on conflict
```

### Strategy 2: Grouped Parallel (Mixed)

```
Suitable for: Some tasks have dependencies

Execution:
1. Identify parallel groups
   Group 1: [A, B, C] can run in parallel
   Group 2: [D] depends on Group 1
   Group 3: [E, F] depends on Group 2

2. Execute by group order
   - Group 1 runs internally parallel
   - Start Group 2 after Group 1 completes
   - Start Group 3 after Group 2 completes (internally parallel)
```

### Strategy 3: Pipeline (Logic Refactoring)

```
Suitable for: Strict dependency order

Execution:
Phase 1: [task-001]
    ↓ Complete verification
Phase 2: [task-002, task-003] parallel
    ↓ Complete verification
Phase 3: [task-004]
    ↓ Complete verification
...

Each Phase:
1. Execute all tasks
2. Merge verification
3. Create checkpoint
4. Start next Phase
```

---

## Merge Verification

### Verification Flow

```
After parallel tasks complete:

1. Merge all changes
   git merge --no-commit task-a-branch
   git merge --no-commit task-b-branch
   
2. Check conflicts
   If conflicts → Manually resolve or rollback
   
3. Compile verification
   cargo check --workspace
   npm run build
   
4. Test verification (if available)
   cargo test --workspace
   npm run test
   
5. Functionality verification
   Start app, check main functionality
   
6. Confirm merge
   git commit
```

### Conflict Handling

```
When conflicts found:

Option 1: Manually resolve
- Analyze conflict cause
- Merge modifications
- Re-verify

Option 2: Rollback and run serially
- Rollback one of the tasks
- Execute serially
- Avoid conflicts

Option 3: Re-partition
- Partition conflicting files as separate task
- Other parts remain parallel
```

---

## Progress Tracking

### Parallel Task Status

```markdown
## Parallel Execution Status

| Task | Status | Start Time | End Time |
|------|--------|------------|----------|
| task-002 | ✅ Complete | 10:00 | 10:30 |
| task-003 | 🔄 In Progress | 10:00 | - |
| task-004 | ⏳ Waiting | - | - |

Dependencies:
- task-004 waiting for task-003 to complete

Merge verification:
- [ ] task-002 + task-003 merge verification
- [ ] Start task-004
```

### Efficiency Statistics

```markdown
## Parallel Efficiency

Serial estimate: 3 hours
Parallel actual: 1.5 hours
Efficiency gain: 50%

Bottleneck analysis:
- task-003 took longest (blocking task-004)
- Recommendation: Split task-003
```
