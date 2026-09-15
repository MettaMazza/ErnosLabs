"""Publish the closed splash plus the explicitly reopened ErnosDecent page."""
from html.parser import HTMLParser
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "_closed_site"
EXPECTED = {
    "index.html", "404.html", "robots.txt", "CNAME", ".nojekyll",
    "ernosdecent.html", "assets",
}
PUBLIC_ASSETS = (
    "css/site.css",
    "js/api-base.js",
    "js/spa.js",
    "js/kokoro-tts.js",
    "js/site.js",
    "js/decent.js",
    "js/sft.js",
)
PUBLIC_DATA_DIRS = ("sft",)


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
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()
    shutil.copyfile(ROOT / "index.html", OUTPUT / "index.html")
    shutil.copyfile(source, OUTPUT / "404.html")
    shutil.copyfile(ROOT / "CNAME", OUTPUT / "CNAME")
    shutil.copyfile(ROOT / "ernosdecent.html", OUTPUT / "ernosdecent.html")
    for relative in PUBLIC_ASSETS:
        destination = OUTPUT / "assets" / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / "assets" / relative, destination)
    for directory in PUBLIC_DATA_DIRS:
        shutil.copytree(ROOT / "assets" / "data" / directory, OUTPUT / "assets" / "data" / directory)
    (OUTPUT / "robots.txt").write_text("User-agent: *\nAllow: /\n")
    (OUTPUT / ".nojekyll").write_text("")
    assert {p.name for p in OUTPUT.iterdir()} == EXPECTED
    assert all((OUTPUT / "assets" / relative).is_file() for relative in PUBLIC_ASSETS)
    assert (OUTPUT / "404.html").read_bytes() == source.read_bytes()
    print("PASS: reopened landing page and ErnosDecent page; all other paths remain the splash.")


if __name__ == "__main__":
    main()
