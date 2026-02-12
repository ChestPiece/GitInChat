# Task Template

Copy this template to create new task files.

---

```markdown
---
id: task-{number}
title: {task title}
type: structure | logic | mixed
status: pending | in_progress | blocked | completed | cancelled
priority: high | medium | low
phase: {phase number}
parent: null
dependencies: []
created: {ISO time}
updated: {ISO time}
---

# Task: {Task Title}

## Goal
{One sentence describing task goal}

## Scope
- Files/Directories:
  - {path 1}
  - {path 2}
- Impact Scope: {description}
- Estimated Changes: {file count/code lines}

## Background
{Why this task is needed, what problem it solves}

## Execution Steps

### Preparation
- [ ] Analyze current state
- [ ] Determine target pattern
- [ ] Backup/create branch

### Execution
- [ ] Step 1: {description}
- [ ] Step 2: {description}
- [ ] Step 3: {description}

### Verification
- [ ] Compile passes
- [ ] Tests pass
- [ ] Functionality verified

### Cleanup
- [ ] Delete deprecated code
- [ ] Update documentation

## Progress Log

| Time | Operation | Result |
|------|-----------|--------|
| {time} | {operation} | {result} |

## Verification Results

| Check Item | Command | Result |
|------------|---------|--------|
| Compile | cargo check | ⏳ |
| Test | cargo test | ⏳ |
| Build | npm run build | ⏳ |
| Lint | npm run lint | ⏳ |

## Change List

| File | Operation | Description |
|------|-----------|-------------|
| {file path} | Modify/Delete/Add | {description} |

## Notes
{Other things to note}

## Related

### Dependencies
- Prerequisites: {dependent task ID}

### Dependents
- Successors: {tasks depending on this task ID}

### Related Docs
- Analysis Report: {path}
- Comparison Doc: {path}

---

## Block Information (If Blocked)
- Block Time: {time}
- Block Reason: {reason}
- Needed: {resolution condition}
- Expected Unblock: {condition}

## Cancel Information (If Cancelled)
- Cancel Time: {time}
- Cancel Reason: {reason}
- Replacement Task: {task ID}
```
