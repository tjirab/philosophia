# Philosophia Layout & UX Architecture Guidelines

## 1. Vision & Aesthetic Core
**Philosophia** is designed as a *Classical Scholar’s Folio and Renaissance Cartographic Instrument*. The interface maps the intellectual constellation of human thought from Antiquity to Modernity. 

The aesthetic is anchored by:
* **Classical Typography**: `Cinzel` for classical headings, `EB Garamond` for literature and titles, and clean monospace for metrics, formulas, and dates.
* **Warm, Tactile Palettes**: Classical parchment (`#f7f3ea`) in light mode and deep obsidian leather (`#0e0d0b`) in dark mode, accented with subtle gold foil highlights (`var(--gold-accent)`).
* **Calm & Serenity**: An intellectual atlas must inspire contemplation, not cognitive fatigue. The canvas must breathe.

---

## 2. Spatial Layout System (The Quad-Zone Hierarchy)

To eliminate visual cacophony, controls are partitioned into four strict non-overlapping zones:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [Zone 1: Global Chrome] Logo | Subtitle | Search, Trace, Utilities                    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [Zone 2: Canvas Dock]                                                                  │
│  [Epoch ▾] [Layers & Branches ▾] [Cartography ▾] [✦ Lineage]                           │
│                                                                                        │
│                               GRAPH VIEWPORT CANVAS                                    │
│                                                                                        │
│                                                                 [Zone 3: Navigation]   │
│                                                                               [ + ]    │
│                                                                               [ − ]    │
│ [Zone 2b: Timeline Scrubber (Conditional)]                                    [ ⛶ ]    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Zone 1: Global Chrome (`<header>`, Fixed Top, `h-16`)
The top bar provides global orientation and discovery:
* **Left**: Brand mark (Compass icon) + `PHILOSOPHIA` + `Lineage of Ideas` + Subtitle.
* **Right**: Global actions and utilities:
  1. Primary search (`⌘K Search Folio`)
  2. Action trigger (`Trace Lineage`)
  3. Legend (`Folio Key`)
  4. Appearance (`Theme / Font`)
  5. Contribute (`GitPullRequest`)
*(Note: Disciplinary domain and branch filtering are unified directly inside Zone 2's `GraphLayersMenu` ["Layers & Branches"] to prevent header clutter and duplicate controls).*

### Zone 2: Viewport Filter Dock (Top-Left Canvas, `top-4 left-4`)
Controls that slice or filter the visible graph on the canvas:
* **Maximum 3 Trigger Pills**:
  1. **`EpochNavigator`**: Chronological era selector and guided historical playback.
  2. **`GraphLayersMenu`**: Progressive disclosure popover for:
     * Disciplinary Domain focus (`All Disciplines`, `Philosophy`, `Psychology`, `Sociology`, `Bridges`).
     * Landmark Concepts toggle (Show/hide diamond concept nodes).
     * Philosophical Branch focus dynamically tailored to the active discipline (Epistemology, Metaphysics, Ethics, Mind, Logic, etc.).
     * Graph density / spread multiplier (Compact 1.4x, Balanced 1.9x, Spacious 2.4x).
  3. **`ExplorationHud`**: Progressive disclosure popover for:
     * Cartography relief map (Terra Incognita / Fog of War toggle).
     * Terrain classification filter (Citadels, Frontiers, Outposts, Terra Incognita).
     * Historiographical Methodology lens (Canonical Consensus, Citation PageRank, Dialectical Controversy).
     * Field Almanac & Cartography Guide triggers.
  4. **Active Lineage Indicator** (Conditional): Appears only when a path is being traced, showing hop count and clear button.
* *Strict Anti-Drift Rule*: **Never add standalone buttons directly into Zone 2**. Any new filter, toggle, or layer must be placed inside `GraphLayersMenu` or `ExplorationHud` under progressive disclosure.

### Zone 3: Canvas Navigation Stack (Bottom-Right, `bottom-6 right-6`)
Graph viewport mechanics:
* Zoom In (`+`), Zoom Out (`-`), Zoom to Fit (`⛶`).
* Placed in the **bottom-right corner** (matching standards in Google Maps, Figma, and Obsidian Graph).
* *Rule*: Viewport navigation must never be placed in the top right, preventing collisions with the top filter dock or slide-out drawer headers.

### Zone 4: Contextual Dossiers & Modals (`z-40` / `z-50`)
* **Node Dossier Drawer** (`DossierDrawer.tsx`): Slides over from right (450–540px width) when a thinker or concept is selected.
* **Edge Dossier Drawer** (`EdgeDossierDrawer.tsx`): Slides over from right when an influence edge is clicked, presenting academic proof, citations, and dialectical synthesis.
* **Modals**: Centered overlays with backdrop-blur for deep workflows (Lineage Pathfinding, Search Palette, Folio Key Legend, Field Almanac, Suggestion modal).

---

## 3. Visual Restraint & Typography Standards
1. **No Raw Emojis in Navigation**: Do not put emojis (`🏛️`, `⚔️`, `🧭`, `🌫️`) in primary toolbar buttons. Use Lucide icons (`Landmark`, `Swords`, `Compass`, `Map`, `Layers`) or clean classical typography. Emojis are reserved strictly for rich content cards and almanac descriptions.
2. **Color Economy**: Do not mix competing saturated accent colors. Maintain the classical hierarchy:
   * Gold (`var(--gold-accent)`) for active filters, selected nodes, and primary actions.
   * Dialectical Edge Colors: Blue (Influenced), Teal (Developed), Red (Critiqued), Purple (Synthesized).
3. **Responsive Scaling**: On small screens (`< 1024px`), secondary text in header buttons (`Search Folio` label, `Folio Key` label) collapses to icon-only buttons to prevent navbar overflow.
