// Auto-generated JavaScript from ErnosPlain

function make_work(id, file, title, sub, words, collection) {
    let w;
    w = JSON.parse("{}");
    w.id = id;
    w.file = file;
    w.title = title;
    w.sub = sub;
    w.words = words;
    w.collection = collection;
    return w;
}

function catalog() {
    return window.READER_WORKS;
}

function read_minutes(words) {
    return Math.ceil((words / 220));
}

function fmt_words(words) {
    if ((words >= 1000)) {
        return (String(Math.round((words / 1000))) + "k words");
    }
    return (String(words) + " words");
}

function work_card_html(w) {
    let out, mins;
    mins = read_minutes(w.words);
    out = "<div class=\"work-item\">";
    out = (out + (("<button class=\"card work-card reveal in\" data-id=\"" + String(w.id)) + "\">"));
    out = (out + (((("<span class=\"card__tag\">" + String(fmt_words(w.words))) + " · ~") + String(mins)) + " min</span>"));
    out = (out + (("<h3>" + String(w.title)) + "</h3>"));
    out = (out + (("<p>" + String(w.sub)) + "</p>"));
    out = (out + "<span class=\"go\">Read →</span></button>");
    out = (out + (("<a class=\"work-dl\" href=\"" + String(w.file)) + "\" download>⬇ Download</a>"));
    out = (out + "</div>");
    return out;
}

function section_cards(works, collection) {
    let i, out, w;
    out = "";
    i = 0;
    while ((i < works.length)) {
        w = works[i];
        if ((w.collection === collection)) {
            out = (out + work_card_html(w));
        }
        i = (i + 1);
    }
    return out;
}

function render_catalog() {
    let cards, cards0, works, html, i, intro, sections, s, cat;
    works = catalog();
    intro = window.READER_INTRO;
    sections = window.READER_SECTIONS;
    html = "<div class=\"section\" style=\"padding-top:40px\"><div class=\"wrap\">";
    html = (html + (((("<p class=\"eyebrow\">" + String(intro.eyebrow)) + "</p><h1>") + String(intro.title)) + "</h1>"));
    html = (html + (("<p class=\"lead\">" + String(intro.lead)) + "</p>"));
    i = 0;
    while ((i < sections.length)) {
        s = sections[i];
        cards0 = section_cards(works, s.collection);
        html = (html + (("<h2 style=\"margin-top:54px\">" + String(s.heading)) + "</h2>"));
        html = (html + (("<p class=\"lead\" style=\"margin-bottom:24px\">" + String(s.sub)) + "</p>"));
        html = (((html + "<div class=\"grid grid--2\">") + cards0) + "</div>");
        i = (i + 1);
    }
    if (window.READER_EXTRA_HTML) {
        html = (html + window.READER_EXTRA_HTML);
    }
    html = (html + "</div></div>");
    cat = document.getElementById("catalog");
    cat.innerHTML = html;
    cards = document.querySelectorAll(".work-card");
    for (const c of cards) {
        c.addEventListener("click", open_from_event);
    }
    return 0;
}

function open_from_event(ev) {
    let id;
    id = ev.currentTarget.getAttribute("data-id");
    open_work(id);
    return 0;
}

function find_work(id) {
    let w, i, works;
    works = catalog();
    i = 0;
    while ((i < works.length)) {
        w = works[i];
        if ((w.id === id)) {
            return w;
        }
        i = (i + 1);
    }
    return false;
}

function open_work(id) {
    let dl, rd, w, rtitle, doc, toc0, url;
    w = find_work(id);
    if (!w) {
        return 0;
    }
    window.curWork = w;
    window.history.replaceState(null, "", ("#" + id));
    document.getElementById("catalog").classList.add("hidden");
    rd = document.getElementById("reader");
    rd.classList.remove("hidden");
    rtitle = document.getElementById("reader-title");
    rtitle.textContent = w.title;
    dl = document.getElementById("reader-dl");
    if (dl) {
        dl.href = w.file;
    }
    doc = document.getElementById("doc");
    doc.innerHTML = (("<p class=\"loading\">Loading " + w.title) + "…</p>");
    toc0 = document.getElementById("toc");
    toc0.innerHTML = "";
    window.scrollTo(0, 0);
    url = w.file;
    fetch(url).then(resp_text).then(render_doc);
    return 0;
}

function resp_text(resp) {
    return resp.text();
}

function render_doc(text) {
    let doc, html;
    doc = document.getElementById("doc");
    html = md_render(text);
    window.docHtml = html;
    doc.innerHTML = html;
    build_toc(text);
    apply_font();
    return 0;
}

function build_toc(text) {
    let h, cls, links, toc, heads, out, i;
    heads = md_headings(text);
    toc = document.getElementById("toc");
    if ((heads.length < 2)) {
        toc.innerHTML = "";
        return 0;
    }
    out = "<div class=\"toc__title\">Contents</div>";
    i = 0;
    while ((i < heads.length)) {
        h = heads[i];
        cls = ("toc__lvl" + String(h.level));
        out = (out + (((((("<a class=\"toc__link " + String(cls)) + "\" data-target=\"") + String(h.id)) + "\">") + String(h.text)) + "</a>"));
        i = (i + 1);
    }
    toc.innerHTML = out;
    links = toc.querySelectorAll(".toc__link");
    for (const a of links) {
        a.addEventListener("click", toc_jump);
    }
    return 0;
}

function toc_jump(ev) {
    let el, id;
    id = ev.currentTarget.getAttribute("data-target");
    el = document.getElementById(id);
    if (el) {
        el.scrollIntoView();
    }
    return 0;
}

function back_to_catalog(ev) {
    stop_tts();
    document.getElementById("reader").classList.add("hidden");
    document.getElementById("catalog").classList.remove("hidden");
    window.history.replaceState(null, "", window.location.pathname);
    window.scrollTo(0, 0);
    return 0;
}

function copy_link(ev) {
    let btn;
    btn = document.getElementById("copy-link");
    if (window.navigator.clipboard) {
        window.navigator.clipboard.writeText(window.location.href);
        if (btn) {
            btn.textContent = "✓ Copied";
            window.setTimeout(reset_copy_label, 1600);
        }
    }
    return 0;
}

function reset_copy_label() {
    let btn;
    btn = document.getElementById("copy-link");
    if (btn) {
        btn.textContent = "🔗 Copy link";
    }
    return 0;
}

function apply_font() {
    let doc;
    doc = document.getElementById("doc");
    doc.style.fontSize = (String(window.readerFont) + "px");
    return 0;
}

function font_bigger(ev) {
    window.readerFont = (window.readerFont + 1);
    apply_font();
    return 0;
}

function font_smaller(ev) {
    window.readerFont = (window.readerFont - 1);
    apply_font();
    return 0;
}

function regex_escape(s) {
    return s.replace(md_rx("[.*+?^${}()|\\[\\]\\\\]", "g"), "\\$&");
}

function do_search(ev) {
    let marks, count, esc, doc, q, re, hl;
    q = document.getElementById("search").value;
    doc = document.getElementById("doc");
    count = document.getElementById("search-count");
    if ((q === "")) {
        doc.innerHTML = window.docHtml;
        count.textContent = "";
        return 0;
    }
    if ((q.length < 2)) {
        return 0;
    }
    esc = regex_escape(q);
    re = md_rx((esc + "(?![^<]*>)"), "gi");
    hl = window.docHtml.replace(re, "<mark>$&</mark>");
    doc.innerHTML = hl;
    marks = doc.querySelectorAll("mark");
    count.textContent = (String(marks.length) + " matches");
    if ((marks.length > 0)) {
        marks[0].scrollIntoView();
    }
    return 0;
}

function stop_tts() {
    let btn;
    if (window.kokoroTTS) {
        window.kokoroTTS.stop();
    } else if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    window.ttsOn = false;
    btn = document.getElementById("tts");
    if (btn) {
        btn.textContent = "▶ Read aloud";
    }
    return 0;
}

function toggle_tts(ev) {
    let voice, u, text, doc, voice_sel, btn;
    if (window.ttsOn) {
        stop_tts();
        return 0;
    }
    doc = document.getElementById("doc");
    text = doc.textContent;
    if ((text.length > 15000)) {
        text = text.slice(0, 15000);
    }
    window.ttsOn = true;
    btn = document.getElementById("tts");
    btn.textContent = "■ Stop";
    if (window.kokoroTTS) {
        voice_sel = document.getElementById("voice-select");
        voice = "bm_fable";
        if (voice_sel) {
            voice = voice_sel.value;
        }
        window.kokoroTTS.speak(text, voice);
    } else if (window.speechSynthesis) {
        u = Reflect.construct(window.SpeechSynthesisUtterance, [text]);
        u.rate = 1;
        u.onend = tts_ended;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
    }
    return 0;
}

function tts_ended(ev) {
    stop_tts();
    return 0;
}

function tts_status_handler(status, detail) {
    let el;
    el = document.getElementById("tts-status");
    if (el) {
        el.textContent = detail;
    }
    if ((status === "done")) {
        stop_tts();
    }
    return 0;
}

function build_voice_selector() {
    let html, v, container, voices, i;
    container = document.getElementById("voice-container");
    if (!container) {
        return 0;
    }
    if (!window.kokoroTTS) {
        return 0;
    }
    voices = window.kokoroTTS.getVoices();
    html = "<select class=\"r-btn\" id=\"voice-select\" aria-label=\"Voice\">";
    i = 0;
    while ((i < voices.length)) {
        v = voices[i];
        html = (html + (((("<option value=\"" + String(v.id)) + "\">") + String(v.name)) + "</option>"));
        i = (i + 1);
    }
    html = (html + "</select>");
    container.innerHTML = html;
    return 0;
}

function main() {
    let clink, hash;
    window.readerFont = 19;
    window.ttsOn = false;
    render_catalog();
    document.getElementById("back").addEventListener("click", back_to_catalog);
    document.getElementById("font-up").addEventListener("click", font_bigger);
    document.getElementById("font-down").addEventListener("click", font_smaller);
    document.getElementById("search").addEventListener("input", do_search);
    document.getElementById("tts").addEventListener("click", toggle_tts);
    clink = document.getElementById("copy-link");
    if (clink) {
        clink.addEventListener("click", copy_link);
    }
    if (window.kokoroTTS) {
        window.kokoroTTS.setOnStatusChange(tts_status_handler);
        build_voice_selector();
    }
    hash = window.location.hash;
    if (hash) {
        if ((hash.length > 1)) {
            open_work(hash.slice(1));
        }
    }
    return 0;
}

main();
