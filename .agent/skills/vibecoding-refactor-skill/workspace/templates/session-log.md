# Session Log Template

Copy this template to create new session logs.

---

```markdown
---
session_id: {date}-{number}
started: {ISO time}
ended: null
tasks_touched: []
status: in_progress | completed | interrupted
---

# Refactoring Session Log

## Session Info
- Session ID: {session_id}
- Start Time: {start time}
- Goal: {this session's goal}

## Initial State
- Overall Progress: {percentage}
- Current Phase: Phase {N}
- Active Tasks: {list}
- Blocked Tasks: {list}

## Execution Record

### {time} - Start
- Load workspace
- Confirm goal: {goal}

### {time} - {task ID}: {task name}

Operation:
- {operation description}

Changes:
- {file}: {change description}

Verification:
- {check item}: {result}

Next step:
- {next step operation}

### {time} - {next task or operation}

{...}

### {time} - Session End

- End reason: Goal complete | Time reason | Encountered problem
- Current state: {description}

## Verification Summary

| Check Item | Result | Notes |
|------------|--------|-------|
| cargo check | ✅/❌ | |
| cargo test | ✅/❌ | {N} passed, {M} failed |
| npm build | ✅/❌ | |
| npm lint | ✅/❌ | {N} warnings |
| Functionality | ✅/❌ | {description} |

## Completed This Session

- ✅ {task-xxx}: {task name}
- ✅ {task-yyy}: {task name}
- 🔄 {task-zzz}: {percentage} complete

## Progress Change

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Overall Progress | {X}% | {Y}% | +{Z}% |
| Phase {N} | {X}% | {Y}% | +{Z}% |
| Completed Tasks | {N} | {M} | +{K} |

## Issues and Discoveries

### Issue 1
- Description: {issue description}
- Impact: {impact scope}
- Handling: {handling method}

### Discovery 1
- Description: {discovery content}
- Recommendation: {follow-up recommendation}

## Next Continuation

### Continue Tasks
- {task-xxx}: Continue from step {N}
- {task-yyy}: Pending start

### Notes
- {note 1}
- {note 2}

### Expected Work
- Expected completion: {task list}
- Expected time: {estimate}
```
