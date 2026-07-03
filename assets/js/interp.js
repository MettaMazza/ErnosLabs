// Auto-generated JavaScript from ErnosPlain

function tok(kind, val) {
    let t;
    t = JSON.parse("{}");
    t.kind = kind;
    t.val = val;
    return t;
}

function is_digit(c) {
    if ((c >= "0")) {
        if ((c <= "9")) {
            return true;
        }
    }
    return false;
}

function is_alpha(c) {
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
    return false;
}

function is_alnum(c) {
    if (is_alpha(c)) {
        return true;
    }
    return is_digit(c);
}

function lex_line(line, toks) {
    let c, buf, d, n, e, i, j, res;
    i = 0;
    n = line.length;
    while ((i < n)) {
        c = line.charAt(i);
        if ((c === " ")) {
            i = (i + 1);
        } else if ((c === "#")) {
            return 0;
        } else if ((c === "\"")) {
            j = (i + 1);
            buf = "";
            while ((j < n)) {
                d = line.charAt(j);
                if ((d === "\\")) {
                    e = line.charAt((j + 1));
                    if ((e === "n")) {
                        buf = (buf + "\n");
                    } else if ((e === "t")) {
                        buf = (buf + "\t");
                    } else {
                        buf = (buf + e);
                    }
                    j = (j + 2);
                } else if ((d === "\"")) {
                    j = (j + 1);
                    return lex_after_string(line, toks, buf, j, false);
                } else {
                    buf = (buf + d);
                    j = (j + 1);
                }
            }
            return lex_after_string(line, toks, buf, j, false);
        } else if ((c === "f")) {
            if ((line.charAt((i + 1)) === "\"")) {
                res = lex_fstring(line, toks, (i + 2), n);
                i = res;
            } else {
                i = lex_ident(line, toks, i, n);
            }
        } else if (is_digit(c)) {
            i = lex_number(line, toks, i, n);
        } else if (is_alpha(c)) {
            i = lex_ident(line, toks, i, n);
        } else {
            i = lex_symbol(line, toks, i, n, c);
        }
    }
    return 0;
}

function lex_after_string(line, toks, buf, j, dummy) {
    toks.push(tok("STR", buf));
    lex_line(line.slice(j), toks);
    return 0;
}

function lex_fstring(line, toks, start, n) {
    let j, buf, e, d;
    j = start;
    buf = "";
    while ((j < n)) {
        d = line.charAt(j);
        if ((d === "\\")) {
            e = line.charAt((j + 1));
            if ((e === "n")) {
                buf = (buf + "\n");
            } else {
                buf = (buf + e);
            }
            j = (j + 2);
        } else if ((d === "\"")) {
            toks.push(tok("FSTR", buf));
            return (j + 1);
        } else {
            buf = (buf + d);
            j = (j + 1);
        }
    }
    toks.push(tok("FSTR", buf));
    return j;
}

function lex_number(line, toks, start, n) {
    let buf, seen_dot, d, j;
    j = start;
    buf = "";
    seen_dot = false;
    while ((j < n)) {
        d = line.charAt(j);
        if (is_digit(d)) {
            buf = (buf + d);
            j = (j + 1);
        } else if ((d === ".")) {
            if (seen_dot) {
                toks.push(tok("NUM", buf));
                return j;
            }
            seen_dot = true;
            buf = (buf + d);
            j = (j + 1);
        } else {
            toks.push(tok("NUM", buf));
            return j;
        }
    }
    toks.push(tok("NUM", buf));
    return j;
}

function lex_ident(line, toks, start, n) {
    let j, buf, d;
    j = start;
    buf = "";
    while ((j < n)) {
        d = line.charAt(j);
        if (is_alnum(d)) {
            buf = (buf + d);
            j = (j + 1);
        } else {
            toks.push(tok("ID", buf));
            return j;
        }
    }
    toks.push(tok("ID", buf));
    return j;
}

function lex_symbol(line, toks, start, n, c) {
    let two;
    two = line.slice(start, (start + 2));
    if ((two === "<=")) {
        toks.push(tok("OP", "<="));
        return (start + 2);
    }
    if ((two === ">=")) {
        toks.push(tok("OP", ">="));
        return (start + 2);
    }
    if ((two === "==")) {
        toks.push(tok("OP", "=="));
        return (start + 2);
    }
    if ((two === "!=")) {
        toks.push(tok("OP", "!="));
        return (start + 2);
    }
    if ((two === "&&")) {
        toks.push(tok("OP", "&&"));
        return (start + 2);
    }
    if ((two === "||")) {
        toks.push(tok("OP", "||"));
        return (start + 2);
    }
    if ((c === "(")) {
        toks.push(tok("LP", c));
        return (start + 1);
    }
    if ((c === ")")) {
        toks.push(tok("RP", c));
        return (start + 1);
    }
    if ((c === "[")) {
        toks.push(tok("LB", c));
        return (start + 1);
    }
    if ((c === "]")) {
        toks.push(tok("RB", c));
        return (start + 1);
    }
    if ((c === ",")) {
        toks.push(tok("COMMA", c));
        return (start + 1);
    }
    if ((c === ":")) {
        toks.push(tok("COLON", c));
        return (start + 1);
    }
    if ((c === ".")) {
        toks.push(tok("DOT", c));
        return (start + 1);
    }
    toks.push(tok("OP", c));
    return (start + 1);
}

function word_op2(a, b) {
    if ((a === "divided")) {
        if ((b === "by")) {
            return "/";
        }
    }
    if ((a === "multiplied")) {
        if ((b === "by")) {
            return "*";
        }
    }
    if ((a === "and")) {
        if ((b === "also")) {
            return "&&";
        }
    }
    if ((a === "or")) {
        if ((b === "else")) {
            return "||";
        }
    }
    return "";
}

function word_op1(a) {
    if ((a === "plus")) {
        return "+";
    }
    if ((a === "minus")) {
        return "-";
    }
    if ((a === "times")) {
        return "*";
    }
    if ((a === "modulo")) {
        return "%";
    }
    if ((a === "equals")) {
        return "==";
    }
    return "";
}

function match_phrase(toks, i) {
    let v4, v0, v1, v2, r, v3, v5;
    r = JSON.parse("{}");
    r.op = "";
    r.len = 0;
    v0 = phrase_val(toks, i);
    v1 = phrase_val(toks, (i + 1));
    v2 = phrase_val(toks, (i + 2));
    v3 = phrase_val(toks, (i + 3));
    v4 = phrase_val(toks, (i + 4));
    v5 = phrase_val(toks, (i + 5));
    if ((v0 === "is")) {
        if ((v1 === "greater")) {
            if ((v2 === "than")) {
                if ((v3 === "or")) {
                    if ((v4 === "equal")) {
                        if ((v5 === "to")) {
                            r.op = ">=";
                            r.len = 6;
                            return r;
                        }
                    }
                }
                r.op = ">";
                r.len = 3;
                return r;
            }
        }
        if ((v1 === "less")) {
            if ((v2 === "than")) {
                if ((v3 === "or")) {
                    if ((v4 === "equal")) {
                        if ((v5 === "to")) {
                            r.op = "<=";
                            r.len = 6;
                            return r;
                        }
                    }
                }
                r.op = "<";
                r.len = 3;
                return r;
            }
        }
        if ((v1 === "not")) {
            if ((v2 === "equal")) {
                if ((v3 === "to")) {
                    r.op = "!=";
                    r.len = 4;
                    return r;
                }
            }
        }
        if ((v1 === "equal")) {
            if ((v2 === "to")) {
                r.op = "==";
                r.len = 3;
                return r;
            }
        }
    }
    return r;
}

function phrase_val(toks, i) {
    let t;
    if ((i >= toks.length)) {
        return "";
    }
    t = toks[i];
    if ((t.kind === "ID")) {
        return t.val;
    }
    return "";
}

function collapse_ops(toks) {
    let n, w2, i, t, nxt, out, w1, ph;
    out = [];
    i = 0;
    n = toks.length;
    while ((i < n)) {
        t = toks[i];
        if ((t.kind === "ID")) {
            ph = match_phrase(toks, i);
            if ((ph.len > 0)) {
                out.push(tok("OP", ph.op));
                i = (i + ph.len);
            } else {
                nxt = phrase_val(toks, (i + 1));
                w2 = word_op2(t.val, nxt);
                if ((w2 !== "")) {
                    out.push(tok("OP", w2));
                    i = (i + 2);
                } else {
                    w1 = word_op1(t.val);
                    if ((w1 !== "")) {
                        out.push(tok("OP", w1));
                        i = (i + 1);
                    } else {
                        out.push(t);
                        i = (i + 1);
                    }
                }
            }
        } else {
            out.push(t);
            i = (i + 1);
        }
    }
    return out;
}

function tokenize(src) {
    let toks, indent, ln, norm, trimmed, lines, raw, line, i;
    norm = src.replace(Reflect.construct(window.RegExp, ["\r", "g"]), "");
    raw = norm.split("\n");
    lines = [];
    i = 0;
    while ((i < raw.length)) {
        line = raw[i];
        trimmed = line.trim();
        if ((trimmed === "")) {
            i = (i + 1);
        } else if (trimmed.startsWith("#")) {
            i = (i + 1);
        } else {
            indent = count_indent(line);
            toks = [];
            lex_line(line, toks);
            toks = collapse_ops(toks);
            if ((toks.length > 0)) {
                ln = JSON.parse("{}");
                ln.indent = indent;
                ln.toks = toks;
                lines.push(ln);
            }
            i = (i + 1);
        }
    }
    return lines;
}

function count_indent(line) {
    let i, spaces, c;
    i = 0;
    spaces = 0;
    while ((i < line.length)) {
        c = line.charAt(i);
        if ((c === " ")) {
            spaces = (spaces + 1);
            i = (i + 1);
        } else if ((c === "\t")) {
            spaces = (spaces + 4);
            i = (i + 1);
        } else {
            return spaces;
        }
    }
    return spaces;
}

function node(kind) {
    let nd;
    nd = JSON.parse("{}");
    nd.kind = kind;
    return nd;
}

function cur_line(P) {
    if ((P.pos >= P.lines.length)) {
        return false;
    }
    return P.lines[P.pos];
}

function parse_block(P, indent) {
    let stmt, ln, stmts;
    stmts = [];
    while (true) {
        ln = cur_line(P);
        if (!ln) {
            return stmts;
        }
        if ((ln.indent < indent)) {
            return stmts;
        }
        if ((ln.indent > indent)) {
            return stmts;
        }
        stmt = parse_stmt(P, indent);
        if (stmt) {
            stmts.push(stmt);
        }
    }
    return stmts;
}

function parse_stmt(P, indent) {
    let kw, ts, ex, nd, ln, head, toks;
    ln = cur_line(P);
    toks = ln.toks;
    head = toks[0];
    kw = head.val;
    if ((kw === "set")) {
        return parse_set(P, ln);
    }
    if ((kw === "display")) {
        return parse_display(P, ln);
    }
    if ((kw === "return")) {
        return parse_return(P, ln);
    }
    if ((kw === "if")) {
        return parse_if(P, indent);
    }
    if ((kw === "while")) {
        return parse_while(P, indent, ln, 1);
    }
    if ((kw === "repeat")) {
        return parse_while(P, indent, ln, 2);
    }
    if ((kw === "for")) {
        return parse_for(P, indent, ln);
    }
    if ((kw === "define")) {
        return parse_define(P, indent, ln);
    }
    ts = new_stream(toks);
    ex = parse_expr(ts);
    nd = node("expr");
    nd.expr = ex;
    return advance_ret(P, nd);
}

function advance_ret(P, nd) {
    P.pos = (P.pos + 1);
    return nd;
}

function parse_set(P, ln) {
    let field, nd, target_name, rest, is_field, t, ts, ex, i, toks;
    toks = ln.toks;
    i = 1;
    target_name = toks[i].val;
    i = (i + 1);
    is_field = false;
    field = "";
    if ((i < toks.length)) {
        t = toks[i];
        if ((t.kind === "DOT")) {
            is_field = true;
            field = toks[(i + 1)].val;
            i = (i + 2);
        }
    }
    if ((i < toks.length)) {
        t = toks[i];
        if ((t.kind === "ID")) {
            if ((t.val === "as")) {
                i = (i + 2);
            }
        }
    }
    t = toks[i];
    if ((t.val === "to")) {
        i = (i + 1);
    }
    rest = slice_toks(toks, i);
    ts = new_stream(rest);
    ex = parse_expr(ts);
    nd = node("set");
    nd.name = target_name;
    nd.is_field = is_field;
    nd.field = field;
    nd.expr = ex;
    P.pos = (P.pos + 1);
    return nd;
}

function parse_display(P, ln) {
    let ex, ts, rest, nd;
    rest = slice_toks(ln.toks, 1);
    ts = new_stream(rest);
    ex = parse_expr(ts);
    nd = node("display");
    nd.expr = ex;
    P.pos = (P.pos + 1);
    return nd;
}

function parse_return(P, ln) {
    let rest, nd, ts;
    rest = slice_toks(ln.toks, 1);
    nd = node("return");
    if ((rest.length === 0)) {
        nd.expr = false;
    } else {
        ts = new_stream(rest);
        nd.expr = parse_expr(ts);
    }
    P.pos = (P.pos + 1);
    return nd;
}

function parse_if(P, indent) {
    let econd, nd, cond, ebody, pair, nx, body, cond_toks, h, ts, ct, toks, ln, ts2, second;
    ln = cur_line(P);
    toks = ln.toks;
    cond_toks = cond_slice(toks, 1);
    ts = new_stream(cond_toks);
    cond = parse_expr(ts);
    P.pos = (P.pos + 1);
    body = parse_block(P, (indent + 4));
    nd = node("if");
    nd.cond = cond;
    nd.body = body;
    nd.elifs = [];
    nd.els = false;
    while (true) {
        nx = cur_line(P);
        if (!nx) {
            return nd;
        }
        if ((nx.indent !== indent)) {
            return nd;
        }
        h = nx.toks[0].val;
        if ((h === "else")) {
            second = phrase_val(nx.toks, 1);
            if ((second === "if")) {
                ct = cond_slice(nx.toks, 2);
                ts2 = new_stream(ct);
                econd = parse_expr(ts2);
                P.pos = (P.pos + 1);
                ebody = parse_block(P, (indent + 4));
                pair = JSON.parse("{}");
                pair.cond = econd;
                pair.body = ebody;
                nd.elifs.push(pair);
            } else {
                P.pos = (P.pos + 1);
                nd.els = parse_block(P, (indent + 4));
                return nd;
            }
        } else {
            return nd;
        }
    }
    return nd;
}

function parse_while(P, indent, ln, skip) {
    let cond, nd, ts, body, cond_toks;
    cond_toks = cond_slice(ln.toks, skip);
    ts = new_stream(cond_toks);
    cond = parse_expr(ts);
    P.pos = (P.pos + 1);
    body = parse_block(P, (indent + 4));
    nd = node("while");
    nd.cond = cond;
    nd.body = body;
    return nd;
}

function parse_for(P, indent, ln) {
    let name, toks, t, i;
    toks = ln.toks;
    name = toks[2].val;
    i = 3;
    while ((i < toks.length)) {
        t = toks[i];
        if ((t.kind === "ID")) {
            if ((t.val === "in")) {
                i = (i + 1);
                return parse_for_tail(P, indent, toks, name, i);
            }
        }
        i = (i + 1);
    }
    P.pos = (P.pos + 1);
    return false;
}

function parse_for_tail(P, indent, toks, name, i) {
    let body, rest, iter, ts, nd;
    rest = cond_slice(toks, i);
    ts = new_stream(rest);
    iter = parse_expr(ts);
    P.pos = (P.pos + 1);
    body = parse_block(P, (indent + 4));
    nd = node("foreach");
    nd.var = name;
    nd.iter = iter;
    nd.body = body;
    return nd;
}

function parse_define(P, indent, ln) {
    let t, i, body, nd, toks, name, params;
    toks = ln.toks;
    name = toks[1].val;
    params = [];
    i = 2;
    if ((i < toks.length)) {
        t = toks[i];
        if ((t.kind === "ID")) {
            if ((t.val === "with")) {
                i = (i + 1);
                i = read_params(toks, i, params);
            }
        }
    }
    P.pos = (P.pos + 1);
    body = parse_block(P, (indent + 4));
    nd = node("define");
    nd.name = name;
    nd.params = params;
    nd.body = body;
    return nd;
}

function read_params(toks, i, params) {
    let t;
    while ((i < toks.length)) {
        t = toks[i];
        if ((t.kind === "COLON")) {
            return i;
        }
        if ((t.kind === "ID")) {
            if ((t.val === "returning")) {
                return i;
            }
            if ((t.val === "and")) {
                i = (i + 1);
            } else if ((t.val === "as")) {
                i = (i + 2);
            } else {
                params.push(t.val);
                i = (i + 1);
            }
        } else {
            i = (i + 1);
        }
    }
    return i;
}

function slice_toks(toks, frm) {
    let out, i;
    out = [];
    i = frm;
    while ((i < toks.length)) {
        out.push(toks[i]);
        i = (i + 1);
    }
    return out;
}

function cond_slice(toks, frm) {
    let i, t, out;
    out = [];
    i = frm;
    while ((i < toks.length)) {
        t = toks[i];
        if ((t.kind === "COLON")) {
            return out;
        }
        out.push(t);
        i = (i + 1);
    }
    return out;
}

function new_stream(toks) {
    let s;
    s = JSON.parse("{}");
    s.toks = toks;
    s.pos = 0;
    return s;
}

function st_peek(s) {
    if ((s.pos >= s.toks.length)) {
        return false;
    }
    return s.toks[s.pos];
}

function st_next(s) {
    let t;
    t = st_peek(s);
    s.pos = (s.pos + 1);
    return t;
}

function parse_expr(s) {
    return parse_or(s);
}

function parse_or(s) {
    let t, right, left;
    left = parse_and(s);
    while (true) {
        t = st_peek(s);
        if (!t) {
            return left;
        }
        if ((t.kind === "OP")) {
            if ((t.val === "||")) {
                st_next(s);
                right = parse_and(s);
                left = bin("||", left, right);
            } else {
                return left;
            }
        } else {
            return left;
        }
    }
    return left;
}

function parse_and(s) {
    let t, right, left;
    left = parse_cmp(s);
    while (true) {
        t = st_peek(s);
        if (!t) {
            return left;
        }
        if ((t.kind === "OP")) {
            if ((t.val === "&&")) {
                st_next(s);
                right = parse_cmp(s);
                left = bin("&&", left, right);
            } else {
                return left;
            }
        } else {
            return left;
        }
    }
    return left;
}

function parse_cmp(s) {
    let t, left, right;
    left = parse_add(s);
    t = st_peek(s);
    if (!t) {
        return left;
    }
    if ((t.kind === "OP")) {
        if (is_cmp(t.val)) {
            st_next(s);
            right = parse_add(s);
            return bin(t.val, left, right);
        }
    }
    return left;
}

function is_cmp(op) {
    if ((op === "<")) {
        return true;
    }
    if ((op === ">")) {
        return true;
    }
    if ((op === "<=")) {
        return true;
    }
    if ((op === ">=")) {
        return true;
    }
    if ((op === "==")) {
        return true;
    }
    if ((op === "!=")) {
        return true;
    }
    return false;
}

function parse_add(s) {
    let t, left;
    left = parse_mul(s);
    while (true) {
        t = st_peek(s);
        if (!t) {
            return left;
        }
        if ((t.kind === "OP")) {
            if ((t.val === "+")) {
                st_next(s);
                left = bin("+", left, parse_mul(s));
            } else if ((t.val === "-")) {
                st_next(s);
                left = bin("-", left, parse_mul(s));
            } else {
                return left;
            }
        } else {
            return left;
        }
    }
    return left;
}

function parse_mul(s) {
    let left, t;
    left = parse_unary(s);
    while (true) {
        t = st_peek(s);
        if (!t) {
            return left;
        }
        if ((t.kind === "OP")) {
            if ((t.val === "*")) {
                st_next(s);
                left = bin("*", left, parse_unary(s));
            } else if ((t.val === "/")) {
                st_next(s);
                left = bin("/", left, parse_unary(s));
            } else if ((t.val === "%")) {
                st_next(s);
                left = bin("%", left, parse_unary(s));
            } else {
                return left;
            }
        } else {
            return left;
        }
    }
    return left;
}

function parse_unary(s) {
    let t, nd;
    t = st_peek(s);
    if (t) {
        if ((t.kind === "OP")) {
            if ((t.val === "-")) {
                st_next(s);
                nd = node("neg");
                nd.expr = parse_unary(s);
                return nd;
            }
        }
        if ((t.kind === "ID")) {
            if ((t.val === "not")) {
                st_next(s);
                nd = node("not");
                nd.expr = parse_unary(s);
                return nd;
            }
        }
    }
    return parse_postfix(s);
}

function parse_postfix(s) {
    let base, t, args, nd;
    base = parse_primary(s);
    while (true) {
        t = st_peek(s);
        if (!t) {
            return base;
        }
        if ((t.kind === "LP")) {
            st_next(s);
            args = parse_args(s);
            nd = node("call");
            nd.callee = base;
            nd.args = args;
            base = nd;
        } else {
            return base;
        }
    }
    return base;
}

function parse_args(s) {
    let args, t;
    args = [];
    t = st_peek(s);
    if (t) {
        if ((t.kind === "RP")) {
            st_next(s);
            return args;
        }
    }
    args.push(parse_expr(s));
    while (true) {
        t = st_peek(s);
        if (!t) {
            return args;
        }
        if ((t.kind === "RP")) {
            st_next(s);
            return args;
        }
        if ((t.kind === "COMMA")) {
            st_next(s);
            args.push(parse_expr(s));
        } else if ((t.kind === "ID")) {
            if ((t.val === "and")) {
                st_next(s);
                args.push(parse_expr(s));
            } else {
                return args;
            }
        } else {
            return args;
        }
    }
    return args;
}

function parse_primary(s) {
    let nd, t, inner;
    t = st_next(s);
    if (!t) {
        return node("nil");
    }
    if ((t.kind === "NUM")) {
        nd = node("num");
        nd.val = Number(t.val);
        return nd;
    }
    if ((t.kind === "STR")) {
        nd = node("str");
        nd.val = t.val;
        return nd;
    }
    if ((t.kind === "FSTR")) {
        nd = node("fstr");
        nd.val = t.val;
        return nd;
    }
    if ((t.kind === "LP")) {
        inner = parse_expr(s);
        st_next(s);
        return inner;
    }
    if ((t.kind === "LB")) {
        return parse_list(s);
    }
    if ((t.kind === "ID")) {
        if ((t.val === "true")) {
            nd = node("bool");
            nd.val = true;
            return nd;
        }
        if ((t.val === "false")) {
            nd = node("bool");
            nd.val = false;
            return nd;
        }
        nd = node("var");
        nd.name = t.val;
        return nd;
    }
    return node("nil");
}

function parse_list(s) {
    let nd, items, t;
    items = [];
    t = st_peek(s);
    if (t) {
        if ((t.kind === "RB")) {
            st_next(s);
            nd = node("list");
            nd.items = items;
            return nd;
        }
    }
    items.push(parse_expr(s));
    while (true) {
        t = st_peek(s);
        if (!t) {
            nd = node("list");
            nd.items = items;
            return nd;
        }
        if ((t.kind === "RB")) {
            st_next(s);
            nd = node("list");
            nd.items = items;
            return nd;
        }
        if ((t.kind === "COMMA")) {
            st_next(s);
            items.push(parse_expr(s));
        } else {
            st_next(s);
        }
    }
    nd = node("list");
    nd.items = items;
    return nd;
}

function bin(op, l, r) {
    let nd;
    nd = node("bin");
    nd.op = op;
    nd.left = l;
    nd.right = r;
    return nd;
}

function env_new(parent) {
    let e;
    e = JSON.parse("{}");
    e.vars = JSON.parse("{}");
    e.parent = parent;
    return e;
}

function env_get(e, name) {
    let cur;
    cur = e;
    while (cur) {
        if (Object.prototype.hasOwnProperty.call(cur.vars, name)) {
            return cur.vars[name];
        }
        cur = cur.parent;
    }
    throw_err(("undefined name: " + String(name)));
    return false;
}

function env_set(e, name, val) {
    let cur;
    cur = e;
    while (cur) {
        if (Object.prototype.hasOwnProperty.call(cur.vars, name)) {
            set_prop(cur.vars, name, val);
            return 0;
        }
        cur = cur.parent;
    }
    set_prop(e.vars, name, val);
    return 0;
}

function set_prop(obj, key, val) {
    let fn;
    fn = Reflect["set"];
    fn.call(Reflect, obj, key, val);
    return 0;
}

function throw_err(msg) {
    if (!window.epErr) {
        window.epErr = msg;
    }
    return false;
}

function make_return(val) {
    let r;
    r = JSON.parse("{}");
    r.is_return = true;
    r.val = val;
    return r;
}

function exec_block(stmts, e) {
    let st, sig, i;
    i = 0;
    while ((i < stmts.length)) {
        if (window.epErr) {
            return false;
        }
        st = stmts[i];
        sig = exec_stmt(st, e);
        if (sig) {
            return sig;
        }
        i = (i + 1);
    }
    return false;
}

function exec_stmt(st, e) {
    let fn, k, obj, v;
    k = st.kind;
    if ((k === "set")) {
        v = eval_expr(st.expr, e);
        if (st.is_field) {
            obj = env_get(e, st.name);
            set_prop(obj, st.field, v);
        } else {
            env_set(e, st.name, v);
        }
        return false;
    }
    if ((k === "display")) {
        v = eval_expr(st.expr, e);
        ep_emit(to_display(v));
        return false;
    }
    if ((k === "return")) {
        if (st.expr) {
            return make_return(eval_expr(st.expr, e));
        }
        return make_return(false);
    }
    if ((k === "expr")) {
        eval_expr(st.expr, e);
        return false;
    }
    if ((k === "if")) {
        return exec_if(st, e);
    }
    if ((k === "while")) {
        return exec_while(st, e);
    }
    if ((k === "foreach")) {
        return exec_foreach(st, e);
    }
    if ((k === "define")) {
        fn = JSON.parse("{}");
        fn.is_fn = true;
        fn.params = st.params;
        fn.body = st.body;
        fn.closure = e;
        env_set(e, st.name, fn);
        return false;
    }
    return false;
}

function exec_if(st, e) {
    let i, pair;
    if (truthy(eval_expr(st.cond, e))) {
        return exec_block(st.body, env_new(e));
    }
    i = 0;
    while ((i < st.elifs.length)) {
        pair = st.elifs[i];
        if (truthy(eval_expr(pair.cond, e))) {
            return exec_block(pair.body, env_new(e));
        }
        i = (i + 1);
    }
    if (st.els) {
        return exec_block(st.els, env_new(e));
    }
    return false;
}

function exec_while(st, e) {
    let sig, guard;
    guard = 0;
    while (truthy(eval_expr(st.cond, e))) {
        sig = exec_block(st.body, env_new(e));
        if (sig) {
            return sig;
        }
        guard = (guard + 1);
        if ((guard > 1000000)) {
            throw_err("loop exceeded 1,000,000 iterations (stopped)");
        }
    }
    return false;
}

function exec_foreach(st, e) {
    let sig, inner, i, seq;
    seq = eval_expr(st.iter, e);
    i = 0;
    while ((i < seq.length)) {
        inner = env_new(e);
        env_set(inner, st.var, seq[i]);
        sig = exec_block(st.body, inner);
        if (sig) {
            return sig;
        }
        i = (i + 1);
    }
    return false;
}

function eval_expr(x, e) {
    let i, arr, k;
    k = x.kind;
    if ((k === "num")) {
        return x.val;
    }
    if ((k === "str")) {
        return x.val;
    }
    if ((k === "bool")) {
        return x.val;
    }
    if ((k === "nil")) {
        return false;
    }
    if ((k === "fstr")) {
        return eval_fstring(x.val, e);
    }
    if ((k === "var")) {
        return env_get(e, x.name);
    }
    if ((k === "list")) {
        arr = [];
        i = 0;
        while ((i < x.items.length)) {
            arr.push(eval_expr(x.items[i], e));
            i = (i + 1);
        }
        return arr;
    }
    if ((k === "neg")) {
        return (0 - eval_expr(x.expr, e));
    }
    if ((k === "not")) {
        if (truthy(eval_expr(x.expr, e))) {
            return false;
        }
        return true;
    }
    if ((k === "bin")) {
        return eval_bin(x, e);
    }
    if ((k === "call")) {
        return eval_call(x, e);
    }
    return false;
}

function eval_bin(x, e) {
    let b, a, op, l;
    op = x.op;
    if ((op === "&&")) {
        if (truthy(eval_expr(x.left, e))) {
            return eval_expr(x.right, e);
        }
        return false;
    }
    if ((op === "||")) {
        l = eval_expr(x.left, e);
        if (truthy(l)) {
            return l;
        }
        return eval_expr(x.right, e);
    }
    a = eval_expr(x.left, e);
    b = eval_expr(x.right, e);
    if ((op === "+")) {
        if ((typeof_str(a) === "string")) {
            return (a + to_display(b));
        }
        if ((typeof_str(b) === "string")) {
            return (to_display(a) + b);
        }
        return (a + b);
    }
    if ((op === "-")) {
        return (a - b);
    }
    if ((op === "*")) {
        return (a * b);
    }
    if ((op === "/")) {
        return (a / b);
    }
    if ((op === "%")) {
        return (a % b);
    }
    if ((op === "<")) {
        return (a < b);
    }
    if ((op === ">")) {
        return (a > b);
    }
    if ((op === "<=")) {
        return (a <= b);
    }
    if ((op === ">=")) {
        return (a >= b);
    }
    if ((op === "==")) {
        return (a === b);
    }
    if ((op === "!=")) {
        return (a !== b);
    }
    return false;
}

function typeof_str(v) {
    let s;
    s = Object.prototype.toString.call(v);
    if ((s === "[object String]")) {
        return "string";
    }
    if ((s === "[object Number]")) {
        return "number";
    }
    if ((s === "[object Array]")) {
        return "array";
    }
    if ((s === "[object Boolean]")) {
        return "boolean";
    }
    return "other";
}

function eval_call(x, e) {
    let callee, fn, fnv, args, name, b, i;
    callee = x.callee;
    args = [];
    i = 0;
    while ((i < x.args.length)) {
        args.push(eval_expr(x.args[i], e));
        i = (i + 1);
    }
    if ((callee.kind === "var")) {
        name = callee.name;
        b = builtin_call(name, args);
        if (b.handled) {
            return b.val;
        }
        fn = env_get(e, name);
        return call_fn(fn, args);
    }
    fnv = eval_expr(callee, e);
    return call_fn(fnv, args);
}

function call_fn(fn, args) {
    let i, local, sig, pname;
    if (!fn.is_fn) {
        throw_err("attempt to call a non-function");
    }
    local = env_new(fn.closure);
    i = 0;
    while ((i < fn.params.length)) {
        pname = fn.params[i];
        env_set(local, pname, args[i]);
        i = (i + 1);
    }
    sig = exec_block(fn.body, local);
    if (sig) {
        return sig.val;
    }
    return false;
}

function eval_fstring(raw, e) {
    let j, out, n, c, inner, i, d;
    out = "";
    i = 0;
    n = raw.length;
    while ((i < n)) {
        c = raw.charAt(i);
        if ((c === "{")) {
            j = (i + 1);
            inner = "";
            while ((j < n)) {
                d = raw.charAt(j);
                if ((d === "}")) {
                    j = (j + 1);
                    return fstr_tail(raw, e, out, inner, j, n);
                }
                inner = (inner + d);
                j = (j + 1);
            }
            out = ((out + "{") + inner);
            return out;
        } else {
            out = (out + c);
            i = (i + 1);
        }
    }
    return out;
}

function fstr_tail(raw, e, out, inner, j, n) {
    let val, toks, s;
    toks = [];
    lex_line(inner, toks);
    toks = collapse_ops(toks);
    s = new_stream(toks);
    val = eval_expr(parse_expr(s), e);
    out = (out + to_display(val));
    return (out + eval_fstring(raw.slice(j), e));
}

function result_pair(handled, val) {
    let r;
    r = JSON.parse("{}");
    r.handled = handled;
    r.val = val;
    return r;
}

function builtin_call(name, args) {
    let lst;
    if ((name === "create_list")) {
        return result_pair(true, []);
    }
    if ((name === "append_list")) {
        args[0].push(args[1]);
        return result_pair(true, true);
    }
    if ((name === "get_list")) {
        return result_pair(true, args[0][args[1]]);
    }
    if ((name === "set_list")) {
        lst = args[0];
        set_prop(lst, args[1], args[2]);
        return result_pair(true, true);
    }
    if ((name === "length_list")) {
        return result_pair(true, args[0].length);
    }
    if ((name === "length")) {
        return result_pair(true, args[0].length);
    }
    if ((name === "string_length")) {
        return result_pair(true, args[0].length);
    }
    if ((name === "char_at")) {
        return result_pair(true, args[0].charAt(args[1]));
    }
    if ((name === "to_text")) {
        return result_pair(true, to_display(args[0]));
    }
    if ((name === "concat")) {
        return result_pair(true, (to_display(args[0]) + to_display(args[1])));
    }
    if ((name === "uppercase")) {
        return result_pair(true, args[0].toUpperCase());
    }
    if ((name === "lowercase")) {
        return result_pair(true, args[0].toLowerCase());
    }
    if ((name === "absolute")) {
        return result_pair(true, Math.abs(args[0]));
    }
    if ((name === "floor")) {
        return result_pair(true, Math.floor(args[0]));
    }
    return result_pair(false, false);
}

function truthy(v) {
    if (v) {
        return true;
    }
    return false;
}

function to_display(v) {
    let tp;
    tp = typeof_str(v);
    if ((tp === "string")) {
        return v;
    }
    if ((tp === "boolean")) {
        if (v) {
            return "true";
        }
        return "false";
    }
    if ((tp === "array")) {
        return (("[" + arr_join(v)) + "]");
    }
    return String(v);
}

function arr_join(arr) {
    let i, out;
    out = "";
    i = 0;
    while ((i < arr.length)) {
        if ((i > 0)) {
            out = (out + ", ");
        }
        out = (out + to_display(arr[i]));
        i = (i + 1);
    }
    return out;
}

function ep_emit(s) {
    let buf;
    buf = window.epOut;
    buf.push(s);
    return 0;
}

function run_thunk() {
    return ep_run(window.epSrc);
}

function run_safely(src) {
    let old_handler, result, err_r;
    window.epSrc = src;
    window.epRunErr = false;
    old_handler = window.onerror;
    window.onerror = run_err_handler;
    result = ep_run(src);
    window.onerror = old_handler;
    if (window.epRunErr) {
        err_r = JSON.parse("{}");
        err_r.ok = false;
        err_r.output = "";
        err_r.error = window.epRunErr;
        return err_r;
    }
    return result;
}

function run_err_handler(msg, url, line, col, err) {
    if (err) {
        window.epRunErr = (err.message || msg);
    } else {
        window.epRunErr = msg;
    }
    return true;
}

function ep_run(src) {
    let res, i, fn, genv, ran_main, P, program, st, lines;
    res = JSON.parse("{}");
    window.epOut = [];
    window.epErr = false;
    lines = tokenize(src);
    P = JSON.parse("{}");
    P.lines = lines;
    P.pos = 0;
    program = parse_block(P, 0);
    genv = env_new(false);
    i = 0;
    while ((i < program.length)) {
        st = program[i];
        if ((st.kind === "define")) {
            exec_stmt(st, genv);
        }
        i = (i + 1);
    }
    i = 0;
    ran_main = false;
    while ((i < program.length)) {
        st = program[i];
        if ((st.kind !== "define")) {
            exec_stmt(st, genv);
        }
        i = (i + 1);
    }
    if (has_var(genv, "main")) {
        if ((window.epOut.length === 0)) {
            fn = env_get(genv, "main");
            call_fn(fn, []);
        }
    }
    res.output = window.epOut.join("\n");
    if (window.epErr) {
        res.ok = false;
        res.error = window.epErr;
    } else {
        res.ok = true;
        res.error = false;
    }
    return res;
}

function ep_repl_reset() {
    window.epReplEnv = env_new(false);
    return 0;
}

function ep_repl(src) {
    let lines, i, genv, n, res, P, program, st, v;
    res = JSON.parse("{}");
    window.epOut = [];
    window.epErr = false;
    if (!window.epReplEnv) {
        window.epReplEnv = env_new(false);
    }
    genv = window.epReplEnv;
    lines = tokenize(src);
    P = JSON.parse("{}");
    P.lines = lines;
    P.pos = 0;
    program = parse_block(P, 0);
    n = program.length;
    i = 0;
    while ((i < n)) {
        st = program[i];
        if ((st.kind === "define")) {
            exec_stmt(st, genv);
        }
        i = (i + 1);
    }
    i = 0;
    while ((i < n)) {
        st = program[i];
        if ((st.kind !== "define")) {
            if ((i === (n - 1))) {
                if ((st.kind === "expr")) {
                    v = eval_expr(st.expr, genv);
                    if (!window.epErr) {
                        ep_emit(to_display(v));
                    }
                } else {
                    exec_stmt(st, genv);
                }
            } else {
                exec_stmt(st, genv);
            }
        }
        i = (i + 1);
    }
    res.output = window.epOut.join("\n");
    if (window.epErr) {
        res.ok = false;
        res.error = window.epErr;
    } else {
        res.ok = true;
        res.error = false;
    }
    return res;
}

function has_var(e, name) {
    return Object.prototype.hasOwnProperty.call(e.vars, name);
}

