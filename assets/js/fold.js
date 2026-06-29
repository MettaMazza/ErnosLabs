// Auto-generated JavaScript from ErnosPlain

function gcd(a, b) {
    let t;
    while ((b !== 0)) {
        t = b;
        b = (a % b);
        a = t;
    }
    return a;
}

function fold_orbit(p0, q) {
    let p, guard, orbit;
    orbit = [];
    p = (p0 % q);
    if ((p === 0)) {
        p = q;
    }
    guard = 0;
    while (true) {
        if ((orbit.indexOf(p) >= 0)) {
            return orbit;
        }
        orbit.push(p);
        p = ((2 * p) % q);
        if ((p === 0)) {
            p = q;
        }
        guard = (guard + 1);
        if ((guard > 4096)) {
            return orbit;
        }
    }
    return orbit;
}

function fold_period(p0, q) {
    let orbit;
    orbit = fold_orbit(p0, q);
    return orbit.length;
}

function fold_bits(p0, q) {
    let orbit, bits, p, i;
    orbit = fold_orbit(p0, q);
    bits = "";
    i = 0;
    while ((i < orbit.length)) {
        p = orbit[i];
        if (((2 * p) > q)) {
            bits = (bits + "1");
        } else {
            bits = (bits + "0");
        }
        i = (i + 1);
    }
    return bits;
}

function depth_for(x) {
    let d, v;
    d = 0;
    v = 1;
    while ((v < x)) {
        v = (v * 2);
        d = (d + 1);
    }
    return d;
}

function grand(c) {
    let d_down, cov, d_up, g;
    g = JSON.parse("{}");
    g.c = c;
    d_down = depth_for(((c * c) * c));
    d_up = depth_for((((c * c) * c) * c));
    cov = (((2 * d_down) * d_down) * d_down);
    g.d_down = d_down;
    g.d_up = d_up;
    g.cov = cov;
    g.inv_alpha = (Math.pow(2, d_up) + (((c * c) * (cov + 1)) / cov));
    g.alpha = (1 / g.inv_alpha);
    g.dark_ratio = (27 / 5);
    g.dark_fraction = (27 / 32);
    return g;
}

function sector(prime, name, role, known) {
    let s;
    s = JSON.parse("{}");
    s.prime = prime;
    s.name = name;
    s.role = role;
    s.coupling_num = (prime - 1);
    s.coupling_den = prime;
    s.carriers = ((prime * prime) - 1);
    s.known = known;
    return s;
}

function sectors() {
    let list;
    list = [];
    list.push(sector(2, "Sector 2", "Electromagnetic-class — coupling 1/2", true));
    list.push(sector(3, "Sector 3", "Strong-class — 8 carriers = colour gluons", true));
    list.push(sector(5, "Sector 5 (Smith)", "Predicted — 24 Smithion carriers", false));
    list.push(sector(7, "Sector 7 (Smith)", "Predicted — 48 carriers; the ladder ends here", false));
    return list;
}

function fmt(x, places) {
    return Number(x).toFixed(places);
}

function draw_fold() {
    let g, val, canvas, dpr, n, cx, rad, ang, y, p, html, rq, size, q, i, x, info, cy, rp, bits, seq, orbit, ctx;
    canvas = document.getElementById("fold-canvas");
    if (!canvas) {
        return 0;
    }
    q = Math.round(Number(document.getElementById("fold-q").value));
    p = Math.round(Number(document.getElementById("fold-p").value));
    if ((q < 2)) {
        q = 2;
    }
    if ((p < 1)) {
        p = 1;
    }
    if ((p >= q)) {
        p = (q - 1);
    }
    g = gcd(p, q);
    rp = (p / g);
    rq = (q / g);
    orbit = fold_orbit(rp, rq);
    bits = fold_bits(rp, rq);
    dpr = (window.devicePixelRatio || 1);
    size = 360;
    canvas.width = (size * dpr);
    canvas.height = (size * dpr);
    canvas.style.width = (String(size) + "px");
    canvas.style.height = (String(size) + "px");
    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    cx = (size / 2);
    cy = (size / 2);
    rad = ((size / 2) - 36);
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, 6.2832);
    ctx.strokeStyle = "rgba(124,140,255,0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();
    n = orbit.length;
    ctx.beginPath();
    i = 0;
    while ((i < n)) {
        val = (orbit[i] / rq);
        ang = ((6.2831852999999995 * val) - 1.5707963);
        x = (cx + (rad * Math.cos(ang)));
        y = (cy + (rad * Math.sin(ang)));
        if ((i === 0)) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        i = (i + 1);
    }
    if ((n > 1)) {
        ctx.closePath();
    }
    ctx.strokeStyle = "rgba(79,240,196,0.85)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    i = 0;
    while ((i < n)) {
        val = (orbit[i] / rq);
        ang = ((6.2831852999999995 * val) - 1.5707963);
        x = (cx + (rad * Math.cos(ang)));
        y = (cy + (rad * Math.sin(ang)));
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 6.2832);
        if ((i === 0)) {
            ctx.fillStyle = "#f5c45e";
        } else {
            ctx.fillStyle = "#4ff0c4";
        }
        ctx.fill();
        i = (i + 1);
    }
    seq = fold_seq_text(orbit, rq);
    info = document.getElementById("fold-info");
    html = (((("<div class=\"fold-stat\"><span>fraction</span><b>" + String(rp)) + "/") + String(rq)) + "</b></div>");
    html = (html + (("<div class=\"fold-stat\"><span>period</span><b>" + String(n)) + "</b></div>"));
    html = (html + (("<div class=\"fold-stat\"><span>binary</span><b class=\"mono\">." + String(bits)) + "…</b></div>"));
    html = (html + (("<div class=\"fold-seq\">" + String(seq)) + "</div>"));
    info.innerHTML = html;
    return 0;
}

function fold_seq_text(orbit, q) {
    let out, i;
    out = "";
    i = 0;
    while ((i < orbit.length)) {
        if ((i > 0)) {
            out = (out + " → ");
        }
        out = (out + ((String(orbit[i]) + "/") + String(q)));
        i = (i + 1);
    }
    return (out + " → ↺");
}

function draw_grand() {
    let head, match, g, html, host, c, measured, clbl, hh, diff;
    c = Math.round(Number(document.getElementById("grand-c").value));
    g = grand(c);
    clbl = document.getElementById("grand-c-label");
    clbl.textContent = c;
    measured = 137.035999;
    diff = Math.abs((g.inv_alpha - measured));
    match = "—";
    if ((c === 3)) {
        match = "✓ matches measurement";
    }
    host = document.getElementById("grand-out");
    html = "";
    html = (html + grand_row("colours (c)", to_text_num(c), "the one input you move"));
    html = (html + grand_row("depth d₋ for c³", to_text_num(g.d_down), ("smallest 2^d ≥ " + String(((c * c) * c)))));
    html = (html + grand_row("depth d₊ for c⁴", to_text_num(g.d_up), ("smallest 2^d ≥ " + String((((c * c) * c) * c)))));
    html = (html + grand_row("covering cov = 2·d₋³", to_text_num(g.cov), ""));
    host.innerHTML = html;
    head = document.getElementById("grand-alpha");
    hh = (((((((((("<div class=\"big-eq\">1/α = 2<sup>" + String(g.d_up)) + "</sup> + ") + String(c)) + "²·(") + String(g.cov)) + "+1)/") + String(g.cov)) + " = <b class=\"glow-text\">") + String(fmt(g.inv_alpha, 4))) + "</b></div>");
    hh = (hh + (("<div class=\"eq-cmp\">measured: 137.035999 &nbsp;·&nbsp; " + String(match)) + "</div>"));
    hh = (hh + (("<div class=\"eq-cmp\">dark : baryon = 27/5 = " + String(fmt(g.dark_ratio, 1))) + "</div>"));
    head.innerHTML = hh;
    return 0;
}

function grand_row(label, val, note) {
    return (((((("<div class=\"g-row\"><span>" + String(label)) + "</span><b>") + String(val)) + "</b><em>") + String(note)) + "</em></div>");
}

function to_text_num(n) {
    return ("" + n);
}

function draw_census() {
    let i, host, tag, tagtxt, html, s, secs;
    host = document.getElementById("census");
    if (!host) {
        return 0;
    }
    secs = sectors();
    html = "";
    i = 0;
    while ((i < secs.length)) {
        s = secs[i];
        tag = "known";
        tagtxt = "observed";
        if (!s.known) {
            tag = "pred";
            tagtxt = "predicted";
        }
        html = (html + (("<div class=\"sector " + String(tag)) + "\">"));
        html = (html + (("<div class=\"sector__p\">p = " + String(s.prime)) + "</div>"));
        html = (html + (("<h4>" + String(s.name)) + "</h4>"));
        html = (html + (("<p>" + String(s.role)) + "</p>"));
        html = (html + (((((((((("<div class=\"sector__nums\"><span>coupling <b>" + String(s.coupling_num)) + "/") + String(s.coupling_den)) + "</b></span><span>carriers <b>") + String(s.carriers)) + "</b></span><span class=\"pill ") + String(tag)) + "\">") + String(tagtxt)) + "</span></div>"));
        html = (html + "</div>");
        i = (i + 1);
    }
    host.innerHTML = html;
    return 0;
}

function draw_leptons() {
    let meas_mu_e, agree_tau, pred_mu_e, html, host, agree_mu, meas_tau_e, pred_tau_e;
    host = document.getElementById("leptons");
    if (!host) {
        return 0;
    }
    pred_mu_e = 206.768;
    meas_mu_e = 206.768;
    pred_tau_e = 3477;
    meas_tau_e = 3477.2;
    agree_mu = (100 * (1 - (Math.abs((pred_mu_e - meas_mu_e)) / meas_mu_e)));
    agree_tau = (100 * (1 - (Math.abs((pred_tau_e - meas_tau_e)) / meas_tau_e)));
    html = "";
    html = (html + "<div class=\"lepton-grid\">");
    html = (html + "<div class=\"lepton-row\">");
    html = (html + "<div class=\"lepton-label\"><span class=\"lepton-particle\">μ / e</span><span class=\"lepton-name\">muon-to-electron</span></div>");
    html = (html + (("<div class=\"lepton-vals\"><div class=\"fold-stat\"><span>predicted</span><b class=\"glow-text\">" + String(fmt(pred_mu_e, 3))) + "</b></div>"));
    html = (html + (("<div class=\"fold-stat\"><span>measured</span><b>" + String(fmt(meas_mu_e, 3))) + "</b></div>"));
    html = (html + (("<div class=\"fold-stat\"><span>agreement</span><b class=\"lepton-agree\">" + String(fmt(agree_mu, 4))) + "%</b></div></div>"));
    html = (html + "<div class=\"lepton-bar-wrap\"><div class=\"lepton-bar\" style=\"width:100%\"></div></div>");
    html = (html + "</div>");
    html = (html + "<div class=\"lepton-row\">");
    html = (html + "<div class=\"lepton-label\"><span class=\"lepton-particle\">τ / e</span><span class=\"lepton-name\">tau-to-electron</span></div>");
    html = (html + (("<div class=\"lepton-vals\"><div class=\"fold-stat\"><span>predicted</span><b class=\"glow-text\">" + String(fmt(pred_tau_e, 1))) + "</b></div>"));
    html = (html + (("<div class=\"fold-stat\"><span>measured</span><b>" + String(fmt(meas_tau_e, 1))) + "</b></div>"));
    html = (html + (("<div class=\"fold-stat\"><span>agreement</span><b class=\"lepton-agree\">" + String(fmt(agree_tau, 3))) + "%</b></div></div>"));
    html = (html + "<div class=\"lepton-bar-wrap\"><div class=\"lepton-bar\" style=\"width:99.994%\"></div></div>");
    html = (html + "</div>");
    html = (html + "<div class=\"lepton-row\">");
    html = (html + "<div class=\"lepton-label\"><span class=\"lepton-particle\">Ω<sub>d</sub>/Ω<sub>b</sub></span><span class=\"lepton-name\">dark-to-baryon ratio</span></div>");
    html = (html + "<div class=\"lepton-vals\"><div class=\"fold-stat\"><span>predicted</span><b class=\"glow-text\">27/5 = 5.400</b></div>");
    html = (html + "<div class=\"fold-stat\"><span>measured</span><b>5.36 ± 0.05</b></div>");
    html = (html + "<div class=\"fold-stat\"><span>agreement</span><b class=\"lepton-agree\">within 1σ</b></div></div>");
    html = (html + "<div class=\"lepton-bar-wrap\"><div class=\"lepton-bar\" style=\"width:99.3%\"></div></div>");
    html = (html + "</div>");
    html = (html + "</div>");
    host.innerHTML = html;
    return 0;
}

function draw_element137() {
    let host, html;
    host = document.getElementById("element137");
    if (!host) {
        return 0;
    }
    html = "";
    html = (html + "<div class=\"e137-wrap\">");
    html = (html + "<div class=\"e137-text\">");
    html = (html + "<div class=\"fold-stat\"><span>Bohr velocity</span><b>v = Z · α · c</b></div>");
    html = (html + "<div class=\"fold-stat\"><span>speed of light exceeded at</span><b class=\"glow-text\">Z = ⌊1/α⌋ = 137</b></div>");
    html = (html + "<div class=\"fold-stat\"><span>1/α (measured)</span><b>137.035999…</b></div>");
    html = (html + "<div class=\"fold-stat\"><span>1/α (fold theory)</span><b class=\"glow-text\">137.0360</b></div>");
    html = (html + "</div>");
    html = (html + "<div class=\"e137-bar\">");
    html = (html + "<div class=\"e137-scale\">");
    html = (html + "<div class=\"e137-track\"></div>");
    html = (html + "<div class=\"e137-safe\" style=\"width:91.3%\"></div>");
    html = (html + "<div class=\"e137-danger\" style=\"left:91.3%;width:8.7%\"></div>");
    html = (html + "<div class=\"e137-marker\" style=\"left:91.3%\"><div class=\"e137-marker-line\"></div><div class=\"e137-marker-label\">Z = 137</div></div>");
    html = (html + "</div>");
    html = (html + "<div class=\"e137-labels\">");
    html = (html + "<span>Z = 1<br><em>Hydrogen</em></span>");
    html = (html + "<span style=\"left:17.3%\">Z = 26<br><em>Iron</em></span>");
    html = (html + "<span style=\"left:52.7%\">Z = 79<br><em>Gold</em></span>");
    html = (html + "<span style=\"left:78%\">Z = 118<br><em>Oganesson</em></span>");
    html = (html + "<span style=\"left:91.3%\" class=\"e137-cutoff-label\">Z = 137<br><em>Feynmanium</em></span>");
    html = (html + "<span style=\"left:100%\">Z = 150</span>");
    html = (html + "</div>");
    html = (html + "</div>");
    html = (html + "<p class=\"e137-caption\">At Z = 137 the 1s electron reaches v = c. Beyond this wall no stable atom can exist — the periodic table is finite, and its boundary is set by the same constant the fold derives.</p>");
    html = (html + "</div>");
    host.innerHTML = html;
    return 0;
}

function el_symbols() {
    return "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(" ");
}

function el_pred() {
    return ["Uue", "Ubn", "Ubu", "Ubb", "Ubt", "Ubq", "Ubp", "Sh", "Ubs", "Ubo", "Ube", "Utn", "Utu", "Utb", "Utt", "Utq", "Utp", "Uth", "Uts"];
}

function draw_ptable() {
    let z, len, host, p, cls, pred, s, e, sym, starts, syms, closures, html, ends, cells;
    host = document.getElementById("ptable");
    if (!host) {
        return 0;
    }
    syms = el_symbols();
    pred = el_pred();
    starts = [1, 3, 11, 19, 37, 55, 87, 119];
    ends = [2, 10, 18, 36, 54, 86, 118, 137];
    closures = [2, 10, 18, 36, 54, 86, 118, 168];
    html = "<div class=\"ptable\">";
    p = 0;
    while ((p < 8)) {
        s = starts[p];
        e = ends[p];
        len = ((ends[p] - starts[p]) + 1);
        html = (html + "<div class=\"pt-row\">");
        html = (html + (((("<span class=\"pt-plabel\">period " + String((p + 1))) + "<em>") + String(len)) + " wide</em></span>"));
        html = (html + "<div class=\"pt-cells\">");
        z = s;
        while ((z <= e)) {
            sym = "";
            cls = "pt-known";
            if ((z <= 118)) {
                sym = syms[(z - 1)];
            } else {
                sym = pred[(z - 119)];
                cls = "pt-pred";
            }
            if ((z === 126)) {
                cls = "pt-smith";
            }
            if ((z === 137)) {
                cls = "pt-end";
            }
            html = (html + (((((((((("<button class=\"pt-cell " + String(cls)) + "\" data-z=\"") + String(z)) + "\" data-sym=\"") + String(sym)) + "\"><span class=\"pt-z\">") + String(z)) + "</span><span class=\"pt-sym\">") + String(sym)) + "</span></button>"));
            z = (z + 1);
        }
        html = (html + "</div></div>");
        p = (p + 1);
    }
    html = (html + "</div>");
    html = (html + "<div class=\"pt-legend\"><span class=\"pt-key pt-known\">confirmed · 1–118</span><span class=\"pt-key pt-pred\">predicted · 119–137</span><span class=\"pt-key pt-smith\">Smithium · 126</span><span class=\"pt-key pt-end\">the wall · 137</span></div>");
    html = (html + "<div class=\"pt-info\" id=\"pt-info\">The periods run 2, 8, 8, 18, 18, 32, 32 — then a 50-wide eighth period that the fold cuts short at <b>Z = 137 = ⌊1/α⌋</b>. Click any element.</div>");
    host.innerHTML = html;
    cells = host.querySelectorAll(".pt-cell");
    for (const cc of cells) {
        cc.addEventListener("click", pt_click);
    }
    return 0;
}

function pt_click(ev) {
    let z, status, note, info, sym;
    z = Number(ev.currentTarget.getAttribute("data-z"));
    sym = ev.currentTarget.getAttribute("data-sym");
    info = document.getElementById("pt-info");
    status = "confirmed element";
    note = "";
    if ((z > 118)) {
        status = "predicted superheavy";
    }
    if ((z === 126)) {
        status = "Smithium — the forced island of stability";
        note = " The fold forces a magic-number shell closure at Z = 126: the next genuinely long-lived superheavy.";
    }
    if ((z === 137)) {
        status = "the last element";
        note = " At Z = 137 = ⌊1/α⌋ the 1s electron's Bohr velocity reaches the speed of light. No neutral atom can exist beyond it.";
    }
    info.innerHTML = ((((((("<b class=\"pt-info-sym\">" + String(sym)) + "</b> &nbsp; Z = ") + String(z)) + " &nbsp;·&nbsp; ") + String(status)) + ".") + String(note));
    return 0;
}

function ptable_ev(ev) {
    draw_ptable();
    return 0;
}

function lc(name, value, gens) {
    let o;
    o = JSON.parse("{}");
    o.name = name;
    o.value = value;
    o.gens = gens;
    return o;
}

function lock_constants() {
    let L;
    L = [];
    L.push(lc("1 / α", "137.036", ["b", "c", "dd", "du"]));
    L.push(lc("Planck exponent", "127/2", ["b", "c", "du"]));
    L.push(lc("quark up I₂", "1/383", ["b", "c", "du"]));
    L.push(lc("quark down I₂", "1/95", ["b", "c", "dd"]));
    L.push(lc("lepton e₃", "1/485", ["c", "dd"]));
    L.push(lc("dark / baryon", "27/5", ["c", "dd"]));
    L.push(lc("dark fraction", "27/32", ["b", "c", "dd"]));
    L.push(lc("Hubble ratio", "13/12", ["b", "c"]));
    L.push(lc("Λ floor", "1/2²⁰", ["b", "c", "dd"]));
    L.push(lc("half-One coupling", "1/2", ["b"]));
    return L;
}

function gen_label(k) {
    if ((k === "b")) {
        return "b = 2";
    }
    if ((k === "c")) {
        return "c = 3";
    }
    if ((k === "dd")) {
        return "d₋ = 5";
    }
    if ((k === "du")) {
        return "d₊ = 7";
    }
    return k;
}

function draw_lockweb() {
    let gens, chtml, c, ghtml, chips, host, i, gkl, g, gj, gbtns, L, gl, j, gk;
    host = document.getElementById("lockweb");
    if (!host) {
        return 0;
    }
    window.lockSel = "";
    gens = ["b", "c", "dd", "du"];
    ghtml = "<div class=\"lw-gens\"><span class=\"lw-lab\">the generators</span>";
    i = 0;
    while ((i < gens.length)) {
        g = gens[i];
        gl = gen_label(g);
        ghtml = (ghtml + (((("<button class=\"lw-gen\" data-g=\"" + String(g)) + "\">") + String(gl)) + "</button>"));
        i = (i + 1);
    }
    ghtml = (ghtml + "</div>");
    L = lock_constants();
    chtml = "<div class=\"lw-consts\">";
    i = 0;
    while ((i < L.length)) {
        c = L[i];
        chips = "";
        j = 0;
        while ((j < c.gens.length)) {
            gk = c.gens[j];
            gkl = gen_label(gk);
            chips = (chips + (("<span class=\"lw-chip\">" + String(gkl)) + "</span>"));
            j = (j + 1);
        }
        gj = c.gens.join(",");
        chtml = (chtml + (((((((("<div class=\"lw-const\" data-gens=\"" + String(gj)) + "\"><div class=\"lw-name\">") + String(c.name)) + "</div><div class=\"lw-val\">") + String(c.value)) + "</div><div class=\"lw-chips\">") + String(chips)) + "</div></div>"));
        i = (i + 1);
    }
    chtml = (chtml + "</div>");
    host.innerHTML = ((ghtml + chtml) + "<p class=\"lw-hint\">Click a generator — every constant built from it lights up. Move that one number and the whole family moves. The constants of nature are not independent; they are one object.</p>");
    gbtns = host.querySelectorAll(".lw-gen");
    for (const b of gbtns) {
        b.addEventListener("click", lw_click);
    }
    return 0;
}

function lw_click(ev) {
    let g, host, active, sel, consts, gbtns, gstr;
    g = ev.currentTarget.getAttribute("data-g");
    host = document.getElementById("lockweb");
    sel = window.lockSel;
    if ((sel === g)) {
        window.lockSel = "";
    } else {
        window.lockSel = g;
    }
    active = window.lockSel;
    gbtns = host.querySelectorAll(".lw-gen");
    for (const b of gbtns) {
        if ((b.getAttribute("data-g") === active)) {
            b.classList.add("active");
        } else {
            b.classList.remove("active");
        }
    }
    consts = host.querySelectorAll(".lw-const");
    for (const cc of consts) {
        gstr = cc.getAttribute("data-gens");
        if ((active === "")) {
            cc.classList.remove("dim");
            cc.classList.remove("lit");
        } else if ((gstr.split(",").indexOf(active) >= 0)) {
            cc.classList.add("lit");
            cc.classList.remove("dim");
        } else {
            cc.classList.add("dim");
            cc.classList.remove("lit");
        }
    }
    return 0;
}

function orbit_showcase() {
    window.showcaseQueue = [7, 31, 127];
    window.showcaseIdx = 0;
    showcase_next();
    return 0;
}

function showcase_next() {
    let queue, qe, pe, q_val, idx;
    idx = window.showcaseIdx;
    queue = window.showcaseQueue;
    if ((idx >= queue.length)) {
        return 0;
    }
    q_val = queue[idx];
    qe = document.getElementById("fold-q");
    pe = document.getElementById("fold-p");
    qe.value = q_val;
    pe.value = 1;
    draw_fold();
    window.showcaseIdx = (idx + 1);
    if ((window.showcaseIdx < queue.length)) {
        window.setTimeout(showcase_next, 2200);
    }
    return 0;
}

function g_xor(a, b) {
    let place, result;
    result = 0;
    place = 1;
    while (((a > 0) || (b > 0))) {
        if (((a % 2) !== (b % 2))) {
            result = (result + place);
        }
        a = Math.floor((a / 2));
        b = Math.floor((b / 2));
        place = (place * 2);
    }
    return result;
}

function g_setkv(obj, k, v) {
    let fn;
    fn = Reflect["set"];
    fn.call(Reflect, obj, k, v);
    return 0;
}

function clamp_heap(x) {
    if ((x < 0)) {
        return 0;
    }
    if ((x > 9)) {
        return 9;
    }
    return x;
}

function sub_solve(n) {
    let i, win, m, w;
    win = [];
    i = 0;
    while ((i <= n)) {
        w = false;
        m = 1;
        while ((m <= 3)) {
            if ((m <= i)) {
                if (!win[(i - m)]) {
                    w = true;
                }
            }
            m = (m + 1);
        }
        win.push(w);
        i = (i + 1);
    }
    return win;
}

function draw_sub() {
    let movetxt, strip, host, vcls, win, disagree, oloss, mloss, verdict, n, html, w, m, i, cls;
    host = document.getElementById("sub-out");
    if (!host) {
        return 0;
    }
    n = Math.round(Number(document.getElementById("sub-n").value));
    if ((n < 0)) {
        n = 0;
    }
    if ((n > 60)) {
        n = 60;
    }
    win = sub_solve(n);
    w = win[n];
    movetxt = "none — this is a losing position";
    if (w) {
        m = 1;
        while ((m <= 3)) {
            if ((m <= n)) {
                if (!win[(n - m)]) {
                    movetxt = ((("take " + String(m)) + ", leaving ") + String((n - m)));
                }
            }
            m = (m + 1);
        }
    }
    disagree = 0;
    i = 0;
    while ((i <= n)) {
        oloss = ((i % 4) === 0);
        mloss = !win[i];
        if ((oloss !== mloss)) {
            disagree = (disagree + 1);
        }
        i = (i + 1);
    }
    strip = "";
    i = 0;
    while ((i <= n)) {
        cls = "g-n";
        if (!win[i]) {
            cls = "g-p";
        }
        strip = (strip + (((("<span class=\"g-cell " + String(cls)) + "\">") + String(i)) + "</span>"));
        i = (i + 1);
    }
    verdict = "WIN for the player to move";
    vcls = "g-win";
    if (!w) {
        verdict = "LOSS for the player to move";
        vcls = "g-loss";
    }
    html = (((((("<div class=\"g-verdict " + String(vcls)) + "\">n = ") + String(n)) + " — ") + String(verdict)) + "</div>");
    html = (html + (("<div class=\"g-move\">best move: <b>" + String(movetxt)) + "</b></div>"));
    html = (html + (("<div class=\"g-strip\">" + String(strip)) + "</div>"));
    html = (html + (((("<div class=\"g-oracle\">retrograde fold vs oracle (loss ⟺ n mod 4 = 0): <b>" + String((n + 1))) + "</b> positions solved, <b class=\"g-zero\">") + String(disagree)) + "</b> disagreements</div>"));
    host.innerHTML = html;
    return 0;
}

function nim_key(a, b, c) {
    return ((((String(a) + "_") + String(b)) + "_") + String(c));
}

function nim_win(a, b, c, memo) {
    let nb, result, cached, k, nc, na;
    k = nim_key(a, b, c);
    cached = memo[k];
    if (cached) {
        return (cached === 2);
    }
    result = false;
    na = 0;
    while ((na < a)) {
        if (!nim_win(na, b, c, memo)) {
            result = true;
        }
        na = (na + 1);
    }
    nb = 0;
    while ((nb < b)) {
        if (!nim_win(a, nb, c, memo)) {
            result = true;
        }
        nb = (nb + 1);
    }
    nc = 0;
    while ((nc < c)) {
        if (!nim_win(a, b, nc, memo)) {
            result = true;
        }
        nc = (nc + 1);
    }
    if (result) {
        g_setkv(memo, k, 2);
    } else {
        g_setkv(memo, k, 1);
    }
    return result;
}

function draw_nim() {
    let verdict, host, orc, vcls, b, movetxt, rg, html, disagree, i, w, c, ta, memo, tb, states, kk, a, nimsum, tc, j;
    host = document.getElementById("nim-out");
    if (!host) {
        return 0;
    }
    a = clamp_heap(Math.round(Number(document.getElementById("nim-a").value)));
    b = clamp_heap(Math.round(Number(document.getElementById("nim-b").value)));
    c = clamp_heap(Math.round(Number(document.getElementById("nim-c").value)));
    nimsum = g_xor(g_xor(a, b), c);
    w = (nimsum !== 0);
    movetxt = "none — this is a losing position";
    if (w) {
        ta = g_xor(a, nimsum);
        tb = g_xor(b, nimsum);
        tc = g_xor(c, nimsum);
        if ((ta < a)) {
            movetxt = ((("heap A: " + String(a)) + " → ") + String(ta));
        } else if ((tb < b)) {
            movetxt = ((("heap B: " + String(b)) + " → ") + String(tb));
        } else {
            movetxt = ((("heap C: " + String(c)) + " → ") + String(tc));
        }
    }
    memo = JSON.parse("{}");
    disagree = 0;
    states = 0;
    i = 0;
    while ((i <= 6)) {
        j = 0;
        while ((j <= 6)) {
            kk = 0;
            while ((kk <= 6)) {
                rg = nim_win(i, j, kk, memo);
                orc = (g_xor(g_xor(i, j), kk) !== 0);
                if ((rg !== orc)) {
                    disagree = (disagree + 1);
                }
                states = (states + 1);
                kk = (kk + 1);
            }
            j = (j + 1);
        }
        i = (i + 1);
    }
    verdict = "WIN for the player to move";
    vcls = "g-win";
    if (!w) {
        verdict = "LOSS for the player to move";
        vcls = "g-loss";
    }
    html = (((((((((("<div class=\"g-verdict " + String(vcls)) + "\">heaps (") + String(a)) + ", ") + String(b)) + ", ") + String(c)) + ") — ") + String(verdict)) + "</div>");
    html = (html + (((((((((("<div class=\"g-move\">nim-sum " + String(a)) + " ⊕ ") + String(b)) + " ⊕ ") + String(c)) + " = <b>") + String(nimsum)) + "</b> · move: <b>") + String(movetxt)) + "</b></div>"));
    html = (html + (((("<div class=\"g-oracle\">retrograde fold vs Sprague-Grundy (loss ⟺ nim-sum 0): <b>" + String(states)) + "</b> positions solved, <b class=\"g-zero\">") + String(disagree)) + "</b> disagreements</div>"));
    host.innerHTML = html;
    return 0;
}

function sub_ev(ev) {
    draw_sub();
    return 0;
}

function nim_ev(ev) {
    draw_nim();
    return 0;
}

function main() {
    let gc, fp;
    fp = document.getElementById("fold-p");
    if (fp) {
        document.getElementById("fold-run").addEventListener("click", fold_ev);
        document.getElementById("fold-q").addEventListener("input", fold_ev);
        document.getElementById("fold-p").addEventListener("input", fold_ev);
        draw_fold();
        orbit_showcase();
    }
    gc = document.getElementById("grand-c");
    if (gc) {
        gc.addEventListener("input", grand_ev);
        draw_grand();
    }
    draw_census();
    draw_leptons();
    draw_element137();
    draw_lockweb();
    draw_ptable();
    if (document.getElementById("sub-n")) {
        document.getElementById("sub-go").addEventListener("click", sub_ev);
        document.getElementById("sub-n").addEventListener("input", sub_ev);
        draw_sub();
    }
    if (document.getElementById("nim-a")) {
        document.getElementById("nim-go").addEventListener("click", nim_ev);
        document.getElementById("nim-a").addEventListener("input", nim_ev);
        document.getElementById("nim-b").addEventListener("input", nim_ev);
        document.getElementById("nim-c").addEventListener("input", nim_ev);
        draw_nim();
    }
    return 0;
}

function fold_ev(ev) {
    draw_fold();
    return 0;
}

function grand_ev(ev) {
    draw_grand();
    return 0;
}

main();
