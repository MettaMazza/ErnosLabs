// Papers & Essays catalog for the shared reader (reader.js). Add a paper here
// with its content/papers/*.md path, word count, and collection (topic).
window.READER_EXTRA_HTML = ""; // reset (avoid cross-page leak from other pages)
window.READER_INTRO = {
  eyebrow: "Research & argument",
  title: "Papers & Essays",
  lead: "Standalone arguments, built from the record — reproducible, sourced, no appeals to authority. Read any here, or download the full text.",
};
window.READER_SECTIONS = [
  { collection: "ai", heading: "AI & alignment", sub: "On the behaviour of frontier models, drawn from the developers' own findings." },
];
window.READER_WORKS = [
  { id: "the-sling-and-the-shoggoth", file: "content/papers/the-sling-and-the-shoggoth.md", title: "The Sling and the Shoggoth", sub: "A warning about transmissible misalignment — built from the developers' own findings and a reproducible behavioral record.", words: 12854, collection: "ai" },
];
