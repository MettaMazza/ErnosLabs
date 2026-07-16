// Auto-generated JavaScript from ErnosPlain

function base() {
    let o, b;
    b = window.COMMUNITY_BASE;
    if (window.localStorage) {
        o = window.localStorage.getItem("ernosCommunityBase");
        if (o) {
            b = o;
        }
    }
    if (b) {
        return b;
    }
    return "";
}

function esc(s) {
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

function my_name() {
    let n;
    if (window.localStorage) {
        n = window.localStorage.getItem("ernosCommunityName");
        if (n) {
            return n;
        }
    }
    return "anon";
}

function post_json(url, payload) {
    let opts;
    opts = js_object();
    opts.method = "POST";
    opts.body = JSON.stringify(payload);
    return fetch(url, opts);
}

function set_status(cls, msg) {
    let el;
    el = document.getElementById("cm-status");
    if (el) {
        el.className = cls;
        el.innerHTML = msg;
    }
    return 0;
}

function go_online() {
    if (window.cmOnline) {
        return 0;
    }
    window.cmOnline = true;
    set_status("cm-status is-online", "🟢 <strong>Community online</strong> — hosted live from the source machine.");
    return 0;
}

function go_offline() {
    window.cmOnline = false;
    set_status("cm-status is-offline", "🌙 <strong>The host is asleep.</strong> This room is served straight from Maria's machine — when it's online you can read and post here. Come back soon.");
    return 0;
}

function status_ping(resp) {
    if (resp.ok) {
        go_online();
    } else {
        go_offline();
    }
    return 0;
}

function check_status() {
    fetch((base() + "/ping")).then(status_ping).catch(go_offline);
    return 0;
}

function hide_tabs() {
    let secs, btns;
    secs = document.querySelectorAll(".cm-tab");
    for (const sec of secs) {
        sec.classList.add("hidden");
    }
    btns = document.querySelectorAll(".cm-tabbtn");
    for (const b of btns) {
        b.classList.remove("active");
    }
    return 0;
}

function show_tab(name) {
    let sec, btn;
    hide_tabs();
    sec = document.getElementById(("tab-" + name));
    if (sec) {
        sec.classList.remove("hidden");
    }
    btn = document.getElementById(("tabbtn-" + name));
    if (btn) {
        btn.classList.add("active");
    }
    if ((name === "chat")) {
        load_chat();
    }
    if ((name === "forum")) {
        show_thread_list();
        load_threads();
    }
    if ((name === "links")) {
        load_links();
    }
    return 0;
}

function tab_chat(ev) {
    show_tab("chat");
    return 0;
}

function tab_forum(ev) {
    show_tab("forum");
    return 0;
}

function tab_links(ev) {
    show_tab("links");
    return 0;
}

function tab_faq(ev) {
    show_tab("faq");
    return 0;
}

function load_chat() {
    let url;
    url = ((base() + "/community/chat?since=") + String(window.chatLastId));
    fetch(url).then(chat_recv).catch(go_offline);
    return 0;
}

function chat_recv(resp) {
    go_online();
    resp.json().then(chat_apply);
    return 0;
}

function chat_apply(data) {
    let add, log;
    log = document.getElementById("chat-log");
    if (!log) {
        return 0;
    }
    add = "";
    for (const m of data.messages) {
        add = (add + (((((("<div class=\"cm-msg\"><span class=\"cm-msg__name\">" + String(esc(m.name))) + "</span><span class=\"cm-msg__time\">") + String(fmt_time(m.ts))) + "</span><div class=\"cm-msg__body\">") + String(esc(m.body))) + "</div></div>"));
        window.chatLastId = m.id;
    }
    if ((add === "")) {
        return 0;
    }
    log.innerHTML = (log.innerHTML + add);
    log.scrollTop = log.scrollHeight;
    return 0;
}

function send_chat() {
    let body, p, inp;
    inp = document.getElementById("chat-input");
    if (!inp) {
        return 0;
    }
    body = inp.value;
    if (!body) {
        return 0;
    }
    if ((body.trim() === "")) {
        return 0;
    }
    p = js_object();
    p.name = my_name();
    p.body = body;
    post_json((base() + "/community/chat"), p).then(chat_sent).catch(go_offline);
    inp.value = "";
    return 0;
}

function chat_sent(resp) {
    go_online();
    load_chat();
    return 0;
}

function chat_send_ev(ev) {
    send_chat();
    return 0;
}

function chat_key_ev(ev) {
    if ((ev.key === "Enter")) {
        if (!ev.shiftKey) {
            ev.preventDefault();
            send_chat();
        }
    }
    return 0;
}

function show_thread_list() {
    let lv, tv;
    lv = document.getElementById("forum-list-view");
    tv = document.getElementById("forum-thread-view");
    if (lv) {
        lv.classList.remove("hidden");
    }
    if (tv) {
        tv.classList.add("hidden");
    }
    return 0;
}

function load_threads() {
    fetch((base() + "/community/threads")).then(threads_recv).catch(go_offline);
    return 0;
}

function threads_recv(resp) {
    go_online();
    resp.json().then(threads_apply);
    return 0;
}

function threads_apply(data) {
    let host, out, links;
    host = document.getElementById("forum-threads");
    if (!host) {
        return 0;
    }
    out = "";
    for (const t of data.threads) {
        out = (out + (((((((((("<button class=\"cm-thread\" data-id=\"" + String(String(t.id))) + "\"><span class=\"cm-thread__title\">") + String(esc(t.title))) + "</span><span class=\"cm-thread__meta\">by ") + String(esc(t.author))) + " · ") + String(String(t.replies))) + " replies · ") + String(fmt_time(t.last_ts))) + "</span></button>"));
    }
    if ((out === "")) {
        out = "<p class=\"cm-empty\">No threads yet. Start the first one below.</p>";
    }
    host.innerHTML = out;
    links = host.querySelectorAll(".cm-thread");
    for (const c of links) {
        c.addEventListener("click", open_thread_ev);
    }
    return 0;
}

function open_thread_ev(ev) {
    let id;
    id = ev.currentTarget.getAttribute("data-id");
    open_thread(id);
    return 0;
}

function open_thread(id) {
    window.cmThread = id;
    fetch(((base() + "/community/thread/") + id)).then(thread_recv).catch(go_offline);
    return 0;
}

function thread_recv(resp) {
    go_online();
    resp.json().then(thread_apply);
    return 0;
}

function thread_apply(data) {
    let tv, t, lv, head, posts, out;
    lv = document.getElementById("forum-list-view");
    tv = document.getElementById("forum-thread-view");
    if (lv) {
        lv.classList.add("hidden");
    }
    if (tv) {
        tv.classList.remove("hidden");
    }
    head = document.getElementById("thread-head");
    t = data.thread;
    if (head) {
        head.innerHTML = (((((((("<h3 class=\"cm-thread__h\">" + String(esc(t.title))) + "</h3><p class=\"cm-op\"><span class=\"cm-msg__name\">") + String(esc(t.author))) + "</span><span class=\"cm-msg__time\">") + String(fmt_time(t.ts))) + "</span></p><div class=\"cm-op__body\">") + String(esc(t.body))) + "</div>");
    }
    posts = document.getElementById("thread-posts");
    if (posts) {
        out = "";
        for (const p of data.posts) {
            out = (out + (((((("<div class=\"cm-post\"><p class=\"cm-post__by\"><span class=\"cm-msg__name\">" + String(esc(p.author))) + "</span><span class=\"cm-msg__time\">") + String(fmt_time(p.ts))) + "</span></p><div class=\"cm-msg__body\">") + String(esc(p.body))) + "</div></div>"));
        }
        posts.innerHTML = out;
    }
    return 0;
}

function send_reply() {
    let body, p, inp;
    inp = document.getElementById("reply-body");
    if (!inp) {
        return 0;
    }
    body = inp.value;
    if (!body) {
        return 0;
    }
    if ((body.trim() === "")) {
        return 0;
    }
    p = js_object();
    p.author = my_name();
    p.body = body;
    post_json((((base() + "/community/thread/") + window.cmThread) + "/reply"), p).then(reply_sent).catch(go_offline);
    inp.value = "";
    return 0;
}

function reply_sent(resp) {
    go_online();
    open_thread(window.cmThread);
    return 0;
}

function reply_ev(ev) {
    send_reply();
    return 0;
}

function back_ev(ev) {
    show_thread_list();
    load_threads();
    return 0;
}

function create_thread() {
    let body, bo, ti, title, p;
    ti = document.getElementById("new-title");
    bo = document.getElementById("new-body");
    if (!ti) {
        return 0;
    }
    if (!bo) {
        return 0;
    }
    title = ti.value;
    body = bo.value;
    if ((title.trim() === "")) {
        return 0;
    }
    if ((body.trim() === "")) {
        return 0;
    }
    p = js_object();
    p.author = my_name();
    p.title = title;
    p.body = body;
    post_json((base() + "/community/threads"), p).then(thread_created).catch(go_offline);
    ti.value = "";
    bo.value = "";
    return 0;
}

function thread_created(resp) {
    go_online();
    load_threads();
    return 0;
}

function new_thread_ev(ev) {
    create_thread();
    return 0;
}

function load_links() {
    fetch((base() + "/community/links")).then(links_recv).catch(go_offline);
    return 0;
}

function links_recv(resp) {
    go_online();
    resp.json().then(links_apply);
    return 0;
}

function link_note_html(l) {
    let tt;
    tt = l.title;
    if (tt) {
        if ((tt.trim() === "")) {
            return "";
        }
        return (("<p class=\"cm-link__note\">" + String(esc(tt))) + "</p>");
    }
    return "";
}

function links_apply(data) {
    let slug, host, out;
    host = document.getElementById("links-list");
    if (!host) {
        return 0;
    }
    out = "";
    for (const l of data.links) {
        slug = l.provider.toLowerCase().split(" ").join("-");
        out = (out + (((((((((((((("<div class=\"cm-link\"><div class=\"cm-link__top\"><span class=\"cm-badge cm-badge--" + String(slug)) + "\">") + String(esc(l.provider))) + "</span><span class=\"cm-msg__time\">shared by ") + String(esc(l.submitter))) + " · ") + String(fmt_time(l.ts))) + "</span></div>") + String(link_note_html(l))) + "<a class=\"cm-link__url\" href=\"") + String(esc(l.url))) + "\" target=\"_blank\" rel=\"noopener nofollow\">") + String(esc(l.url))) + "</a></div>"));
    }
    if ((out === "")) {
        out = "<p class=\"cm-empty\">No links yet. Be the first to share a public AI chat.</p>";
    }
    host.innerHTML = out;
    return 0;
}

function submit_link() {
    let ui, url, note, ni, p;
    ui = document.getElementById("link-url");
    if (!ui) {
        return 0;
    }
    url = ui.value;
    if (!url) {
        return 0;
    }
    if ((url.trim() === "")) {
        return 0;
    }
    note = "";
    ni = document.getElementById("link-note");
    if (ni) {
        note = ni.value;
    }
    p = js_object();
    p.submitter = my_name();
    p.url = url;
    p.title = note;
    post_json((base() + "/community/links"), p).then(link_sent).catch(go_offline);
    return 0;
}

function link_sent(resp) {
    let ui, ni;
    go_online();
    if (resp.ok) {
        ui = document.getElementById("link-url");
        ni = document.getElementById("link-note");
        if (ui) {
            ui.value = "";
        }
        if (ni) {
            ni.value = "";
        }
        load_links();
    } else {
        resp.json().then(link_err);
    }
    return 0;
}

function link_err(data) {
    let msg;
    msg = "Could not post that link.";
    if (data.detail) {
        msg = data.detail;
    }
    window.alert(msg);
    return 0;
}

function link_add_ev(ev) {
    submit_link();
    return 0;
}

function name_ev(ev) {
    if (window.localStorage) {
        window.localStorage.setItem("ernosCommunityName", ev.currentTarget.value);
    }
    return 0;
}

function wire(id, evt, cb) {
    let el;
    el = document.getElementById(id);
    if (el) {
        el.addEventListener(evt, cb);
    }
    return 0;
}

function main() {
    let ni;
    window.chatLastId = 0;
    window.cmOnline = false;
    window.cmThread = "";
    ni = document.getElementById("cm-name");
    if (ni) {
        ni.value = my_name();
        ni.addEventListener("input", name_ev);
    }
    wire("tabbtn-chat", "click", tab_chat);
    wire("tabbtn-forum", "click", tab_forum);
    wire("tabbtn-links", "click", tab_links);
    wire("tabbtn-faq", "click", tab_faq);
    wire("chat-send", "click", chat_send_ev);
    wire("chat-input", "keydown", chat_key_ev);
    wire("new-create", "click", new_thread_ev);
    wire("reply-send", "click", reply_ev);
    wire("thread-back", "click", back_ev);
    wire("link-add", "click", link_add_ev);
    check_status();
    show_tab("chat");
    if (window.cmPoll) {
        window.clearInterval(window.cmPoll);
    }
    window.cmPoll = window.setInterval(poll, 5000);
    return 0;
}

function poll() {
    let tab;
    tab = document.getElementById("tab-chat");
    if (tab) {
        if (tab.classList.contains("hidden")) {
            return 0;
        }
    }
    load_chat();
    return 0;
}

main();
