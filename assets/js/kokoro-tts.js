/**
 * Kokoro TTS — global read-aloud engine for Ernos Labs.
 * Loads Kokoro-82M in the browser (ONNX/WASM), falls back to the browser voice.
 *
 * Hand-written JS (not compiled from .ep) because it needs ESM dynamic imports.
 * Exposes window.kokoroTTS. Pipelined: it synthesises the NEXT sentence while
 * the current one plays, so there are no long pauses between segments, and it
 * reports progress so the UI can show a loading bar. Text is sanitised so no
 * markdown or stray symbols are ever spoken aloud.
 */
(function () {
  "use strict";

  const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
  const DEFAULT_VOICE = "af_heart";
  const LOOKAHEAD = 2; // generate up to N segments ahead of playback

  let ttsInstance = null;
  let loading = false;
  let audioCtx = null;
  let currentSource = null;
  let playing = false;
  let paused = false;
  let session = null;        // identity token for the active play() call
  let onStatusChange = null; // (status, detail)
  let onProgress = null;     // ({ phase, current, total, fraction })

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function setStatus(status, detail) { if (onStatusChange) onStatusChange(status, detail); }
  function emit(phase, current, total) {
    if (onProgress) onProgress({ phase, current, total, fraction: total ? current / total : 0 });
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
    t = t.replace(/```[\s\S]*?```/g, " ");      // fenced code
    t = t.replace(/`[^`]*`/g, " ");             // inline code
    t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1"); // links -> text (before url strip)
    t = t.replace(/https?:\/\/\S+/g, " ");      // bare urls
    t = t.replace(/&[a-z]+;/gi, " ");           // html entities
    t = t.replace(/[*_#>~|^]+/g, " ");          // markdown markers
    t = t.replace(/[—–]/g, ", ");               // dashes -> pause
    t = t.replace(/[•◦▪●◆▶►«»·∙]/g, ", ");      // bullets -> pause
    for (const [sym, word] of Object.entries(SYMBOL_WORDS)) {
      t = t.split(sym).join(word);
    }
    t = t.replace(/[^\p{L}\p{N}\s.,!?;:'"()/-]/gu, " "); // drop remaining symbols
    t = t.replace(/\s*\n+\s*/g, ". ");          // newlines -> sentence breaks
    t = t.replace(/\.{2,}/g, ".");              // ellipses
    t = t.replace(/\s+([.,!?;:])/g, "$1");      // tidy spacing before punctuation
    t = t.replace(/([.,!?;:]){2,}/g, "$1");
    t = t.replace(/\s{2,}/g, " ").trim();
    return t;
  }

  function chunkText(text) {
    const sentences = text.match(/[^.!?\n]+[.!?]*\s*/g) || [text];
    const chunks = [];
    let cur = "";
    for (const s of sentences) {
      cur += s;
      if (cur.length >= 220) { chunks.push(cur.trim()); cur = ""; }
    }
    if (cur.trim()) chunks.push(cur.trim());
    return chunks.length ? chunks : [text];
  }

  // ---- model + audio -----------------------------------------------------
  async function loadModel() {
    if (ttsInstance) return ttsInstance;
    if (loading) { while (loading) await sleep(80); return ttsInstance; }
    loading = true;
    setStatus("loading", "Loading the voice (first time ~80 MB)…");
    try {
      const { KokoroTTS } = await import("https://cdn.jsdelivr.net/npm/kokoro-js@1.1.1/+esm");
      ttsInstance = await KokoroTTS.from_pretrained(MODEL_ID, { dtype: "q8", device: "wasm" });
      loading = false;
      setStatus("ready", "Voice ready");
      return ttsInstance;
    } catch (err) {
      console.warn("Kokoro failed to load — using browser voice:", err);
      loading = false;
      setStatus("fallback", "Using the browser voice");
      return null;
    }
  }

  function ensureCtx() {
    if (!audioCtx || audioCtx.state === "closed") {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { audioCtx = null; }
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function rawToBuffer(raw) {
    if (!audioCtx || !raw) return null;
    const samples = raw.audio || raw.data || (raw instanceof Float32Array ? raw : null);
    const rate = raw.sampling_rate || raw.samplingRate || 24000;
    if (!samples || !samples.length) return null;
    const buf = audioCtx.createBuffer(1, samples.length, rate);
    buf.getChannelData(0).set(samples);
    return buf;
  }

  function playBuffer(buf, token) {
    return new Promise((resolve) => {
      if (session !== token || !audioCtx || !buf) { resolve(); return; }
      if (audioCtx.state === "suspended") audioCtx.resume();
      const node = audioCtx.createBufferSource();
      node.buffer = buf;
      node.connect(audioCtx.destination);
      currentSource = node;
      node.onended = () => resolve();
      try { node.start(); } catch (e) { resolve(); }
    });
  }

  // ---- the pipelined player ---------------------------------------------
  async function play(text, voice) {
    stop();
    const clean = sanitize(text);
    if (!clean) return;
    const my = {}; session = my;
    playing = true; paused = false;
    ensureCtx();                       // created inside the click gesture
    emit("loading", 0, 0);
    setStatus("loading", "Loading the voice…");

    const tts = await loadModel();
    if (session !== my) return;
    if (!tts) { return speakBrowser(clean, my); }

    const chunks = chunkText(clean);
    const total = chunks.length;
    const ready = new Array(total).fill(null); // AudioBuffer | "error" | null
    let playIdx = 0;
    const v = voice || DEFAULT_VOICE;
    setStatus("speaking", "Speaking…");

    // generator: stay LOOKAHEAD ahead of playback
    (async function gen() {
      let g = 0;
      while (g < total && session === my) {
        while (g > playIdx + LOOKAHEAD && session === my) await sleep(40);
        if (session !== my) return;
        try {
          const raw = await tts.generate(chunks[g], { voice: v });
          ready[g] = session === my ? rawToBuffer(raw) : null;
        } catch (e) { ready[g] = "error"; }
        g++;
      }
    })();

    // playback consumer
    for (playIdx = 0; playIdx < total; playIdx++) {
      if (session !== my) return;
      while (paused && session === my) await sleep(90);
      while (ready[playIdx] === null && session === my) { emit("buffering", playIdx, total); await sleep(60); }
      if (session !== my) return;
      while (paused && session === my) await sleep(90);
      emit("speaking", playIdx + 1, total);
      if (ready[playIdx] !== "error") await playBuffer(ready[playIdx], my);
      ready[playIdx] = null; // free memory
    }
    if (session === my) { playing = false; emit("done", total, total); setStatus("done", "Finished"); }
  }

  function speakBrowser(text, token) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text.slice(0, 12000));
    u.rate = 1;
    u.onend = () => { if (session === token) { playing = false; emit("done", 1, 1); setStatus("done", "Finished"); } };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setStatus("speaking", "Speaking (browser voice)…");
    emit("speaking", 1, 1);
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
    if (currentSource) { try { currentSource.stop(); } catch (e) {} currentSource = null; }
    if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    emit("idle", 0, 0);
    setStatus("idle", "");
  }

  function getVoices() {
    return [
      { id: "af_heart", name: "Heart (female)" },
      { id: "af_bella", name: "Bella (female)" },
      { id: "af_sarah", name: "Sarah (female)" },
      { id: "am_michael", name: "Michael (male)" },
      { id: "am_adam", name: "Adam (male)" },
      { id: "bf_emma", name: "Emma (British female)" },
      { id: "bm_george", name: "George (British male)" },
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
    isLoading: () => loading,
    loadModel, getVoices, sanitize,
    setOnStatusChange(fn) { onStatusChange = fn; },
    setOnProgress(fn) { onProgress = fn; },
  };
})();
