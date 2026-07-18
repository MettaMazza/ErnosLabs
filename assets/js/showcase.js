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
    let out, t;
    t = String(total);
    out = "<div class=\"sc-transport\"><div class=\"sc-progress\" aria-hidden=\"true\"><span id=\"sc-progress-fill\"></span></div><div class=\"sc-controls\">";
    out = (out + "<button class=\"sc-btn\" id=\"sc-first\" aria-label=\"Start\">⏮</button>");
    out = (out + "<button class=\"sc-btn\" id=\"sc-prev\" aria-label=\"Back\">◀</button>");
    out = (out + "<button class=\"sc-btn sc-btn--play\" id=\"sc-play\" aria-label=\"Play\">▶</button>");
    out = (out + "<button class=\"sc-btn\" id=\"sc-next\" aria-label=\"Forward\">▶▏</button>");
    out = (out + "<button class=\"sc-btn\" id=\"sc-last\" aria-label=\"End\">⏭</button>");
    out = (out + (("<span class=\"sc-count\" id=\"sc-count\">0 / " + String(t)) + "</span>"));
    out = (out + "</div></div>");
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
    sc_stop();
    window.scPos = 0;
    window.scTotal = total;
    window.scRender = render_fn;
    window.scPlaying = false;
    window.scLoop = false;
    render_fn(0);
    sc_wire("sc-first", sc_first);
    sc_wire("sc-prev", sc_prev);
    sc_wire("sc-next", sc_next);
    sc_wire("sc-last", sc_last);
    sc_wire("sc-play", sc_playpause);
    return 0;
}

function sc_goto(n) {
    let pc, fill, c, p;
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
    fill = document.getElementById("sc-progress-fill");
    if (fill) {
        pc = 0;
        if ((window.scTotal > 0)) {
            pc = (Math.round(((p * 1000) / window.scTotal)) / 10);
        }
        fill.style.width = (String(pc) + "%");
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
        if (window.scLoop) {
            sc_goto(0);
            return 0;
        }
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
    let neigh, total, i, stack, seen, libs, col, row, v, group, colour, cur;
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
    let mv, row, size, neigh, dead, board, idx, i, playable, rownum, k, d, enemy, side, col, moves, colour, coord;
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
    let dims, a0, cx, nextside, letter, size, board, stars, v, mv, total, moves, svg, lastn, coord, dim, current, p, numlbl, idx, a1, lastmove, cell, i, stage, d, turn, cy, col, rownum, row, pad, edge, side, signal, marky;
    d = window.scData;
    size = d.boardsize;
    board = go_position_at(n);
    cell = 30;
    pad = 34;
    dim = ((pad * 2) + (cell * (size - 1)));
    dims = String(dim);
    svg = (((("<svg viewBox=\"0 0 " + String(dims)) + " ") + String(dims)) + "\" class=\"sc-goban\" xmlns=\"http://www.w3.org/2000/svg\">");
    svg = (svg + "<defs><linearGradient id=\"goWood\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0%\" stop-color=\"#e5bd75\"/><stop offset=\"48%\" stop-color=\"#c9924f\"/><stop offset=\"100%\" stop-color=\"#a96f38\"/></linearGradient><radialGradient id=\"goBlack\" cx=\"32%\" cy=\"26%\"><stop offset=\"0%\" stop-color=\"#59616c\"/><stop offset=\"38%\" stop-color=\"#20242a\"/><stop offset=\"100%\" stop-color=\"#050608\"/></radialGradient><radialGradient id=\"goWhite\" cx=\"32%\" cy=\"26%\"><stop offset=\"0%\" stop-color=\"#ffffff\"/><stop offset=\"58%\" stop-color=\"#f0eee7\"/><stop offset=\"100%\" stop-color=\"#bfc2c5\"/></radialGradient><filter id=\"goShadow\" x=\"-40%\" y=\"-40%\" width=\"180%\" height=\"180%\"><feDropShadow dx=\"1.4\" dy=\"3.2\" stdDeviation=\"2.2\" flood-color=\"#1a0c04\" flood-opacity=\".58\"/></filter></defs>");
    svg = (svg + (((("<rect x=\"1\" y=\"1\" width=\"" + String(dims)) + "\" height=\"") + String(dims)) + "\" rx=\"17\" fill=\"url(#goWood)\" stroke=\"#f1cf8e\" stroke-opacity=\".35\"/>"));
    svg = (svg + (((("<rect x=\"13\" y=\"13\" width=\"" + String(dims)) + "\" height=\"") + String(dims)) + "\" rx=\"12\" fill=\"none\" stroke=\"#6e3e1f\" stroke-opacity=\".22\" transform=\"scale(.956)\"/>"));
    a0 = String(pad);
    a1 = String((pad + ((size - 1) * cell)));
    i = 0;
    while ((i < size)) {
        p = String((pad + (i * cell)));
        svg = (svg + (((((((("<line x1=\"" + String(p)) + "\" y1=\"") + String(a0)) + "\" x2=\"") + String(p)) + "\" y2=\"") + String(a1)) + "\" stroke=\"#5c321d\" stroke-width=\"1.15\" opacity=\".72\"/>"));
        svg = (svg + (((((((("<line x1=\"" + String(a0)) + "\" y1=\"") + String(p)) + "\" x2=\"") + String(a1)) + "\" y2=\"") + String(p)) + "\" stroke=\"#5c321d\" stroke-width=\"1.15\" opacity=\".72\"/>"));
        letter = "ABCDEFGHJKLMNOPQRST".charAt(i);
        numlbl = String((size - i));
        edge = String((dim - 12));
        svg = (svg + (((((("<text x=\"" + String(p)) + "\" y=\"") + String(edge)) + "\" font-size=\"10\" fill=\"#5c321d\" text-anchor=\"middle\" font-family=\"JetBrains Mono,monospace\" opacity=\".8\">") + String(letter)) + "</text>"));
        svg = (svg + (((("<text x=\"12\" y=\"" + String(p)) + "\" font-size=\"10\" fill=\"#5c321d\" text-anchor=\"middle\" dominant-baseline=\"central\" font-family=\"JetBrains Mono,monospace\" opacity=\".8\">") + String(numlbl)) + "</text>"));
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
                svg = (svg + (((("<circle cx=\"" + String(cx)) + "\" cy=\"") + String(cy)) + "\" r=\"13.35\" fill=\"url(#goBlack)\" stroke=\"#020304\" stroke-width=\".7\" filter=\"url(#goShadow)\"/>"));
            } else {
                svg = (svg + (((("<circle cx=\"" + String(cx)) + "\" cy=\"") + String(cy)) + "\" r=\"13.35\" fill=\"url(#goWhite)\" stroke=\"#aeb0b3\" stroke-width=\".7\" filter=\"url(#goShadow)\"/>"));
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
            svg = (svg + (((((((("<circle cx=\"" + String(cx)) + "\" cy=\"") + String(cy)) + "\" r=\"5\" fill=\"none\" stroke=\"#62f3c8\" stroke-width=\"2.5\"/><circle cx=\"") + String(cx)) + "\" cy=\"") + String(cy)) + "\" r=\"17\" fill=\"none\" stroke=\"#62f3c8\" stroke-width=\"1\" opacity=\".45\"/>"));
        }
    }
    svg = (svg + "</svg>");
    stage = document.getElementById("sc-board");
    if (stage) {
        stage.innerHTML = svg;
    }
    current = document.getElementById("sc-current");
    turn = document.getElementById("sc-turn");
    signal = document.getElementById("sc-signal");
    if ((n === 0)) {
        if (current) {
            current.textContent = "Opening position";
        }
        if (turn) {
            turn.textContent = "Black to move";
        }
        if (signal) {
            signal.textContent = "19 × 19";
        }
    } else {
        lastmove = d.moves[(n - 1)];
        side = lastmove[0];
        coord = lastmove[1];
        if (current) {
            current.textContent = ((side + " · ") + coord);
        }
        if (turn) {
            nextside = "Black to move";
            if ((side === "B")) {
                nextside = "White to move";
            }
            turn.textContent = nextside;
        }
        if (signal) {
            signal.textContent = ("Move " + String(n));
        }
    }
    return 0;
}

function go_init() {
    let nmoves, stage, total;
    stage = document.getElementById("showcase-stage");
    total = window.scData.moves.length;
    nmoves = String(total);
    stage.innerHTML = ((("<div class=\"sc-replay-head\"><div><span class=\"sc-replay-kicker\">Recorded match · 19 × 19</span><h3>Fold engine vs KataGo</h3><p>The complete " + String(nmoves)) + "-move match log, with legal captures reconstructed on every step.</p></div><span class=\"sc-replay-badge\"><i></i> Match receipt</span></div><div class=\"sc-replay-grid\"><div id=\"sc-board\" class=\"sc-board\"></div><aside class=\"sc-replay-rail\"><div><span>Last action</span><strong id=\"sc-current\">Opening position</strong></div><div><span>Turn</span><strong id=\"sc-turn\">Black to move</strong></div><div><span>Board</span><strong id=\"sc-signal\">19 × 19</strong></div><div class=\"sc-replay-result\"><span>Engine profile</span><strong>0 weights<br>0 playouts</strong></div></aside></div>") + sc_controls(total));
    sc_wire_controls(go_render, total);
    return 0;
}

function chess_row(letters, colour) {
    let i, arr, ch;
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

function chess_piece_svg(kind, x, y, side) {
    let fillc, strokec, out;
    fillc = "#fffaf0";
    strokec = "#25313f";
    if ((side === "b")) {
        fillc = "#111821";
        strokec = "#eef2f7";
    }
    out = (((((((((((((("<g class=\"sc-piece sc-piece--" + String(side)) + "\" data-side=\"") + String(side)) + "\" data-kind=\"") + String(kind)) + "\" transform=\"translate(") + String(x)) + " ") + String(y)) + ")\" fill=\"") + String(fillc)) + "\" stroke=\"") + String(strokec)) + "\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" filter=\"url(#pieceShadow)\">");
    if ((kind === "P")) {
        out = (out + "<circle cx=\"28\" cy=\"16\" r=\"7.4\"/><path d=\"M19 38c1.3-7.8 4.2-12.4 9-14.3 4.8 1.9 7.7 6.5 9 14.3z\"/><path d=\"M16 43h24l-2.2-5H18.2z\"/>");
    }
    if ((kind === "R")) {
        out = (out + "<path d=\"M16 11h7v6h5v-6h5v6h7v-6h3v13l-5 4 2.4 13H15.6L18 28l-5-4V11z\"/><path d=\"M15 41h26v5H15z\"/>");
    }
    if ((kind === "N")) {
        out = (out + (("<path d=\"M16 43h25v3H14z\"/><path d=\"M19 39c0-8.5 2.8-15.1 8.5-20l-2.2-7 12.2 5.2c4.8 5.5 5.8 12.1 2.8 19.8l-5.8-6.2-7.4 2.4-3.1 5.8z\"/><circle cx=\"35.5\" cy=\"22.5\" r=\"1.5\" fill=\"" + String(strokec)) + "\" stroke=\"none\"/>"));
    }
    if ((kind === "B")) {
        out = (out + "<path d=\"M28 9c6.5 5.2 9.5 10.2 9 15 0 4.8-2.7 8.5-8 11h-2c-5.3-2.5-8-6.2-8-11-.5-4.8 2.5-9.8 9-15z\"/><path d=\"M17 42h22l-4.5-8h-13z\"/><path d=\"M14 46h28l-3-4H17z\"/><path d=\"M31.8 15.5l-8 10\" fill=\"none\" stroke-width=\"2.2\"/>");
    }
    if ((kind === "Q")) {
        out = (out + "<circle cx=\"15\" cy=\"14\" r=\"3\"/><circle cx=\"28\" cy=\"9\" r=\"3\"/><circle cx=\"41\" cy=\"14\" r=\"3\"/><path d=\"M15 17l6.2 17h13.6L41 17l-8 9-5-13-5 13z\"/><path d=\"M18 39h20l-3.2-5H21.2z\"/><path d=\"M15 45h26l-3-6H18z\"/>");
    }
    if ((kind === "K")) {
        out = (out + "<path d=\"M28 7v13M22 13h12\" fill=\"none\" stroke-width=\"3\"/><path d=\"M20 39c1.2-7.2 3.7-12.8 8-16.8 4.3 4 6.8 9.6 8 16.8z\"/><path d=\"M16 45h24l-3-6H19z\"/>");
    }
    out = (out + "</g>");
    return out;
}

function chess_file(ch) {
    return "abcdefgh".indexOf(ch);
}

function chess_board_at(n) {
    let target, filediff, promo, tf, fr, kind, piece, ff, diff, rook, negtwo, side, caprow, torow, uci, moves, board, fromrow, k, tr;
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
    let fx, pad, current, hlto, nextturn, hfr, htr, htf, x, dims, svg, r, y, sqidx, flabel, kind, ishl, piecex, pyrow, fy, stage, hlfrom, board, piece, yrow, dim, lastn, cells, piecey, uci, ry, rlabel, row, hff, turn, i, signal, played, parity, f, fillc, cell;
    board = chess_board_at(n);
    cell = 56;
    pad = 26;
    dim = ((pad * 2) + (cell * 8));
    dims = String(dim);
    svg = (((("<svg viewBox=\"0 0 " + String(dims)) + " ") + String(dims)) + "\" class=\"sc-chessboard\" xmlns=\"http://www.w3.org/2000/svg\">");
    svg = (svg + "<defs><linearGradient id=\"chessFrame\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0%\" stop-color=\"#303d51\"/><stop offset=\"52%\" stop-color=\"#151d2a\"/><stop offset=\"100%\" stop-color=\"#090e16\"/></linearGradient><filter id=\"pieceShadow\" x=\"-30%\" y=\"-30%\" width=\"160%\" height=\"160%\"><feDropShadow dx=\"0\" dy=\"2.5\" stdDeviation=\"1.8\" flood-color=\"#02040a\" flood-opacity=\".72\"/></filter></defs>");
    svg = (svg + (((("<rect x=\"1\" y=\"1\" width=\"" + String(dims)) + "\" height=\"") + String(dims)) + "\" rx=\"18\" fill=\"url(#chessFrame)\" stroke=\"#f4ca71\" stroke-opacity=\".22\"/>"));
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
            fillc = "#b9c4c2";
            parity = ((r + f) % 2);
            if ((parity === 0)) {
                fillc = "#34475a";
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
                svg = (svg + (((((((((((((((("<rect x=\"" + String(x)) + "\" y=\"") + String(y)) + "\" width=\"") + String(cells)) + "\" height=\"") + String(cells)) + "\" fill=\"#f4ca71\" opacity=\".48\"/><rect x=\"") + String(x)) + "\" y=\"") + String(y)) + "\" width=\"") + String(cells)) + "\" height=\"") + String(cells)) + "\" fill=\"none\" stroke=\"#ffe6a5\" stroke-width=\"1.4\" opacity=\".75\"/>"));
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
                piecex = String((pad + (f * cell)));
                pyrow = (7 - r);
                piecey = String((pad + (pyrow * cell)));
                svg = (svg + chess_piece_svg(kind, piecex, piecey, piece.charAt(0)));
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
    current = document.getElementById("sc-current");
    turn = document.getElementById("sc-turn");
    signal = document.getElementById("sc-signal");
    if ((n === 0)) {
        if (current) {
            current.textContent = "Starting position";
        }
        if (turn) {
            turn.textContent = "White to move";
        }
        if (signal) {
            signal.textContent = "Game 8";
        }
    } else {
        played = window.scData.moves[(n - 1)];
        if (current) {
            current.textContent = ((played.substring(0, 2) + " → ") + played.substring(2, 4));
        }
        if (turn) {
            nextturn = "White to move";
            if (((n % 2) === 1)) {
                nextturn = "Black to move";
            }
            turn.textContent = nextturn;
        }
        if (signal) {
            signal.textContent = ("Ply " + String(n));
        }
    }
    return 0;
}

function chess_init() {
    let plies, caption, total, stage, d, sidename, elostr;
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
    caption = (((((("<div class=\"sc-replay-head\"><div><span class=\"sc-replay-kicker\">Recorded victory · Game 8</span><h3>FoldBot vs Stockfish" + String(elostr)) + "</h3><p>FoldBot plays ") + String(sidename)) + ". Every one of the ") + String(plies)) + " plies comes from the preserved match log.</p></div><span class=\"sc-replay-badge\"><i></i> Refereed game</span></div>");
    stage.innerHTML = ((caption + "<div class=\"sc-replay-grid\"><div id=\"sc-board\" class=\"sc-board\"></div><aside class=\"sc-replay-rail\"><div><span>Last move</span><strong id=\"sc-current\">Starting position</strong></div><div><span>Turn</span><strong id=\"sc-turn\">White to move</strong></div><div><span>Match</span><strong id=\"sc-signal\">Game 8</strong></div><div class=\"sc-replay-result\"><span>Recorded result</span><strong>FoldBot wins<br>as Black</strong></div></aside></div>") + sc_controls(total));
    sc_wire_controls(chess_render, total);
    return 0;
}

function protein_render(step) {
    let pnode, degrees, ax, px, ay, span, syn, maxx, sx, sy, screen, b, sw, y, nx, turn, ca, spy, n, current, maxz, depth, signal, scale, cosa, x, pr, minz, p, sina, ang, i, py, pair, z, a, ratio, proj, miny, bx, pz, by, ny, stage, sp, maxy, sxn, svg, colour, minx, isnode;
    ca = window.scData.ca;
    n = ca.length;
    ang = (step * 0.045);
    cosa = Math.cos(ang);
    sina = Math.sin(ang);
    minx = 100000;
    maxx = (0 - 100000);
    miny = 100000;
    maxy = (0 - 100000);
    minz = 100000;
    maxz = (0 - 100000);
    proj = [];
    i = 0;
    while ((i < n)) {
        p = ca[i];
        x = p[0];
        y = p[1];
        z = p[2];
        px = ((x * cosa) - (z * sina));
        pz = ((x * sina) + (z * cosa));
        py = y;
        pair = [];
        pair.push(px);
        pair.push(py);
        pair.push(pz);
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
        if ((pz < minz)) {
            minz = pz;
        }
        if ((pz > maxz)) {
            maxz = pz;
        }
        i = (i + 1);
    }
    span = (maxx - minx);
    spy = (maxy - miny);
    if ((spy > span)) {
        span = spy;
    }
    scale = (380 / span);
    screen = [];
    i = 0;
    while ((i < n)) {
        pr = proj[i];
        sxn = (40 + ((pr[0] - minx) * scale));
        syn = (40 + ((pr[1] - miny) * scale));
        sx = String((Math.round((sxn * 10)) / 10));
        sy = String((Math.round((syn * 10)) / 10));
        sp = [];
        sp.push(sx);
        sp.push(sy);
        sp.push(pr[2]);
        screen.push(sp);
        i = (i + 1);
    }
    svg = "<svg viewBox=\"0 0 460 460\" class=\"sc-protein\" xmlns=\"http://www.w3.org/2000/svg\">";
    svg = (svg + "<defs><radialGradient id=\"proteinHalo\"><stop offset=\"0%\" stop-color=\"#ff9f7f\" stop-opacity=\".14\"/><stop offset=\"100%\" stop-color=\"#ff9f7f\" stop-opacity=\"0\"/></radialGradient><filter id=\"proteinGlow\" x=\"-60%\" y=\"-60%\" width=\"220%\" height=\"220%\"><feGaussianBlur stdDeviation=\"4\" result=\"blur\"/><feMerge><feMergeNode in=\"blur\"/><feMergeNode in=\"SourceGraphic\"/></feMerge></filter></defs>");
    svg = (svg + "<circle cx=\"230\" cy=\"230\" r=\"212\" fill=\"url(#proteinHalo)\"/><ellipse cx=\"230\" cy=\"230\" rx=\"206\" ry=\"74\" fill=\"none\" stroke=\"#97a8c4\" stroke-opacity=\".11\"/><ellipse cx=\"230\" cy=\"230\" rx=\"104\" ry=\"206\" fill=\"none\" stroke=\"#97a8c4\" stroke-opacity=\".08\" transform=\"rotate(-28 230 230)\"/><circle cx=\"230\" cy=\"230\" r=\"160\" fill=\"none\" stroke=\"#97a8c4\" stroke-opacity=\".06\"/>");
    i = 1;
    while ((i < n)) {
        a = screen[(i - 1)];
        b = screen[i];
        depth = ((a[2] + b[2]) / 2);
        ratio = 0.5;
        if ((maxz > minz)) {
            ratio = ((depth - minz) / (maxz - minz));
        }
        colour = "#8b91ff";
        if ((ratio > 0.62)) {
            colour = "#ff9f7f";
        }
        if ((ratio < 0.36)) {
            colour = "#62f3c8";
        }
        sw = String((Math.round(((2.3 + (ratio * 3.5)) * 10)) / 10));
        ax = a[0];
        ay = a[1];
        bx = b[0];
        by = b[1];
        svg = (svg + (((((((((((("<line x1=\"" + String(ax)) + "\" y1=\"") + String(ay)) + "\" x2=\"") + String(bx)) + "\" y2=\"") + String(by)) + "\" stroke=\"") + String(colour)) + "\" stroke-width=\"") + String(sw)) + "\" stroke-linecap=\"round\" opacity=\".88\" filter=\"url(#proteinGlow)\"/>"));
        i = (i + 1);
    }
    i = 0;
    while ((i < n)) {
        isnode = (i % 8);
        if ((isnode === 0)) {
            pnode = screen[i];
            nx = pnode[0];
            ny = pnode[1];
            svg = (svg + (((("<circle cx=\"" + String(nx)) + "\" cy=\"") + String(ny)) + "\" r=\"4.2\" fill=\"#fff8f4\" stroke=\"#ff9f7f\" stroke-width=\"2\"/>"));
        }
        i = (i + 1);
    }
    svg = (svg + "</svg>");
    stage = document.getElementById("sc-board");
    if (stage) {
        stage.innerHTML = svg;
    }
    current = document.getElementById("sc-current");
    turn = document.getElementById("sc-turn");
    signal = document.getElementById("sc-signal");
    if (current) {
        current.textContent = (String(n) + " Cα points");
    }
    if (turn) {
        degrees = Math.round(((step * 360) / 140));
        turn.textContent = (String(degrees) + "° orbit");
    }
    if (signal) {
        signal.textContent = "0.989121";
    }
    return 0;
}

function protein_spin() {
    sc_tick();
    return 0;
}

function protein_init() {
    let stage, n, src, play;
    stage = document.getElementById("showcase-stage");
    n = String(window.scData.ca.length);
    src = window.scData.source;
    stage.innerHTML = ((((("<div class=\"sc-replay-head\"><div><span class=\"sc-replay-kicker\">Constructed witness · Ubiquitin</span><h3>The 76-residue backbone in orbit</h3><p>The committed Cα trace from <code>" + String(src)) + "</code>, projected with depth and available from every angle.</p></div><span class=\"sc-replay-badge\"><i></i> Verified geometry</span></div><div class=\"sc-replay-grid\"><div id=\"sc-board\" class=\"sc-board sc-board--protein\"></div><aside class=\"sc-replay-rail\"><div><span>Witness</span><strong id=\"sc-current\">") + String(n)) + " Cα points</strong></div><div><span>View</span><strong id=\"sc-turn\">0° orbit</strong></div><div><span>TM-score</span><strong id=\"sc-signal\">0.989121</strong></div><div class=\"sc-replay-result\"><span>Distance RMSD</span><strong>0.260858 Å</strong></div></aside></div>") + sc_controls(140));
    sc_wire_controls(protein_render, 140);
    window.scLoop = true;
    window.scPlaying = true;
    play = document.getElementById("sc-play");
    if (play) {
        play.textContent = "⏸";
    }
    window.scTimer = window.setInterval(protein_spin, 80);
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

function boot_append(line) {
    let term;
    term = document.getElementById("sc-term");
    if (term) {
        term.innerHTML = ((term.innerHTML + boot_esc(line)) + "\n");
        term.scrollTop = term.scrollHeight;
    }
    return 0;
}

function boot_finish() {
    let shell, state, prompt;
    shell = document.getElementById("ern-shell");
    if (shell) {
        shell.classList.add("is-ready");
    }
    state = document.getElementById("ern-state");
    if (state) {
        state.textContent = "READY";
    }
    prompt = document.getElementById("ern-command");
    if (prompt) {
        prompt.disabled = false;
    }
    boot_append("");
    boot_append("System ready. Try a sentence below.");
    return 0;
}

function boot_step() {
    let line, term;
    term = document.getElementById("sc-term");
    if (!term) {
        return 0;
    }
    if ((window.bootIdx >= window.bootLines.length)) {
        boot_finish();
        return 0;
    }
    line = window.bootLines[window.bootIdx];
    boot_append(line);
    window.bootIdx = (window.bootIdx + 1);
    window.setTimeout(boot_step, 42);
    return 0;
}

function boot_answer(command) {
    let cmd, files;
    cmd = command.toLowerCase().trim();
    if ((cmd === "help")) {
        return "Try: where am i · show my files · make a folder called letters · go to letters · write a note called hello saying good morning · read hello · what is running · rebuild the system";
    }
    if ((cmd === "where am i")) {
        return (("You are standing in " + window.ernPlace) + ".");
    }
    if ((cmd === "who am i")) {
        return "You are maria, the administrator of this machine.";
    }
    if ((cmd === "make a folder called letters")) {
        window.ernHasLetters = true;
        return "Made a folder called letters.";
    }
    if ((cmd === "go to letters")) {
        if (window.ernHasLetters) {
            window.ernPlace = "/home/maria/letters";
            return "You are now in /home/maria/letters.";
        }
        return "There is no folder called letters here yet.";
    }
    if ((cmd === "go home")) {
        window.ernPlace = "/home/maria";
        return "You are back in /home/maria.";
    }
    if ((cmd.indexOf("write a note called hello") === 0)) {
        window.ernHasNote = true;
        return "Saved the note hello.";
    }
    if ((cmd === "read hello")) {
        if (window.ernHasNote) {
            return "The note hello says:\ngood morning";
        }
        return "There is no note called hello here yet.";
    }
    if ((cmd === "show my files")) {
        files = [];
        if (window.ernHasLetters) {
            files.push("letters/");
        }
        if (window.ernHasNote) {
            files.push("hello.note");
        }
        if ((files.length === 0)) {
            return (window.ernPlace + " is empty.");
        }
        return ((("Inside " + window.ernPlace) + ":\n  ") + files.join("\n  "));
    }
    if ((cmd === "what is running")) {
        return "heartbeat      running\nsystem log     running\nsession maria  active";
    }
    if ((cmd === "open monitor")) {
        return "Ern Monitor\n  system: healthy\n  disk: local and fenced\n  network: not required\n  services: 2 running";
    }
    if ((cmd === "rebuild the system")) {
        return "Building the vendored Ernos compiler... done\nCompiling Ern-OS from its own plain-English source... done\nChecking the rebuilt system... byte-identical\nThe new system is ready for the next boot.";
    }
    return (("I do not know how to '" + command) + "'. Say 'help' to see what I understand.");
}

function boot_run(ev) {
    let input, command;
    if (ev) {
        ev.preventDefault();
    }
    input = document.getElementById("ern-command");
    if (!input) {
        return 0;
    }
    command = input.value.trim();
    if ((command === "")) {
        return 0;
    }
    boot_append(((window.ernPlace + " > ") + command));
    boot_append(boot_answer(command));
    boot_append("");
    input.value = "";
    input.focus();
    return 0;
}

function boot_quick(ev) {
    let input, command;
    command = ev.currentTarget.getAttribute("data-command");
    input = document.getElementById("ern-command");
    if (input) {
        input.value = command;
    }
    boot_run(ev);
    return 0;
}

function boot_key(ev) {
    if ((ev.key === "Enter")) {
        boot_run(ev);
    }
    return 0;
}

function boot_init() {
    let stage, form, commandbox, quicks;
    stage = document.getElementById("showcase-stage");
    stage.innerHTML = "<div class=\"ern-shell\" id=\"ern-shell\"><div class=\"ern-windowbar\"><span class=\"ern-window-dots\"><i></i><i></i><i></i></span><strong>Ern‑OS Desktop</strong><span class=\"ern-window-state\" id=\"ern-state\">BOOTING</span></div><div class=\"ern-desktop\"><aside class=\"ern-dock\" aria-label=\"Ern-OS apps\"><span class=\"is-active\">›_</span><span>▤</span><span>◫</span><span>⌁</span></aside><div class=\"ern-terminal\"><div class=\"ern-terminal-head\"><span>Conversation</span><small>maria@ern-os · offline</small></div><pre class=\"sc-term\" id=\"sc-term\"></pre><form class=\"ern-prompt\" id=\"ern-prompt\"><label for=\"ern-command\">/home/maria &gt;</label><input id=\"ern-command\" type=\"text\" autocomplete=\"off\" disabled placeholder=\"Type a sentence…\"><button type=\"submit\">Run</button></form></div></div><div class=\"ern-quick\" aria-label=\"Command suggestions\"><span>Try a command</span><button data-command=\"make a folder called letters\">Make a folder</button><button data-command=\"write a note called hello saying good morning\">Write a note</button><button data-command=\"what is running\">Running services</button><button data-command=\"rebuild the system\">Rebuild itself</button></div></div>";
    window.bootLines = window.scData.lines.slice(0, 31);
    window.bootIdx = 0;
    window.ernPlace = "/home/maria";
    window.ernHasLetters = false;
    window.ernHasNote = false;
    form = document.getElementById("ern-prompt");
    if (form) {
        form.addEventListener("submit", boot_run);
    }
    commandbox = document.getElementById("ern-command");
    if (commandbox) {
        commandbox.addEventListener("keydown", boot_key);
    }
    quicks = stage.querySelectorAll(".ern-quick button");
    for (const quick of quicks) {
        quick.addEventListener("click", boot_quick);
    }
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
    let value, seen, i, out, cur, col, stack, board, row, ns, colour;
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
    let idx, value;
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
    let html, colour, i, label, found, host, v, points, cls;
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
    let moves, jumps, dirs, c, rr, cc, r;
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
    let glyph, rr, active, host, title, cc, pieces, picks, i, content, squares, moves, cls, html;
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
    let dz, dx, dy;
    dx = (a[0] - b[0]);
    dy = (a[1] - b[1]);
    dz = (a[2] - b[2]);
    return Math.sqrt((((dx * dx) + (dy * dy)) + (dz * dz)));
}

function lab_protein_render() {
    let canvas, focus, n, cell, nearest, dist, stat, copy, contacts, coords, j, ctx, i;
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
    let marks, clean;
    clean = text.toLowerCase();
    marks = [".", ",", "!", "?", ";", ":", "—", "\n"];
    for (const mark of marks) {
        clean = clean.split(mark).join(" ");
    }
    return clean.split(" ");
}

function lab_unison_run(ev) {
    let pct, html, text, words, count, best, pos, total, counts, next, raw, held, old, i, result, options;
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
    let page, dl, repo, gh, doc, stage, file;
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
