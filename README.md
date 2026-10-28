# Philosophy Graph 🌌

An interactive web application exploring the history of philosophy, how thinkers influenced each other, how conceptual paradigms evolved across millennia (from Plato & Aristotle to Kant & Schopenhauer), and how multimedia resources (*Philosophize This!* podcast episodes, *Stanford Encyclopedia of Philosophy* canonical entries, and classic texts) link into this knowledge network.

---

## Features

- **Interactive Organic Force Network**: 2D force-directed canvas with custom node rendering, tradition color coding, degree centrality scaling, and smooth camera navigation.
- **Chronological Era Scrubber**: Scrub through history from 624 BCE to present day, or click **Play Evolution** to watch the history of ideas unfold dynamically.
- **Influence & Lineage Pathfinding**: Select any origin and target thinker (e.g. *Plato &rarr; Arthur Schopenhauer*) to calculate and highlight the shortest intellectual path across history.
- **Integrated Multimedia Dossier**:
  - **Philosophize This! Audio Player**: Listen to Stephen West's podcast episodes directly inside the app with playback speed control (1x - 2x) and skip controls.
  - **Stanford Encyclopedia of Philosophy (SEP)**: Canonical academic reference citations with one-click access.
  - **Influence Web**: Jump seamlessly between predecessors ("Influenced by") and successors ("Influenced").
- **Instant Search (⌘K / Ctrl+K)**: Instant full-text fuzzy lookup across all philosophers, concepts, branches, and books.
- **Extensible Ingestion Engine**: Automated RSS ingestion script (`scripts/ingest-philosophizethis.mjs`) mapping podcast episodes directly to philosophers.

---

## Getting Started

### Prerequisites
- Node.js 18+ (tested on Node 24)
- npm 9+

### Installation & Development
```bash
# Install dependencies
npm install

# Ingest / update latest podcast episodes from Philosophize This! RSS
npm run ingest

# Run development server
npm run dev

# Run test suite
npm test

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the graph.

---

## Architecture & Data Schema

- **`data/eras.json`**: Chronological eras (Pre-Socratic, Classical Greek, Hellenistic, Eastern, Medieval, Early Modern, Enlightenment, German Idealism, 19th Century, 20th Century, Contemporary).
- **`data/traditions.json`**: Schools of thought (Platonism, Aristotelianism, Stoicism, Rationalism, Empiricism, Phenomenology, Existentialism, Frankfurt School, Post-Structuralism, etc.).
- **`data/philosophers.json`**: Canonical roster of philosophers with lifespan, tradition, bio, central question, and Stanford Encyclopedia slug.
- **`data/concepts.json`**: Core philosophical concepts categorized by branch (Metaphysics, Epistemology, Ethics, Political, Mind, Logic).
- **`data/edges.json`**: Typed directional influence relationships (`INFLUENCED`, `CRITIQUED`, `DEVELOPED`, `SYNTHESIZED`).
- **`data/media.json`**: Curated resources, Stanford Encyclopedia links, and live-streamable *Philosophize This!* MP3 podcast enclosures.
