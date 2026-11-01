# Agent Guidelines for Philosophia

Welcome to **Philosophia** (`philosophia`), an interactive knowledge graph and dialectical cartography mapping intellectual influence across Philosophy, Psychology, and Sociology from Antiquity to Modernity.

All AI coding assistants (Gemini, Antigravity, Claude, etc.) operating in this repository must strictly adhere to the instructions below.

---

## 1. UI/UX Layout & Architecture Rules (Zero Layout Drift)

To prevent visual clutter, double-headers, and button sprawl, all agents must strictly adhere to [`docs/layout_and_ux_architecture.md`](./docs/layout_and_ux_architecture.md):

1. **The Quad-Zone Spatial Rule**:
   * **Zone 1 (Header `h-16`)**: Global branding, Disciplinary Domain Switcher (`All`, `Philosophy`, `Psychology`, `Sociology`, `Bridges`), Search (`⌘K`), Trace Lineage, and utility icons (`Folio Key`, `Theme`, `Contribute`).
   * **Zone 2 (Canvas Dock `top-4 left-4`)**: Strictly limited to 3 cluster popovers:
     1. `EpochNavigator` (Chronological timeline & playback)
     2. `GraphLayersMenu` (Concepts toggle, branch filtering, graph density)
     3. `ExplorationHud` (Terra Incognita fog of war, terrain filtering, historiographical scoring methodology, almanac)
     4. Active Lineage alert (conditional only)
   * **Zone 3 (Navigation Stack `bottom-6 right-6`)**: Zoom In, Zoom Out, Zoom to Fit. Never place zoom controls in the top-right corner.
   * **Zone 4 (Dossiers & Modals)**: Slide-out right drawers for node and edge details; centered overlays for deep instruments.
2. **No Loose Canvas Buttons**: Never add independent, loose filter buttons or toggles directly onto the graph canvas. All new filters must be integrated into `GraphLayersMenu` or `ExplorationHud` using progressive disclosure.
3. **No Raw Emojis in Primary Navigation**: Do not put emojis in primary toolbar pills or navbar buttons. Use Lucide SVG icons and classical typography matching `Cinzel` and `EB Garamond`.

---

## 2. Tandem Git Worktree Workflow

All feature development and bug fixes must follow the isolated git worktree workflow:

1. **Base Branch**: Always fetch latest `origin/main` without modifying local HEAD:
   ```bash
   git fetch origin main
   ```
2. **Provision Worktree**: Create a dedicated worktree off `origin/main`:
   ```bash
   WORKTREE_DIR="${AGENT_WORKTREES_DIR:-../agent-worktrees}/philosophia-<branch-slug>"
   git worktree add -b <branch-slug> "$WORKTREE_DIR" origin/main
   ```
3. **Dependencies & Build**: Run `npm install` and verify the modular data compiler runs cleanly.
4. **Testing**: All changes must be verified strictly inside `$WORKTREE_DIR` with `npm test` and `npm run build`. Diff test coverage must be 100%.
5. **Atomic Commit & PR**: Commit using Conventional Commits (`feat(...)`, `fix(...)`, `docs(...)`), push branch to origin, and create a PR via `gh pr create`.
6. **Forbidden**: **Agents are strictly forbidden from running `gh pr merge`, pushing directly to `main`, or merging into `main`.** PRs must remain open for human review.

---

## 3. Data Integrity & Canon Curation Protocol

When adding or modifying thinkers, concepts, or dialectical edges:
1. **Modular Storage**: Edit files under `data/philosophers/`, `data/concepts/`, `data/edges/`, and `data/media/`. Do not edit monolithic bundles directly; they are compiled by `scripts/build-data.mjs`.
2. **Zero Isolated Nodes**: Every thinker and concept must be connected to at least one valid dialectical edge (`INFLUENCED`, `DEVELOPED`, `CRITIQUED`, or `SYNTHESIZED`).
3. **Edge Weights & Academic Proof**:
   * Edge weights must be integer values between 1 and 5.
   * Every edge must provide `academicProof`: academic citation or historical source verifying the dialectical lineage.
4. **Life Dates**: Living thinkers must not have a `deathYear` field.
