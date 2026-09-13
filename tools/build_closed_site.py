"""Publish ONLY the closed-garden splash, never the retained source archive."""
from html.parser import HTMLParser
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "_closed_site"
EXPECTED = {"index.html", "404.html", "robots.txt", "CNAME", ".nojekyll"}


class CheckSplash(HTMLParser):
    def handle_starttag(self, tag, attrs):
        assert tag not in {"a", "nav", "script", "iframe", "object", "embed", "form", "button", "input", "link"}, f"Unexpected navigable or active element: {tag}"
        assert not any(k.lower().startswith("on") or k.lower() in {"src", "href", "action"} for k, v in attrs), "External or interactive dependency"


def main():
    source = ROOT / "deploy/closed/index.html"
    html = source.read_text()
    CheckSplash().feed(html)
    for phrase in (
        "Thank you for tending the Ernos Labs garden.",
        "We have closed, and the seeds are dormant.",
        "We hope we can continue again in the future.",
    ):
        assert phrase in html
    assert (ROOT / "CNAME").read_text().strip() == "ernoslabs.com"
    OUTPUT.mkdir(exist_ok=True)
    assert all(p.is_file() and p.name in EXPECTED and not p.is_symlink() for p in OUTPUT.iterdir()), "Refusing unexpected output files"
    shutil.copyfile(source, OUTPUT / "index.html")
    shutil.copyfile(source, OUTPUT / "404.html")
    shutil.copyfile(ROOT / "CNAME", OUTPUT / "CNAME")
    (OUTPUT / "robots.txt").write_text("User-agent: *\nDisallow: /\n")
    (OUTPUT / ".nojekyll").write_text("")
    assert {p.name for p in OUTPUT.iterdir()} == EXPECTED
    assert (OUTPUT / "index.html").read_bytes() == (OUTPUT / "404.html").read_bytes()
    print("PASS: five-file splash-only deployment; no content, assets, scripts or navigation.")


if __name__ == "__main__":
    main()
