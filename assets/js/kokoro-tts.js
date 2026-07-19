/**
 * Kokoro TTS — global read-aloud engine for Ernos Labs.
 *
 * The browser can't run native Kokoro on local weights, so for fast, real
 * Kokoro (am_fable) this talks to a Kokoro *server* over HTTPS — any
 * OpenAI-compatible TTS endpoint (e.g. kokoro-fastapi: POST /v1/audio/speech).
 * Audio comes back per sentence and is scheduled back-to-back on the Web Audio
 * clock for gapless playback. If no endpoint is configured (or it's unreachable
 * / cold), it falls back instantly to the browser's built-in voice, so
 * read-aloud always works.
 *
 * Configure the endpoint (no rebuild needed):
 *   window.kokoroTTS.setEndpoint("https://your-kokoro.hf.space")   // persists
 * or set window.KOKORO_ENDPOINT before this script, or bake KOKORO_ENDPOINT.
 *
 * Hand-written JS (not compiled from .ep). Exposes window.kokoroTTS.
 */
(function () {
  "use strict";

  // Default endpoint: Maria's local Kokoro server (serve_local.py on :8880).
  // When it's running, read-aloud uses the real local Fable voice instantly.
  // When it's not (any other visitor), the fetch fails fast and we fall back to
  // the browser voice. Override with setEndpoint()/window.KOKORO_ENDPOINT.
  // Resolved by api-base.js: same-origin when the source machine serves the
  // site, else the funnel. Read lazily (at play time) so resolution is done.
  const KOKORO_ENDPOINT = null;
  const DEFAULT_VOICE = "bm_fable";
  // api-base.js already detects a truly offline source machine before play.
  // Give an online Kokoro enough room to queue briefly under concurrent use
  // instead of replacing Maria's voice with a browser voice after 12 seconds.
  const FIRST_TIMEOUT_MS = 30000;
  const GEN_TIMEOUT_MS = 30000;   // subsequent requests

  let audioCtx = null;
  let playing = false;
  let paused = false;
  let session = null;        // identity token for the active play() call
  let ticker = null;         // progress interval
  let keepAlive = null;      // browser-voice keep-alive (Chrome long-speech bug)
  let onStatusChange = null; // (status, detail)
  let onProgress = null;     // ({ phase, current, total, fraction })
  let readAlong = null;      // DOM word map for the active narration
  let clearHighlightTimer = null;
  let followSuppressedUntil = 0;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function setStatus(status, detail) { if (onStatusChange) onStatusChange(status, detail); }
  function emit(phase, current, total) {
    if (onProgress) onProgress({ phase, current, total, fraction: total ? current / total : 0 });
  }

  function resolveEndpoint() {
    try {
      if (typeof window !== "undefined" && window.KOKORO_ENDPOINT) return String(window.KOKORO_ENDPOINT);
      const s = localStorage.getItem("kokoroEndpoint");
      if (s) return s;
    } catch (e) {}
    return window.ERNOS_API || KOKORO_ENDPOINT;
  }

  // ---- text sanitisation: never speak markdown or stray symbols ----------
  const SYMBOL_WORDS = {
    "α": "alpha", "β": "beta", "γ": "gamma", "δ": "delta", "λ": "lambda",
    "μ": "mu", "π": "pi", "σ": "sigma", "τ": "tau", "θ": "theta", "Λ": "lambda",
    "×": " times ", "÷": " divided by ", "⊕": " xor ", "→": " to ", "≈": " approximately ",
    "≥": " at least ", "≤": " at most ", "≠": " not equal to ", "·": " ",
    "²": " squared ", "³": " cubed ", "½": " one half ", "⌊": " ", "⌋": " ",
    "∕": " over ", "%": " percent ",
  };

  function sanitize(text) {
    if (!text) return "";
    let t = text;
    t = t.replace(/```[\s\S]*?```/g, " ");
    t = t.replace(/`[^`]*`/g, " ");
    t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
    t = t.replace(/https?:\/\/\S+/g, " ");
    t = t.replace(/&[a-z]+;/gi, " ");
    t = t.replace(/[*_#>~|^]+/g, " ");
    t = t.replace(/[—–]/g, ", ");
    t = t.replace(/[•◦▪●◆▶►«»·∙]/g, ", ");
    for (const [sym, word] of Object.entries(SYMBOL_WORDS)) t = t.split(sym).join(word);
    t = t.replace(/[^\p{L}\p{N}\s.,!?;:'"()/-]/gu, " ");
    t = t.replace(/\s*\n+\s*/g, ". ");
    t = t.replace(/\.{2,}/g, ".");
    t = t.replace(/\s+([.,!?;:])/g, "$1");
    t = t.replace(/([.,!?;:]){2,}/g, "$1");
    t = t.replace(/\s{2,}/g, " ").trim();
    return t;
  }

  function chunkText(text) {
    const sentences = text.match(/[^.!?\n]+[.!?]*\s*/g) || [text];
    const chunks = [];
    let cur = "";
    // First chunk short so the first audio arrives fast; later chunks larger.
    for (const s of sentences) {
      cur += s;
      const limit = chunks.length === 0 ? 70 : 170;
      if (cur.length >= limit) { chunks.push(cur.trim()); cur = ""; }
    }
    if (cur.trim()) chunks.push(cur.trim());
    return chunks.length ? chunks : [text];
  }

  // ---- synchronized read-along ------------------------------------------
  // Kokoro returns audio rather than word timestamps. Map the words in every
  // generated chunk back to their original DOM text nodes, then divide the
  // measured AudioBuffer duration by word length and punctuation pauses. This
  // follows the actual generated segment instead of assuming a fixed WPM.
  const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’/-][\p{L}\p{N}]+)*/gu;
  const SOURCE_PATTERN = /[\p{L}\p{N}]+(?:['’/-][\p{L}\p{N}]+)*|[αβγδλμπστθΛ×÷⊕→≈≥≤≠·²³½⌊⌋∕%]/gu;

  function normalizedWord(word) {
    return String(word || "")
      .toLocaleLowerCase()
      .replace(/[’']/g, "")
      .replace(/[^\p{L}\p{N}]/gu, "");
  }

  function narrationRoots() {
    const doc = document.getElementById("doc");
    if (doc && (doc.textContent || "").length > 60) return [doc];
    return Array.from(document.querySelectorAll("header h1, header p, section h2, section h3, section p"))
      .filter((el) => !el.classList.contains("eyebrow"));
  }

  function sourceWordMap() {
    const entries = [];
    const skip = "script, style, code, pre, button, select, textarea, [aria-hidden='true']";
    for (const root of narrationRoots()) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          return parent && !parent.closest(skip) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
      });
      let node;
      while ((node = walker.nextNode())) {
        SOURCE_PATTERN.lastIndex = 0;
        let match;
        while ((match = SOURCE_PATTERN.exec(node.nodeValue))) {
          const spoken = sanitize(match[0]).match(WORD_PATTERN) || [];
          for (const word of spoken) {
            entries.push({
              node,
              start: match.index,
              end: match.index + match[0].length,
              word: normalizedWord(word),
            });
          }
        }
      }
    }
    return entries;
  }

  function chunkWords(chunk) {
    const words = [];
    WORD_PATTERN.lastIndex = 0;
    let match;
    while ((match = WORD_PATTERN.exec(chunk))) {
      const tail = chunk.slice(match.index + match[0].length, match.index + match[0].length + 3);
      let pause = 0;
      if (/[.!?]/.test(tail)) pause = 0.85;
      else if (/[,;:]/.test(tail)) pause = 0.36;
      const weight = 0.72 + Math.min(match[0].length, 14) * 0.055 + pause;
      words.push({ text: match[0], start: match.index, end: match.index + match[0].length, weight, target: null });
    }
    let cumulative = 0;
    for (const word of words) { cumulative += word.weight; word.endWeight = cumulative; }
    words.totalWeight = cumulative || 1;
    return words;
  }

  function buildReadAlong(chunks) {
    const source = sourceWordMap();
    const mappedChunks = chunks.map(chunkWords);
    let sourceIndex = 0;
    for (const words of mappedChunks) {
      for (const word of words) {
        const wanted = normalizedWord(word.text);
        let found = -1;
        for (let probe = sourceIndex; probe < source.length; probe++) {
          if (source[probe].word === wanted) { found = probe; break; }
        }
        if (found >= 0) {
          word.target = source[found];
          sourceIndex = found + 1;
        }
      }
    }
    return { chunks: mappedChunks, activeKey: "" };
  }

  function removePaint() {
    try { if (window.CSS && CSS.highlights) CSS.highlights.delete("ernos-read-word"); } catch (e) {}
    const overlay = document.getElementById("tts-word-overlay");
    if (overlay) overlay.remove();
    if (readAlong) readAlong.activeKey = "";
  }

  function clearReadAlong() {
    if (clearHighlightTimer) { clearTimeout(clearHighlightTimer); clearHighlightTimer = null; }
    removePaint();
    readAlong = null;
  }

  function finishReadAlong() {
    if (clearHighlightTimer) clearTimeout(clearHighlightTimer);
    clearHighlightTimer = setTimeout(() => {
      clearHighlightTimer = null;
      clearReadAlong();
    }, 650);
  }

  function paintWord(target, key) {
    if (!target || !target.node || !target.node.isConnected || !readAlong) return;
    if (readAlong.activeKey === key) return;
    readAlong.activeKey = key;
    const range = document.createRange();
    try { range.setStart(target.node, target.start); range.setEnd(target.node, target.end); }
    catch (e) { return; }

    let usedCssHighlight = false;
    try {
      if (window.CSS && CSS.highlights && window.Highlight) {
        CSS.highlights.set("ernos-read-word", new window.Highlight(range));
        usedCssHighlight = true;
      }
    } catch (e) {}

    const oldOverlay = document.getElementById("tts-word-overlay");
    if (usedCssHighlight) {
      if (oldOverlay) oldOverlay.remove();
    } else {
      const rect = range.getBoundingClientRect();
      const overlay = oldOverlay || document.body.appendChild(document.createElement("span"));
      overlay.id = "tts-word-overlay";
      overlay.setAttribute("aria-hidden", "true");
      overlay.style.left = rect.left + "px";
      overlay.style.top = rect.top + "px";
      overlay.style.width = Math.max(2, rect.width) + "px";
      overlay.style.height = Math.max(2, rect.height) + "px";
    }

    if (Date.now() < followSuppressedUntil) return;
    const rect = range.getBoundingClientRect();
    const topComfort = Math.max(92, window.innerHeight * 0.22);
    const bottomComfort = window.innerHeight * 0.72;
    if (rect.top < topComfort || rect.bottom > bottomComfort) {
      const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const top = Math.max(0, window.scrollY + rect.top - window.innerHeight * 0.34);
      window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    }
  }

  function showReadWord(chunkIndex, wordIndex) {
    if (!readAlong) return;
    const words = readAlong.chunks[chunkIndex];
    const word = words && words[Math.max(0, Math.min(wordIndex, words.length - 1))];
    if (word && word.target) paintWord(word.target, chunkIndex + ":" + wordIndex);
  }

  function showReadProgress(chunkIndex, fraction) {
    if (!readAlong) return;
    const words = readAlong.chunks[chunkIndex];
    if (!words || !words.length) return;
    const point = Math.max(0, Math.min(0.999999, fraction || 0)) * words.totalWeight;
    let wordIndex = words.findIndex((word) => point < word.endWeight);
    if (wordIndex < 0) wordIndex = words.length - 1;
    showReadWord(chunkIndex, wordIndex);
  }

  // ---- audio -------------------------------------------------------------
  function ensureCtx() {
    if (!audioCtx || audioCtx.state === "closed") {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { audioCtx = null; }
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  // Trim leading/trailing near-silence so server segments butt up gaplessly.
  function trimBuffer(buf) {
    if (!buf || !audioCtx) return buf || null;
    const data = buf.getChannelData(0);
    const thr = 0.006;
    let end = data.length; while (end > 1 && Math.abs(data[end - 1]) < thr) end--;
    let start = 0; while (start < end - 1 && Math.abs(data[start]) < thr) start++;
    if (start === 0 && end === data.length) return buf;
    const out = audioCtx.createBuffer(1, Math.max(1, end - start), buf.sampleRate);
    out.getChannelData(0).set(data.subarray(start, end));
    return out;
  }

  // Fetch one sentence of speech from the Kokoro server (OpenAI-compatible).
  async function genServer(ep, text, voice, token, timeoutMs) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs || GEN_TIMEOUT_MS);
    try {
      const res = await fetch(ep.replace(/\/+$/, "") + "/v1/audio/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "kokoro", voice, input: text, response_format: "wav" }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error("voice server HTTP " + res.status);
      const arr = await res.arrayBuffer();
      if (session !== token || !audioCtx) return null;
      const decoded = await audioCtx.decodeAudioData(arr);
      return trimBuffer(decoded);
    } finally { clearTimeout(t); }
  }

  // ---- the player --------------------------------------------------------
  async function play(text, voice) {
    stop();
    const clean = sanitize(text);
    if (!clean) return;
    const my = {}; session = my;
    playing = true; paused = false;
    ensureCtx(); // created inside the click gesture
    let ep = resolveEndpoint();
    const v = voice || DEFAULT_VOICE;
    const chunks = chunkText(clean);
    readAlong = buildReadAlong(chunks);

    // api-base resolves the public source machine asynchronously. A very fast
    // tap after page load must wait for that health check instead of mistaking
    // "not resolved yet" for "offline" and choosing a browser voice.
    if (!ep && window.ernosApiReady && typeof window.ernosApiReady.then === "function") {
      emit("loading", 0, 0);
      setStatus("loading", "Finding Kokoro…");
      try { await window.ernosApiReady; } catch (e) {}
      if (session !== my) return;
      ep = resolveEndpoint();
    }

    if (!ep) { return speakBrowser(clean, my, chunks); } // no server → instant browser voice

    emit("loading", 0, 0);
    setStatus("loading", "Waking the voice…");
    const total = chunks.length;
    const ready = new Array(total).fill(null); // AudioBuffer | "error" | null

    // Fetch the first chunk up front so we can fall back cleanly if the server
    // is down or still cold-starting.
    let first;
    try { first = await genServer(ep, chunks[0], v, my, FIRST_TIMEOUT_MS); }
    catch (e) {
      console.warn("Kokoro server unavailable — using browser voice:", e);
      if (session !== my) return;
      setStatus("fallback", "Using the browser voice");
      return speakBrowser(clean, my, chunks);
    }
    if (session !== my) return;
    ready[0] = first || "error";

    // Fetch the rest in the background while the first plays.
    (async function gen() {
      for (let g = 1; g < total && session === my; g++) {
        try { const b = await genServer(ep, chunks[g], v, my); ready[g] = session === my ? (b || "error") : null; }
        catch (e) { ready[g] = "error"; }
      }
    })();

    // SCHEDULER — place each ready buffer back-to-back on the audio clock.
    const segStart = new Array(total).fill(-1);
    const segDuration = new Array(total).fill(0);
    let clock = 0, started = false, scheduled = 0, endClock = 0;
    (async function sched() {
      for (let i = 0; i < total; i++) {
        if (session !== my) return;
        while (ready[i] === null && session === my) await sleep(35);
        if (session !== my) return;
        const buf = ready[i];
        ready[i] = null;
        if (buf === "error" || !buf) { segStart[i] = clock; scheduled = i + 1; continue; }
        if (!started) { clock = audioCtx.currentTime + 0.12; started = true; }
        else { clock = Math.max(clock, audioCtx.currentTime + 0.02); }
        const node = audioCtx.createBufferSource();
        node.buffer = buf; node.connect(audioCtx.destination);
        try { node.start(clock); } catch (e) {}
        segStart[i] = clock;
        segDuration[i] = buf.duration;
        clock += buf.duration;
        endClock = clock;
        scheduled = i + 1;
      }
    })();

    // PROGRESS TICKER — drives the bar from the audio clock.
    if (ticker) clearInterval(ticker);
    ticker = setInterval(() => {
      if (session !== my) { clearInterval(ticker); ticker = null; return; }
      if (paused) { emit("paused", 0, total); return; }
      if (!started) { emit("loading", 0, total); return; }
      const now = audioCtx.currentTime;
      if (now < segStart[0]) { emit("buffering", 0, total); return; }
      let cur = 0;
      for (let i = 0; i < scheduled; i++) if (segStart[i] >= 0 && now >= segStart[i]) cur = i;
      if (cur >= scheduled - 1 && scheduled < total && now >= endClock - 0.06) { emit("buffering", cur + 1, total); return; }
      if (scheduled >= total && now >= endClock) {
        clearInterval(ticker); ticker = null; playing = false; emit("done", total, total); setStatus("done", "Finished"); finishReadAlong(); return;
      }
      showReadProgress(cur, segDuration[cur] ? (now - segStart[cur]) / segDuration[cur] : 0);
      emit("speaking", cur + 1, total);
    }, 80);
  }

  // ---- browser-voice fallback (instant, no download) ---------------------
  function pickVoice() {
    const vs = (window.speechSynthesis && window.speechSynthesis.getVoices()) || [];
    if (!vs.length) return null;
    const prefer = ["Samantha", "Ava", "Allison", "Serena", "Google US English", "Microsoft Aria", "Karen", "Daniel"];
    for (const name of prefer) { const m = vs.find((v) => v.name && v.name.indexOf(name) >= 0); if (m) return m; }
    return vs.find((v) => /^en[-_]/i.test(v.lang || "")) || vs[0];
  }
  function stopKeepAlive() { if (keepAlive) { clearInterval(keepAlive); keepAlive = null; } }

  function speakBrowser(text, token, preparedChunks) {
    if (!window.speechSynthesis) { playing = false; clearReadAlong(); emit("idle", 0, 0); setStatus("idle", ""); return; }
    const chunks = preparedChunks || chunkText(text);
    const total = chunks.length;
    const voiceObj = pickVoice();
    window.speechSynthesis.cancel();
    let idx = 0;
    setStatus("speaking", "Speaking…");
    emit("speaking", 1, total);
    const speakNext = () => {
      if (session !== token) return;
      if (idx >= total) { playing = false; emit("done", total, total); setStatus("done", "Finished"); stopKeepAlive(); finishReadAlong(); return; }
      const chunkIndex = idx;
      const u = new SpeechSynthesisUtterance(chunks[chunkIndex]);
      if (voiceObj) u.voice = voiceObj;
      u.rate = 1; u.pitch = 1;
      u.onstart = () => {
        showReadProgress(chunkIndex, 0);
        if (ticker) clearInterval(ticker);
        const began = performance.now();
        const words = readAlong && readAlong.chunks[chunkIndex];
        const estimatedMs = Math.max(700, (words ? words.totalWeight : 1) * 315);
        // Some mobile/browser voices omit boundary events. Keep a measured-rate
        // fallback moving between any native boundaries they do provide.
        ticker = setInterval(() => {
          if (session !== token) { clearInterval(ticker); ticker = null; return; }
          if (!paused) showReadProgress(chunkIndex, (performance.now() - began) / estimatedMs);
        }, 100);
      };
      u.onboundary = (event) => {
        if (session !== token || !readAlong) return;
        const words = readAlong.chunks[chunkIndex] || [];
        let wordIndex = words.findIndex((word) => event.charIndex >= word.start && event.charIndex < word.end);
        if (wordIndex < 0) wordIndex = words.findIndex((word) => word.start >= event.charIndex);
        if (wordIndex >= 0) showReadWord(chunkIndex, wordIndex);
      };
      u.onend = () => {
        if (ticker) { clearInterval(ticker); ticker = null; }
        if (session !== token) return;
        idx++; emit("speaking", Math.min(idx + 1, total), total); speakNext();
      };
      u.onerror = () => {
        if (ticker) { clearInterval(ticker); ticker = null; }
        if (session !== token) return;
        idx++; speakNext();
      };
      window.speechSynthesis.speak(u);
    };
    // Chrome pauses long speech after ~15s — nudge it to keep going.
    stopKeepAlive();
    keepAlive = setInterval(() => {
      if (session !== token) { stopKeepAlive(); return; }
      if (window.speechSynthesis.speaking && !paused) { window.speechSynthesis.pause(); window.speechSynthesis.resume(); }
    }, 9000);
    speakNext();
  }

  function pause() {
    paused = true;
    if (audioCtx && audioCtx.state === "running") audioCtx.suspend();
    if (window.speechSynthesis && window.speechSynthesis.speaking) window.speechSynthesis.pause();
    emit("paused", 0, 0);
  }
  function resume() {
    paused = false;
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    if (window.speechSynthesis && window.speechSynthesis.paused) window.speechSynthesis.resume();
    emit("speaking", 0, 0);
  }
  function stop() {
    session = null;
    playing = false; paused = false;
    if (ticker) { clearInterval(ticker); ticker = null; }
    stopKeepAlive();
    if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    clearReadAlong();
    emit("idle", 0, 0);
    setStatus("idle", "");
  }

  function getVoices() {
    return [
      { id: "bm_fable", name: "Fable (British male)" },
      { id: "bm_george", name: "George (British male)" },
      { id: "bf_emma", name: "Emma (British female)" },
      { id: "af_heart", name: "Heart (female)" },
      { id: "af_bella", name: "Bella (female)" },
      { id: "af_sarah", name: "Sarah (female)" },
      { id: "am_michael", name: "Michael (male)" },
      { id: "am_fenrir", name: "Fenrir (male)" },
    ];
  }

  window.kokoroTTS = {
    play,
    speak: play, // backwards-compatible alias (reader.js)
    pause, resume, stop,
    toggle(text, voice) {
      if (playing && !paused) { pause(); return "paused"; }
      if (playing && paused) { resume(); return "playing"; }
      play(text, voice); return "playing";
    },
    isPlaying: () => playing && !paused,
    isActive: () => playing,
    isPaused: () => paused,
    getVoices, sanitize,
    setEndpoint(url) { try { localStorage.setItem("kokoroEndpoint", url || ""); } catch (e) {} },
    getEndpoint: resolveEndpoint,
    hasEndpoint: () => !!resolveEndpoint(),
    setOnStatusChange(fn) { onStatusChange = fn; },
    setOnProgress(fn) { onProgress = fn; },
  };

  // A deliberate touch or wheel gesture temporarily wins over auto-follow;
  // narration resumes following after a short reading/reorientation window.
  window.addEventListener("touchstart", () => { if (playing) followSuppressedUntil = Date.now() + 3000; }, { passive: true });
  window.addEventListener("wheel", () => { if (playing) followSuppressedUntil = Date.now() + 3000; }, { passive: true });
})();
