# State Management

**Purpose:** Persistent memory across sessions — decisions, blockers, learnings, deferred ideas.

**Output:** `.specs/STATE.md`

**Trigger:** Automatically during workflow (scope guardrail captures, architectural decisions, lessons learned) or explicitly via "record decision", "log blocker", "add todo", "deferred idea"

---

## When to Update

| Event                            | Action                                  |
| -------------------------------- | --------------------------------------- |
| Significant architectural choice | Add decision (AD-NNN)                   |
| Implementation blocked           | Add blocker (B-NNN)                     |
| Important discovery/learning     | Add lesson (L-NNN)                      |
| Scope creep captured in Execute  | Add to Deferred Ideas                   |
| In-progress thought or action    | Add to Todos                            |
| Feature completed                | Update "Current Work"                   |
| Session end                      | Update "Last Updated" + "Current Work"  |

---

## Template: `.specs/STATE.md`

```markdown
# State

**Last Updated:** [ISO timestamp]
**Current Work:** [Feature name] — [Task identifier or phase]

---

## Recent Decisions (Last 60 days)

### AD-[NNN]: [Decision title] ([date])

**Decision:** [What was decided]
**Reason:** [Why this choice]
**Trade-off:** [What was sacrificed]
**Impact:** [How this affects implementation]

---

## Active Blockers

### B-[NNN]: [Blocker description]

**Discovered:** [Date]
**Impact:** [Severity and scope]
**Workaround:** [Temporary solution if available]
**Resolution:** [Path to permanent fix]

---

## Lessons Learned

### L-[NNN]: [Learning description]

**Context:** [Situation that occurred]
**Problem:** [What went wrong]
**Solution:** [How it was resolved]
**Prevents:** [What this knowledge prevents in future]

---

## Deferred Ideas

Ideas captured during work that belong in future features or phases. Prevents scope creep while preserving good ideas.

- [ ] [Idea description] — Captured during: [feature/phase]
- [ ] [Idea description] — Captured during: [feature/phase]

---

## Todos

Action items and in-progress thoughts that don't fit in active tasks.

- [ ] [TODO: action item]
- [ ] [TODO: action item]
```

---

## Integration with Workflow Phases

### During Specify
- Record decisions about scope boundaries (what's in/out)
- Capture deferred ideas from scope discussions

### During Design
- Record architectural decisions with trade-offs
- Log blockers if a design approach is constrained by external factors

### During Execute (Scope Guardrail)
When the scope guardrail in [execute.md](execute.md) captures something:

- **Bug found** → Add as blocker (B-NNN) or todo
- **Improvement idea** → Add to Deferred Ideas
- **Surprising behavior** → Add as lesson (L-NNN)

### During Validate
- Record lessons from issues found
- Update deferred ideas with validation insights

---

## Size Management

**Zones:**
- Green (<7k tokens): No action needed
- Yellow (7-10k tokens): Note "STATE.md at [X]k. Cleanup recommended."
- Red (>10k tokens): Active prompt "STATE.md is large ([X]k). Cleanup now?"

**Cleanup process:**
- Move decisions older than 60 days to `STATE-ARCHIVE.md`
- Remove resolved blockers (keep the resolution as a lesson if valuable)
- Keep only recent lessons (<60 days)
- Remove completed deferred ideas or promote them to feature specs

**Validation:**
- Decisions have clear rationale?
- Blockers include resolution path?
- Lessons are actionable, not just observations?

---

## Tips

- **Update incrementally** — Don't batch updates. Add entries as they happen.
- **Be specific** — "Chose PostgreSQL array over junction table" not "Made DB decision"
- **Include file paths** — Decisions without context are useless in future sessions
- **Deferred Ideas are not backlog** — They're rough captures. Promote to specs when ready to implement.
- **STATE.md is for the agent** — Write for your future self resuming this project in a new session
