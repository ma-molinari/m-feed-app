---
name: create-spec-driven
description: Adaptive feature workflow with 4 phases - Specify, Design, Tasks, Execute. Auto-sizes depth by complexity. Atomic tasks with verification criteria, dependency mapping, parallel execution plan, requirement traceability, and atomic commits (Conventional Commits). Stack-agnostic. Includes gray area discussion, persistent state management, codebase concerns tracking, and context window monitoring. Use when planning features (requirements, design, task breakdown), implementing with verification and atomic commits, validating completed work, or tracking decisions and concerns. Triggers on "specify feature", "discuss feature", "design feature", "create tasks", "break into tasks", "implement", "execute", "validate", "verify work", "record decision", "document concerns", "find tech debt". Do NOT use for project initialization, roadmap planning, or codebase mapping.
---

# Feature Workflow

Plan and implement features with precision. Granular tasks. Clear dependencies. Parallel execution. Zero ceremony.

```
┌──────────┐   ┌──────────┐   ┌─────────┐   ┌─────────┐
│ SPECIFY  │ → │  DESIGN  │ → │  TASKS  │ → │ EXECUTE │
└──────────┘   └──────────┘   └─────────┘   └─────────┘
   always       if needed      if needed      always
```

---

## Auto-Sizing: The Core Principle

**Complexity determines depth, not a fixed pipeline.** Before starting any feature, assess scope and apply only what's needed:

| Scope      | What                       | Specify         | Design                    | Tasks                    | Execute                     |
| ---------- | -------------------------- | --------------- | ------------------------- | ------------------------ | --------------------------- |
| **Small**  | ≤3 files, one sentence     | Brief           | Inline in Execute         | Inline in Execute        | Implement + verify          |
| **Medium** | Clear feature, <10 tasks   | Full spec + IDs | Brief or inline           | Full breakdown           | Implement + verify per task |
| **Large**  | Multi-component, >10 tasks | Full spec + IDs | Architecture + components | Breakdown + parallel map | Implement + verify per task |

**Rules:**

- **Specify and Execute are always required** — you always need to know WHAT and DO it
- **Design is skipped** when the change is straightforward (no architectural decisions, no new patterns)
- **Tasks is skipped** when there are ≤3 obvious steps (they become inline in Execute)
- **Safety valve:** Even when Tasks is skipped, Execute ALWAYS starts by listing atomic steps inline. If that listing reveals >5 steps or complex dependencies, STOP and create a formal `tasks.md` — the Tasks phase was wrongly skipped.

---

## File Structure

```
.specs/
├── STATE.md                    # Persistent memory: decisions, blockers, lessons, deferred ideas
├── CONCERNS.md                 # Codebase risks, tech debt, fragile areas (when needed)
└── features/[feature-name]/
    ├── spec.md                 # Requirements with traceable IDs
    ├── context.md              # User decisions for gray areas (when discuss is triggered)
    ├── design.md               # Architecture & components (when needed)
    └── tasks.md                # Atomic tasks with verification (when needed)
```

---

## Context Loading Strategy

Before each phase, load the relevant context. **Do not load everything upfront** — load on demand to keep the context window lean.

### Project Knowledge (load once at start)

On the first phase of any feature, scan for project-level documentation:

1. **`CLAUDE.md`** (or equivalent project instructions) — architecture rules, conventions, checklist
2. **`docs/`** directory (or equivalent) — architecture, patterns, domain docs, database docs
3. **`README.md`** — setup, stack, project overview

Read these files to understand the project's architecture, conventions, and constraints. This is your baseline for all decisions.

### Persistent State (load at session start)

If `.specs/STATE.md` exists, load it at the beginning of every session to recover:

- Current work in progress
- Active blockers that may affect the current feature
- Recent decisions that constrain design choices
- Deferred ideas from previous sessions

If `.specs/CONCERNS.md` exists, load it when working on features that touch flagged areas.

### Per-Phase Loading

| Phase        | What to load                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| **Specify**  | Project docs (architecture, domains) + STATE.md (deferred ideas) + CONCERNS.md (if touching flagged areas) |
| **Design**   | spec.md + context.md (if exists) + project architecture docs + CONCERNS.md + existing code for reuse       |
| **Tasks**    | spec.md + design.md + project architecture docs (to identify correct file paths and patterns)              |
| **Execute**  | tasks.md (or spec.md if tasks skipped) + project code patterns + relevant existing implementations         |
| **Validate** | spec.md + tasks.md + project checklist + changed files                                                     |

### Rules

- **Always read project docs before proposing architecture** — the project may have established patterns you must follow
- **Always read existing implementations before creating new ones** — look for similar features to use as reference
- **Never load multiple feature specs simultaneously** — work on one feature at a time
- **Load code files on demand** — read them when a task requires understanding or modifying them, not in advance
- **Monitor context size** — see [context-limits.md](references/context-limits.md) for zone thresholds and budgets

---

## Phases

| Phase         | Reference                             | When                                                   |
| ------------- | ------------------------------------- | ------------------------------------------------------ |
| **Specify**   | [specify.md](references/specify.md)   | Always — capture WHAT to build                         |
| **↳ Discuss** | [discuss.md](references/discuss.md)   | Auto-triggered within Specify when gray areas detected |
| **Design**    | [design.md](references/design.md)     | When architectural decisions are needed                |
| **Tasks**     | [tasks.md](references/tasks.md)       | When >3 steps or complex dependencies                  |
| **Execute**   | [execute.md](references/execute.md)   | Always — implement, verify, commit                     |
| **Validate**  | [validate.md](references/validate.md) | On feature completion or on demand                     |

Supporting references:
| Reference | When |
|-----------|------|
| [coding-principles.md](references/coding-principles.md) | Read before every implementation |
| [state-management.md](references/state-management.md) | Record decisions, blockers, lessons, deferred ideas |
| [concerns.md](references/concerns.md) | Document codebase risks, tech debt, fragile areas |
| [context-limits.md](references/context-limits.md) | Monitor context window usage |

---

## Knowledge Verification Chain

When researching, designing, or making any technical decision, follow this chain in strict order. Never skip steps.

```
Step 1: Codebase    → check existing code, conventions, patterns already in use
Step 2: Project docs → README, docs/, inline comments, architecture docs
Step 3: Context7 MCP → resolve library ID, then query for current API/patterns (if available)
Step 4: Web search   → official docs, reputable sources, community patterns
Step 5: Flag uncertain → "I'm not certain about X — here's my reasoning, but verify"
```

**Rules:**

- Never skip to Step 5 if Steps 1-4 are available
- Step 5 is ALWAYS flagged as uncertain — never presented as fact
- **NEVER assume or fabricate.** If you cannot find an answer, say "I don't know" or "I couldn't find documentation for this". Inventing APIs, patterns, or behaviors causes cascading failures across design → tasks → implementation. Uncertainty is always preferable to fabrication.

### Context7 MCP Integration

Before using Context7, check if the MCP server is available in the current environment. If available, use it for:

- Resolving library IDs for unfamiliar dependencies
- Querying up-to-date API signatures and patterns
- Validating assumptions about third-party libraries

If Context7 is not available, fall back to web search (Step 4).

---

## Language Behavior

**Generate all spec files (spec.md, design.md, tasks.md, validation reports) in the same language the user uses in their prompts.** If the user writes in Portuguese, output in Portuguese. If in English, output in English. Match the user's language naturally — do not ask which language to use.

---

## Implementation Checklist (Generic)

Before marking any task as done, verify:

- [ ] Follows the project's existing architecture and patterns?
- [ ] No logic layer violations (each layer does only its job)?
- [ ] Error handling follows project conventions?
- [ ] No hardcoded values that should be configurable?
- [ ] Imports use the project's path alias/conventions?
- [ ] No debug/temporary code left behind?
- [ ] New files follow existing naming conventions?
- [ ] Changes are registered where needed (routes, configs, exports)?
- [ ] Data access follows the project's established pattern?
- [ ] No unnecessary dependencies introduced?

Extend this checklist with project-specific items from `CLAUDE.md` or equivalent project docs when available.
