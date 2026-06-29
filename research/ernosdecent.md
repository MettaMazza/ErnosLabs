# Dossier — ErnosDecent (the platform)

*Source: `~/Desktop/ErnosDecent./`. Read directly: `README.md`, `docs/system_guide_synthesis.md`, module trees. Citations `file:line`.*

## 1. Thesis & what it is
ErnosDecent is **one program you run on your own computer that replaces the internet's infrastructure** — identity, networking, money, storage, messaging, publishing, naming, hosting, search, media, privacy, AI — built from cryptographic primitives up, owned by no one. v1.0.0-beta: **17 subsystems, ~103 modules, ~30,300 source lines + ~12,700 test lines, 94 test files** (README:45). Every `.ep` file compiles to a native binary; `node.ep` is the daemon coordinating all subsystems (IPC on port 5000, web on 8088). Written in [[ernoslabs-showcase-site]]'s sibling language, ErnosPlain.

## 2. Corpus map (17 subsystems, with measured size)
`decent_agent` (11,911 lines) · `decent_net` (8,690) · `decent_money` (4,330) · `decent_id` (3,596) · `decent_store` (3,310) · `decent_ai` (3,041) · `decent_consensus` (2,250) · `decent_media` (2,442) · `decent_msg` (1,551) · `decent_social` (1,047) · `decent_search` (819) · `decent_anon` (765) · `decent_pool` (750) · plus `decent_name`, `decent_host`, `decent_cli`, `decent_web`. Docs: `README.md` (576 lines), `docs/system_guide_synthesis.md` (334 lines — deep formulas/schemas for 9 subsystems, read in full), plus per-subsystem guides in `docs/`.

## 3. Core algorithms & schemas (sourced to system_guide_synthesis.md)
The substance the site should *show*, not describe:
- **decent_net** — Noise XX handshake (3-message sequence, §1); **Kademlia DHT**, XOR distance `d(x,y)=x⊕y` evaluated byte-by-byte, **k=20** buckets covering `[2^i, 2^{i+1}-1]`; `O(log N)` lookup; tables `dht_peers`, `dht_values` (synthesis:44-49).
- **decent_consensus** — **Raft**; quorum `Q=⌊N/2⌋+1`; **undo-stack rollback** with explicit inverse ops (SET→SET(old), ADD→SUB, SUB→ADD, DEL→SET(old)) (synthesis:76-85).
- **decent_money** — UTXO ledger (1 token = 1,000,000 microunits); **AMM constant product** `x·y=k`, with fee γ=0.003: `Δy = y·Δx·(1−γ) / (x + Δx·(1−γ))`; price-priority limit orderbook; stack-VM smart contracts with **gas metering** (ADD=3, SSTORE=200) + storage-snapshot REVERT (synthesis:119-124).
- **decent_store** — content-addressed (SHA-256 chunks); **Merkle** `H_parent=SHA256(H_left‖H_right)`; **CRDT merges**: G-Counter (element-wise max), LWW-Register (higher timestamp wins), OR-Set (add-wins, unique tags), MV-Register (vector-clock) (synthesis:148-160).
- **decent_id** — Ed25519 (signing) + X25519 (encryption); DID = `did:key:<pubkey>`; keystore JSON `ERNOSDECENT_KEYSTORE_V1`; **PBKDF2-HMAC-SHA256 ×10,000** for storage key, **PBKDF2-HMAC-SHA512 ×2,048** for BIP39 seed (synthesis:186-191).
- **decent_name** — `.decent`/`.ernos` TLD; **3-tier cascade** Cache→SQLite→DHT (key `"name:"‖n`); **300 s TTL** (synthesis:212-216).
- **decent_agent** — ReAct loop; tiered memory (scratchpad/lessons/timeline) + **Hebbian graph**: strengthen `w←w+0.1(1−w)` (scaled ×1e6), permanent at 0.99, decay `w←0.95w`, prune below 0.01; cosine recall >0.5; **3D Turing-grid tape** with `x_y_z` cell keys and LEFT/RIGHT/IN/OUT/DOWN/UP moves (synthesis:258-269). Agent-parity adds a 9-tool guarded surface, a fail-closed LLM **observer** audit gate (default BLOCKED), provider/model router, and Discord/Telegram/WhatsApp bridges (synthesis:225).
- **decent_social** — Nostr events + ActivityPub actors, unified feed. **gitdec** — sovereign git over Nostr (kinds 20020 manifest / 20021 push / 20022 issues / 20023 PRs), Ed25519-gated collaborators (synthesis:302-332).
- **decent_ai** — GGUF inference, embeddings, speech-to-text, **Kokoro TTS** (the same model now in the Library reader [[ernoslabs-showcase-site]]).
- **decent_anon** — onion routing + mixnet. **decent_search** — crawler + BM25 + PageRank. **decent_pool** — bandwidth tiers + compute queue + symbiotic mesh. **decent_media** — WebRTC + adaptive streaming + codecs + P2P CDN.

## 4. Data & artifacts for demos
Every formula above is a ready demo input: the AMM curve (live swap), CRDT merges (two replicas → merged), XOR routing (already on site), Raft undo-stack (animate the inverse ops), PBKDF2 cost (iteration counter), Hebbian (already on site), the keystore JSON schema, the DB table schemas (real columns), the Noise XX 3-message handshake, the Nostr kind table. `node.ep` exposes a real IPC command vocabulary (`STATUS`, `MONEY TRANSFER`, `MONEY SWAP`, `NAME REGISTER/RESOLVE`, `AI INFER`, `GITDEC …`) that can drive a faithful mock console.

## 5. Quotable substance
- README:45 — *"The core architecture is implemented and verified. 17 subsystems comprise roughly 103 source modules (~30,300 source code-lines plus ~12,700 test lines)."*
- The architecture stack (README:156-213) is itself a quotable diagram: id → net → store → consensus → … → web, each built on the layer below.

## 6. → Translatable to the site (ranked)
1. **A live mini-demo per subsystem** (high value) replacing prose — each grounded in the real formula: AMM swap (constant-product curve), CRDT merge (G-Counter/LWW/OR-Set side-by-side), content-addressing + Merkle tree (paste text → chunks → root), DID/keystore generator (Ed25519 + PBKDF2 iteration meter), name-resolution cascade (Cache→SQLite→DHT). We already have DHT, Hebbian, Raft.
2. **The clickable architecture diagram** (already started) wired to the real 17-subsystem stack + per-layer descriptions and line counts.
3. **Mock node console** driven by the real IPC command vocabulary (STATUS/TRANSFER/SWAP/INFER/GITDEC) — feels like operating the daemon.
4. **The Noise XX handshake** + **onion/mixnet** as small animated sequences (we have onion described; animate it).
5. **An honest "what's done vs partial" ledger** (agent-parity Phase 6 is partial — synthesis:225) — transparency reads as credibility.

## 7. Gaps / questions for Maria
- TLD inconsistency: README:161 says `.ernos` TLD, the synthesis says `.decent`. Which is canonical for the site?
- Which subsystems matter most to you to feature as live demos (we can't build all 17 deeply at once — suggest: money/AMM, store/CRDT, id/keys, net/DHT, agent/Hebbian)?
- decent_ai uses Kokoro TTS natively — want to connect that story to the Library's Kokoro read-aloud explicitly ("the same local voice model the platform ships")?
