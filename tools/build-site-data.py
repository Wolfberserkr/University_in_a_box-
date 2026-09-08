#!/usr/bin/env python3
"""Generate site/src/data/curriculum.json from the repository's Markdown.

The repo is the single source of truth. This script reads it and emits one JSON
file the site renders; nothing in site/src/ transcribes curriculum by hand.

Run:  python3 tools/build-site-data.py
      (npm run data, and automatically before npm run build)

Sources read
    REGISTRAR.md      student, calendar, enrolment, transcript, standing rules
    DEGREE.md         credit accounting, levels, awards, the four honest gaps
    CATALOG.md        subject index, enrolment plan, candidate subjects
    ASSESSMENT.md     the locked standard, Parts A-D
    START-HERE.md     setup steps, week-1 plan, weekly rhythm, the enders
    catalog/*.md      course definitions, the major statement, the source stack
    enrolled/*.md     live per-course state, five agent sections each
    .claude/agents/   the five ALTER system prompts
    logs/             presence only - contents stay out of the site

Personal work (Priors Sheet, intake answers, weekly outputs) is deliberately
NOT read into the site. logs/ is reported as a count and a status, never a body.
"""

import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "site" / "src" / "data" / "curriculum.json"

COURSE_FILE = re.compile(r"^[A-Z]{3}-\d{3}\.md$")


# --------------------------------------------------------------------------
# Markdown helpers
# --------------------------------------------------------------------------

def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


def strip_fences(lines):
    """Yield (line, in_fence) so headings inside code fences are ignored."""
    fence = False
    for line in lines:
        if line.lstrip().startswith("```"):
            fence = not fence
            yield line, True
            continue
        yield line, fence


def split_sections(md, level=2):
    """Split markdown on headings of `level`. Returns [(title, body), ...].

    Text before the first heading is returned under the key "".
    """
    marker = "#" * level + " "
    out, title, buf = [], "", []
    for line, in_fence in strip_fences(md.splitlines()):
        if not in_fence and line.startswith(marker):
            out.append((title, "\n".join(buf).strip()))
            title, buf = line[len(marker):].strip(), []
        else:
            buf.append(line)
    out.append((title, "\n".join(buf).strip()))
    return out


def section_map(md, level=2):
    return {t: b for t, b in split_sections(md, level)}


def find_section(md, needle, level=2):
    """Body of the first section whose title contains `needle` (case-folded)."""
    n = needle.casefold()
    for title, body in split_sections(md, level):
        if n in title.casefold():
            return body
    return ""


def split_cells(row):
    """Cells of a pipe-table row, honouring the `\\|` escape.

    The site writes rows back into these tables and escapes any pipe inside a
    cell, so the parser has to read its own output correctly: splitting on every
    `|` turns one escaped cell into two and shifts the whole row, which then
    fails to match the state that produced it and gets offered for writing again
    on every close, forever.
    """
    row = row.strip()
    if row.startswith("|"):
        row = row[1:]
    if row.endswith("|") and not row.endswith("\\|"):
        row = row[:-1]
    return [c.strip().replace("\\|", "|") for c in re.split(r"(?<!\\)\|", row)]


def is_divider(row):
    return bool(re.fullmatch(r"[\s|:-]+", row.strip())) and "-" in row


def parse_tables(md):
    """Every pipe table in `md`, as {'headers': [...], 'rows': [{header: cell}]}."""
    tables, block = [], []
    for line, in_fence in strip_fences(md.splitlines()):
        if not in_fence and line.strip().startswith("|"):
            block.append(line)
            continue
        if block:
            tables.append(block)
            block = []
    if block:
        tables.append(block)

    out = []
    for block in tables:
        if len(block) < 2 or not is_divider(block[1]):
            continue
        headers = split_cells(block[0])
        rows = []
        for line in block[2:]:
            cells = split_cells(line)
            cells += [""] * (len(headers) - len(cells))
            row = dict(zip(headers, cells[: len(headers)]))
            if any(v for v in row.values()):
                row["_raw"] = line.rstrip()
                rows.append(row)
        out.append({"headers": headers, "rows": rows})
    return out


def first_table(md):
    t = parse_tables(md)
    return t[0]["rows"] if t else []


def first_table_header(md):
    """The header line of the first pipe table, verbatim.

    The write-back appends rows under this line, so it has to be the file's
    own text rather than a copy typed into the site.
    """
    for line, in_fence in strip_fences(md.splitlines()):
        if not in_fence and line.strip().startswith("|"):
            return line.rstrip()
    return ""


def placeholder_row(md):
    """An empty `| — | | | |` row, if the table has one and nothing else.

    Appending under it would leave a dash row above real data, so the patch
    replaces it with the first real row instead.
    """
    rows = []
    started = False
    for line, in_fence in strip_fences(md.splitlines()):
        if in_fence:
            continue
        if line.strip().startswith("|"):
            rows.append(line.rstrip())
            started = True
        elif started:
            break
    body = rows[2:] if len(rows) > 2 else []
    if len(body) == 1 and not plain(body[0]).replace("|", "").replace("—", "").strip():
        # Header + divider + the placeholder, verbatim and in order. The three
        # together are unique in the file; the placeholder alone is not - §C's
        # `| — | | | | |` is a substring of §D's `| — | | | | | |`, so a
        # find-and-replace on the short one silently edits the wrong table.
        return "\n".join(rows[:2] + body)
    return ""


def raw_line(md, prefix):
    """The whole line that starts with `prefix`, so an edit replaces a line."""
    for line in md.splitlines():
        if line.startswith(prefix):
            return line.rstrip()
    return ""


def drop_tables(md):
    """The prose of a section, with its pipe tables removed."""
    keep = []
    for line, in_fence in strip_fences(md.splitlines()):
        if not in_fence and (line.strip().startswith("|") or is_divider(line)):
            continue
        keep.append(line)
    return re.sub(r"\n{3,}", "\n\n", "\n".join(keep)).strip()


def plain(md):
    """Inline markdown stripped down to readable text (for aria labels, sorting)."""
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", md)
    s = re.sub(r"[`*_]", "", s)
    return s.strip()


def tag_of(text):
    m = re.search(r"\[([VRH])\]", text)
    return m.group(1) if m else None


def links_in(md):
    return [{"label": m.group(1), "href": m.group(2)}
            for m in re.finditer(r"\[([^\]]+)\]\((https?://[^)]+)\)", md)]


def bare_urls(md):
    """DOI / PubMed / journal identifiers turned into resolvable links."""
    out = []
    for m in re.finditer(r"doi:(10\.\S+?)(?=[\s,;)]|$)", md):
        doi = m.group(1).rstrip(".,;")
        out.append({"label": "doi:" + doi, "href": "https://doi.org/" + doi})
    for m in re.finditer(r"(?:PMID|PubMed)\s+(\d{6,9})", md):
        out.append({"label": "PubMed " + m.group(1),
                    "href": "https://pubmed.ncbi.nlm.nih.gov/%s/" % m.group(1)})
    for m in re.finditer(r"ISBN\s+([\d-]{10,20})", md):
        isbn = m.group(1).rstrip("-")
        out.append({"label": "ISBN " + isbn,
                    "href": "https://openlibrary.org/isbn/%s" % isbn.replace("-", "")})
    seen, uniq = set(), []
    for l in out:
        if l["href"] not in seen:
            seen.add(l["href"])
            uniq.append(l)
    return uniq


# --------------------------------------------------------------------------
# REGISTRAR.md
# --------------------------------------------------------------------------

def parse_registrar():
    md = read("REGISTRAR.md")

    student = find_section(md, "Student")
    m = re.search(r"\*\*(.+?)\*\* · Program start \*\*([\d-]+)\*\*", student)
    name = m.group(1) if m else "Student"
    start = m.group(2) if m else ""
    award = re.search(r"Award target: \*\*(.+?)\*\*", student)
    capacity = re.search(r"\*\*Capacity:\*\* (.+)", student)
    # "9-12 h/week at a bad week" - the feasibility argument the whole calendar
    # rests on, and the reference band the hours chart is drawn against
    band = re.search(r"(\d+)\s*[–-]\s*(\d+)\s*h/week", capacity.group(1) if capacity else "")

    intake = []
    for t in parse_tables(find_section(md, "Student")):
        if "Question" in t["headers"]:
            for r in t["rows"]:
                intake.append({
                    "id": r.get("", "").strip(),
                    "question": r.get("Question", ""),
                    # answers are personal work: recorded as answered / declined only
                    "answered": bool(plain(r.get("Answer", "")))
                                and "declined" not in r.get("Answer", "").casefold(),
                    "declined": "declined" in r.get("Answer", "").casefold(),
                    "effect": r.get("Effect", ""),
                })

    cal = find_section(md, "Calendar")
    terms = []
    prev = None  # last resolved date, so a bare MM-DD can take a year from it
    for r in first_table(cal):
        label = plain(r.get("", ""))
        if not label:
            continue
        dates = r.get("Dates", "")
        resolved = []
        # The calendar writes the break rows as `12-14 → 2027-01-03` and
        # `04-12 → 04-18`: a bare MM-DD means the year the sequence is in.
        for m in re.finditer(r"\b(\d{4})-(\d{2})-(\d{2})\b|\b(\d{2})-(\d{2})\b", dates):
            if m.group(1):
                iso = "%s-%s-%s" % (m.group(1), m.group(2), m.group(3))
            elif prev:
                y = int(prev[:4])
                iso = "%d-%s-%s" % (y, m.group(4), m.group(5))
                if iso < prev:                       # wrapped into the next year
                    iso = "%d-%s-%s" % (y + 1, m.group(4), m.group(5))
            else:
                continue
            resolved.append(iso)
            prev = iso
        terms.append({
            "label": label,
            "weeks": r.get("Weeks", ""),
            "dates": dates,
            "start": resolved[0] if resolved else "",
            "end": resolved[-1] if resolved else "",
            "enrolled": [c for c in re.findall(r"[A-Z]{3}-\d{3}", r.get("Enrolled", ""))],
            "isTerm": label.lower().startswith(("term", "capstone")),
        })

    enrolment = []
    for r in first_table(find_section(md, "Enrolment")):
        code = re.search(r"[A-Z]{3}-\d{3}", r.get("Course", ""))
        if not code:
            continue
        wk = re.search(r"(\d+) of (\d+)", r.get("Week", ""))
        enrolment.append({
            "code": code.group(0),
            "level": r.get("Level", ""),
            "term": r.get("Term", ""),
            "week": int(wk.group(1)) if wk else 1,
            "weeks": int(wk.group(2)) if wk else 14,
            "status": plain(r.get("Status", "")),
            "raw": r.get("_raw", ""),
        })

    transcript = []
    for r in first_table(find_section(md, "Transcript")):
        if not re.match(r"[A-Z]{3}-\d{3}", r.get("Course", "")):
            continue
        transcript.append({
            "code": r.get("Course", ""),
            "title": r.get("Title", ""),
            "level": r.get("Lvl", ""),
            "credits": r.get("Cr", ""),
            "term": r.get("Term", ""),
            "passRate": r.get("Weekly pass rate", ""),
            "paper": r.get("Paper", ""),
            "result": plain(r.get("Result", "")),
            "raw": r.get("_raw", ""),
        })

    tr = find_section(md, "Transcript")
    credits = re.search(r"\*\*Credits earned:\*\*\s*(\d+)\s*/\s*(\d+)", tr)
    courses_done = re.search(r"\*\*Courses complete:\*\*\s*(\d+)\s*/\s*(\d+)", tr)
    cert = re.search(r"Certificate needs (\d+)", tr)

    rules = find_section(md, "Standing rules")
    slipped = re.search(r"\*\*Slipped weeks:\*\*\s*(\d+)", rules)

    # "Agents stood up ...: Advisor ✓ · Librarian ✓ ... · Tutor — due before ..."
    agent_names = ["Advisor", "Librarian", "Tutor", "Editor", "Roommate"]
    stood_up = [a for a in agent_names
                if re.search(r"%s[^·\n]{0,40}✓" % a, rules)]
    access = raw_line(rules, "**Access check owed")
    access_term = re.search(r"owed:\*\*\s*([^.(]+)", access)
    access_date = re.search(r"(\d{4}-\d{2}-\d{2})", access)

    return {
        "student": name,
        "programStart": start,
        "award": award.group(1) if award else "",
        "capacity": capacity.group(1).strip() if capacity else "",
        "capacityBand": ({"low": int(band.group(1)), "high": int(band.group(2)),
                          "unit": "h/week"} if band else None),
        "intake": intake,
        "terms": terms,
        "calendarNote": drop_tables(cal),
        "enrolment": enrolment,
        "transcript": transcript,
        "transcriptNote": drop_tables(tr),
        "credits": {
            "earned": int(credits.group(1)) if credits else 0,
            "total": int(credits.group(2)) if credits else 0,
            "coursesComplete": int(courses_done.group(1)) if courses_done else 0,
            "coursesPlanned": int(courses_done.group(2)) if courses_done else 0,
            "certificateNeeds": int(cert.group(1)) if cert else 6,
            "perCourse": next((int(t["credits"]) for t in transcript
                               if t["credits"].isdigit()), 3),
            "raw": raw_line(tr, "**Credits earned:**"),
        },
        "slippedRecorded": int(slipped.group(1)) if slipped else 0,
        "slippedRaw": raw_line(rules, "**Slipped weeks:**"),
        "rulesMd": rules,
        "agents": {"stoodUp": stood_up, "total": len(agent_names), "names": agent_names},
        "accessCheck": {
            "raw": access,
            "term": plain(access_term.group(1)).strip() if access_term else "",
            "date": access_date.group(1) if access_date else "",
            "why": plain(access.split(". ", 1)[1]) if ". " in access else "",
        },
    }


# --------------------------------------------------------------------------
# enrolled/<CODE>.md — the five agent sections
# --------------------------------------------------------------------------

def expand_range(label):
    """'8–13' -> [8..13]; '1' -> [1]."""
    label = plain(label).replace("–", "-").replace("—", "-")
    m = re.fullmatch(r"(\d+)\s*-\s*(\d+)", label)
    if m:
        return list(range(int(m.group(1)), int(m.group(2)) + 1))
    m = re.fullmatch(r"(\d+)", label)
    return [int(m.group(1))] if m else []


def parse_enrolled(code):
    md = read("enrolled/%s.md" % code)
    board_md = find_section(md, "WEEK BOARD")
    ledger_md = find_section(md, "SOURCE LEDGER")
    gaps_md = find_section(md, "GAP LOG")
    verdict_md = find_section(md, "VERDICT LOG")
    cross_md = find_section(md, "CROSS-DOMAIN")

    rows = []
    for r in first_table(board_md):
        weeks = expand_range(r.get("Wk", ""))
        if not weeks:
            continue
        rows.append({
            "weeks": weeks,
            "label": plain(r.get("Wk", "")),
            "dates": r.get("Dates", ""),
            "milestone": r.get("Milestone", ""),
            "source": r.get("Primary source", ""),
            # every tag in the cell, in order - a row can cite two sources with
            # two different tags, and the first is not the row's tag
            "sourceTags": re.findall(r"\[([VRH])\]", r.get("Primary source", "")),
            "output": r.get("Output", ""),
            "midterm": "MIDTERM" in r.get("Milestone", "").upper(),
            "paper": "term paper" in plain(r.get("Milestone", "")).casefold()
                     or "2,000w" in r.get("Output", ""),
            "deferred": "see course file" in r.get("Primary source", "").casefold(),
            "raw": r.get("_raw", ""),
        })

    ledger = []
    for r in first_table(ledger_md):
        src = r.get("Source", "")
        if not plain(src):
            continue
        ledger.append({
            "id": "%s-%s" % (code, plain(r.get("#", "")) or plain(src)[:12]),
            "n": plain(r.get("#", "")),
            "source": src,
            "week": plain(r.get("Wk", "")),
            "tag": tag_of(r.get("Tag", "")) or "R",
            "verifiedAgainst": r.get("Verified against", ""),
            "status": r.get("Status", ""),
            "links": bare_urls(src + " " + r.get("Verified against", "")),
            "raw": r.get("_raw", ""),
        })

    slipped = re.search(r"\*\*Slipped:\*\*\s*(\d+)\s*/\s*(\d+)", board_md)

    def week_of(cell):
        m = re.search(r"\d+", plain(cell))
        return int(m.group(0)) if m else None

    # §C / §D / §E as the file already holds them. The site reconciles what it
    # is about to write back against these, so a row already applied is never
    # offered a second time.
    gaps = [{"week": week_of(r.get("Wk", "")),
             "concept": plain(r.get("Concept", "")),
             "gap": plain(r.get("Gap (specific)", "")),
             "status": plain(r.get("Status", "")),
             "closedBy": plain(r.get("Closed by", "")),
             "raw": r.get("_raw", "")}
            for r in first_table(gaps_md) if plain(r.get("Concept", ""))]
    verdicts = [{"week": week_of(r.get("Wk", "")),
                 "artifact": plain(r.get("Artifact", "")),
                 "rubric": plain(r.get("Rubric", "")),
                 "verdict": plain(r.get("Verdict", "")),
                 "rewrite": plain(r.get("Rewrite", "")),
                 "raw": r.get("_raw", "")}
                for r in first_table(verdict_md) if plain(r.get("Artifact", ""))]
    cross = [{"week": week_of(r.get("Wk", "")),
              "domain": plain(r.get("Domain", "")),
              "collidedWith": plain(r.get("Collided with", "")),
              "transfer": plain(r.get("Transfer that survived", "")),
              "raw": r.get("_raw", "")}
             for r in first_table(cross_md) if plain(r.get("Domain", ""))]

    return {
        "code": code,
        "board": rows,
        "boardNote": drop_tables(board_md),
        "slipped": int(slipped.group(1)) if slipped else 0,
        "slipLimit": int(slipped.group(2)) if slipped else 3,
        "slippedRaw": raw_line(board_md, "**Slipped:**"),
        "ledger": ledger,
        "ledgerNote": drop_tables(ledger_md),
        "gaps": gaps,
        "gapsNote": drop_tables(gaps_md),
        "gapsHeader": first_table_header(gaps_md),
        "gapsPlaceholder": placeholder_row(gaps_md),
        "verdicts": verdicts,
        "verdictsNote": drop_tables(verdict_md),
        "verdictsHeader": first_table_header(verdict_md),
        "verdictsPlaceholder": placeholder_row(verdict_md),
        "crossDomain": cross,
        "crossNote": drop_tables(cross_md),
        "crossHeader": first_table_header(cross_md),
        "crossPlaceholder": placeholder_row(cross_md),
    }


# --------------------------------------------------------------------------
# catalog/<CODE>.md
# --------------------------------------------------------------------------

def parse_course(path):
    md = read("catalog/" + path.name)
    head = md.splitlines()
    title_m = re.match(r"#\s*([A-Z]{3}-\d{3})\s*[—-]\s*(.+)", head[0])
    code, title = title_m.group(1), title_m.group(2).strip()

    meta = "\n".join(head[1:6])
    def field(name):
        m = re.search(r"\*\*%s:\*\*\s*([^·\n]+)" % name, meta)
        return m.group(1).strip() if m else ""

    seq_md = find_section(md, "Sequence")
    sequence = []
    for r in first_table(seq_md):
        wk = expand_range(r.get("Wk", ""))
        if not wk:
            continue
        sequence.append({
            "weeks": wk,
            "label": plain(r.get("Wk", "")),
            "milestone": r.get("Milestone", ""),
            "source": r.get("Primary source", ""),
            "sourceTags": re.findall(r"\[([VRH])\]", r.get("Primary source", "")),
            "unblocks": r.get("Unblocks", ""),
        })

    cut = [{"cut": r.get("Cut", ""), "reason": r.get("Reason", "")}
           for r in first_table(find_section(md, "Cut list"))]

    sources = []
    for r in first_table(find_section(md, "5. Sources")):
        src = r.get("Source", "")
        if not plain(src):
            continue
        sources.append({
            "source": src,
            "tag": tag_of(r.get("Tag", "")) or "R",
            "verifiedAgainst": r.get("Verified against", ""),
            "links": bare_urls(src + " " + r.get("Verified against", "")),
        })

    sections = []
    for stitle, body in split_sections(md):
        if not stitle:
            continue
        sections.append({"title": re.sub(r"^\d+\.\s*", "", stitle), "md": body})

    return {
        "code": code,
        "subject": code[:3],
        "title": title,
        "level": field("Level"),
        "credits": field("Credits"),
        "weeks": field("Weeks"),
        "load": field("Load"),
        "prerequisite": field("Prerequisite"),
        "unblocks": field("Unblocks"),
        "question": find_section(md, "Question"),
        "whyLevel": find_section(md, "Why "),
        "sequence": sequence,
        "sequenceNote": drop_tables(seq_md),
        "cutList": cut,
        "cutNote": drop_tables(find_section(md, "Cut list")),
        "sources": sources,
        "sourcesNote": drop_tables(find_section(md, "5. Sources")),
        "assessment": find_section(md, "Assessment"),
        "sections": sections,
        "headerNote": "\n".join(head[4:]).split("---")[0].strip(),
    }


# --------------------------------------------------------------------------
# CATALOG.md / DEGREE.md / ASSESSMENT.md
# --------------------------------------------------------------------------

def parse_catalog():
    md = read("CATALOG.md")
    subjects = []
    for title, body in split_sections(md):
        m = re.match(r"(.+?)\s*[—-]\s*([A-Z]{3})$", title.strip())
        if not m:
            continue
        codes = []
        for r in first_table(body):
            c = re.search(r"[A-Z]{3}-\d{3}", r.get("Code", ""))
            if c:
                codes.append(c.group(0))
        subjects.append({
            "name": m.group(1).strip(),
            "prefix": m.group(2),
            "codes": codes,
            "note": drop_tables(body),
        })

    enrol_md = find_section(md, "Enrolment")
    plan = []
    for r in first_table(enrol_md):
        plan.append({
            "term": plain(r.get("Term", "")),
            "slot1": r.get("Slot 1", ""),
            "slot2": r.get("Slot 2", ""),
        })

    future = []
    tabs = parse_tables(enrol_md)
    if len(tabs) > 1:
        for r in tabs[1]["rows"]:
            future.append({
                "subject": r.get("Subject", ""),
                "opensWith": r.get("Would open with", ""),
                "why": r.get("Why it pairs", ""),
            })

    return {
        "intro": split_sections(md)[0][1],
        "subjects": subjects,
        "plan": plan,
        "planNote": drop_tables(enrol_md),
        "future": future,
        "adding": find_section(md, "Adding a subject"),
    }


def parse_degree():
    md = read("DEGREE.md")
    levels = [{"level": r.get("Level", ""),
               "relationship": r.get("The student's relationship to the material", ""),
               "assessment": r.get("Assessment", "")}
              for r in first_table(find_section(md, "Levels"))]
    awards = [{"award": r.get("Award", ""), "courses": r.get("Courses", ""),
               "time": r.get("Time at 6/yr", ""), "requires": r.get("Requires", "")}
              for r in first_table(find_section(md, "Awards"))]
    overhead = [{"hour": r.get("University hour", ""), "paid": r.get("Do you pay it?", "")}
                for r in first_table(find_section(md, "Credit accounting"))]
    gaps_md = find_section(md, "honest gaps")
    gaps = []
    for m in re.finditer(r"^\d+\.\s+\*\*(.+?)\*\*\s*(.*)$", gaps_md, re.M):
        gaps.append({"title": m.group(1).rstrip(". "), "body": m.group(2).strip()})
    return {
        "creditMd": drop_tables(find_section(md, "Credit accounting")),
        "overhead": overhead,
        "levels": levels,
        "levelsNote": drop_tables(find_section(md, "Levels")),
        "awards": awards,
        "awardsNote": drop_tables(find_section(md, "Awards")),
        "gaps": gaps,
        "gapsIntro": gaps_md.split("1.")[0].strip(),
    }


def parse_assessment():
    md = read("ASSESSMENT.md")

    def criteria(needle):
        out = []
        for r in first_table(find_section(md, needle)):
            cid = plain(r.get("#", ""))
            if not cid:
                continue
            out.append({"id": cid,
                        "criterion": r.get("Criterion", ""),
                        "failsIf": r.get("Fails if", "")})
        return out

    scaling = [{"level": r.get("Level", ""),
                "weekly": r.get("Weekly (Part A)", ""),
                "midterm": r.get("Midterm, wk 7", ""),
                "paper": r.get("Term paper, wk 14", ""),
                "extra": r.get("Extra criteria", "")}
               for r in first_table(find_section(md, "Level scaling"))]

    partD = []
    dmd = find_section(md, "Part D")
    for m in re.finditer(r"^(\d+)\.\s+(.+)$", dmd, re.M):
        partD.append({"n": m.group(1), "q": m.group(2).strip()})

    return {
        "intro": split_sections(md)[0][1],
        "scaling": scaling,
        "scalingNote": drop_tables(find_section(md, "Level scaling")),
        "partA": criteria("Part A"),
        "partANote": drop_tables(find_section(md, "Part A")),
        "partB": criteria("Part B"),
        "partBNote": drop_tables(find_section(md, "Part B")),
        "partC": find_section(md, "Part C"),
        "partD": partD,
        "partDNote": dmd.split("1.")[0].strip(),
    }


# --------------------------------------------------------------------------
# START-HERE.md
# --------------------------------------------------------------------------

def parse_start_here():
    md = read("START-HERE.md")
    parts = section_map(md, level=1)

    setup_md = next((b for t, b in split_sections(md, 1) if t.startswith("Part 1")), "")
    setup = []
    for title, body in split_sections(setup_md, 2):
        m = re.match(r"(\d+)\.\s*(.+)", title)
        if not m:
            continue
        label = m.group(2)
        bits = [b.strip() for b in label.split("·")]
        setup.append({
            "n": int(m.group(1)),
            "title": bits[0],
            "time": next((b for b in bits[1:] if re.search(r"\d+\s*min", b)), ""),
            "note": " · ".join(bits[1:]),
            "md": body,
            "done": "**Already done" in body,
            # the sentence the file uses to say so, so the site quotes the repo
            # rather than inventing its own evidence line
            "doneNote": next((plain(l.split(".")[0]) for l in body.splitlines()
                              if "**Already done" in l), ""),
            # how many things the step's own table asks for (step 3 lists four
            # free sources); the site counts [H] rows against it
            "tableRows": len(first_table(body)),
        })

    wk1_md = next((b for t, b in split_sections(md, 1) if t.startswith("Part 2")), "")
    week1 = [{"day": plain(r.get("Day", "")), "do": r.get("Do", ""), "time": r.get("Time", "")}
             for r in first_table(wk1_md)]

    rhythm_md = next((b for t, b in split_sections(md, 1) if t.startswith("Part 3")), "")
    rhythm = []
    for line in rhythm_md.splitlines():
        m = re.match(r"^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s{2,}(.+)$", line.strip())
        if m:
            rhythm.append({"day": m.group(1), "do": m.group(2).strip()})

    enders_md = next((b for t, b in split_sections(md, 1) if t.startswith("Part 4")), "")
    enders = []
    for block in re.split(r"\n\s*\n", enders_md):
        m = re.match(r"\*\*(\d+)\.\s*(.+?)\*\*\s*(.*)", block.strip(), re.S)
        if m:
            enders.append({"n": int(m.group(1)),
                           "title": m.group(2).rstrip(". "),
                           "body": m.group(3).strip()})

    owed_md = next((b for t, b in split_sections(md, 1) if "Owed later" in t), "")
    owed = []
    for block in re.split(r"\n\s*\n", owed_md):
        m = re.match(r"\*\*(.+?)\*\*\s*[—-]*\s*(.*)", block.strip(), re.S)
        if m:
            owed.append({"title": m.group(1).strip(), "body": m.group(2).strip()})

    return {
        "intro": split_sections(md, 1)[0][1],
        "setup": setup,
        "setupIntro": split_sections(setup_md, 2)[0][1],
        "week1": week1,
        "week1Note": drop_tables(wk1_md),
        "rhythm": rhythm,
        "enders": enders,
        "endersIntro": enders_md.split("**1.")[0].strip(),
        "owed": owed,
    }


# --------------------------------------------------------------------------
# catalog/PSY-sources.md, catalog/PSY-major.md, .claude/agents/
# --------------------------------------------------------------------------

def parse_source_stack():
    md = read("catalog/PSY-sources.md")
    tagKey = [{"tag": tag_of(r.get("Tag", "")) or "", "means": r.get("Means", ""),
               "trust": r.get("Trust", "")}
              for r in first_table(find_section(md, "Tag key"))]

    groups = []
    for title, body in split_sections(md):
        if not title.startswith("TERM"):
            continue
        items = []
        for sub_t, sub_b in split_sections(body, 3):
            for m in re.finditer(r"^(\d+)\.\s+`\[([VRH])\]`\s+(.+?)(?=^\d+\.\s+`\[|\Z)",
                                 sub_b, re.M | re.S):
                text = re.sub(r"\s+", " ", m.group(3)).strip()
                items.append({
                    "n": int(m.group(1)),
                    "tag": m.group(2),
                    "text": text,
                    "shelf": sub_t or "",
                    "links": bare_urls(text) + links_in(text),
                })
        groups.append({
            "title": title,
            "intro": re.split(r"^\d+\.\s+`\[", body, maxsplit=1, flags=re.M)[0].strip()[:600],
            "items": sorted(items, key=lambda i: i["n"]),
        })

    queue_md = find_section(md, "Roommate's queue")
    queue = []
    for line in queue_md.splitlines():
        if "·" in line:
            queue = [q.strip() for q in line.split("·") if q.strip()]
            break

    return {
        "tagKey": tagKey,
        "groups": groups,
        "roommateQueue": queue,
        "roommateNote": queue_md.split("\n\n")[0].strip() if queue_md else "",
        "acquisition": find_section(md, "Acquisition order"),
    }


def parse_major():
    md = read("catalog/PSY-major.md")
    return {
        "title": md.splitlines()[0].lstrip("# ").strip(),
        "sections": [{"title": t, "md": b}
                     for t, b in split_sections(md) if t],
    }


def parse_agents():
    letters = {"advisor": "A", "librarian": "L", "tutor": "T",
               "editor": "E", "roommate": "R"}
    owns = {
        "advisor": "§A Week Board · plus catalog and calendar",
        "librarian": "§B Source Ledger",
        "tutor": "§C Gap Log · runs the week-7 midterm",
        "editor": "§D Verdict Log",
        "roommate": "§E Cross-Domain Ledger",
    }
    readme = read("README.md")
    refuses = {}
    for r in first_table(find_section(readme, "Faculty and institution")):
        key = plain(r.get("Agent", "")).casefold()
        key = re.sub(r"[^a-z]", "", key)
        refuses[key] = r.get("Refuses to", "")

    out = []
    for name in ["advisor", "librarian", "tutor", "editor", "roommate"]:
        raw = read(".claude/agents/%s.md" % name)
        fm = re.match(r"^---\n(.*?)\n---\n(.*)$", raw, re.S)
        front, body = (fm.group(1), fm.group(2).strip()) if fm else ("", raw)
        desc = re.search(r"^description:\s*(.+)$", front, re.M)
        tools = re.search(r"^tools:\s*(.+)$", front, re.M)
        summary = re.sub(r"\s+", " ", body.split("\n\n")[0])
        out.append({
            "name": name,
            "letter": letters[name],
            "title": name.capitalize(),
            "description": desc.group(1).strip() if desc else "",
            "tools": [t.strip() for t in tools.group(1).split(",")] if tools else [],
            "owns": owns[name],
            "refuses": refuses.get(name, ""),
            "summary": plain(summary),
            "prompt": body,
            "path": ".claude/agents/%s.md" % name,
        })
    return out


# --------------------------------------------------------------------------
# Week model — Term A, both courses merged week by week
# --------------------------------------------------------------------------

def build_weeks(registrar, enrolled, courses):
    term = next((t for t in registrar["terms"] if t["label"].startswith("Term A")), None)
    if not term:
        raise SystemExit("REGISTRAR.md: no Term A row found in the calendar table")
    start = datetime.strptime(term["start"], "%Y-%m-%d").date()
    n_weeks = 14

    by_course = {}
    for code, state in enrolled.items():
        course = courses[code]
        rows = {}
        for row in state["board"]:
            for w in row["weeks"]:
                rows[w] = dict(row, spanLabel=row["label"] if len(row["weeks"]) > 1 else "")
        # weeks the board defers to the course file get their detail from catalog/
        for row in course["sequence"]:
            for w in row["weeks"]:
                if w in rows and rows[w]["deferred"]:
                    rows[w] = dict(rows[w],
                                   milestone=row["milestone"],
                                   source=row["source"],
                                   sourceTags=row["sourceTags"],
                                   unblocks=row.get("unblocks", ""),
                                   fromCourseFile=True)
                elif w in rows:
                    rows[w] = dict(rows[w], unblocks=row.get("unblocks", ""))
        by_course[code] = rows

    weeks = []
    for w in range(1, n_weeks + 1):
        mon = start.toordinal() + (w - 1) * 7
        monday = datetime.fromordinal(mon).date()
        sunday = datetime.fromordinal(mon + 6).date()
        entries = []
        for code in sorted(by_course):
            row = by_course[code].get(w)
            if not row:
                continue
            entries.append({
                "code": code,
                "milestone": row["milestone"],
                "source": row["source"],
                "sourceTags": row["sourceTags"],
                "output": row["output"],
                "unblocks": row.get("unblocks", ""),
                "fromCourseFile": row.get("fromCourseFile", False),
            })
        weeks.append({
            "n": w,
            "start": monday.isoformat(),
            "end": sunday.isoformat(),
            "midterm": any("MIDTERM" in e["milestone"].upper() for e in entries),
            "paper": w == n_weeks,
            "roommate": w % 2 == 0,
            "entries": entries,
        })
    return {"term": term, "weeks": weeks}


# --------------------------------------------------------------------------

def source_stamp():
    """When the curriculum last changed - not when this script last ran.

    A wall-clock timestamp here rehashes the bundle on every build, so a rebuild
    with no content change shows up as a diff. Ask git when the source files were
    last committed instead, so the output is a function of its inputs. Falls back
    to file mtimes outside a git checkout.
    """
    paths = ["REGISTRAR.md", "DEGREE.md", "CATALOG.md", "ASSESSMENT.md",
             "START-HERE.md", "README.md", "catalog", "enrolled", ".claude/agents"]
    try:
        out = subprocess.run(
            ["git", "-C", str(ROOT), "log", "-1", "--format=%cI", "--"] + paths,
            capture_output=True, text=True, timeout=10, check=True).stdout.strip()
        if out:
            return datetime.fromisoformat(out).astimezone(timezone.utc) \
                           .strftime("%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        pass
    newest = max(f.stat().st_mtime
                 for p in paths
                 for f in ([ROOT / p] if (ROOT / p).is_file() else (ROOT / p).glob("*.md")))
    return datetime.fromtimestamp(newest, timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def main():
    registrar = parse_registrar()

    courses = {}
    for p in sorted((ROOT / "catalog").glob("*.md")):
        if COURSE_FILE.match(p.name):
            c = parse_course(p)
            courses[c["code"]] = c

    enrolled = {}
    for p in sorted((ROOT / "enrolled").glob("*.md")):
        code = p.stem
        if code in courses:
            enrolled[code] = parse_enrolled(code)

    for code in courses:
        courses[code]["enrolled"] = code in enrolled

    termA = build_weeks(registrar, enrolled, courses)

    logs = sorted(p.relative_to(ROOT).as_posix()
                  for p in (ROOT / "logs").rglob("week-*.md"))

    data = {
        "generated": source_stamp(),
        "registrar": registrar,
        "courses": [courses[c] for c in sorted(courses)],
        "enrolled": enrolled,
        "termA": termA,
        "catalog": parse_catalog(),
        "degree": parse_degree(),
        "assessment": parse_assessment(),
        "startHere": parse_start_here(),
        "sourceStack": parse_source_stack(),
        "major": parse_major(),
        "agents": parse_agents(),
        "logs": {"files": logs, "count": len(logs)},
        # The exact text of every file the write-back edits. The site's patch
        # audit applies its own edits to these in memory and asserts each find
        # matches exactly once before and zero times after - a claim it cannot
        # make by comparing edits against each other, which is how a duplicated
        # gap row and an injected line both passed a clean audit.
        "patchTargets": {
            path: read(path)
            for path in ["REGISTRAR.md"] + ["enrolled/%s.md" % c for c in sorted(enrolled)]
        },
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")

    counts = {
        "courses": len(courses),
        "enrolled": len(enrolled),
        "termA weeks": len(termA["weeks"]),
        "ledger rows": sum(len(e["ledger"]) for e in enrolled.values()),
        "stack items": sum(len(g["items"]) for g in data["sourceStack"]["groups"]),
        "agents": len(data["agents"]),
        "setup steps": len(data["startHere"]["setup"]),
    }
    print("wrote %s" % OUT.relative_to(ROOT))
    for k, v in counts.items():
        print("  %-14s %s" % (k, v))
    if not all(counts.values()):
        print("ERROR: a parser returned nothing", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
