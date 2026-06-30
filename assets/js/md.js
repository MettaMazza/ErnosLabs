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

function md_render(src) {
    let ordered, hid, lines, n, hlvl, i, want, out, para, list_tag, in_code, trimmed, code_buf, in_list, line, norm, htext, tag;
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
            } else if (trimmed.startsWith("> ")) {
                if ((para !== "")) {
                    out = (((out + "<p>") + md_inline(para)) + "</p>");
                    para = "";
                }
                out = (((out + "<blockquote>") + md_inline(trimmed.slice(2))) + "</blockquote>");
                i = (i + 1);
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
    let i, heads, line, lines, lvl, norm, n, htext, h, in_code;
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

