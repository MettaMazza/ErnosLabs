# Dossier — ErnosPlain (the language & compiler)

*Source: `~/Desktop/ErnosPlain Programing Language/`. Read directly. Citations are `file` or `file:line`.*

## 1. Thesis & what it is
ErnosPlain (Ernos) is a **compiled, statically-typed, memory-safe programming language that reads like plain English** and runs at C speed. Source compiles to C, then to a native binary via `clang -O2` — no interpreter, no VM. It has unification-based type inference, an ownership/borrow checker backed by a garbage collector, real concurrency (channels, spawn, async/await, Send/Sync), and — the proof that it's real — it is **self-hosting**: a compiler written in ErnosPlain that compiles itself. Tagline (README:406): *"Ernos — Code that reads like English. Runs like C."*

## 2. Corpus map (what I read / what exists)
- **Docs** — `README.md` (408 lines, read in full), `spec/ernos-spec.md` (438 lines, full EBNF grammar, read in full), `LANGUAGE_REFERENCE.md` (15 KB), `AGENT.md` (27 KB — working philosophy), `docs/claude_opus_4_review.md` (external review).
- **Rust bootstrap compiler** — `src/` ~32,750 lines (README:325). Biggest: `codegen.rs` (384 KB, ~7,700 lines, C gen + full runtime), `type_check.rs` (96 KB), `main.rs` (84 KB, CLI/REPL/pipeline), `optimizer.rs` (70 KB), `parser.rs` (67 KB, recursive descent + Pratt), `lexer.rs` (38 KB), `borrow_check.rs` (30 KB). Backends: `native_codegen.rs` (ARM64), `x86_64_codegen.rs`, `llvm_codegen.rs`. Tooling: `lsp.rs` (48 KB), `bind_c.rs` (54 KB, C-header→.ep binding gen), `diagnostics.rs`.
- **Transpilers (other languages → ErnosPlain)** — 8 of them in `src/`: `transpile_py.rs` (104 KB), `transpile_c.rs`, `transpile_js.rs`, `transpile_go.rs`, `transpile_rs.rs`, `transpile_rb.rs`, `transpile_java.rs`, `transpile_ts.rs`. Plus emitters **out**: `emit_c.rs`, `emit_js.rs`, `emit_python.rs`.
- **Self-hosted compiler (in ErnosPlain)** — `epc.ep` (driver, 266 lines), `ep_lexer.ep` (540), `ep_parser.ep` (1,396), `ep_codegen.ep` (3,622). **5,824 lines total** (README:337). [[ernoslabs-showcase-site]] playground interpreter mirrors this idea.
- **stdlib** — 24 modules in `stdlib/` (string, collections, fs, net, http, json, csv, datetime, crypto, regex, sync, os, test, log, math, sort, sql, gui, hash, toml, static_server, websocket, select, structured).
- **FFI bridges** — `stdlib/bridge/` 29 bindings: raylib, sdl2, ncurses, cairo, libpng, stb_image, stb_truetype, miniaudio, libsndfile, curl, openssl, libsodium, zlib, sqlite, jansson, expat, pcre, libgit2, libuv, lmdb, termbox2, portmidi, freetype, lua, mongoose, mosquitto, libnotify, libusb, chipmunk.
- **Tests/examples** — `conformance/` (5 categories + `.expected` golden files), `tests/` (120 files), `demos/` (RPG battle system, creature_quest, concurrency_chat), `examples/`.
- **History** — git: **110 commits**, 2026-05-24 → 2026-06-27. The very first commit is already *"Bootstrapped and self-hosting."*

## 3. Core capabilities (sourced)
- **Plain-English syntax, dual forms** — words *or* symbols: `plus`/`+`, `is greater than`/`>`, `and also`/`&&` (spec §1.2–1.3, §5). `and` is context-sensitive: logical-AND in conditions, argument-separator in calls (spec:240).
- **Type system** — primitives Int/Float/Bool/Str/DynStr/Any; compound List/Structure/Choice/Fun; **HM-style unification inference without let-generalization** (spec §2.4, README:56). Hard errors: wrong declared return type, conflicting list-element types, undefined names (README:61-69 shows three rejected programs).
- **Memory** — every value has one owner; stack values freed on scope exit, heap values GC-eligible (spec §6.1). **Mark-and-sweep GC**: thread-local GC root stacks (`__thread`), `ep_gc_push_root`/`ep_gc_pop_roots`, **stop-the-world** mark phase, thread registry for cross-thread root walking (spec §6.4). Borrow checker rejects use-after-move, move-while-borrowed, modify-while-borrowed, return-borrow-of-local (README:58) — enforced in **both** `borrow_check.rs` and codegen as a safety net (README:295).
- **Concurrency** — `channel`, `send … to`, `receive from`, `spawn`, `async/await`; **Send/Sync** safety (borrowed refs can't cross threads) (spec §7).
- **Declarations** — functions (typed/async/external-FFI), structures, choices (tagged unions), methods (`define f on Type`), **traits + implementations**, closures (`given x: …`) (spec §3).
- **8 compile targets / backends** — C (default), ARM64 asm, x86_64 asm, LLVM IR, WASM (`--wasm`); release = `-O3 -flto` (README:123-126, spec §10).
- **Full toolchain** (README:112-131) — `ernos` compiler, `--repl` (stateful REPL), `format`, `check`, `test`, `--lsp`, `doc` (API docs from doc comments), `bind` (C-header → .ep), and **`transpile`** from Python/C/JS/Go/Rust/Ruby/Java/TS *into* ErnosPlain.
- **Optimizer** — constant folding, DCE, CSE, LICM, inlining, loop unrolling (README:305).

## 4. Data & artifacts for demos
- **Full EBNF grammar** (spec §11) — ready to render as an interactive grammar; every production maps to a runnable example.
- **Verified golden outputs** — e.g. `conformance/test_structs_enums.expected` → `10,20,Alice,30,200,5`; `test_arithmetic.expected` → `13,7,30,3,1,25,-42`. Real, checkable.
- **Worked examples already in README** — typed functions, concurrency (channels), structs+methods, enums+pattern-matching, namespace imports, FFI `ep_dlopen`/`dlsym`/`dlcall`, transpilation commands. All real, copy-pasteable.
- **The compile pipeline** (README:277-293): Source→Lexer→Parser→TypeChecker→BorrowChecker→Optimizer→C→clang. Already on the site as chips; could animate with the real artifact at each stage.
- **Self-hosting bootstrap** (README:340-347): Rust compiler builds `epc.ep`; `epc` then compiles `hello.ep`. A two-step story worth visualising.

## 5. Quotable substance
- README:32 — *"No curly braces. No semicolons. No noise. Just code that reads like instructions."*
- AGENT.md — *"Ernos must always be self-hosting and self-compiling… It is the proof that the language works. If the self-hosted compiler cannot compile itself, the language is broken."*
- AGENT.md Rule 1 — *"FORBIDDEN: 'This should work' … REQUIRED: Compile it. Run it. Paste the output. THEN say it works."* (the project's anti-hallucination discipline — mirrors [[user-maria-standard]]).

## 6. → Translatable to the site (ranked)
1. **Guided, runnable language tour** (high value, low effort) — one card per construct (vars, functions, typed params, if/loops, lists, f-strings, structures, choices+match, closures), each with a **Run** button feeding the existing playground interpreter. The interpreter already covers most of this; pattern-matching/structs would need small interpreter additions.
2. **Interactive grammar / syntax map** (med/low) — render the EBNF (spec §11) with each production linking to a live example. Pure content + wiring.
3. **"Translate into ErnosPlain" showcase** (med) — show the 8 transpilers: paste/preset Python or Rust, show the ErnosPlain it becomes (static side-by-side pairs first; live needs the Rust compiler, so ship curated pairs).
4. **The toolchain & backends panel** (low) — REPL/LSP/formatter/doc/bind + 8 backends + 29 FFI bridges as an honest "this is a real toolchain" grid (we currently undersell this).
5. **Self-hosting visual** (med) — animate "the compiler compiles itself" (Rust → epc.ep → compiles hello). Strong, on-brand story.
6. **Memory/ownership explainer** (med) — a small visual of move vs borrow vs GC, using the three rejected programs from README:61-69.

## 7. Gaps / questions for Maria
- The site stat says "51/51 tests" (README badge) but there are 120 files in `tests/` + conformance. Which number do you want shown — conformance (51) or total? 
- Want the transpilers featured prominently (they're a standout and currently absent from the site)?
- Are floats fully supported now, or still "partially supported in codegen" (spec:49)? Affects which playground examples we show.
