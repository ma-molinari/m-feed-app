# Design

**Goal**: Define HOW to build it. Architecture, components, what to reuse.

**Skip this phase when:** The change is straightforward — no architectural decisions, no new patterns, no component interactions to plan. For simple features, design happens inline during Execute.

---

## Process

### 1. Load Context (MANDATORY)

Before designing, load context in this order:

1. **`.specs/features/[feature]/spec.md`** — the requirements you're designing for
2. **`.specs/features/[feature]/context.md`** (if exists) — user decisions for gray areas. Decisions here are **locked** — do not override them. Items marked "Agent's Discretion" are yours to decide.
3. **`CLAUDE.md`** (or equivalent) — project architecture rules, layer constraints, conventions
4. **Project docs (`docs/`)** — architecture patterns, code patterns, database schemas, domain details
5. **`.specs/CONCERNS.md`** (if exists) — check if the feature touches any flagged area (fragile code, tech debt, performance bottlenecks). If it does, document how the design mitigates those concerns.
6. **Existing implementations** — read similar features already in the codebase to identify reusable patterns

**Why this matters:** Designing without project context leads to proposals that violate existing architecture, miss reuse opportunities, or conflict with established conventions. The project's `docs/` directory is your primary source of truth for HOW things are built.

### 2. Research (When Needed)

If the feature involves unfamiliar technology, patterns, or integrations, research before designing. This prevents incorrect assumptions from propagating into tasks.

Follow the **Knowledge Verification Chain** (see SKILL.md) in strict order:

```
Codebase → Project docs → Context7 MCP → Web search → Flag as uncertain
```

#### Context7 MCP Usage

When the feature uses third-party libraries or frameworks you're not fully confident about:

1. **Check availability** — Verify Context7 MCP is accessible in the current environment
2. **Resolve library** — Get the library ID for the dependency in question
3. **Query API** — Look up current API signatures, patterns, and best practices
4. **Document findings** — Include relevant API details in the design doc

**Good triggers for Context7:** New library versions, unfamiliar APIs, framework-specific patterns, ORM query builders, validation library schemas.

**CRITICAL: NEVER assume or fabricate information.** If you cannot find an answer through the chain, explicitly say "I don't know" or "I couldn't find documentation for this". Wrong assumptions propagate through design → tasks → implementation and cause cascading failures.

### 3. Define Architecture

Overview of how components interact. Use diagrams when helpful to show data flow, component relationships, or sequence of operations.

Key questions to answer:
- What are the main components and how do they communicate?
- What is the data flow from input to output?
- Where does this feature sit in the existing architecture?

### 4. Identify Code Reuse

**CRITICAL**: What existing code can we leverage? This is the highest-value activity in design.

Look for:
- Existing components that do similar things (extend or adapt)
- Established patterns in the codebase (follow, don't reinvent)
- Utilities, helpers, or base classes that apply
- Similar features already implemented (use as reference)

### 5. Define Components and Interfaces

For each new component: Purpose, Location, Interfaces, Dependencies, What it reuses.

Define contracts (interfaces/types) before implementation details. This makes tasks clearer and enables parallel work.

### 6. Define Data Models (If Applicable)

If the feature involves new data structures, define them before implementation:
- Entity/model shapes with types
- Relationships to existing models
- Required migrations or schema changes

---

## Template: `.specs/features/[feature]/design.md`

````markdown
# [Feature] Design

**Spec**: `.specs/features/[feature]/spec.md`
**Status**: Draft | Approved

---

## Architecture Overview

[Brief description of the architecture approach — how does this feature fit into the existing system?]

```
[Diagram: data flow, component interaction, or sequence — text-based or mermaid]
```

---

## Code Reuse Analysis

### Existing Components to Leverage

| Component            | Location           | How to Use                |
| -------------------- | ------------------ | ------------------------- |
| [Existing Component] | `src/path/to/file` | [Extend/Import/Reference] |
| [Existing Pattern]   | `src/path/to/file` | [Apply same pattern]      |

### Integration Points

| System         | Integration Method                      |
| -------------- | --------------------------------------- |
| [Existing API] | [How new feature connects]              |
| [Database]     | [How data connects to existing schemas] |

---

## Components

### [Component Name]

- **Purpose**: [What this component does — one sentence]
- **Location**: `src/path/to/component`
- **Interfaces**:
  - `methodName(param: Type): ReturnType` — [description]
- **Dependencies**: [What it needs]
- **Reuses**: [Existing code this builds upon]

### [Component Name]

- **Purpose**: [What this component does]
- **Location**: `src/path/to/component`
- **Interfaces**:
  - `methodName(param: Type): ReturnType`
- **Dependencies**: [Dependencies]
- **Reuses**: [Existing code]

---

## Data Models (if applicable)

### [Model Name]

```typescript
interface ModelName {
  id: string
  field1: string
  field2: number
  createdAt: Date
}
```

**Relationships**: [How this relates to other models]

---

## Error Handling Strategy

| Error Scenario | Handling      | User Impact      |
| -------------- | ------------- | ---------------- |
| [Scenario 1]   | [How handled] | [What user sees] |
| [Scenario 2]   | [How handled] | [What user sees] |

---

## Technical Decisions (only non-obvious ones)

| Decision          | Choice          | Rationale     |
| ----------------- | --------------- | ------------- |
| [What we decided] | [What we chose] | [Why — brief] |

---

## Research Notes (if Context7 or web search was used)

| Topic            | Source   | Finding                    |
| ---------------- | -------- | -------------------------- |
| [Library/Pattern] | [Source] | [Key finding or API detail] |
````

---

## Tips

- **Load context first** — Understand existing architecture before proposing new one
- **Research when uncertain** — 5 minutes of research prevents hours of rework
- **Reuse is king** — Every component should reference existing patterns
- **Interfaces first** — Define contracts before implementation details
- **Keep it visual** — Diagrams save 1000 words
- **Small components** — If a component does 3+ things, split it
- **Confirm before Tasks** — User approves design before breaking into tasks
- **Context7 for libraries** — When using third-party code, verify API details before designing around them
