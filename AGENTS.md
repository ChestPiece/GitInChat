# AGENTS.md — OpenCode Skill Workflow

## Overview

Skills live in `skills/<skill-name>/SKILL.md`. Invoke via Skill tool before any action.

## Core Rules

1. **Check for skills first** — Before acting, determine if a skill applies
2. **If skill applies, MUST use it** — No exceptions
3. **Never skip workflows** — Spec → Plan → Build → Verify → Review → Ship
4. **No jumping to implementation** — Process before code

## Lifecycle Mapping

| Phase | Skill |
|-------|-------|
| DEFINE | spec-driven-development |
| PLAN | planning-and-task-breakdown |
| BUILD | incremental-implementation + test-driven-development |
| VERIFY | debugging-and-error-recovery |
| REVIEW | code-review-and-quality |
| SHIP | shipping-and-launch |

## Intent → Skill Mapping

- "build feature" → incremental-implementation + test-driven-development
- "design system" → spec-driven-development
- "fix bug" → debugging-and-error-recovery
- "review code" → code-review-and-quality
- "optimize performance" → performance-optimization
- "secure code" → security-and-hardening
- "simplify code" → code-simplification
- "document" → documentation-and-adrs
- "ci/cd" → ci-cd-and-automation

## Skill Discovery

All skills located in:
```
skills/<skill-name>/SKILL.md
```

Use glob to discover: `skills/**/*.md`

## Execution

When skill applies:
1. Invoke Skill tool with skill name
2. Announce: "Using [skill] to [purpose]"
3. Follow skill exactly
4. Create todo list if skill has checklist

## Limitations

- No native slash commands — use intent mapping instead
- Skill invocation depends on model compliance
- Enforce via these rules

## Usage

Just use natural language. Agent will auto-select skills:
- "Design a feature" → spec-driven-development
- "Implement this" → incremental-implementation
- "Fix this bug" → debugging-and-error-recovery
- "Review this" → code-review-and-quality