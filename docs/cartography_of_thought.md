# Cartography of Thought & Fog of War

The **Cartography of Thought** (also referred to as **Fog of War** or **Terra Incognita**) is an Age-of-Discovery cartographic overlay in *Philosophia*. It transforms the philosophical constellation into an intellectual relief map, visualizing how thoroughly charted vs unexplored different domains, thinkers, and concepts are across history.

---

## 1. What is the "Small Circle" on the Canvas?

If you toggle on the exploration mode and notice a soft translucent circle following your mouse or surrounding a selected thinker:

> **That is the Dynamic Lantern Spotlight (Torchlight Field).**

In antique Age-of-Discovery charts, unexplored oceans (*Terra Incognita*) were shrouded in mist and sea serpents until an explorer sailed through with a lantern. 
- In *Philosophia*, as you move your cursor across the canvas, it projects a **~240px radial lantern field** across the parchment.
- This dynamic spotlight softly dispels ambient background mists and illuminates node border beacons, compass rings, and citadel hearth halos as you explore.
- If you click the **🌫️ Terra Incognita** pill in the top HUD, the graph also isolates only uncharted nodes (such as *Nagarjuna* or *Zhuangzi*), leaving only a couple of isolated nodes with celestial dashed rings on the canvas.

---

## 2. Relief Map vs RTS Fog of War

Unlike video-game Real-Time Strategy (RTS) fog of war where unexplored territory is completely blacked out until clicked:
- *Philosophia* functions as an **intellectual relief map**.
- The entire constellation remains structurally navigable, but every node and branch is quantified and rendered according to its academic consensus, publication density, and unresolved controversy.
- This allows researchers, students, and curious explorers to immediately discern established canonical strongholds from active philosophical battlegrounds and historically marginalized traditions.

---

## 3. The 4 Cartographic Terrains

Every thinker and concept is scored from `0` to `100` and categorized into one of four terrains:

| Terrain | Research Depth | Canvas Halo | Node Border Geometry | Description & Canonical Examples |
| :--- | :---: | :--- | :--- | :--- |
| 🏛️ **Canonical Citadel** | `82 – 100` | Golden Amber Hearth Glow | Double rim with 8 crenellated rampart ticks | Foundational strongholds with massive primary literature, established commentaries, and institutional consensus (*Plato*, *Aristotle*, *Descartes*, *Kant*). |
| ⚔️ **Disputed Frontier** | `60 – 81` | Crimson / Rose Dialectical Aura | Dual dialectical contrast ring | Active intellectual battlegrounds with competing paradigms, high critique-to-synthesis ratios, and ongoing debate (*Philosophy of Mind*, *Free Will*, *David Chalmers*, *Frantz Fanon*). |
| 🧭 **Pioneer Outpost** | `40 – 59` | Teal Radiance | Dashed diamond ring | Rapidly expanding modern inquiry bridging empirical sciences, computing, and social paradigms (*Alan Turing*, *Cognitive Science*, *Philosophy of AI*). |
| 🌫️ **Terra Incognita** | `< 40` | Indigo Celestial Haze | Antique dashed compass rose + North Star glyph (`✦`) | Historically marginalized traditions (e.g., classical non-Western traditions) or open conceptual voids (*Nagarjuna*, *Zhuangzi*, *Emptiness / Śūnyatā*). |

---

## 4. Research Depth Scoring & Methodology Switcher

Research Depth is computed through a hybrid engine combining:
1. **PhilPapers Literature Volume**: Base academic publication volume across philosophical sub-fields (`data/field_exploration.json`).
2. **Historical Weight vs Contemporary Velocity**: How long a tradition has been sustained vs its current publication acceleration.
3. **Network Topology & Dialectical Tension**: Degree centrality (incoming/outgoing influence edges), adjusted by the ratio of `CRITIQUED` and `SYNTHESIZED` connections.

### Historiographical Methodology Switcher

Historical depth can be evaluated through four distinct lenses via the HUD methodology dropdown:

- **🏛️ Canonical Weight (Default)**: Prioritizes foundational historical permanence, primary corpus volume, and centuries of continuous commentary.
- **⚔️ Dialectical Tension**: Amplifies intellectual friction, rewarding schools and thinkers embroiled in active dispute, rebuttal, and paradigm clashes.
- **⚡ Contemporary Velocity**: Emphasizes 20th–21st century publication surges, emergent scientific intersections, and modern citations.
- **🌐 Global Inclusivity**: Mitigates Eurocentric canonical biases, elevating non-Western wisdom traditions (Buddhist, Daoist, Islamic, African philosophies) into prominent visibility.

---

## 5. UI Controls & Interactive Features

### The Exploration HUD
When you activate the top floating bar toggle (`Terra Incognita (Fog of War)`):
- **All Terrain Pill**: Displays the full philosophical constellation with halos enabled.
- **Terrain Filter Pills**: Click `🏛️ Citadels`, `⚔️ Frontiers`, `🧭 Outposts`, or `🌫️ Terra Incognita` to dynamically prune the graph to nodes of that specific class.
- **Methodology Dropdown**: Switch historiographical perspectives in real time.
- **Field Almanac (`BookOpen`)**: Opens a comprehensive breakdown of all philosophical branches (Metaphysics, Epistemology, Ethics, Mind, Science, etc.) with publication volumes, mapped ground summaries, and active open problems.
- **Guide (`?`)**: Displays an instant in-app guide explaining the map legend, lantern spotlight, and scoring tiers.

### Node Dossier Drawer
Clicking on any thinker or concept reveals an **Exploration & Research Depth** card inside the slide-out dossier:
- **Charted Depth Score**: Exact numerical rating (`0 – 100`).
- **Cartographic Tagline**: Context on why the thinker sits in that terrain tier.
- **Open Problems & Frontiers**: Curated list of unresolved questions and contemporary paradoxes associated with that node.

---

## 6. Technical Implementation

The exploration system is implemented across several core modules:
- [`src/lib/graph/exploration-service.ts`](file:///Users/bartschuijt/git/philosophy-graph/src/lib/graph/exploration-service.ts): Computes hybrid scores, terrain classifications, and branch statistics.
- [`src/lib/graph/fog-renderer.ts`](file:///Users/bartschuijt/git/philosophy-graph/src/lib/graph/fog-renderer.ts): HTML5 Canvas routines for citadel hearth halos, lantern dispel spot gradients, crenellated ramparts, and compass beacons.
- [`src/components/exploration/ExplorationHud.tsx`](file:///Users/bartschuijt/git/philosophy-graph/src/components/exploration/ExplorationHud.tsx): React component managing the HUD bar, filter pills, almanac drawer, and guide modal.
- [`data/field_exploration.json`](file:///Users/bartschuijt/git/philosophy-graph/data/field_exploration.json): Baseline academic publication volume, historical weights, and notable open problems.
