/**
 * spa.js — turns Ernos Labs into a single-page app so the global read-aloud
 * keeps playing across page changes. Hand-written (not compiled from .ep)
 * because it orchestrates fetch + script injection. Loaded on every page,
 * before site.js.
 *
 * Persistent across navigation (never touched): the <nav> — and with it the
 * player button and its AudioContext — and the mesh <canvas>, plus the shared
 * scripts (this one, site.js, kokoro-tts.js). Swapped per page: the #view
 * container's contents, the <title>, and the page-specific scripts.
 *
 * Result: start read-aloud anywhere, move between tabs, and the audio plays on
 * uninterrupted until you stop it.
 */
(function () {
  "use strict";

  // Scripts present on every page — never re-injected; their state persists.
  const SHARED = ["spa.js", "site.js", "kokoro-tts.js"];

  function baseName(src) { return (src || "").split("?")[0].split("/").pop(); }

  function isInternalLink(a) {
    if (!a || a.target === "_blank") return false;
    if (!a.href) return false;
    let u;
    try { u = new URL(a.href, location.href); } catch (e) { return false; }
    if (u.origin !== location.origin) return false;
    return u.pathname.endsWith(".html");
  }

  function pageScripts(doc) {
    return Array.prototype.slice
      .call(doc.querySelectorAll("script[src]"))
      .map(function (s) { return s.getAttribute("src"); })
      .filter(function (src) { return SHARED.indexOf(baseName(src)) < 0; });
  }

  function injectScript(src) {
    return new Promise(function (resolve) {
      const s = document.createElement("script");
      s.src = src;
      s.dataset.spa = "1";
      s.onload = resolve;
      s.onerror = resolve;
      document.body.appendChild(s);
    });
  }

  let navToken = 0;

  async function navigate(url, push) {
    const my = ++navToken;
    let html;
    try {
      const res = await fetch(url, { credentials: "same-origin" });
      if (!res.ok) throw new Error("status " + res.status);
      html = await res.text();
    } catch (e) {
      location.href = url; // fall back to a full navigation
      return;
    }
    if (my !== navToken) return; // a newer navigation superseded this one

    const doc = new DOMParser().parseFromString(html, "text/html");
    const incoming = doc.getElementById("view");
    const current = document.getElementById("view");
    if (!incoming || !current) { location.href = url; return; } // not SPA-ready

    // Drop the previous page's injected scripts (globals stay defined, harmless;
    // this just keeps the DOM tidy and avoids unbounded growth).
    document.querySelectorAll("script[data-spa]").forEach(function (s) { s.remove(); });

    current.innerHTML = incoming.innerHTML;
    document.title = doc.title;
    if (push) history.pushState({ spa: true }, "", url);
    window.scrollTo(0, 0);

    // Re-run the shared per-page setup (active nav, reveal, year) WITHOUT
    // touching the mesh, the player, or the audio that may be playing.
    if (typeof window.site_page_init === "function") window.site_page_init();

    // Load the page's own scripts in order; each runs its main() against the
    // freshly-swapped DOM.
    const scripts = pageScripts(doc);
    for (let i = 0; i < scripts.length; i++) {
      if (my !== navToken) return;
      await injectScript(scripts[i]);
    }
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest ? e.target.closest("a") : null;
    if (!isInternalLink(a)) return;
    const target = new URL(a.href, location.href);
    if (target.pathname === location.pathname) {
      if (target.hash) return;     // in-page anchor — let the browser scroll
      e.preventDefault();          // same page, no hash — do nothing
      return;
    }
    e.preventDefault();
    navigate(a.href, true);
  });

  window.addEventListener("popstate", function () {
    navigate(location.href, false);
  });
})();
