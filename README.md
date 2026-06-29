# Ernos Labs

An interactive showcase of Maria Smith's work — a place where visitors **use** the
projects in the browser, not just read about them. A static site, deployable to GitHub
Pages or Netlify, with no backend.

**The whole site is authored in [ErnosPlain](ernosplain.html)** and compiled to the
browser by the Ernos compiler — the same toolchain the projects themselves use. The
`.ep` files in `src/` are the real code; everything in `assets/js/` is generated.

## The four pillars

| Page | What you can do |
|------|-----------------|
| **ErnosPlain** (`ernosplain.html`) | Write code and run it on a real interpreter — itself written in ErnosPlain. |
| **The Smithian Fold** (`sftom.html`) | Fold rationals into periodic orbits; watch `1/α = 137.036` fall out of one integer with zero free parameters; tour the prime-sector particle census. |
| **ErnosDecent** (`ernosdecent.html`) | Route a Kademlia DHT by XOR distance, train a Hebbian memory graph, drive a 5-node Raft cluster through elections and partitions. |
| **The Library** (`library.html`) | Read *The Last Mind* (five volumes), *A Mind Is Born*, and the ErnosDecent book — with chapters, in-text search, font controls, and read-aloud. |

## Layout

```
src/              ErnosPlain source — the real code
  site.ep         shared shell: mesh background, nav, scroll-reveal
  md.ep           markdown renderer (library + docs)
  reader.ep       library catalog + reader
  interp.ep       the ErnosPlain interpreter (in ErnosPlain)
  playground.ep   playground UI
  fold.ep         Smithian Fold engine + visualizers
  decent.ep       ErnosDecent demos (DHT, Hebbian, Raft)
assets/css/site.css   design system (hand-written CSS — the only styling)
assets/js/*.js        EMITTED from src/*.ep — do not hand-edit
content/library/*.md  the bundled writing
*.html                page shells that load the emitted JS
build.sh              compiles every src/*.ep -> assets/js/*.js
```

## Build

Requires the Ernos compiler (`ernos`) on your `PATH` or at `~/.local/bin/ernos`.

```sh
./build.sh          # emits every src/*.ep to assets/js/  (fails loudly on a bad .ep)
```

A failed emit fails the build — the `.ep` sources are compile-gated.

## Preview locally

```sh
python3 serve.py 8099      # then open http://127.0.0.1:8099
```

## Deploy

The deploy ships the **emitted** `assets/js/*.js` (Pages and Netlify don't run the Ernos
compiler), so run `./build.sh` before deploying.

- **GitHub Pages** — push the repo; `.nojekyll` is included so `assets/` is served as-is.
- **Netlify** — `netlify.toml` sets the publish directory to the repo root.

No backend, no secrets, no tracking. Everything runs client-side.

---

© Maria Smith. Built in ErnosPlain.
