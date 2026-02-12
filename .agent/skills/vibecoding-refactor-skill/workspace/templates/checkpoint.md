# Checkpoint Template

Use this template when creating checkpoints.

---

```markdown
# Checkpoint: checkpoint-{number}

## Basic Info
- Created: {ISO time}
- Git ref: {commit hash}
- Trigger Reason: Phase complete | Milestone | Manual creation

## Phase Info
- Completed Phase: Phase {N}
- Next Phase: Phase {N+1}

## Progress Snapshot

### Overall Progress
- Total Progress: {percentage}
- Completed Tasks: {count}
- In Progress Tasks: {count}
- Pending Tasks: {count}
- Blocked Tasks: {count}

### Phase Progress
| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1 | ✅ Complete | 100% |
| Phase 2 | ✅ Complete | 100% |
| Phase 3 | ⏳ Pending | 0% |

## Completed Tasks

| ID | Name | Completion Time |
|----|------|-----------------|
| task-001 | {name} | {time} |
| task-002 | {name} | {time} |
| ... | ... | ... |

## Current State

### Active Tasks
- None / {task list}

### Blocked Tasks
- None / {task list with reasons}

## Quality Metrics

### Compile Status
- cargo check: ✅
- npm build: ✅

### Test Status
- cargo test: {N} passed, {M} failed
- npm test: {N} passed, {M} failed

### Code Quality
- any types: {before} → {after}
- TODO markers: {before} → {after}
- Compile warnings: {before} → {after}

## Change Summary

### Main Changes This Phase
- {change 1}
- {change 2}
- {change 3}

### Deleted Files
- {file list}

### Added Files
- {file list}

## Rollback Instructions

To rollback to this checkpoint:

```bash
# 1. Rollback code
git checkout {commit hash}

# 2. Restore task state
# Move related tasks from completed/ back to active/
# Reset status to pending

# 3. Update master plan
# Restore to state at this checkpoint
```

## Next Steps

### Planned Tasks
- {task-xxx}: {description}
- {task-yyy}: {description}

### Notes
- {notes}

---

## Attachments

- [State Snapshot](./state-snapshot.json) (optional)
- [Task List](./tasks-snapshot.md) (optional)
```
