/**
 * Kokoro TTS integration for Ernos Labs Library.
 * Loads the Kokoro-82M model in the browser via ONNX/WASM.
 * Falls back to browser SpeechSynthesis if Kokoro cannot load.
 *
 * This is a hand-written JS module (not compiled from .ep) because it
 * requires ESM dynamic imports from a CDN, which ErnosPlain cannot emit.
 * reader.js calls into the global `window.kokoroTTS` API set up here.
 */

(function () {
  "use strict";

  const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
  const DEFAULT_VOICE = "af_heart";

  // State
  let ttsInstance = null;
  let loading = false;
  let loadError = false;
  let currentAudioCtx = null;
  let currentSource = null;
  let playing = false;
  let abortController = null;

  // Status callback — reader.js will set this
  let onStatusChange = null;

  function setStatus(status, detail) {
    if (onStatusChange) onStatusChange(status, detail);
  }

  async function loadModel() {
    if (ttsInstance) return ttsInstance;
    if (loading) return null;
    loading = true;
    loadError = false;
    setStatus("loading", "Loading Kokoro voice model (~80 MB)…");

    try {
      // Dynamic import from CDN
      const { KokoroTTS } = await import(
        "https://cdn.jsdelivr.net/npm/kokoro-js@1.1.1/+esm"
      );

      ttsInstance = await KokoroTTS.from_pretrained(MODEL_ID, {
        dtype: "q8",
        device: "wasm",
      });

      loading = false;
      setStatus("ready", "Kokoro voice ready");
      return ttsInstance;
    } catch (err) {
      console.warn("Kokoro TTS failed to load, falling back to browser TTS:", err);
      loading = false;
      loadError = true;
      setStatus("fallback", "Using browser voice (Kokoro unavailable)");
      return null;
    }
  }

  async function speak(text, voice) {
    stop(); // stop any current playback

    // Create the AudioContext NOW, synchronously inside the user's click, so the
    // browser permits playback. Created later (after the model await) it starts
    // "suspended" and produces no sound — the usual cause of silent TTS.
    try {
      currentAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { currentAudioCtx = null; }

    const tts = await loadModel();

    if (!tts) {
      // Fallback to browser speech synthesis
      return speakBrowser(text);
    }

    abortController = new AbortController();
    playing = true;
    setStatus("speaking", "Speaking…");

    try {
      // Resume in case the context was suspended while the model loaded.
      if (currentAudioCtx && currentAudioCtx.state === "suspended") {
        try { await currentAudioCtx.resume(); } catch (e) {}
      }
      if (!currentAudioCtx) {
        try { currentAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
      }
      const selectedVoice = voice || DEFAULT_VOICE;

      // Speak in sentence-sized chunks so audio starts sooner and long texts
      // don't exhaust memory.
      const chunks = chunkText(text.slice(0, 6000));
      let spoke = false;
      for (const chunk of chunks) {
        if (abortController.signal.aborted) return;
        const raw = await tts.generate(chunk, { voice: selectedVoice });
        if (abortController.signal.aborted) return;
        spoke = (await playRaw(raw)) || spoke;
      }
      // If Kokoro produced no playable samples, fall back so the user hears something.
      if (!spoke && !abortController.signal.aborted) {
        return speakBrowser(text);
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        console.warn("Kokoro generation error — falling back to browser voice:", err);
        return speakBrowser(text);
      }
    } finally {
      playing = false;
      if (abortController && !abortController.signal.aborted) {
        setStatus("done", "Finished");
      }
    }
  }

  // Split text into ~280-character sentence groups.
  function chunkText(text) {
    const sentences = text.match(/[^.!?\n]+[.!?]*\s*/g) || [text];
    const chunks = [];
    let cur = "";
    for (const s of sentences) {
      cur += s;
      if (cur.length >= 280) { chunks.push(cur.trim()); cur = ""; }
    }
    if (cur.trim()) chunks.push(cur.trim());
    return chunks.length ? chunks : [text];
  }

  // Play a kokoro-js RawAudio (Float32 samples + sample rate) directly through
  // Web Audio. Returns true if it actually played samples.
  function playRaw(raw) {
    return new Promise((resolve) => {
      if (!currentAudioCtx || !raw || abortController.signal.aborted) { resolve(false); return; }
      const samples = raw.audio || raw.data || (raw instanceof Float32Array ? raw : null);
      const rate = raw.sampling_rate || raw.samplingRate || 24000;
      if (!samples || !samples.length) { resolve(false); return; }
      if (currentAudioCtx.state === "suspended") { currentAudioCtx.resume(); }
      const buffer = currentAudioCtx.createBuffer(1, samples.length, rate);
      buffer.getChannelData(0).set(samples);
      const node = currentAudioCtx.createBufferSource();
      node.buffer = buffer;
      node.connect(currentAudioCtx.destination);
      currentSource = node;
      node.onended = () => resolve(true);
      node.start();
    });
  }

  function speakBrowser(text) {
    if (!window.speechSynthesis) return;
    const trimmed = text.length > 9000 ? text.slice(0, 9000) : text;
    const u = new SpeechSynthesisUtterance(trimmed);
    u.rate = 1;
    u.onend = function () {
      playing = false;
      setStatus("done", "Finished");
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    playing = true;
    setStatus("speaking", "Speaking (browser voice)…");
  }

  function stop() {
    if (abortController) abortController.abort();
    if (currentSource) {
      try { currentSource.stop(); } catch (e) { /* already stopped */ }
      currentSource = null;
    }
    if (currentAudioCtx) {
      currentAudioCtx.close().catch(() => {});
      currentAudioCtx = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    playing = false;
    setStatus("idle", "");
  }

  function isPlaying() {
    return playing;
  }

  function isLoading() {
    return loading;
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

  // Expose global API for reader.js to call
  window.kokoroTTS = {
    speak,
    stop,
    isPlaying,
    isLoading,
    loadModel,
    getVoices,
    setOnStatusChange: function (fn) { onStatusChange = fn; },
  };
})();
