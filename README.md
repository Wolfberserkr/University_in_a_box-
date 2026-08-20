# University in a Box — the ALTER Framework

A one-person degree program run by five agents against one shared state file.

**Destination for this instance:** human nature and psychology, 52 weeks, solo.
See [`curriculum/CHARTER.md`](curriculum/CHARTER.md).

---

## The five agents

| Letter | Agent | Owns | Refuses to |
|---|---|---|---|
| **A** | [Advisor](.claude/agents/advisor.md) | the map | add "foundational" material that doesn't unblock a later week |
| **L** | [Librarian](.claude/agents/librarian.md) | the sources | present a recalled citation as a verified one |
| **T** | [Tutor](.claude/agents/tutor.md) | comprehension | accept "yeah, that makes sense" |
| **E** | [Editor](.claude/agents/editor.md) | the output | open with praise, or grade against anything but the locked rubric |
| **R** | [Roommate](.claude/agents/roommate.md) | range | reach for a domain already spent in the ledger |

Each agent file is a complete system prompt. Two ways to run them:

- **Claude Code:** they're already live as subagents — `.claude/agents/*.md`. Invoke by name.
- **claude.ai Projects:** copy everything *below the `---` frontmatter block* into a Project's custom instructions. One Project per agent. Paste `REGISTRAR.md` into each Project's knowledge, and re-paste it whenever it changes.

## The spine

[`REGISTRAR.md`](REGISTRAR.md) is the shared state file. Without it, five agents are five disconnected chat windows: the Tutor doesn't know what the Advisor cut, the Editor doesn't know what the rubric says, the Roommate keeps reaching for jazz.

Each agent **owns exactly one section** and may write only there. Everyone reads everything. `§0 RUBRIC` is locked by all five.

## Weekly loop

```
Mon  Advisor    -> reads last week's Gap Log + Verdicts, sets this week's milestone
Mon  Librarian  -> pulls sources for the milestone, tags [V]/[R], logs to §2
Tue-Thu         -> you read. Nobody talks to you.
Thu  Tutor      -> 45-min oral exam on what you read; writes gaps to §3
Fri              -> you write the week's 600-word output
Fri  Editor     -> grades vs §0 RUBRIC; writes verdict to §4
Sat  Roommate   -> (every other week) one cross-domain collision; logs to §5
Sun  Advisor    -> closes the week on the board, adjusts sequence
```

## Files

```
REGISTRAR.md            shared state — the only file all five agents touch
curriculum/CHARTER.md   destination, baseline, sequence, cut list
curriculum/RUBRIC.md    pass criteria, locked in week 0, read-only thereafter
curriculum/READING-LIST.md  the source stack, [V]/[R] tagged
logs/                   weekly outputs and Editor verdicts
.claude/agents/         the five system prompts
```

## The honest flag

The Librarian is the weakest of the five and it isn't the prompt's fault. Curation is recall, and a language model produces confident, well-formed citations for papers that don't exist. Mitigations, in order of strength:

1. Run it with web search enabled. Non-negotiable.
2. Work from PDFs you already hold in NotebookLM — it can only cite what's uploaded.
3. Treat every `[R]` tag as a lead to check, not a shopping list.

In `curriculum/READING-LIST.md`, 9 items are `[V]` — checked against an authoritative record. The rest are `[R]`. That ratio is the point, not an apology.
