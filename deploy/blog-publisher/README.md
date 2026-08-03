# Automatic Blog publisher

The macOS launch agent watches `/Users/mettamazza/Desktop/blog posts` and also
checks it every two minutes. It runs `tools/publish_blog.py`, which uses an
isolated checkout under `~/Library/Application Support/ErnosLabs Blog
Publisher/` so unfinished work in the main development checkout is never
staged accidentally.

When Markdown content changes, the publisher regenerates the Blog snapshot,
updates its cache version, commits only Blog files and pushes `main`. The normal
GitHub Pages workflow then validates and deploys the site.

Runtime output is recorded in `~/Library/Logs/ErnosLabs/blog-publisher.log`.

The publisher fails closed if the source unexpectedly appears empty, preventing
a macOS privacy denial from being mistaken for deletion of every post. A
LaunchAgent also needs permission to read the configured source location;
Desktop is privacy-protected on current macOS releases.
