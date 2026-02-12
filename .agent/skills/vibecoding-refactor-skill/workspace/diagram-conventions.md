# Diagram Conventions

Specifications for using Mermaid to draw architecture diagrams, dependency diagrams, and call stack diagrams.

## General Conventions

### File Format

- Extension: `.mermaid`
- Encoding: UTF-8
- Location: `.refactor/diagrams/`

### Naming Rules

```
{type}-{description}.mermaid

Examples:
architecture-current.mermaid
architecture-target.mermaid
dependency-api-layer.mermaid
callstack-save-document.mermaid
```

---

## Architecture Diagrams

### Layered Architecture

```mermaid
graph TB
    subgraph "UI Layer"
        A[Component A]
        B[Component B]
    end
    
    subgraph "Application Layer"
        C[Store]
        D[Service]
    end
    
    subgraph "Infrastructure Layer"
        E[API Client]
        F[Storage]
    end
    
    subgraph "Core Layer"
        G[Types]
        H[Utils]
    end
    
    A --> C
    B --> D
    C --> E
    D --> E
    E --> F
    C --> G
    D --> H
```

### Style Specifications

```mermaid
graph TB
    %% Color definitions
    %% UI layer: Blue
    style A fill:#e1f5fe,stroke:#01579b
    
    %% Application layer: Orange
    style B fill:#fff3e0,stroke:#e65100
    
    %% Infrastructure layer: Green
    style C fill:#e8f5e9,stroke:#1b5e20
    
    %% Core layer: Gray
    style D fill:#f5f5f5,stroke:#424242
    
    %% Problem node: Red border
    style E fill:#ffebee,stroke:#c62828,stroke-width:2px
```

### Template

```mermaid
%%{init: {'theme': 'neutral'}}%%
graph TB
    subgraph "UI Layer"
        direction LR
        UI1[Editor]
        UI2[Chat]
        UI3[Terminal]
    end
    
    subgraph "Application Layer"
        direction LR
        APP1[EditorStore]
        APP2[ChatStore]
        APP3[TerminalService]
    end
    
    subgraph "Infrastructure Layer"
        direction LR
        INF1[API]
        INF2[Storage]
        INF3[Events]
    end
    
    UI1 --> APP1
    UI2 --> APP2
    UI3 --> APP3
    
    APP1 --> INF1
    APP2 --> INF1
    APP3 --> INF2
    
    INF1 --> INF3
```

---

## Dependency Diagrams

### Module Dependencies

```mermaid
graph LR
    A[errors.rs] 
    B[service/workspace]
    C[service/config]
    D[service/git]
    E[api-layer]
    F[desktop/api]
    
    B --> A
    C --> A
    D --> A
    D --> C
    E --> B
    E --> C
    E --> D
    F --> E
    
    %% Highlight core module
    style A fill:#fff3e0,stroke:#e65100,stroke-width:2px
```

### Circular Dependency Annotation

```mermaid
graph LR
    A[Module A]
    B[Module B]
    
    A -->|"Normal dependency"| B
    B -->|"Circular dependency ⚠️"| A
    
    style A fill:#ffebee,stroke:#c62828
    style B fill:#ffebee,stroke:#c62828
    
    linkStyle 1 stroke:#c62828,stroke-width:2px
```

### Dependency Levels

```mermaid
graph BT
    subgraph "Level 4"
        L4[web-ui]
    end
    
    subgraph "Level 3"
        L3[desktop/api]
    end
    
    subgraph "Level 2"
        L2[api-layer]
    end
    
    subgraph "Level 1"
        L1A[service/workspace]
        L1B[service/config]
        L1C[service/git]
    end
    
    subgraph "Level 0"
        L0[errors.rs]
    end
    
    L4 --> L3
    L3 --> L2
    L2 --> L1A
    L2 --> L1B
    L2 --> L1C
    L1A --> L0
    L1B --> L0
    L1C --> L0
    L1C --> L1B
```

---

## Call Stack Diagrams

### Vertical Flow

```mermaid
graph TB
    A[User clicks save button]
    B[handleSave - Component.tsx:45]
    C[saveDocument - service.ts:123]
    D[api.invoke - ApiClient.ts:67]
    E[save_document - api.rs:89]
    F[DocumentService::save - service.rs:234]
    G[storage.write - storage.rs:56]
    
    A --> B
    B --> C
    C -->|await| D
    D -->|IPC| E
    E --> F
    F --> G
    
    %% Mark async boundary
    style D fill:#e3f2fd,stroke:#1565c0
    style E fill:#e3f2fd,stroke:#1565c0
```

### Flow with Branches

```mermaid
graph TB
    A[Entry function]
    B{Condition check}
    C[Branch 1]
    D[Branch 2]
    E[Merge point]
    F[End]
    
    A --> B
    B -->|Condition 1| C
    B -->|Condition 2| D
    C --> E
    D --> E
    E --> F
```

---

## Data Flow Diagrams

```mermaid
graph LR
    A[User input]
    B[FormData]
    C[ValidatedData]
    D[Request]
    E[Response]
    F[State]
    
    A -->|onChange| B
    B -->|validate| C
    C -->|serialize| D
    D -->|API call| E
    E -->|deserialize| F
    
    style A fill:#e3f2fd
    style F fill:#e8f5e9
```

---

## Before/After Comparison Diagrams

### Side-by-Side Comparison

```markdown
## Architecture Comparison

### Before

​```mermaid
graph TB
    A[Component] --> B[Store]
    A --> C[API]  %% Direct API call
    B --> C
​```

### After

​```mermaid
graph TB
    A[Component] --> B[Store]
    B --> C[API]  %% Only through Store
​```
```

### Change Annotation

```mermaid
graph TB
    A[Component]
    B[Store]
    C[API]
    
    A --> B
    A -.->|"Removed"| C
    B --> C
    
    %% Removed path uses dashed line
    linkStyle 1 stroke:#c62828,stroke-dasharray: 5 5
```

---

## Embedding Diagrams

### Embed in Markdown

```markdown
## Architecture Analysis

Current architecture:

​```mermaid
graph TB
    A --> B
    B --> C
​```

Issues:
- A directly depends on C, crossing layers
```

### Reference External Files

```markdown
## Architecture Analysis

Current architecture: [Architecture Diagram](../diagrams/architecture/current.mermaid)

Target architecture: [Target Architecture Diagram](../diagrams/architecture/target.mermaid)
```

---

## Common Icons

```
✅ Complete/Normal
⚠️ Warning/Attention
❌ Error/Problem
🔄 In Progress
⏳ Waiting
📦 Module
📄 File
🔗 Dependency
```
