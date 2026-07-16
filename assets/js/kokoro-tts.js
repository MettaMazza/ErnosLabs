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
  const FIRST_TIMEOUT_MS = 12000; // if the source machine is offline, fall back to the browser voice quickly
  const GEN_TIMEOUT_MS = 30000;   // subsequent requests

  let audioCtx = null;
  let playing = false;
  let paused = false;
  let session = null;        // identity token for the active play() call
  let ticker = null;         // progress interval
  let keepAlive = null;      // browser-voice keep-alive (Chrome long-speech bug)
  let onStatusChange = null; // (status, detail)
  let onProgress = null;     // ({ phase, current, total, fraction })

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
    const ep = resolveEndpoint();
    const v = voice || DEFAULT_VOICE;

    if (!ep) { return speakBrowser(clean, my); } // no server → instant browser voice

    emit("loading", 0, 0);
    setStatus("loading", "Waking the voice…");
    const chunks = chunkText(clean);
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
      return speakBrowser(clean, my);
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
        clearInterval(ticker); ticker = null; playing = false; emit("done", total, total); setStatus("done", "Finished"); return;
      }
      emit("speaking", cur + 1, total);
    }, 140);
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

  function speakBrowser(text, token) {
    if (!window.speechSynthesis) { playing = false; emit("idle", 0, 0); setStatus("idle", ""); return; }
    const chunks = chunkText(text);
    const total = chunks.length;
    const voiceObj = pickVoice();
    window.speechSynthesis.cancel();
    let idx = 0;
    setStatus("speaking", "Speaking…");
    emit("speaking", 1, total);
    const speakNext = () => {
      if (session !== token) return;
      if (idx >= total) { playing = false; emit("done", total, total); setStatus("done", "Finished"); stopKeepAlive(); return; }
      const u = new SpeechSynthesisUtterance(chunks[idx]);
      if (voiceObj) u.voice = voiceObj;
      u.rate = 1; u.pitch = 1;
      u.onend = () => { if (session !== token) return; idx++; emit("speaking", Math.min(idx + 1, total), total); speakNext(); };
      u.onerror = () => { if (session !== token) return; idx++; speakNext(); };
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
})();
