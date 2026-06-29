// Auto-generated JavaScript from ErnosPlain

function new_obj() {
    return JSON.parse("{}");
}

function rand_between(lo, hi) {
    return (lo + (Math.random() * (hi - lo)));
}

function mesh_make_nodes(count, w, h) {
    let n, nodes, i;
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
    let canvas, dpr, h, w, ctx;
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
    let count, j, dy, i, w, b, ctx, nodes, h, a, dx, dist, alpha, n;
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
    let reduce, density, canvas;
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

function nav_init() {
    let href, path, links, burger;
    burger = document.getElementById("burger");
    if (burger) {
        burger.addEventListener("click", nav_toggle);
    }
    path = window.location.pathname;
    links = document.querySelectorAll(".nav__links a");
    for (const a of links) {
        href = a.getAttribute("href");
        if (href) {
            if ((path.indexOf(href) >= 0)) {
                a.classList.add("active");
            }
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
    let opts, args, els, IO, obs;
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

function main() {
    mesh_init();
    nav_init();
    reveal_init();
    year_init();
    return 0;
}

main();
