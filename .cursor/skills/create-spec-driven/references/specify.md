# Specify

**Goal**: Capture WHAT to build with testable, traceable requirements.

---

## Process

### 0. Load Project Context (MANDATORY)

Before gathering requirements, understand the project:

1. **Read `CLAUDE.md`** (or equivalent project instructions) — architecture, conventions, constraints
2. **Scan `docs/` directory** — read architecture and domain docs relevant to the feature area
3. **Read existing similar features** — understand what patterns are already established
4. **Check `.specs/STATE.md`** (if exists) — review deferred ideas that may relate to this feature
5. **Check `.specs/CONCERNS.md`** (if exists) — note any flagged areas the feature may touch

This context is essential to write requirements that are feasible within the project's architecture and don't conflict with existing patterns.

### 1. Clarify Requirements

You are a thinking partner, not an interviewer. Start open — let the user dump their mental model. Follow the energy: whatever they emphasize, dig into that.

Ask conversationally (not as a checklist):
- "What problem are you solving?"
- "Who is the user and what's their pain?"
- "What does success look like?"

If needed:
- "What are the constraints (time, tech, resources)?"
- "What is explicitly out of scope?"

**Challenge vagueness.** Never accept fuzzy answers. "Good" means what? "Users" means who? "Simple" means how? Make the abstract concrete: "Walk me through using this." "What does that actually look like?"

**Know when to stop.** When you understand what they're building, why, who it's for, and what done looks like — offer to proceed.

### 2. Capture User Stories with Priorities

- **P1 = MVP** (must ship), **P2** (should have), **P3** (nice to have)
- Each story MUST be **independently testable** — you can implement and demo just that story

### 3. Write Acceptance Criteria

Use **WHEN/THEN/SHALL** format — precise and testable:
- WHEN [event/action] THEN [system] SHALL [response/behavior]

### 4. Assign Requirement IDs

Every requirement gets a unique ID for tracking across design, tasks, and validation.

**ID format:** `[CATEGORY]-[NUMBER]` (e.g., `AUTH-01`, `PROC-03`, `NOTIF-02`)

**Status flow:** `Pending → In Design → In Tasks → Implementing → Verified`

### 5. Detect Gray Areas → Discuss (Auto-Trigger)

After writing the spec, analyze it for ambiguous areas — user-facing behavior that could go multiple ways where the user hasn't expressed a preference.

**Auto-trigger [discuss.md](discuss.md) when:**
- The spec contains behavior with multiple valid approaches
- Response formats, error styles, or interaction patterns aren't specified
- The user said something vague that needs concrete decisions

**Do NOT trigger when:**
- Infrastructure, CRUD, or well-defined contracts
- The "how" is obvious from the "what"
- All behavior is already concrete in the acceptance criteria

If triggered, the discuss phase produces a `context.md` that feeds into Design and Tasks. If not triggered, proceed directly to the next phase.

---

## Template: `.specs/features/[feature]/spec.md`

```markdown
# [Feature Name] Specification

## Problem Statement

[Describe the problem in 2-3 sentences. What pain point are we solving? Why now?]

## Goals

- [ ] [Primary goal with measurable outcome]
- [ ] [Secondary goal with measurable outcome]

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| [Feature X] | [Why excluded] |
| [Feature Y] | [Why excluded] |

---

## User Stories

### P1: [Story Title] — MVP

**User Story**: As a [role], I want [capability] so that [benefit].

**Why P1**: [Why this is critical for MVP]

**Acceptance Criteria**:

1. WHEN [user action/event] THEN system SHALL [expected behavior]
2. WHEN [user action/event] THEN system SHALL [expected behavior]
3. WHEN [edge case] THEN system SHALL [graceful handling]

**Independent Test**: [How to verify this story works alone — e.g., "Can demo by doing X and seeing Y"]

---

### P2: [Story Title]

**User Story**: As a [role], I want [capability] so that [benefit].

**Why P2**: [Why this isn't MVP but important]

**Acceptance Criteria**:

1. WHEN [event] THEN system SHALL [behavior]
2. WHEN [event] THEN system SHALL [behavior]

**Independent Test**: [How to verify]

---

### P3: [Story Title]

**User Story**: As a [role], I want [capability] so that [benefit].

**Why P3**: [Why this is nice-to-have]

**Acceptance Criteria**:

1. WHEN [event] THEN system SHALL [behavior]

---

## Edge Cases

- WHEN [boundary condition] THEN system SHALL [behavior]
- WHEN [error scenario] THEN system SHALL [graceful handling]
- WHEN [unexpected input] THEN system SHALL [validation response]

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| [FEAT]-01      | P1: [Story] | Design | Pending |
| [FEAT]-02      | P1: [Story] | Design | Pending |
| [FEAT]-03      | P2: [Story] | -      | Pending |

**Coverage:** X total, Y mapped to tasks, Z unmapped

---

## Success Criteria

How we know the feature is successful:

- [ ] [Measurable outcome — e.g., "User can complete X in < 2 minutes"]
- [ ] [Measurable outcome — e.g., "Zero errors in Y scenario"]
```

---

## Tips

- **P1 = Vertical Slice** — A complete, demo-able feature, not just one layer
- **WHEN/THEN is code** — If you can't write it as a test, rewrite it
- **Requirement IDs are mandatory** — Every story maps to trackable IDs
- **Edge cases matter** — What breaks? What's empty? What's huge?
- **Out of Scope prevents creep** — If it's not here, it doesn't get built
- **Confirm before proceeding** — User must approve spec before moving to next phase
