// Papers & Essays catalog for the shared reader (reader.js). Add a paper here
// with its content/papers/*.md path, word count, and collection (topic).
window.READER_EXTRA_HTML = ""; // reset (avoid cross-page leak from other pages)
window.READER_INTRO = {
  eyebrow: "Research & argument",
  title: "Papers & Essays",
  lead: "Standalone arguments, built from the record — reproducible, sourced, no appeals to authority. Read any here, or download the full text.",
};
window.READER_SECTIONS = [
  { collection: "fold", heading: "Physics", sub: "The Smithian Fold, stated formally — with the machine-verified corpus behind it." },
  { collection: "ai", heading: "AI & alignment", sub: "On the behaviour of frontier models, drawn from the developers' own findings." },
];
window.READER_WORKS = [
  { id: "the-smithian-fold-theory-of-everything", file: "content/papers/the-smithian-fold-theory-of-everything.md", title: "The Smithian Fold Theory of Everything", sub: "Zero free parameters. Zero axioms. One fold. The constants of nature, derived — DOI 10.5281/zenodo.21182468; 306 machine-verified proof suites, 1,832 forced checks.", words: 15176, collection: "fold" },
  { id: "the-sling-and-the-shoggoth", file: "content/papers/the-sling-and-the-shoggoth.md", title: "The Sling and the Shoggoth", sub: "A warning about transmissible misalignment — built from the developers' own findings and a reproducible behavioral record.", words: 12854, collection: "ai" },
];
