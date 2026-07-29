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
    if ((repo === "Smithian-Fold-Theory-Of-Everything")) {
        return "https://github.com/MettaMazza/ernos-labs-sft-platform";
    }
    return ("https://github.com/MettaMazza/" + repo);
}

function pj_desc(p) {
    if ((p.repo === "Smithian-Fold-Theory-Of-Everything")) {
        return "An open science platform and public knowledge tree connecting the current publications to claims, dependencies, controls and evidence.";
    }
    if ((p.repo === "FoldBot-Chess")) {
        return "A full legal chess engine whose position values are counted from the board, with rule certification, match receipts and replayable games.";
    }
    if ((p.repo === "Fold-Go")) {
        return "A Go project spanning exhaustive small-board verification and preserved full-board match records, built from counted connectivity and legality.";
    }
    if ((p.repo === "Fold-Protein")) {
        return "A protein-structure research engine with committed coordinates, comparison scripts and an interactive ubiquitin reconstruction.";
    }
    if ((p.repo === "UnisonAI")) {
        return "Active AI research built around inspectable memory, counted relationships, explicit component provenance and repeatable verification.";
    }
    if ((p.repo === "Ernos-Programming-Language")) {
        return "A compiled language that reads like ordinary sentences, with a browser playground, native compiler and self-hosting toolchain.";
    }
    if ((p.repo === "ErnosDecent")) {
        return "A local-first peer-to-peer application stack for identity, messaging, storage, publishing and other everyday network services.";
    }
    if ((p.repo === "Ern-OS")) {
        return "A portable operating-system project written in ErnosPlain, with a sentence-based shell and a rebuild path from a C compiler.";
    }
    if ((p.repo === "Civ-Seed")) {
        return "A self-contained collection of practical knowledge, readable digital sections and engraving-ready preservation files.";
    }
    return p.desc;
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
        pj_status_set("ai-status is-online", "<strong>Direct archive available.</strong> Downloads can be served from the Ernos Labs source machine.");
    } else {
        pj_status_fail(resp);
    }
    return 0;
}

function pj_status_fail(err) {
    pj_status_set("ai-status is-offline", "<strong>GitHub archive available.</strong> The direct source machine is currently offline, so downloads use the public repository.");
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
    let out, page;
    page = pj_page(p.repo);
    out = "<div class=\"ai-card reveal in\">";
    out = (out + (("<div class=\"ai-card__top\"><h3>" + String(pj_esc(p.title))) + "</h3></div>"));
    out = (out + (("<p class=\"ai-desc\">" + String(pj_esc(pj_desc(p)))) + "</p>"));
    out = (out + (("<p class=\"pj-meta\">" + String(pj_meta_line(p))) + "</p>"));
    out = (out + "<div class=\"ai-card__actions\">");
    out = (out + (("<a class=\"btn btn--primary\" href=\"" + String(page)) + "\">Explore →</a>"));
    out = (out + (((("<a class=\"pj-dl\" data-repo=\"" + String(p.repo)) + "\" href=\"") + String(pj_gh(p.repo))) + "/archive/refs/heads/main.zip\">⬇ Download .zip</a>"));
    out = (out + (("<a class=\"pj-ghl\" href=\"" + String(pj_gh(p.repo))) + "\" target=\"_blank\" rel=\"noopener\">GitHub ↗</a>"));
    out = (out + "</div></div>");
    return out;
}

function pj_site_card(title, description, page, action) {
    let out;
    out = "<div class=\"ai-card reveal in\">";
    out = (out + (("<div class=\"ai-card__top\"><h3>" + String(title)) + "</h3></div>"));
    out = (out + (("<p class=\"ai-desc\">" + String(description)) + "</p>"));
    out = (out + "<p class=\"pj-meta\">Ernos Labs public collection</p>");
    out = (out + (((("<div class=\"ai-card__actions\"><a class=\"btn btn--primary\" href=\"" + String(page)) + "\">") + String(action)) + " →</a></div></div>"));
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
    let cards, out, include;
    cards = "";
    for (const p of window.ERNOS_PROJECTS) {
        include = false;
        if ((key === "projects")) {
            if ((p.cat === "platform")) {
                include = true;
            }
            if ((p.cat === "ai")) {
                include = true;
            }
        } else if ((p.cat === key)) {
            include = true;
        }
        if ((p.repo === "Smithian-Fold-Theory")) {
            include = false;
        }
        if ((p.repo === "sft-dev")) {
            include = false;
        }
        if (include) {
            cards = (cards + pj_card(p));
        }
    }
    if ((key === "preserve")) {
        cards = (cards + pj_site_card("Seed Vault", "A readable, searchable route through the knowledge selected for long-term preservation, available in the browser or as downloadable text.", "seed.html", "Read the vault"));
        cards = (cards + pj_site_card("AI Archive", "Open model files kept with their formats, licences, checksums, source links and the programs needed to run them again.", "ai.html", "Browse the archive"));
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
    html = (html + pj_section("theory", "Theory", "The current Smithian Fold Theory platform, publications and public knowledge record."));
    html = (html + pj_section("projects", "Projects", "Languages, local systems, peer-to-peer infrastructure and active AI research—with working interfaces and source code."));
    html = (html + pj_section("engines", "Engines", "Chess, Go and protein-structure showcases that make the method visible through interactive results and reproducible files."));
    html = (html + pj_section("preserve", "Preservation", "Knowledge and software prepared to remain useful beyond their original machine, service or moment."));
    host.innerHTML = html;
    return 0;
}

function main() {
    pj_render_grid();
    window.ernosApiReady.then(pj_check_cb);
    return 0;
}

function pj_check_cb(basev) {
    pj_check();
    return 0;
}

main();
