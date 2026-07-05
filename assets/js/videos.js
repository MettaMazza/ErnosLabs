// Auto-generated JavaScript from ErnosPlain

function yt_thumb(id) {
    return (("https://i.ytimg.com/vi/" + String(id)) + "/hqdefault.jpg");
}

function esc(s) {
    let t;
    t = s;
    t = t.split("&").join("&amp;");
    t = t.split("<").join("&lt;");
    t = t.split(">").join("&gt;");
    return t;
}

function play_video(id, title) {
    let t, frame;
    frame = document.getElementById("video-player");
    if (frame) {
        frame.src = (("https://www.youtube-nocookie.com/embed/" + String(id)) + "?rel=0&autoplay=1");
    }
    t = document.getElementById("video-title");
    if (t) {
        t.textContent = title;
    }
    window.scrollTo(0, 0);
    return 0;
}

function vid_click(ev) {
    let idx, vids, el, v;
    el = ev.currentTarget;
    idx = el.getAttribute("data-idx");
    vids = window.ERNOS_VIDEOS;
    v = vids[idx];
    if (v) {
        play_video(v.id, v.title);
    }
    return 0;
}

function render_videos() {
    let grid, i, v, html, cap, cards, vids, thumb;
    grid = document.getElementById("video-grid");
    if (!grid) {
        return 0;
    }
    vids = window.ERNOS_VIDEOS;
    if (!vids) {
        grid.innerHTML = "<p class=\"lead\">Couldn't load the latest videos right now — watch them on the channel.</p>";
        return 0;
    }
    html = "";
    i = 0;
    while ((i < vids.length)) {
        v = vids[i];
        thumb = yt_thumb(v.id);
        cap = esc(v.title);
        html = (html + (("<button class=\"video-card reveal in\" data-idx=\"" + String(i)) + "\">"));
        html = (html + (("<span class=\"video-thumb\"><img loading=\"lazy\" src=\"" + String(thumb)) + "\" alt=\"\"><span class=\"video-play\">▶</span></span>"));
        html = (html + (("<span class=\"video-cap\">" + String(cap)) + "</span>"));
        html = (html + "</button>");
        i = (i + 1);
    }
    grid.innerHTML = html;
    cards = document.querySelectorAll(".video-card");
    for (const c of cards) {
        c.addEventListener("click", vid_click);
    }
    return 0;
}

function videos_init() {
    let v0, t, frame, vids;
    render_videos();
    vids = window.ERNOS_VIDEOS;
    if (vids) {
        if ((vids.length > 0)) {
            v0 = vids[0];
            frame = document.getElementById("video-player");
            if (frame) {
                frame.src = (("https://www.youtube-nocookie.com/embed/" + String(v0.id)) + "?rel=0");
            }
            t = document.getElementById("video-title");
            if (t) {
                t.textContent = v0.title;
            }
        }
    }
    return 0;
}

function main() {
    videos_init();
    return 0;
}

main();
