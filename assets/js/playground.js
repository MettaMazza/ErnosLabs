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
    list.push(ex("Hello", "Plain-English operators, conditionals.", "define main:\n    set a to 10\n    set b to 20\n    set result to a plus b multiplied by 2\n    display \"The result is:\"\n    display result\n    if result is greater than 30:\n        display \"...and it is greater than thirty.\"\n    else:\n        display \"...and it is small.\"\n    return 0"));
    list.push(ex("Factorial", "Recursion with a returning value.", "define factorial with n:\n    if n is less than 2:\n        return 1\n    return n times factorial(n minus 1)\n\ndefine main:\n    display \"5! =\"\n    display factorial(5)\n    return 0"));
    list.push(ex("Fibonacci", "Recursion + a counting loop.", "define fib with n:\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\ndefine main:\n    set i to 0\n    repeat while i <= 12:\n        display fib(i)\n        set i to i + 1\n    return 0"));
    list.push(ex("FizzBuzz", "else-if chains and modulo.", "define main:\n    set i to 1\n    repeat while i <= 20:\n        if i % 15 == 0:\n            display \"FizzBuzz\"\n        else if i % 3 == 0:\n            display \"Fizz\"\n        else if i % 5 == 0:\n            display \"Buzz\"\n        else:\n            display i\n        set i to i + 1\n    return 0"));
    list.push(ex("Primes", "Nested loops, booleans.", "define is_prime with n:\n    if n < 2:\n        return false\n    set d to 2\n    repeat while d * d <= n:\n        if n % d == 0:\n            return false\n        set d to d + 1\n    return true\n\ndefine main:\n    display \"primes up to 40:\"\n    set i to 2\n    repeat while i <= 40:\n        if is_prime(i):\n            display i\n        set i to i + 1\n    return 0"));
    list.push(ex("Lists", "Lists, for-each, f-strings.", "define main:\n    set nums to [3, 1, 4, 1, 5, 9, 2, 6]\n    set total to 0\n    set biggest to 0\n    for each x in nums:\n        set total to total + x\n        if x is greater than biggest:\n            set biggest to x\n    display f\"count: {length_list(nums)}\"\n    display f\"sum:   {total}\"\n    display f\"max:   {biggest}\"\n    return 0"));
    return list;
}

function render_gallery() {
    let e, i, exs, host, btn;
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
    let exs, e, idx, ta;
    idx = Number(ev.currentTarget.getAttribute("data-idx"));
    exs = examples();
    e = exs[idx];
    ta = document.getElementById("code");
    ta.value = e.code;
    mark_active(ev.currentTarget);
    run_code();
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
    let r, ta, status, out, src;
    ta = document.getElementById("code");
    src = ta.value;
    out = document.getElementById("output");
    status = document.getElementById("run-status");
    r = run_safely(src);
    if (r.ok) {
        out.classList.remove("err");
        if ((r.output === "")) {
            out.textContent = "(no output — did you call display?)";
        } else {
            out.textContent = r.output;
        }
        status.textContent = "ran clean";
        status.classList.remove("err");
    } else {
        out.classList.add("err");
        out.textContent = ("✗ " + r.error);
        status.textContent = "error";
        status.classList.add("err");
    }
    return 0;
}

function main() {
    let exs, ta, first;
    render_gallery();
    document.getElementById("run").addEventListener("click", run_code_ev);
    exs = examples();
    ta = document.getElementById("code");
    ta.value = exs[0].code;
    first = document.querySelector(".ex-btn");
    if (first) {
        first.classList.add("active");
    }
    run_code();
    return 0;
}

function run_code_ev(ev) {
    run_code();
    return 0;
}

main();
