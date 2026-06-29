// Auto-generated JavaScript from ErnosPlain

function ex(name, blurb, code) {
    let e;
    e = JSON.parse("{}");
    e.name = name;
    e.blurb = blurb;
    e.code = code;
    return e;
}

function examples() {
    let list;
    list = [];
    list.push(ex("Hello world", "The classic, in plain English.", "# Your first ErnosPlain program.\n# Press Run — the output appears on the right.\ndefine main:\n    display \"Hello, world!\"\n    return 0"));
    list.push(ex("Greeting", "Functions, text, f-strings.", "define greet with name returning Str:\n    return f\"Hello, {name}!\"\n\ndefine main:\n    display greet(\"Maria\")\n    display greet(\"world\")\n    return 0"));
    list.push(ex("Factorial", "Recursion with a return value.", "define factorial with n:\n    if n is less than 2:\n        return 1\n    return n times factorial(n minus 1)\n\ndefine main:\n    display \"5! =\"\n    display factorial(5)\n    return 0"));
    list.push(ex("Fibonacci", "Recursion + a counting loop.", "define fib with n:\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\ndefine main:\n    set i to 0\n    repeat while i <= 12:\n        display fib(i)\n        set i to i + 1\n    return 0"));
    list.push(ex("FizzBuzz", "else-if chains and modulo.", "define main:\n    set i to 1\n    repeat while i <= 20:\n        if i % 15 == 0:\n            display \"FizzBuzz\"\n        else if i % 3 == 0:\n            display \"Fizz\"\n        else if i % 5 == 0:\n            display \"Buzz\"\n        else:\n            display i\n        set i to i + 1\n    return 0"));
    list.push(ex("Primes", "Nested loops, booleans.", "define is_prime with n:\n    if n < 2:\n        return false\n    set d to 2\n    repeat while d * d <= n:\n        if n % d == 0:\n            return false\n        set d to d + 1\n    return true\n\ndefine main:\n    display \"primes up to 40:\"\n    set i to 2\n    repeat while i <= 40:\n        if is_prime(i):\n            display i\n        set i to i + 1\n    return 0"));
    list.push(ex("Lists", "Lists, for-each, f-strings.", "define main:\n    set nums to [3, 1, 4, 1, 5, 9, 2, 6]\n    set total to 0\n    set biggest to 0\n    for each x in nums:\n        set total to total + x\n        if x is greater than biggest:\n            set biggest to x\n    display f\"count: {length_list(nums)}\"\n    display f\"sum:   {total}\"\n    display f\"max:   {biggest}\"\n    return 0"));
    return list;
}

function hl_esc(s) {
    s = s.split("&").join("&amp;");
    s = s.split("<").join("&lt;");
    s = s.split(">").join("&gt;");
    return s;
}

function hl_span(cls, text) {
    return (((("<span class=\"" + cls) + "\">") + hl_esc(text)) + "</span>");
}

function hl_is_kw(w) {
    let kws;
    kws = " define set to as returning with return if else while repeat for each in display and or not also plus minus times divided by modulo is greater less than equals true false structure field choice variant check create given of ";
    return (kws.indexOf(((" " + w) + " ")) >= 0);
}

function hl_is_digit(c) {
    if ((c >= "0")) {
        if ((c <= "9")) {
            return true;
        }
    }
    return false;
}

function hl_is_word(c) {
    let lc;
    if ((c === "_")) {
        return true;
    }
    lc = c.toLowerCase();
    if ((lc >= "a")) {
        if ((lc <= "z")) {
            return true;
        }
    }
    return hl_is_digit(c);
}

function hl(src) {
    let d, c, out, sstart, start, n, word, i;
    n = src.length;
    out = "";
    i = 0;
    while ((i < n)) {
        c = src.charAt(i);
        if ((c === "#")) {
            start = i;
            while ((i < n)) {
                if ((src.charAt(i) === "\n")) {
                    break;
                }
                i = (i + 1);
            }
            out = (out + hl_span("tok-com", src.slice(start, i)));
        } else if ((c === "\"")) {
            start = i;
            i = (i + 1);
            while ((i < n)) {
                d = src.charAt(i);
                if ((d === "\\")) {
                    i = (i + 2);
                } else {
                    i = (i + 1);
                    if ((d === "\"")) {
                        break;
                    }
                }
            }
            out = (out + hl_span("tok-str", src.slice(start, i)));
        } else if (hl_is_digit(c)) {
            start = i;
            while ((i < n)) {
                d = src.charAt(i);
                if (hl_is_digit(d)) {
                    i = (i + 1);
                } else if ((d === ".")) {
                    i = (i + 1);
                } else {
                    break;
                }
            }
            out = (out + hl_span("tok-num", src.slice(start, i)));
        } else if (hl_is_word(c)) {
            start = i;
            while ((i < n)) {
                if (hl_is_word(src.charAt(i))) {
                    i = (i + 1);
                } else {
                    break;
                }
            }
            word = src.slice(start, i);
            if ((word === "f")) {
                if ((src.charAt(i) === "\"")) {
                    sstart = i;
                    i = (i + 1);
                    while ((i < n)) {
                        d = src.charAt(i);
                        if ((d === "\\")) {
                            i = (i + 2);
                        } else {
                            i = (i + 1);
                            if ((d === "\"")) {
                                break;
                            }
                        }
                    }
                    out = (out + hl_span("tok-str", ("f" + src.slice(sstart, i))));
                } else {
                    out = (out + hl_word(word));
                }
            } else {
                out = (out + hl_word(word));
            }
        } else {
            out = (out + hl_esc(c));
            i = (i + 1);
        }
    }
    return out;
}

function hl_word(w) {
    if (hl_is_kw(w)) {
        return hl_span("tok-kw", w);
    }
    return hl_esc(w);
}

function editor_update() {
    let ta, lines, g, layer, src, i, gutter;
    ta = document.getElementById("code");
    layer = document.getElementById("code-hl");
    gutter = document.getElementById("gutter");
    src = ta.value;
    layer.innerHTML = (hl(src) + "\n");
    lines = src.split("\n");
    g = "";
    i = 0;
    while ((i < lines.length)) {
        g = ((g + to_str((i + 1))) + "\n");
        i = (i + 1);
    }
    gutter.textContent = g;
    editor_scroll();
    return 0;
}

function editor_scroll() {
    let ta, layer, gutter;
    ta = document.getElementById("code");
    layer = document.getElementById("code-hl");
    gutter = document.getElementById("gutter");
    layer.scrollTop = ta.scrollTop;
    layer.scrollLeft = ta.scrollLeft;
    gutter.scrollTop = ta.scrollTop;
    return 0;
}

function editor_keydown(ev) {
    let val, sp, epp, ta;
    if ((ev.key === "Tab")) {
        ev.preventDefault();
        ta = document.getElementById("code");
        sp = ta.selectionStart;
        epp = ta.selectionEnd;
        val = ta.value;
        ta.value = ((val.slice(0, sp) + "    ") + val.slice(epp));
        ta.selectionStart = (sp + 4);
        ta.selectionEnd = (sp + 4);
        editor_update();
    }
    return 0;
}

function set_code(code) {
    let ta;
    ta = document.getElementById("code");
    ta.value = code;
    editor_update();
    return 0;
}

function render_gallery() {
    let host, exs, e, btn, i;
    host = document.getElementById("examples");
    exs = examples();
    i = 0;
    while ((i < exs.length)) {
        e = exs[i];
        btn = document.createElement("button");
        btn.setAttribute("class", "ex-btn");
        btn.setAttribute("data-idx", to_str(i));
        btn.innerHTML = (((("<strong>" + String(e.name)) + "</strong><span>") + String(e.blurb)) + "</span>");
        btn.addEventListener("click", pick_example);
        host.appendChild(btn);
        i = (i + 1);
    }
    return 0;
}

function to_str(n) {
    return ("" + n);
}

function pick_example(ev) {
    let exs, idx, e;
    idx = Number(ev.currentTarget.getAttribute("data-idx"));
    exs = examples();
    e = exs[idx];
    set_code(e.code);
    mark_active(ev.currentTarget);
    clear_output();
    return 0;
}

function clear_output() {
    let status, out;
    out = document.getElementById("output");
    out.classList.remove("err");
    out.textContent = "▶  Press Run to execute.";
    status = document.getElementById("run-status");
    if (status) {
        status.textContent = "";
    }
    return 0;
}

function mark_active(el) {
    let all;
    all = document.querySelectorAll(".ex-btn");
    for (const b of all) {
        b.classList.remove("active");
    }
    el.classList.add("active");
    return 0;
}

function run_code() {
    let src, ta, t1, ms, t0, status, out, r, reflow;
    ta = document.getElementById("code");
    src = ta.value;
    out = document.getElementById("output");
    status = document.getElementById("run-status");
    t0 = window.performance.now();
    r = run_safely(src);
    t1 = window.performance.now();
    ms = (Math.round(((t1 - t0) * 100)) / 100);
    window.epRunCount = (window.epRunCount + 1);
    if (r.ok) {
        out.classList.remove("err");
        if ((r.output === "")) {
            out.textContent = "(ran clean — no output. Did you call display?)";
        } else {
            out.textContent = r.output;
        }
        status.classList.remove("err");
        status.textContent = ((("✓ ran in " + String(ms)) + " ms · run ") + String(window.epRunCount));
    } else {
        out.classList.add("err");
        out.textContent = ("✗ " + r.error);
        status.classList.add("err");
        status.textContent = ("✗ error · run " + String(window.epRunCount));
    }
    out.classList.remove("flash");
    reflow = out.offsetWidth;
    out.classList.add("flash");
    return 0;
}

function run_code_ev(ev) {
    run_code();
    return 0;
}

function term_init() {
    let inp;
    inp = document.getElementById("term-input");
    if (!inp) {
        return 0;
    }
    ep_repl_reset();
    inp.addEventListener("keydown", term_keydown);
    return 0;
}

function term_print(text, cls) {
    let log, line;
    log = document.getElementById("term-log");
    line = document.createElement("div");
    line.className = ("term-line " + cls);
    line.textContent = text;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
    return 0;
}

function term_keydown(ev) {
    let src, inp, r, sp, epp, val;
    inp = document.getElementById("term-input");
    if ((ev.key === "Enter")) {
        if (ev.shiftKey) {
            return 0;
        }
        ev.preventDefault();
        src = inp.value;
        if ((src.trim() === "")) {
            return 0;
        }
        term_print(("› " + src), "term-in");
        inp.value = "";
        r = ep_repl(src);
        if (r.ok) {
            if ((r.output !== "")) {
                term_print(r.output, "term-out");
            } else {
                term_print("ok", "term-dim");
            }
        } else {
            term_print(("✗ " + r.error), "term-err");
        }
        return 0;
    }
    if ((ev.key === "Tab")) {
        ev.preventDefault();
        sp = inp.selectionStart;
        epp = inp.selectionEnd;
        val = inp.value;
        inp.value = ((val.slice(0, sp) + "    ") + val.slice(epp));
        inp.selectionStart = (sp + 4);
        inp.selectionEnd = (sp + 4);
        return 0;
    }
    return 0;
}

function main() {
    let ta, exs, first;
    window.epRunCount = 0;
    render_gallery();
    ta = document.getElementById("code");
    ta.addEventListener("input", editor_update);
    ta.addEventListener("scroll", editor_scroll);
    ta.addEventListener("keydown", editor_keydown);
    document.getElementById("run").addEventListener("click", run_code_ev);
    exs = examples();
    set_code(exs[0].code);
    first = document.querySelector(".ex-btn");
    if (first) {
        first.classList.add("active");
    }
    clear_output();
    term_init();
    return 0;
}

main();
