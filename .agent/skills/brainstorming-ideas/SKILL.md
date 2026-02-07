---
name: brainstorming-ideas
description: Turns ideas into fully formed designs through collaborative dialogue. Use before creative work, when exploring requirements, or when the user wants to brainstorm.
---

# Brainstorming Ideas Into Designs

## When to use this skill

- Before starting a new feature or component.
- When requirements are vague or unexplored.
- When the user asks to "brainstorm" or "discuss an idea".

## Overview

Help turn ideas into fully formed designs and specs through natural collaborative dialogue. Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what you're building, present the design in small sections, checking after each section whether it looks right so far.

## Workflow

1.  **Understand the idea** (Ask Qs one by one)
2.  **Explore approaches** (Propose 2-3 options)
3.  **Present the design** (Incremental validation)
4.  **Documentation** (Write to docs/plans/)

## Instructions

### 1. Understanding the Idea

- Check out the current project state first (files, docs).
- Ask questions **one at a time** to refine the idea.
- Prefer multiple choice questions when possible.
- Focus on purpose, constraints, and success criteria.

### 2. Exploring Approaches

- Propose 2-3 different approaches with trade-offs.
- Present options conversationally with your recommendation and why.

### 3. Presenting the Design

- Once you understand what to build, present the design.
- Break it into sections of 200-300 words.
- Ask after each section whether it looks right so far.
- Cover: architecture, components, data flow, error handling, testing.
- Be ready to go back and clarify if something doesn't make sense.

### 4. After the Design

- Write the validated design to `docs/plans/YYYY-MM-DD-<topic>-design.md`.
- Commit the design document to git.

## Key Principles

- **One question at a time** - Don't overwhelm.
- **Multiple choice preferred**.
- **YAGNI ruthlessly**.
- **Explore alternatives** - 2-3 approaches.
- **Incremental validation**.
