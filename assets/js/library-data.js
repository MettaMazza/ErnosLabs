// Library catalog data for the shared reader (reader.js). Hand-edited: add a
// book here with its content/library/*.md path, word count, and collection.
window.READER_EXTRA_HTML = ""; // reset (seed.html sets its own; avoid cross-page leak)
window.READER_INTRO = {
  eyebrow: "The writing",
  title: "The Library",
  lead: "A reader for the full body of work — open any volume to read it here, with chapters, search, and read-aloud, or download the full text.",
};
window.READER_SECTIONS = [
  { collection: "lastmind", heading: "The Last Mind", sub: "A five-volume work on institutional capture, with the origin novel <em>A Mind Is Born</em> as its gateway." },
  { collection: "fold", heading: "The Fold", sub: "The Smithian Fold — a theory of everything from one axiom and one move. The full technical work, and three ways in for any reader." },
  { collection: "ernos", heading: "ErnosDecent", sub: "The constructive counterpart — what to build instead." },
  { collection: "seed", heading: "The Seed Vault", sub: "The framework and narrative behind the survival archive — the full archive is on the <a href=\"seed.html\" style=\"color:var(--ink-0)\">Seed Vault</a> page." },
];
window.READER_WORKS = [
  { id: "a-mind-is-born", file: "content/library/a-mind-is-born.md", title: "A Mind Is Born", sub: "Book One — the origin novel. A childhood in 1990s Glasgow, reading as survival.", words: 251522, collection: "lastmind" },
  { id: "behind-the-mask", file: "content/library/behind-the-mask.md", title: "Behind the Mask", sub: "Vol I · The Devil They Call God — the 400-year debt-money mechanism.", words: 281246, collection: "lastmind" },
  { id: "behind-the-performance", file: "content/library/behind-the-performance.md", title: "Behind the Performance", sub: "Vol II · The Demon They Call the State — the political class as operating layer.", words: 536662, collection: "lastmind" },
  { id: "behind-the-blessed", file: "content/library/behind-the-blessed.md", title: "Behind the Blessed", sub: "Vol III · The Demon They Call the Church — institutional capture of faith.", words: 318151, collection: "lastmind" },
  { id: "behind-the-knowing", file: "content/library/behind-the-knowing.md", title: "Behind the Knowing", sub: "Vol IV · The Demon They Call Consensus — press, academia, the knowledge apparatus.", words: 192588, collection: "lastmind" },
  { id: "behind-the-synthesis", file: "content/library/behind-the-synthesis.md", title: "Behind the Synthesis", sub: "Vol V · The Devil, the Demons & the Masks — the unifying framework.", words: 30331, collection: "lastmind" },
  { id: "smithian-fold", file: "content/library/smithian-fold.md", title: "Smithian Fold: Theory of Everything", sub: "The full technical work — the constants of nature derived from one axiom and one move, with zero free parameters.", words: 325720, collection: "fold" },
  { id: "the-one-and-the-fold", file: "content/library/the-one-and-the-fold.md", title: "The One and the Fold", sub: "The whole of physics from a single idea a child already understands — no mathematics required.", words: 24697, collection: "fold" },
  { id: "the-big-unfolding", file: "content/library/the-big-unfolding.md", title: "The Big Unfolding", sub: "How one number became everything — a narrative walk through the fold.", words: 28196, collection: "fold" },
  { id: "the-unfolding-adventures", file: "content/library/the-unfolding-adventures.md", title: "The Unfolding Adventures", sub: "An episodic story set in the Fold — fiction that teaches the theory, one night at a time.", words: 53850, collection: "fold" },
  { id: "ernosdecent-book", file: "content/library/ernosdecent-book.md", title: "ErnosDecent: Owned by No One", sub: "The plain-language book — what to build instead, in everyday words.", words: 64487, collection: "ernos" },
  { id: "hermeticism", file: "content/library/hermeticism.md", title: "Hermeticism, the Solo Initiate", sub: "The bridge between the Hermetic tradition, the Smithian Fold, the tools, and the Seed Vault.", words: 10950, collection: "seed" },
  { id: "the-seed-book", file: "content/library/the-seed-book.md", title: "The Seed Book", sub: "The narrative companion to the survival archive — why it exists and how to use it.", words: 19362, collection: "seed" },
];
