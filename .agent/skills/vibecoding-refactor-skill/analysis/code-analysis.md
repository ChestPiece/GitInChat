# Code Analysis Methods

Systematic analysis of code logic, call relationships, and data flow.

## Analysis Flow

```
Entry Identification → Call Stack Tracing → Data Flow Analysis → Output Analysis Report
```

---

## 1. Entry Identification

Find the trigger points of functionality.

### Frontend Entries

```bash
# User interactions
rg "onClick|onSubmit|onChange|onKeyDown" --type tsx

# Routes
rg "Route|path=" --type tsx
rg "useNavigate|useParams" --type tsx

# Lifecycle
rg "useEffect|useMemo|useCallback" --type tsx
```

### Backend Entries

```bash
# Tauri API
rg "#\[tauri::command\]" --type rust

# Event listeners
rg "on\(|subscribe\(|listen\(" --type rust
rg "EventEmitter|emit\(" --type rust
```

### Output Format

```markdown
## Entry List
| File | Function | Trigger Method | Frequency |
|------|----------|----------------|-----------|
| Component.tsx:45 | handleSave | Button click | Low |
| api.rs:23 | save_document | IPC call | Low |
```

---

## 2. Call Stack Tracing

### Forward Tracing (Entry → Bottom)

Trace all called functions from entry function downward.

```bash
# Search function definitions
rg "fn FUNC_NAME|function FUNC_NAME|const FUNC_NAME"

# Search function calls
rg "FUNC_NAME\("

# Trace async boundaries
rg "await |async fn|Promise<"
```

### Backward Tracing (Target → Entry)

Trace all callers from target function upward.

```bash
# Who calls this function
rg "target_function\("

# Who uses this type
rg "TargetType"
```

### Visualization Format

```
User clicks button
    ↓
handleSave() [Component.tsx:45]
    ↓
saveDocument(doc) [service.ts:123]
    ↓ await
api.invoke('save_document') [ApiClient.ts:67]
    ↓ IPC
save_document(request) [api.rs:89]
    ↓
DocumentService::save() [service.rs:234]
    ↓
storage.write() [storage.rs:56]
```

### Output Format

```markdown
## Call Stack Analysis

### Entry
- Function: handleSave
- Location: Component.tsx:45
- Trigger: Button click

### Call Chain
1. handleSave @ Component.tsx:45 - UI event handling
2. saveDocument @ service.ts:123 - Business logic
3. api.invoke @ ApiClient.ts:67 - API call [Async boundary]
4. save_document @ api.rs:89 - Tauri command
5. DocumentService::save @ service.rs:234 - Service layer
6. storage.write @ storage.rs:56 - Storage layer

### Key Points
- Async boundary: ApiClient.ts:67 (IPC)
- Error handling: service.ts:125 (try-catch)
```

---

## 3. Data Flow Analysis

### Data Definition Tracing

```bash
# Type definitions
rg "interface |type |struct |enum "

# Data creation
rg "new |create|init|build"
rg "useState|useRef|createStore" --type tsx
```

### Data Transformation Tracing

```bash
# Transform operations
rg "\.map\(|\.filter\(|\.reduce\("

# Serialization
rg "JSON\.parse|JSON\.stringify"
rg "serde|serialize|deserialize" --type rust
```

### State Change Tracing

```bash
# React
rg "setState|dispatch|set[A-Z]" --type tsx

# Zustand
rg "\.getState\(\)|\.setState\("

# Rust
rg "\.lock\(\)|\.write\(\)|mut "
```

### Visualization Format

```
User input
    ↓ onChange
inputValue: string [Component state]
    ↓ Submit
formData: FormData [Construction]
    ↓ Validate
validatedData: ValidatedForm [Transform]
    ↓ API
request: SaveRequest [Serialize]
    ↓ IPC
SaveRequest [Deserialize]
    ↓ Process
Document [Domain object]
    ↓ Storage
JSON string [Serialize]
```

### Output Format

```markdown
## Data Flow Analysis

### Main Data Types
- Document: Core domain object
- SaveRequest: API request format
- FormData: Frontend form data

### Lifecycle
| Stage | Type | Location | Operation |
|-------|------|----------|-----------|
| Create | FormData | Component.tsx:23 | User input |
| Transform | ValidatedForm | validator.ts:45 | Validate |
| Serialize | SaveRequest | ApiClient.ts:67 | JSON |
| Deserialize | SaveRequest | api.rs:89 | serde |
| Transform | Document | service.rs:123 | Business processing |
| Storage | JSON | storage.rs:56 | Persist |

### Boundary Crossings
- Frontend-Backend boundary: ApiClient.ts ↔ api.rs (IPC)
- Module boundary: service.ts ↔ ApiClient.ts
```

---

## Analysis Report Template

```markdown
# Code Analysis Report: [Feature Name]

## Overview
- Analysis Date: YYYY-MM-DD
- Analysis Scope: [File/Module list]

## Entry Points
[Entry list table]

## Call Stack
[Call chain visualization]

## Data Flow
[Data flow visualization]

## Discovered Problems
- [ ] Problem 1
- [ ] Problem 2

## Refactoring Recommendations
1. Recommendation 1
2. Recommendation 2
```
