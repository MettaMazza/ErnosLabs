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

      // For long texts, use streaming if available
      if (text.length > 2000 && tts.stream) {
        await speakStreaming(tts, text, selectedVoice);
      } else {
        // Short text — generate all at once
        const audio = await tts.generate(text.slice(0, 5000), {
          voice: selectedVoice,
        });

        if (abortController.signal.aborted) return;

        const audioData = audio.toWav ? audio.toWav() : audio;
        await playAudioData(audioData);
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        console.warn("Kokoro generation error:", err);
        setStatus("error", "Voice generation failed");
      }
    } finally {
      playing = false;
      if (!abortController.signal.aborted) {
        setStatus("done", "Finished");
      }
    }
  }

  async function speakStreaming(tts, text, voice) {
    // Break text into sentences for pseudo-streaming
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    const chunks = [];
    let current = "";

    for (const s of sentences) {
      current += s;
      if (current.length >= 300) {
        chunks.push(current.trim());
        current = "";
      }
    }
    if (current.trim()) chunks.push(current.trim());

    for (const chunk of chunks) {
      if (abortController.signal.aborted) return;

      const audio = await tts.generate(chunk, { voice });
      if (abortController.signal.aborted) return;

      const audioData = audio.toWav ? audio.toWav() : audio;
      await playAudioData(audioData);
    }
  }

  function playAudioData(audioData) {
    return new Promise((resolve, reject) => {
      if (!currentAudioCtx || abortController.signal.aborted) {
        resolve();
        return;
      }

      // audioData might be a Blob, ArrayBuffer, or Float32Array
      if (audioData instanceof Blob) {
        audioData.arrayBuffer().then((buf) => {
          decodeAndPlay(buf, resolve, reject);
        });
      } else if (audioData instanceof ArrayBuffer) {
        decodeAndPlay(audioData, resolve, reject);
      } else if (audioData.buffer) {
        // Float32Array or similar
        if (currentAudioCtx.state === "suspended") { currentAudioCtx.resume(); }
        const buffer = currentAudioCtx.createBuffer(1, audioData.length, 24000);
        buffer.getChannelData(0).set(audioData);
        const source = currentAudioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(currentAudioCtx.destination);
        currentSource = source;
        source.onended = resolve;
        source.start();
      } else {
        resolve();
      }
    });
  }

  function decodeAndPlay(arrayBuffer, resolve, reject) {
    currentAudioCtx.decodeAudioData(
      arrayBuffer,
      (buffer) => {
        if (abortController.signal.aborted) { resolve(); return; }
        if (currentAudioCtx.state === "suspended") { currentAudioCtx.resume(); }
        const source = currentAudioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(currentAudioCtx.destination);
        currentSource = source;
        source.onended = resolve;
        source.start();
      },
      reject
    );
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
