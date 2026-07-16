/**
 * api-base.js — the single source of truth for where the live backend is.
 * Loaded FIRST on every page (SHARED in the SPA, like spa.js).
 *
 * The site can be served from several places (GitHub Pages today, the source
 * machine itself after the DNS cutover, or the Tailscale funnel). The backend
 * (downloads, read-aloud, community, canvas, project zips) is ALWAYS the
 * source machine. So: resolve the API base once — same-origin if this origin
 * answers /ping (i.e. the machine is serving the site), otherwise the funnel,
 * which is reachable from anywhere. Consumers await window.ernosApiReady and
 * read window.ERNOS_API (null = machine truly offline).
 */
(function () {
  window.ERNOS_FUNNEL = "https://marias-mac-studio-1.tail36a593.ts.net:8443";
  window.ERNOS_API = null;

  function ping(base, ms) {
    return new Promise(function (resolve) {
      var ctl = new AbortController();
      var t = setTimeout(function () { ctl.abort(); resolve(false); }, ms);
      fetch(base + "/ping", { signal: ctl.signal })
        .then(function (r) { clearTimeout(t); resolve(!!r.ok); })
        .catch(function () { clearTimeout(t); resolve(false); });
    });
  }

  window.ernosApiReady = (async function () {
    try {
      var saved = localStorage.getItem("ernosArchiveBase");
      if (saved) { window.ERNOS_API = saved.replace(/\/+$/, ""); return window.ERNOS_API; }
    } catch (e) {}
    if (await ping(location.origin, 2500)) window.ERNOS_API = location.origin;
    else if (await ping(window.ERNOS_FUNNEL, 4000)) window.ERNOS_API = window.ERNOS_FUNNEL;
    else window.ERNOS_API = null;
    return window.ERNOS_API;
  })();
})();
