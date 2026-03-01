# Workflow System: Comprehensive Analysis Report

**Generated**: 2026-03-01
**Scope**: Full system analysis — data model, architecture, methodology, purpose, and first principles

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Purpose & Vision](#2-purpose--vision)
3. [First Principles](#3-first-principles)
4. [The FlowSpec v1 Schema — Source of Truth](#4-the-flowspec-v1-schema--source-of-truth)
5. [Data Model Deep Dive](#5-data-model-deep-dive)
6. [System Architecture](#6-system-architecture)
7. [State Management Architecture](#7-state-management-architecture)
8. [Data Flow & Lifecycle](#8-data-flow--lifecycle)
9. [API Boundary — The Key Module](#9-api-boundary--the-key-module)
10. [Graph Model & Visualization](#10-graph-model--visualization)
11. [Validation System](#11-validation-system)
12. [Template System](#12-template-system)
13. [History & Undo/Redo System](#13-history--undoredo-system)
14. [File System Layer](#14-file-system-layer)
15. [UI Component Architecture](#15-ui-component-architecture)
16. [Type System & Safety Patterns](#16-type-system--safety-patterns)
17. [Design Patterns Catalog](#17-design-patterns-catalog)
18. [Migration & Portability Strategy](#18-migration--portability-strategy)
19. [Strengths, Weaknesses, and Opportunities](#19-strengths-weaknesses-and-opportunities)
20. [Appendix: Complete Type Reference](#20-appendix-complete-type-reference)

---

## 1. Executive Summary

This project is a **proof-of-concept visual workflow builder** for editing `flowspec.v1` YAML files. It is built with Next.js 15, React Flow 11, TypeScript, and Zustand for state management. The system operates entirely in the browser (local-first, no backend) using the Browser File System Access API to read and write `.flow.yaml` files directly from the user's filesystem.

The central thesis of the architecture is **portability**: the workflow core logic (`lib/workflow-core/`) is a framework-free TypeScript module designed to be eventually replaced by a Rust/WASM or Python implementation with an identical API surface. The Protobuf schema (`flowspec.v1.proto`) serves as the single source of truth for all data structures, and a strict API boundary separates the UI layer from data manipulation.

### Key Metrics

| Metric | Value |
|---|---|
| Schema messages | 15 (Protobuf) |
| Core API functions | 12 (public surface) |
| UI components | 15+ (React) |
| Zustand stores | 2 (workflow + filesystem) |
| Step templates | 4 |
| Validation rules | ~30 |
| History depth | 50 states (configurable) |
| File format | `.flow.yaml` (YAML serialization of FlowSpec) |

---

## 2. Purpose & Vision

### What Is a Workflow?

In this system, a **workflow** is a structured, directed graph of steps that models a process — typically a software development lifecycle, review process, or operational pipeline. Each step has:

- A **role** (who or what executes it: human, AI, automation, system)
- **Instructions** (what to do)
- **Acceptance criteria** (how to verify completion)
- **Transitions** (conditional next steps)
- Optional **security tokens** (capability scoping)

### Why This System Exists

The project exists to:

1. **Validate UX patterns** for visual workflow editing before committing to a production stack
2. **Establish clean API boundaries** that enable future rewrite of the core in Rust/Python
3. **Demonstrate structured AI-assisted development** (plan → implement → integrate methodology)
4. **Explore local-first developer tooling** that operates without server infrastructure

### What It Is NOT

- It is **not** a workflow execution engine (no runtime/runner)
- It is **not** a backend service (pure browser application)
- It is **not** production-ready (explicitly scoped as a POC)
- It does **not** include authentication, analytics, or logging

---

## 3. First Principles

The system is built on these foundational principles, each of which has deep implications for every design decision:

### 3.1 Schema-First Development

> "The Protobuf schema is the source of truth. Everything else derives from it."

- `flowspec.v1.proto` defines all message types
- TypeScript types are **generated** from the proto file, never hand-written
- Validation rules enforce proto-derived constraints at runtime
- The YAML file format is a direct serialization of proto messages

**Implication**: No data structure exists in the system that doesn't trace back to a proto message. This creates a formal, versioned contract that survives language migrations.

### 3.2 Strict API Boundary

> "UI components NEVER directly manipulate workflow data. All changes go through `lib/workflow-core/api.ts`."

- The `api.ts` module is the **only** entry point for workflow mutations
- Components call store actions, which delegate to API functions
- The core library has zero framework dependencies

**Implication**: The core can be extracted, tested in isolation, and replaced with a different implementation (Rust/WASM) without touching any UI code.

### 3.3 Immutable State Updates

> "Every edit creates a new Flow object. Never mutate."

- All API functions return new objects via `JSON.parse(JSON.stringify(...))`
- State changes are tracked through deep equality comparison
- Enables undo/redo by storing snapshots of entire workflow states

**Implication**: Predictable state transitions, time-travel debugging capability, and alignment with React's rendering model.

### 3.4 Validation at Every Boundary

> "Every data transformation must validate against the schema."

- **Parse-time**: YAML → JS object validation
- **Edit-time**: Re-validation after every mutation
- **Save-time**: Validation gate before serialization to disk

**Implication**: Invalid data cannot silently propagate through the system. Users get immediate feedback on every change.

### 3.5 Error Recovery Through Result Types

> "All functions return Result-like patterns or throw descriptive errors."

- The `Result<T, E>` discriminated union replaces try/catch at the API boundary
- Success and failure paths are exhaustively typed
- Helper functions (`Result.ok`, `Result.err`, `Result.map`, `Result.flatMap`, `Result.unwrap`, `Result.unwrapOr`) provide functional composition

**Implication**: Callers are forced to handle both success and error cases. No silent failures.

### 3.6 Local-First / No Backend

> "Direct filesystem access. No server required."

- Browser File System Access API for reading/writing `.flow.yaml` files
- User grants directory access via system file picker
- All data stays on the user's machine

**Implication**: Zero infrastructure overhead, instant feedback loops, offline-capable, maximum privacy.

### 3.7 Progressive Enhancement

> "Each phase delivers standalone value."

- Phase 0: Schema translation, type generation
- Phase 1: Read-only viewer (load, parse, visualize)
- Phase 2: Live editing (steps, edges, undo/redo, save)
- Phase 3: Analysis and migration readiness

**Implication**: The project ships usable artifacts at every stage, reducing risk.

---

## 4. The FlowSpec v1 Schema — Source of Truth

**File**: `workflow-builder/schemas/flowspec.v1.proto`

The schema is a Protocol Buffers v3 definition in the `flowspec.v1` package. It contains 15 message types organized in a hierarchical structure.

### Message Hierarchy

```
Flow (root)
├── schema: string                    # Must be "flowspec.v1"
├── id: string                        # Format: <domain>.<name>.v<major>
├── title: string                     # Human-readable name
├── owner: string                     # Owner email
├── labels: string[]                  # Tags
├── policy: Policy
│   ├── enforcement: string           # "none" | "advice" | "guard" | "hard"
│   ├── tokens_required: bool
│   └── events_required: bool
├── context: Context
│   ├── domain: string
│   ├── brief: string
│   └── links: string[]
├── parameters: map<string, Parameter>
│   ├── type: string                  # "string" | "number" | "boolean" | "enum"
│   ├── required: bool
│   ├── default_value: string
│   ├── enum_values: string[]
│   └── example: string
├── roles: Role[]
│   ├── id: string
│   ├── kind: string                  # "human" | "human_ai" | "ai" | "automation"
│   ├── uid: string
│   └── desc: string
├── artifacts: Artifacts
│   ├── inputs: string[]
│   ├── outputs: string[]
│   └── scratch: string[]
├── events: Events
│   ├── stream: string
│   └── types: string[]
└── steps: Step[]                     # THE CORE — ordered list of workflow steps
    ├── id: string                    # snake_case identifier
    ├── title: string
    ├── desc: string
    ├── role: string                  # References Role.kind
    ├── when: string                  # Activation condition
    ├── token: Token
    │   ├── advisory: bool
    │   ├── scope: TokenScope
    │   │   ├── fs_read: string[]
    │   │   ├── fs_write: string[]
    │   │   ├── net: string
    │   │   ├── exec: string[]
    │   │   ├── secrets: string[]
    │   │   └── lease_ms: int32
    │   └── claims: TokenClaims
    │       ├── aud: string
    │       ├── sub: string
    │       └── nonce: string
    ├── instructions: string[]        # REQUIRED — what to do
    ├── prompts: Prompts
    │   ├── system: string
    │   ├── user: string
    │   └── notes: string
    ├── acceptance: Acceptance         # REQUIRED — how to verify
    │   └── checks: Check[]
    │       ├── kind: string
    │       ├── path: string
    │       ├── file: string
    │       ├── keys: string[]
    │       ├── allowed: string[]
    │       ├── min: int32
    │       ├── expr: string
    │       ├── schema: string
    │       ├── on_fail: string
    │       └── severity: string
    ├── emit_events: string[]
    ├── metrics: map<string, string>
    ├── next: NextStep[]               # Conditional transitions
    │   ├── to: string                 # Target step ID
    │   └── when: string               # Condition label
    ├── timeout_ms: int32
    └── max_attempts: int32
```

### Schema Design Decisions

| Decision | Rationale |
|---|---|
| Protobuf over JSON Schema | Formal code generation, language-neutral, binary serialization potential |
| YAML as file format | Human-readable, developer-friendly, git-diffable |
| `enforcement` as string enum | Extensible without proto changes; validated at runtime |
| `steps` as ordered array | Preserves natural reading order; graph structure via `next` references |
| `next` conditions as string labels | Decoupled from evaluation logic; the builder doesn't execute |
| `Token` as capability scope | Principle of least privilege per step; controls AI agent permissions |
| Separate `instructions` and `prompts` | Instructions are universal; prompts are AI-specific augmentation |

---

## 5. Data Model Deep Dive

### 5.1 The Flow Object

A `Flow` is the root container for an entire workflow definition. It carries metadata (schema version, ID, title, owner), configuration (policy, parameters, roles), and the actual process definition (steps).

**Identity**: The `id` field follows a strict `<domain>.<name>.v<major>` convention (e.g., `software-development.workflow.v1`). This enables namespacing across organizations and versioning of workflow definitions.

**Ownership**: The `owner` field is validated as an email address, tying workflows to accountable individuals.

**Policy**: The `enforcement` field creates a graduated compliance spectrum:
- `none`: No constraints applied
- `advice`: Suggestions only, can be overridden
- `guard`: Enforced with override capability
- `hard`: Strictly enforced, no overrides

### 5.2 The Step Object

Steps are the atoms of a workflow. Each represents a discrete unit of work with clear inputs, outputs, and verification criteria.

**Required fields**: `id`, `role`, `instructions`, `acceptance` — ensuring every step is identifiable, assignable, actionable, and verifiable.

**Role taxonomy**:
- `human`: Manual human task
- `human_ai`: Human-AI collaborative task
- `ai`: Fully automated AI task
- `automation` / `system`: Machine-driven operational task

**Instructions vs. Prompts**: Instructions are role-agnostic directives (what to do). Prompts (`system`, `user`, `notes`) are AI-specific configuration for when the step is executed by an LLM.

### 5.3 The Token/Scope Model

Tokens implement **capability-based security** at the step level:

```
Token
├── advisory: bool              # If true, scope is suggestive not enforced
└── scope: TokenScope
    ├── fs_read: ["./input"]    # Readable paths
    ├── fs_write: ["./output"]  # Writable paths
    ├── net: "restricted"       # Network access level
    ├── exec: ["validate.sh"]   # Allowed executables
    ├── secrets: [...]          # Accessible secrets
    └── lease_ms: 30000         # Time-limited access
```

This is a **principle of least privilege** design. Each step declares exactly what resources it needs, enabling future runtime enforcement where AI agents or automation only receive the capabilities their step token grants.

### 5.4 The Acceptance Model

Every step requires acceptance criteria with at least one check. Checks are polymorphic validation units:

```
Check
├── kind          # Type of check (e.g., "file_exists", "schema_valid")
├── path          # Resource path to validate
├── file          # File to check
├── keys          # JSON/YAML keys to verify
├── allowed       # Whitelist of valid values
├── min           # Minimum threshold
├── expr          # Expression to evaluate
├── schema        # Schema reference to validate against
├── on_fail       # Action when check fails
└── severity      # "error" | "warning"
```

This flexible check model can represent everything from "does file X exist?" to "does output conform to schema Y?" to "is coverage above N%?".

### 5.5 The Graph Model (NextStep)

Workflows form a **directed graph** through `NextStep` references:

```yaml
next:
  - to: implementation
    when: design_approved
  - to: technical_design
    when: design_needs_revision
```

**Key characteristics**:
- **Conditional branching**: Each edge carries a `when` condition label
- **Implicit sequential flow**: Steps without `next` arrays implicitly connect to the next step in array order
- **Back-edges allowed**: Steps can reference earlier steps (loops/iterations)
- **Self-references allowed**: The cycle detection explicitly permits self-loops (`sourceId === targetId`)
- **Cycle detection**: Adding edges runs a DFS traversal to prevent infinite loops (except self-references)

---

## 6. System Architecture

### 6.1 Layer Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Environment                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   UI Layer (React/Next.js)               │    │
│  │                                                           │    │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐   │    │
│  │  │  React Flow  │  │   Inspector  │  │  File Panel   │   │    │
│  │  │   Canvas     │  │    Panel     │  │  + Toolbar    │   │    │
│  │  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘   │    │
│  └─────────┼────────────────┼──────────────────┼────────────┘    │
│            │                │                  │                   │
│  ┌─────────▼────────────────▼──────────────────▼────────────┐    │
│  │            State Layer (Zustand Stores)                    │    │
│  │                                                            │    │
│  │   WorkflowStore          FileSystemStore                   │    │
│  │   ├── currentWorkflow    ├── directoryHandle               │    │
│  │   ├── validationErrors   ├── workflowFiles                 │    │
│  │   ├── selectedStep       ├── selectedFile                  │    │
│  │   ├── editMode           └── fileContent                   │    │
│  │   ├── history                                              │    │
│  │   └── isDirty                                              │    │
│  └────────────────────────┬───────────────────────────────────┘    │
│                           │                                        │
│  ═══════════════════════ API BOUNDARY ══════════════════════════  │
│                           │                                        │
│  ┌────────────────────────▼───────────────────────────────────┐  │
│  │          Workflow Core (Framework-Free TypeScript)           │  │
│  │                                                              │  │
│  │  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐ │  │
│  │  │  api.ts   │  │parser.ts  │  │validator.ts│  │templates │ │  │
│  │  │          │  │           │  │           │  │  .ts      │ │  │
│  │  │ load     │  │ parseYAML │  │validateFlow│  │ 4 step   │ │  │
│  │  │ save     │  │ isValid   │  │validateStep│  │ templates│ │  │
│  │  │ addStep  │  │ FlowObj   │  │validatePol │  │ generate │ │  │
│  │  │ remove   │  └───────────┘  └───────────┘  │ StepId   │ │  │
│  │  │ update   │                                 └──────────┘ │  │
│  │  │ addEdge  │  ┌───────────┐  ┌───────────────────────┐   │  │
│  │  │ ...      │  │  types.ts │  │ generated/             │   │  │
│  │  └──────────┘  │ Result<T> │  │  flowspec.d.ts         │   │  │
│  │                │ Validation│  │  flowspec.js            │   │  │
│  │  ┌──────────┐  │ Error     │  │  index.ts (re-exports) │   │  │
│  │  │flow-to-  │  │ type gds  │  └───────────────────────┘   │  │
│  │  │nodes.ts  │  └───────────┘                               │  │
│  │  │ GraphNode│  ┌───────────┐                               │  │
│  │  │ GraphEdge│  │ history-  │                               │  │
│  │  └──────────┘  │ manager.ts│                               │  │
│  │                └───────────┘                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              File System Access Layer                        │  │
│  │   lib/fs/file-discovery.ts  — directory scanning             │  │
│  │   lib/fs/types.ts           — FS API type augmentations      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                   .flow.yaml Files                           │  │
│  │              (User's local filesystem)                        │  │
│  └────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

### 6.2 Module Dependency Graph

```
schemas/flowspec.v1.proto
        │
        ▼ (protoc + protobufjs)
lib/workflow-core/generated/
        │
        ├──────────────────────────────────────┐
        ▼                                      ▼
lib/workflow-core/types.ts           lib/workflow-core/parser.ts
        │                                      │
        ├──────────────┐                       │
        ▼              ▼                       ▼
lib/workflow-core/  lib/workflow-core/   lib/workflow-core/
  validator.ts        templates.ts         api.ts ◄──── ALL COMBINED
        │                                      │
        └──────────────────────────────────────┘
                       │
                       ▼
        lib/workflow-core/flow-to-nodes.ts
                       │
                       ▼
        lib/workflow-core/history-manager.ts
                       │
        ═══════════════╪════════════════════
        API BOUNDARY   │
        ═══════════════╪════════════════════
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
        lib/state/   lib/fs/   components/
        workflow     file-     workflow-graph/
        .store.ts    discovery flow-converter.ts
              │        │        │
              └────────┼────────┘
                       ▼
                  app/page.tsx
```

### 6.3 Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js | 15.0.3 | App Router, SSR shell |
| Language | TypeScript | 5.6.2 | Type safety |
| UI Library | React | 18.x | Component model |
| Graph Viz | React Flow | 11.11.4 | Workflow visualization |
| State Mgmt | Zustand | latest | Lightweight stores |
| Schema | Protocol Buffers | proto3 | Type generation |
| Serialization | js-yaml | latest | YAML read/write |
| Styling | CSS Modules | built-in | Scoped styles |
| Package Mgr | pnpm | latest | Fast, disk-efficient |
| Scripts | Python 3 | 3.x | Analysis/report generation |

---

## 7. State Management Architecture

The system uses two Zustand stores with distinct responsibilities:

### 7.1 WorkflowStore (`lib/state/workflow.store.ts`)

**Purpose**: Manages the active workflow document, editing state, selection, validation, and history.

```
WorkflowStore
├── Data
│   ├── currentWorkflow: Flow | null          # Active document
│   ├── originalWorkflow: Flow | null         # Last-saved snapshot (for dirty detection)
│   ├── validationErrors: ValidationError[]   # Current validation issues
│   ├── isValid: boolean                      # Convenience flag
│   ├── selectedStepId: string | null         # Currently focused step
│   └── selectedStep: Step | null             # Resolved step object
│
├── Flags
│   ├── editMode: boolean                     # View vs. Edit mode
│   ├── isDirty: boolean                      # Unsaved changes exist
│   ├── canUndo: boolean                      # History navigation flags
│   └── canRedo: boolean
│
├── Internal
│   └── history: WorkflowHistoryManager       # Undo/redo stack
│
├── Document Lifecycle
│   ├── setWorkflow(flow, errors?)            # Load new workflow (resets history)
│   ├── updateWorkflow(flow, errors?, desc?)  # Apply mutation + record history
│   ├── clearWorkflow()                       # Close document
│   └── markAsSaved()                         # Reset dirty flag
│
├── Step Operations (delegate to api.ts)
│   ├── addStep(step, position?)
│   ├── removeStep(stepId)
│   ├── duplicateStep(stepId)
│   ├── updateSelectedStep(updates)
│   └── selectStep(stepId)
│
├── Edge Operations (delegate to api.ts)
│   ├── addEdge(source, target, condition)
│   ├── updateEdge(source, index, condition, target?)
│   └── removeEdge(source, index)
│
└── History Operations
    ├── undo()
    ├── redo()
    └── getHistoryInfo()
```

**Critical pattern**: Every mutation method follows the same flow:
1. Call the pure API function from `workflow-core/api.ts`
2. If successful, validate the result with `validateWorkflow()`
3. Record in history with a descriptive action label
4. Update store state via `updateWorkflow()`
5. Refresh selected step reference if affected

### 7.2 FileSystemStore (`lib/state/filesystem.store.ts`)

**Purpose**: Manages browser file system state — directory handles, discovered files, and selected file content.

```
FileSystemStore
├── directoryHandle: FileSystemDirectoryHandle | null
├── directoryName: string | null
├── workflowFiles: WorkflowFile[]
├── selectedFile: WorkflowFile | null
├── selectedFileHandle: FileSystemFileHandle | null
├── fileContent: string | null
│
├── setDirectoryHandle(handle)    # After user selects directory
├── clearDirectory()              # Reset everything
├── setWorkflowFiles(files)       # After directory scan
├── selectFile(file, content, handle?)
└── clearSelection()
```

### 7.3 Store Interaction Pattern

```
User selects directory
  → FileSystemStore.setDirectoryHandle()
  → discoverWorkflowFiles() scans for .flow.yaml
  → FileSystemStore.setWorkflowFiles()

User clicks file
  → readFileContent() loads YAML string
  → FileSystemStore.selectFile(file, content, handle)
  → WorkflowLoader parses content via loadWorkflow()
  → WorkflowStore.setWorkflow(flow, errors)

User edits step
  → Component calls WorkflowStore.updateSelectedStep(updates)
  → Store calls updateStepAPI() from workflow-core
  → Store calls validateWorkflow() on result
  → Store calls updateWorkflow() with history description
  → isDirty flips to true

User saves
  → SaveButton calls saveWorkflow() from workflow-core
  → Writes YAML to FileSystemFileHandle
  → WorkflowStore.markAsSaved()
  → isDirty flips to false
```

---

## 8. Data Flow & Lifecycle

### 8.1 Complete Data Pipeline

```
        ┌──────────────────────────────────────────────────────────┐
        │                                                            │
        ▼                                                            │
  .flow.yaml file                                                    │
        │                                                            │
        ▼                                                            │
  readFileContent()          ← File System Access API                │
        │                                                            │
        ▼                                                            │
  YAML string                                                        │
        │                                                            │
        ▼                                                            │
  parseYAML()                ← js-yaml.load()                        │
        │                                                            │
        ▼                                                            │
  JavaScript object                                                  │
        │                                                            │
        ▼                                                            │
  isValidFlowObject()       ← Structure check (schema, id, steps)   │
        │                                                            │
        ▼                                                            │
  validateFlow()            ← Full schema validation                 │
        │                                                            │
        ▼                                                            │
  Flow object (typed)       ← Cast to generated type                 │
        │                                                            │
        ├─────────────────┐                                          │
        ▼                 ▼                                          │
  WorkflowStore       flowToGraphData()                              │
  (state)              (visualization)                               │
        │                 │                                          │
        ▼                 ▼                                          │
  Inspector           React Flow                                     │
  Panel               Canvas                                         │
        │                 │                                          │
        ▼                 ▼                                          │
  User edits...       User clicks node...                            │
        │                 │                                          │
        ▼                 ▼                                          │
  API functions       selectStep()                                   │
  (immutable ops)                                                    │
        │                                                            │
        ▼                                                            │
  New Flow object                                                    │
        │                                                            │
        ▼                                                            │
  validateWorkflow()        ← Re-validate after mutation             │
        │                                                            │
        ▼                                                            │
  updateWorkflow()          ← Push to history, update store          │
        │                                                            │
        ▼                                                            │
  saveWorkflow()            ← Serialize Flow → YAML string           │
        │                                                            │
        ▼                                                            │
  Write to file             ← File System Access API                 │
        │                                                            │
        └────────────────────────────────────────────────────────────┘
```

### 8.2 Transformation Chain Summary

| Stage | Input | Output | Module |
|---|---|---|---|
| Read | File handle | YAML string | `lib/fs/file-discovery.ts` |
| Parse | YAML string | JS object | `parser.ts` → `js-yaml` |
| Validate | JS object | ValidationError[] | `validator.ts` |
| Type | JS object | Flow (typed) | Cast to generated type |
| Layout | Flow | GraphNode[] + GraphEdge[] | `flow-to-nodes.ts` |
| Render | GraphNode[] | React Flow nodes | `flow-converter.ts` |
| Edit | Flow + mutation | new Flow | `api.ts` functions |
| Serialize | Flow | YAML string | `api.ts` → `js-yaml.dump` |
| Write | YAML string | File | File System Access API |

---

## 9. API Boundary — The Key Module

**File**: `workflow-builder/lib/workflow-core/api.ts`

This module is the architectural linchpin. All workflow mutations must pass through it.

### 9.1 Public API Surface

| Function | Signature | Purpose |
|---|---|---|
| `loadWorkflow` | `(yaml, opts?) → Promise<Result<Flow>>` | Parse + validate YAML into Flow |
| `saveWorkflow` | `(flow) → Promise<Result<string>>` | Validate + serialize Flow to YAML |
| `validateWorkflow` | `(flow, opts?) → Promise<ValidationError[]>` | Full schema validation |
| `updateStep` | `(flow, stepId, updates) → Result<Flow>` | Immutable step mutation |
| `addStep` | `(flow, step, pos?) → Result<Flow>` | Insert step with validation |
| `removeStep` | `(flow, stepId) → Result<Flow>` | Remove step + clean up refs |
| `duplicateStep` | `(flow, stepId, newId) → Result<Flow>` | Deep clone step |
| `addEdge` | `(flow, src, tgt, cond) → Result<Flow>` | Add transition with cycle check |
| `updateEdge` | `(flow, src, idx, cond, tgt?) → Result<Flow>` | Modify transition |
| `removeEdge` | `(flow, src, idx) → Result<Flow>` | Remove transition |
| `createWorkflow` | `(id, title, owner, policy?) → Result<Flow>` | Create empty workflow |
| `createWorkflowFromTemplate` | `(id, title, owner) → Result<Flow>` | Create minimal workflow |

### 9.2 API Contract Guarantees

1. **Immutability**: Every function returns a **new** Flow object; the input is never modified
2. **Validation on mutation**: `addStep` validates ID format, uniqueness, and required fields
3. **Referential integrity**: `removeStep` cleans up `next` references pointing to the removed step
4. **Cycle prevention**: `addEdge` and `updateEdge` run DFS cycle detection before committing
5. **Result wrapping**: All functions return `Result<Flow>` with typed error information
6. **Save guard**: `saveWorkflow` refuses to serialize a Flow with validation errors

### 9.3 Internal Helper: Cycle Detection

```typescript
function wouldCreateCycle(workflow, sourceId, targetId): boolean
```

Uses depth-first search starting from `targetId`, walking forward through `next` references. If it can reach `sourceId`, the proposed edge would create a cycle. Self-loops (`sourceId === targetId`) are explicitly permitted.

---

## 10. Graph Model & Visualization

### 10.1 Two-Layer Graph Abstraction

The system maintains a clean separation between the **domain graph** (Step + NextStep) and the **visual graph** (GraphNode + GraphEdge):

**Domain Layer** (proto-derived):
```
Step.next: NextStep[]      # Directed edges with conditions
  → { to: "step_id", when: "condition" }
```

**Visual Layer** (framework-agnostic):
```
GraphNode { id, type, position: {x,y}, data: GraphNodeData }
GraphEdge { id, source, target, label, type, animated }
```

**React Flow Layer** (framework-specific):
```
Converted from GraphNode/GraphEdge to React Flow's Node<>/Edge<>
via components/workflow-graph/flow-converter.ts
```

### 10.2 Layout Algorithm

The current layout uses a simple grid algorithm:

```
Column = index % 3
Row    = floor(index / 3)
X      = column * (250 + 100)   # nodeWidth + horizontalSpacing
Y      = row * (120 + 150)      # nodeHeight + verticalSpacing
```

This produces a 3-column grid with automatic wrapping. Steps are positioned in their array order, which creates a natural left-to-right, top-to-bottom reading flow.

### 10.3 Edge Semantics

```
Explicit edges:  step.next[] exists         → one edge per NextStep
Implicit edges:  step.next[] absent/empty   → sequential edge to array[index + 1]
Last step:       no next, no successor      → terminal node (no outgoing edges)
```

Edge labels display the `when` condition. Edge type is `smoothstep` (curved connectors). Self-referencing edges are permitted.

### 10.4 Node Rendering

Each step node displays:
- Step ID (monospace, small)
- Token indicator (lock icon when `step.token` exists)
- Title (prominent)
- Role (labeled)
- Instruction count and check count (compact metrics)
- Connection handles (top = target, bottom = source)

---

## 11. Validation System

**File**: `workflow-builder/lib/workflow-core/validator.ts`

### 11.1 Validation Hierarchy

```
validateFlow(data)
├── Type check: is object?
├── Root fields:
│   ├── schema  → required, must be "flowspec.v1"
│   ├── id      → required, must match <domain>.<name>.v<major>
│   ├── title   → required
│   ├── owner   → required, must be valid email
│   └── steps   → required, must be non-empty array
├── validatePolicy(policy)
│   └── enforcement → must be one of: none, advice, guard, hard
└── validateSteps(steps)
    └── For each step:
        ├── id           → required, string, snake_case, unique
        ├── role         → required
        ├── instructions → required, array, non-empty
        └── validateAcceptance(acceptance)
            └── checks → required, array, non-empty
```

### 11.2 Error Severity Model

| Severity | Meaning | Effect |
|---|---|---|
| `error` | Invalid data; blocks saving | Shown in red, prevents serialization |
| `warning` | Suboptimal but valid; allows saving | Shown in yellow, informational |

In **strict mode** (`WorkflowOptions.strict === true`), warnings are promoted to errors, blocking all imperfect workflows.

### 11.3 Validation Error Format

```typescript
{
  path: "steps[2].acceptance.checks",   // JSONPath-like location
  message: "At least one check is required",
  severity: "warning"
}
```

Paths use bracket notation for arrays and dot notation for objects, enabling precise error targeting in the UI.

---

## 12. Template System

**File**: `workflow-builder/lib/workflow-core/templates.ts`

### 12.1 Available Templates

| Template Key | Role | Purpose | Instructions | Checks | Has Token? | Has Next? |
|---|---|---|---|---|---|---|
| `blank` | human | Minimal starting point | 1 | 1 | No | No |
| `human_review` | human | Review & decision | 3 | 3 | No | Yes (approved/rejected) |
| `ai_analysis` | ai | Automated analysis | 3 | 3 | Yes (fs_read, fs_write, net) | Yes (analysis_complete) |
| `system_check` | system | Automated validation | 3 | 3 | Yes (exec, fs_read, net) | Yes (passed/failed) |

### 12.2 Template Mechanics

1. `getTemplateOptions()` returns UI-friendly list for dropdown display
2. `createStepFromTemplate(templateKey, stepId)` instantiates a complete `Step` from template
3. `generateStepId(prefix, existingIds)` creates unique IDs by appending incrementing suffixes

Templates provide **next** references with placeholder target step IDs (`next_step`, `revision_step`, `error_handler`) that should be updated after insertion.

---

## 13. History & Undo/Redo System

**File**: `workflow-builder/lib/workflow-core/history-manager.ts`

### 13.1 Architecture

The `WorkflowHistoryManager` implements a **linear undo/redo stack** with branching semantics:

```
History Stack:
[0] Load workflow          ← initial state
[1] Add step "review_1"
[2] Update step "review_1" ← current position
[3] Remove edge            ← would be discarded if new edit happens here
```

**Branching behavior**: If the user undoes to position [1] and makes a new edit, states [2] and [3] are discarded. The new edit becomes [2]. This matches the behavior of text editor undo.

### 13.2 Configuration

| Setting | Value | Purpose |
|---|---|---|
| `maxHistorySize` | 50 | Prevents unbounded memory growth |
| Deep clone | `JSON.parse(JSON.stringify())` | Full state isolation between snapshots |
| Action descriptions | Human-readable strings | Displayed in history panel UI |

### 13.3 Supported Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Shift + Z | Redo |
| Ctrl/Cmd + Y | Redo (alternative) |
| Ctrl/Cmd + H | Toggle history panel |

### 13.4 History State Shape

```typescript
{
  workflow: Flow,       // Complete deep clone of workflow at this point
  timestamp: number,    // When the action occurred
  description: string   // e.g., "Add step review_1", "Update edge approved"
}
```

---

## 14. File System Layer

### 14.1 Architecture

```
Browser File System Access API
├── window.showDirectoryPicker()    → User selects workflow directory
├── directoryHandle.values()        → Iterate directory entries
├── fileHandle.getFile()            → Read file content
└── fileHandle.createWritable()     → Write file content
```

### 14.2 File Discovery (`lib/fs/file-discovery.ts`)

```typescript
discoverWorkflowFiles(directoryHandle)
  → Scans directory for files matching *.flow.yaml
  → Returns WorkflowFile[] = { name, handle, lastModified }

readFileContent(fileHandle)
  → fileHandle.getFile() → file.text()
  → Returns string (raw YAML content)
```

### 14.3 Permissions Model

The File System Access API requires explicit user consent:
1. `showDirectoryPicker()` prompts the user to select a directory
2. Read access is granted implicitly after selection
3. Write access may require an additional permission prompt
4. Permissions are per-session (lost on page reload unless `queryPermission`/`requestPermission` are used)

### 14.4 Save Flow

Saving follows this sequence:
1. `saveWorkflow(flow)` validates and serializes to YAML
2. `FileSystemFileHandle.createWritable()` opens a writable stream
3. YAML content is written to the stream
4. Stream is closed (atomic write)
5. `WorkflowStore.markAsSaved()` resets dirty flag

---

## 15. UI Component Architecture

### 15.1 Page Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [Directory: ~/workflows]    [View/Edit Toggle] [Undo][Redo][Save] │
├──────────────┬────────────────────────┬──────────────────────┤
│              │                        │                      │
│  File List   │    React Flow Canvas   │   Step Inspector     │
│              │                        │                      │
│  ├ flow1.yaml│   ┌──────┐  ┌──────┐  │   Title: [........]  │
│  ├ flow2.yaml│   │Step 1├──│Step 2│  │   Role:  [human  v]  │
│  └ flow3.yaml│   └──┬───┘  └──────┘  │   Instructions:      │
│              │      │                 │   1. [............]   │
│  Workflow    │   ┌──▼───┐             │   2. [............]   │
│  Loader      │   │Step 3│             │                      │
│  Info        │   └──────┘             │   Acceptance:         │
│              │                        │   ✓ Check 1           │
│              │                        │   ✓ Check 2           │
│              │                        │                      │
│              │                        │   [+ Add Step]        │
│              │                        │   [Duplicate]         │
│              │                        │   [Delete]            │
│              │                        │                      │
│              │                        │   Edges:              │
│              │                        │   approved → step_2   │
│              │                        │   [+ Add Edge]        │
├──────────────┴────────────────────────┴──────────────────────┤
│  Responsive: 400px | 1fr | 400px  (collapses at breakpoints) │
└──────────────────────────────────────────────────────────────┘
```

### 15.2 Component Inventory

| Component | File | Responsibility |
|---|---|---|
| **Home (Page)** | `app/page.tsx` | 3-column layout orchestrator |
| **DirectorySelector** | `components/directory-selector.tsx` | FS directory picker UI |
| **FileList** | `components/file-list.tsx` | `.flow.yaml` file browser |
| **WorkflowLoader** | `components/workflow-loader.tsx` | Parse/validate/display status |
| **WorkflowViewer** | `components/workflow-viewer.tsx` | Graph or empty state |
| **WorkflowGraph** | `components/workflow-graph/index.tsx` | React Flow integration |
| **StepNode** | `components/workflow-graph/step-node.tsx` | Custom node renderer |
| **FlowConverter** | `components/workflow-graph/flow-converter.ts` | GraphNode → ReactFlow Node |
| **StepInspector** | `components/step-inspector/index.tsx` | Read-only step details |
| **EditableInspector** | `components/step-inspector/editable-inspector.tsx` | Inline step editing |
| **EdgeEditor** | `components/edge-editor/index.tsx` | Transition management |
| **StepActions** | `components/step-actions/index.tsx` | Add/duplicate/delete toolbar |
| **AddStepModal** | `components/add-step-modal/index.tsx` | Template-based step creation |
| **EditModeToggle** | `components/edit-mode-toggle/index.tsx` | View/Edit mode switch |
| **SaveButton** | `components/save-button/index.tsx` | Save with Ctrl+S |
| **UndoRedoControls** | `components/undo-redo/index.tsx` | History navigation + panel |

### 15.3 Modal & Interaction Patterns

- **Two-click delete**: Delete button requires confirmation within 3 seconds
- **Inline editing**: Click field to enter edit mode, Save/Cancel to commit
- **Suggested conditions**: Edge editor offers common conditions (success, failure, approved, rejected, etc.)
- **Template selection**: Dropdown with descriptions in add-step modal
- **Auto-generated IDs**: Suggest button creates unique snake_case IDs from template prefix

---

## 16. Type System & Safety Patterns

### 16.1 Type Generation Pipeline

```
flowspec.v1.proto
       │
       ▼ (protoc + protobufjs-cli)
generated/flowspec.js       ← Runtime protobuf encode/decode
generated/flowspec.d.ts     ← TypeScript interface definitions
generated/index.ts          ← Clean re-exports as type aliases
       │
       ▼
Flow, Step, Policy, Context, Parameter, Role,
Artifacts, Events, Token, TokenScope, TokenClaims,
Prompts, Acceptance, Check, NextStep
```

### 16.2 The Result<T> Pattern

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }
```

This is a **discriminated union** — TypeScript narrows the type based on the `success` field:

```typescript
const result = addStep(workflow, step);
if (result.success) {
  // TypeScript knows: result.data is Flow
  doSomething(result.data);
} else {
  // TypeScript knows: result.error is Error
  console.error(result.error.message);
}
```

### 16.3 Helper Functions (Functional Composition)

| Helper | Signature | Purpose |
|---|---|---|
| `Result.ok(data)` | `T → Result<T>` | Wrap success |
| `Result.err(error)` | `string\|Error → Result<T>` | Wrap failure |
| `Result.isOk(r)` | `Result<T> → boolean` | Type guard |
| `Result.isErr(r)` | `Result<T> → boolean` | Type guard |
| `Result.map(r, fn)` | `Result<T>, (T→U) → Result<U>` | Transform success |
| `Result.flatMap(r, fn)` | `Result<T>, (T→Result<U>) → Result<U>` | Chain operations |
| `Result.unwrap(r)` | `Result<T> → T \| throw` | Extract or throw |
| `Result.unwrapOr(r, def)` | `Result<T>, T → T` | Extract or default |

### 16.4 Runtime Type Guards

```typescript
isFlow(obj)             → checks schema, id, title, owner
isStep(obj)             → checks id, role, instructions, acceptance
isCheck(obj)            → checks description or kind or path
isValidationError(obj)  → checks path, message, severity
```

---

## 17. Design Patterns Catalog

### 17.1 Patterns Used

| Pattern | Where | Purpose |
|---|---|---|
| **Schema-First** | Proto → Generated Types | Single source of truth for all data structures |
| **API Boundary** | `api.ts` as sole entry point | Decoupling core logic from UI framework |
| **Result Monad** | `Result<T, E>` everywhere | Explicit error handling without exceptions |
| **Immutable Updates** | `JSON.parse(JSON.stringify())` | Predictable state, enables undo/redo |
| **Store Pattern** | Zustand stores | Centralized, reactive state management |
| **Command Pattern** | History actions with descriptions | Named, undoable operations |
| **Snapshot Pattern** | WorkflowHistoryManager | Full-state snapshots for time travel |
| **Template Method** | Step templates | Pre-built step configurations |
| **Factory** | `createWorkflow`, `createStepFromTemplate` | Encapsulated object creation |
| **Adapter** | `flow-converter.ts` | Framework-agnostic → React Flow conversion |
| **Observer** | Zustand subscriptions | Components react to state changes |
| **Guard Clause** | API function validation | Early return on invalid input |
| **Discriminated Union** | Result type, severity enum | Exhaustive type narrowing |
| **Progressive Disclosure** | View/Edit mode toggle | Complexity hidden until needed |

### 17.2 Patterns Explicitly Avoided

| Anti-Pattern | Why Avoided |
|---|---|
| Mutable state | Breaks undo/redo, unpredictable React rendering |
| Direct data manipulation in components | Violates API boundary principle |
| Global try/catch | Result type makes errors explicit |
| Premature abstraction | POC scope; build concrete first |
| Feature flags | Just change the code directly |
| Over-engineering | Minimum complexity for current requirements |

---

## 18. Migration & Portability Strategy

### 18.1 The Rust-Ready Design

The entire `lib/workflow-core/` module is designed for replacement:

```
Current:  TypeScript core → JS bundle → Browser
Future:   Rust core → WASM → Browser (same API surface)
```

**What makes this portable**:
1. **Zero framework dependencies** in workflow-core
2. **Proto-generated types** can be generated in any language
3. **Pure functions** — input → output, no side effects
4. **Result pattern** maps directly to Rust's `Result<T, E>`
5. **Immutable updates** align with Rust's ownership model
6. **Clear API surface** — 12 functions to reimplement

### 18.2 Migration Readiness Score: 80%

From the Phase 3 analysis:
- Architecture compliance: 100%
- API boundary: 90% (minor violation in workflow-loader)
- Rust readiness: 80% (some functions need Result<T> conversion)
- Test coverage: 100%

### 18.3 What a Rust Migration Looks Like

```
1. Implement flowspec.v1 as Rust structs (from .proto)
2. Implement 12 API functions with identical signatures
3. Compile to WASM with wasm-bindgen
4. Import WASM module in Next.js
5. Replace TypeScript api.ts imports with WASM imports
6. UI code: zero changes needed
```

---

## 19. Strengths, Weaknesses, and Opportunities

### 19.1 Strengths

| Strength | Evidence |
|---|---|
| **Clean API boundary** | All mutations flow through 12 well-defined functions |
| **Type safety end-to-end** | Proto → generated types → runtime validation |
| **Immutability discipline** | Every edit creates a new Flow object |
| **Full undo/redo** | 50-state history with branching semantics |
| **Local-first** | No server, no latency, full privacy |
| **Progressive delivery** | Each phase ships usable features |
| **Migration-ready** | Framework-free core with clear replacement path |
| **Validation at all boundaries** | Parse-time, edit-time, save-time |
| **Explicit error handling** | Result<T> pattern throughout |

### 19.2 Weaknesses

| Weakness | Impact | Mitigation |
|---|---|---|
| Deep clone via JSON.stringify | Performance degrades with large workflows | Acceptable for POC; structural sharing in production |
| Grid layout algorithm | Not optimal for complex graph topologies | Adequate for validation; Dagre/ELK in production |
| Browser File System API | Chromium-only; no Firefox/Safari support | Feature detection possible; file upload fallback |
| No execution engine | Can define workflows but not run them | Out of scope; this is a builder, not a runner |
| No collaborative editing | Single-user, single-session | Local-first design choice |
| Validation regex patterns | Limited expressiveness | Sufficient for POC-level constraints |

### 19.3 Opportunities

| Opportunity | Description |
|---|---|
| **Workflow execution** | Add a step runner that consumes the FlowSpec format |
| **AI-assisted authoring** | Use LLMs to suggest steps, instructions, checks |
| **Multi-file workflows** | Support includes/references across `.flow.yaml` files |
| **Version diffing** | Compare workflow versions using structural diff |
| **Export formats** | Generate BPMN, Mermaid, DOT graphs from Flow objects |
| **Electron/Tauri wrapper** | Native desktop app with persistent FS access |
| **Schema evolution** | FlowSpec v2 with richer check types, sub-workflows |
| **Real-time collaboration** | CRDT-based concurrent editing |

---

## 20. Appendix: Complete Type Reference

### 20.1 Proto Messages (15 total)

| # | Message | Fields | Purpose |
|---|---|---|---|
| 1 | `Flow` | 12 fields | Root workflow container |
| 2 | `Policy` | 3 fields | Enforcement configuration |
| 3 | `Context` | 3 fields | Domain context and links |
| 4 | `Parameter` | 5 fields | Workflow parameters |
| 5 | `Role` | 4 fields | Role definition |
| 6 | `Artifacts` | 3 fields | Input/output/scratch artifacts |
| 7 | `Events` | 2 fields | Event stream configuration |
| 8 | `Step` | 14 fields | Workflow step definition |
| 9 | `Token` | 3 fields | Security token configuration |
| 10 | `TokenScope` | 6 fields | Capability scope |
| 11 | `TokenClaims` | 3 fields | JWT-like claims |
| 12 | `Prompts` | 3 fields | AI prompt configuration |
| 13 | `Acceptance` | 1 field | Acceptance criteria container |
| 14 | `Check` | 10 fields | Individual validation check |
| 15 | `NextStep` | 2 fields | Conditional transition |

### 20.2 Custom TypeScript Types

| Type | Module | Purpose |
|---|---|---|
| `Result<T, E>` | `types.ts` | Discriminated union for operations |
| `ValidationError` | `types.ts` | Error with path, message, severity |
| `WorkflowOptions` | `types.ts` | Options for strict mode |
| `GraphNode` | `flow-to-nodes.ts` | Visual graph node |
| `GraphEdge` | `flow-to-nodes.ts` | Visual graph edge |
| `GraphNodeData` | `flow-to-nodes.ts` | Step metadata for rendering |
| `HistoryState` | `history-manager.ts` | Workflow snapshot with description |
| `WorkflowFile` | `file-discovery.ts` | File handle with metadata |
| `FileInfo` | `filesystem.store.ts` | Extended file information |
| `WorkflowState` | `workflow.store.ts` | Full Zustand store shape |
| `FileSystemState` | `filesystem.store.ts` | File system store shape |

### 20.3 Key File Index

| File | Lines | Role |
|---|---|---|
| `schemas/flowspec.v1.proto` | 123 | Schema source of truth |
| `lib/workflow-core/generated/flowspec.d.ts` | ~1039 | Generated TypeScript types |
| `lib/workflow-core/generated/index.ts` | ~30 | Type re-exports |
| `lib/workflow-core/api.ts` | 727 | Public API (12 functions) |
| `lib/workflow-core/validator.ts` | 247 | Validation engine |
| `lib/workflow-core/types.ts` | 154 | Result type + type guards |
| `lib/workflow-core/parser.ts` | ~30 | YAML parsing |
| `lib/workflow-core/templates.ts` | 164 | Step templates |
| `lib/workflow-core/flow-to-nodes.ts` | 113 | Graph conversion |
| `lib/workflow-core/history-manager.ts` | 159 | Undo/redo stack |
| `lib/state/workflow.store.ts` | 348 | Workflow state management |
| `lib/state/filesystem.store.ts` | ~50 | File system state |
| `app/page.tsx` | ~100 | Main layout |

---

*End of analysis report.*
