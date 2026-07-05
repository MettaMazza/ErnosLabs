// Auto-generated JavaScript from ErnosPlain

function new_obj() {
    return JSON.parse("{}");
}

function sub(name, what) {
    let s;
    s = new_obj();
    s.name = name;
    s.what = what;
    return s;
}

function subsystems() {
    let l;
    l = [];
    l.push(sub("decent_id", "Cryptographic identity — Ed25519 keys, W3C DIDs, capability delegation."));
    l.push(sub("decent_net", "P2P networking — Noise handshakes, Kademlia DHT, NAT-traversal relays."));
    l.push(sub("decent_money", "HD wallets, a UTXO ledger, Proof-of-Stake, and a hybrid AMM/orderbook DEX."));
    l.push(sub("decent_store", "Content-addressed storage with BLAKE3, dedup, and CRDT sync."));
    l.push(sub("decent_msg", "End-to-end encrypted direct and group messaging."));
    l.push(sub("decent_social", "Federated publishing over Nostr and ActivityPub."));
    l.push(sub("decent_consensus", "Raft — leader election, replicated log, state rollback."));
    l.push(sub("decent_anon", "Onion routing and a mixnet for traffic-analysis resistance."));
    l.push(sub("decent_ai", "Local inference, embeddings, speech-to-text, and TTS."));
    l.push(sub("decent_agent", "A ReAct agent — 9 guarded tools, tiered + Hebbian memory, a fail-closed observer audit, a provider router, and a Socratic tutor mode."));
    l.push(sub("decent_search", "A distributed crawler with BM25 + PageRank ranking."));
    l.push(sub("decent_name", "Decentralised names — a .decent registry resolved via the DHT."));
    l.push(sub("decent_pool", "Resource pooling — bandwidth tiers, a compute job queue, the symbiotic mesh."));
    l.push(sub("decent_media", "Voice and video — Opus + VP8 over the mesh, no media server."));
    l.push(sub("decent_host", "Decentralised hosting — publish sites and apps straight from nodes."));
    l.push(sub("decent_web", "The node's own dashboard — a full web UI served from the daemon."));
    l.push(sub("decent_cli", "The local control client — drive every subsystem from the terminal."));
    return l;
}

function draw_subs() {
    let card, s, j, i, subs, html, fn, host, cards;
    host = document.getElementById("subs");
    if (!host) {
        return 0;
    }
    subs = subsystems();
    html = "";
    i = 0;
    while ((i < subs.length)) {
        s = subs[i];
        html = (html + (((((("<div class=\"sub-card\" data-name=\"" + String(s.name)) + "\"><code>") + String(s.name)) + "</code><p>") + String(s.what)) + "</p></div>"));
        i = (i + 1);
    }
    host.innerHTML = html;
    cards = document.querySelectorAll(".sub-card");
    fn = Reflect["set"];
    j = 0;
    while ((j < cards.length)) {
        card = cards[j];
        card.addEventListener("click", sub_card_click);
        j = (j + 1);
    }
    return 0;
}

function sub_card_click(ev) {
    let name, archSection, nameEl, descs, target, descEl, desc;
    target = ev.currentTarget;
    name = target.getAttribute("data-name");
    archSection = document.getElementById("arch-canvas");
    if (archSection) {
        archSection.scrollIntoView();
    }
    descs = arch_descriptions();
    desc = descs[name];
    if (desc) {
        nameEl = document.getElementById("arch-name");
        descEl = document.getElementById("arch-desc");
        nameEl.textContent = name;
        descEl.textContent = desc;
    }
    window.archHighlight = name;
    draw_arch();
    return 0;
}

function hex2(n) {
    let s;
    s = n.toString(16);
    if ((s.length < 2)) {
        return ("0" + s);
    }
    return s;
}

function mesh_build() {
    let nodes, nd, count, i, ang;
    nodes = [];
    count = 14;
    i = 0;
    while ((i < count)) {
        nd = new_obj();
        nd.id = Math.floor((Math.random() * 256));
        ang = ((6.2831852999999995 * i) / count);
        nd.x = (190 + (150 * Math.cos(ang)));
        nd.y = (190 + (150 * Math.sin(ang)));
        nodes.push(nd);
        i = (i + 1);
    }
    window.meshNodes = nodes;
    window.meshPath = [];
    return 0;
}

function mesh_render() {
    let a, b, dpr, k, nd, ctx, xor, n, i, nodes, path, j, canvas, on_path, size;
    canvas = document.getElementById("dht-canvas");
    if (!canvas) {
        return 0;
    }
    nodes = window.meshNodes;
    dpr = (window.devicePixelRatio || 1);
    size = 380;
    canvas.width = (size * dpr);
    canvas.height = (size * dpr);
    canvas.style.width = (String(size) + "px");
    canvas.style.height = (String(size) + "px");
    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    n = nodes.length;
    i = 0;
    while ((i < n)) {
        a = nodes[i];
        j = (i + 1);
        while ((j < n)) {
            b = nodes[j];
            xor = bitxor(a.id, b.id);
            if ((xor < 64)) {
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = "rgba(124,140,255,0.18)";
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            j = (j + 1);
        }
        i = (i + 1);
    }
    path = window.meshPath;
    if ((path.length > 1)) {
        ctx.beginPath();
        k = 0;
        while ((k < path.length)) {
            nd = nodes[path[k]];
            if ((k === 0)) {
                ctx.moveTo(nd.x, nd.y);
            } else {
                ctx.lineTo(nd.x, nd.y);
            }
            k = (k + 1);
        }
        ctx.strokeStyle = "rgba(79,240,196,0.95)";
        ctx.lineWidth = 2.4;
        ctx.stroke();
    }
    i = 0;
    while ((i < n)) {
        nd = nodes[i];
        on_path = (index_in(path, i) >= 0);
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, 13, 0, 6.2832);
        if (on_path) {
            ctx.fillStyle = "#4ff0c4";
        } else {
            ctx.fillStyle = "#161d2c";
        }
        ctx.fill();
        ctx.strokeStyle = "rgba(124,140,255,0.55)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#b7c2d6";
        ctx.font = "10px JetBrains Mono, monospace";
        ctx.fillText(hex2(nd.id), (nd.x - 8), (nd.y + 3));
        i = (i + 1);
    }
    return 0;
}

function index_in(arr, v) {
    let i;
    i = 0;
    while ((i < arr.length)) {
        if ((arr[i] === v)) {
            return i;
        }
        i = (i + 1);
    }
    return (0 - 1);
}

function bitxor(a, b) {
    let place, result, bbit, abit;
    result = 0;
    place = 1;
    while (((a > 0) || (b > 0))) {
        abit = (a % 2);
        bbit = (b % 2);
        if ((abit !== bbit)) {
            result = (result + place);
        }
        a = Math.floor((a / 2));
        b = Math.floor((b / 2));
        place = (place * 2);
    }
    return result;
}

function mesh_route() {
    let best_d, n, guard, cur_id, j, d, best, cand, nodes, current, src, target, path;
    nodes = window.meshNodes;
    n = nodes.length;
    src = Math.floor((Math.random() * n));
    target = nodes[Math.floor((Math.random() * n))].id;
    path = [];
    path.push(src);
    current = src;
    guard = 0;
    while ((guard < 32)) {
        cur_id = nodes[current].id;
        best_d = bitxor(cur_id, target);
        best = current;
        j = 0;
        while ((j < n)) {
            cand = nodes[j].id;
            d = bitxor(cand, target);
            if ((d < best_d)) {
                best_d = d;
                best = j;
            }
            j = (j + 1);
        }
        if ((best === current)) {
            window.meshPath = path;
            mesh_render();
            mesh_status(path, target);
            return 0;
        }
        path.push(best);
        current = best;
        guard = (guard + 1);
    }
    window.meshPath = path;
    mesh_render();
    mesh_status(path, target);
    return 0;
}

function mesh_status(path, target) {
    let hops, el;
    el = document.getElementById("dht-status");
    if (!el) {
        return 0;
    }
    hops = (path.length - 1);
    el.innerHTML = (((("FIND_NODE → target <b>0x" + String(hex2(target))) + "</b> · resolved in <b>") + String(hops)) + "</b> hop(s) via XOR distance");
    return 0;
}

function heb_concepts() {
    return ["identity", "ledger", "DHT", "consensus", "AI", "storage", "messaging", "privacy"];
}

function heb_init() {
    let names, n, i, nodes, nd, ang;
    names = heb_concepts();
    nodes = [];
    n = names.length;
    i = 0;
    while ((i < n)) {
        nd = new_obj();
        nd.name = names[i];
        ang = (((6.2831852999999995 * i) / n) - 1.5707963);
        nd.x = (190 + (140 * Math.cos(ang)));
        nd.y = (175 + (140 * Math.sin(ang)));
        nodes.push(nd);
        i = (i + 1);
    }
    window.hebNodes = nodes;
    window.hebW = new_obj();
    window.hebSel = (0 - 1);
    return 0;
}

function heb_key(a, b) {
    if ((a < b)) {
        return ((String(a) + "-") + String(b));
    }
    return ((String(b) + "-") + String(a));
}

function heb_get(a, b) {
    let w, k;
    k = heb_key(a, b);
    w = window.hebW[k];
    if (w) {
        return w;
    }
    return 0;
}

function heb_set(a, b, v) {
    let fn;
    fn = Reflect["set"];
    fn.call(Reflect, window.hebW, heb_key(a, b), v);
    return 0;
}

function heb_reinforce(a, b) {
    let w;
    w = heb_get(a, b);
    if ((w === 0)) {
        w = 0.1;
    } else {
        w = (w + (0.1 * (1 - w)));
    }
    heb_set(a, b, w);
    return 0;
}

function heb_sweep() {
    let i, j, n, w, nodes;
    nodes = window.hebNodes;
    n = nodes.length;
    i = 0;
    while ((i < n)) {
        j = (i + 1);
        while ((j < n)) {
            w = heb_get(i, j);
            if ((w > 0)) {
                if ((w < 0.99)) {
                    w = (w * 0.95);
                    if ((w < 0.01)) {
                        w = 0;
                    }
                    heb_set(i, j, w);
                }
            }
            j = (j + 1);
        }
        i = (i + 1);
    }
    heb_render();
    return 0;
}

function heb_render() {
    let j, canvas, size, n, ctx, w, dpr, a, nodes, i, sel, nd, b;
    canvas = document.getElementById("heb-canvas");
    if (!canvas) {
        return 0;
    }
    nodes = window.hebNodes;
    n = nodes.length;
    dpr = (window.devicePixelRatio || 1);
    size = 380;
    canvas.width = (size * dpr);
    canvas.height = (size * dpr);
    canvas.style.width = (String(size) + "px");
    canvas.style.height = (String(size) + "px");
    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    i = 0;
    while ((i < n)) {
        a = nodes[i];
        j = (i + 1);
        while ((j < n)) {
            w = heb_get(i, j);
            if ((w > 0)) {
                b = nodes[j];
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                if ((w >= 0.99)) {
                    ctx.strokeStyle = (("rgba(245,196,94," + String((0.4 + (0.6 * w)))) + ")");
                } else {
                    ctx.strokeStyle = (("rgba(79,240,196," + String((0.15 + (0.7 * w)))) + ")");
                }
                ctx.lineWidth = (1 + (6 * w));
                ctx.stroke();
            }
            j = (j + 1);
        }
        i = (i + 1);
    }
    sel = window.hebSel;
    i = 0;
    while ((i < n)) {
        nd = nodes[i];
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, 16, 0, 6.2832);
        if ((i === sel)) {
            ctx.fillStyle = "#7c8cff";
        } else {
            ctx.fillStyle = "#1d2638";
        }
        ctx.fill();
        ctx.strokeStyle = "rgba(79,240,196,0.6)";
        ctx.stroke();
        ctx.fillStyle = "#eef3fb";
        ctx.font = "11px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(nd.name, nd.x, (nd.y + 30));
        i = (i + 1);
    }
    return 0;
}

function heb_click(ev) {
    let my, canvas, i, nodes, sel, dy, mx, dx, nd, rect, n, hit;
    canvas = document.getElementById("heb-canvas");
    rect = canvas.getBoundingClientRect();
    mx = (ev.clientX - rect.left);
    my = (ev.clientY - rect.top);
    nodes = window.hebNodes;
    n = nodes.length;
    hit = (0 - 1);
    i = 0;
    while ((i < n)) {
        nd = nodes[i];
        dx = (nd.x - mx);
        dy = (nd.y - my);
        if ((((dx * dx) + (dy * dy)) < 360)) {
            hit = i;
        }
        i = (i + 1);
    }
    if ((hit < 0)) {
        return 0;
    }
    sel = window.hebSel;
    if ((sel < 0)) {
        window.hebSel = hit;
    } else if ((sel === hit)) {
        window.hebSel = (0 - 1);
    } else {
        heb_reinforce(sel, hit);
        window.hebSel = (0 - 1);
    }
    heb_render();
    return 0;
}

function raft_init() {
    let nodes, i, nd;
    nodes = [];
    i = 0;
    while ((i < 5)) {
        nd = new_obj();
        nd.id = i;
        nd.state = "follower";
        nd.term = 0;
        nd.up = true;
        nodes.push(nd);
        i = (i + 1);
    }
    window.raftNodes = nodes;
    window.raftLog = [];
    raft_log("cluster started — 5 followers, no leader");
    return 0;
}

function raft_leader() {
    let nodes, i, nd;
    nodes = window.raftNodes;
    i = 0;
    while ((i < nodes.length)) {
        nd = nodes[i];
        if ((nd.state === "leader")) {
            if (nd.up) {
                return i;
            }
        }
        i = (i + 1);
    }
    return (0 - 1);
}

function raft_count_up() {
    let nodes, i, c;
    nodes = window.raftNodes;
    c = 0;
    i = 0;
    while ((i < nodes.length)) {
        if (nodes[i].up) {
            c = (c + 1);
        }
        i = (i + 1);
    }
    return c;
}

function raft_step() {
    let i, lt, cand, newterm, c, votes, nd, leader, nodes, needed;
    nodes = window.raftNodes;
    leader = raft_leader();
    if ((leader >= 0)) {
        lt = nodes[leader];
        raft_log((((("leader N" + String(leader)) + " (term ") + String(lt.term)) + ") → heartbeat to followers"));
        raft_render();
        return 0;
    }
    cand = raft_pick_up();
    if ((cand < 0)) {
        raft_log("no nodes up — cluster unavailable");
        raft_render();
        return 0;
    }
    c = nodes[cand];
    newterm = (c.term + 1);
    i = 0;
    while ((i < nodes.length)) {
        nd = nodes[i];
        if (nd.up) {
            nd.term = newterm;
            nd.state = "follower";
        }
        i = (i + 1);
    }
    c.state = "candidate";
    votes = raft_count_up();
    needed = 3;
    raft_log((((("N" + String(cand)) + " times out → candidate, term ") + String(newterm)) + ", requests votes"));
    if ((votes >= needed)) {
        c.state = "leader";
        raft_log(((((("N" + String(cand)) + " wins ") + String(votes)) + "/5 votes → LEADER for term ") + String(newterm)));
    } else {
        raft_log((("only " + String(votes)) + "/5 reachable — no majority, retry"));
    }
    raft_render();
    return 0;
}

function raft_pick_up() {
    let tries, nodes, k;
    nodes = window.raftNodes;
    tries = 0;
    while ((tries < 20)) {
        k = Math.floor((Math.random() * nodes.length));
        if (nodes[k].up) {
            return k;
        }
        tries = (tries + 1);
    }
    return (0 - 1);
}

function raft_partition() {
    let a, b, nodes;
    nodes = window.raftNodes;
    a = nodes[3];
    b = nodes[4];
    if (a.up) {
        a.up = false;
        b.up = false;
        if ((a.state === "leader")) {
            a.state = "follower";
        }
        if ((b.state === "leader")) {
            b.state = "follower";
        }
        raft_log("partition! N3 and N4 isolated from the cluster");
    } else {
        a.up = true;
        b.up = true;
        raft_log("partition healed — N3 and N4 rejoin");
    }
    raft_render();
    return 0;
}

function raft_render() {
    let html, k, shown, lines, i, logel, host, nd, out, nodes, cls, label;
    host = document.getElementById("raft-nodes");
    if (!host) {
        return 0;
    }
    nodes = window.raftNodes;
    html = "";
    i = 0;
    while ((i < nodes.length)) {
        nd = nodes[i];
        cls = nd.state;
        if (!nd.up) {
            cls = "down";
        }
        label = nd.state;
        if (!nd.up) {
            label = "unreachable";
        }
        html = (html + (((((((("<div class=\"raft-node " + String(cls)) + "\"><div class=\"rn-id\">N") + String(nd.id)) + "</div><div class=\"rn-state\">") + String(label)) + "</div><div class=\"rn-term\">term ") + String(nd.term)) + "</div></div>"));
        i = (i + 1);
    }
    host.innerHTML = html;
    logel = document.getElementById("raft-log");
    lines = window.raftLog;
    out = "";
    k = (lines.length - 1);
    shown = 0;
    while ((k >= 0)) {
        if ((shown < 6)) {
            out = ((out + lines[k]) + "\n");
            shown = (shown + 1);
        }
        k = (k - 1);
    }
    logel.textContent = out;
    return 0;
}

function raft_log(msg) {
    window.raftLog.push(msg);
    return 0;
}

function draw_stats() {
    let lb, v, stats, html, i, labels, host;
    host = document.getElementById("stats-banner");
    if (!host) {
        return 0;
    }
    stats = [];
    stats.push("17");
    stats.push("~43k");
    stats.push("94");
    stats.push("0");
    stats.push("1");
    labels = [];
    labels.push("subsystems · 103 modules");
    labels.push("lines of Ernos (30.3k source + 12.7k tests)");
    labels.push("per-subsystem test suites");
    labels.push("platform dependencies");
    labels.push("single binary — v1.0.0-beta");
    html = "";
    i = 0;
    while ((i < stats.length)) {
        v = stats[i];
        lb = labels[i];
        html = (html + (((("<div class=\"stat-item\"><span class=\"stat-num\">" + String(v)) + "</span><span class=\"stat-label\">") + String(lb)) + "</span></div>"));
        i = (i + 1);
    }
    host.innerHTML = html;
    return 0;
}

function arch_descriptions() {
    let fn, d;
    d = new_obj();
    fn = Reflect["set"];
    fn.call(Reflect, d, "decent_id", "Cryptographic identity — Ed25519 keypairs, W3C DIDs, and capability-based delegation. The foundation everything else trusts.");
    fn.call(Reflect, d, "decent_net", "P2P networking — Noise-protocol encrypted handshakes, Kademlia DHT for peer discovery, and NAT-traversal relays.");
    fn.call(Reflect, d, "decent_relay", "Relay infrastructure — circuit relays and hole-punching helpers for peers behind restrictive NATs.");
    fn.call(Reflect, d, "decent_store", "Content-addressed storage with BLAKE3 hashing, automatic deduplication, and CRDT-based sync.");
    fn.call(Reflect, d, "decent_name", "Decentralised naming — a .decent registry resolved via DHT, mapping human-readable names to DIDs.");
    fn.call(Reflect, d, "decent_consensus", "Raft consensus — leader election, replicated log, term-based voting, and state rollback.");
    fn.call(Reflect, d, "decent_money", "HD wallets, a UTXO ledger, Proof-of-Stake consensus, and a hybrid AMM/orderbook DEX.");
    fn.call(Reflect, d, "decent_msg", "End-to-end encrypted direct and group messaging using Signal-style ratchets.");
    fn.call(Reflect, d, "decent_social", "Federated publishing over Nostr and ActivityPub — your posts live where you choose.");
    fn.call(Reflect, d, "decent_ai", "Local inference, embeddings, speech-to-text, and TTS — all on-device, no cloud.");
    fn.call(Reflect, d, "decent_agent", "A ReAct agent with tiered memory, Hebbian learning, and an observer gate for reflective reasoning.");
    fn.call(Reflect, d, "decent_search", "A distributed crawler with BM25 + PageRank ranking — web search without a search engine.");
    fn.call(Reflect, d, "decent_anon", "Onion routing and a mixnet for traffic-analysis resistance — metadata privacy by design.");
    return d;
}

function draw_arch() {
    let mi, gap, modGap, leftMargin, modName, regions, li, region, modCount, lw, cw, my, ly, r, highlight, lh, dpr, layerLabels, mods, ch, mr, layerMods, ctx, mh, mx, modsStr, layerColor, canvas, colors, rightMargin, totalH, modW, layerCount, lx, startY;
    canvas = document.getElementById("arch-canvas");
    if (!canvas) {
        return 0;
    }
    dpr = (window.devicePixelRatio || 1);
    cw = 700;
    ch = 420;
    canvas.width = (cw * dpr);
    canvas.height = (ch * dpr);
    canvas.style.width = (String(cw) + "px");
    canvas.style.height = (String(ch) + "px");
    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    colors = [];
    colors.push("rgba(124,140,255,0.35)");
    colors.push("rgba(79,240,196,0.30)");
    colors.push("rgba(43,191,155,0.30)");
    colors.push("rgba(245,196,94,0.25)");
    colors.push("rgba(255,138,107,0.25)");
    colors.push("rgba(124,140,255,0.25)");
    colors.push("rgba(255,107,129,0.25)");
    layerLabels = [];
    layerLabels.push("Crypto");
    layerLabels.push("Network");
    layerLabels.push("Storage");
    layerLabels.push("Consensus");
    layerLabels.push("Comms");
    layerLabels.push("Intelligence");
    layerLabels.push("Privacy");
    layerMods = [];
    layerMods.push("decent_id");
    layerMods.push("decent_net,decent_relay");
    layerMods.push("decent_store,decent_name");
    layerMods.push("decent_consensus,decent_money");
    layerMods.push("decent_msg,decent_social");
    layerMods.push("decent_ai,decent_agent,decent_search");
    layerMods.push("decent_anon");
    highlight = (window.archHighlight || "");
    lh = 48;
    gap = 4;
    leftMargin = 90;
    rightMargin = 20;
    layerCount = 7;
    totalH = ((layerCount * lh) + ((layerCount - 1) * gap));
    startY = ((ch - 30) - totalH);
    regions = [];
    li = 0;
    while ((li < layerCount)) {
        ly = (startY + (((layerCount - 1) - li) * (lh + gap)));
        lx = leftMargin;
        lw = ((cw - leftMargin) - rightMargin);
        layerColor = colors[li];
        ctx.beginPath();
        r = 10;
        ctx.moveTo((lx + r), ly);
        ctx.lineTo(((lx + lw) - r), ly);
        ctx.quadraticCurveTo((lx + lw), ly, (lx + lw), (ly + r));
        ctx.lineTo((lx + lw), ((ly + lh) - r));
        ctx.quadraticCurveTo((lx + lw), (ly + lh), ((lx + lw) - r), (ly + lh));
        ctx.lineTo((lx + r), (ly + lh));
        ctx.quadraticCurveTo(lx, (ly + lh), lx, ((ly + lh) - r));
        ctx.lineTo(lx, (ly + r));
        ctx.quadraticCurveTo(lx, ly, (lx + r), ly);
        ctx.closePath();
        ctx.fillStyle = layerColor;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#515d75";
        ctx.font = "11px JetBrains Mono, monospace";
        ctx.textAlign = "right";
        ctx.fillText(layerLabels[li], (lx - 10), ((ly + (lh / 2)) + 4));
        modsStr = layerMods[li];
        mods = modsStr.split(",");
        modCount = mods.length;
        modGap = 8;
        modW = ((lw - ((modCount + 1) * modGap)) / modCount);
        mi = 0;
        while ((mi < modCount)) {
            mx = ((lx + modGap) + (mi * (modW + modGap)));
            my = (ly + 8);
            mh = (lh - 16);
            modName = mods[mi].trim();
            region = new_obj();
            region.x = mx;
            region.y = my;
            region.w = modW;
            region.h = mh;
            region.name = modName;
            regions.push(region);
            ctx.beginPath();
            mr = 6;
            ctx.moveTo((mx + mr), my);
            ctx.lineTo(((mx + modW) - mr), my);
            ctx.quadraticCurveTo((mx + modW), my, (mx + modW), (my + mr));
            ctx.lineTo((mx + modW), ((my + mh) - mr));
            ctx.quadraticCurveTo((mx + modW), (my + mh), ((mx + modW) - mr), (my + mh));
            ctx.lineTo((mx + mr), (my + mh));
            ctx.quadraticCurveTo(mx, (my + mh), mx, ((my + mh) - mr));
            ctx.lineTo(mx, (my + mr));
            ctx.quadraticCurveTo(mx, my, (mx + mr), my);
            ctx.closePath();
            if ((modName === highlight)) {
                ctx.fillStyle = "rgba(79,240,196,0.35)";
                ctx.strokeStyle = "#4ff0c4";
                ctx.lineWidth = 2;
            } else {
                ctx.fillStyle = "rgba(15,20,32,0.7)";
                ctx.strokeStyle = "rgba(255,255,255,0.12)";
                ctx.lineWidth = 1;
            }
            ctx.fill();
            ctx.stroke();
            if ((modName === highlight)) {
                ctx.fillStyle = "#4ff0c4";
            } else {
                ctx.fillStyle = "#b7c2d6";
            }
            ctx.font = "11px JetBrains Mono, monospace";
            ctx.textAlign = "center";
            ctx.fillText(modName, (mx + (modW / 2)), ((my + (mh / 2)) + 4));
            mi = (mi + 1);
        }
        li = (li + 1);
    }
    window.archRegions = regions;
    return 0;
}

function arch_click(ev) {
    let nameEl, rect, regions, descEl, scaleX, canvas, i, descs, mx, scaleY, r, desc, my;
    canvas = document.getElementById("arch-canvas");
    rect = canvas.getBoundingClientRect();
    mx = (ev.clientX - rect.left);
    my = (ev.clientY - rect.top);
    scaleX = (700 / rect.width);
    scaleY = (420 / rect.height);
    mx = (mx * scaleX);
    my = (my * scaleY);
    regions = window.archRegions;
    if (!regions) {
        return 0;
    }
    i = 0;
    while ((i < regions.length)) {
        r = regions[i];
        if ((mx >= r.x)) {
            if ((mx <= (r.x + r.w))) {
                if ((my >= r.y)) {
                    if ((my <= (r.y + r.h))) {
                        window.archHighlight = r.name;
                        draw_arch();
                        descs = arch_descriptions();
                        desc = descs[r.name];
                        nameEl = document.getElementById("arch-name");
                        descEl = document.getElementById("arch-desc");
                        nameEl.textContent = r.name;
                        if (desc) {
                            descEl.textContent = desc;
                        } else {
                            descEl.textContent = "No description available.";
                        }
                        return 0;
                    }
                }
            }
        }
        i = (i + 1);
    }
    return 0;
}

function draw_flow() {
    let html, i, host, label, desc, sub, stages, stageLabels, stageDescs;
    host = document.getElementById("flow-vis");
    if (!host) {
        return 0;
    }
    stages = [];
    stages.push("decent_id");
    stages.push("decent_net");
    stages.push("decent_msg");
    stages.push("decent_store");
    stages.push("decent_msg");
    stageLabels = [];
    stageLabels.push("Identity");
    stageLabels.push("Route");
    stageLabels.push("Encrypt");
    stageLabels.push("Store");
    stageLabels.push("Deliver");
    stageDescs = [];
    stageDescs.push("Alice signs with her Ed25519 key");
    stageDescs.push("DHT locates Bob's nearest peer");
    stageDescs.push("Message encrypted end-to-end");
    stageDescs.push("Stored on-path for offline pickup");
    stageDescs.push("Bob decrypts with his key");
    html = "";
    i = 0;
    while ((i < stages.length)) {
        label = stageLabels[i];
        desc = stageDescs[i];
        sub = stages[i];
        if ((i > 0)) {
            html = (html + "<div class=\"flow-arrow\">→</div>");
        }
        html = (html + (((((((((("<div class=\"flow-stage\" data-idx=\"" + String(i)) + "\"><div class=\"flow-stage-num\">") + String((i + 1))) + "</div><div class=\"flow-stage-label\">") + String(label)) + "</div><div class=\"flow-stage-desc\">") + String(desc)) + "</div><code class=\"flow-stage-sub\">") + String(sub)) + "</code></div>"));
        i = (i + 1);
    }
    host.innerHTML = html;
    return 0;
}

function flow_play() {
    let stages, i;
    stages = document.querySelectorAll(".flow-stage");
    i = 0;
    while ((i < stages.length)) {
        stages[i].classList.remove("active");
        i = (i + 1);
    }
    flow_activate(0);
    return 0;
}

function flow_activate(idx) {
    let stages, next, cb;
    stages = document.querySelectorAll(".flow-stage");
    if ((idx >= stages.length)) {
        return 0;
    }
    stages[idx].classList.add("active");
    next = (idx + 1);
    if ((next < stages.length)) {
        cb = flow_next_factory(next);
        window.setTimeout(cb, 600);
    }
    return 0;
}

function flow_next_factory(idx) {
    let callback, wrapper, fn;
    fn = Reflect["set"];
    wrapper = new_obj();
    fn.call(Reflect, wrapper, "idx", idx);
    callback = make_flow_cb(wrapper);
    return callback;
}

function make_flow_cb(wrapper) {
    let fn;
    fn = Function("wrapper", "return function(){ flow_activate(wrapper.idx); }");
    return fn(wrapper);
}

function flow_ev(ev) {
    flow_play();
    return 0;
}

function fmt(x, places) {
    return Number(x).toFixed(places);
}

function amm_update(ev) {
    let got, amt, lbl, new_y, y0, impact, new_x, k, spot, x0, eff, host, html;
    x0 = 10000;
    y0 = 10000;
    k = (x0 * y0);
    amt = Number(document.getElementById("amm-in").value);
    lbl = document.getElementById("amm-in-label");
    lbl.textContent = amt;
    new_x = (x0 + amt);
    new_y = (k / new_x);
    got = (y0 - new_y);
    spot = (y0 / x0);
    eff = (got / amt);
    impact = ((1 - (eff / spot)) * 100);
    host = document.getElementById("amm-out");
    html = (((((("<div class=\"g-row\"><span>pool before</span><b>" + String(x0)) + " X · ") + String(y0)) + " Y</b><em>k = x·y = ") + String(k)) + "</em></div>");
    html = (html + (("<div class=\"g-row\"><span>you swap in</span><b>" + String(amt)) + " X</b><em></em></div>"));
    html = (html + (((("<div class=\"g-row\"><span>you receive</span><b>" + String(fmt(got, 1))) + " Y</b><em>k stays exactly ") + String(k)) + "</em></div>"));
    html = (html + (("<div class=\"g-row\"><span>price impact</span><b>" + String(fmt(impact, 2))) + "%</b><em>bigger swaps bend the curve</em></div>"));
    host.innerHTML = html;
    return 0;
}

function roll_hash(s, mult) {
    let i, h;
    h = 5381;
    i = 0;
    while ((i < s.length)) {
        h = (((h * mult) + s.charCodeAt(i)) % 4294967296);
        i = (i + 1);
    }
    return h;
}

function cas_addr(s) {
    let h1, h2;
    h1 = roll_hash(s, 31);
    h2 = roll_hash(s, 131);
    return ((h1.toString(16) + "-") + h2.toString(16));
}

function cas_update(ev) {
    let addr, text, ta, store, host, dedup, html;
    ta = document.getElementById("cas-in");
    text = ta.value;
    addr = cas_addr(text);
    host = document.getElementById("cas-out");
    store = window.casStore;
    dedup = "";
    if ((store.indexOf(addr) >= 0)) {
        dedup = "<div class=\"g-row\"><span>store says</span><b>already have it</b><em>same content = same address = stored once</em></div>";
    } else {
        store.push(addr);
    }
    html = (("<div class=\"g-row\"><span>content address</span><b class=\"mono\">" + String(addr)) + "</b><em>the address IS the content</em></div>");
    html = (html + (("<div class=\"g-row\"><span>unique blocks stored</span><b>" + String(store.length)) + "</b><em>change one letter and the address changes completely</em></div>"));
    html = (html + dedup);
    host.innerHTML = html;
    return 0;
}

function main() {
    let ac, rb, hc;
    draw_stats();
    draw_subs();
    if (document.getElementById("amm-in")) {
        document.getElementById("amm-in").addEventListener("input", amm_update);
        amm_update(false);
    }
    if (document.getElementById("cas-in")) {
        window.casStore = [];
        document.getElementById("cas-in").addEventListener("input", cas_update);
        cas_update(false);
    }
    if (document.getElementById("arch-canvas")) {
        window.archHighlight = "";
        draw_arch();
        ac = document.getElementById("arch-canvas");
        ac.addEventListener("click", arch_click);
    }
    draw_flow();
    if (document.getElementById("flow-play")) {
        document.getElementById("flow-play").addEventListener("click", flow_ev);
    }
    if (document.getElementById("dht-canvas")) {
        mesh_build();
        mesh_render();
        rb = document.getElementById("dht-route");
        if (rb) {
            rb.addEventListener("click", route_ev);
        }
        mesh_route();
    }
    if (document.getElementById("heb-canvas")) {
        heb_init();
        heb_render();
        hc = document.getElementById("heb-canvas");
        hc.addEventListener("click", heb_click);
        document.getElementById("heb-sweep").addEventListener("click", sweep_ev);
    }
    if (document.getElementById("raft-nodes")) {
        raft_init();
        raft_render();
        document.getElementById("raft-step").addEventListener("click", raft_step_ev);
        document.getElementById("raft-part").addEventListener("click", raft_part_ev);
    }
    return 0;
}

function route_ev(ev) {
    mesh_route();
    return 0;
}

function sweep_ev(ev) {
    heb_sweep();
    return 0;
}

function raft_step_ev(ev) {
    raft_step();
    return 0;
}

function raft_part_ev(ev) {
    raft_partition();
    return 0;
}

main();
