# Analysis Report Template

Template for recording module or feature analysis results.

---

```markdown
# Analysis Report: {Analysis Subject}

## Basic Info
- Analysis Date: {date}
- Analysis Type: Module Analysis | Feature Analysis | Architecture Analysis
- Analysis Scope: {scope description}

---

## Overview

### Introduction
{One paragraph describing analysis subject}

### Key Information
- Path: {directory/file path}
- File Count: {number}
- Code Lines: {number}
- Main Responsibility: {description}

---

## Structure Analysis

### Directory Structure
```
{directory tree}
```

### File List
| File | Lines | Responsibility |
|------|-------|----------------|
| {filename} | {lines} | {responsibility} |

---

## Entry Points

| Entry | Location | Trigger Method | Frequency |
|-------|----------|----------------|-----------|
| {function name} | {file:line} | {method} | {high/medium/low} |

---

## Call Stack

### Main Call Chain
```
{call stack visualization}
```

### Key Nodes
| Node | Location | Responsibility |
|------|----------|----------------|
| {function name} | {file:line} | {responsibility} |

### Async Boundaries
- {location}: {description}

### Error Handling Points
- {location}: {handling method}

---

## Data Flow

### Data Types
| Type | Definition Location | Purpose |
|------|---------------------|---------|
| {type name} | {file:line} | {purpose} |

### Flow Process
```
{data flow visualization}
```

### Transform Points
| Location | Source Type | Target Type | Operation |
|----------|-------------|-------------|-----------|
| {location} | {type} | {type} | {operation} |

---

## Dependencies

### Inward Dependencies (Who Uses This)
| Module | Usage Method |
|--------|--------------|
| {module name} | {usage method} |

### Outward Dependencies (What This Uses)
| Module | Usage Method |
|--------|--------------|
| {module name} | {usage method} |

### Dependency Diagram
```mermaid
{dependency diagram}
```

### Issues
- [ ] Circular dependency: {A ↔ B}
- [ ] Cross-layer dependency: {description}

---

## Quality Assessment

### Complexity
| Metric | Value | Assessment |
|--------|-------|------------|
| Max function lines | {lines} | Normal/Too High |
| Max nesting depth | {levels} | Normal/Too Deep |
| Import count | {count} | Normal/Too Many |

### Code Smells
| Type | Count | Location |
|------|-------|----------|
| any types | {count} | {location list} |
| unwrap calls | {count} | {location list} |
| TODO/FIXME | {count} | {location list} |

### Test Coverage
- Test files: {yes/no}
- Coverage assessment: {Excellent/Good/Average/Poor}

---

## Vibe Coding Problem Identification

### Resource Waste (Most Common, Must Check)

#### Component Library Usage
| Library Component | Usage Count | Self-Made Alternative | Recommendation |
|-------------------|-------------|----------------------|----------------|
| {component name} | {count} | {yes/no, location} | {keep/delete self-made} |

#### Utility Function Reuse
| Utility Function | Definition Location | Duplicate Definition | Recommendation |
|------------------|---------------------|---------------------|----------------|
| {function name} | {location} | {yes/no, location} | {keep/delete duplicate} |

#### Type Definition Reuse
| Type Name | Definition Location | Duplicate Definition | Consistent | Recommendation |
|-----------|---------------------|---------------------|------------|----------------|
| {type name} | {location} | {yes/no} | {yes/no} | {merge plan} |

#### Public Service Reuse
| Service | Location | Usage Count | Non-Using Callers | Recommendation |
|---------|----------|-------------|-------------------|----------------|
| {service name} | {location} | {count} | {direct invoke locations} | {migrate to service} |

---

### Other Issues

- [ ] **Multiple implementations coexist**
  - {specific description: different implementation locations for same functionality}
  
- [ ] **Inconsistent patterns**
  - Error handling: {consistency level}
  - API calls: {consistency level}
  - State management: {consistency level}
  
- [ ] **Patch-style fixes**
  - TODO count: {count}
  - FIXME count: {count}
  - Compatibility code: {location}
  
- [ ] **Over-defensive coding**
  - any count: {count}
  - Redundant null checks: {location}
  
- [ ] **Architecture issues**
  - Circular dependency: {A ↔ B}
  - Layer violation: {description}

---

## Refactoring Recommendations

### High Priority
1. {Recommendation 1}
   - Reason: {reason}
   - Impact: {impact scope}
   
### Medium Priority
1. {Recommendation 2}

### Low Priority
1. {Recommendation 3}

---

## Appendix

### Related Documents
- {document link}

### Reference Code
```{language}
{key code snippet}
```
```
