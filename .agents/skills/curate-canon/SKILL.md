---
name: curate-canon
description: >-
  Standardized protocol to research, evaluate, ingest, and verify thinkers, landmark concepts, and dialectical lineages in the Philosophia canon. Enforces strict TypeScript schema compliance, zero isolated nodes, media ingestion, and isolated worktree PR submission without auto-merging.
---

# Curate Canon (`/curate-canon`)

This skill defines the end-to-end operational protocol for evaluating and adding philosophers, landmark concepts, and dialectical edges into the *Philosophia* graph.

---

## 🎯 1. Admission & Evaluation Gate

Not every historical commentator or peripheral figure belongs in the primary constellation. Every candidate must satisfy at least one of the three canon admission criteria:

1. **Foundational Pillar / Tradition Founder**: Initiated or crystallized a major philosophical epoch or tradition (e.g. Thales, Confucius, Descartes, Kant, Peirce).
2. **Indispensable Dialectical Bridge**: The proximate historical catalyst without whom their successor's ideas lack parentage (e.g. Boethius bridging Aristotle/Augustine to Aquinas; Fichte & Schelling bridging Kant to Hegel; Frege bridging Kant to Wittgenstein).
3. **Conceptual Innovator**: Formulated a landmark argument or epistemic distinction that remains a staple of philosophical debate (e.g. Anselm's Ontological Argument, Ghazali's critique of causality, Pascal's Wager).

### Importance Score Calibration (0–100)
- **100**: Founding titans of world philosophy (Plato, Aristotle, Kant, Nietzsche).
- **95–99**: Epoch-defining pillars (Descartes, Hume, Wittgenstein, Hegel, Spinoza).
- **90–94**: Major bridge figures, tradition founders, and systematic thinkers (Frege, Boethius, Anselm, Pascal, Maimonides, Al-Ghazali, Merleau-Ponty).
- **80–89**: Essential secondary contributors, specialized catalysts (Adorno, Deleuze, Popper, James).

---

## 🔍 2. Research Protocol

Before writing data, collect verified metadata from authoritative scholarly sources:
- **Stanford Encyclopedia of Philosophy (SEP)** (`plato.stanford.edu/entries/<slug>/`): Canonical academic overview, biographical dates, central thesis, and primary bibliography.
- **Key Works**: 1 to 3 seminal texts with year, description, and Wikipedia or archive link.
- **Central Inquiry Question**: The core philosophical problem formulated in the thinker's voice (in quotes, e.g. *"How can human free will coexist with infallible divine foreknowledge?"*).
- **Podcast Matching**: Search *Philosophize This!* RSS feed for relevant episode titles/descriptions.

---

## 📋 3. Schema Specifications & Ingestion Rules

All data files live in `data/`. Adhere strictly to the TypeScript interfaces in `src/lib/types.ts`:

### A. Philosopher (`data/philosophers.json`)
```json
{
  "id": "kebab-case-id",
  "name": "Full Name",
  "birthYear": -384,
  "deathYear": -322,
  "eraId": "classical-greek",
  "traditionId": "aristotelianism",
  "shortBio": "Concise 1-2 sentence biographical and intellectual summary.",
  "centralQuestion": "Core inquiry phrased as a question?",
  "keyWorks": [
    {
      "title": "Title of Work",
      "year": "350 BCE",
      "url": "https://en.wikipedia.org/wiki/...",
      "wikipediaUrl": "https://en.wikipedia.org/wiki/...",
      "description": "Brief description of the work."
    }
  ],
  "sepSlug": "canonical-sep-slug",
  "importanceScore": 92
}
```
*Valid `eraId`: `pre-socratic`, `classical-greek`, `hellenistic`, `eastern`, `medieval`, `early-modern`, `enlightenment`, `german-idealism`, `nineteenth-century`, `twentieth-century`, `contemporary`.*
*Valid `traditionId`: Consult `data/traditions.json`.*

### B. Concept (`data/concepts.json`)
> [!CAUTION]
> Concepts MUST use `title`, `summary`, and `branch`. Never use `name` or `description`. Missing these fields causes client-side runtime errors.
```json
{
  "id": "kebab-case-concept",
  "title": "Canonical Concept Name",
  "branch": "metaphysics",
  "eraId": "medieval",
  "introducedBy": "philosopher-id",
  "summary": "Precise philosophical explanation of the concept and its significance.",
  "sepSlug": "optional-sep-slug",
  "importanceScore": 90
}
```
*Valid `branch`: `'epistemology' | 'metaphysics' | 'ethics' | 'political' | 'aesthetics' | 'mind' | 'logic'`.*

### C. Edge (`data/edges.json`)
> [!IMPORTANT]
> **Zero Isolated Nodes Rule**: Every philosopher and concept must be connected to the graph. No dangling references are permitted.
```json
{
  "source": "source-id",
  "target": "target-id",
  "type": "DEVELOPED",
  "strength": 5,
  "label": "Specific description of the dialectical relationship"
}
```
*Valid `type`:*
- `INFLUENCED`: Direct historical mentorship, transmission, or general conceptual inheritance.
- `CRITIQUED`: Direct refutation, counter-argument, or dialectical opposition.
- `DEVELOPED`: Extended, systematized, or carried a precursor's premise forward.
- `SYNTHESIZED`: Reconciled two seemingly incompatible traditions or opposing premises.

### D. Media & Audio Podcast Ingestion (`data/media.json`)
1. Add SEP entry in `data/media.json`:
   ```json
   {
     "id": "sep-<philosopher-id>",
     "targetId": "<philosopher-id>",
     "type": "encyclopedia",
     "title": "<Name> - Stanford Encyclopedia of Philosophy",
     "url": "https://plato.stanford.edu/entries/<sepSlug>/",
     "creator": "Stanford University",
     "summary": "Canonical academic comprehensive overview of <Name>'s philosophical life, works, and arguments."
   }
   ```
2. In `scripts/ingest-philosophizethis.mjs`:
   Add the philosopher matcher regex to `PHILOSOPHER_MATCHERS`.
3. Run ingestion:
   ```bash
   npm run ingest
   ```

---

## 🛠️ 4. Execution & PR Workflow (Tandem Git Worktrees)

1. **Fetch Latest Main & Provision Worktree**:
   ```bash
   git fetch origin main
   WORKTREE_DIR="../agent-worktrees/philosophia-feat-add-<name>"
   git worktree add -b "feat/add-<name>" "$WORKTREE_DIR" origin/main
   cd "$WORKTREE_DIR" && ln -s ../../philosophy-graph/node_modules ./node_modules
   ```

2. **Implement Data & Add Pathfinding Tests**:
   - Update `data/philosophers.json`, `data/concepts.json`, `data/edges.json`, and `data/media.json`.
   - Update `tests/data-integrity.test.ts` to assert that the new thinker/concept resolves in lineage pathfinding tests (e.g. `findInfluencePath`).

3. **Verify Test Suite & Production Build**:
   ```bash
   npm test       # Validates schemas, no dangling edges, no isolated concepts, pathfinding
   npm run build  # Validates Next.js static site generation and zero type errors
   ```

4. **Atomic Commit & Pull Request**:
   ```bash
   git add data/ scripts/ tests/ docs/
   git commit -m "feat(canon): add <Name>, <concept>, and dialectical bridges"
   git push -u origin "feat/add-<name>"
   gh pr create --title "feat(canon): add <Name> and dialectical bridges" --body "<summary>"
   ```
   > [!WARNING]
   > Agents are strictly forbidden from running `gh pr merge` or pushing directly to `main`. Leave the pull request open for human review.
