# Execute

**Goal**: Implement ONE task at a time. Surgical changes. Verify. Commit. Repeat.

This is where code gets written. Every task follows the same cycle: plan → implement → verify → commit. Verification is built into every task, not a separate phase.

---

## MANDATORY: Before Starting Any Implementation

### Load Context

1. **Read [coding-principles.md](coding-principles.md)** — behavioral guidelines for implementation
2. **Read `CLAUDE.md`** (or equivalent project instructions) — architecture rules, conventions, checklist
3. **Read project code patterns** (`docs/code-patterns.md` or equivalent) — error handling, validation, logging conventions
4. **Read existing implementations** of similar features — use as reference for patterns and structure

### State Pre-Implementation

1. **Assumptions** — What am I assuming? Any uncertainty?
2. **Files to touch** — List ONLY files this task requires
3. **Success criteria** — How will I verify this works?

Do not proceed without loading context and stating these explicitly.

---

## Process

### 0. List Atomic Steps (MANDATORY when Tasks phase was skipped)

If there is no `tasks.md` for this feature, you MUST list atomic steps before writing any code. This prevents losing focus and doing too many things at once.

```
## Execution Plan

1. [Step] → files: [list] → verify: [how] → commit: [message]
2. [Step] → files: [list] → verify: [how] → commit: [message]
3. [Step] → files: [list] → verify: [how] → commit: [message]
```

Each step must be:
- ONE deliverable (one component, one function, one endpoint, one file change)
- Independently verifiable (can prove it works before moving on)
- Independently committable (gets its own atomic git commit)

**Safety valve:** If listing steps reveals >5 steps or complex dependencies, STOP and create a formal `tasks.md` instead. The Tasks phase was wrongly skipped.

### 1. Pick Task

From tasks.md (if exists) or from the execution plan above. User specifies ("implement T3") or suggest next available based on dependency order.

### 2. Verify Dependencies

Check task dependencies before starting:
- If tasks.md exists, check `Depends on` field
- If using inline plan, follow the listed order

If blocked: "T3 depends on T2 which isn't done. Should I do T2 first?"

### 3. State Implementation Plan

Before writing code:

```
Task: T[X] — [Title]
Files: [list of files to create/modify]
Approach: [brief description of what will be done]
Success: [how to verify — command, check, or observable outcome]
```

### 4. Implement

- Follow "What" and "Where" from the task exactly
- Reference "Reuses" for patterns to follow
- Apply [coding-principles.md](coding-principles.md) strictly:
  - Simplest code that works
  - Touch ONLY listed files
  - No scope creep — nothing beyond the task definition

#### Context7 MCP During Implementation

When implementing code that uses third-party libraries and you're uncertain about API details:

1. **Check Context7 availability** in the current environment
2. **Query specific API** — Look up the exact method, parameter, or pattern needed
3. **Apply verified API** — Use the confirmed API in your implementation

This is especially useful for: ORM query builders, validation schemas, framework middleware patterns, SDK methods.

If Context7 is not available, fall back to web search or flag the uncertainty.

### 5. Verify "Done When"

Check ALL criteria from the task's "Done when" list before proceeding:
- Run verification commands
- Confirm each criterion passes
- If any criterion fails, fix before continuing

### 6. Self-Check

Ask: "Would a senior engineer flag this as overcomplicated?"

- Yes → Simplify before continuing
- No → Proceed to commit

### 7. Atomic Git Commit

Each task gets its own commit immediately after verification. Never batch multiple tasks into one commit.

**Format (Conventional Commits 1.0.0):**

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**

| Type       | When to use                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | New feature or capability                               |
| `fix`      | Bug fix                                                 |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `docs`     | Documentation only                                      |
| `test`     | Adding or correcting tests                              |
| `style`    | Formatting, no code change                              |
| `perf`     | Performance improvement                                 |
| `build`    | Build system or external dependencies                   |
| `ci`       | CI configuration                                        |
| `chore`    | Maintenance tasks                                       |

**Description rules:**
- Imperative mood ("add", not "added" or "adds")
- Lowercase first letter
- No period at the end
- Complete the sentence: "If applied, this commit will _[your description]_"

**Breaking changes:** Append `!` after type/scope AND add `BREAKING CHANGE:` footer:

```
feat(api)!: change authentication endpoint response format

BREAKING CHANGE: login endpoint now returns JWT in body instead of cookie
```

**Commit rules:**
- One task = one commit
- Description references what was DONE, not what was planned
- Include only files from the task — never sneak in "while I'm here" changes
- If tests are part of the task, include them in the same commit

### 8. Scope Guardrail

During implementation, you will notice things that could be improved, refactored, or added. **Do not act on them.** Instead, capture them in `.specs/STATE.md` (see [state-management.md](state-management.md)):

- **Bug found** → Add as blocker (B-NNN) in STATE.md and inform the user
- **Improvement idea** → Add to Deferred Ideas in STATE.md
- **Surprising behavior / lesson** → Add as lesson (L-NNN) in STATE.md
- **Fragile area discovered** → Update `.specs/CONCERNS.md` (see [concerns.md](concerns.md))
- **Related to current task** → Only include if it's in the "Done when" criteria

**The heuristic:** "Is this in my task definition?" If no, don't touch it — capture it in STATE.md instead.

### 9. Update Task Status

Mark the task as complete in tasks.md. Update requirement traceability in spec.md if requirement IDs are used.

---

## Execution Template

```markdown
## Implementing T[X]: [Task Title]

**Reading**: task definition from tasks.md
**Dependencies**: [All done? ✅ | Blocked by: TY]

### Pre-Implementation (MANDATORY)

- **Assumptions**: [state explicitly]
- **Files to touch**: [list ONLY these]
- **Success criteria**: [how to verify]

### Implementation

[Do the work]

### Verification

- [x] Done when criterion 1
- [x] Done when criterion 2
- [x] No unnecessary changes made
- [x] Matches existing patterns

### Commit

`feat(scope): description`

**Status**: ✅ Complete | ❌ Blocked | ⚠️ Partial
```

---

## Tips

- **One task at a time** — Focus prevents errors
- **Reuses save effort** — Copy patterns, don't reinvent
- **Check before commit** — Verify all criteria, then commit
- **Stay surgical** — Touch only what's necessary
- **Commit per task** — Clean git history enables bisect and rollback
- **Never "while I'm here"** — Scope creep during implementation is the #1 quality killer
- **Context7 for API details** — When unsure about a library's API, verify before using
