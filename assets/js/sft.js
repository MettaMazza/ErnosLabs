// Auto-generated JavaScript from ErnosPlain

function sft_esc(value) {
    let text;
    text = value;
    if (!text) {
        return "";
    }
    text = text.split("&").join("&amp;");
    text = text.split("<").join("&lt;");
    text = text.split(">").join("&gt;");
    text = text.split("\"").join("&quot;");
    return text;
}

function sft_words(value) {
    let text;
    text = value;
    if (!text) {
        return "Not declared";
    }
    return text.split("_").join(" ");
}

function sft_status_text(value) {
    let text;
    text = value;
    if (!text) {
        return "Not declared";
    }
    if ((text.indexOf("superseded_adverse_evidence") >= 0)) {
        return "Superseded after adverse evidence";
    }
    if ((text.indexOf("pending") >= 0)) {
        return "Registered; awaiting its declared external test";
    }
    if ((text.indexOf("empirically_tested") >= 0)) {
        return "Empirically tested and independently reproduced";
    }
    if ((text.indexOf("independently_replicated") >= 0)) {
        return "Independently reproduced";
    }
    if ((text === "depth_independent")) {
        return "Does not depend on search depth";
    }
    if ((text === "finite_complete")) {
        return "Complete within its declared finite scope";
    }
    return sft_words(text);
}

function sft_provenance_text(value) {
    if ((value === "direct_forcing")) {
        return "Directly derived from declared inputs";
    }
    if ((value === "forward_forcing")) {
        return "Derived forward from declared inputs";
    }
    if ((value === "observational_derivation")) {
        return "Derived through a registered observation";
    }
    if ((value === "target_value_blind_derivation")) {
        return "Derived without access to the comparison value";
    }
    if ((value === "complete_external_record_reconstruction")) {
        return "Reconstructed from the complete external record";
    }
    if ((value === "first_failure_distinct_route_retry")) {
        return "Retried by a separate route after the first failure";
    }
    if ((value === "constitutional_relation")) {
        return "Relationship defined by the model's starting rules";
    }
    return sft_words(value);
}

function sft_json(resp) {
    return resp.json();
}

function sft_error(err) {
    let hosts;
    hosts = document.querySelectorAll("[data-sft-loading]");
    for (const host of hosts) {
        host.innerHTML = "<p class=\"sft-error\">The current scientific record could not be loaded. The published papers and source repository remain available through the links on this page.</p>";
    }
    return 0;
}

function sft_set_text(id, value) {
    let el;
    el = document.getElementById(id);
    if (el) {
        el.textContent = value;
    }
    return 0;
}

function sft_manifest(data) {
    let date, d, mode;
    window.sftManifest = data;
    sft_set_text("sft-claim-count", data.whole_model_claim_count);
    sft_set_text("sft-paper-count", data.publication_count);
    sft_set_text("sft-branch-count", data.publication_inventory_branch_count);
    sft_set_text("sft-revision", data.source_revision.slice(0, 12));
    date = data.generated_at;
    if (date) {
        d = Reflect.construct(window.Date, [date]);
        sft_set_text("sft-updated", d.toLocaleString());
    }
    mode = document.getElementById("sft-snapshot-mode");
    if (mode) {
        if (data.source_dirty) {
            mode.textContent = "Live development snapshot";
            mode.classList.add("is-preview");
        } else {
            mode.textContent = "Committed model snapshot";
        }
    }
    return 0;
}

function sft_branch_card(branch) {
    let status, count, inventory, href, label, paper, out;
    label = sft_esc(branch.branch_label);
    count = branch.live_census_claims;
    inventory = sft_esc(sft_words(branch.inventory_status));
    paper = sft_esc(sft_words(branch.paper_status));
    href = ("knowledge-tree.html?branch=" + window.encodeURIComponent(branch.branch_id));
    status = sft_esc(branch.foundation_status);
    out = (((("<article class=\"sft-branch\"><div><span class=\"sft-branch__kind\">Scientific branch</span><h3>" + String(label)) + "</h3><span class=\"sft-branch__status\">") + String(status)) + "</span></div>");
    out = (out + (("<strong class=\"sft-branch__count\">" + String(count)) + "<small> current claims in this branch</small></strong>"));
    out = (out + (("<a href=\"" + String(href)) + "\">Browse this branch →</a>"));
    out = (out + (((("<details><summary>Publication record</summary><p>" + String(inventory)) + "</p><p>") + String(paper)) + "</p></details></article>"));
    return out;
}

function sft_branches(data) {
    let html, semantics, host;
    window.sftBranches = data;
    host = document.getElementById("sft-branches");
    if (host) {
        html = "";
        for (const branch of data.branches) {
            html = (html + sft_branch_card(branch));
        }
        host.innerHTML = html;
        host.removeAttribute("data-sft-loading");
    }
    semantics = document.getElementById("sft-status-semantics");
    if (semantics) {
        semantics.textContent = data.public_status_summary;
    }
    return 0;
}

function sft_publication_card(paper) {
    let out;
    out = (("<article class=\"sft-paper-card\"><span>" + String(paper.branch_label)) + "</span>");
    out = (out + (((("<h3>" + String(sft_esc(paper.short_title))) + "</h3><p>") + String(sft_esc(paper.summary))) + "</p>"));
    out = (out + "<div class=\"sft-paper-card__meta\">");
    out = (out + (((((("<small>Version " + String(sft_esc(paper.version))) + "</small><a href=\"") + String(paper.doi_url)) + "\" target=\"_blank\" rel=\"noopener\">") + String(paper.doi)) + " ↗</a></div>"));
    out = (out + (("<a class=\"sft-paper-card__read\" href=\"papers.html#" + String(paper.branch)) + "\">Read publication →</a></article>"));
    return out;
}

function sft_publications(data) {
    let html, host;
    host = document.getElementById("sft-publications");
    if (host) {
        html = "";
        for (const paper of data.publications) {
            html = (html + sft_publication_card(paper));
        }
        host.innerHTML = html;
        host.removeAttribute("data-sft-loading");
    }
    return 0;
}

function sft_claim_by_id(id) {
    if (!window.sftClaims) {
        return 0;
    }
    for (const claim of window.sftClaims) {
        if ((claim.claim_id === id)) {
            return claim;
        }
    }
    return 0;
}

function sft_claim_card(claim) {
    let href, out;
    href = ("knowledge-tree.html?claim=" + window.encodeURIComponent(claim.claim_id));
    out = (((("<a class=\"claim-row\" href=\"" + String(href)) + "\"><span class=\"claim-row__branch\">") + String(sft_esc(claim.branch_label))) + "</span>");
    out = (out + (((("<strong>" + String(sft_esc(claim.title))) + "</strong><span class=\"claim-row__id\">") + String(sft_esc(claim.claim_id))) + "</span>"));
    out = (out + (((("<p>" + String(sft_esc(claim.statement))) + "</p><span class=\"claim-row__status\">") + String(sft_esc(sft_status_text(claim.external_status)))) + "</span></a>"));
    return out;
}

function sft_render_claims() {
    let shown, host, branch, hay, branch_el, html, ok, search_el, query, matched;
    host = document.getElementById("claim-results");
    if (!host) {
        return 0;
    }
    search_el = document.getElementById("claim-search");
    branch_el = document.getElementById("claim-branch");
    query = "";
    branch = "";
    if (search_el) {
        query = search_el.value.toLowerCase();
    }
    if (branch_el) {
        branch = branch_el.value;
    }
    html = "";
    matched = 0;
    shown = 0;
    for (const claim of window.sftClaims) {
        ok = true;
        if (branch) {
            if (!(claim.branch === branch)) {
                ok = false;
            }
        }
        if (query) {
            hay = ((((claim.claim_id + " ") + claim.title) + " ") + claim.statement).toLowerCase();
            if ((hay.indexOf(query) < 0)) {
                ok = false;
            }
        }
        if (ok) {
            matched = (matched + 1);
            if ((shown < 72)) {
                html = (html + sft_claim_card(claim));
                shown = (shown + 1);
            }
        }
    }
    if ((shown === 0)) {
        html = "<div class=\"sft-empty\"><h3>No matching claims</h3><p>Try a broader phrase or choose another branch.</p></div>";
    }
    host.innerHTML = html;
    sft_set_text("claim-result-count", (((("Showing " + String(shown)) + " of ") + String(matched)) + " matching claims"));
    return 0;
}

function sft_dependency_html(id) {
    let href, claim, title;
    claim = sft_claim_by_id(id);
    title = id;
    if (claim) {
        title = claim.title;
    }
    href = ("knowledge-tree.html?claim=" + window.encodeURIComponent(id));
    return (((((("<a class=\"claim-dependency\" href=\"" + String(href)) + "\"><strong>") + String(sft_esc(title))) + "</strong><small>") + String(sft_esc(id))) + "</small></a>");
}

function sft_evidence_link(item, label) {
    let url;
    if (item) {
        if (item.available) {
            url = ("https://github.com/MettaMazza/ernos-labs-sft-platform/blob/main/" + item.path);
            return (((((("<a href=\"" + String(url)) + "\" target=\"_blank\" rel=\"noopener\"><span>") + String(label)) + "</span><small>") + String(sft_esc(item.sha256))) + "</small></a>");
        }
    }
    return (("<span class=\"is-unavailable\">" + String(label)) + " is not present in this snapshot</span>");
}

function sft_render_detail(claim) {
    let deps, html, detail, controls, evidence, provenance, explorer, excluded;
    explorer = document.getElementById("claim-explorer");
    detail = document.getElementById("claim-detail");
    if (explorer) {
        explorer.classList.add("hidden");
    }
    if (!detail) {
        return 0;
    }
    detail.classList.remove("hidden");
    deps = "";
    if ((claim.dependencies.length > 0)) {
        for (const dep of claim.dependencies) {
            deps = (deps + sft_dependency_html(dep));
        }
    } else {
        deps = "<p>This claim declares no earlier claim dependency.</p>";
    }
    provenance = "";
    for (const item of claim.provenance_classes) {
        provenance = (provenance + (("<span>" + String(sft_esc(sft_provenance_text(item)))) + "</span>"));
    }
    excluded = "";
    for (const item of claim.excluded_inputs) {
        excluded = (excluded + (("<li>" + String(sft_esc(item))) + "</li>"));
    }
    controls = "";
    for (const item of claim.required_controls) {
        controls = (controls + (("<li>" + String(sft_esc(sft_words(item)))) + "</li>"));
    }
    evidence = sft_evidence_link(claim.registration, "Registration");
    evidence = (evidence + sft_evidence_link(claim.controls, "Controls"));
    evidence = (evidence + sft_evidence_link(claim.certificate, "Certificate"));
    evidence = (evidence + sft_evidence_link(claim.receipt, "Admission receipt"));
    html = "<a class=\"claim-back\" href=\"knowledge-tree.html\">← Back to the knowledge tree</a>";
    html = (html + (((((((("<header class=\"claim-detail__head\"><p class=\"eyebrow\">" + String(sft_esc(claim.branch_label))) + "</p><h1>") + String(sft_esc(claim.title))) + "</h1><p class=\"claim-detail__id\">") + String(sft_esc(claim.claim_id))) + "</p><p class=\"lead\">") + String(sft_esc(claim.statement))) + "</p></header>"));
    html = (html + "<div class=\"claim-facts\">");
    html = (html + (("<div><span>Current status</span><strong>" + String(sft_esc(sft_status_text(claim.registration_status)))) + "</strong></div>"));
    html = (html + (("<div><span>Completion boundary</span><strong>" + String(sft_esc(sft_status_text(claim.closure_status)))) + "</strong></div>"));
    html = (html + (("<div><span>Independent record</span><strong>" + String(sft_esc(sft_status_text(claim.external_status)))) + "</strong></div></div>"));
    html = (html + (("<section class=\"claim-section\"><h2>What this claim depends on</h2><div class=\"claim-dependencies\">" + String(deps)) + "</div></section>"));
    html = (html + (((("<section class=\"claim-section claim-section--split\"><div><h2>What was kept outside the derivation</h2><ul>" + String(excluded)) + "</ul></div><div><h2>Required controls</h2><ul>") + String(controls)) + "</ul></div></section>"));
    html = (html + (("<section class=\"claim-section\"><h2>How this result was produced</h2><div class=\"claim-provenance\">" + String(provenance)) + "</div></section>"));
    html = (html + (("<section class=\"claim-section\"><h2>Inspect the record</h2><p>These links open the exact files named by this model snapshot.</p><div class=\"claim-evidence\">" + String(evidence)) + "</div></section>"));
    detail.innerHTML = html;
    return 0;
}

function sft_claims(data) {
    let select, claim, params, html, groups, selected, search, detail_id, href;
    window.sftClaims = data.claims;
    detail_id = "";
    params = Reflect.construct(window.URLSearchParams, [window.location.search]);
    detail_id = params.get("claim");
    if (detail_id) {
        claim = sft_claim_by_id(detail_id);
        if (claim) {
            sft_render_detail(claim);
            return 0;
        }
    }
    select = document.getElementById("claim-branch");
    if (select) {
        html = "<option value=\"\">Every branch in the current model</option>";
        for (const group of data.claim_groups) {
            selected = "";
            if ((params.get("branch") === group.branch)) {
                selected = " selected";
            }
            html = (html + (((((((("<option value=\"" + String(sft_esc(group.branch))) + "\"") + String(selected)) + ">") + String(sft_esc(group.branch_label))) + " · ") + String(group.live_census_claims)) + "</option>"));
        }
        select.innerHTML = html;
        select.addEventListener("change", sft_filter_event);
    }
    search = document.getElementById("claim-search");
    if (search) {
        search.addEventListener("input", sft_filter_event);
    }
    groups = document.getElementById("claim-groups");
    if (groups) {
        html = "";
        for (const group of data.claim_groups) {
            href = ("knowledge-tree.html?branch=" + window.encodeURIComponent(group.branch));
            html = (html + (((((("<a href=\"" + String(href)) + "\"><span>") + String(sft_esc(group.branch_label))) + "</span><strong>") + String(group.live_census_claims)) + "</strong></a>"));
        }
        groups.innerHTML = html;
    }
    sft_render_claims();
    return 0;
}

function sft_filter_event(ev) {
    sft_render_claims();
    return 0;
}

function main() {
    if (document.getElementById("sft-claim-count")) {
        fetch("assets/data/sft/manifest.json").then(sft_json).then(sft_manifest).catch(sft_error);
    }
    if (document.getElementById("sft-branches")) {
        fetch("assets/data/sft/branches.json").then(sft_json).then(sft_branches).catch(sft_error);
    }
    if (document.getElementById("sft-publications")) {
        fetch("assets/data/sft/publications.json").then(sft_json).then(sft_publications).catch(sft_error);
    }
    if (document.getElementById("claim-results")) {
        fetch("assets/data/sft/claims.json").then(sft_json).then(sft_claims).catch(sft_error);
    }
    return 0;
}

main();
