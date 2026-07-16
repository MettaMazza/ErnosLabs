/**
 * community-shim.js — tiny JS-interop glue for community.js (compiled from
 * src/community.ep). Kept external (not inline) so the SPA re-runs it before
 * community.js on client-side navigation. Loaded on the Community page only.
 *
 *  - COMMUNITY_BASE : where the self-hosted community server lives (the same
 *    Tailscale funnel that serves the archive & read-aloud). Override in the
 *    console with localStorage.setItem("ernosCommunityBase", "https://…").
 *  - js_object()    : ErnosPlain can't write an object literal; this supplies one.
 *  - fmt_time(ts)   : format a unix timestamp for display.
 */
window.COMMUNITY_BASE = window.COMMUNITY_BASE || null;  // resolved via api-base.js (window.ERNOS_API)
window.js_object = window.js_object || function () { return {}; };
window.fmt_time = window.fmt_time || function (ts) {
  try {
    return new Date(ts * 1000).toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
    });
  } catch (e) { return ""; }
};
