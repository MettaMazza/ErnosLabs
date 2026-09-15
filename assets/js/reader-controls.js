/**
 * Shared reader controls.
 *
 * Keeps the reader's audio position on this device, turns the reader button
 * into a real pause/resume control, and lets a reader tap any word to start
 * from that point or save it as a bookmark. The module is deliberately
 * standalone because the same reader engine is used by five pages.
 */
(function () {
  "use strict";

  if (window.__ernosReaderControls) {
    window.__ernosReaderControls.boot();
    return;
  }

  const POSITION_PREFIX = "ernos-reader-position:v1:";
  const BOOKMARK_PREFIX = "ernos-reader-bookmarks:v1:";
  const WORD_RE = /[\p{L}\p{N}'’\/-]/u;
  let button = null;
  let bookmarkButton = null;
  let bookmarkSelect = null;
  let popover = null;
  let observedDoc = null;
  let observer = null;
  let currentWorkId = "";
  let restoredKey = "";
  let currentPoint = null;
  let refreshTimer = null;

  function work() { return window.curWork || null; }

  function workKey() {
    const w = work();
    return w && w.id ? location.pathname + "::" + w.id : "";
  }

  function storageRead(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function storageWrite(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function positionKey() { return POSITION_PREFIX + workKey(); }
  function bookmarkKey() { return BOOKMARK_PREFIX + workKey(); }

  function normalize(word) {
    return String(word || "").toLocaleLowerCase().replace(/[’']/g, "").replace(/[^\p{L}\p{N}]/gu, "");
  }

  function closePopover() {
    if (popover) { popover.remove(); popover = null; }
  }

  function updateButton() {
    if (!button) return;
    const tts = window.kokoroTTS;
    if (tts && tts.isActive()) {
      button.textContent = tts.isPaused() ? "▶ Resume" : "Ⅱ Pause";
      button.setAttribute("aria-label", tts.isPaused() ? "Resume read aloud" : "Pause read aloud");
    } else {
      button.textContent = "▶ Read aloud";
      button.setAttribute("aria-label", "Read aloud");
    }
  }

  function selectedVoice() {
    const select = document.getElementById("voice-select");
    return (select && select.value) || "bm_fable";
  }

  function readerTextRange(node, start) {
    const doc = document.getElementById("doc");
    if (!doc || !node) return null;
    const range = document.createRange();
    try {
      range.selectNodeContents(doc);
      range.setStart(node, Math.max(0, Math.min(start, node.nodeValue.length)));
      return range;
    } catch (e) { return null; }
  }

  function textNodeAtCaret(node, offset) {
    if (!node) return null;
    if (node.nodeType === Node.TEXT_NODE) return { node, offset: Number(offset) || 0 };
    const children = node.childNodes || [];
    if (!children.length) return null;
    let child = children[Math.min(children.length - 1, Math.max(0, Number(offset) || 0))];
    if (!child) child = children[children.length - 1];
    if (child.nodeType !== Node.TEXT_NODE) {
      const walker = document.createTreeWalker(child, NodeFilter.SHOW_TEXT);
      child = walker.nextNode();
    }
    return child ? { node: child, offset: 0 } : null;
  }

  function wordAtCaret(caret) {
    if (!caret || !caret.node || !caret.node.nodeValue) return null;
    const text = caret.node.nodeValue;
    let offset = Math.max(0, Math.min(caret.offset, text.length));
    if (offset === text.length) offset = Math.max(0, offset - 1);
    if (!WORD_RE.test(text[offset]) && offset > 0 && WORD_RE.test(text[offset - 1])) offset--;
    if (!WORD_RE.test(text[offset])) return null;
    let start = offset;
    let end = offset + 1;
    while (start > 0 && WORD_RE.test(text[start - 1])) start--;
    while (end < text.length && WORD_RE.test(text[end])) end++;
    const range = document.createRange();
    try { range.setStart(caret.node, start); range.setEnd(caret.node, end); }
    catch (e) { return null; }
    let source = null;
    if (window.kokoroTTS && window.kokoroTTS.getSourcePosition) {
      source = window.kokoroTTS.getSourcePosition(caret.node, start + 1) ||
        window.kokoroTTS.getSourcePosition(caret.node, end);
    }
    if (!source) {
      const local = allTextWords().find((item) => item.node === caret.node && item.start <= start && item.end >= end);
      if (local) source = local;
    }
    return {
      node: caret.node,
      start,
      end,
      range,
      text: text.slice(start, end),
      sourceIndex: source ? source.sourceIndex : null,
      sourceWord: source ? source.word : normalize(text.slice(start, end)),
    };
  }

  function caretFromPoint(x, y) {
    if (document.caretRangeFromPoint) return document.caretRangeFromPoint(x, y);
    if (document.caretPositionFromPoint) {
      const point = document.caretPositionFromPoint(x, y);
      if (point) {
        const range = document.createRange();
        range.setStart(point.offsetNode, point.offset);
        range.collapse(true);
        return range;
      }
    }
    return null;
  }

  function pointRange(point) {
    return readerTextRange(point.node, point.start);
  }

  function savePosition(point, scrollY) {
    if (!workKey() || !point) return;
    const data = {
      sourceIndex: Number.isFinite(point.sourceIndex) ? point.sourceIndex : null,
      word: point.sourceWord || normalize(point.text),
      updatedAt: new Date().toISOString(),
      scrollY: Number.isFinite(scrollY) ? scrollY : window.scrollY,
    };
    storageWrite(positionKey(), data);
    currentPoint = point;
  }

  function allTextWords() {
    const doc = document.getElementById("doc");
    if (!doc) return [];
    const words = [];
    const skip = "script,style,code,pre,button,select,textarea,[aria-hidden='true']";
    const walker = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.nodeValue && node.nodeValue.trim() && !node.parentElement.closest(skip)
          ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    let node;
    let fallbackIndex = 0;
    while ((node = walker.nextNode())) {
      const re = /[\p{L}\p{N}]+(?:['’\/-][\p{L}\p{N}]+)*/gu;
      let match;
      while ((match = re.exec(node.nodeValue))) {
        const source = window.kokoroTTS && window.kokoroTTS.getSourcePosition
          ? window.kokoroTTS.getSourcePosition(node, match.index + 1) : null;
        words.push({ node, start: match.index, end: match.index + match[0].length,
          text: match[0], sourceIndex: source ? source.sourceIndex : fallbackIndex,
          sourceWord: source ? source.word : normalize(match[0]) });
        fallbackIndex++;
      }
    }
    return words;
  }

  function findSavedPoint(saved) {
    if (!saved) return null;
    const words = allTextWords();
    if (!words.length) return null;
    let match = null;
    if (Number.isFinite(saved.sourceIndex)) {
      match = words.find((item) => item.sourceIndex === saved.sourceIndex);
    }
    if (!match && saved.word) {
      const wanted = normalize(saved.word);
      match = words.find((item) => normalize(item.sourceWord || item.text) === wanted);
    }
    if (!match) return null;
    return wordAtCaret({ node: match.node, offset: match.start });
  }

  function restorePosition() {
    const saved = storageRead(positionKey(), null);
    const point = findSavedPoint(saved);
    if (!point) return;
    currentPoint = point;
    const range = point.range;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      const target = Math.max(0, window.scrollY + range.getBoundingClientRect().top - window.innerHeight * 0.28);
      window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
    }, 30);
  }

  function startFromPoint(point) {
    const doc = document.getElementById("doc");
    const tts = window.kokoroTTS;
    if (!doc || !point || !tts) return;
    if (!point.node || point.node.nodeType !== Node.TEXT_NODE) {
      const first = allTextWords()[0];
      if (!first) return;
      point = wordAtCaret({ node: first.node, offset: first.start });
      if (!point) return;
    }
    const range = pointRange(point);
    const suffix = range ? range.cloneContents().textContent : doc.textContent;
    const text = (tts.sanitize ? tts.sanitize(suffix) : suffix).trim();
    if (!text) return;
    closePopover();
    savePosition(point);
    tts.speak(text, selectedVoice(), {
      sourceStart: Number.isFinite(point.sourceIndex) ? point.sourceIndex : 0,
    });
    window.ttsOn = true;
    updateButton();
  }

  function addBookmark(point) {
    if (!point || !workKey()) return;
    const list = storageRead(bookmarkKey(), []);
    const item = {
      id: String(Date.now()),
      sourceIndex: Number.isFinite(point.sourceIndex) ? point.sourceIndex : null,
      word: point.sourceWord || normalize(point.text),
      label: (point.text || point.sourceWord || "Bookmark").slice(0, 42),
      createdAt: new Date().toISOString(),
    };
    list.unshift(item);
    storageWrite(bookmarkKey(), list.slice(0, 50));
    renderBookmarks(item.id);
    closePopover();
    if (bookmarkButton) {
      bookmarkButton.textContent = "✓ Bookmarked";
      window.setTimeout(() => { if (bookmarkButton) bookmarkButton.textContent = "Bookmark"; }, 1400);
    }
  }

  function renderBookmarks(selectedId) {
    if (!bookmarkSelect) return;
    const list = storageRead(bookmarkKey(), []);
    bookmarkSelect.innerHTML = "<option value=\"\">Bookmarks</option>";
    list.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = "↳ " + item.label;
      bookmarkSelect.appendChild(option);
    });
    if (selectedId) bookmarkSelect.value = selectedId;
    bookmarkSelect.disabled = !list.length;
  }

  function jumpToBookmark(id) {
    if (!id) return;
    const item = storageRead(bookmarkKey(), []).find((entry) => entry.id === id);
    const point = findSavedPoint(item);
    if (!point) return;
    currentPoint = point;
    savePosition(point);
    point.range.scrollIntoView({ behavior: "smooth", block: "center" });
    bookmarkSelect.value = "";
  }

  function showPopover(point, x, y) {
    closePopover();
    const panel = document.createElement("div");
    panel.className = "reader-word-menu";
    panel.setAttribute("role", "dialog");
    panel.innerHTML = "<strong></strong><div class=\"reader-word-menu__actions\"><button type=\"button\" data-action=\"start\">Read from here</button><button type=\"button\" data-action=\"bookmark\">Bookmark</button></div>";
    panel.querySelector("strong").textContent = "“" + point.text + "”";
    panel.querySelector("[data-action='start']").addEventListener("click", () => startFromPoint(point));
    panel.querySelector("[data-action='bookmark']").addEventListener("click", () => addBookmark(point));
    document.body.appendChild(panel);
    const pad = 12;
    const rect = panel.getBoundingClientRect();
    panel.style.left = Math.max(pad, Math.min(window.innerWidth - rect.width - pad, x - rect.width / 2)) + "px";
    panel.style.top = Math.max(pad, Math.min(window.innerHeight - rect.height - pad, y + 12)) + "px";
    popover = panel;
  }

  function onDocPointerUp(event) {
    const doc = document.getElementById("doc");
    if (!doc || !doc.contains(event.target) || event.target.closest("a,button,select,input,textarea")) return;
    const caret = caretFromPoint(event.clientX, event.clientY);
    const point = wordAtCaret(textNodeAtCaret(caret && caret.startContainer, caret && caret.startOffset));
    if (point) showPopover(point, event.clientX, event.clientY);
  }

  function attachObserver() {
    const doc = document.getElementById("doc");
    if (doc === observedDoc) return;
    if (observer) observer.disconnect();
    observedDoc = doc;
    if (!doc) return;
    observer = new MutationObserver(() => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => { refreshTimer = null; refreshPage(); }, 0);
    });
    observer.observe(doc, { childList: true, subtree: true });
  }

  function refreshPage() {
    attachObserver();
    const w = work();
    if (w && w.id && w.id !== currentWorkId) {
      currentWorkId = w.id;
      currentPoint = null;
      restoredKey = "";
      renderBookmarks();
    }
    const doc = document.getElementById("doc");
    if (w && w.id && doc && !doc.querySelector(".loading") && restoredKey !== workKey()) {
      restoredKey = workKey();
      restorePosition();
    }
    updateButton();
  }

  function injectControls() {
    const original = document.getElementById("tts");
    if (!original) return;
    if (!original.dataset.readerEnhanced) {
      const replacement = original.cloneNode(true);
      replacement.dataset.readerEnhanced = "1";
      original.replaceWith(replacement);
      button = replacement;
      button.addEventListener("click", () => {
        const tts = window.kokoroTTS;
        if (!tts) return;
        if (tts.isActive()) {
          if (tts.isPaused()) tts.resume(); else tts.pause();
          updateButton();
          return;
        }
        const doc = document.getElementById("doc");
        if (!doc) return;
        const saved = storageRead(positionKey(), null);
        const point = findSavedPoint(saved);
        if (point) startFromPoint(point);
        else startFromPoint({ node: doc.firstChild, start: 0, text: doc.textContent, sourceIndex: 0, sourceWord: "" });
      });
    } else button = original;

    if (!document.getElementById("reader-bookmark")) {
      bookmarkButton = document.createElement("button");
      bookmarkButton.className = "r-btn";
      bookmarkButton.id = "reader-bookmark";
      bookmarkButton.type = "button";
      bookmarkButton.textContent = "Bookmark";
      bookmarkButton.addEventListener("click", () => {
        const point = currentPoint || findSavedPoint(storageRead(positionKey(), null));
        if (point) addBookmark(point);
      });
      bookmarkSelect = document.createElement("select");
      bookmarkSelect.className = "r-btn reader-bookmarks";
      bookmarkSelect.id = "reader-bookmarks";
      bookmarkSelect.setAttribute("aria-label", "Saved bookmarks");
      bookmarkSelect.addEventListener("change", () => jumpToBookmark(bookmarkSelect.value));
      const bar = document.querySelector(".reader__bar");
      const copy = document.getElementById("copy-link");
      if (bar) {
        bar.insertBefore(bookmarkButton, copy || null);
        bar.insertBefore(bookmarkSelect, copy || null);
      }
    }
    renderBookmarks();
    updateButton();
  }

  function boot() {
    injectControls();
    refreshPage();
  }

  document.addEventListener("pointerup", onDocPointerUp, { passive: true });
  window.addEventListener("scroll", () => {
    if (window.kokoroTTS && window.kokoroTTS.isActive()) return;
    closePopover();
  }, { passive: true });
  if (window.kokoroTTS && window.kokoroTTS.setOnPosition) {
    window.kokoroTTS.setOnPosition((info) => {
      if (!workKey() || !info) return;
      const point = currentPoint || { sourceIndex: info.sourceIndex, sourceWord: info.word, text: info.word };
      point.sourceIndex = info.sourceIndex;
      point.sourceWord = info.word;
      savePosition(point, window.scrollY);
    });
  }
  window.__ernosReaderControls = { boot };
  boot();
})();
