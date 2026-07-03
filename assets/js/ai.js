// Auto-generated JavaScript from ErnosPlain

function esc(s) {
    let t;
    t = s;
    t = t.split("&").join("&amp;");
    t = t.split("<").join("&lt;");
    t = t.split(">").join("&gt;");
    return t;
}

function runner_html(r) {
    let out;
    out = (("<a class=\"ai-runner\" href=\"" + String(r.url)) + "\" target=\"_blank\" rel=\"noopener\">");
    out = (out + (((("<strong>" + String(r.name)) + "</strong><span>") + String(r.what)) + "</span></a>"));
    return out;
}

function model_card_html(m) {
    let out, hf;
    hf = ("https://huggingface.co/" + m.repo);
    out = "<div class=\"ai-card reveal in\">";
    out = (out + (((("<div class=\"ai-card__top\"><h3>" + String(esc(m.name))) + "</h3><span class=\"ai-size\">") + String(m.size)) + "</span></div>"));
    out = (out + (((("<p class=\"ai-fmt\">" + String(esc(m.fmt))) + " · ") + String(esc(m.license))) + "</p>"));
    out = (out + (("<p class=\"ai-desc\">" + String(esc(m.desc))) + "</p>"));
    out = (out + (((((("<div class=\"ai-run\"><span class=\"ai-run__label\">Run with <a href=\"" + String(m.runner.url)) + "\" target=\"_blank\" rel=\"noopener\">") + String(m.runner.name)) + "</a></span><code>") + String(esc(m.cmd))) + "</code></div>"));
    out = (out + "<div class=\"ai-card__actions\">");
    out = (out + (("<a class=\"btn btn--primary\" href=\"" + String(hf)) + "\" target=\"_blank\" rel=\"noopener\">Download ↗</a>"));
    if (m.mirror) {
        out = (out + (("<a class=\"work-dl\" href=\"" + String(m.mirror)) + "\">⬇ Mirror</a>"));
    }
    out = (out + (("<span class=\"ai-src\">" + String(esc(m.repo))) + "</span>"));
    out = (out + "</div></div>");
    return out;
}

function section_html(key) {
    let models, out, m, i;
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
    let runners, host, s, sec, intro, cards, stats, html, j, sections;
    host = document.getElementById("ai-content");
    if (!host) {
        return 0;
    }
    intro = window.AI_INTRO;
    stats = window.AI_STATS;
    html = "<header class=\"section\" style=\"padding-bottom:24px\"><div class=\"wrap\">";
    html = (html + (("<p class=\"eyebrow reveal\">" + String(intro.eyebrow)) + "</p>"));
    html = (html + (("<h1 class=\"reveal\">" + String(intro.title)) + "</h1>"));
    html = (html + (("<p class=\"lead reveal mt-s\">" + String(intro.lead)) + "</p>"));
    html = (html + "<div class=\"stats-banner reveal mt-l\">");
    html = (html + (("<div class=\"stat-item\"><span class=\"stat-num\">" + String(stats.count)) + "</span><span class=\"stat-label\">models preserved</span></div>"));
    html = (html + (("<div class=\"stat-item\"><span class=\"stat-num\">" + String(stats.size)) + "</span><span class=\"stat-label\">of open weights</span></div>"));
    html = (html + "<div class=\"stat-item\"><span class=\"stat-num\">Free</span><span class=\"stat-label\">no account, no gate</span></div>");
    html = (html + "</div></div></header>");
    runners = window.AI_RUNNERS;
    html = (html + "<section class=\"section\" style=\"padding-top:8px\"><div class=\"wrap\">");
    html = (html + "<p class=\"eyebrow\">Run them yourself</p><h2>The open-source programs</h2>");
    html = (html + "<p class=\"lead\" style=\"margin-bottom:24px\">Every model here runs on free, open software. Grab the one for the format and follow its readme.</p>");
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
    html = (html + "<p class=\"lead\" style=\"margin-bottom:18px\">This whole library was built with one open script. Take it, edit the model list and the drive path, and make your own preservation copy. Free to use and change.</p>");
    html = (html + "<div class=\"ai-run\" style=\"max-width:640px\"><span class=\"ai-run__label\">One-time setup, then run it</span>");
    html = (html + "<code>pip install huggingface_hub\npython3 download_archive.py</code></div>");
    html = (html + "<div class=\"ai-card__actions\" style=\"margin-top:16px\">");
    html = (html + "<a class=\"btn btn--primary\" href=\"tools/download_archive.py\" download>⬇ Download the script</a>");
    html = (html + "<a class=\"work-dl\" href=\"tools/download_archive.py\" target=\"_blank\" rel=\"noopener\">View the code</a>");
    html = (html + "</div></div></section>");
    html = (html + "<section class=\"section\" style=\"padding-top:10px\"><div class=\"wrap\">");
    html = (html + "<hr class=\"divider\" style=\"margin-bottom:26px\"><p class=\"eyebrow\">How this survives</p><h2>Help preserve it</h2>");
    html = (html + "<p class=\"lead\">Downloads resolve to each model's canonical open source. That is not preservation — hosts gate, rename, and remove models (Stable Diffusion 1.5 is already gone from its original home). Real preservation is redundancy: mirror these weights to the Internet Archive, seed them as torrents, keep copies on cold drives. If you download one, keep it. If you can host one, mirror it. The whole point is that no one owns it and no one can pull it.</p>");
    html = (html + "</div></section>");
    host.innerHTML = html;
    return 0;
}

function main() {
    render_ai();
    return 0;
}

main();
