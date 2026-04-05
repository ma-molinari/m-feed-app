# Concerns

**Purpose:** Surface actionable warnings about the codebase. Focused on "what to watch out for when making changes." This is living documentation, not a complaint list.

**Output:** `.specs/CONCERNS.md`

**Trigger:** Explicitly via "document concerns", "find tech debt", "what's risky", or automatically when codebase exploration reveals significant risks during any workflow phase.

---

## When to Generate or Update

- During feature specification — if exploring the codebase reveals risks
- During design — if analyzing code for reuse uncovers tech debt
- During implementation — if a task hits unexpected fragility
- On demand — when explicitly asked to audit concerns

---

## Process

### 1. Gather Evidence

Look for concrete signals — not opinions. Evidence sources:

- Code patterns indicating shortcuts (TODO/FIXME/HACK comments, duplicated logic, missing error handling)
- Test coverage gaps (untested critical paths, missing edge cases)
- Dependency manifests (outdated packages, deprecated libraries, security advisories)
- Performance indicators (N+1 queries, missing indexes, synchronous blocking calls)
- Security patterns (insufficient auth checks, unvalidated inputs, exposed secrets)

### 2. Classify and Document

Each concern must have:
- **What** the problem is
- **Where** it lives (file paths — mandatory)
- **Why** it matters (impact)
- **How** to fix it (approach)

### 3. Prioritize by Risk

Focus on concerns that could cause real damage — data loss, security breaches, user-facing failures, scaling walls. Minor style issues and normal TODOs do not belong here.

---

## Template: `.specs/CONCERNS.md`

```markdown
# Codebase Concerns

**Last Updated:** [YYYY-MM-DD]

## Tech Debt

**[Area/Component]:**
- Issue: [What's the shortcut/workaround]
- Files: `src/path/to/file.ts`
- Impact: [What breaks or degrades because of it]
- Fix approach: [How to properly address it]

## Known Bugs

**[Bug description]:**
- Symptoms: [What happens]
- Trigger: [How to reproduce]
- Files: `src/path/to/file.ts`
- Workaround: [Temporary mitigation if any]
- Root cause: [If known]

## Security Considerations

**[Area requiring security care]:**
- Risk: [What could go wrong]
- Files: `src/path/to/file.ts`
- Current mitigation: [What's in place now]
- Recommendations: [What should be added]

## Performance Bottlenecks

**[Slow operation/endpoint]:**
- Problem: [What's slow]
- Files: `src/path/to/file.ts`
- Measurement: [Actual numbers — "500ms p95", "2s load time"]
- Cause: [Why it's slow]
- Improvement path: [How to speed it up]

## Fragile Areas

**[Component/Module]:**
- Files: `src/path/to/file.ts`
- Why fragile: [What makes it break easily]
- Common failures: [What typically goes wrong]
- Safe modification: [How to change it without breaking]
- Test coverage: [Is it tested? Gaps?]

## Scaling Limits

**[Resource/System]:**
- Current capacity: [Numbers — "100 req/sec", "10k rows"]
- Limit: [Where it breaks]
- Symptoms at limit: [What happens]
- Scaling path: [How to increase capacity]

## Dependencies at Risk

**[Package/Service]:**
- Risk: [e.g., "deprecated", "unmaintained", "breaking changes"]
- Impact: [What breaks if it fails]
- Migration plan: [Alternative or upgrade path]

## Test Coverage Gaps

**[Untested area]:**
- What's not tested: [Specific functionality]
- Risk: [What could break unnoticed]
- Priority: [High/Medium/Low]
```

**Include only sections that have findings.** Omit empty sections entirely.

---

## How CONCERNS.md Gets Used

| Workflow phase | How concerns are used |
|---------------|----------------------|
| **Specify** | Check if the feature touches any flagged areas — note risks in spec |
| **Design** | Consult before proposing architecture — document how design mitigates flagged concerns |
| **Tasks** | Reference fragile areas in task definitions — add extra verification steps |
| **Execute** | Check before modifying any flagged component — apply "safe modification" guidance |
| **Validate** | Verify that implementation didn't worsen existing concerns |

---

## What Belongs vs. What Doesn't

**Include:**
- Tech debt with clear impact and fix approach
- Known bugs with reproduction steps
- Security gaps with mitigation recommendations
- Performance bottlenecks with measurements
- Fragile code that breaks easily
- Scaling limits with numbers
- Dependencies that need attention
- Test coverage gaps in critical paths

**Exclude:**
- Opinions without evidence ("code is messy")
- Complaints without solutions ("auth sucks")
- Future feature ideas (those go in STATE.md Deferred Ideas)
- Normal TODOs (those live in code comments)
- Architectural decisions that are working fine
- Minor code style issues

---

## Writing Guidelines

- **Always include file paths** — Concerns without locations are not actionable
- Be specific with measurements ("500ms p95" not "slow")
- Include reproduction steps for bugs
- Suggest fix approaches, not just problems
- Prioritize by risk/impact

**Tone:** Professional, not emotional. Solution-oriented. Factual.

- Good: "N+1 query pattern in `src/repos/user.ts` — 1.2s p95 with 50+ records"
- Bad: "Terrible queries, everything is slow"
- Good: "Fix: add index on `user_id` in `subscriptions` table"
- Bad: "Needs fixing"

---

## Tips

- **Living document** — Update as issues are fixed or new ones discovered
- **Evidence over opinion** — If you can't point to a file path and a measurable impact, it's not a concern
- **Fix approaches are mandatory** — A problem without a solution path is just noise
- **Size limit: 5k tokens** — If it grows beyond that, prioritize and archive resolved items
