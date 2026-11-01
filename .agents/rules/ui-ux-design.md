---
description: Enforces the Quad-Zone UI/UX layout hierarchy and prevents control sprawl across the graph viewport
trigger: always_on
---

# Philosophia UI/UX Layout Rules

Whenever editing or creating UI components in `src/`:

1. **Adhere to the Quad-Zone Spatial Hierarchy**:
   * **Zone 1 (Header `h-16`)**: Reserved strictly for global branding, domain selector, global search (`⌘K`), and high-level utilities (`Folio Key`, `Theme`, `Contribute`).
   * **Zone 2 (Canvas Viewport Dock `top-4 left-4`)**: Strictly limited to 3 cluster popovers:
     - `EpochNavigator`: Chronological timeline & playback.
     - `GraphLayersMenu`: Landmark concepts, branch filtering, density.
     - `ExplorationHud`: Cartography relief, terrain classification, historiographical methodology lens.
     - (Active Lineage Indicator when tracing paths).
   * **Zone 3 (Navigation Stack `bottom-6 right-6`)**: Zoom In, Zoom Out, Zoom to Fit. Never place zoom controls in the top-right corner.
   * **Zone 4 (Dossiers & Modals)**: Right slide-over drawers for thinker/edge dossiers; centered modals for deep tools.

2. **Prohibition Against Loose Canvas Controls**:
   * Never add standalone, uncoordinated buttons or toggles directly to the graph canvas.
   * Any new filter, layer, or visualization dial must be placed inside `GraphLayersMenu` or `ExplorationHud` under progressive disclosure.

3. **No Raw Emojis in Primary Navigation**:
   * Use Lucide SVG icons (`Landmark`, `Swords`, `Compass`, `Map`, `Layers`) and classical typography instead of raw emojis in toolbar buttons.

4. **Reference Documentation**:
   * Consult `docs/layout_and_ux_architecture.md` for complete design specifications.
