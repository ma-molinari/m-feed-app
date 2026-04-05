# Context Limits

**Purpose:** Manage the context window to prevent overload. Load only what's needed, monitor usage, and optimize when heavy.

---

## File Size Limits

Maximum recommended sizes for generated spec files:

| File         | Max Tokens | ~Words | Warning At  |
| ------------ | ---------- | ------ | ----------- |
| spec.md      | 5,000      | 3,000  | 4,000 (80%) |
| context.md   | 3,000      | 1,800  | 2,400       |
| design.md    | 8,000      | 4,800  | 6,400       |
| tasks.md     | 10,000     | 6,000  | 8,000       |
| STATE.md     | 10,000     | 6,000  | 7,000 (70%) |
| CONCERNS.md  | 5,000      | 3,000  | 4,000       |

If a file exceeds its warning threshold, consider:
- Splitting into sections that can be loaded independently
- Archiving old content (e.g., STATE-ARCHIVE.md)
- Being more concise in future entries

---

## Context Zones

Monitor total loaded context and act accordingly:

### Green — Healthy (<40k tokens total)

- **Action:** Silent. No notification needed.
- **Behavior:** Load context freely as needed.

### Yellow — Moderate (40-60k tokens total)

- **Action:** Discrete footer note after completing current work.
- **Format:** `Context: ~[X]k tokens loaded. Consider unloading completed specs.`
- **Behavior:** Be selective about loading additional files. Prefer reading specific sections over entire files.

### Red — Critical (>60k tokens total)

- **Action:** Active warning before loading more context.
- **Format:** `Context is heavy (~[X]k tokens). Recommend: [specific optimization].`
- **Behavior:**
  - Do not load new files without unloading others first
  - Suggest specific files to unload (completed specs, resolved concerns)
  - Consider summarizing large files before loading

---

## Monitoring

When in yellow or red zone, display context status:

```
Context: ~52k tokens (moderate)
  Loaded: spec.md (4k) + design.md (7k) + tasks.md (9k) + project docs (~30k)
  Suggestion: Unload design.md if no longer needed for current task
```

---

## Loading Principles

1. **Load on demand** — Read files when a phase needs them, not in advance
2. **Unload when done** — Once a phase is complete and its files aren't needed, they can be released from active consideration
3. **One feature at a time** — Never load multiple feature specs simultaneously
4. **Prefer sections over whole files** — For large project docs, read only relevant sections
5. **Project docs are shared context** — `CLAUDE.md` and architecture docs stay loaded across phases; feature-specific files rotate

---

## Per-Phase Budget Guide

Approximate token budgets to stay in green zone:

| Phase       | Project docs | Feature files | Working room | Total  |
| ----------- | ------------ | ------------- | ------------ | ------ |
| **Specify** | ~15k         | —             | ~25k         | ~40k   |
| **Design**  | ~15k         | spec ~5k      | ~20k         | ~40k   |
| **Tasks**   | ~15k         | spec+design ~12k | ~13k      | ~40k   |
| **Execute** | ~10k         | tasks ~10k    | ~20k         | ~40k   |

These are guidelines, not hard limits. The key principle: reserve at least 60% of the context window for work, reasoning, and outputs.

---

## Tips

- **40k is the target** — 20% of a 200k window, leaving 160k+ for actual work
- **Project docs are the biggest cost** — If they're large, read selectively
- **STATE.md grows over time** — Monitor and archive regularly
- **Don't pre-load "just in case"** — Every loaded file costs reasoning capacity
