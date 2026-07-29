#!/usr/bin/env python3
"""Validate the generated SFT website snapshot before preview or deployment."""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "assets" / "data" / "sft"


class ValidationError(RuntimeError):
    pass


def load(name: str) -> Any:
    path = DATA / name
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValidationError(f"{name} is missing or invalid: {exc}") from exc


def sha256(path: Path) -> str:
    return "sha256:" + hashlib.sha256(path.read_bytes()).hexdigest()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValidationError(message)


def main() -> int:
    manifest = load("manifest.json")
    publications = load("publications.json").get("publications", [])
    archive = load("publication-archive.json").get("works", [])
    claims_document = load("claims.json")
    branches_document = load("branches.json")
    claims = claims_document.get("claims", [])
    branches = branches_document.get("branches", [])

    require(manifest.get("schema") == "ernoslabs-sft-site-snapshot/1", "Unknown snapshot schema")
    require(len(publications) == 16, "The authoritative V3 publication set must contain exactly 16 works")
    require([paper.get("order") for paper in publications] == list(range(16)), "V3 publication order is incomplete")
    dois = [paper.get("doi") for paper in publications]
    require(len(set(dois)) == 16 and all(dois), "Current publication DOIs must be present and unique")
    branches_for_papers = [paper.get("branch") for paper in publications]
    require(len(set(branches_for_papers)) == 16, "Each current publication must have one distinct branch")
    for paper in publications:
        content = ROOT / str(paper.get("content_path", ""))
        require(content.is_file(), f"Publication content is missing: {paper.get('content_path')}")
        require(sha256(content) == paper.get("content_sha256"), f"Publication hash mismatch: {content}")

    current_dois = set(dois)
    require(archive, "The historical publication archive is empty")
    require(not current_dois.intersection(work.get("doi") for work in archive), "Current work appears in deprecated archive")
    require(all(work.get("status") == "Deprecated and replaced by V3" for work in archive), "Historical status is inconsistent")
    require((ROOT / "content" / "papers" / "the-sling-and-the-shoggoth.md").is_file(), "The Sling and the Shoggoth is missing")
    reader_data = ROOT / "assets" / "js" / "publications-data.js"
    require(reader_data.is_file(), "The generated publication reader catalogue is missing")
    reader_source = reader_data.read_text(encoding="utf-8")
    require("the-sling-and-the-shoggoth" in reader_source, "The current essay is absent from the publication reader")
    require(all(paper["content_path"] in reader_source for paper in publications), "A V3 paper is absent from the publication reader")
    require(
        "Every registered scientific branch is foundationally complete" in reader_source,
        "The methods reader is missing the current full-platform completion context",
    )
    require(
        "This paper contains two founding proofs. It is not the extent of the model." in reader_source,
        "The methods reader does not distinguish its two founding proofs from the complete model",
    )
    reader_engine = (ROOT / "assets" / "js" / "reader.js").read_text(encoding="utf-8")
    require(
        "Inspect this methods paper's two founding proofs" in reader_engine,
        "The public reader still exposes the ambiguous two-claim link",
    )

    claim_ids = [claim.get("claim_id") for claim in claims]
    claim_id_set = set(claim_ids)
    require(claim_ids and len(claim_ids) == len(claim_id_set), "Whole-model claim IDs are empty or duplicated")
    require(claims_document.get("whole_model_claim_count") == len(claims), "Whole-model claim count does not match its rows")
    missing_dependencies = {
        claim["claim_id"]: [dependency for dependency in claim.get("dependencies", []) if dependency not in claim_id_set]
        for claim in claims
        if any(dependency not in claim_id_set for dependency in claim.get("dependencies", []))
    }
    require(not missing_dependencies, f"Claims reference missing dependencies: {list(missing_dependencies)[:5]}")
    require(all(claim.get("receipt", {}).get("available") for claim in claims), "At least one admitted claim receipt is unavailable")

    require(branches, "The branch publication inventory is empty")
    require(branches_document.get("publication_inventory_branch_count") == len(branches), "Branch inventory count does not match its rows")
    foundation_program = branches_document.get("foundational_branch_program") or {}
    require(
        foundation_program.get("registered_branch_count")
        == foundation_program.get("current_evidence_complete_extension_open_foundation_count")
        == len(branches),
        "Every registered scientific branch must have a complete foundation before publication",
    )
    require(branches_document.get("all_foundations_complete") is True, "Public branch completion status is stale")
    require(
        all(
            "inventory_status" in branch
            and "live_census_claims" in branch
            and branch.get("foundation_status") == "Foundationally complete"
            for branch in branches
        ),
        "Branch publication inventory and live-census fields must remain separately available",
    )

    validation = manifest.get("validation", {})
    require(not validation.get("missing_claim_packages"), "The snapshot has missing local claim packages")
    require(
        not validation.get("claims_with_dependencies_outside_live_census"),
        "The snapshot has claim dependencies outside the whole-model census",
    )
    require(manifest.get("publication_count") == len(publications), "Manifest publication count is stale")
    require(manifest.get("whole_model_claim_count") == len(claims), "Manifest claim count is stale")
    require(manifest.get("publication_inventory_branch_count") == len(branches), "Manifest branch count is stale")

    for item in manifest.get("files", []):
        path = ROOT / item["path"]
        require(path.is_file(), f"Manifest file is missing: {item['path']}")
        require(sha256(path) == item.get("sha256"), f"Manifest hash mismatch: {item['path']}")

    print(
        f"Snapshot valid: {len(publications)} current publications, {len(archive)} historical records, "
        f"{len(claims)} whole-model claims and {len(branches)} branch publication inventories."
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ValidationError as exc:
        print(f"Snapshot validation failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
