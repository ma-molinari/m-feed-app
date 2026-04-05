# Validate

**Goal**: Verify implementation meets spec AND coding principles. Comprehensive feature-level validation.

**Two levels of verification:**

1. **Per-task verification (always):** After implementing each task, verify its "Done when" criteria before committing. This is mandatory and built into Execute — see [execute.md](execute.md).

2. **Feature-level validation (on completion or on demand):** After all tasks for a feature are done, run a comprehensive validation. This is what this document covers.

**Trigger:** "validate", "verify work", "verify", "test", "walk me through it"

---

## Process

### 1. Check Completed Tasks

Go through tasks.md (or inline execution plan):

- [ ] All tasks marked done?
- [ ] Any blocked or partial?
- [ ] All commits made?

If any tasks are incomplete, list them and ask the user how to proceed before continuing validation.

### 2. Verify Acceptance Criteria

For each user story in spec.md, test every WHEN/THEN criterion:

```markdown
### P1: [Story Title]

**Acceptance Criteria**:

1. WHEN [X] THEN [Y] → [PASS / FAIL — reason]
2. WHEN [X] THEN [Y] → [PASS / FAIL — reason]
```

**P1 (MVP) must all PASS before checking P2/P3.**

### 3. Check Edge Cases

From spec.md edge cases section:

- [ ] [Edge case 1] handled correctly
- [ ] [Edge case 2] handled correctly

### 4. Run Project Checks

Execute whatever verification the project supports:

```bash
# Examples — use what's available in the project
npm run build          # compilation check
npm run test           # test suite
npm run lint           # linting
```

If the project has no automated tests, verify manually by tracing the code path for each acceptance criterion.

### 5. Code Quality Check (MANDATORY)

For each changed file, verify against [coding-principles.md](coding-principles.md):

| Check                                | Pass? |
| ------------------------------------ | ----- |
| No features beyond what was asked    |       |
| No abstractions for single-use code  |       |
| No unnecessary "flexibility" added   |       |
| Only touched files required for task |       |
| Didn't "improve" unrelated code      |       |
| Matches existing patterns/style      |       |
| Would senior engineer approve?       |       |

Any "No"? → Fix before marking feature complete.

### 6. Project-Specific Checklist

If the project has a `CLAUDE.md` or equivalent with a checklist, verify every item. This catches project-specific conventions that generic checks miss.

### 7. Check Against Concerns

If `.specs/CONCERNS.md` exists, verify:
- [ ] Implementation didn't worsen any flagged concern
- [ ] Fragile areas were handled with documented "safe modification" approach
- [ ] Any new concerns discovered during implementation are documented

### 8. Update State

Update `.specs/STATE.md` (see [state-management.md](state-management.md)):
- Record any architectural decisions made during implementation (AD-NNN)
- Add lessons learned from issues found during validation (L-NNN)
- Update deferred ideas if validation revealed new improvement opportunities

### 9. Generate Fix Plans (if issues found)

For each issue found during validation:

1. **Diagnose** — Analyze the codebase to find root cause
2. **Create fix task** — Write a task definition with:
   - What: The specific fix
   - Where: File paths
   - Verify: How to prove the fix works
   - Done when: Acceptance criteria for the fix
3. **Present fix plan** — Show all fix tasks to user for approval

Fix tasks follow the same format as regular tasks and are executed with the same Execute cycle.

**Guardrail:** Maximum 3 diagnostic iterations per issue. If root cause isn't found after 3 attempts, flag for human investigation.

---

## Validation Report Template

```markdown
# [Feature] Validation

**Date**: [YYYY-MM-DD]
**Spec**: `.specs/features/[feature]/spec.md`

---

## Task Completion

| Task | Status     | Notes   |
| ---- | ---------- | ------- |
| T1   | ✅ Done    | —       |
| T2   | ✅ Done    | —       |
| T3   | ⚠️ Partial | [Issue] |

---

## Acceptance Criteria Validation

### P1: [Story Title] — MVP

| Criterion     | Result  |
| ------------- | ------- |
| WHEN X THEN Y | ✅ PASS |
| WHEN A THEN B | ✅ PASS |

**Status**: ✅ P1 Complete

### P2: [Story Title]

| Criterion     | Result             |
| ------------- | ------------------ |
| WHEN X THEN Y | ❌ FAIL — [reason] |

**Status**: ⚠️ P2 Issues

---

## Edge Cases

- [x] Edge case 1: Handled correctly
- [ ] Edge case 2: NOT handled — needs fix

---

## Project Checks

- **Build**: ✅ PASS / ❌ FAIL — [details]
- **Tests**: [X] passed, [Y] failed — [failures]
- **Lint**: ✅ PASS / ❌ FAIL — [details]

---

## Code Quality

| Principle        | Status |
| ---------------- | ------ |
| Minimum code     | ✅     |
| Surgical changes | ✅     |
| No scope creep   | ✅     |
| Matches patterns | ✅     |

---

## Fix Plans (if issues found)

### Fix 1: [Issue description]

- **Root cause**: [What's actually wrong]
- **Fix task**: [Task definition following standard format]
- **Priority**: Blocker / Major / Minor / Cosmetic

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status   |
| ----------- | --------------- | ------------ |
| [FEAT]-01   | Implementing    | ✅ Verified  |
| [FEAT]-02   | Implementing    | ❌ Needs Fix |

---

## Summary

**Overall**: ✅ Ready | ⚠️ Issues | ❌ Not Ready

**What works**: [List]

**Issues found**: [Issue: How to fix]

**Next steps**: [Action]
```

---

## Tips

- **P1 first** — MVP must work before checking P2/P3
- **WHEN/THEN = Test** — Each criterion is a concrete test case
- **Be specific** — "Doesn't work" isn't useful; describe what happens vs what should happen
- **Create fix tasks** — Don't just report problems, create actionable fix plans
- **Quality check is mandatory** — Not optional, even if everything seems to work
- **Max 3 diagnostic iterations** — Prevents infinite investigation loops
- **Update traceability** — Every verified requirement updates status in spec.md
