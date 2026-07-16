// Auto-generated JavaScript from ErnosPlain

function pj_base() {
    let o;
    if (window.localStorage) {
        o = window.localStorage.getItem("ernosArchiveBase");
        if (o) {
            return o;
        }
    }
    if (window.ERNOS_API) {
        return window.ERNOS_API;
    }
    return "";
}

function pj_gh(repo) {
    return ("https://github.com/MettaMazza/" + repo);
}

function pj_esc(s) {
    let t;
    t = s;
    if (t) {
        t = t.split("&").join("&amp;");
        t = t.split("<").join("&lt;");
        t = t.split(">").join("&gt;");
        return t;
    }
    return "";
}

function pj_use_machine() {
    let links, repo;
    links = document.querySelectorAll(".pj-dl");
    for (const a of links) {
        repo = a.getAttribute("data-repo");
        if (repo) {
            a.href = (((pj_base() + "/projects/") + repo) + ".zip");
        }
    }
    return 0;
}

function pj_status_set(cls, msg) {
    let el;
    el = document.getElementById("pj-status");
    if (el) {
        el.className = cls;
        el.innerHTML = msg;
    }
    return 0;
}

function pj_status_ok(resp) {
    if (resp.ok) {
        pj_use_machine();
        pj_status_set("ai-status is-online", "🟢 <strong>Source machine online</strong> — downloads come straight from it, not from GitHub.");
    } else {
        pj_status_fail(resp);
    }
    return 0;
}

function pj_status_fail(err) {
    pj_status_set("ai-status is-offline", "🌙 <strong>The source machine is asleep.</strong> Downloads fall back to GitHub for now.");
    return 0;
}

function pj_check() {
    fetch((pj_base() + "/ping")).then(pj_status_ok).catch(pj_status_fail);
    return 0;
}

function pj_meta_line(p) {
    let out;
    out = "";
    if (p.updated) {
        out = ("updated " + p.updated);
    }
    if (p.zip_size) {
        if ((out === "")) {
            out = p.zip_size;
        } else {
            out = ((out + " · ") + p.zip_size);
        }
    }
    return out;
}

function pj_card(p) {
    let page, out;
    page = pj_page(p.repo);
    out = "<div class=\"ai-card reveal in\">";
    out = (out + (("<div class=\"ai-card__top\"><h3>" + String(pj_esc(p.title))) + "</h3></div>"));
    out = (out + (("<p class=\"ai-desc\">" + String(pj_esc(p.desc))) + "</p>"));
    out = (out + (("<p class=\"pj-meta\">" + String(pj_meta_line(p))) + "</p>"));
    out = (out + "<div class=\"ai-card__actions\">");
    out = (out + (("<a class=\"btn btn--primary\" href=\"" + String(page)) + "\">Explore →</a>"));
    out = (out + (((("<a class=\"pj-dl\" data-repo=\"" + String(p.repo)) + "\" href=\"") + String(pj_gh(p.repo))) + "/archive/refs/heads/main.zip\">⬇ Download .zip</a>"));
    out = (out + (("<a class=\"pj-ghl\" href=\"" + String(pj_gh(p.repo))) + "\" target=\"_blank\" rel=\"noopener\">GitHub ↗</a>"));
    out = (out + "</div></div>");
    return out;
}

function pj_page(repo) {
    if ((repo === "FoldBot-Chess")) {
        return "foldbot-chess.html";
    }
    if ((repo === "Fold-Go")) {
        return "fold-go.html";
    }
    if ((repo === "Fold-Protein")) {
        return "fold-protein.html";
    }
    if ((repo === "UnisonAI")) {
        return "unisonai.html";
    }
    if ((repo === "Ern-OS")) {
        return "ern-os.html";
    }
    if ((repo === "Civ-Seed")) {
        return "civ-seed.html";
    }
    if ((repo === "Ernos-Programming-Language")) {
        return "ernosplain.html";
    }
    if ((repo === "ErnosDecent")) {
        return "ernosdecent.html";
    }
    if ((repo === "Smithian-Fold-Theory-Of-Everything")) {
        return "smithian-fold-theory-of-everything.html";
    }
    if ((repo === "Smithian-Fold-Theory")) {
        return "smithian-fold-theory-of-everything.html";
    }
    if ((repo === "sft-dev")) {
        return "smithian-fold-theory-of-everything.html";
    }
    if ((repo === "ErnosLabs")) {
        return "index.html";
    }
    return pj_gh(repo);
}

function pj_section(key, heading, sub) {
    let out, cards;
    cards = "";
    for (const p of window.ERNOS_PROJECTS) {
        if ((p.cat === key)) {
            cards = (cards + pj_card(p));
        }
    }
    if ((cards === "")) {
        return "";
    }
    out = (("<hr class=\"divider\" style=\"margin:34px 0 26px\"><h2>" + String(heading)) + "</h2>");
    out = (out + (("<p class=\"lead\" style=\"margin-bottom:24px\">" + String(sub)) + "</p>"));
    out = (((out + "<div class=\"ai-grid\">") + cards) + "</div>");
    return out;
}

function pj_render_grid() {
    let html, host;
    host = document.getElementById("projects-grid");
    if (!host) {
        return 0;
    }
    html = "";
    html = (html + pj_section("theory", "The theory", "The Smithian Fold — a theory of everything with zero free parameters and zero axioms, machine-verified."));
    html = (html + pj_section("engines", "Zero-parameter engines", "The theory put to work: chess, Go, and protein folding with every value counted from geometry — nothing tuned, nothing trained."));
    html = (html + pj_section("ai", "AI", "Intelligence built on the fold instead of statistical guesswork."));
    html = (html + pj_section("platform", "The language & platform", "ErnosPlain and everything written in it — a language, a decentralised internet, an operating system."));
    html = (html + pj_section("preserve", "Preservation", "Knowledge that survives on its own — including this very site."));
    host.innerHTML = html;
    return 0;
}

function pj_param() {
    let sp, v;
    sp = Reflect.construct(window.URLSearchParams, [window.location.search]);
    v = sp.get("p");
    if (v) {
        return v;
    }
    return "";
}

function pj_find(repo) {
    for (const p of window.ERNOS_PROJECTS) {
        if ((p.repo === repo)) {
            return p;
        }
    }
    return 0;
}

function pj_doc_recv(resp) {
    if (resp.ok) {
        resp.text().then(pj_doc_apply);
    } else {
        pj_doc_fail(resp);
    }
    return 0;
}

function pj_doc_apply(text) {
    let host;
    host = document.getElementById("project-doc");
    if (host) {
        host.innerHTML = md_render(text);
    }
    return 0;
}

function pj_doc_fail(err) {
    let host;
    host = document.getElementById("project-doc");
    if (host) {
        host.innerHTML = "<p class=\"loading\">Couldn't load this project's README right now — use the GitHub link above.</p>";
    }
    return 0;
}

function pj_render_page() {
    let h, m, dl, p, gh, host, d, repo;
    host = document.getElementById("project-doc");
    if (!host) {
        return 0;
    }
    repo = pj_param();
    p = pj_find(repo);
    if (!p) {
        host.innerHTML = "<p class=\"loading\">Unknown project. <a href=\"projects.html\">Back to all projects →</a></p>";
        return 0;
    }
    document.title = (p.title + " — Ernos Labs");
    h = document.getElementById("project-title");
    if (h) {
        h.innerHTML = pj_esc(p.title);
    }
    d = document.getElementById("project-desc");
    if (d) {
        d.innerHTML = pj_esc(p.desc);
    }
    m = document.getElementById("project-meta");
    if (m) {
        m.innerHTML = pj_meta_line(p);
    }
    dl = document.getElementById("project-dl");
    if (dl) {
        dl.href = (pj_gh(repo) + "/archive/refs/heads/main.zip");
        dl.setAttribute("data-repo", repo);
    }
    gh = document.getElementById("project-gh");
    if (gh) {
        gh.href = pj_gh(repo);
    }
    host.innerHTML = "<p class=\"loading\">Loading the README…</p>";
    fetch((("content/projects/" + repo) + ".md")).then(pj_doc_recv).catch(pj_doc_fail);
    return 0;
}

function main() {
    pj_render_grid();
    pj_render_page();
    window.ernosApiReady.then(pj_check_cb);
    return 0;
}

function pj_check_cb(basev) {
    pj_check();
    return 0;
}

main();
