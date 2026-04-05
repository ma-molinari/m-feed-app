# Tasks

**Goal**: Break into GRANULAR, ATOMIC tasks. Clear dependencies. Parallel execution map. Right tools.

**Skip this phase when:** There are ≤3 obvious steps. In that case, tasks are implicit — go straight to Execute and list them inline.

---

## Why Granular Tasks?

| Vague Task (BAD)  | Granular Tasks (GOOD)             |
| ----------------- | --------------------------------- |
| "Create form"     | T1: Create email input component  |
|                   | T2: Add email validation function |
|                   | T3: Create submit button          |
|                   | T4: Add form state management     |
|                   | T5: Connect form to API           |
| "Implement auth"  | T1: Create login endpoint         |
|                   | T2: Add token generation service  |
|                   | T3: Create auth middleware        |
|                   | T4: Add route protection          |

**Benefits of granular:**
- **Focused execution** — Single focus, no ambiguity
- **Easy to test** — Each task = one verifiable outcome
- **Parallelizable** — Independent tasks run simultaneously
- **Errors isolated** — One failure doesn't block everything
- **Clean git history** — One task = one atomic commit

---

## Granularity Rules

**One task = ONE of these:**
- One component or file
- One function or method
- One API endpoint (full vertical: interface → repo → business → controller → route)
- One migration or schema change
- One configuration change

**Split signals:**
- Task touches >3 files → split it
- Task has multiple independent deliverables → split it
- Task description uses "and" connecting unrelated things → split it
- You can't describe "Done when" in ≤3 bullet points → too complex, split it

**Exception:** When files are tightly coupled and splitting would create artificial boundaries (e.g., an interface + its single implementation), keeping them in one task is acceptable.

---

## Process

### 1. Review Input (MANDATORY)

Load context before creating tasks:

1. **`.specs/features/[feature]/design.md`** (if exists) or **`spec.md`** — what you're breaking down
2. **Project architecture docs** (`CLAUDE.md`, `docs/architecture.md` or equivalent) — to identify correct file paths, naming conventions, and layer structure
3. **Existing similar implementations** — to reference real file paths and patterns in task definitions

**Why:** Tasks must reference concrete file paths and existing patterns. Without project context, tasks become abstract and error-prone.

### 2. Break Into Atomic Tasks

Each task gets:
- **What**: One sentence — exact deliverable
- **Where**: File path(s) to create or modify
- **Depends on**: What must be done first (task IDs)
- **Reuses**: Existing code to reference or extend
- **Requirement**: ID from spec.md for traceability
- **Done when**: Specific, testable criteria (pass/fail)
- **Verify**: Command or action to prove it works
- **Commit**: Planned commit message (Conventional Commits format)

### 3. Define Dependencies

For each task, identify what MUST be completed before it can start. Be precise:
- `Depends on: None` — can start immediately
- `Depends on: T1` — needs T1's deliverable
- `Depends on: T2, T3` — needs both

### 4. Create Execution Plan

Group tasks into phases based on dependencies:
- **Sequential phases**: Tasks that must run in order
- **Parallel phases**: Tasks that can run simultaneously after their dependencies are met

Mark parallel-eligible tasks with `[P]`.

### 5. Map Parallelism

Create a visual representation showing:
- Which tasks can run simultaneously
- What gates (dependency completions) separate phases
- The critical path (longest sequential chain)

---

## Template: `.specs/features/[feature]/tasks.md`

```markdown
# [Feature] Tasks

**Design**: `.specs/features/[feature]/design.md`
**Status**: Draft | Approved | In Progress | Done

---

## Execution Plan

### Phase 1: Foundation (Sequential)

Tasks that must be done first, in order.

```
T1 → T2 → T3
```

### Phase 2: Core Implementation (Parallel OK)

After foundation, these can run in parallel.

```
      ┌→ T4 [P] ─┐
T3 ──→┼→ T5 [P] ─┼──→ T8
      └→ T6 [P] ─┘
```

### Phase 3: Integration (Sequential)

Bringing it all together.

```
T8 → T9
```

---

## Parallel Execution Map

```
Phase 1 (Sequential):
  T1 ──→ T2 ──→ T3

Phase 2 (Parallel):
  After T3:
    ├── T4 [P]
    ├── T5 [P]  ← can run simultaneously
    └── T6 [P]

Phase 3 (Sequential):
  After T4+T5+T6:
    T7 ──→ T8

Critical path: T1 → T2 → T3 → T4 → T7 → T8
Total tasks: 8 | Parallelizable: 3 | Phases: 3
```

---

## Task Breakdown

### T1: [Create X Interface]

**What**: [One sentence: exact deliverable]
**Where**: `src/path/to/file.ts`
**Depends on**: None
**Reuses**: `src/existing/BaseInterface.ts`
**Requirement**: [FEAT]-01

**Done when**:
- [ ] Interface defined with all methods from design
- [ ] Types exported correctly
- [ ] No compilation errors

**Verify**:
```bash
[command to prove it works]
```

**Commit**: `feat(scope): add X interface`

---

### T2: [Implement Y Service] [P]

**What**: [Exact deliverable]
**Where**: `src/services/YService.ts`
**Depends on**: T1
**Reuses**: `src/services/BaseService.ts` patterns
**Requirement**: [FEAT]-02

**Done when**:
- [ ] Implements interface from T1
- [ ] Handles error cases from design
- [ ] No compilation errors

**Verify**:
```bash
[command to prove it works]
```

**Commit**: `feat(scope): implement Y service`

---

### T3: [Create Z Component] [P]

**What**: [Exact deliverable]
**Where**: `src/components/ZComponent.ts`
**Depends on**: T1
**Reuses**: `src/components/BaseComponent.ts`
**Requirement**: [FEAT]-01

**Done when**:
- [ ] Component works correctly
- [ ] Follows existing patterns
- [ ] No compilation errors

**Verify**:
```bash
[command to prove it works]
```

**Commit**: `feat(scope): create Z component`

---

## Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T1: Create interface | 1 file | ✅ Granular |
| T2: Implement service | 1 file | ✅ Granular |
| T3: Create controller + routes + business | 3+ files | ❌ Split it! |
```

---

## Tips

- **[P] = Parallel OK** — Mark tasks that can run simultaneously after dependencies are met
- **Reuses = quality guarantee** — Always reference existing code patterns
- **Dependencies are gates** — Clear what blocks what
- **Done when = Testable** — If you can't verify it, rewrite the criteria
- **Requirement ID = Traceable** — Every task traces back to a spec requirement
- **One commit per task** — Plan the commit message in advance
- **Critical path matters** — Identify the longest sequential chain to understand the true execution order
- **Confirm before Execute** — User approves tasks before implementation starts
