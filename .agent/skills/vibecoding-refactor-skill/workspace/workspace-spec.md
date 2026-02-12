# Workspace Specification

Refactoring workspace directory structure, file specifications, and management methods.

## Directory Structure

```
.refactor/                      # Workspace root directory
│
├── README.md                   # Workspace description + overall status
│
├── tasks/                      # Task management
│   ├── master-plan.md          # Master plan (task tree)
│   ├── active/                 # Currently active tasks
│   │   └── task-xxx.md
│   ├── completed/              # Completed tasks
│   │   └── task-xxx.md
│   ├── blocked/                # Blocked tasks
│   │   └── task-xxx.md
│   └── cancelled/              # Cancelled tasks
│       └── task-xxx.md
│
├── logs/                       # Session logs
│   └── session-YYYY-MM-DD-NNN.md
│
├── checkpoints/                # Checkpoints
│   └── checkpoint-NNN/
│       ├── state.md            # State snapshot
│       └── git-ref.txt         # Git reference
│
├── analysis/                   # Analysis artifacts (Core!)
│   ├── project-partition.md    # 🔴 Phase 0: Project partition + resource inventory
│   ├── key-identification.md   # 🔴 Phase 1: Key feature list
│   ├── architecture-report.md  # 🔴 Phase 2: Architecture layer issues + tasks
│   ├── module-report.md        # 🔴 Phase 3: Module layer issue summary + tasks
│   ├── modules/                # 🔴 Phase 3: Detailed analysis for each feature
│   │   ├── file-editor.md
│   │   ├── chat.md
│   │   ├── terminal.md
│   │   └── ...
│   └── architecture/           # Architecture diagrams (optional)
│       ├── current.md
│       └── target.md
│
├── comparisons/                # Before/after comparisons
│   ├── overview.md             # Comparison overview
│   └── module-xxx/             # Module comparison
│       ├── before.md
│       └── after.md
│
└── diagrams/                   # Diagrams
    ├── architecture/           # Architecture diagrams
    │   ├── current.mermaid
    │   └── target.mermaid
    ├── dependencies/           # Dependency diagrams
    │   └── module-xxx.mermaid
    └── callstacks/             # Call stack diagrams
        └── feature-xxx.mermaid
```

---

## Initialize Workspace

### Commands

```bash
# Create directory structure
mkdir -p .refactor/{tasks/{active,completed,blocked,cancelled},logs,checkpoints,analysis/{architecture,modules},comparisons,diagrams}

# Create base files
touch .refactor/README.md
touch .refactor/tasks/master-plan.md

# Create mandatory analysis phase files
touch .refactor/analysis/project-partition.md   # Phase 0: Project partition + resource inventory
touch .refactor/analysis/key-identification.md  # Phase 1: Key feature list
touch .refactor/analysis/architecture-report.md # Phase 2: Architecture layer analysis report
touch .refactor/analysis/module-report.md       # Phase 3: Module layer analysis summary
# modules/ directory will have detailed analysis files created for each feature
```

### Analysis Phase File Templates

#### project-partition.md (Phase 0: Project Partition)
```markdown
# Project Partition

## Directory Structure
{tree output}

## Domain Division
| Domain | Directory | Responsibility |
|--------|-----------|----------------|
| Frontend/Component Library | component-library/ | UI base components |
| Frontend/Business | tools/, features/ | Business functionality |
| ... | ... | ... |

---

## Resource Inventory (Detailed! Will be used in subsequent module analysis)

### UI Layer Resources

#### Component Library
| Component Name | Export Location | Props | Description |
|----------------|-----------------|-------|-------------|
| Button | component-library/Button | variant, size, onClick... | Button |
| Card | component-library/Card | title, children... | Card |
| Modal | component-library/Modal | open, onClose... | Modal |
| ... | ... | ... | ... |

#### Icons
| Icon | Location | Description |
|------|----------|-------------|
| IconXxx | icons/ | ... |

### Utility Layer Resources

#### Utility Functions
| Function Name | Export Location | Signature | Description |
|---------------|-----------------|-----------|-------------|
| formatDate | shared/utils/date | (date: Date) => string | Date formatting |
| debounce | shared/utils/debounce | (fn, ms) => fn | Debounce |
| ... | ... | ... | ... |

#### Custom Hooks
| Hook | Location | Return Value | Description |
|------|----------|--------------|-------------|
| useLocalStorage | hooks/useLocalStorage | [value, setValue] | Local storage |
| ... | ... | ... | ... |

#### Public Types
| Type Name | Definition Location | Main Fields |
|-----------|---------------------|-------------|
| User | shared/types/user | id, name, email... |
| Config | shared/types/config | theme, language... |
| ... | ... | ... |

### Service Layer Resources

#### API Services
| Service Name | Location | Main Methods | Description |
|--------------|----------|--------------|-------------|
| FileService | infrastructure/api/file | save, load, delete | File operations |
| ConfigService | infrastructure/api/config | get, set | Config management |
| ... | ... | ... | ... |

#### State Management
| Store | Location | Main State | Description |
|-------|----------|------------|-------------|
| useEditorStore | editor/store | content, cursor... | Editor state |
| ... | ... | ... | ... |

### Infrastructure (Important!)

#### Logging System
- Location: {path}
- Usage: `logger.info()`, `logger.error()`
- Log levels: debug, info, warn, error

#### Event System
- Location: {path}
- Usage: `eventBus.emit('event', data)`, `eventBus.on('event', handler)`
- Defined events: {event list}

#### Internationalization
- Location: {path}
- Usage: `t('key')`, `useTranslation()`
- Supported languages: en-US, zh-CN...
- Language pack location: locales/

#### Theme System
- Location: {path}
- Usage: `useTheme()`, `theme.colors.xxx`
- Supported themes: light, dark

#### Error Handling
- Location: {path}
- Error boundary: ErrorBoundary component
- Unified error type: AppError

#### Configuration System
- Location: {path}
- Usage: `config.get('key')`
- Config sources: Environment variables/Config files

#### Other Infrastructure (Add based on actual project)
| Infrastructure | Location | Usage | Description |
|----------------|----------|-------|-------------|
| Permission System | ... | ... | ... |
| Cache System | ... | ... | ... |
| Router System | ... | ... | ... |
| ... | ... | ... | ... |
```

#### key-identification.md (Phase 1: Key Identification)
```markdown
# Key Identification

## Core Feature List
| Feature | Entry Location | Modules Involved | Complexity |
|---------|----------------|------------------|------------|
| File Editor | Editor.tsx:main | editor/, services/ | High |
| Chat Feature | Chat.tsx:render | features/ | High |
| Terminal | Terminal.tsx:init | terminal/ | Medium |
| ... | ... | ... | ... |

## High-Frequency Code
| Module/Function | Reference Count | Location |
|-----------------|-----------------|----------|
| ... | ... | ... |

## Key Paths
### Feature: File Editor
Entry -> handleSave -> FileService -> invoke -> Rust

### Feature: Chat
Entry -> sendMessage -> ChatService -> invoke -> Rust
```

#### architecture-report.md (Phase 2: Architecture Layer Analysis)
```markdown
# Architecture Layer Analysis Report

## Layering Violations
| Location | Wrong Dependency | Severity | Fix Recommendation |
|----------|------------------|----------|-------------------|
| core/utils.ts:15 | import components/ | High | Remove dependency |

## Circular Dependencies
| Module A | Module B | Files Involved | Fix Recommendation |
|----------|----------|----------------|-------------------|
| ... | ... | ... | ... |

## Directory Structure Issues
| Issue | Location | Recommendation |
|-------|----------|----------------|
| ... | ... | ... |

## Architecture Layer Refactoring Tasks
- [A-001] Resolve core -> components violation
- [A-002] Resolve circular dependency
```

#### module-report.md (Phase 3: Module Layer Analysis Summary)
```markdown
# Module Layer Analysis Report

## Analysis Coverage
| Feature | Status | Problem Count | Report |
|---------|--------|---------------|--------|
| File Editor | ✅ | 5 | modules/file-editor.md |
| Chat | ✅ | 8 | modules/chat.md |

## Resources Not Reused (P1)
| Module | Problem | Location | Should Use |
|--------|---------|----------|------------|
| File Editor | Self-made Button | Editor.tsx:45 | component-library/Button |
| ... | ... | ... | ... |

## Duplicate Implementations (P1)
| Functionality | Duplicate Locations | Recommendation |
|---------------|---------------------|----------------|
| File save | Editor.tsx, FilePanel.tsx | Merge to FileService |

## Inconsistent Patterns (P2)
| Module | Problem | Current | Should Unify To |
|--------|---------|---------|-----------------|
| ... | ... | ... | ... |

## Module Layer Refactoring Tasks
- [M-001] Migrate self-made Button to component library
- [M-002] Merge file save implementation
```

#### modules/[feature-name].md (Phase 3: Single Feature Detailed Analysis)

See module analysis template in [analysis/deep-analysis.md](../analysis/deep-analysis.md)

### README.md Template (Core Recovery Entry)

**Important**: This file is the core entry point for new Agent to recover context, must be kept up to date!

```markdown
# Refactoring Workspace

> ⚡ **New Agent Recovery Entry** - Read this file to get full context

## Project Info
- Project: {project name}
- Project Path: {absolute path}
- Tech Stack: {e.g., Tauri + React + Rust}
- Created: YYYY-MM-DD
- Last Updated: YYYY-MM-DD HH:MM

## Refactoring Goal
{One paragraph describing core refactoring goal}

## Current Status

### Overall Progress
- Status: 🔄 In Progress / ⏸️ Paused / ✅ Complete
- Total Progress: XX%
- Current Phase: Phase N - {phase name}

### Active Tasks
| ID | Name | Progress | Next Step |
|----|------|----------|-----------|
| task-xxx | {name} | XX% | {next step} |

### Blocked Tasks (if any)
| ID | Name | Block Reason |
|----|------|--------------|
| - | - | - |

## Last Interruption Point
- Time: YYYY-MM-DD HH:MM
- Session: session-YYYY-MM-DD-NNN
- Stopped at: {specific description}
- Next step: {what to do next}

## Important Context (New Agent Must Read)

### Key Decisions Made
- {Decision 1}: {reason}
- {Decision 2}: {reason}

### Issues to Note
- {Issue 1}: {how to handle}
- {Issue 2}: {how to handle}

### Technical Conventions
- Error handling: {adopted pattern}
- State management: {adopted solution}
- API calls: {unified method}

## Quick Navigation
- [Master Plan](tasks/master-plan.md) - Complete task tree
- [Current Tasks](tasks/active/) - Active task details
- [Latest Logs](logs/) - Session history
- [Checkpoints](checkpoints/) - Rollback points

## Verification Commands
```bash
# Rust
cargo check --workspace
cargo test --workspace

# TypeScript
npm run build
npm run lint
```

## Recent Updates
| Time | Operation | Description |
|------|-----------|-------------|
| YYYY-MM-DD HH:MM | {operation} | {description} |
```

**Update Timing**:
- At end of each session
- When status changes significantly
- When phase completes
- When important decisions made

---

## File Naming Conventions

### Task Files
```
task-{3-digit number}.md

Examples:
task-001.md
task-002.md
task-100.md
```

### Session Logs
```
session-{date}-{3-digit number}.md

Examples:
session-2026-01-24-001.md
session-2026-01-24-002.md
```

### Checkpoints
```
checkpoint-{3-digit number}/

Examples:
checkpoint-001/
checkpoint-002/
```

### Analysis Files
```
{module-name}.md or {feature-name}.md

Examples:
analysis/modules/chat.md
analysis/functions/save-document.md
```

### Diagram Files
```
{description}.mermaid

Examples:
diagrams/architecture/current.mermaid
diagrams/dependencies/api-layer.mermaid
```

---

## Version Control

### .gitignore Recommendations

```gitignore
# Optional: Include workspace in version control
# If you don't want to track, add:
# .refactor/

# Recommend tracking these:
# - tasks/master-plan.md (master plan)
# - analysis/ (analysis artifacts)
# - comparisons/ (comparison records)
# - diagrams/ (diagrams)

# Can ignore these:
.refactor/logs/
.refactor/checkpoints/
.refactor/tasks/active/
.refactor/tasks/blocked/
```

### Git Integration

```bash
# Record Git ref at checkpoint
git rev-parse HEAD > .refactor/checkpoints/checkpoint-001/git-ref.txt

# Rollback to checkpoint
git checkout $(cat .refactor/checkpoints/checkpoint-001/git-ref.txt)
```

---

## Progress Tracking

### Progress in master-plan.md

```markdown
## Progress Overview

| Phase | Status | Progress | Tasks |
|-------|--------|----------|-------|
| Phase 1 | ✅ Complete | 100% | 3/3 |
| Phase 2 | 🔄 In Progress | 50% | 2/4 |
| Phase 3 | ⏳ Pending | 0% | 0/5 |

## Current Focus
- Active: task-004, task-005
- Next: task-006
- Blocked: None
```

### Status Icons

```
✅ Complete
🔄 In Progress
⏳ Pending
🚫 Blocked
❌ Cancelled
```

---

## Cleanup Workspace

### After Refactoring Complete

```bash
# Option 1: Archive
mv .refactor .refactor-archived-$(date +%Y%m%d)

# Option 2: Delete
rm -rf .refactor

# Option 3: Keep important files
mkdir -p docs/refactor-history
cp .refactor/comparisons/overview.md docs/refactor-history/
cp -r .refactor/diagrams docs/refactor-history/
rm -rf .refactor
```

### Mid-way Pause

```bash
# Ensure state saved
# 1. Update all active task status
# 2. Update master-plan.md
# 3. Commit to Git (optional)

git add .refactor/
git commit -m "refactor: save refactoring progress"
```
