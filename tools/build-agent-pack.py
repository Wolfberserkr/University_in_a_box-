#!/usr/bin/env python3
"""Bundle every file the five agents need into one AGENT-PACK.md.

claude.ai Projects need the shared state re-uploaded whenever it changes.
Seven files x five Projects is the friction that kills this by October.
One file x five Projects is survivable.

Run after any change to the state files, then re-upload the pack.
"""
import subprocess, datetime, pathlib

FILES = [
    ("REGISTRAR.md",            "Institution state: calendar, enrolment, transcript, baseline, standing rules."),
    ("ASSESSMENT.md",           "The locked grading standard. Read-only. Never amended mid-artifact."),
    ("enrolled/PSY-101.md",     "LIVE state, PSY-101. Five agent sections. Write only to the one you own."),
    ("enrolled/STA-101.md",     "LIVE state, STA-101. Five agent sections. Write only to the one you own."),
    ("catalog/PSY-101.md",      "Course definition + course-specific cut list."),
    ("catalog/STA-101.md",      "Course definition + course-specific cut list."),
    ("catalog/PSY-major.md",    "Subject-wide program statement and CUT LIST. Binds every PSY course."),
    ("START-HERE.md",           "The ordered walkthrough and the weekly rhythm."),
]

root = pathlib.Path(__file__).resolve().parent.parent
try:
    sha = subprocess.check_output(["git","rev-parse","--short","HEAD"], cwd=root, text=True).strip()
except Exception:
    sha = "unknown"

out = [
    "# AGENT PACK",
    "",
    f"Generated {datetime.date.today().isoformat()} from commit `{sha}` by `tools/build-agent-pack.py`.",
    "",
    "Everything the five ALTER agents need, in one file. Attach this to each claude.ai Project's",
    "knowledge instead of the individual files. Regenerate and re-upload at the Sunday close —",
    "**not** at random moments during the week.",
    "",
    "**The two cut lists in here are binding.** An agent that has not read them cannot refuse",
    "anything, and an agent that cannot refuse is a tone rather than an agent.",
    "",
    "---",
    "",
]
for rel, why in FILES:
    p = root / rel
    if not p.exists():
        out += [f"## ⚠️ MISSING: `{rel}`", "", f"_{why}_", "", "---", ""]
        continue
    out += [f"# ════ FILE: `{rel}` ════", "", f"> {why}", "", p.read_text().rstrip(), "", "---", ""]

(root / "AGENT-PACK.md").write_text("\n".join(out) + "\n")
print(f"AGENT-PACK.md written — {len(FILES)} files, commit {sha}")
