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
    let works;
    works = [];
    works.push(make_work("a-mind-is-born", "a-mind-is-born.md", "A Mind Is Born", "Book One — the origin novel. A childhood in 1990s Glasgow, reading as survival.", 251522, "lastmind"));
    works.push(make_work("behind-the-mask", "behind-the-mask.md", "Behind the Mask", "Vol I · The Devil They Call God — the 400-year debt-money mechanism.", 281246, "lastmind"));
    works.push(make_work("behind-the-performance", "behind-the-performance.md", "Behind the Performance", "Vol II · The Demon They Call the State — the political class as operating layer.", 536662, "lastmind"));
    works.push(make_work("behind-the-blessed", "behind-the-blessed.md", "Behind the Blessed", "Vol III · The Demon They Call the Church — institutional capture of faith.", 318151, "lastmind"));
    works.push(make_work("behind-the-knowing", "behind-the-knowing.md", "Behind the Knowing", "Vol IV · The Demon They Call Consensus — press, academia, the knowledge apparatus.", 192588, "lastmind"));
    works.push(make_work("behind-the-synthesis", "behind-the-synthesis.md", "Behind the Synthesis", "Vol V · The Devil, the Demons & the Masks — the unifying framework.", 30331, "lastmind"));
    works.push(make_work("ernosdecent-book", "ernosdecent-book.md", "ErnosDecent: Owned by No One", "The plain-language book — what to build instead, in everyday words.", 64487, "ernos"));
    return works;
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
    out = (("<button class=\"card work-card reveal in\" data-id=\"" + String(w.id)) + "\">");
    out = (out + (((("<span class=\"card__tag\">" + String(fmt_words(w.words))) + " · ~") + String(mins)) + " min</span>"));
    out = (out + (("<h3>" + String(w.title)) + "</h3>"));
    out = (out + (("<p>" + String(w.sub)) + "</p>"));
    out = (out + "<span class=\"go\">Read →</span></button>");
    return out;
}

function render_catalog() {
    let w, cards, ernos, last, html, cat, works, i;
    works = catalog();
    last = "";
    ernos = "";
    i = 0;
    while ((i < works.length)) {
        w = works[i];
        if ((w.collection === "lastmind")) {
            last = (last + work_card_html(w));
        } else {
            ernos = (ernos + work_card_html(w));
        }
        i = (i + 1);
    }
    html = "<div class=\"section\" style=\"padding-top:40px\"><div class=\"wrap\">";
    html = (html + "<p class=\"eyebrow\">The writing</p><h1>The Library</h1>");
    html = (html + "<p class=\"lead\">A reader for the full body of work — open any volume to read it here, with chapters, search, and read-aloud. Nothing to download.</p>");
    html = (html + "<h2 style=\"margin-top:54px\">The Last Mind</h2>");
    html = (html + "<p class=\"lead\" style=\"margin-bottom:24px\">A five-volume work on institutional capture, with the origin novel <em>A Mind Is Born</em> as its gateway.</p>");
    html = (((html + "<div class=\"grid grid--2\">") + last) + "</div>");
    html = (html + "<h2 style=\"margin-top:64px\">ErnosDecent</h2>");
    html = (html + "<p class=\"lead\" style=\"margin-bottom:24px\">The constructive counterpart — what to build instead.</p>");
    html = (((html + "<div class=\"grid grid--2\">") + ernos) + "</div>");
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
    let i, works, w;
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
    let rd, doc, toc0, w, url, rtitle;
    w = find_work(id);
    if (!w) {
        return 0;
    }
    window.curWork = w;
    document.getElementById("catalog").classList.add("hidden");
    rd = document.getElementById("reader");
    rd.classList.remove("hidden");
    rtitle = document.getElementById("reader-title");
    rtitle.textContent = w.title;
    doc = document.getElementById("doc");
    doc.innerHTML = (("<p class=\"loading\">Loading " + w.title) + "…</p>");
    toc0 = document.getElementById("toc");
    toc0.innerHTML = "";
    window.scrollTo(0, 0);
    url = ("content/library/" + w.file);
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
    let toc, i, cls, out, links, h, heads;
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
    let id, el;
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
    window.scrollTo(0, 0);
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
    let hl, marks, count, doc, q, esc, re;
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
    let voice_sel, text, doc, voice, btn, u;
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
        voice = "af_heart";
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
    let container, voices, i, html, v;
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
    window.readerFont = 19;
    window.ttsOn = false;
    render_catalog();
    document.getElementById("back").addEventListener("click", back_to_catalog);
    document.getElementById("font-up").addEventListener("click", font_bigger);
    document.getElementById("font-down").addEventListener("click", font_smaller);
    document.getElementById("search").addEventListener("input", do_search);
    document.getElementById("tts").addEventListener("click", toggle_tts);
    if (window.kokoroTTS) {
        window.kokoroTTS.setOnStatusChange(tts_status_handler);
        build_voice_selector();
    }
    return 0;
}

main();
