# Task Lifecycle

Task creation, execution, update, and completion flow.

## Lifecycle States

```
                    ┌─────────┐
                    │ pending │ Waiting to start
                    └────┬────┘
                         │ Start execution
                         ▼
                  ┌─────────────┐
                  │ in_progress │ In progress
                  └──────┬──────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
   ┌─────────┐    ┌───────────┐    ┌───────────┐
   │ blocked │    │ completed │    │ cancelled │
   └────┬────┘    └───────────┘    └───────────┘
        │               ▲
        │  Unblock      │
        └───────────────┘
```

---

## State Definitions

| State | Meaning | File Location |
|-------|---------|---------------|
| pending | Created, waiting to execute | tasks/active/ |
| in_progress | Currently executing | tasks/active/ |
| blocked | Blocked, waiting for condition | tasks/blocked/ |
| completed | Finished | tasks/completed/ |
| cancelled | Cancelled | tasks/cancelled/ |

---

## Create Task

### Steps

1. Generate task ID
2. Create task file
3. Update master plan
4. Record log

### Task ID Rules

```
Format: task-{3-digit number}

Assignment:
- New task gets current max number + 1
- Find: ls .refactor/tasks/*/task-*.md | sort | tail -1
```

### Task File Template

```markdown
---
id: task-{number}
title: {task title}
type: structure | logic | mixed
status: pending
priority: high | medium | low
phase: {phase number}
parent: null | task-xxx
dependencies: []
created: {ISO time}
updated: {ISO time}
---

# Task: {Task Title}

## Goal
{One sentence describing task goal}

## Scope
- Files/Directories: {list}
- Impact Scope: {description}

## Execution Steps
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## Progress Log
| Time | Operation | Result |
|------|-----------|--------|

## Verification
- [ ] Compile passes
- [ ] Tests pass
- [ ] Functionality verified

## Notes
{Other notes}

## Related
- Prerequisites: {dependent tasks}
- Successors: {tasks depending on this}
- Comparison Doc: {related comparison}
```

---

## Start Task

### Steps

1. Check dependencies are satisfied
2. Update status to in_progress
3. Update timestamp
4. Record to session log

### Check Dependencies

```markdown
dependencies: [task-001, task-002]

Check:
- Is task-001 in completed/?
- Is task-002 in completed/?

If there are incomplete dependencies:
- Cannot start this task
- Or complete dependency tasks first
```

### Update Status

```yaml
# Before
status: pending
updated: 2026-01-24T10:00:00

# After
status: in_progress
updated: 2026-01-24T14:00:00
```

---

## Update Progress

### Check Off Steps

```markdown
## Execution Steps
- [x] Step 1          # Complete
- [x] Step 2          # Complete
- [ ] Step 3          # Not complete

## Progress Log
| Time | Operation | Result |
|------|-----------|--------|
| 14:00 | Start step 1 | Complete |
| 14:30 | Start step 2 | Found issue |
| 15:00 | Resolve issue | Complete step 2 |
```

### Add Progress Record

Add a row for each progress:

```markdown
| Time | Operation | Result |
|------|-----------|--------|
| 14:00 | Analyze existing implementation | Found 3 patterns |
| 14:30 | Choose target pattern | Adopt ApiClient |
| 15:00 | Migrate module-a | Complete |
| 15:30 | Migrate module-b | Complete |
```

---

## Complete Task

### Steps

1. Confirm all steps complete
2. Execute verification
3. Update status
4. Move to completed/
5. Update master plan
6. If last task in phase, create checkpoint

### Verification Checklist

```markdown
## Verification
- [x] Compile passes: cargo check --workspace ✅
- [x] Tests pass: cargo test --workspace ✅
- [x] Functionality verified: Manual test save function ✅
```

### Move File

```bash
mv .refactor/tasks/active/task-005.md .refactor/tasks/completed/
```

### Update Master Plan

```markdown
# Before
Phase 2: Error Handling Unification [🔄 In Progress] 50%
├── task-003: Core error types [✅]
├── task-004: Service layer migration [✅]
├── task-005: API layer migration [🔄]     # <- Just completed
└── task-006: Frontend migration [⏳]

# After
Phase 2: Error Handling Unification [🔄 In Progress] 75%
├── task-003: Core error types [✅]
├── task-004: Service layer migration [✅]
├── task-005: API layer migration [✅]     # <- Updated to complete
└── task-006: Frontend migration [⏳]
```

---

## Handle Blocking

### When to Block

- Discovered unexpected dependency
- Need to wait for external input
- Encountered decision-requiring issue
- Technical issue needs research

### Steps

1. Update status to blocked
2. Record block reason
3. Move to blocked/
4. Update master plan
5. Handle other executable tasks

### Record Blocking

```markdown
## Block Information
- Block Time: 2026-01-24T15:00:00
- Block Reason: Found circular dependency, need to decouple first
- Needed: Create new task task-007 to decouple circular dependency
- Expected Unblock: After task-007 completes
```

### Unblock

1. Resolve block reason
2. Move back to active/
3. Update status to in_progress
4. Continue execution

---

## Cancel Task

### When to Cancel

- Task no longer needed
- Replaced by other task
- Requirements changed

### Steps

1. Update status to cancelled
2. Record cancel reason
3. Move to cancelled/
4. Update master plan

### Record Cancellation

```markdown
## Cancel Information
- Cancel Time: 2026-01-24T15:00:00
- Cancel Reason: Functionality merged into task-008
- Replacement Task: task-008
```

---

## Checkpoints

### When to Create

- Each Phase completion
- Important milestones
- Before long pause

### Create Steps

```bash
# Create directory
mkdir -p .refactor/checkpoints/checkpoint-001

# Record Git ref
git rev-parse HEAD > .refactor/checkpoints/checkpoint-001/git-ref.txt

# Create state snapshot
# Include current progress, active tasks, etc.
```

### State Snapshot Template

```markdown
# Checkpoint: checkpoint-001

## Basic Info
- Created: 2026-01-24T16:00:00
- Git ref: abc1234def5678
- Phase: Phase 1 Complete

## Progress Snapshot
- Total Progress: 25%
- Completed Tasks: 3
- In Progress Tasks: 0

## Completed Tasks
- task-001: Delete unused code
- task-002: Unify naming conventions
- task-003: Organize imports

## Next Steps
- Start Phase 2: task-004
```

### Rollback to Checkpoint

```bash
# Rollback code
git checkout $(cat .refactor/checkpoints/checkpoint-001/git-ref.txt)

# Restore task state
# Need to manually move completed tasks back to active/
# And reset status to pending
```
