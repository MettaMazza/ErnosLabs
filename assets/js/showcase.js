// Auto-generated JavaScript from ErnosPlain

function sc_base() {
    let o;
    if (window.localStorage) {
        o = window.localStorage.getItem("ernosArchiveBase");
        if (o) {
            return o;
        }
    }
    return window.location.origin;
}

function sc_status_set(cls, msg) {
    let el;
    el = document.getElementById("pj-status");
    if (el) {
        el.className = cls;
        el.innerHTML = msg;
    }
    return 0;
}

function sc_use_machine() {
    let links, repo;
    links = document.querySelectorAll(".pj-dl");
    for (const a of links) {
        repo = a.getAttribute("data-repo");
        if (repo) {
            a.href = (((sc_base() + "/projects/") + repo) + ".zip");
        }
    }
    return 0;
}

function sc_status_ok(resp) {
    if (resp.ok) {
        sc_use_machine();
        sc_status_set("ai-status is-online", "🟢 <strong>Source machine online</strong> — the download comes straight from it.");
    } else {
        sc_status_fail(resp);
    }
    return 0;
}

function sc_status_fail(err) {
    sc_status_set("ai-status is-offline", "🌙 <strong>The source machine is asleep.</strong> Download falls back to GitHub; the replay below still runs.");
    return 0;
}

function sc_check() {
    fetch((sc_base() + "/ping")).then(sc_status_ok).catch(sc_status_fail);
    return 0;
}

function sc_doc_recv(resp) {
    if (resp.ok) {
        resp.text().then(sc_doc_apply);
    } else {
        sc_doc_fail(resp);
    }
    return 0;
}

function sc_doc_apply(text) {
    let host;
    host = document.getElementById("project-doc");
    if (host) {
        host.innerHTML = md_render(text);
    }
    return 0;
}

function sc_doc_fail(err) {
    let host;
    host = document.getElementById("project-doc");
    if (host) {
        host.innerHTML = "<p class=\"loading\">Couldn't load the README right now — use the GitHub link above.</p>";
    }
    return 0;
}

function sc_controls(total) {
    let out, t;
    t = String(total);
    out = "<div class=\"sc-controls\">";
    out = (out + "<button class=\"sc-btn\" id=\"sc-first\" aria-label=\"Start\">⏮</button>");
    out = (out + "<button class=\"sc-btn\" id=\"sc-prev\" aria-label=\"Back\">◀</button>");
    out = (out + "<button class=\"sc-btn sc-btn--play\" id=\"sc-play\" aria-label=\"Play\">▶</button>");
    out = (out + "<button class=\"sc-btn\" id=\"sc-next\" aria-label=\"Forward\">▶▏</button>");
    out = (out + "<button class=\"sc-btn\" id=\"sc-last\" aria-label=\"End\">⏭</button>");
    out = (out + (("<span class=\"sc-count\" id=\"sc-count\">0 / " + String(t)) + "</span>"));
    out = (out + "</div>");
    return out;
}

function sc_wire(id, cb) {
    let el;
    el = document.getElementById(id);
    if (el) {
        el.addEventListener("click", cb);
    }
    return 0;
}

function sc_wire_controls(render_fn, total) {
    window.scPos = 0;
    window.scTotal = total;
    window.scRender = render_fn;
    window.scPlaying = false;
    render_fn(0);
    sc_wire("sc-first", sc_first);
    sc_wire("sc-prev", sc_prev);
    sc_wire("sc-next", sc_next);
    sc_wire("sc-last", sc_last);
    sc_wire("sc-play", sc_playpause);
    return 0;
}

function sc_goto(n) {
    let p, c;
    p = n;
    if ((p < 0)) {
        p = 0;
    }
    if ((p > window.scTotal)) {
        p = window.scTotal;
    }
    window.scPos = p;
    window.scRender(p);
    c = document.getElementById("sc-count");
    if (c) {
        c.textContent = ((String(p) + " / ") + String(window.scTotal));
    }
    return 0;
}

function sc_stop() {
    let b;
    window.scPlaying = false;
    if (window.scTimer) {
        window.clearInterval(window.scTimer);
        window.scTimer = 0;
    }
    b = document.getElementById("sc-play");
    if (b) {
        b.textContent = "▶";
    }
    return 0;
}

function sc_first(ev) {
    sc_stop();
    sc_goto(0);
    return 0;
}

function sc_prev(ev) {
    let p;
    sc_stop();
    p = (window.scPos - 1);
    sc_goto(p);
    return 0;
}

function sc_next(ev) {
    let p;
    sc_stop();
    p = (window.scPos + 1);
    sc_goto(p);
    return 0;
}

function sc_last(ev) {
    sc_stop();
    sc_goto(window.scTotal);
    return 0;
}

function sc_tick() {
    let p;
    if ((window.scPos >= window.scTotal)) {
        sc_stop();
        return 0;
    }
    p = (window.scPos + 1);
    sc_goto(p);
    return 0;
}

function sc_playpause(ev) {
    let b;
    if (window.scPlaying) {
        sc_stop();
        return 0;
    }
    if ((window.scPos >= window.scTotal)) {
        sc_goto(0);
    }
    window.scPlaying = true;
    b = document.getElementById("sc-play");
    if (b) {
        b.textContent = "⏸";
    }
    window.scTimer = window.setInterval(sc_tick, 650);
    return 0;
}

function go_col(ch) {
    return "ABCDEFGHJKLMNOPQRST".indexOf(ch);
}

function go_render(n) {
    let coord, cell, row, lastidx, side, mv, svg, dims, fill, i, stage, p, d, rownum, dim, moves, stars, a0, a1, size, playable, col, pad, cx, cy, k;
    d = window.scData;
    moves = d.moves;
    size = d.boardsize;
    cell = 30;
    pad = 22;
    dim = ((pad * 2) + (cell * (size - 1)));
    dims = String(dim);
    svg = (((("<svg viewBox=\"0 0 " + String(dims)) + " ") + String(dims)) + "\" class=\"sc-goban\" xmlns=\"http://www.w3.org/2000/svg\">");
    svg = (svg + (((("<rect x=\"0\" y=\"0\" width=\"" + String(dims)) + "\" height=\"") + String(dims)) + "\" rx=\"6\" fill=\"#e8c583\"/>"));
    a0 = String(pad);
    a1 = String((pad + ((size - 1) * cell)));
    i = 0;
    while ((i < size)) {
        p = String((pad + (i * cell)));
        svg = (svg + (((((((("<line x1=\"" + String(p)) + "\" y1=\"") + String(a0)) + "\" x2=\"") + String(p)) + "\" y2=\"") + String(a1)) + "\" stroke=\"#7a5c28\" stroke-width=\"1\"/>"));
        svg = (svg + (((((((("<line x1=\"" + String(a0)) + "\" y1=\"") + String(p)) + "\" x2=\"") + String(a1)) + "\" y2=\"") + String(p)) + "\" stroke=\"#7a5c28\" stroke-width=\"1\"/>"));
        i = (i + 1);
    }
    stars = [3, 9, 15];
    for (const sx of stars) {
        for (const sy of stars) {
            cx = String((pad + (sx * cell)));
            cy = String((pad + (sy * cell)));
            svg = (svg + (((("<circle cx=\"" + String(cx)) + "\" cy=\"") + String(cy)) + "\" r=\"2.6\" fill=\"#7a5c28\"/>"));
        }
    }
    k = 0;
    while ((k < n)) {
        mv = moves[k];
        side = mv[0];
        coord = mv[1];
        playable = true;
        if ((coord === "PASS")) {
            playable = false;
        }
        if ((coord === "RESIGN")) {
            playable = false;
        }
        if (playable) {
            col = go_col(coord.charAt(0));
            rownum = window.parseInt(coord.substring(1), 10);
            row = (size - rownum);
            cx = String((pad + (col * cell)));
            cy = String((pad + (row * cell)));
            fill = "#111";
            if ((side === "W")) {
                fill = "#f5f5f5";
            }
            svg = (svg + (((((("<circle cx=\"" + String(cx)) + "\" cy=\"") + String(cy)) + "\" r=\"13\" fill=\"") + String(fill)) + "\" stroke=\"#0006\" stroke-width=\".5\"/>"));
            lastidx = (n - 1);
            if ((k === lastidx)) {
                svg = (svg + (((("<circle cx=\"" + String(cx)) + "\" cy=\"") + String(cy)) + "\" r=\"4\" fill=\"#f5c45e\"/>"));
            }
        }
        k = (k + 1);
    }
    svg = (svg + "</svg>");
    stage = document.getElementById("sc-board");
    if (stage) {
        stage.innerHTML = svg;
    }
    return 0;
}

function go_init() {
    let total, stage;
    stage = document.getElementById("showcase-stage");
    total = window.scData.moves.length;
    stage.innerHTML = ("<div class=\"sc-caption\">The fold engine (black) vs KataGo (white) — the recorded match, move by move. Zero parameters, zero training, zero playouts.</div><div id=\"sc-board\" class=\"sc-board\"></div>" + sc_controls(total));
    sc_wire_controls(go_render, total);
    return 0;
}

function chess_row(letters, colour) {
    let ch, arr, i;
    arr = [];
    i = 0;
    while ((i < 8)) {
        ch = letters.charAt(i);
        if ((ch === " ")) {
            arr.push("");
        } else {
            arr.push((colour + ch));
        }
        i = (i + 1);
    }
    return arr;
}

function chess_fresh_board() {
    let out;
    out = [];
    out.push(chess_row("RNBQKBNR", "w"));
    out.push(chess_row("PPPPPPPP", "w"));
    out.push(chess_row("        ", ""));
    out.push(chess_row("        ", ""));
    out.push(chess_row("        ", ""));
    out.push(chess_row("        ", ""));
    out.push(chess_row("PPPPPPPP", "b"));
    out.push(chess_row("RNBQKBNR", "b"));
    return out;
}

function chess_glyph(piece) {
    if ((piece === "wK")) {
        return "♔";
    }
    if ((piece === "wQ")) {
        return "♕";
    }
    if ((piece === "wR")) {
        return "♖";
    }
    if ((piece === "wB")) {
        return "♗";
    }
    if ((piece === "wN")) {
        return "♘";
    }
    if ((piece === "wP")) {
        return "♙";
    }
    if ((piece === "bK")) {
        return "♚";
    }
    if ((piece === "bQ")) {
        return "♛";
    }
    if ((piece === "bR")) {
        return "♜";
    }
    if ((piece === "bB")) {
        return "♝";
    }
    if ((piece === "bN")) {
        return "♞";
    }
    if ((piece === "bP")) {
        return "♟";
    }
    return "";
}

function chess_file(ch) {
    return "abcdefgh".indexOf(ch);
}

function chess_board_at(n) {
    let fr, negtwo, diff, caprow, kind, ff, tr, torow, fromrow, board, piece, moves, tf, filediff, uci, target, k, rook;
    board = chess_fresh_board();
    moves = window.scData.moves;
    k = 0;
    while ((k < n)) {
        uci = moves[k];
        ff = chess_file(uci.charAt(0));
        fr = (window.parseInt(uci.charAt(1), 10) - 1);
        tf = chess_file(uci.charAt(2));
        tr = (window.parseInt(uci.charAt(3), 10) - 1);
        fromrow = board[fr];
        torow = board[tr];
        piece = fromrow[ff];
        kind = "";
        if (piece) {
            kind = piece.charAt(1);
        }
        if ((kind === "K")) {
            diff = (tf - ff);
            if ((diff === 2)) {
                rook = torow[7];
                torow.splice(5, 1, rook);
                torow.splice(7, 1, "");
            }
            negtwo = (0 - 2);
            if ((diff === negtwo)) {
                rook = torow[0];
                torow.splice(3, 1, rook);
                torow.splice(0, 1, "");
            }
        }
        if ((kind === "P")) {
            target = torow[tf];
            filediff = (tf - ff);
            if (filediff) {
                if ((target === "")) {
                    caprow = board[fr];
                    caprow.splice(tf, 1, "");
                }
            }
        }
        if ((kind === "P")) {
            if ((tr === 7)) {
                piece = "wQ";
            }
            if ((tr === 0)) {
                piece = "bQ";
            }
        }
        torow.splice(tf, 1, piece);
        fromrow.splice(ff, 1, "");
        k = (k + 1);
    }
    return board;
}

function chess_render(n) {
    let board, f, g, stage, r, html, row, cls, parity;
    board = chess_board_at(n);
    html = "<div class=\"sc-chess\">";
    r = 7;
    while ((r >= 0)) {
        row = board[r];
        f = 0;
        while ((f < 8)) {
            cls = "sc-sq";
            parity = ((r + f) % 2);
            if ((parity === 0)) {
                cls = "sc-sq sc-sq--d";
            }
            g = chess_glyph(row[f]);
            html = (html + (((("<div class=\"" + String(cls)) + "\">") + String(g)) + "</div>"));
            f = (f + 1);
        }
        r = (r - 1);
    }
    html = (html + "</div>");
    stage = document.getElementById("sc-board");
    if (stage) {
        stage.innerHTML = html;
    }
    return 0;
}

function chess_init() {
    let total, res, stage;
    stage = document.getElementById("showcase-stage");
    total = window.scData.moves.length;
    res = window.scData.result;
    stage.innerHTML = ((("<div class=\"sc-caption\">A recorded FoldBot game — every evaluation an exact rational counted from the board's geometry. Result: " + String(res)) + ".</div><div id=\"sc-board\" class=\"sc-board\"></div>") + sc_controls(total));
    sc_wire_controls(chess_render, total);
    return 0;
}

function protein_render(step) {
    let i, sina, maxy, spy, px, n, path, maxx, cosa, py, syn, cmd, ang, sx, span, z, stage, proj, p, sxn, svg, ca, sy, y, scale, minx, pair, x, pr, miny;
    ca = window.scData.ca;
    n = ca.length;
    ang = (step * 0.045);
    cosa = Math.cos(ang);
    sina = Math.sin(ang);
    minx = 100000;
    maxx = (0 - 100000);
    miny = 100000;
    maxy = (0 - 100000);
    proj = [];
    i = 0;
    while ((i < n)) {
        p = ca[i];
        x = p[0];
        y = p[1];
        z = p[2];
        px = ((x * cosa) - (z * sina));
        py = y;
        pair = [];
        pair.push(px);
        pair.push(py);
        proj.push(pair);
        if ((px < minx)) {
            minx = px;
        }
        if ((px > maxx)) {
            maxx = px;
        }
        if ((py < miny)) {
            miny = py;
        }
        if ((py > maxy)) {
            maxy = py;
        }
        i = (i + 1);
    }
    span = (maxx - minx);
    spy = (maxy - miny);
    if ((spy > span)) {
        span = spy;
    }
    scale = (380 / span);
    path = "";
    i = 0;
    while ((i < n)) {
        pr = proj[i];
        sxn = (40 + ((pr[0] - minx) * scale));
        syn = (40 + ((pr[1] - miny) * scale));
        sx = String((Math.round((sxn * 10)) / 10));
        sy = String((Math.round((syn * 10)) / 10));
        cmd = "L";
        if ((i === 0)) {
            cmd = "M";
        }
        path = ((((((path + cmd) + " ") + sx) + " ") + sy) + " ");
        i = (i + 1);
    }
    svg = "<svg viewBox=\"0 0 460 460\" class=\"sc-protein\" xmlns=\"http://www.w3.org/2000/svg\">";
    svg = (svg + "<defs><linearGradient id=\"pg\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0%\" stop-color=\"#4ff0c4\"/><stop offset=\"100%\" stop-color=\"#7c8cff\"/></linearGradient></defs>");
    svg = (svg + (("<path d=\"" + String(path)) + "\" fill=\"none\" stroke=\"url(#pg)\" stroke-width=\"3.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"));
    svg = (svg + "</svg>");
    stage = document.getElementById("sc-board");
    if (stage) {
        stage.innerHTML = svg;
    }
    return 0;
}

function protein_spin() {
    window.scSpin = (window.scSpin + 1);
    protein_render(window.scSpin);
    return 0;
}

function protein_init() {
    let stage, src, n;
    stage = document.getElementById("showcase-stage");
    n = String(window.scData.ca.length);
    src = window.scData.source;
    stage.innerHTML = (((("<div class=\"sc-caption\">Ubiquitin (" + String(n)) + " residues) folded by descent to the fold's fixed point — the real Cα backbone from ") + String(src)) + ", rotating live.</div><div id=\"sc-board\" class=\"sc-board sc-board--protein\"></div>");
    window.scSpin = 0;
    protein_render(0);
    if (window.scSpinTimer) {
        window.clearInterval(window.scSpinTimer);
    }
    window.scSpinTimer = window.setInterval(protein_spin, 60);
    return 0;
}

function boot_esc(s) {
    let t;
    t = s;
    t = t.split("&").join("&amp;");
    t = t.split("<").join("&lt;");
    t = t.split(">").join("&gt;");
    return t;
}

function boot_step() {
    let term, line;
    term = document.getElementById("sc-term");
    if (!term) {
        return 0;
    }
    if ((window.bootIdx >= window.bootLines.length)) {
        return 0;
    }
    line = window.bootLines[window.bootIdx];
    term.innerHTML = ((term.innerHTML + boot_esc(line)) + "\n");
    term.scrollTop = term.scrollHeight;
    window.bootIdx = (window.bootIdx + 1);
    window.setTimeout(boot_step, 330);
    return 0;
}

function boot_init() {
    let stage;
    stage = document.getElementById("showcase-stage");
    stage.innerHTML = "<div class=\"sc-caption\">Ern-OS booting — a self-contained operating system in plain-English Ernos, captured from a real run.</div><pre class=\"sc-term\" id=\"sc-term\"></pre>";
    window.bootLines = window.scData.lines;
    window.bootIdx = 0;
    boot_step();
    return 0;
}

function sc_data_ready(data) {
    let kind;
    window.scData = data;
    kind = window.scKind;
    if ((kind === "go")) {
        go_init();
    }
    if ((kind === "chess")) {
        chess_init();
    }
    if ((kind === "protein")) {
        protein_init();
    }
    if ((kind === "boot")) {
        boot_init();
    }
    return 0;
}

function sc_recv(resp) {
    if (resp.ok) {
        resp.json().then(sc_data_ready);
    } else {
        sc_data_fail(resp);
    }
    return 0;
}

function sc_data_fail(err) {
    let stage;
    stage = document.getElementById("showcase-stage");
    if (stage) {
        stage.innerHTML = "<p class=\"loading\">The replay data isn't available right now.</p>";
    }
    return 0;
}

function main() {
    let page, doc, stage, file, gh, repo, dl;
    page = document.getElementById("project-page");
    if (!page) {
        return 0;
    }
    repo = page.getAttribute("data-repo");
    dl = document.getElementById("project-dl");
    if (dl) {
        dl.setAttribute("data-repo", repo);
        dl.href = (("https://github.com/MettaMazza/" + repo) + "/archive/refs/heads/main.zip");
    }
    gh = document.getElementById("project-gh");
    if (gh) {
        gh.href = ("https://github.com/MettaMazza/" + repo);
    }
    sc_check();
    doc = document.getElementById("project-doc");
    if (doc) {
        fetch((("content/projects/" + repo) + ".md")).then(sc_doc_recv).catch(sc_doc_fail);
    }
    stage = document.getElementById("showcase-stage");
    if (!stage) {
        return 0;
    }
    window.scKind = stage.getAttribute("data-kind");
    file = stage.getAttribute("data-file");
    fetch(("content/interactive/" + file)).then(sc_recv).catch(sc_data_fail);
    return 0;
}

main();
