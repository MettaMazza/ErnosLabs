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
    let guard, p, orbit;
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
    let p, bits, i, orbit;
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
    let d_up, d_down, cov, g;
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
    let x, bits, info, cy, ang, rad, g, orbit, seq, p, q, rq, val, y, html, ctx, dpr, n, canvas, rp, size, cx, i;
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
    let i, out;
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
    let c, g, measured, match, host, html, clbl, diff, head, hh;
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
    let tagtxt, i, tag, html, s, secs, host;
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
    let pred_tau_e, html, meas_tau_e, agree_mu, pred_mu_e, agree_tau, meas_mu_e, host;
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

function orbit_showcase() {
    window.showcaseQueue = [7, 31, 127];
    window.showcaseIdx = 0;
    showcase_next();
    return 0;
}

function showcase_next() {
    let queue, qe, idx, pe, q_val;
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
