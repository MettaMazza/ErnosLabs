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
    let i, c, sstart, n, word, start, out, d;
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
    let g, lines, ta, layer, gutter, src, i;
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
    let layer, ta, gutter;
    ta = document.getElementById("code");
    layer = document.getElementById("code-hl");
    gutter = document.getElementById("gutter");
    layer.scrollTop = ta.scrollTop;
    layer.scrollLeft = ta.scrollLeft;
    gutter.scrollTop = ta.scrollTop;
    return 0;
}

function editor_keydown(ev) {
    let val, sp, ta, epp;
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
    let host, exs, btn, e, i;
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
    let e, idx, exs;
    idx = Number(ev.currentTarget.getAttribute("data-idx"));
    exs = examples();
    e = exs[idx];
    set_code(e.code);
    mark_active(ev.currentTarget);
    clear_output();
    return 0;
}

function clear_output() {
    let out, status;
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
    let ta, r, t1, t0, status, src, ms, reflow, out;
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
    window.epHistory = [];
    inp.addEventListener("keydown", term_keydown);
    term_print("New to code? Type  /help  to start learning — or just try:  2 plus 2", "term-dim");
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
    let src, r, val, inp, trimmed, sp, epp;
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
        trimmed = src.trim();
        if ((trimmed.charAt(0) === "/")) {
            term_command(trimmed);
            return 0;
        }
        window.epHistory.push(src);
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

function term_command(cmd) {
    let low, log;
    low = cmd.toLowerCase();
    if ((low === "/save")) {
        term_save();
        return 0;
    }
    if ((low === "/clear")) {
        log = document.getElementById("term-log");
        log.innerHTML = "";
        return 0;
    }
    if ((low.indexOf("newbie") >= 0)) {
        term_help("newbie");
        return 0;
    }
    if ((low.indexOf("vibing") >= 0)) {
        term_help("vibing");
        return 0;
    }
    if ((low.indexOf("pro") >= 0)) {
        term_help("pro");
        return 0;
    }
    if ((low.indexOf("help") >= 0)) {
        term_help_menu();
        return 0;
    }
    term_print("Unknown command. Type /help to see what's available.", "term-dim");
    return 0;
}

function term_help_menu() {
    let t;
    t = "ErnosPlain help — pick the level that fits you:\n";
    t = (t + "  /help newbie   first time ever — the gentlest steps\n");
    t = (t + "  /help vibing   you've got the basics — build small things\n");
    t = (t + "  /help pro      recursion, structures, the whole language\n\n");
    t = (t + "Other commands:\n");
    t = (t + "  /save          download everything you've typed as a .ep file\n");
    t = (t + "  /clear         clear this console");
    term_print(t, "term-help");
    return 0;
}

function term_help(level) {
    let t;
    if ((level === "newbie")) {
        t = "NEWBIE — your very first program\n";
        t = (t + "A program is just a list of instructions. Type these one line at a time\n");
        t = (t + "and press Enter after each:\n\n");
        t = (t + "  display \"Hello!\"          shows some text\n");
        t = (t + "  set age to 10             remembers a number called age\n");
        t = (t + "  display age               shows it back\n");
        t = (t + "  display age plus 5        simple maths\n");
        t = (t + "  set name to \"Sam\"\n");
        t = (t + "  display f\"Hi {name}!\"      puts a value inside text\n\n");
        t = (t + "Remember: 'display' shows things, 'set X to Y' remembers things.\n");
        t = (t + "When that clicks, type  /help vibing");
        term_print(t, "term-help");
        return 0;
    }
    if ((level === "vibing")) {
        t = "VIBING — making things happen\n";
        t = (t + "Functions package up steps so you can reuse them:\n\n");
        t = (t + "  define double with n:\n");
        t = (t + "      return n times 2\n");
        t = (t + "  double(21)                gives 42\n\n");
        t = (t + "Loops repeat work:\n");
        t = (t + "  set i to 1\n");
        t = (t + "  repeat while i is less than 4:\n");
        t = (t + "      display i\n");
        t = (t + "      set i to i plus 1\n\n");
        t = (t + "Lists hold many values:\n");
        t = (t + "  set xs to [3, 1, 2]\n");
        t = (t + "  display length_list(xs)\n\n");
        t = (t + "(Shift+Enter makes a new line; Tab indents.) Ready for more? /help pro");
        term_print(t, "term-help");
        return 0;
    }
    if ((level === "pro")) {
        t = "PRO — the full shape of the language\n";
        t = (t + "Recursion — a function that calls itself:\n\n");
        t = (t + "  define fib with n:\n");
        t = (t + "      if n is less than 2:\n");
        t = (t + "          return n\n");
        t = (t + "      return fib(n minus 1) plus fib(n minus 2)\n\n");
        t = (t + "Structures group data; choices + check do pattern matching:\n");
        t = (t + "  define structure Point:\n");
        t = (t + "      field x as Int\n");
        t = (t + "      field y as Int\n\n");
        t = (t + "The full compiler also has traits, closures (given x: ...), a borrow\n");
        t = (t + "checker, 24 stdlib modules and FFI — all compiled to native code.\n");
        t = (t + "Type /save to keep what you've written.");
        term_print(t, "term-help");
        return 0;
    }
    return 0;
}

function term_save() {
    let code, lines, blob, url, opts, a;
    lines = window.epHistory;
    if ((lines.length === 0)) {
        term_print("Nothing to save yet — write some ErnosPlain first.", "term-dim");
        return 0;
    }
    code = (("# Saved from the Ernos Labs REPL\n\n" + lines.join("\n")) + "\n");
    opts = JSON.parse("{}");
    opts.type = "text/plain";
    blob = Reflect.construct(window.Blob, [[code], opts]);
    url = window.URL.createObjectURL(blob);
    a = document.createElement("a");
    a.href = url;
    a.download = "my-program.ep";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    term_print("✓ Saved your session as my-program.ep", "term-out");
    return 0;
}

function main() {
    let first, ta, exs;
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
