# Comparison Document Template

Record before/after refactoring comparisons.

---

```markdown
# Comparison Document: {Comparison Subject}

## Basic Info
- Created: {date}
- Comparison Scope: {scope description}
- Related Tasks: {task-xxx, task-yyy}

---

## Overview

### Change Summary
{One paragraph describing main changes}

### Key Metric Comparison

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| File count | {N} | {M} | {change} |
| Code lines | {N} | {M} | {change} |
| any types | {N} | {M} | {change} |
| TODO markers | {N} | {M} | {change} |
| Test coverage | {N}% | {M}% | {change} |

---

## Architecture Comparison

### Before

```mermaid
{architecture diagram}
```

**Issues:**
- {issue 1}
- {issue 2}

### After

```mermaid
{architecture diagram}
```

**Improvements:**
- {improvement 1}
- {improvement 2}

---

## Code Comparison

### {Change Point 1}

**Before:**
```{language}
{code}
```

**After:**
```{language}
{code}
```

**Explanation:**
{Why changed this way}

### {Change Point 2}

**Before:**
```{language}
{code}
```

**After:**
```{language}
{code}
```

**Explanation:**
{Why changed this way}

---

## Pattern Unification

### Before Unification: {N} Implementations

```
Implementation A (file list):
- {file 1}
- {file 2}

Implementation B (file list):
- {file 3}
- {file 4}

Implementation C (file list):
- {file 5}
```

### After Unification: 1 Implementation

```
Target implementation (all files):
- {file 1}
- {file 2}
- {file 3}
- {file 4}
- {file 5}
```

---

## Dependency Comparison

### Before

```mermaid
{dependency diagram}
```

- Circular dependency: {A ↔ B}
- Cross-layer dependency: {C → D}

### After

```mermaid
{dependency diagram}
```

- ✅ Circular dependency resolved
- ✅ Cross-layer dependency fixed

---

## Quality Improvement

### Type Safety
| File | Before any count | After any count |
|------|------------------|-----------------|
| {file} | {N} | {M} |

### Error Handling
| File | Before unwrap | After unwrap |
|------|---------------|--------------|
| {file} | {N} | {M} |

### Code Complexity
| File | Before lines | After lines | Notes |
|------|--------------|-------------|-------|
| {file} | {N} | {M} | {split/merge} |

---

## Deleted Code

### Deleted Files
- {file path}: {reason}

### Deleted Functions
- {function name} @ {file}: {reason}

### Deleted Types
- {type name} @ {file}: {reason}

---

## Added Code

### Added Files
- {file path}: {purpose}

### Added Functions
- {function name} @ {file}: {purpose}

### Added Types
- {type name} @ {file}: {purpose}

---

## Verification Results

### Compile Verification
- cargo check: ✅
- npm build: ✅

### Test Verification
- Test cases: {N} total
- Passed: {N}
- Failed: {0}

### Functionality Verification
| Functionality | Status | Notes |
|---------------|--------|-------|
| {function 1} | ✅ | Normal |
| {function 2} | ✅ | Normal |

---

## Summary

### Goals Achieved
- ✅ {goal 1}
- ✅ {goal 2}

### Unexpected Gains
- {gain 1}

### Remaining Issues
- {issue 1}: {follow-up handling}

### Lessons Learned
- {lesson 1}
```
