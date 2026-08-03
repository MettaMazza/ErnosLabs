// Auto-generated JavaScript from ErnosPlain

function rpg_capture(line) {
    let buf;
    buf = window.epRpgLines;
    if (buf) {
        buf.push(line);
    }
    return 0;
}

function rpg_run(ev) {
    let btn, out, lines;
    out = document.getElementById("rpg-out");
    if (!out) {
        return 0;
    }
    if (!window.epRpgBattle) {
        out.textContent = "Battle engine not loaded.";
        return 0;
    }
    lines = [];
    window.epRpgLines = lines;
    window.epRpgOrig = console.log;
    console.log = rpg_capture;
    window.epRpgBattle();
    console.log = window.epRpgOrig;
    out.textContent = lines.join("\n");
    out.scrollTop = 0;
    btn = document.getElementById("rpg-go");
    if (btn) {
        btn.textContent = "⚔ Fight again";
    }
    return 0;
}

function rpg_init() {
    let btn;
    btn = document.getElementById("rpg-go");
    if (btn) {
        btn.addEventListener("click", rpg_run);
    }
    return 0;
}

function main() {
    rpg_init();
    return 0;
}

main();
