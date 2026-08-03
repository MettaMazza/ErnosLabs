#!/usr/bin/env python3
"""Publish Desktop blog-folder changes through an isolated Git checkout."""

from __future__ import annotations

import argparse
import fcntl
import os
import subprocess
import sys
import time
from pathlib import Path


SOURCE = Path(os.environ.get("BLOG_POSTS_ROOT", "/Users/mettamazza/Desktop/blog posts")).expanduser()
PUBLISH_ROOT = Path(
    os.environ.get(
        "BLOG_PUBLISH_CHECKOUT",
        "/Users/mettamazza/Library/Application Support/ErnosLabs Blog Publisher/repo",
    )
).expanduser()
REMOTE = "https://github.com/MettaMazza/ErnosLabs.git"
ALLOWED_PREFIXES = (
    "assets/data/blog.json",
    "assets/js/blog-data.js",
    "blog.html",
    "content/blog/",
)


class PublishError(RuntimeError):
    pass


def run(*args: str, cwd: Path | None = None, check: bool = True) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(
        args,
        cwd=cwd,
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    if result.stdout.strip():
        print(result.stdout.rstrip(), flush=True)
    if check and result.returncode:
        raise PublishError(f"Command failed ({result.returncode}): {' '.join(args)}")
    return result


def ensure_checkout() -> None:
    expected_parent = Path("/Users/mettamazza/Library/Application Support/ErnosLabs Blog Publisher")
    try:
        PUBLISH_ROOT.resolve().relative_to(expected_parent.resolve())
    except ValueError as exc:
        raise PublishError(f"Refusing unexpected publisher checkout path: {PUBLISH_ROOT}") from exc
    PUBLISH_ROOT.parent.mkdir(parents=True, exist_ok=True)
    if not (PUBLISH_ROOT / ".git").is_dir():
        run("git", "clone", "--branch", "main", REMOTE, str(PUBLISH_ROOT))
    actual_remote = run("git", "remote", "get-url", "origin", cwd=PUBLISH_ROOT).stdout.strip()
    if actual_remote not in {REMOTE, "git@github.com:MettaMazza/ErnosLabs.git"}:
        raise PublishError(f"Refusing unexpected publisher remote: {actual_remote}")
    run("git", "config", "user.name", "Maria Smith", cwd=PUBLISH_ROOT)
    run("git", "config", "user.email", "maria.smith.sftoe@gmail.com", cwd=PUBLISH_ROOT)


def reset_to_production() -> None:
    run("git", "fetch", "origin", "main", cwd=PUBLISH_ROOT)
    run("git", "checkout", "-B", "main", "origin/main", cwd=PUBLISH_ROOT)
    # This is a dedicated disposable publisher clone, never the development tree.
    run("git", "reset", "--hard", "origin/main", cwd=PUBLISH_ROOT)
    run("git", "clean", "-fd", cwd=PUBLISH_ROOT)


def changed_paths() -> list[str]:
    result = run("git", "status", "--porcelain", "--untracked-files=all", cwd=PUBLISH_ROOT)
    paths = []
    for line in result.stdout.splitlines():
        if not line.strip():
            continue
        path = line[3:].split(" -> ")[-1]
        paths.append(path)
    return paths


def allowed(path: str) -> bool:
    return any(path == prefix or (prefix.endswith("/") and path.startswith(prefix)) for prefix in ALLOWED_PREFIXES)


def build_blog() -> bool:
    if not SOURCE.is_dir():
        raise PublishError(f"Blog source folder does not exist: {SOURCE}")
    run(
        sys.executable,
        "tools/sync_blog.py",
        "--source-root",
        str(SOURCE),
        "--require-source",
        cwd=PUBLISH_ROOT,
    )
    run(sys.executable, "tools/stamp_assets.py", cwd=PUBLISH_ROOT)
    changes = changed_paths()
    unexpected = [path for path in changes if not allowed(path)]
    if unexpected:
        raise PublishError("Publisher generated unexpected paths: " + ", ".join(unexpected))
    if not changes:
        print("Blog snapshot is already current.", flush=True)
        return False
    run(
        "git",
        "add",
        "-A",
        "--",
        "assets/data/blog.json",
        "assets/js/blog-data.js",
        "content/blog",
        "blog.html",
        cwd=PUBLISH_ROOT,
    )
    run("git", "diff", "--cached", "--check", cwd=PUBLISH_ROOT)
    run("git", "commit", "-m", "chore(blog): publish folder updates [auto]", cwd=PUBLISH_ROOT)
    return True


def publish(dry_run: bool) -> int:
    ensure_checkout()
    for attempt in range(1, 4):
        reset_to_production()
        if not build_blog():
            return 0
        if dry_run:
            print("Dry run complete; the generated commit was not pushed.", flush=True)
            return 0
        pushed = run("git", "push", "origin", "HEAD:main", cwd=PUBLISH_ROOT, check=False)
        if pushed.returncode == 0:
            # Keep the development release branch aligned when it can advance safely.
            run("git", "push", "origin", "HEAD:site-v2-rebuild", cwd=PUBLISH_ROOT, check=False)
            print("Blog update pushed to production; GitHub Pages deployment started.", flush=True)
            return 0
        print(f"Production advanced during publish; retrying ({attempt}/3).", flush=True)
        time.sleep(2)
    raise PublishError("Could not publish after three production-update retries")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="Build and commit in the isolated clone without pushing")
    args = parser.parse_args()
    lock_path = Path("/tmp/com.ernoslabs.blogpublisher.lock")
    with lock_path.open("w") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print("Another Blog publish is already running.")
            return 0
        try:
            return publish(args.dry_run)
        except (OSError, PublishError) as exc:
            print(f"Blog publish failed: {exc}", file=sys.stderr, flush=True)
            return 1


if __name__ == "__main__":
    raise SystemExit(main())
