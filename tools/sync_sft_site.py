#!/usr/bin/env python3
"""Build the public Ernos Labs projection of the evolving SFT repository.

The SFT repository remains the scientific authority.  This tool only reads its
published catalogues, censuses and claim packages, validates their public
relationships, and emits a static website snapshot with source provenance.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import shutil
import subprocess
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SFT_ROOT = Path.home() / "Desktop" / "Smithian Fold Theory Of Everything"
DATA_DIR = ROOT / "assets" / "data" / "sft"
PUBLICATION_DIR = ROOT / "content" / "publications"
EDUCATION_DIR = ROOT / "content" / "education"

EDUCATION_STAGES = {
    "early_years": ("Early Years / Foundation", "Shared reading, noticing, sorting, building and honest checking."),
    "ages_5_7": ("Ages 5–7", "A first primary route through exact parts, patterns, records and simple machines."),
    "ages_7_11": ("Ages 7–11", "Illustrated explanations, worked examples, practical activities and cumulative review."),
    "ages_11_14": ("Ages 11–14", "Branch primers that introduce derivation, evidence, dependencies and open boundaries."),
    "gcse_age": ("GCSE-age · roughly 14–16", "Structured derivation, practical checks and evidence questions. GCSE-style, not an accredited qualification."),
    "post_16": ("Post-16 · roughly 16–18", "Proof, modelling, receipts, uncertainty and extended investigation."),
    "undergraduate": ("Undergraduate introduction", "Repository-facing reconstruction, independent certificates and critical audit."),
    "advanced": ("Advanced study", "Living handbooks for lawful extension, certification and frontier investigation."),
}

EDUCATION_PROGRAMME_DOCUMENTS = (
    ("README.md", "education-overview", "Open Education Library", "How the education library relates to the scientific model and its current knowledge boundary."),
    ("SFT_MASTER_SYLLABUS.md", "master-syllabus", "Master syllabus", "The complete learning progression from Early Years through advanced independent reconstruction."),
    ("SFT_EDUCATIONAL_CHARTER.md", "educational-charter", "Educational charter", "Authority, provenance, accessibility, safety, licensing and release rules for every educational work."),
    ("CURRENT_KNOWLEDGE_BRANCH_MAP.md", "knowledge-branch-map", "Current knowledge branch map", "The dated teaching boundary for every scientific branch, including what is complete, bounded or still open."),
    ("VERSIONING_AND_RELEASES.md", "education-versioning", "Versioning and releases", "How live, review, superseded and withdrawn educational editions are identified and preserved."),
)

BRANCHES = (
    "methods",
    "foundation",
    "mathematics",
    "information_science",
    "computation",
    "quantum_computation",
    "physics",
    "chemistry",
    "materials",
    "biology",
    "medicine",
    "consciousness_cognitive_science",
    "earth_environment",
    "astronomy_cosmology",
    "social_collective_systems",
    "engineering_translation",
)

BRANCH_LABELS = {
    "methods": "Methods and platform",
    "foundation": "Foundation",
    "mathematics": "Mathematics",
    "information_science": "Information science",
    "computation": "Classical computation",
    "quantum_computation": "Quantum computation",
    "physics": "Physics",
    "chemistry": "Chemistry",
    "materials": "Materials science",
    "biology": "Biology and life sciences",
    "medicine": "Medicine and health sciences",
    "consciousness_cognitive_science": "Consciousness and cognitive science",
    "earth_environment": "Earth and environmental sciences",
    "astronomy_cosmology": "Astronomy and cosmology",
    "social_collective_systems": "Social and collective sciences",
    "social_collective": "Social and collective sciences · foundational set",
    "engineering_translation": "Engineering translation",
    "cross_branch_synthesis": "Cross-branch synthesis",
}

SHORT_TITLES = {
    "methods": "There Is No Nothing",
    "foundation": "From Nothing to Fold",
    "mathematics": "From Fold to Mathematics",
    "information_science": "From Distinction to Information",
    "computation": "After Turing: The Fold Machine",
    "quantum_computation": "The Quantum Fold Machine",
    "physics": "From Fold to Physics",
    "chemistry": "From Fold to Chemistry",
    "materials": "From Fold to Materials",
    "biology": "From Fold to Life",
    "medicine": "From Fold to Medicine",
    "consciousness_cognitive_science": "From Fold to Consciousness",
    "earth_environment": "From One World to Earth",
    "astronomy_cosmology": "From One Sky to Cosmos",
    "social_collective_systems": "From One Relation to Society",
    "engineering_translation": "From One Law to a Working World",
}

SUMMARIES = {
    "methods": "Introduces the public verification platform: how questions are registered, alternatives are tested, evidence is retained and results remain open to inspection and correction.",
    "foundation": "Presents the starting argument of Smithian Fold Theory and the machine-readable record used to test its stated boundaries.",
    "mathematics": "Develops the mathematical branch of the model and connects each published result to its dependencies, checks and reproducible record.",
    "information_science": "Examines how distinction, record, measurement and information are represented within the model.",
    "computation": "Develops the classical computation branch, including the Fold Machine and its relationship to executable programs and proofs.",
    "quantum_computation": "Extends the computation programme to reversible and quantum processes, with explicit claim and evidence routes.",
    "physics": "Presents the physics branch and its registered comparisons with physical measurements and established observations.",
    "chemistry": "Connects the model to chemical structure, transformation and measurement through registered claim packages and evidence.",
    "materials": "Applies the model to the behaviour, structure and engineering properties of materials.",
    "biology": "Develops the biology and life-sciences branch, from organised chemical systems to living processes.",
    "medicine": "Explores how the biological branch may be translated into questions about health, disease and medical evidence.",
    "consciousness_cognitive_science": "Examines cognition, experience and conscious organisation while preserving the boundary between formal claims and empirical evidence.",
    "earth_environment": "Applies the model to Earth systems, environmental processes and their observational records.",
    "astronomy_cosmology": "Extends the public claim tree to astronomical observations and cosmological structure.",
    "social_collective_systems": "Explores relations, institutions and collective systems as an explicitly scoped branch of the model.",
    "engineering_translation": "Turns the preceding scientific branches toward testable designs, tools and practical engineering work.",
}


class SyncError(RuntimeError):
    pass


def read_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise SyncError(f"Cannot read valid JSON from {path}: {exc}") from exc


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return "sha256:" + digest.hexdigest()


def git(root: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", "-C", str(root), *args],
        check=True,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return result.stdout.strip()


def strip_markdown(value: str) -> str:
    value = re.sub(r"\[([^]]+)]\([^)]+\)", r"\1", value)
    value = value.replace("*", "").replace("`", "")
    return re.sub(r"\s+", " ", value).strip()


def table_cells(line: str) -> list[str]:
    return [cell.strip() for cell in line.strip().strip("|").split("|")]


def newest_catalogue(sft_root: Path) -> Path | None:
    matches = sorted((sft_root / "publication").glob("V3_ZENODO_CATALOGUE_AND_PRE_V3_STATUS_*.md"))
    if not matches:
        return None
    return matches[-1]


def parse_catalogue(path: Path) -> tuple[list[dict[str, Any]], list[dict[str, Any]], str | None]:
    text = path.read_text(encoding="utf-8")
    status_match = re.search(r"^Status date:\s*(.+)$", text, re.MULTILINE)
    status_date = status_match.group(1).strip() if status_match else None
    publications: list[dict[str, Any]] = []
    archive: list[dict[str, Any]] = []
    section = ""
    for line in text.splitlines():
        if line.startswith("## Authoritative V3 paper set"):
            section = "current"
            continue
        if line.startswith("## Pre-V3 paper concepts"):
            section = "archive"
            continue
        if line.startswith("## ") and section:
            section = ""
        if section == "current" and re.match(r"^\|\s*\d{2}\s*\|", line):
            cells = table_cells(line)
            if len(cells) != 4:
                raise SyncError(f"Unexpected current-publication row: {line}")
            order = int(cells[0])
            doi_match = re.search(r"10\.5281/zenodo\.\d+", cells[3])
            if order >= len(BRANCHES) or not doi_match:
                raise SyncError(f"Invalid current-publication row: {line}")
            branch = BRANCHES[order]
            publications.append(
                {
                    "order": order,
                    "branch": branch,
                    "branch_label": BRANCH_LABELS[branch],
                    "short_title": SHORT_TITLES[branch],
                    "title": strip_markdown(cells[1]),
                    "version": cells[2].strip(),
                    "doi": doi_match.group(0),
                    "doi_url": f"https://doi.org/{doi_match.group(0)}",
                    "summary": SUMMARIES[branch],
                }
            )
        elif section == "archive" and line.startswith("| ["):
            cells = table_cells(line)
            if len(cells) != 3:
                raise SyncError(f"Unexpected historical-publication row: {line}")
            doi_match = re.search(r"10\.5281/zenodo\.\d+", cells[0])
            concept_match = re.search(r"\[(\d+)\s+—\s+([^]]+)]", cells[0])
            successors = [
                {"label": strip_markdown(label), "doi": doi}
                for label, doi in re.findall(
                    r"\[([^]]+)]\(https://doi\.org/(10\.5281/zenodo\.\d+)\)", cells[2]
                )
            ]
            if not doi_match:
                raise SyncError(f"Historical row has no DOI: {line}")
            archive.append(
                {
                    "concept_id": concept_match.group(1) if concept_match else doi_match.group(0).rsplit(".", 1)[-1],
                    "title": strip_markdown(concept_match.group(2) if concept_match else cells[0]),
                    "doi": doi_match.group(0),
                    "doi_url": f"https://doi.org/{doi_match.group(0)}",
                    "published_versions": strip_markdown(cells[1]),
                    "successors": successors,
                    "application_rebuild_pending": "application rebuild pending" in cells[2].lower(),
                    "status": "Deprecated and replaced by V3",
                }
            )
    if len(publications) != 16:
        raise SyncError(f"Expected 16 authoritative V3 publications, found {len(publications)}")
    return publications, archive, status_date


def version_token(version: str) -> str:
    parts = [str(int(part)) for part in re.findall(r"\d+", version)]
    while len(parts) > 1 and parts[-1] == "0":
        parts.pop()
    return "V" + "_".join(parts)


def resolve_publication_source(sft_root: Path, publication: dict[str, Any]) -> Path:
    branch = publication["branch"]
    candidates = sorted((sft_root / "publications" / "successors" / branch).glob("*.md"))
    candidates += sorted((sft_root / "publications" / "current" / branch).glob("*.md"))
    token = version_token(publication["version"])
    exact = [path for path in candidates if token in path.stem.upper()]
    if len(exact) == 1:
        return exact[0]
    current = sorted((sft_root / "publications" / "current" / branch).glob("*.md"))
    if len(current) == 1:
        return current[0]
    raise SyncError(
        f"Cannot resolve one source manuscript for {branch} version {publication['version']}; "
        f"matched {len(exact)} versioned and {len(current)} current files"
    )


def current_publication_source(sft_root: Path, branch: str) -> Path:
    if branch == "methods":
        candidates = sorted((sft_root / "publications" / "successors" / "methods").glob("*.md"))
        if not candidates:
            raise SyncError("The committed SFT revision has no methods publication")
        return max(candidates, key=lambda path: tuple(int(part) for part in re.findall(r"\d+", path.stem)))
    candidates = sorted((sft_root / "publications" / "current" / branch).glob("*.md"))
    if len(candidates) != 1:
        raise SyncError(
            f"Expected exactly one committed current manuscript for {branch}, found {len(candidates)}"
        )
    return candidates[0]


def publication_metadata_from_current_pointers(
    sft_root: Path,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], str | None]:
    publications_snapshot = DATA_DIR / "publications.json"
    archive_snapshot = DATA_DIR / "publication-archive.json"
    if not publications_snapshot.is_file() or not archive_snapshot.is_file():
        raise SyncError(
            "No V3 catalogue is committed and the site has no validated publication metadata snapshot"
        )
    previous_document = read_json(publications_snapshot)
    previous = {paper.get("branch"): paper for paper in previous_document.get("publications", [])}
    archive = read_json(archive_snapshot).get("works", [])
    if set(previous) != set(BRANCHES) or not archive:
        raise SyncError("The retained publication metadata snapshot is incomplete or ambiguous")

    publications: list[dict[str, Any]] = []
    for order, branch in enumerate(BRANCHES):
        source = current_publication_source(sft_root, branch)
        head = source.read_text(encoding="utf-8")[:160_000]
        doi_match = re.search(r"10\.5281/zenodo\.\d+", head)
        version_match = re.search(r"\*\*Version:\*\*\s*([0-9]+(?:\.[0-9]+)+)", head)
        if not version_match:
            version_match = re.search(r"\bversion\s+([0-9]+(?:\.[0-9]+)+)", head, re.IGNORECASE)
        title_match = re.search(r"^#\s+(.+)$", head, re.MULTILINE)
        retained = previous[branch]
        doi = doi_match.group(0) if doi_match else retained.get("doi")
        version = version_match.group(1) if version_match else retained.get("version")
        if not doi or not version or not title_match:
            raise SyncError(f"Cannot derive complete current publication metadata for {branch}")
        publications.append(
            {
                "order": order,
                "branch": branch,
                "branch_label": BRANCH_LABELS[branch],
                "short_title": SHORT_TITLES[branch],
                "title": strip_markdown(title_match.group(1)),
                "version": version,
                "doi": doi,
                "doi_url": f"https://doi.org/{doi}",
                "summary": SUMMARIES[branch],
                "resolved_source": source,
            }
        )
    if len({paper["doi"] for paper in publications}) != len(BRANCHES):
        raise SyncError("The committed current publication pointers do not resolve to unique DOIs")
    return publications, archive, previous_document.get("catalogue_status_date")


def build_publications(
    sft_root: Path, catalogue: Path | None
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    if catalogue:
        publications, archive, status_date = parse_catalogue(catalogue)
    else:
        publications, archive, status_date = publication_metadata_from_current_pointers(sft_root)
    for publication in publications:
        source = publication.pop("resolved_source", None) or resolve_publication_source(sft_root, publication)
        output_name = publication["branch"].replace("_", "-") + ".md"
        output = PUBLICATION_DIR / output_name
        output.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, output)
        publication.update(
            {
                "catalogue_status_date": status_date,
                "source_path": source.relative_to(sft_root).as_posix(),
                "source_sha256": sha256(source),
                "content_path": output.relative_to(ROOT).as_posix(),
                "content_sha256": sha256(output),
                "word_count": len(re.findall(r"\b[\w’'-]+\b", output.read_text(encoding="utf-8"))),
            }
        )
    expected = {publication["branch"].replace("_", "-") + ".md" for publication in publications}
    for stale in PUBLICATION_DIR.glob("*.md"):
        if stale.name not in expected:
            stale.unlink()
    return publications, archive


def build_reader_data(
    publications: list[dict[str, Any]], archive: list[dict[str, Any]], source_revision: str
) -> Path:
    essay_path = ROOT / "content" / "papers" / "the-sling-and-the-shoggoth.md"
    essay_words = len(re.findall(r"\b[\w’'-]+\b", essay_path.read_text(encoding="utf-8")))
    works = [
        {
            "id": paper["branch"],
            "file": paper["content_path"],
            "title": paper["short_title"],
            "sub": f"{paper['branch_label']} · Version {paper['version']} · {paper['doi']}. {paper['summary']}",
            "words": paper["word_count"],
            "collection": "sft-current",
            "source_url": (
                "https://github.com/MettaMazza/ernos-labs-sft-platform/blob/"
                f"{source_revision}/{paper['source_path']}"
            ),
            "source_root_url": (
                "https://github.com/MettaMazza/ernos-labs-sft-platform/blob/"
                f"{source_revision}/"
            ),
            "raw_source_url": (
                "https://raw.githubusercontent.com/MettaMazza/ernos-labs-sft-platform/"
                f"{source_revision}/{paper['source_path']}"
            ),
            "raw_root_url": (
                "https://raw.githubusercontent.com/MettaMazza/ernos-labs-sft-platform/"
                f"{source_revision}/"
            ),
            "context": (
                '<aside class="publication-context"><strong>Current SFT status · every branch complete</strong>'
                    '<h2>This paper contains two founding proofs. It is not the extent of the model.</h2>'
                    '<p>Every registered scientific branch is foundationally complete. The two results owned by this versioned methods paper are the root from which the complete branch structure was built; they are not a count of SFT&rsquo;s present claims or branches.</p>'
                    '<p>The publication remains preserved as written. Its release-era status notes describe the moment recorded by that version, while the Knowledge Tree presents the complete live model and continues to update with it.</p>'
                '<a href="knowledge-tree.html">Explore every foundationally complete branch →</a></aside>'
                if paper["branch"] == "methods"
                else ""
            ),
        }
        for paper in publications
    ]
    works.append(
        {
            "id": "the-sling-and-the-shoggoth",
            "file": "content/papers/the-sling-and-the-shoggoth.md",
            "title": "The Sling and the Shoggoth",
            "sub": "An independent essay on human agency, artificial intelligence and the tools people choose to build.",
            "words": essay_words,
            "collection": "essay",
        }
    )
    archive_rows = []
    for work in archive:
        successors = "".join(
            f'<a href="https://doi.org/{html.escape(item["doi"])}" target="_blank" rel="noopener">{html.escape(item["label"])} ↗</a>'
            for item in work["successors"]
        )
        pending = "<small>Application-specific V3 rebuild pending.</small>" if work["application_rebuild_pending"] else ""
        archive_rows.append(
            '<article class="publication-history__row">'
            f'<div><strong>{html.escape(work["title"])}</strong><span>{html.escape(work["published_versions"])}</span>{pending}</div>'
            f'<div class="publication-history__links"><a href="{html.escape(work["doi_url"])}" target="_blank" rel="noopener">Preserved DOI ↗</a>{successors}</div>'
            "</article>"
        )
    extra = (
        '<section class="publication-history" id="historical-publications">'
        '<div class="publication-history__intro"><p class="eyebrow">Preserved scientific history</p>'
        '<h2>Deprecated publications and their V3 successors</h2>'
        '<p>These records are not part of the current publication catalogue. Their original DOIs and versions remain available as historical evidence, with direct routes to the work that replaces them.</p></div>'
        '<div class="publication-history__list">' + "".join(archive_rows) + "</div></section>"
    )
    output = ROOT / "assets" / "js" / "publications-data.js"
    output.write_text(
        "// Generated by tools/sync_sft_site.py from the authoritative SFT catalogue.\n"
        + "window.READER_INTRO = "
        + json.dumps(
            {
                "eyebrow": "Current work and preserved history",
                "title": "Publications",
                "lead": "Read the current Smithian Fold Theory publication set as a connected scientific record. Historical papers remain preserved separately with links to the V3 work that replaces them.",
            },
            ensure_ascii=False,
        )
        + ";\nwindow.READER_SECTIONS = "
        + json.dumps(
            [
                {
                    "collection": "sft-current",
                    "heading": "Smithian Fold Theory V3",
                    "sub": "Sixteen versioned publications spanning the verification method, foundational theory and its scientific branches.",
                },
                {
                    "collection": "essay",
                    "heading": "Independent writing",
                    "sub": "Current writing outside the SFT scientific publication sequence.",
                },
            ],
            ensure_ascii=False,
        )
        + ";\nwindow.READER_WORKS = "
        + json.dumps(works, ensure_ascii=False)
        + ";\nwindow.READER_EXTRA_HTML = "
        + json.dumps(extra, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    return output


def education_source_root(sft_root: Path) -> Path | None:
    matches = [path for path in sft_root.iterdir() if path.is_dir() and path.name.casefold() == "edu"]
    if len(matches) > 1:
        raise SyncError("The SFT repository contains more than one case-variant Edu directory")
    return matches[0] if matches else None


def source_is_committed(sft_root: Path, source: Path) -> bool:
    relative = source.relative_to(sft_root).as_posix()
    result = subprocess.run(
        ["git", "-C", str(sft_root), "ls-files", "--error-unmatch", relative],
        text=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return result.returncode == 0


def source_link_fields(sft_root: Path, source_revision: str, source: Path) -> dict[str, str]:
    if not source_is_committed(sft_root, source):
        return {}
    source_path = source.relative_to(sft_root).as_posix()
    return {
        "source_url": (
            "https://github.com/MettaMazza/ernos-labs-sft-platform/blob/"
            f"{source_revision}/{source_path}"
        ),
        "source_root_url": (
            "https://github.com/MettaMazza/ernos-labs-sft-platform/blob/"
            f"{source_revision}/"
        ),
        "raw_source_url": (
            "https://raw.githubusercontent.com/MettaMazza/ernos-labs-sft-platform/"
            f"{source_revision}/{source_path}"
        ),
        "raw_root_url": (
            "https://raw.githubusercontent.com/MettaMazza/ernos-labs-sft-platform/"
            f"{source_revision}/"
        ),
    }


def education_word_count(path: Path, content_format: str) -> int:
    text = path.read_text(encoding="utf-8")
    if content_format == "html":
        text = re.sub(r"<(?:script|style)\b[^>]*>.*?</(?:script|style)>", " ", text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"<[^>]+>", " ", text)
        text = html.unescape(text)
    return len(re.findall(r"\b[\w’'-]+\b", text))


def safe_education_artifact(sft_root: Path, artifact_path: str) -> Path:
    source = (sft_root / artifact_path).resolve()
    try:
        source.relative_to(sft_root.resolve())
    except ValueError as exc:
        raise SyncError(f"Educational artifact escapes the SFT repository: {artifact_path}") from exc
    if not source.is_file():
        raise SyncError(f"Educational artifact is missing: {artifact_path}")
    return source


def render_picture_book(source: Path, manifest: dict[str, Any], output: Path) -> None:
    book = read_json(source)
    if book.get("schema") != "sft-education-picture-book/1" or not isinstance(book.get("pages"), list):
        raise SyncError(f"Unsupported canonical educational JSON: {source}")
    lines = [
        f"# {manifest['title']}",
        "",
        str(manifest.get("subtitle") or ""),
        "",
    ]
    for page in book["pages"]:
        number = page.get("page")
        badge = str(page.get("badge") or "Page")
        lines.extend([f"## Page {number} — {badge.title()}", ""])
        text = str(page.get("text") or "").strip()
        if text:
            lines.extend([text.replace("\n", "\n\n"), ""])
        subtext = str(page.get("subtext") or "").strip()
        if subtext:
            lines.extend([f"**Reading prompt:** {subtext}", ""])
        alt = str(page.get("alt") or "").strip()
        if alt:
            lines.extend([f"**Illustration description:** {alt}", ""])
    output.write_text("\n".join(lines).strip() + "\n", encoding="utf-8")


def validate_education_manifest(manifest: dict[str, Any], path: Path) -> None:
    required = ("book_id", "title", "version", "status", "stage", "branches", "author", "artifacts")
    missing = [key for key in required if not manifest.get(key)]
    licence = manifest.get("license") or (manifest.get("licenses") or {}).get("text")
    if not licence:
        missing.append("license or licenses.text")
    if manifest.get("schema") != "sft-education-book-manifest/1" or missing:
        raise SyncError(f"Educational manifest is incomplete at {path}: {', '.join(missing)}")
    if not re.fullmatch(r"\d+\.\d+\.\d+", str(manifest["version"])):
        raise SyncError(f"Educational version is not semantic at {path}: {manifest['version']}")
    if manifest["status"] not in {"planning", "draft", "review", "live", "superseded", "withdrawn"}:
        raise SyncError(f"Unknown educational status at {path}: {manifest['status']}")
    if manifest["stage"] not in EDUCATION_STAGES:
        raise SyncError(f"Unknown educational stage at {path}: {manifest['stage']}")
    if manifest["author"] != "Maria Smith" or str(licence).replace("-", " ").upper() != "CC BY 4.0":
        raise SyncError(f"Educational authorship or licence is inconsistent at {path}")


def education_version(value: str) -> tuple[int, int, int]:
    return tuple(int(part) for part in value.split("."))  # type: ignore[return-value]


def education_context(manifest: dict[str, Any], stage_label: str, current: bool) -> str:
    status = html.escape(str(manifest["status"]).replace("_", " ").title())
    boundary = manifest.get("knowledge_boundary") or {}
    inspected = html.escape(str(boundary.get("inspected_date") or "Not stated"))
    claims = html.escape(str(boundary.get("census_claim_count") or "Not stated"))
    branches = ", ".join(str(branch).replace("_", " ").title() for branch in manifest.get("branches", []))
    status_note = {
        "planning": "This catalogue entry is planned and is not yet a teaching release.",
        "draft": "This is an incomplete working draft and is not yet a teaching release.",
        "review": "This complete candidate is still undergoing scientific, educational, accessibility or safety review.",
        "live": "This is the current verified educational edition.",
        "superseded": "This preserved edition has been replaced by a later version.",
        "withdrawn": "This edition is preserved for custody but should not be used for teaching.",
    }[manifest["status"]]
    edition_note = "Current edition in this snapshot." if current else "Preserved earlier edition."
    return (
        '<aside class="education-context">'
        f'<strong>{html.escape(stage_label)} · {status}</strong>'
        f'<h2>{html.escape(manifest["title"])} · Version {html.escape(manifest["version"])}</h2>'
        f'<p>{html.escape(status_note)} {html.escape(edition_note)}</p>'
        '<dl>'
        f'<div><dt>Scientific branches</dt><dd>{html.escape(branches)}</dd></div>'
        f'<div><dt>Knowledge inspected</dt><dd>{inspected}</dd></div>'
        f'<div><dt>Claim census at edition boundary</dt><dd>{claims}</dd></div>'
        '<div><dt>Licence</dt><dd>CC BY 4.0</dd></div>'
        '</dl></aside>'
    )


def build_education(
    sft_root: Path, source_revision: str, source_dirty: bool
) -> tuple[dict[str, Any], Path]:
    edu_root = education_source_root(sft_root)
    EDUCATION_DIR.mkdir(parents=True, exist_ok=True)
    for stale in EDUCATION_DIR.iterdir():
        if stale.is_file():
            stale.unlink()

    works: list[dict[str, Any]] = []
    programme_count = 0
    edition_records: list[dict[str, Any]] = []
    if edu_root:
        for filename, work_id, title, summary in EDUCATION_PROGRAMME_DOCUMENTS:
            source = edu_root / filename
            if not source.is_file():
                continue
            output = EDUCATION_DIR / (work_id + ".md")
            shutil.copyfile(source, output)
            works.append(
                {
                    "id": work_id,
                    "file": output.relative_to(ROOT).as_posix(),
                    "title": title,
                    "sub": summary,
                    "words": education_word_count(output, "markdown"),
                    "collection": "programme",
                    "format": "markdown",
                    "source_path": source.relative_to(sft_root).as_posix(),
                    "source_sha256": sha256(source),
                    "content_sha256": sha256(output),
                    **source_link_fields(sft_root, source_revision, source),
                }
            )
            programme_count += 1

        manifests: list[dict[str, Any]] = []
        seen_editions: set[tuple[str, str]] = set()
        for manifest_path in sorted(edu_root.glob("books/**/book-manifest.json")):
            manifest = read_json(manifest_path)
            validate_education_manifest(manifest, manifest_path)
            key = (manifest["book_id"], manifest["version"])
            if key in seen_editions:
                raise SyncError(f"Duplicate educational edition {key[0]} {key[1]}")
            seen_editions.add(key)
            manifests.append({**manifest, "_manifest_path": manifest_path})

        groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for manifest in manifests:
            groups[manifest["book_id"]].append(manifest)

        for book_id, editions in sorted(groups.items()):
            usable = [edition for edition in editions if edition["status"] not in {"superseded", "withdrawn"}]
            current_edition = max(usable or editions, key=lambda edition: education_version(edition["version"]))
            for manifest in sorted(editions, key=lambda edition: education_version(edition["version"]), reverse=True):
                manifest_path: Path = manifest["_manifest_path"]
                is_current = manifest is current_edition
                artifacts = {item.get("role"): item.get("path") for item in manifest.get("artifacts", [])}
                source: Path | None = None
                content_format = "markdown"
                semantic = artifacts.get("semantic_accessible_edition")
                canonical = artifacts.get("canonical_student_source")
                if semantic:
                    source = safe_education_artifact(sft_root, str(semantic))
                    content_format = "html" if source.suffix.lower() in {".html", ".htm"} else "markdown"
                elif canonical:
                    source = safe_education_artifact(sft_root, str(canonical))
                    content_format = "json" if source.suffix.lower() == ".json" else "markdown"
                elif manifest["status"] != "planning":
                    raise SyncError(f"Educational edition has no accessible student source: {manifest_path}")

                safe_id = re.sub(r"[^a-z0-9]+", "-", book_id.lower()).strip("-")
                version_slug = manifest["version"].replace(".", "-")
                content_path: Path | None = None
                work: dict[str, Any] | None = None
                if source:
                    suffix = ".html" if content_format == "html" else ".md"
                    content_path = EDUCATION_DIR / f"{safe_id}-v{version_slug}{suffix}"
                    if content_format == "json":
                        render_picture_book(source, manifest, content_path)
                        content_format = "markdown"
                    else:
                        shutil.copyfile(source, content_path)
                    stage_label = EDUCATION_STAGES[manifest["stage"]][0]
                    work = {
                        "id": safe_id if is_current else f"{safe_id}-v{version_slug}",
                        "file": content_path.relative_to(ROOT).as_posix(),
                        "title": manifest["title"],
                        "sub": (
                            f"{stage_label} · Version {manifest['version']} · {manifest['status'].title()}. "
                            f"{manifest.get('subtitle') or 'An open SFT educational edition.'}"
                        ),
                        "words": education_word_count(content_path, content_format),
                        "collection": f"stage:{manifest['stage']}" if is_current else "education-history",
                        "format": content_format,
                        "download_label": "Download accessible HTML" if content_format == "html" else "Download text",
                        "context": education_context(manifest, stage_label, is_current),
                        "source_path": source.relative_to(sft_root).as_posix(),
                        "source_sha256": sha256(source),
                        "content_sha256": sha256(content_path),
                        "book_id": book_id,
                        "version": manifest["version"],
                        "status": manifest["status"],
                        "stage": manifest["stage"],
                        "current": is_current,
                        **source_link_fields(sft_root, source_revision, source),
                    }
                    works.append(work)

                adult_guide = manifest_path.parent / "adult-guide.md"
                if is_current and adult_guide.is_file():
                    adult_output = EDUCATION_DIR / f"{safe_id}-adult-guide-v{version_slug}.md"
                    shutil.copyfile(adult_guide, adult_output)
                    works.append(
                        {
                            "id": f"{safe_id}-adult-guide",
                            "file": adult_output.relative_to(ROOT).as_posix(),
                            "title": f"{manifest['title']} — adult guide",
                            "sub": f"Guidance, activities, answers, accessibility and the exact scientific boundary for Version {manifest['version']}.",
                            "words": education_word_count(adult_output, "markdown"),
                            "collection": "adult-guidance",
                            "format": "markdown",
                            "download_label": "Download guide",
                            "context": education_context(manifest, EDUCATION_STAGES[manifest["stage"]][0], True),
                            "source_path": adult_guide.relative_to(sft_root).as_posix(),
                            "source_sha256": sha256(adult_guide),
                            "content_sha256": sha256(adult_output),
                            "book_id": book_id,
                            "version": manifest["version"],
                            "status": manifest["status"],
                            "stage": manifest["stage"],
                            "current": True,
                            **source_link_fields(sft_root, source_revision, adult_guide),
                        }
                    )

                public_manifest = {key: value for key, value in manifest.items() if not key.startswith("_")}
                edition_records.append(
                    {
                        "book_id": book_id,
                        "title": manifest["title"],
                        "subtitle": manifest.get("subtitle"),
                        "version": manifest["version"],
                        "status": manifest["status"],
                        "stage": manifest["stage"],
                        "branches": manifest["branches"],
                        "current": is_current,
                        "manifest_path": manifest_path.relative_to(sft_root).as_posix(),
                        "manifest_sha256": sha256(manifest_path),
                        "content_path": content_path.relative_to(ROOT).as_posix() if content_path else None,
                        "content_sha256": sha256(content_path) if content_path else None,
                        "manifest": public_manifest,
                    }
                )

    status_counts = Counter(record["status"] for record in edition_records)
    stage_counts = Counter(record["stage"] for record in edition_records if record["current"])
    current_book_count = sum(record["current"] for record in edition_records)
    sections = [
        {
            "collection": "programme",
            "heading": "Start with the programme",
            "sub": "Read the master syllabus, educational charter, current knowledge boundary and versioning rules.",
        }
    ]
    sections.extend(
        {
            "collection": f"stage:{stage}",
            "heading": label,
            "sub": description,
        }
        for stage, (label, description) in EDUCATION_STAGES.items()
    )
    sections.extend(
        [
            {
                "collection": "adult-guidance",
                "heading": "For parents, carers and teachers",
                "sub": "Practical guidance, expected reasoning, accessibility choices, safety and answers.",
            },
            {
                "collection": "education-history",
                "heading": "Preserved earlier editions",
                "sub": "Superseded and withdrawn versions remain available with their exact scientific boundary.",
            },
        ]
    )
    stage_cards = "".join(
        '<article class="education-stage-card">'
        f'<span>{html.escape(label)}</span><strong>{stage_counts.get(stage, 0)}</strong>'
        f'<p>{html.escape(description)}</p></article>'
        for stage, (label, description) in EDUCATION_STAGES.items()
    )
    source_state = "working preview" if source_dirty else "committed source"
    extra = (
        '<section class="education-path" aria-labelledby="education-path-title">'
        '<div class="education-path__intro"><p class="eyebrow">One route, many entry points</p>'
        '<h2 id="education-path-title">A syllabus that grows with the model.</h2>'
        '<p>Each shelf is generated from the versioned manifests and accessible editions in the SFT Edu directory. '
        'When a new edition becomes current, the previous edition moves into preserved history instead of disappearing.</p></div>'
        f'<div class="education-stage-grid">{stage_cards}</div>'
        '<aside class="education-qualification-note"><strong>Clear qualification boundary</strong>'
        '<p>GCSE-age materials use familiar learning and assessment styles, but they are not an approved GCSE specification or an accredited qualification. Exam-board mappings are navigation aids only.</p></aside>'
        '<div class="education-provenance"><div><span>Source revision</span>'
        f'<strong>{html.escape(source_revision[:12])}</strong></div><div><span>Projection</span><strong>{html.escape(source_state.title())}</strong></div>'
        f'<div><span>Current books</span><strong>{current_book_count}</strong></div></div></section>'
    )
    reader_output = ROOT / "assets" / "js" / "education-data.js"
    reader_output.write_text(
        "// Generated by tools/sync_sft_site.py from the versioned SFT Edu library.\n"
        + "window.READER_INTRO = "
        + json.dumps(
            {
                "eyebrow": "Open education · automatically updated",
                "title": "Syllabus",
                "lead": "A free learning route through Smithian Fold Theory, from shared early-years reading to GCSE-style study, university reconstruction and advanced independent audit. Every available work keeps its version, scientific boundary and accessibility status visible.",
            },
            ensure_ascii=False,
        )
        + ";\nwindow.READER_SECTIONS = "
        + json.dumps(sections, ensure_ascii=False)
        + ";\nwindow.READER_WORKS = "
        + json.dumps(works, ensure_ascii=False)
        + ";\nwindow.READER_EXTRA_HTML = "
        + json.dumps(extra, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    document = {
        "schema": "ernoslabs-sft-education/1",
        "source_present": edu_root is not None,
        "source_path": edu_root.relative_to(sft_root).as_posix() if edu_root else None,
        "source_revision": source_revision,
        "source_dirty": source_dirty,
        "programme_document_count": programme_count,
        "book_count": len({record["book_id"] for record in edition_records}),
        "edition_count": len(edition_records),
        "current_book_count": current_book_count,
        "status_counts": dict(sorted(status_counts.items())),
        "stage_counts": dict(sorted(stage_counts.items())),
        "editions": edition_records,
        "works": works,
    }
    return document, reader_output


def safe_relative(path_value: str | None, root: Path) -> dict[str, Any] | None:
    if not path_value:
        return None
    candidate = root / path_value
    return {
        "path": path_value,
        "available": candidate.is_file(),
        "sha256": sha256(candidate) if candidate.is_file() else None,
    }


def build_claims(sft_root: Path) -> tuple[dict[str, Any], dict[str, Any]]:
    census = read_json(sft_root / "census" / "claims.json")
    rows = census.get("claims")
    if not isinstance(rows, list) or not rows:
        raise SyncError("The whole-model claim census is empty or malformed")
    ids = [row.get("claim_id") for row in rows]
    duplicates = [claim_id for claim_id, count in Counter(ids).items() if claim_id and count > 1]
    if duplicates:
        raise SyncError(f"Duplicate whole-model claim IDs: {', '.join(duplicates[:8])}")
    known_ids = set(ids)
    public_claims: list[dict[str, Any]] = []
    missing_packages: list[str] = []
    missing_dependencies: dict[str, list[str]] = {}
    for row in rows:
        claim_id = row["claim_id"]
        package = sft_root / "claims" / claim_id
        registration_path = package / "registration.json"
        registration = read_json(registration_path) if registration_path.is_file() else {}
        if not registration:
            missing_packages.append(claim_id)
        dependencies = registration.get("dependencies", [])
        absent = [dependency for dependency in dependencies if dependency not in known_ids]
        if absent:
            missing_dependencies[claim_id] = absent
        controls_path = package / "controls.json"
        certificate_path = package / "certificate.json"
        public_claims.append(
            {
                "claim_id": claim_id,
                "branch": row.get("branch"),
                "branch_label": BRANCH_LABELS.get(row.get("branch"), str(row.get("branch", "")).replace("_", " ").title()),
                "title": row.get("title"),
                "statement": row.get("statement"),
                "model_admitted": row.get("model_admitted"),
                "closure_status": row.get("closure_status"),
                "external_status": row.get("external_status"),
                "receipt_hash": row.get("receipt_hash"),
                "receipt": safe_relative(row.get("receipt_path"), sft_root),
                "registration_status": registration.get("status"),
                "subbranch": registration.get("subbranch"),
                "dependencies": dependencies,
                "provenance_classes": registration.get("provenance_classes", []),
                "excluded_inputs": registration.get("excluded_inputs", []),
                "required_controls": registration.get("required_controls", []),
                "registration": safe_relative(
                    registration_path.relative_to(sft_root).as_posix() if registration_path.is_file() else None,
                    sft_root,
                ),
                "controls": safe_relative(
                    controls_path.relative_to(sft_root).as_posix() if controls_path.is_file() else None,
                    sft_root,
                ),
                "certificate": safe_relative(
                    certificate_path.relative_to(sft_root).as_posix() if certificate_path.is_file() else None,
                    sft_root,
                ),
            }
        )
    groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for claim in public_claims:
        groups[claim["branch"]].append(claim)
    group_summary = [
        {
            "branch": branch,
            "branch_label": BRANCH_LABELS.get(branch, branch.replace("_", " ").title()),
            "live_census_claims": len(claims),
            "empirically_tested_claims": sum(
                "empirically_tested" in str(claim.get("external_status")) for claim in claims
            ),
        }
        for branch, claims in sorted(groups.items())
    ]
    projection = {
        "schema": "ernoslabs-sft-public-claims/1",
        "source_schema": census.get("schema"),
        "generation": census.get("generation"),
        "phase": census.get("phase"),
        "future_generation": census.get("future_generation"),
        "unclassified_obligations": census.get("unclassified_obligations", []),
        "whole_model_claim_count": len(public_claims),
        "claim_groups": group_summary,
        "claims": public_claims,
    }
    validation = {
        "claim_count": len(public_claims),
        "unique_claim_ids": len(known_ids),
        "missing_claim_packages": missing_packages,
        "claims_with_dependencies_outside_live_census": missing_dependencies,
    }
    return projection, validation


def build_branches(sft_root: Path, claims: dict[str, Any]) -> dict[str, Any]:
    census = read_json(sft_root / "census" / "branches.json")
    branches = census.get("branches")
    if not isinstance(branches, list) or not branches:
        raise SyncError("The branch publication census is empty or malformed")
    live_counts = {group["branch"]: group["live_census_claims"] for group in claims["claim_groups"]}
    program = census.get("foundational_branch_program") or {}
    registered_count = program.get("registered_branch_count")
    complete_count = program.get("current_evidence_complete_extension_open_foundation_count")
    all_foundations_complete = bool(
        registered_count
        and complete_count
        and registered_count == complete_count == len(branches)
    )
    public_branches = []
    for branch in branches:
        branch_id = branch.get("branch_id")
        public_branches.append(
            {
                **branch,
                "branch_label": BRANCH_LABELS.get(branch_id, str(branch_id).replace("_", " ").title()),
                "live_census_claims": live_counts.get(branch_id),
                "foundation_status": "Foundationally complete" if all_foundations_complete else "See current branch record",
                "count_note": "The live whole-model census count is separate from the dated publication inventory encoded in inventory_status.",
            }
        )
    return {
        "schema": "ernoslabs-sft-public-branches/1",
        "source_schema": census.get("schema"),
        "status_semantics": census.get("status_semantics"),
        "final_toe_paper_status": census.get("final_toe_paper_status"),
        "foundational_branch_program": program,
        "all_foundations_complete": all_foundations_complete,
        "public_status_summary": (
            f"All {registered_count} registered scientific branches are foundationally complete. "
            "Each branch remains available for versioned additions as the model develops."
            if all_foundations_complete
            else "See the current branch record for the latest foundation status."
        ),
        "lineage_reconciliation": census.get("lineage_reconciliation"),
        "prior_obligation_ownership": census.get("prior_obligation_ownership"),
        "publication_inventory_branch_count": len(public_branches),
        "branches": public_branches,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sft-root", type=Path, default=DEFAULT_SFT_ROOT)
    parser.add_argument(
        "--require-clean",
        action="store_true",
        help="Fail if the SFT source tree contains uncommitted work (recommended for production)",
    )
    args = parser.parse_args()
    sft_root = args.sft_root.expanduser().resolve()
    required = [sft_root / "census" / "claims.json", sft_root / "census" / "branches.json"]
    missing = [path for path in required if not path.is_file()]
    if missing:
        raise SyncError("Missing SFT source files: " + ", ".join(str(path) for path in missing))
    source_revision = git(sft_root, "rev-parse", "HEAD")
    source_status = git(sft_root, "status", "--porcelain")
    source_dirty = bool(source_status)
    if args.require_clean and source_dirty:
        raise SyncError("The production SFT source must be a clean, committed revision")

    catalogue = newest_catalogue(sft_root)
    catalogue_source = (
        catalogue.relative_to(sft_root).as_posix()
        if catalogue
        else "committed-publication-pointers-with-retained-versioned-metadata"
    )
    catalogue_sha256 = sha256(catalogue) if catalogue else sha256(DATA_DIR / "publications.json")
    publications, archive = build_publications(sft_root, catalogue)
    reader_data = build_reader_data(publications, archive, source_revision)
    claims, claim_validation = build_claims(sft_root)
    branches = build_branches(sft_root, claims)
    education, education_reader_data = build_education(sft_root, source_revision, source_dirty)

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    write_json(DATA_DIR / "publications.json", {"schema": "ernoslabs-sft-publications/1", "publications": publications})
    write_json(DATA_DIR / "publication-archive.json", {"schema": "ernoslabs-sft-publication-archive/1", "works": archive})
    write_json(DATA_DIR / "claims.json", claims)
    write_json(DATA_DIR / "branches.json", branches)
    write_json(DATA_DIR / "education.json", education)

    generated_files = (
        sorted(DATA_DIR.glob("*.json"))
        + sorted(PUBLICATION_DIR.glob("*.md"))
        + sorted(path for path in EDUCATION_DIR.iterdir() if path.is_file())
        + [reader_data, education_reader_data]
    )
    manifest = {
        "schema": "ernoslabs-sft-site-snapshot/1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_repository": "https://github.com/MettaMazza/ernos-labs-sft-platform",
        "source_revision": source_revision,
        "source_dirty": source_dirty,
        "source_catalogue": catalogue_source,
        "source_catalogue_sha256": catalogue_sha256,
        "publication_count": len(publications),
        "historical_publication_count": len(archive),
        "education_source_present": education["source_present"],
        "education_book_count": education["book_count"],
        "education_current_book_count": education["current_book_count"],
        "education_edition_count": education["edition_count"],
        "whole_model_claim_count": claims["whole_model_claim_count"],
        "publication_inventory_branch_count": branches["publication_inventory_branch_count"],
        "validation": claim_validation,
        "files": [
            {"path": path.relative_to(ROOT).as_posix(), "sha256": sha256(path)}
            for path in generated_files
            if path.name != "manifest.json"
        ],
    }
    write_json(DATA_DIR / "manifest.json", manifest)
    print(
        f"Generated {len(publications)} current publications, {len(archive)} historical records, "
        f"{education['current_book_count']} current education books from {education['edition_count']} editions, "
        f"{claims['whole_model_claim_count']} whole-model claims and "
        f"{branches['publication_inventory_branch_count']} branch publication inventories "
        f"from SFT {source_revision[:12]}{' (working preview)' if source_dirty else ''}."
    )
    if claim_validation["missing_claim_packages"]:
        print(
            f"Note: {len(claim_validation['missing_claim_packages'])} live census rows have no local claim package; "
            "they remain visible with their census provenance.",
            file=sys.stderr,
        )
    if claim_validation["claims_with_dependencies_outside_live_census"]:
        print(
            f"Note: {len(claim_validation['claims_with_dependencies_outside_live_census'])} claims reference "
            "dependencies outside the live whole-model census; the references are preserved.",
            file=sys.stderr,
        )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (SyncError, subprocess.CalledProcessError) as exc:
        print(f"SFT site sync failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
