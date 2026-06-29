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
    l.push(sub("decent_agent", "A ReAct agent with tiered + Hebbian memory and an observer gate."));
    l.push(sub("decent_search", "A distributed crawler with BM25 + PageRank ranking."));
    l.push(sub("decent_name", "Decentralised names — a .decent registry resolved via the DHT."));
    return l;
}

function draw_subs() {
    let host, i, subs, s, html;
    host = document.getElementById("subs");
    if (!host) {
        return 0;
    }
    subs = subsystems();
    html = "";
    i = 0;
    while ((i < subs.length)) {
        s = subs[i];
        html = (html + (((("<div class=\"sub-card\"><code>" + String(s.name)) + "</code><p>") + String(s.what)) + "</p></div>"));
        i = (i + 1);
    }
    host.innerHTML = html;
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
    let ang, count, nd, i, nodes;
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
    let b, on_path, dpr, path, k, nd, n, xor, nodes, a, canvas, size, i, j, ctx;
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
    let result, place, abit, bbit;
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
    let current, guard, cur_id, best_d, j, n, d, nodes, src, cand, best, path, target;
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
    let el, hops;
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
    let nodes, names, ang, nd, n, i;
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
    let k, w;
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
    let w, j, i, n, nodes;
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
    let w, ctx, dpr, j, sel, nodes, a, canvas, n, size, b, i, nd;
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
    let canvas, i, nd, hit, dy, sel, dx, nodes, my, n, mx, rect;
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
    let nd, nodes, i;
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
    let nodes, c, i;
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
    let needed, nd, nodes, c, votes, leader, i, cand, newterm, lt;
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
    let k, nodes, tries;
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
    let b, nodes, a;
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
    let label, k, lines, i, shown, host, nodes, html, logel, out, nd, cls;
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

function main() {
    let rb, hc;
    draw_subs();
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
