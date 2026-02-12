# Quality Assessment Methods

Evaluate code maintainability, complexity, and technical debt.

## Assessment Dimensions

```
Complexity → Code Smells → Test Coverage → Technical Debt → Quality Report
```

---

## 1. Complexity Metrics

### Function Complexity

| Metric | Threshold | Meaning |
|--------|-----------|---------|
| Function lines | >50 lines | Consider splitting |
| Nesting depth | >3 levels | Consider simplifying |
| Parameter count | >5 | Consider encapsulating |
| Branch count | >10 | Consider refactoring |

### Detection Methods

```bash
# Find long functions (rough estimate)
# Search for lines after function definitions
rg "^(export )?(async )?(function|const) \w+" -A 100 --type ts

# Find deep nesting (4 levels = 16 spaces)
rg "^\s{16,}" --type ts
```

### File Complexity

| Metric | Threshold | Meaning |
|--------|-----------|---------|
| File lines | >500 lines | Consider splitting |
| Import count | >15 | May have too many responsibilities |
| Export count | >10 | Module may be too large |

### Detection Methods

```bash
# File line count sorted
fd -e ts -e tsx -e rs | xargs wc -l | sort -rn | head -20

# Import count
for f in $(fd -e ts -e tsx); do
  count=$(rg "^import" $f | wc -l)
  echo "$count $f"
done | sort -rn | head -20
```

---

## 2. Code Smell Detection

### TypeScript Smells

```bash
# any type (type safety issue)
rg ": any|as any" --type ts -c
rg ": any|as any" --type ts  # View specific locations

# Nested ternary expressions (readability issue)
rg "\?.*\?.*:" --type ts

# Excessively long chain calls
rg "\.\w+\(.*\)\.\w+\(.*\)\.\w+\(" --type ts

# Magic numbers
rg "setTimeout\(.*[0-9]{4,}" --type ts
rg "= [0-9]{3,}" --type ts

# console.log remnants
rg "console\.(log|debug|info)" --type ts
```

### Rust Smells

```bash
# unwrap abuse (panic risk)
rg "\.unwrap\(\)" --type rust -c
rg "\.expect\(" --type rust -c

# Excessive clone usage
rg "\.clone\(\)" --type rust -c

# Excessively long match branches
rg "match " -A 50 --type rust

# unsafe blocks
rg "unsafe \{" --type rust
```

### General Smells

```bash
# TODO/FIXME accumulation
rg "TODO|FIXME|HACK|XXX|TEMP" -c
rg "TODO|FIXME" --type ts --type rust

# Commented out code
rg "^(\s*//.*){5,}" --type ts  # 5 consecutive comment lines

# Excessively long lines
rg ".{120,}" --type ts --type rust
```

---

## 3. Test Coverage Assessment

### Find Test Files

```bash
# Test files
fd "test|spec" --type f

# Rust test modules
rg "#\[cfg\(test\)\]" --type rust -l
rg "#\[test\]" --type rust -l

# TypeScript tests
rg "describe\(|it\(|test\(" --type ts -l
```

### Assess Coverage Scope

```bash
# List all public functions
rg "^export (async )?(function|const) \w+" --type ts -o

# List all Rust public functions
rg "^pub (async )?fn \w+" --type rust -o

# Compare functions tested in test files
rg "test\(['\"].*['\"]" --type ts -o
```

### Coverage Level Metrics

| Level | Coverage Rate | Assessment |
|-------|---------------|------------|
| Excellent | >80% | Safe to refactor |
| Good | 60-80% | Need to add key tests |
| Average | 40-60% | Refactor with caution |
| Poor | <40% | Need to add tests first |

---

## 4. Technical Debt Assessment

### Debt Classification

| Category | Identification Method | Impact |
|----------|----------------------|--------|
| Design Debt | Architecture issues, circular dependencies | High |
| Code Debt | TODO, duplicate code | Medium |
| Test Debt | Insufficient test coverage | Medium |
| Documentation Debt | Missing documentation, comments | Low |

### Quantification Methods

```bash
# TODO debt
todo_count=$(rg "TODO|FIXME" -c | awk -F: '{sum+=$2} END {print sum}')

# Duplicate code debt (rough)
# Search for similar function signatures
rg "function \w+\(.*request" --type ts

# Type safety debt
any_count=$(rg ": any|as any" --type ts -c | awk -F: '{sum+=$2} END {print sum}')

# Panic risk debt
unwrap_count=$(rg "\.unwrap\(\)" --type rust -c | awk -F: '{sum+=$2} END {print sum}')
```

### Debt Priority

```
High Priority (Blocking development):
- Circular dependencies
- Compile warnings
- Severe bug risks

Medium Priority (Affecting efficiency):
- Duplicate code
- Type unsafe
- Missing tests

Low Priority (Technical improvement):
- Non-standard naming
- Missing documentation
- Code formatting
```

---

## Quality Report Template

```markdown
# Quality Assessment Report

## Overview
- Assessment Date: YYYY-MM-DD
- Assessment Scope: [Project/Module]

## Complexity Metrics

### File Complexity Top 10
| File | Lines | Imports | Assessment |
|------|-------|---------|------------|
| ... | ... | ... | Normal/Too High |

### Function Complexity Issues
| File | Function | Lines | Nesting | Recommendation |
|------|----------|-------|---------|----------------|
| ... | ... | ... | ... | Split |

## Code Smells

| Type | Count | Severity |
|------|-------|----------|
| any types | 125 | High |
| unwrap calls | 50 | High |
| TODO/FIXME | 764 | Medium |
| Long lines | 23 | Low |

### Problem Location Top 10
| File | Issue | Count |
|------|-------|-------|
| ... | any | 15 |

## Test Coverage

| Module | Test Files | Coverage Assessment |
|--------|------------|---------------------|
| core | 5 | Good |
| api | 2 | Average |
| ui | 0 | Poor |

## Technical Debt Summary

| Category | Count | Priority | Estimated Effort |
|----------|-------|----------|------------------|
| Type Safety | 125 locations | High | Medium |
| Error Handling | 50 locations | High | Medium |
| Code Duplication | 20 locations | Medium | Large |
| Missing Documentation | Multiple | Low | Small |

## Recommendations

### Fix Immediately
1. ...

### Planned Fix
1. ...

### Long-term Improvement
1. ...
```
