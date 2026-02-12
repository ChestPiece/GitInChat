# Agent Recovery Guide

How to recover refactoring state when context overflows or new session starts.

## Core Principle

```
All state persisted in .refactor/ directory
New Agent does not rely on conversation history, 
fully recovers context through files
```

---

## Recovery Flow

### Step 1: Detect Workspace

```bash
# Check if refactoring workspace exists
ls .refactor/
```

If exists, enter recovery flow; if not, this is a new refactoring project.

### Step 2: Read Core Files

**Read by priority:**

1. **README.md** - Status summary and context
   ```
   Read: .refactor/README.md
   Get: Overall progress, current status, last interruption point, important decisions
   ```

2. **master-plan.md** - Complete task tree
   ```
   Read: .refactor/tasks/master-plan.md
   Get: All phases, task list, dependencies, checkpoints
   ```

3. **Active tasks** - Currently in-progress tasks
   ```
   List: .refactor/tasks/active/
   Read: Each task file's detailed steps and progress
   ```

4. **Latest log** (optional) - Understand last specific operations
   ```
   Find: Latest file in .refactor/logs/
   Read: Last session's specific operation records
   ```

### Step 3: Build Status Report

**Report Template:**

```markdown
## 🔄 Refactoring Status Recovery

I have read the workspace status, here is the current situation:

### Project Info
- Project: {project name}
- Goal: {refactoring goal}

### Overall Progress
- Total Progress: {X}%
- Current Phase: Phase {N} - {phase name}
- Completed: {M} tasks
- Pending: {K} tasks

### Current Tasks
🔄 **{task-xxx}: {task name}**
- Progress: {percentage}
- Completed steps:
  - ✅ {step 1}
  - ✅ {step 2}
- Next step: {specific next step}

### Last Interruption Point
- Time: {time}
- Stopped at: {specific location}
- Reason: {if known}

### Suggested Continuation
1. {suggested next step}
2. {follow-up plan}

---
Please confirm to continue, or other arrangements?
```

### Step 4: Wait for User Confirmation

After user confirms:
1. Update task status to in_progress
2. Create new session log
3. Continue task execution

---

## File Read Order

```
Priority 1 (Must read):
├── .refactor/README.md              # Overall status entry
└── .refactor/tasks/master-plan.md   # Task tree

Priority 2 (Read as needed):
├── .refactor/tasks/active/*.md      # Active task details
└── .refactor/logs/session-*.md      # Latest session log

Priority 3 (Deep understanding):
├── .refactor/analysis/              # Analysis artifacts
└── .refactor/checkpoints/           # Checkpoint info
```

---

## Context Saving (At Session End)

To ensure next recovery possible, must do at each session end:

### 1. Update README.md

```markdown
## Last Interruption Point
- Time: 2026-01-24 16:30
- Session: session-2026-01-24-002
- Stopped at: task-007 step 3, migrating api-layer/handlers.rs
- Next step: Continue migrating remaining 5 files

## Issues to Note
- New discovery: desktop/api/file_api.rs has special error handling, needs manual adjustment
```

### 2. Update Active Tasks

```markdown
## Execution Steps
- [x] Step 1: Analyze existing implementation ✅
- [x] Step 2: Migrate core modules ✅
- [ ] Step 3: Migrate API layer (in progress, 60% complete)
- [ ] Step 4: Migrate frontend

## Progress Log
| Time | Operation | Result |
|------|-----------|--------|
| 14:00 | Start step 3 | - |
| 15:30 | Migrate handlers.rs | Complete |
| 16:00 | Migrate commands.rs | Complete |
| 16:30 | Interrupted | 5 files remaining to migrate |

## Next Continuation
Start from api-layer/queries.rs, in this order:
1. queries.rs
2. mutations.rs
3. subscriptions.rs
4. utils.rs
5. mod.rs
```

### 3. Save Session Log

```markdown
## Session End
- End Time: 2026-01-24T16:30:00
- End Reason: User ended / Context limit / Other

## Next Continuation
- Task: task-007
- Step: Step 3 (60%)
- Specific: Start migration from api-layer/queries.rs

## Notes
- file_api.rs needs special handling
- See task file notes
```

---

## Common Recovery Scenarios

### Scenario 1: Normal Continuation

```
User: "Continue refactoring"

Agent:
1. Read README.md and master-plan.md
2. Read active tasks
3. Report status
4. Continue after confirmation
```

### Scenario 2: Forgot Progress

```
User: "Where did we leave off?"

Agent:
1. Read README.md's "Last Interruption Point"
2. Read active task's progress log
3. Read latest log
4. Report last progress in detail
```

### Scenario 3: Rollback Needed

```
User: "Last changes broke it, rollback"

Agent:
1. Read checkpoints/ to find latest checkpoint
2. Use git-ref.txt to rollback code
3. Restore task state
4. Update README.md and master-plan.md
```

### Scenario 4: Long Interruption

```
User: "Haven't worked on this for a while, help me review"

Agent:
1. Read all core files
2. Read analysis artifacts and architecture diagrams
3. Complete status report
4. Provide continuation recommendations
```

---

## Recovery Checklist

```
□ Read README.md
□ Read master-plan.md
□ List and read active tasks
□ Understand last interruption point
□ Understand decisions made
□ Understand issues to note
□ Report to user
□ Get user confirmation
□ Create new session log
□ Continue execution
```
