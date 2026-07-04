// Auto-generated JavaScript from ErnosPlain

function esc(s) {
    let t;
    t = s;
    t = t.split("&").join("&amp;");
    t = t.split("<").join("&lt;");
    t = t.split(">").join("&gt;");
    return t;
}

function archive_base() {
    let b;
    b = "";
    if (window.localStorage) {
        b = window.localStorage.getItem("ernosArchiveBase");
    }
    if (!b) {
        b = window.ARCHIVE_BASE_DEFAULT;
    }
    if (!b) {
        return "";
    }
    while (((b.length > 0) && b.endsWith("/"))) {
        b = b.slice(0, (b.length - 1));
    }
    return b;
}

function runner_html(r) {
    let out;
    out = (("<a class=\"ai-runner\" href=\"" + String(r.url)) + "\" target=\"_blank\" rel=\"noopener\">");
    out = (out + (((("<strong>" + String(r.name)) + "</strong><span>") + String(r.what)) + "</span></a>"));
    return out;
}

function model_card_html(m) {
    let ab, hf, machine, out;
    ab = window.__ab;
    out = "<div class=\"ai-card reveal in\">";
    out = (out + (((("<div class=\"ai-card__top\"><h3>" + String(esc(m.name))) + "</h3><span class=\"ai-size\">") + String(m.size)) + "</span></div>"));
    out = (out + (((("<p class=\"ai-fmt\">" + String(esc(m.fmt))) + " · ") + String(esc(m.license))) + "</p>"));
    out = (out + (("<p class=\"ai-desc\">" + String(esc(m.desc))) + "</p>"));
    out = (out + (((((("<div class=\"ai-run\"><span class=\"ai-run__label\">Run with <a href=\"" + String(m.runner.url)) + "\" target=\"_blank\" rel=\"noopener\">") + String(m.runner.name)) + "</a></span><code>") + String(esc(m.cmd))) + "</code></div>"));
    hf = ("https://huggingface.co/" + m.repo);
    machine = "";
    if ((ab === "")) {
        machine = "";
    } else {
        machine = ((ab + "/") + m.path);
        if (m.dir) {
            machine = (machine + "/");
        }
    }
    out = (out + "<div class=\"ai-card__actions\">");
    out = (out + (((("<a class=\"btn btn--primary ai-dl\" href=\"" + String(hf)) + "\" data-machine=\"") + String(machine)) + "\">⬇ Download</a>"));
    out = (out + (("<span class=\"ai-src\">from " + String(esc(m.repo))) + "</span>"));
    out = (out + "</div></div>");
    return out;
}

function section_html(key) {
    let out, m, i, models;
    models = window.AI_MODELS;
    out = "";
    i = 0;
    while ((i < models.length)) {
        m = models[i];
        if ((m.cat === key)) {
            out = (out + model_card_html(m));
        }
        i = (i + 1);
    }
    return out;
}

function render_ai() {
    let j, s, sections, stats, sec, cards, host, intro, html, runners, ab;
    host = document.getElementById("ai-content");
    if (!host) {
        return 0;
    }
    window.__ab = archive_base();
    ab = window.__ab;
    intro = window.AI_INTRO;
    stats = window.AI_STATS;
    html = "<header class=\"section\" style=\"padding-bottom:20px\"><div class=\"wrap\">";
    html = (html + (("<p class=\"eyebrow\">" + String(intro.eyebrow)) + "</p>"));
    html = (html + (("<h1>" + String(intro.title)) + "</h1>"));
    html = (html + (("<p class=\"lead mt-s\">" + String(intro.lead)) + "</p>"));
    html = (html + "<div id=\"ai-status\" class=\"ai-status\">Checking the archive…</div>");
    html = (html + "<div class=\"stats-banner\">");
    html = (html + (("<div class=\"stat-item\"><span class=\"stat-num\">" + String(stats.count)) + "</span><span class=\"stat-label\">models preserved</span></div>"));
    html = (html + (("<div class=\"stat-item\"><span class=\"stat-num\">" + String(stats.size)) + "</span><span class=\"stat-label\">of open weights</span></div>"));
    html = (html + "<div class=\"stat-item\"><span class=\"stat-num\">Self-hosted</span><span class=\"stat-label\">from the source machine</span></div>");
    html = (html + "</div></div></header>");
    runners = window.AI_RUNNERS;
    html = (html + "<section class=\"section\" style=\"padding-top:8px\"><div class=\"wrap\">");
    html = (html + "<p class=\"eyebrow\">Run them yourself</p><h2>The open-source programs</h2>");
    html = (html + "<p class=\"lead\" style=\"margin-bottom:24px\">Every model here runs on free, open software. Grab the one for the format.");
    if ((ab === "")) {
        html = (html + "</p>");
    } else {
        html = (html + ((" They are also mirrored on the archive — <a href=\"" + String(ab)) + "/programs/\" style=\"color:var(--ink-0)\">browse programs ↗</a>.</p>"));
    }
    html = (html + "<div class=\"ai-runners\">");
    j = 0;
    while ((j < runners.length)) {
        html = (html + runner_html(runners[j]));
        j = (j + 1);
    }
    html = (html + "</div></div></section>");
    sections = window.AI_SECTIONS;
    html = (html + "<section class=\"section\" style=\"padding-top:0\"><div class=\"wrap\">");
    s = 0;
    while ((s < sections.length)) {
        sec = sections[s];
        cards = section_html(sec.key);
        html = (html + (("<hr class=\"divider\" style=\"margin:34px 0 26px\"><h2>" + String(sec.heading)) + "</h2>"));
        html = (html + (("<p class=\"lead\" style=\"margin-bottom:24px\">" + String(sec.sub)) + "</p>"));
        html = (((html + "<div class=\"ai-grid\">") + cards) + "</div>");
        s = (s + 1);
    }
    html = (html + "</div></section>");
    html = (html + "<section class=\"section\" style=\"padding-top:0\"><div class=\"wrap\">");
    html = (html + "<hr class=\"divider\" style=\"margin:34px 0 26px\"><p class=\"eyebrow\">Roll your own</p><h2>Build your own archive</h2>");
    html = (html + "<p class=\"lead\" style=\"margin-bottom:18px\">This whole library was built with one open script &mdash; written in <a href=\"ernosplain.html\" style=\"color:var(--ink-0)\">ErnosPlain</a>, the same language as everything else here. No Python, no huggingface_hub: it compiles to a native binary and drives <code>curl</code> to pull every model straight from source. Take it, edit the model list and the archive path, and make your own preservation copy.</p>");
    html = (html + "<div class=\"ai-run\" style=\"max-width:640px\"><span class=\"ai-run__label\">Compile it, then run it</span>");
    html = (html + "<code>ernos download_archive.ep\n./download_archive</code></div>");
    html = (html + "<div class=\"ai-card__actions\" style=\"margin-top:16px\">");
    html = (html + "<a class=\"btn btn--primary\" href=\"tools/download_archive.ep\" download>⬇ Download the script (.ep)</a>");
    html = (html + "<a class=\"work-dl\" href=\"tools/download_archive.ep\" target=\"_blank\" rel=\"noopener\">View the code</a>");
    html = (html + "</div></div></section>");
    html = (html + "<section class=\"section\" style=\"padding-top:10px\"><div class=\"wrap\">");
    html = (html + "<hr class=\"divider\" style=\"margin-bottom:26px\"><p class=\"eyebrow\">How this survives</p><h2>Help preserve it</h2>");
    html = (html + "<p class=\"lead\">These weights are served straight from the source machine — not from Hugging Face or GitHub, so they outlive any of those going down or pulling a model. That means a download works when the machine is online. Real permanence is redundancy: if you pull a model, keep it; if you can host one, mirror it; seed it to others. The whole point is that no one owns it and no one can quietly delete it.</p>");
    html = (html + "</div></section>");
    host.innerHTML = html;
    return 0;
}

function status_set(cls, msg) {
    let el;
    el = document.getElementById("ai-status");
    if (el) {
        el.className = cls;
        el.innerHTML = msg;
    }
    return 0;
}

function use_machine() {
    let mu, links;
    links = document.querySelectorAll(".ai-dl");
    for (const a of links) {
        mu = a.getAttribute("data-machine");
        if (mu) {
            a.href = mu;
        }
    }
    return 0;
}

function status_ok(resp) {
    if (resp.ok) {
        use_machine();
        status_set("ai-status is-online", "🟢 <strong>Archive online</strong> — downloads come straight from the source machine.");
    } else {
        status_fail(resp);
    }
    return 0;
}

function status_fail(err) {
    status_set("ai-status is-offline", "🔴 <strong>The source machine is offline.</strong> Downloads fall back to the original open source for now.");
    return 0;
}

function check_status() {
    let ab;
    ab = window.__ab;
    if ((ab === "")) {
        status_set("ai-status", "Downloads use each model's original open source. When the archive machine is online, they switch to serving straight from it.");
        return 0;
    }
    fetch((ab + "/ping")).then(status_ok).catch(status_fail);
    return 0;
}

function main() {
    render_ai();
    check_status();
    return 0;
}

main();
