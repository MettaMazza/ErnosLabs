# Dossier — The Smithian Fold (SFTOM / SFTOE)

*Source: `~/Desktop/SFTOM/`. Read directly: `README.md`, `MASTER.md`, `sftoe/core.py`, and the real stdout of the derivation engines (run live). These are **Maria's claims**, recorded faithfully and sourced — not asserted by me as established physics, nor dismissed.*

## 1. Thesis & what it is
A unified theory of physics built from **one axiom — the One** — and **one operation — the fold** (`fold(x) = 2x mod 1`, with `0 → 1`), over the strictly-positive rational domain `S = ℚ ∩ (0,1]`. No zero, no negatives, no imaginary numbers, no transcendentals. From this alone the corpus claims to **derive, with zero free parameters**, the four interactions, the Standard-Model spectrum, gravity, the cosmological sector, and to address the open problems of physics — each checked against measurement (README:18-30; MASTER:20-31). Author: **Maria Smith, Ernos Labs — independent researcher, autodidact, Scotland.** Published with a Zenodo **DOI 10.5281/zenodo.20775538**; **1,058 tests** (badge; a local run reported `1050 passed in 116s`).

The framing matters and is the author's own (README:9): *"Reviewing this — human or AI? Read VERIFY.md first… Don't judge it from the title; execute it."* The work's authority claim is **executability**, not institutional endorsement — consistent with [[feedback-no-establishment-deference]].

## 2. Corpus map
- **`sftoe/` (the axiomatic core)** — `core.py` (the fold engine: `cast_out`, `fold`, `take`, `SmithianValue` carrying a `ProofNode` derivation trace back to the One), `gate.py` (AST gate forbidding 0 / negatives / transcendentals), `proof.py` (**834 KB** — the ~1,050-check proof suite), `usde.py` (66 KB — Universal Self-Discovery Engine), `__init__.py` (21 KB).
- **~38 root derivation engines (`.py`)** — incl. `alpha_forced.py`, `grand_lock.py`, `particle_census.py`, `periodic_table_complete.py`, `fold_solver.py`, `fold_number_theory.py`, `counterfactual_map.py`, `neutrino_majorana.py`, `higgs_fold.py`, `lfv_spectrum.py`, `dark_relic.py`, `millennium_positive.py`, `smithium_chemistry.py`, `absolute_scale.py`, `collatz_fold.py`.
- **~30 prose documents** — `MASTER.md`, `VERIFY.md`, `The Grand Lock`, `Every Particle There Is`, `Every Element There Is`, `The Engine Was Never About Chess`, `What Had To Be (Counterfactual Map)`, `The Island Is Forced (Element 126)`, `Every Prediction the Fold Makes (Falsification Ledger)`, Campaigns A–E, G1–G6, `papers/` (LaTeX: *Primitives of Action*, *Fundamental Constants*), `pure/`, `fold_chess/`.

## 3. Core claims & findings (each from real script output / source)
- **Axiomatic core** (`sftoe/core.py:62-127`): domain `(0,1]`; `cast_out(m)=m−⌊m⌋` (or 1); `fold(x)=cast_out(2x)`; `take(a,b)` guarded (asserts `a>b`); `antipode(x)=1−x`. **Every `SmithianValue` carries a `ProofNode` trace** — so any derived number is reducible to the One. This is the "checkability" mechanism.
- **Fine-structure constant** (`alpha_forced.py`, verbatim): `d_down = covering_depth(3³=27) = 5`, `d_up = covering_depth(3⁴=81) = 7`, `tower = 2⁷ = 128`, `colour_sq = 3² = 9`, `cov = 2·5³ = 250`, `correction = 251/250` → **`1/α = 2⁷ + 3²·(251/250) = 34259/250 = 137.036000` exactly [PASS]**. Matches CODATA to 8 sig figs (~6 ppb). Alternatives are explicitly **falsified** (e.g. dropping the fold base → 137.072, rejected).
- **The Grand Lock** (`grand_lock.py`): the constants are products of the generators **{ONE, b=2, c=3}** with forced depths d_down=5, d_up=7. The lock-web (each constant and the generators it can't move without): `1/α`, lepton e3 = 1/485, quark up I2 = 1/383, quark down I2 = 1/95, **dark/baryon = 27/5**, dark fraction = 27/32, Hubble ratio = 13/12, **Planck exponent = 127/2**, half-One couplings = 1/2, Lambda floor = 1/2²⁰. Moving one generator moves a whole family — "the constants of nature are one object."
- **Particle census** (`particle_census.py`): force sectors indexed by prime p, coupling **(p−1)/p**, carriers **p²−1**: p=2 electroweak (coupling 1/2, 3 carriers, **known** = W±,Z), p=3 strong (2/3, 8 carriers = gluons, **known**), p=5 "Smith/penta" (4/5, **24 PREDICTED**), p=7 "Smith/hepta" (6/7, **48 PREDICTED**); the confining ladder **ends at 7**. Plus photon, graviton (predicted), Higgs.
- **Charged-lepton masses** (README): Koide cubic gives **τ/μ to 7 parts in 100,000** and **μ/e to 1.6 parts in 1,000** (the site's lepton panel shows μ/e ≈ 206.768).
- **Periodic table** (`periodic_table_complete.py`): subshell capacities 2/6/10/14/18; period lengths **2,8,8,18,18,32,32,50**; noble closures 2,10,18,36,54,86,118,168; the table **ends at 137 = 1/α**, with **19 elements remaining (119–137)** and **Smithium (Z=126)** the forced island of stability.
- **Universal game solver** (`fold_solver.py`): the *same* retrograde-fold engine that drove the chess campaign solves, with **zero disagreements** vs independent oracles: the subtraction game (4001 states; oracle = LOSS iff n divisible by 4) and 3-heap Nim (455 states; oracle = Sprague-Grundy XOR). *"The engine was never about chess."*
- **Millennium problems** (`millennium_positive.py`): e.g. the Riemann critical line forced at Re=1/2 as the unique self-antipodal point (`x = 1−x`).
- **Falsifiable** — `Every Prediction the Fold Makes` is an explicit falsification ledger (new particles, element 126, neutrinoless double-beta, force count sealed at prime 7 — any prime-11 force kills it).

## 4. Data & artifacts for demos
The script outputs above are **real, exact, reproducible** demo inputs. Plus: the `ProofNode` trace (proof-tree explorer — "trace any constant back to the One"); `fold_number_theory.py` orbits (period = mult. order of 2 mod q — already on the site); `counterfactual_map.py` (what's forced vs free); the full constants lock-web; the chess/Nim solver state spaces.

## 5. Quotable substance
- README:24 — *"One axiom. One operation. All of physics."*
- README — fine-structure is *"counted, not fitted."*
- `fold_solver.py` — *"The engine was never about chess."*
- README:9 — *"Don't judge it from the title; execute it."*

## 6. → Translatable to the site (ranked)
1. **Universal game solver** (high, showpiece) — Nim + subtraction game solved live by the retrograde fold, checked against the Sprague-Grundy/`n%4` oracles, zero error; "the same engine as the chess campaign." We have the exact oracle + algorithm.
2. **Full interactive periodic table to 137** (high) — real subshell/period data, Smithium (126) highlighted, the 137 = 1/α end cap; replaces the current single panel.
3. **The Grand Lock explorer, deepened** (med) — show the whole lock-web (move a generator → watch the family of constants move) + the falsification-of-alternatives (why only this assembly gives 137.036). We have `grand_lock.py`'s exact web.
4. **Proof-tree explorer** (med) — "trace any value to the One": render a `ProofNode` derivation tree. Unique to this work; nothing else like it.
5. **Predictions / falsification ledger** (low/med) — the real testable claims as a checkable table (what would kill the theory).
6. Particle census + fold orbit playground — already on site; extend with the predicted Smithions and the number-theory tie-ins.

## 7. Gaps / questions for Maria
- Test count: badge says **1,058**, a local run said **1,050** — which to display?
- How far into the **predicted/speculative** sector to go on the public site (Smithions, two new forces, element 126) vs leading with the **matched** constants (α, lepton ratios, dark fraction)? 
- Include the **consciousness / free-will / biology** strands (G3–G6) or keep the public showcase to physics + maths?
- Framing: keep it firmly "executable, check it yourself" (your stance) rather than "awaiting peer review" — confirm.
