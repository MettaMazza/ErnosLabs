// Auto-generated JavaScript from ErnosPlain

function sc_base() {
    let o;
    if (window.localStorage) {
        o = window.localStorage.getItem("ernosArchiveBase");
        if (o) {
            return o;
        }
    }
    if (window.ERNOS_API) {
        return window.ERNOS_API;
    }
    return "";
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
    let repo, links;
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

function sc_check_cb(basev) {
    sc_check();
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
    let t, out;
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
    let c, p;
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

function go_dead_group(board, start, size) {
    let libs, stack, cur, i, neigh, row, total, seen, group, col, v, colour;
    colour = board[start];
    total = (size * size);
    seen = [];
    i = 0;
    while ((i < total)) {
        seen.push(false);
        i = (i + 1);
    }
    stack = [];
    stack.push(start);
    seen.splice(start, 1, true);
    group = [];
    libs = 0;
    while ((stack.length > 0)) {
        cur = stack.pop();
        group.push(cur);
        col = (cur % size);
        row = Math.floor((cur / size));
        neigh = [];
        if ((col > 0)) {
            neigh.push((cur - 1));
        }
        if ((col < (size - 1))) {
            neigh.push((cur + 1));
        }
        if ((row > 0)) {
            neigh.push((cur - size));
        }
        if ((row < (size - 1))) {
            neigh.push((cur + size));
        }
        for (const nb of neigh) {
            v = board[nb];
            if ((v === 0)) {
                libs = (libs + 1);
            } else if ((v === colour)) {
                if (!seen[nb]) {
                    seen.splice(nb, 1, true);
                    stack.push(nb);
                }
            }
        }
    }
    if ((libs === 0)) {
        return group;
    }
    return [];
}

function go_position_at(n) {
    let i, enemy, d, board, dead, col, k, side, idx, colour, row, moves, playable, rownum, neigh, mv, coord, size;
    d = window.scData;
    size = d.boardsize;
    moves = d.moves;
    board = [];
    i = 0;
    while ((i < (size * size))) {
        board.push(0);
        i = (i + 1);
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
            idx = ((row * size) + col);
            colour = 1;
            if ((side === "W")) {
                colour = 2;
            }
            board.splice(idx, 1, colour);
            enemy = (3 - colour);
            neigh = [];
            if ((col > 0)) {
                neigh.push((idx - 1));
            }
            if ((col < (size - 1))) {
                neigh.push((idx + 1));
            }
            if ((row > 0)) {
                neigh.push((idx - size));
            }
            if ((row < (size - 1))) {
                neigh.push((idx + size));
            }
            for (const nb of neigh) {
                if ((board[nb] === enemy)) {
                    dead = go_dead_group(board, nb, size);
                    for (const di of dead) {
                        board.splice(di, 1, 0);
                    }
                }
            }
        }
        k = (k + 1);
    }
    return board;
}

function go_render(n) {
    let size, dim, cell, pad, col, i, a0, d, letter, v, svg, dims, lastn, stars, moves, marky, cy, edge, total, coord, stage, p, cx, mv, idx, numlbl, rownum, a1, board, row;
    d = window.scData;
    size = d.boardsize;
    board = go_position_at(n);
    cell = 30;
    pad = 34;
    dim = ((pad * 2) + (cell * (size - 1)));
    dims = String(dim);
    svg = (((("<svg viewBox=\"0 0 " + String(dims)) + " ") + String(dims)) + "\" class=\"sc-goban\" xmlns=\"http://www.w3.org/2000/svg\">");
    svg = (svg + (((("<rect x=\"0\" y=\"0\" width=\"" + String(dims)) + "\" height=\"") + String(dims)) + "\" rx=\"8\" fill=\"#dcb877\"/>"));
    a0 = String(pad);
    a1 = String((pad + ((size - 1) * cell)));
    i = 0;
    while ((i < size)) {
        p = String((pad + (i * cell)));
        svg = (svg + (((((((("<line x1=\"" + String(p)) + "\" y1=\"") + String(a0)) + "\" x2=\"") + String(p)) + "\" y2=\"") + String(a1)) + "\" stroke=\"#8a6a33\" stroke-width=\"1\"/>"));
        svg = (svg + (((((((("<line x1=\"" + String(a0)) + "\" y1=\"") + String(p)) + "\" x2=\"") + String(a1)) + "\" y2=\"") + String(p)) + "\" stroke=\"#8a6a33\" stroke-width=\"1\"/>"));
        letter = "ABCDEFGHJKLMNOPQRST".charAt(i);
        numlbl = String((size - i));
        edge = String((dim - 12));
        svg = (svg + (((((("<text x=\"" + String(p)) + "\" y=\"") + String(edge)) + "\" font-size=\"10\" fill=\"#8a6a33\" text-anchor=\"middle\" font-family=\"Inter,sans-serif\">") + String(letter)) + "</text>"));
        svg = (svg + (((("<text x=\"12\" y=\"" + String(p)) + "\" font-size=\"10\" fill=\"#8a6a33\" text-anchor=\"middle\" dominant-baseline=\"central\" font-family=\"Inter,sans-serif\">") + String(numlbl)) + "</text>"));
        i = (i + 1);
    }
    stars = [3, 9, 15];
    for (const sx of stars) {
        for (const sy of stars) {
            cx = String((pad + (sx * cell)));
            cy = String((pad + (sy * cell)));
            svg = (svg + (((("<circle cx=\"" + String(cx)) + "\" cy=\"") + String(cy)) + "\" r=\"2.6\" fill=\"#8a6a33\"/>"));
        }
    }
    idx = 0;
    total = (size * size);
    while ((idx < total)) {
        v = board[idx];
        if ((v > 0)) {
            col = (idx % size);
            row = Math.floor((idx / size));
            cx = String((pad + (col * cell)));
            cy = String((pad + (row * cell)));
            if ((v === 1)) {
                svg = (svg + (((("<circle cx=\"" + String(cx)) + "\" cy=\"") + String(cy)) + "\" r=\"13.2\" fill=\"#1a1c22\" stroke=\"#000\" stroke-width=\".6\"/>"));
                svg = (svg + (((("<circle cx=\"" + String(cx)) + "\" cy=\"") + String(cy)) + "\" r=\"13.2\" fill=\"none\" stroke=\"#3a3f4c\" stroke-width=\".8\" opacity=\".6\"/>"));
            } else {
                svg = (svg + (((("<circle cx=\"" + String(cx)) + "\" cy=\"") + String(cy)) + "\" r=\"13.2\" fill=\"#f4f2ec\" stroke=\"#b9b3a4\" stroke-width=\".8\"/>"));
            }
        }
        idx = (idx + 1);
    }
    if ((n > 0)) {
        moves = d.moves;
        lastn = (n - 1);
        mv = moves[lastn];
        coord = mv[1];
        marky = true;
        if ((coord === "PASS")) {
            marky = false;
        }
        if ((coord === "RESIGN")) {
            marky = false;
        }
        if (marky) {
            col = go_col(coord.charAt(0));
            rownum = window.parseInt(coord.substring(1), 10);
            row = (size - rownum);
            cx = String((pad + (col * cell)));
            cy = String((pad + (row * cell)));
            svg = (svg + (((("<circle cx=\"" + String(cx)) + "\" cy=\"") + String(cy)) + "\" r=\"4.4\" fill=\"none\" stroke=\"#f5c45e\" stroke-width=\"2.2\"/>"));
        }
    }
    svg = (svg + "</svg>");
    stage = document.getElementById("sc-board");
    if (stage) {
        stage.innerHTML = svg;
    }
    return 0;
}

function go_init() {
    let stage, total, nmoves;
    stage = document.getElementById("showcase-stage");
    total = window.scData.moves.length;
    nmoves = String(total);
    stage.innerHTML = ((("<div class=\"sc-caption\">The fold engine (black) vs <strong>KataGo</strong> — the recorded match log, all " + String(nmoves)) + " moves, captures and all. Zero parameters, zero training, zero playouts.</div><div id=\"sc-board\" class=\"sc-board\"></div>") + sc_controls(total));
    sc_wire_controls(go_render, total);
    return 0;
}

function chess_row(letters, colour) {
    let arr, i, ch;
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

function chess_glyph(kind) {
    if ((kind === "K")) {
        return "♚";
    }
    if ((kind === "Q")) {
        return "♛";
    }
    if ((kind === "R")) {
        return "♜";
    }
    if ((kind === "B")) {
        return "♝";
    }
    if ((kind === "N")) {
        return "♞";
    }
    return "♟";
}

function chess_file(ch) {
    return "abcdefgh".indexOf(ch);
}

function chess_board_at(n) {
    let rook, caprow, board, side, k, negtwo, moves, target, promo, tr, fr, fromrow, tf, ff, torow, diff, uci, kind, piece, filediff;
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
            promo = "";
            if ((uci.length > 4)) {
                promo = uci.charAt(4).toUpperCase();
            }
            if ((tr === 7)) {
                side = "w";
                if ((promo === "")) {
                    promo = "Q";
                }
                piece = (side + promo);
            }
            if ((tr === 0)) {
                side = "b";
                if ((promo === "")) {
                    promo = "Q";
                }
                piece = (side + promo);
            }
        }
        torow.splice(tf, 1, piece);
        fromrow.splice(ff, 1, "");
        k = (k + 1);
    }
    return board;
}

function chess_render(n) {
    let yrow, f, r, strokec, fillc, px, kind, hfr, htr, rlabel, dim, uci, board, py, row, pyrow, fx, hlfrom, x, svg, hff, cells, hlto, lastn, dims, pad, sqidx, ishl, ry, piece, g, cell, stage, y, htf, flabel, i, fy, parity;
    board = chess_board_at(n);
    cell = 56;
    pad = 26;
    dim = ((pad * 2) + (cell * 8));
    dims = String(dim);
    svg = (((("<svg viewBox=\"0 0 " + String(dims)) + " ") + String(dims)) + "\" class=\"sc-chessboard\" xmlns=\"http://www.w3.org/2000/svg\">");
    svg = (svg + (((("<rect x=\"0\" y=\"0\" width=\"" + String(dims)) + "\" height=\"") + String(dims)) + "\" rx=\"8\" fill=\"#171a21\"/>"));
    hlfrom = (0 - 1);
    hlto = (0 - 1);
    if ((n > 0)) {
        lastn = (n - 1);
        uci = window.scData.moves[lastn];
        hff = chess_file(uci.charAt(0));
        hfr = (window.parseInt(uci.charAt(1), 10) - 1);
        htf = chess_file(uci.charAt(2));
        htr = (window.parseInt(uci.charAt(3), 10) - 1);
        hlfrom = ((hfr * 8) + hff);
        hlto = ((htr * 8) + htf);
    }
    r = 0;
    while ((r < 8)) {
        f = 0;
        while ((f < 8)) {
            x = String((pad + (f * cell)));
            yrow = (7 - r);
            y = String((pad + (yrow * cell)));
            fillc = "#e9ddc2";
            parity = ((r + f) % 2);
            if ((parity === 0)) {
                fillc = "#9c7b52";
            }
            cells = String(cell);
            svg = (svg + (((((((((("<rect x=\"" + String(x)) + "\" y=\"") + String(y)) + "\" width=\"") + String(cells)) + "\" height=\"") + String(cells)) + "\" fill=\"") + String(fillc)) + "\"/>"));
            sqidx = ((r * 8) + f);
            ishl = false;
            if ((sqidx === hlfrom)) {
                ishl = true;
            }
            if ((sqidx === hlto)) {
                ishl = true;
            }
            if (ishl) {
                svg = (svg + (((((((("<rect x=\"" + String(x)) + "\" y=\"") + String(y)) + "\" width=\"") + String(cells)) + "\" height=\"") + String(cells)) + "\" fill=\"#f5c45e\" opacity=\".3\"/>"));
            }
            f = (f + 1);
        }
        r = (r + 1);
    }
    i = 0;
    while ((i < 8)) {
        fx = String(((pad + (i * cell)) + (cell / 2)));
        fy = String((dim - 8));
        flabel = "abcdefgh".charAt(i);
        svg = (svg + (((((("<text x=\"" + String(fx)) + "\" y=\"") + String(fy)) + "\" font-size=\"12\" fill=\"#8a8f9c\" text-anchor=\"middle\" font-family=\"Inter,sans-serif\">") + String(flabel)) + "</text>"));
        ry = String(((pad + ((7 - i) * cell)) + (cell / 2)));
        rlabel = String((i + 1));
        svg = (svg + (((("<text x=\"11\" y=\"" + String(ry)) + "\" font-size=\"12\" fill=\"#8a8f9c\" text-anchor=\"middle\" dominant-baseline=\"central\" font-family=\"Inter,sans-serif\">") + String(rlabel)) + "</text>"));
        i = (i + 1);
    }
    r = 0;
    while ((r < 8)) {
        row = board[r];
        f = 0;
        while ((f < 8)) {
            piece = row[f];
            if (piece) {
                kind = piece.charAt(1);
                g = chess_glyph(kind);
                px = String(((pad + (f * cell)) + (cell / 2)));
                pyrow = (7 - r);
                py = String((((pad + (pyrow * cell)) + (cell / 2)) + 2));
                fillc = "#f6f1e4";
                strokec = "#23262e";
                if ((piece.charAt(0) === "b")) {
                    fillc = "#15171d";
                    strokec = "#cfd6e4";
                }
                svg = (svg + (((((((((("<text x=\"" + String(px)) + "\" y=\"") + String(py)) + "\" font-size=\"42\" text-anchor=\"middle\" dominant-baseline=\"central\" fill=\"") + String(fillc)) + "\" stroke=\"") + String(strokec)) + "\" stroke-width=\"1.1\" paint-order=\"stroke\" style=\"font-family:'Segoe UI Symbol','Noto Sans Symbols 2',system-ui\">") + String(g)) + "</text>"));
            }
            f = (f + 1);
        }
        r = (r + 1);
    }
    svg = (svg + "</svg>");
    stage = document.getElementById("sc-board");
    if (stage) {
        stage.innerHTML = svg;
    }
    return 0;
}

function chess_init() {
    let plies, caption, d, stage, sidename, elostr, total;
    stage = document.getElementById("showcase-stage");
    d = window.scData;
    total = d.moves.length;
    sidename = "White";
    if ((d.bot_white === false)) {
        sidename = "Black";
    }
    elostr = "";
    if (d.elo) {
        elostr = (" at Elo " + String(d.elo));
    }
    plies = String(total);
    caption = (((((("<div class=\"sc-caption\">The recorded <strong>win over Stockfish" + String(elostr)) + "</strong> — FoldBot playing ") + String(sidename)) + ", ") + String(plies)) + " plies, from the refereed match log. Every evaluation an exact rational counted from the board's geometry.</div>");
    stage.innerHTML = ((caption + "<div id=\"sc-board\" class=\"sc-board\"></div>") + sc_controls(total));
    sc_wire_controls(chess_render, total);
    return 0;
}

function protein_render(step) {
    let n, miny, scale, syn, ang, sina, maxy, minx, sx, y, px, proj, z, p, span, sy, cmd, sxn, x, pair, maxx, stage, spy, path, cosa, i, ca, py, pr, svg;
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
    let n, src, stage;
    stage = document.getElementById("showcase-stage");
    n = String(window.scData.ca.length);
    src = window.scData.source;
    stage.innerHTML = (((("<div class=\"sc-caption\">Ubiquitin (" + String(n)) + " residues) folded by descent to the fold's fixed point — the real Cα backbone from <code>") + String(src)) + "</code>, rotating live.</div><div id=\"sc-board\" class=\"sc-board sc-board--protein\"></div>");
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

function lab_go_group(start) {
    let colour, i, stack, col, out, seen, cur, ns, board, row, value;
    board = window.labGoBoard;
    colour = board[start];
    out = JSON.parse("{\"group\":[],\"libs\":[]}");
    if ((colour === 0)) {
        return out;
    }
    seen = [];
    i = 0;
    while ((i < 25)) {
        seen.push(false);
        i = (i + 1);
    }
    stack = [start];
    seen.splice(start, 1, true);
    while ((stack.length > 0)) {
        cur = stack.pop();
        out.group.push(cur);
        col = (cur % 5);
        row = Math.floor((cur / 5));
        ns = [];
        if ((col > 0)) {
            ns.push((cur - 1));
        }
        if ((col < 4)) {
            ns.push((cur + 1));
        }
        if ((row > 0)) {
            ns.push((cur - 5));
        }
        if ((row < 4)) {
            ns.push((cur + 5));
        }
        for (const nb of ns) {
            value = board[nb];
            if ((value === 0)) {
                if ((out.libs.indexOf(nb) < 0)) {
                    out.libs.push(nb);
                }
            } else if ((value === colour)) {
                if (!seen[nb]) {
                    seen.splice(nb, 1, true);
                    stack.push(nb);
                }
            }
        }
    }
    return out;
}

function lab_go_click(ev) {
    let value, idx;
    idx = window.parseInt(ev.currentTarget.getAttribute("data-i"), 10);
    value = window.labGoBoard[idx];
    value = ((value + 1) % 3);
    window.labGoBoard.splice(idx, 1, value);
    window.labGoFocus = idx;
    lab_go_render();
    return 0;
}

function lab_go_clear(ev) {
    window.labGoBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    window.labGoFocus = 12;
    lab_go_render();
    return 0;
}

function lab_go_preset(ev) {
    window.labGoBoard = [0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 2, 1, 1, 1, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0];
    window.labGoFocus = 12;
    lab_go_render();
    return 0;
}

function lab_go_render() {
    let colour, i, host, label, v, html, points, found, cls;
    host = document.getElementById("go-lab");
    if (!host) {
        return 0;
    }
    found = lab_go_group(window.labGoFocus);
    colour = window.labGoBoard[window.labGoFocus];
    label = "Empty intersection";
    if ((colour === 1)) {
        label = "Black chain";
    }
    if ((colour === 2)) {
        label = "White chain";
    }
    html = "<div class=\"lab-layout\"><div class=\"go-lab-board\">";
    i = 0;
    while ((i < 25)) {
        cls = "go-lab-point";
        v = window.labGoBoard[i];
        if ((v === 1)) {
            cls = (cls + " black");
        }
        if ((v === 2)) {
            cls = (cls + " white");
        }
        if ((found.group.indexOf(i) >= 0)) {
            cls = (cls + " is-group");
        }
        html = (((((html + "<button class=\"") + cls) + "\" data-i=\"") + String(i)) + "\" aria-label=\"Cycle stone\"></button>");
        i = (i + 1);
    }
    html = (((html + "</div><div class=\"lab-panel\"><p class=\"lab-kicker\">Selected structure</p><div class=\"lab-stat\">") + label) + "</div>");
    html = (((((html + "<p class=\"lab-copy\"><strong>") + String(found.group.length)) + " stones</strong> connected · <strong>") + String(found.libs.length)) + " unique liberties</strong>. Tap any intersection to cycle empty → black → white.</p>");
    html = (html + "<div class=\"lab-actions\"><button class=\"lab-action\" id=\"go-preset\">Load atari</button><button class=\"lab-action\" id=\"go-clear\">Clear board</button></div></div></div>");
    host.innerHTML = html;
    points = host.querySelectorAll(".go-lab-point");
    for (const p of points) {
        p.addEventListener("click", lab_go_click);
    }
    document.getElementById("go-preset").addEventListener("click", lab_go_preset);
    document.getElementById("go-clear").addEventListener("click", lab_go_clear);
    return 0;
}

function lab_go_init() {
    window.labGoBoard = [0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 2, 1, 1, 1, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0];
    window.labGoFocus = 12;
    lab_go_render();
    return 0;
}

function lab_chess_moves(square, piece) {
    let c, rr, cc, dirs, jumps, r, moves;
    moves = [];
    r = Math.floor((square / 8));
    c = (square % 8);
    if ((piece === "knight")) {
        jumps = [[(0 - 2), (0 - 1)], [(0 - 2), 1], [(0 - 1), (0 - 2)], [(0 - 1), 2], [1, (0 - 2)], [1, 2], [2, (0 - 1)], [2, 1]];
        for (const jump of jumps) {
            rr = (r + jump[0]);
            cc = (c + jump[1]);
            if ((rr >= 0)) {
                if ((rr < 8)) {
                    if ((cc >= 0)) {
                        if ((cc < 8)) {
                            moves.push(((rr * 8) + cc));
                        }
                    }
                }
            }
        }
        return moves;
    }
    dirs = [[(0 - 1), 0], [1, 0], [0, (0 - 1)], [0, 1]];
    if ((piece === "queen")) {
        dirs = [[(0 - 1), 0], [1, 0], [0, (0 - 1)], [0, 1], [(0 - 1), (0 - 1)], [(0 - 1), 1], [1, (0 - 1)], [1, 1]];
    }
    for (const d of dirs) {
        rr = (r + d[0]);
        cc = (c + d[1]);
        while ((rr >= 0)) {
            if ((rr >= 8)) {
                rr = (0 - 10);
            } else if ((cc < 0)) {
                rr = (0 - 10);
            } else if ((cc >= 8)) {
                rr = (0 - 10);
            } else {
                moves.push(((rr * 8) + cc));
                rr = (rr + d[0]);
                cc = (cc + d[1]);
            }
        }
    }
    return moves;
}

function lab_chess_square(ev) {
    window.labChessSquare = window.parseInt(ev.currentTarget.getAttribute("data-i"), 10);
    lab_chess_render();
    return 0;
}

function lab_chess_piece(ev) {
    window.labChessPiece = ev.currentTarget.getAttribute("data-piece");
    lab_chess_render();
    return 0;
}

function lab_chess_render() {
    let glyph, title, active, picks, pieces, html, cc, cls, squares, host, moves, i, content, rr;
    host = document.getElementById("chess-lab");
    moves = lab_chess_moves(window.labChessSquare, window.labChessPiece);
    glyph = "♘";
    title = "Knight";
    if ((window.labChessPiece === "rook")) {
        glyph = "♖";
        title = "Rook";
    }
    if ((window.labChessPiece === "queen")) {
        glyph = "♕";
        title = "Queen";
    }
    html = "<div class=\"lab-layout\"><div class=\"chess-lab-board\">";
    i = 0;
    while ((i < 64)) {
        cls = "chess-lab-square";
        rr = Math.floor((i / 8));
        cc = (i % 8);
        if ((((rr + cc) % 2) === 0)) {
            cls = (cls + " is-light");
        }
        if ((moves.indexOf(i) >= 0)) {
            cls = (cls + " is-commanded");
        }
        content = "";
        if ((i === window.labChessSquare)) {
            cls = (cls + " is-origin");
            content = glyph;
        }
        html = (((((((html + "<button class=\"") + cls) + "\" data-i=\"") + String(i)) + "\" aria-label=\"Move piece here\">") + content) + "</button>");
        i = (i + 1);
    }
    html = (((html + "</div><div class=\"lab-panel\"><p class=\"lab-kicker\">Board-derived value</p><div class=\"lab-stat\">") + String(moves.length)) + " commanded squares</div>");
    html = (((html + "<p class=\"lab-copy\">The ") + title) + " receives this value from its present square. Move it and the count changes with the position.</p><div class=\"lab-actions\">");
    pieces = ["knight", "rook", "queen"];
    for (const piece of pieces) {
        active = "lab-action";
        if ((piece === window.labChessPiece)) {
            active = (active + " is-active");
        }
        html = (((((((html + "<button class=\"") + active) + "\" data-piece=\"") + piece) + "\">") + piece) + "</button>");
    }
    html = (html + "</div></div></div>");
    host.innerHTML = html;
    squares = host.querySelectorAll(".chess-lab-square");
    for (const sq of squares) {
        sq.addEventListener("click", lab_chess_square);
    }
    picks = host.querySelectorAll("[data-piece]");
    for (const pick of picks) {
        pick.addEventListener("click", lab_chess_piece);
    }
    return 0;
}

function lab_chess_init() {
    window.labChessPiece = "knight";
    window.labChessSquare = 27;
    lab_chess_render();
    return 0;
}

function lab_protein_distance(a, b) {
    let dy, dx, dz;
    dx = (a[0] - b[0]);
    dy = (a[1] - b[1]);
    dz = (a[2] - b[2]);
    return Math.sqrt((((dx * dx) + (dy * dy)) + (dz * dz)));
}

function lab_protein_render() {
    let j, i, copy, contacts, ctx, cell, coords, focus, n, nearest, canvas, dist, stat;
    coords = window.labProteinCoords;
    focus = window.labProteinFocus;
    canvas = document.getElementById("protein-map");
    if (!canvas) {
        return 0;
    }
    ctx = canvas.getContext("2d");
    n = coords.length;
    cell = (520 / n);
    ctx.clearRect(0, 0, 520, 520);
    contacts = 0;
    nearest = 999;
    i = 0;
    while ((i < n)) {
        j = 0;
        while ((j < n)) {
            dist = lab_protein_distance(coords[i], coords[j]);
            if ((dist < 8)) {
                ctx.fillStyle = "rgba(255,159,127,.42)";
                if ((Math.abs((i - j)) > 2)) {
                    ctx.fillStyle = "#ff9f7f";
                }
                ctx.fillRect((j * cell), (i * cell), (cell + 0.35), (cell + 0.35));
            }
            j = (j + 1);
        }
        i = (i + 1);
    }
    ctx.fillStyle = "rgba(255,255,255,.86)";
    ctx.fillRect(0, (focus * cell), 520, Math.max(1.5, cell));
    ctx.fillRect((focus * cell), 0, Math.max(1.5, cell), 520);
    i = 0;
    while ((i < n)) {
        if ((Math.abs((i - focus)) > 2)) {
            dist = lab_protein_distance(coords[focus], coords[i]);
            if ((dist < nearest)) {
                nearest = dist;
            }
            if ((dist < 8)) {
                contacts = (contacts + 1);
            }
        }
        i = (i + 1);
    }
    stat = document.getElementById("protein-stat");
    copy = document.getElementById("protein-copy");
    stat.textContent = (String(contacts) + " folded contacts");
    copy.textContent = (((("Residue " + String((focus + 1))) + " · nearest non-neighbour ") + nearest.toFixed(2)) + " Å · contact threshold 8 Å.");
    return 0;
}

function lab_protein_slide(ev) {
    window.labProteinFocus = (window.parseInt(ev.currentTarget.value, 10) - 1);
    lab_protein_render();
    return 0;
}

function lab_protein_ready(data) {
    let host;
    window.labProteinCoords = data.ca;
    window.labProteinFocus = 35;
    host = document.getElementById("protein-lab");
    host.innerHTML = "<div class=\"lab-layout\"><canvas id=\"protein-map\" class=\"protein-map\" width=\"520\" height=\"520\" aria-label=\"76 by 76 residue contact map\"></canvas><div class=\"lab-panel\"><p class=\"lab-kicker\">Selected residue</p><div class=\"lab-stat\" id=\"protein-stat\"></div><p class=\"lab-copy\" id=\"protein-copy\"></p><input class=\"lab-range\" id=\"protein-range\" type=\"range\" min=\"1\" max=\"76\" value=\"36\" aria-label=\"Residue number\"></div></div>";
    document.getElementById("protein-range").addEventListener("input", lab_protein_slide);
    lab_protein_render();
    return 0;
}

function lab_protein_recv(resp) {
    resp.json().then(lab_protein_ready);
    return 0;
}

function lab_protein_init() {
    fetch("content/interactive/fold-protein-ca.json").then(lab_protein_recv);
    return 0;
}

function lab_unison_clean(text) {
    let clean, marks;
    clean = text.toLowerCase();
    marks = [".", ",", "!", "?", ";", ":", "—", "\n"];
    for (const mark of marks) {
        clean = clean.split(mark).join(" ");
    }
    return clean.split(" ");
}

function lab_unison_run(ev) {
    let html, old, pct, best, total, words, counts, next, text, pos, held, result, count, i, raw, options;
    text = document.getElementById("unison-corpus").value;
    held = document.getElementById("unison-held").value.toLowerCase();
    raw = lab_unison_clean(text);
    words = [];
    for (const word of raw) {
        if ((word.length > 0)) {
            words.push(word);
        }
    }
    options = [];
    counts = [];
    total = 0;
    i = 0;
    while ((i < (words.length - 1))) {
        if ((words[i] === held)) {
            next = words[(i + 1)];
            pos = options.indexOf(next);
            if ((pos < 0)) {
                options.push(next);
                counts.push(1);
            } else {
                old = counts[pos];
                counts.splice(pos, 1, (old + 1));
            }
            total = (total + 1);
        }
        i = (i + 1);
    }
    result = document.getElementById("unison-result");
    if ((total === 0)) {
        result.innerHTML = "<p class=\"lab-copy\">That held word has no continuation in this memory yet. Add it to the text or choose another word.</p>";
        return 0;
    }
    best = 0;
    html = (("<p class=\"lab-kicker\">Exact continuations after “" + held) + "”</p><div class=\"unison-shares\">");
    i = 0;
    while ((i < options.length)) {
        count = counts[i];
        if ((count > counts[best])) {
            best = i;
        }
        pct = Math.round(((count * 100) / total));
        html = (((((((((html + "<div class=\"unison-share\"><span>") + options[i]) + "</span><b>") + String(count)) + "/") + String(total)) + "</b><i style=\"--share:") + String(pct)) + "%\"></i></div>");
        i = (i + 1);
    }
    html = (((html + "</div><div class=\"lab-stat\" style=\"margin-top:26px\">“") + options[best]) + "” is selected</div><p class=\"lab-copy\">The largest exact share wins; ties preserve the first held continuation.</p>");
    result.innerHTML = html;
    return 0;
}

function lab_unison_init() {
    let host;
    host = document.getElementById("unison-lab");
    host.innerHTML = "<div class=\"lab-layout\"><div><textarea class=\"unison-corpus\" id=\"unison-corpus\">the fold holds memory. the fold derives structure. the fold holds relation. memory holds the fold. relation holds the one.</textarea><div class=\"lab-actions\"><input class=\"unison-corpus\" id=\"unison-held\" value=\"the\" aria-label=\"Held word\" style=\"min-height:44px;height:44px;width:140px;padding:10px\"><button class=\"lab-action is-active\" id=\"unison-run\">Form exact shares</button></div></div><div class=\"lab-panel\" id=\"unison-result\"></div></div>";
    document.getElementById("unison-run").addEventListener("click", lab_unison_run);
    lab_unison_run(0);
    return 0;
}

function project_labs_init() {
    if (document.getElementById("go-lab")) {
        lab_go_init();
    }
    if (document.getElementById("chess-lab")) {
        lab_chess_init();
    }
    if (document.getElementById("protein-lab")) {
        lab_protein_init();
    }
    if (document.getElementById("unison-lab")) {
        lab_unison_init();
    }
    return 0;
}

function main() {
    let gh, repo, stage, page, file, dl, doc;
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
    window.ernosApiReady.then(sc_check_cb);
    doc = document.getElementById("project-doc");
    if (doc) {
        fetch((("content/projects/" + repo) + ".md")).then(sc_doc_recv).catch(sc_doc_fail);
    }
    project_labs_init();
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
