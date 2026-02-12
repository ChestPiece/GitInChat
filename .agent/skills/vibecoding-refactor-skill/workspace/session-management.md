# Session Management

Manage refactoring session start, execution, and end.

---

## ⚠️ Key: Ensure State Recoverable

**Must update the following files at end of each session to ensure new Agent can recover:**

1. **`.refactor/README.md`** - Update "Last Interruption Point" and "Current Status"
2. **Active task files** - Update progress log and next step
3. **Session log** - Record this session's operations and continuation point

See [recovery-guide.md](recovery-guide.md) for details

---

## Session Concept

```
Session = One continuous refactoring work cycle

Start → Execute Tasks → End
  │         │           │
  │         │           └── Save state, report progress
  │         └── Update progress, record log
  └── Load state, confirm direction
```

---

## Start Session

### New Refactoring Project

```
1. Initialize workspace
   mkdir -p .refactor/...
   
2. Create master plan
   touch .refactor/tasks/master-plan.md
   
3. Create first session log
   touch .refactor/logs/session-YYYY-MM-DD-001.md
   
4. Record start info
```

### Continue Existing Refactoring

```
1. Check workspace exists
   ls .refactor/
   
2. Read master plan
   cat .refactor/tasks/master-plan.md
   
3. Read active tasks
   ls .refactor/tasks/active/
   
4. Read latest log
   ls -t .refactor/logs/ | head -1
   
5. Report current status
   - Overall progress
   - Current phase
   - Active tasks
   - Last progress
   
6. Confirm continuation direction
```

### Status Report Template

```markdown
## Refactoring Status Report

### Overall Progress
- Total Progress: 50%
- Current Phase: Phase 2
- Completed: 6 tasks
- In Progress: 2 tasks
- Pending: 7 tasks

### Current Tasks
1. task-007: API layer migration (In progress, 60% complete)
2. task-008: Frontend migration (Pending)

### Last Progress
- Session: 2026-01-24-002
- Completed: task-005, task-006
- Interruption Point: task-007 step 3

### Suggested Continuation
1. Continue task-007 remaining steps
2. Start task-008 after completion
```

---

## Execute Tasks

### Single Task Execution

```
1. Read task file
2. Check dependencies satisfied
3. Update status to in_progress
4. Execute task steps
5. For each step completed:
   - Check off step
   - Add progress record
   - Execute verification
6. When all complete:
   - Update status
   - Move to completed/
   - Update master plan
```

### Parallel Task Execution

```
1. Confirm tasks can run in parallel
2. Start multiple tasks simultaneously
3. Execute and record independently
4. When all complete:
   - Merge verification
   - Batch update status
   - Update master plan
```

### Record to Session Log

Record each key operation:

```markdown
### 14:30 - task-007: API Layer Migration

Operation:
- Migrate api-layer/handlers.rs to AppError
- Update 15 error handling locations

Verification:
- cargo check: ✅
- cargo test: ✅

Next step:
- Continue migrating desktop/api/
```

---

## End Session

### Normal End

```
1. Complete current task or reach safe point
2. Save all progress
3. Update session log
4. Update master plan
5. Report this session's results
```

### Session Log Ending

```markdown
## Session End

### End Time
2026-01-24T18:00:00

### Completed This Session
- task-005: API layer base migration ✅
- task-006: API layer advanced feature migration ✅
- task-007: In progress (60%)

### Verification Summary
- cargo check: ✅
- cargo test: ✅ (15 passed, 0 failed)
- npm build: ✅

### Next Continuation
- Continue task-007 remaining steps
- Expected tasks: task-007, task-008

### Notes
- task-007 found desktop/api/file_api.rs needs special handling
- See task file notes for details
```

### Report Template

```markdown
## Session Summary

### Duration
2 hours (14:00 - 16:00)

### Completed Tasks
- ✅ task-005: API layer base migration
- ✅ task-006: API layer advanced feature migration

### In Progress
- 🔄 task-007: 60% complete

### Progress Change
- Phase 2: 25% → 60%
- Overall: 40% → 55%

### Next Expected
- Complete task-007
- Start task-008
```

---

## Session Log Format

### File Name

```
session-{date}-{number}.md

Examples:
session-2026-01-24-001.md
session-2026-01-24-002.md
```

### Complete Template

```markdown
---
session_id: 2026-01-24-001
started: 2026-01-24T10:00:00
ended: 2026-01-24T12:00:00
tasks_touched: [task-001, task-002, task-003]
status: completed
---

# Refactoring Session Log

## Session Goal
Complete Phase 1 structural cleanup

## Initial State
- Overall Progress: 0%
- Active Tasks: None
- Blocked Tasks: None

## Execution Record

### 10:00 - Start
- Load workspace
- Confirm goal: Phase 1 structural cleanup

### 10:15 - task-001: Delete Unused Code
```
Operation: Delete 15 unreferenced functions
Files: 
  - crates/core/src/util/helpers.rs (deleted 5)
  - packages/web-ui/src/utils/deprecated.ts (deleted file)
Verification: 
  - cargo check: ✅
  - npm build: ✅
```

### 10:45 - task-002: Unify Naming Conventions
```
Operation: Fix spelling errors
Changes:
  - func-agnet → func-agent (3 places)
  - configration → configuration (2 places)
Verification:
  - cargo check: ✅
```

### 11:30 - task-003: Organize Imports
```
Operation: Sort and dedupe imports
Files: 45 files
Verification:
  - npm build: ✅
  - npm lint: ✅
```

### 12:00 - Session End
- Phase 1 complete
- Create checkpoint checkpoint-001

## Verification Summary
| Check Item | Result | Notes |
|------------|--------|-------|
| cargo check | ✅ | |
| cargo test | ✅ (3 passed) | |
| npm build | ✅ | |
| npm lint | ✅ | |

## Completed This Session
- ✅ task-001: Delete unused code
- ✅ task-002: Unify naming conventions
- ✅ task-003: Organize imports
- ✅ Phase 1 complete
- ✅ Create checkpoint-001

## Next Continuation
- Start Phase 2
- First task: task-004 (Core error type unification)
```

---

## Exception Handling

### Discovered Issue

```markdown
### 15:30 - Issue Discovered

Issue:
- Found circular dependency while migrating service/git.rs
- git depends on config, config also depends on git

Handling:
1. Pause current task (task-007)
2. Create new task (task-007a: Decouple circular dependency)
3. Mark task-007 as blocked
4. Execute task-007a first

Impact:
- Phase 2 expected delay
- Need to re-evaluate task dependencies
```

### Rollback Operation

```markdown
### 16:00 - Rollback

Reason:
- task-008 caused test failure
- Cannot quickly fix

Operation:
1. git checkout checkpoint-002
2. Move task-008 back to active/
3. Reset task-008 status to pending
4. Update master plan

Next step:
- Analyze failure reason
- May need to split task-008
```
