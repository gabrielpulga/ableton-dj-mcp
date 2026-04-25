# How to Write a Finding

Format spec for `docs/findings/`. Loaded by `/update-docs` skill before scanning conversations. AI-optimized for reading, writing, and lazy loading.

## What goes here

Validated facts discovered during work. Each finding is one fact with one piece of concrete evidence. Two unrelated facts = two files.

## What does NOT go here

- Anything in `CLAUDE.md`, `docs/PROJECT_INDEX.md`, or `docs/contributing/`
- Code conventions (live in `Coding-Standards.md`)
- Architecture (live in `Architecture.md`)
- Git history (`git log`)
- Bug fix recipes (commit message has it)
- Speculation, "should be true", "probably", "might also affect"
- General programming knowledge

If unsure → skip. Capturing nothing beats capturing noise.

## Validation bar

A finding is valid only if proven in the source conversation by ONE of:

- A passing test (cite test name + file)
- A successful tool call (cite tool name + result)
- A grep / read result (cite file:line)
- A working build / deploy (cite version + observed behavior)
- An error message + reproduction
- The user's explicit confirmation ("yes", "confirmed", "works")

No other source counts. Inference, "common knowledge", and "we should remember" are rejected.

## File layout

```
docs/findings/
├── INDEX.md                   ← always loaded, one line per finding
├── HOW-TO-WRITE.md            ← this file (loaded by /update-docs skill)
├── dev/                       ← code, tooling, build, infra
├── music/                     ← production techniques, sound design
└── workflow/                  ← process, deploys, dev loop
```

## Filename rules

- Path: `<domain>/<slug>.md`
- Slug: kebab-case, ≤ 5 words, ≤ 35 chars
- Slug names the fact, not the symptom: `barbeat-notation-order` not `barbeat-bug-fix`
- Lowercase only

## Strict file template

```markdown
---
title: <slug-matches-filename>
domain: <dev|music|workflow>
validated: <YYYY-MM-DD>
evidence: <PR # | commit SHA | file:line | "user confirmed">
---

## Fact
<one or two sentences. The claim itself. No buildup, no preamble.>

## Evidence
<concrete proof. Code block, command output, or test name. Reproducible.>

## Apply when
<condition that triggers relevance. "Touching X", "Generating Y", "Debugging Z".>
```

### Section rules

- Exactly 3 sections: Fact, Evidence, Apply when. No more, no less.
- No "Background", "Why", "History", "Notes", "See also" — these rot
- No links to PRs in body text — frontmatter `evidence` field only
- Code blocks ≤ 10 lines. If you need more, you're documenting wrong thing.
- No marketing, no "magic", no hedging

## INDEX rules

`INDEX.md` is the only file always loaded. Keep it lean. Lines must encode enough routing signal that Claude can decide whether to load the linked file WITHOUT loading it.

Format per line:

```
- [<slug>](<domain>/<slug>.md) [<glob>,<glob>,<glob>] — <summary>
```

### Globs

The bracketed glob list is the trigger. Claude matches each glob against the file paths being touched in the current task. If any glob matches → load the finding. If none match → skip without loading.

- Use `**` for deep paths (`src/notation/**`)
- Use `*` for filename patterns (`**/notes-formatter*`)
- Comma-separated, no spaces inside brackets
- 2-4 globs per line ideal; >5 = finding is too broad, split it
- Globs MUST point to the files / dirs the finding actually applies to. Vague globs poison routing.

### Summary

- ≤ 120 chars
- States the fact, not its cause: `pitch must precede time` not `bug in barbeat parser`
- Reads as a complete sentence Claude can act on without opening the file

### Other rules

- Sort alphabetically within domain section
- Empty domain sections kept (so consumers know the domain exists)
- No file at root counts as a finding except INDEX and HOW-TO-WRITE

## Deduplication

Before writing a new file:

1. Read INDEX
2. grep INDEX for keywords from the candidate finding
3. If match: read the existing file
   - Same fact → skip, do not write
   - Adjacent / extending fact → edit existing file's Evidence section, do not create new file
   - Genuinely different angle → new file with disambiguating slug
4. If no match: create new file

## Anti-patterns

- ❌ Two files for the same fact
- ❌ Restating something the code, grammar, or test already documents
- ❌ "This was discovered when…" — frontmatter has the date
- ❌ "Note that…" — just state it
- ❌ Stuffing multiple findings into one file to save count
- ❌ Adding a finding because the conversation was interesting (interesting ≠ validated)
- ❌ Documenting the bug instead of the underlying invariant ("don't do X" → "X breaks because Y")

## Worked examples

Look at existing files in `dev/`, `music/`, `workflow/` for canonical examples. Match their shape exactly.
