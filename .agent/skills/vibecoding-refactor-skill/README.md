# Vibe Coding Refactor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | [中文](README.zh-CN.md)

A systematic methodology for refactoring AI-generated code (Vibe Coding). Helps you discover duplicate implementations, unused resources, and inconsistent patterns.

## Features

- **Six-Phase Workflow** - Structured approach from analysis to verification
- **Deep Analysis Methods** - Architecture-layer and module-layer problem detection
- **Resource Inventory** - Comprehensive discovery of reusable components and infrastructure
- **Task Persistence** - All analysis results and progress saved to `.refactor/` directory
- **Session Recovery** - Supports incremental execution across sessions; new agents can resume exactly where left off

## The Problem

In Vibe Coding mode, AI is limited by context windows and struggles to see the big picture of large projects. Cross-session development leads to fragmented context, and code evolves through incremental patches. Over time, projects accumulate problems: duplicate implementations, unused component libraries, pattern chaos, and skyrocketing maintenance costs.

## How to Use

### In Cursor

**Method 1: As a Skill (Recommended)**

1. Copy this folder to `~/.cursor/skills/vibecoding-refactor/`
2. Cursor will automatically detect and use the skill when you ask to:
   - "Refactor this codebase"
   - "Clean up the code"
   - "Analyze the architecture"
   - "Improve code quality"

**Method 2: Reference Directly**

Simply reference SKILL.md in your prompt:

```
@SKILL.md Please analyze and refactor this project
```

### In Claude Code (claude-code CLI)

**Method 1: As AGENTS.md**

1. Copy the content from `SKILL.md` to your project's `AGENTS.md` file
2. Claude Code will automatically follow the methodology

**Method 2: Reference in Prompt**

```bash
# Reference the skill file directly
claude "Read @SKILL.md and refactor this project following the methodology"
```

**Method 3: Using /read Command**

```bash
claude
> /read /path/to/vibecoding-refactor/SKILL.md
> Please refactor this codebase following the methodology
```

### Quick Commands

| Goal | Prompt |
|------|--------|
| Full refactor | "Refactor this codebase following the Vibe Coding methodology" |
| Continue work | "Continue refactoring" (if `.refactor/` exists) |
| Architecture only | "Analyze the architecture layer only" |
| Specific module | "Analyze the [module-name] module" |

## Core Workflow

```
Phase 0         Phase 1          Phase 2            Phase 3            Phase 4          Phase 5
Partition   →   Key Identify  →  Architecture   →   Module Layer   →   Execute      →   Finalize
                                  Analysis            Analysis          Refactor         Verify
```

1. **Phase 0: Project Partition** - Inventory all reusable resources
2. **Phase 1: Key Identification** - Identify core features to analyze
3. **Phase 2: Architecture Analysis** - Detect global architecture problems
4. **Phase 3: Module Analysis** - Deep dive into each feature module
5. **Phase 4: Execute Refactoring** - Systematic refactoring by layer
6. **Phase 5: Finalize & Verify** - Verification and cleanup

## Core Principles

1. **Functionality Unchanged** - All functionality remains exactly the same
2. **UI Unchanged** - Visual appearance and interaction preserved
3. **Rollbackable** - Each change can be independently rolled back
4. **Traceable** - All operations are recorded

## Workspace Persistence

When refactoring begins, a `.refactor/` workspace is created. All analysis results and progress are persisted:

```
.refactor/
├── README.md                 # Status summary (recovery entry point)
├── tasks/
│   ├── master-plan.md        # Task tree and progress
│   ├── active/               # Currently active tasks
│   └── completed/            # Completed tasks
├── logs/                     # Session logs
├── checkpoints/              # Rollback points with git refs
└── analysis/                 # Analysis artifacts
    ├── project-partition.md  # Resource inventory
    ├── architecture-report.md
    └── modules/              # Per-feature analysis
```

### Session Recovery

When you say "continue refactoring" or a `.refactor/` directory exists, the agent will:

1. Read `.refactor/README.md` for overall status
2. Read `master-plan.md` to understand task progress
3. Read active task files and resume from the interruption point

**No re-analysis needed - all context is restored from persisted files.**

## Project Structure

```
vibecoding-refactor/
├── SKILL.md                 # Main skill definition (entry point)
├── analysis/                # Analysis methods
├── patterns/                # Pattern library
├── strategies/              # Execution strategies
└── workspace/               # Workspace management
```

## Key Documents

| Document | Description |
|----------|-------------|
| [SKILL.md](SKILL.md) | **Start here** - Complete workflow |
| [Deep Analysis](analysis/deep-analysis.md) | Core analysis methodology |
| [Vibe Coding Problems](patterns/vibe-coding-problems.md) | Problem classification |
| [Refactor Patterns](patterns/refactor-patterns.md) | Standard solutions |

## License

MIT License - see [LICENSE](LICENSE) file for details.
