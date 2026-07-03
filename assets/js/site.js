// Auto-generated JavaScript from ErnosPlain

function new_obj() {
    return JSON.parse("{}");
}

function rand_between(lo, hi) {
    return (lo + (Math.random() * (hi - lo)));
}

function mesh_make_nodes(count, w, h) {
    let n, i, nodes;
    nodes = [];
    i = 0;
    while ((i < count)) {
        n = new_obj();
        n.x = (Math.random() * w);
        n.y = (Math.random() * h);
        n.vx = rand_between((0 - 0.18), 0.18);
        n.vy = rand_between((0 - 0.18), 0.18);
        nodes.push(n);
        i = (i + 1);
    }
    return nodes;
}

function mesh_resize() {
    let dpr, ctx, canvas, w, h;
    canvas = window.ernCanvas;
    if (!canvas) {
        return 0;
    }
    dpr = (window.devicePixelRatio || 1);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = (w * dpr);
    canvas.height = (h * dpr);
    ctx = window.ernCtx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    window.ernW = w;
    window.ernH = h;
    return 0;
}

function mesh_frame() {
    let i, dx, a, nodes, ctx, j, b, dist, alpha, h, count, dy, n, w;
    ctx = window.ernCtx;
    nodes = window.ernNodes;
    w = window.ernW;
    h = window.ernH;
    if (!ctx) {
        return 0;
    }
    ctx.clearRect(0, 0, w, h);
    count = nodes.length;
    i = 0;
    while ((i < count)) {
        n = nodes[i];
        n.x = (n.x + n.vx);
        n.y = (n.y + n.vy);
        if ((n.x < 0)) {
            n.x = w;
        }
        if ((n.x > w)) {
            n.x = 0;
        }
        if ((n.y < 0)) {
            n.y = h;
        }
        if ((n.y > h)) {
            n.y = 0;
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.4, 0, 6.2832);
        ctx.fillStyle = "rgba(79,240,196,0.55)";
        ctx.fill();
        i = (i + 1);
    }
    i = 0;
    while ((i < count)) {
        a = nodes[i];
        j = (i + 1);
        while ((j < count)) {
            b = nodes[j];
            dx = (a.x - b.x);
            dy = (a.y - b.y);
            dist = Math.sqrt(((dx * dx) + (dy * dy)));
            if ((dist < 130)) {
                alpha = ((1 - (dist / 130)) * 0.22);
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = (("rgba(124,140,255," + String(alpha)) + ")");
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            j = (j + 1);
        }
        i = (i + 1);
    }
    window.requestAnimationFrame(mesh_frame);
    return 0;
}

function mesh_init() {
    let density, canvas, reduce;
    canvas = document.getElementById("mesh");
    if (!canvas) {
        return 0;
    }
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    window.ernCanvas = canvas;
    window.ernCtx = canvas.getContext("2d");
    mesh_resize();
    density = Math.round(((window.ernW * window.ernH) / 22000));
    if ((density > 80)) {
        density = 80;
    }
    if ((density < 24)) {
        density = 24;
    }
    window.ernNodes = mesh_make_nodes(density, window.ernW, window.ernH);
    window.addEventListener("resize", mesh_resize);
    if (reduce.matches) {
        mesh_frame();
        return 0;
    }
    window.requestAnimationFrame(mesh_frame);
    return 0;
}

function nav_toggle(ev) {
    let links;
    links = document.getElementById("navlinks");
    if (links) {
        links.classList.toggle("open");
    }
    return 0;
}

function drop_toggle(ev) {
    let d;
    ev.stopPropagation();
    d = document.getElementById("nav-writing");
    if (d) {
        d.classList.toggle("open");
    }
    return 0;
}

function drop_close(ev) {
    let d;
    d = document.getElementById("nav-writing");
    if (d) {
        d.classList.remove("open");
    }
    return 0;
}

function nav_init() {
    let burger, dbtn;
    burger = document.getElementById("burger");
    if (burger) {
        burger.addEventListener("click", nav_toggle);
    }
    dbtn = document.getElementById("nav-writing-btn");
    if (dbtn) {
        dbtn.addEventListener("click", drop_toggle);
    }
    document.addEventListener("click", drop_close);
    return 0;
}

function nav_highlight() {
    let act, path, links, dbtn, href;
    path = window.location.pathname;
    links = document.querySelectorAll(".nav__links a");
    for (const a of links) {
        a.classList.remove("active");
        href = a.getAttribute("href");
        if (href) {
            if ((path.indexOf(href) >= 0)) {
                a.classList.add("active");
            }
        }
    }
    dbtn = document.getElementById("nav-writing-btn");
    if (dbtn) {
        dbtn.classList.remove("active");
        act = document.querySelector(".nav__drop-menu a.active");
        if (act) {
            dbtn.classList.add("active");
        }
    }
    return 0;
}

function reveal_cb(entries, observer) {
    let el;
    for (const e of entries) {
        if (e.isIntersecting) {
            el = e.target;
            el.classList.add("in");
            observer.unobserve(el);
        }
    }
    return 0;
}

function reveal_init() {
    let IO, opts, args, els, obs;
    els = document.querySelectorAll(".reveal");
    IO = window.IntersectionObserver;
    if (!IO) {
        for (const el of els) {
            el.classList.add("in");
        }
        return 0;
    }
    opts = new_obj();
    opts.threshold = 0.12;
    args = [reveal_cb, opts];
    obs = Reflect.construct(IO, args);
    for (const el of els) {
        obs.observe(el);
    }
    return 0;
}

function year_init() {
    let d, y;
    y = document.getElementById("year");
    if (y) {
        d = Reflect.construct(window.Date, []);
        y.textContent = d.getFullYear();
    }
    return 0;
}

function narration_text() {
    let nodes, n, cls, parts, doc, txt, dt, i;
    doc = document.getElementById("doc");
    if (doc) {
        dt = doc.textContent;
        if (dt) {
            if ((dt.length > 60)) {
                return dt;
            }
        }
    }
    parts = [];
    nodes = document.querySelectorAll("header h1, header p, section h2, section h3, section p");
    i = 0;
    while ((i < nodes.length)) {
        n = nodes[i];
        cls = n.className;
        if ((cls.indexOf("eyebrow") < 0)) {
            txt = n.textContent;
            if (txt) {
                if ((txt.length > 2)) {
                    parts.push(txt);
                }
            }
        }
        i = (i + 1);
    }
    return parts.join(". ");
}

function np_toggle(ev) {
    let btn, st;
    if (!window.kokoroTTS) {
        return 0;
    }
    st = window.kokoroTTS.toggle(narration_text(), "bm_fable");
    btn = document.getElementById("np-toggle");
    if ((st === "paused")) {
        btn.textContent = "▶";
    } else {
        btn.textContent = "⏸";
    }
    return 0;
}

function np_progress(info) {
    let pct, btn, fill, ph, status;
    fill = document.getElementById("np-fill");
    if (!fill) {
        return 0;
    }
    status = document.getElementById("np-status");
    btn = document.getElementById("np-toggle");
    pct = Math.round((info.fraction * 100));
    ph = info.phase;
    if ((ph === "loading")) {
        btn.classList.add("np-load");
        if ((info.total > 0)) {
            status.textContent = (("loading voice… " + String(pct)) + "%");
            fill.classList.remove("np-indet");
            fill.style.width = (String(pct) + "%");
        } else {
            status.textContent = "loading voice…";
            fill.classList.add("np-indet");
        }
    } else {
        fill.classList.remove("np-indet");
    }
    if ((ph === "buffering")) {
        status.textContent = "buffering…";
        fill.classList.add("np-indet");
        btn.classList.add("np-load");
    }
    if ((ph === "speaking")) {
        status.textContent = ((String(info.current) + " / ") + String(info.total));
        btn.textContent = "⏸";
        btn.classList.remove("np-load");
        fill.style.width = (String(pct) + "%");
    }
    if ((ph === "paused")) {
        status.textContent = "paused";
        btn.textContent = "▶";
        btn.classList.remove("np-load");
    }
    if ((ph === "done")) {
        status.textContent = "done";
        btn.textContent = "▶";
        btn.classList.remove("np-load");
        fill.style.width = "0%";
    }
    if ((ph === "idle")) {
        status.textContent = "Listen";
        btn.textContent = "▶";
        btn.classList.remove("np-load");
        fill.style.width = "0%";
    }
    if ((ph === "fallback")) {
        status.textContent = "browser voice";
    }
    return 0;
}

function player_init() {
    let status, btn;
    btn = document.getElementById("np-toggle");
    if (!btn) {
        return 0;
    }
    if (!window.kokoroTTS) {
        status = document.getElementById("np-status");
        if (status) {
            status.textContent = "voice unavailable";
        }
        return 0;
    }
    btn.addEventListener("click", np_toggle);
    window.kokoroTTS.setOnProgress(np_progress);
    return 0;
}

function site_page_init() {
    nav_highlight();
    reveal_init();
    year_init();
    return 0;
}

function main() {
    mesh_init();
    nav_init();
    player_init();
    site_page_init();
    return 0;
}

main();
