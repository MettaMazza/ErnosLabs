// Auto-generated JavaScript from ErnosPlain

function md_rx(pat, flags) {
    return Reflect.construct(window.RegExp, [pat, flags]);
}

function md_escape(s) {
    s = s.replace(md_rx("&", "g"), "&amp;");
    s = s.replace(md_rx("<", "g"), "&lt;");
    s = s.replace(md_rx(">", "g"), "&gt;");
    return s;
}

function md_inline(s) {
    s = md_escape(s);
    s = s.replace(md_rx("`([^`]+)`", "g"), "<code>$1</code>");
    s = s.replace(md_rx("!\\[([^\\]]*)\\]\\(([^)\\s]+)\\)", "g"), "<img src=\"$2\" alt=\"$1\" loading=\"lazy\">");
    s = s.replace(md_rx("\\[([^\\]]+)\\]\\(([^)]+)\\)", "g"), "<a href=\"$2\" target=\"_blank\" rel=\"noopener\">$1</a>");
    s = s.replace(md_rx("\\*\\*([^*]+)\\*\\*", "g"), "<strong>$1</strong>");
    s = s.replace(md_rx("__([^_]+)__", "g"), "<strong>$1</strong>");
    s = s.replace(md_rx("\\*([^*]+)\\*", "g"), "<em>$1</em>");
    return s;
}

function md_heading_level(line) {
    let lvl;
    lvl = 0;
    while ((lvl < line.length)) {
        if ((line.charAt(lvl) === "#")) {
            lvl = (lvl + 1);
        } else {
            return lvl;
        }
    }
    return lvl;
}

function md_slug(text) {
    let s;
    s = text.toLowerCase();
    s = s.replace(md_rx("[^a-z0-9 ]+", "g"), "");
    s = s.trim();
    s = s.replace(md_rx(" +", "g"), "-");
    return s;
}

function md_is_hr(line) {
    let t;
    t = line.trim();
    if ((t === "---")) {
        return true;
    }
    if ((t === "***")) {
        return true;
    }
    if ((t === "___")) {
        return true;
    }
    return false;
}

function md_table_cells(line) {
    let t;
    t = line.trim();
    if (t.startsWith("|")) {
        t = t.slice(1);
    }
    if (t.endsWith("|")) {
        t = t.slice(0, (t.length - 1));
    }
    return t.split("|");
}

function md_is_table_separator(line) {
    let cells, cell, i;
    cells = md_table_cells(line);
    if ((cells.length < 1)) {
        return false;
    }
    i = 0;
    while ((i < cells.length)) {
        cell = cells[i].trim();
        if (!md_rx("^:?-{3,}:?$", "").test(cell)) {
            return false;
        }
        i = (i + 1);
    }
    return true;
}

function md_table_row(line, tag) {
    let i, cell, cells, out;
    cells = md_table_cells(line);
    out = "<tr>";
    i = 0;
    while ((i < cells.length)) {
        cell = cells[i].trim();
        out = (((out + (("<" + String(tag)) + ">")) + md_inline(cell)) + (("</" + String(tag)) + ">"));
        i = (i + 1);
    }
    return (out + "</tr>");
}

function md_render(src) {
    let i, hid, qline, line, trimmed, htext, ordered, n, want, in_code, out, para, hlvl, in_list, quote, list_tag, tag, next_line, lines, norm, code_buf;
    norm = src.replace(md_rx("\r", "g"), "");
    lines = norm.split("\n");
    n = lines.length;
    out = "";
    i = 0;
    in_code = false;
    code_buf = "";
    para = "";
    in_list = false;
    list_tag = "ul";
    next_line = "";
    while ((i < n)) {
        line = lines[i];
        if (line.trim().startsWith("```")) {
            if (in_code) {
                out = (((out + "<pre><code>") + md_escape(code_buf)) + "</code></pre>");
                in_code = false;
                code_buf = "";
            } else {
                if ((para !== "")) {
                    out = (((out + "<p>") + md_inline(para)) + "</p>");
                    para = "";
                }
                if (in_list) {
                    out = (((out + "</") + list_tag) + ">");
                    in_list = false;
                }
                in_code = true;
            }
            i = (i + 1);
        } else if (in_code) {
            code_buf = ((code_buf + line) + "\n");
            i = (i + 1);
        } else {
            trimmed = line.trim();
            hlvl = md_heading_level(line);
            if ((trimmed === "")) {
                if ((para !== "")) {
                    out = (((out + "<p>") + md_inline(para)) + "</p>");
                    para = "";
                }
                if (in_list) {
                    out = (((out + "</") + list_tag) + ">");
                    in_list = false;
                }
                i = (i + 1);
            } else if (md_is_hr(line)) {
                if ((para !== "")) {
                    out = (((out + "<p>") + md_inline(para)) + "</p>");
                    para = "";
                }
                out = (out + "<hr>");
                i = (i + 1);
            } else {
                next_line = "";
                if (((i + 1) < n)) {
                    next_line = lines[(i + 1)];
                }
                if ((trimmed.includes("|") && md_is_table_separator(next_line))) {
                    if ((para !== "")) {
                        out = (((out + "<p>") + md_inline(para)) + "</p>");
                        para = "";
                    }
                    if (in_list) {
                        out = (((out + "</") + list_tag) + ">");
                        in_list = false;
                    }
                    out = (((out + "<table><thead>") + md_table_row(line, "th")) + "</thead><tbody>");
                    i = (i + 2);
                    while ((i < n)) {
                        line = lines[i];
                        trimmed = line.trim();
                        if ((trimmed === "")) {
                            break;
                        }
                        if (!trimmed.includes("|")) {
                            break;
                        }
                        out = (out + md_table_row(line, "td"));
                        i = (i + 1);
                    }
                    out = (out + "</tbody></table>");
                } else if ((hlvl >= 1)) {
                    if ((hlvl <= 6)) {
                        if ((line.charAt(hlvl) === " ")) {
                            if ((para !== "")) {
                                out = (((out + "<p>") + md_inline(para)) + "</p>");
                                para = "";
                            }
                            if (in_list) {
                                out = (((out + "</") + list_tag) + ">");
                                in_list = false;
                            }
                            htext = line.slice((hlvl + 1)).trim();
                            hid = md_slug(htext);
                            tag = ("h" + String(hlvl));
                            out = (((out + (((("<" + String(tag)) + " id=\"") + String(hid)) + "\">")) + md_inline(htext)) + (("</" + String(tag)) + ">"));
                            i = (i + 1);
                        } else {
                            para = md_para_add(para, line);
                            i = (i + 1);
                        }
                    } else {
                        para = md_para_add(para, line);
                        i = (i + 1);
                    }
                } else if (trimmed.startsWith(">")) {
                    if ((para !== "")) {
                        out = (((out + "<p>") + md_inline(para)) + "</p>");
                        para = "";
                    }
                    quote = "";
                    while ((i < n)) {
                        line = lines[i];
                        trimmed = line.trim();
                        if (!trimmed.startsWith(">")) {
                            break;
                        }
                        qline = trimmed.slice(1).trim();
                        quote = md_para_add(quote, qline);
                        i = (i + 1);
                    }
                    out = (((out + "<blockquote>") + md_inline(quote)) + "</blockquote>");
                } else if (md_is_list_item(trimmed)) {
                    if ((para !== "")) {
                        out = (((out + "<p>") + md_inline(para)) + "</p>");
                        para = "";
                    }
                    ordered = md_is_ordered(trimmed);
                    want = "ul";
                    if (ordered) {
                        want = "ol";
                    }
                    if (in_list) {
                        if ((list_tag !== want)) {
                            out = (((out + "</") + list_tag) + ">");
                            out = (((out + "<") + want) + ">");
                            list_tag = want;
                        }
                    } else {
                        out = (((out + "<") + want) + ">");
                        list_tag = want;
                        in_list = true;
                    }
                    out = (((out + "<li>") + md_inline(md_list_text(trimmed))) + "</li>");
                    i = (i + 1);
                } else {
                    para = md_para_add(para, line);
                    i = (i + 1);
                }
            }
        }
    }
    if ((para !== "")) {
        out = (((out + "<p>") + md_inline(para)) + "</p>");
    }
    if (in_list) {
        out = (((out + "</") + list_tag) + ">");
    }
    if (in_code) {
        out = (((out + "<pre><code>") + md_escape(code_buf)) + "</code></pre>");
    }
    return out;
}

function md_para_add(para, line) {
    if ((para === "")) {
        return line.trim();
    }
    return ((para + " ") + line.trim());
}

function md_is_list_item(t) {
    if (t.startsWith("- ")) {
        return true;
    }
    if (t.startsWith("* ")) {
        return true;
    }
    if (t.startsWith("+ ")) {
        return true;
    }
    return md_is_ordered(t);
}

function md_is_ordered(t) {
    let m;
    m = t.match(md_rx("^[0-9]+\\. ", ""));
    if (m) {
        return true;
    }
    return false;
}

function md_list_text(t) {
    if (md_is_ordered(t)) {
        return t.replace(md_rx("^[0-9]+\\. ", ""), "");
    }
    return t.slice(2);
}

function md_headings(src) {
    let lvl, lines, norm, line, n, in_code, i, htext, heads, h;
    norm = src.replace(md_rx("\r", "g"), "");
    lines = norm.split("\n");
    n = lines.length;
    heads = [];
    i = 0;
    in_code = false;
    while ((i < n)) {
        line = lines[i];
        if (line.trim().startsWith("```")) {
            if (in_code) {
                in_code = false;
            } else {
                in_code = true;
            }
        } else if (!in_code) {
            lvl = md_heading_level(line);
            if ((lvl >= 1)) {
                if ((lvl <= 4)) {
                    if ((line.charAt(lvl) === " ")) {
                        htext = line.slice((lvl + 1)).trim();
                        h = JSON.parse("{}");
                        h.level = lvl;
                        h.text = htext;
                        h.id = md_slug(htext);
                        heads.push(h);
                    }
                }
            }
        }
        i = (i + 1);
    }
    return heads;
}

