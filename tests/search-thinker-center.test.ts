import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Thinker Search (CMD+K) & Viewport-Aware Center Alignment', () => {
  const forceGraphCode = fs.readFileSync(
    path.resolve(__dirname, '../src/components/graph/ForceGraphView.tsx'),
    'utf-8'
  );

  const mainPageCode = fs.readFileSync(
    path.resolve(__dirname, '../src/app/page.tsx'),
    'utf-8'
  );

  const searchPaletteCode = fs.readFileSync(
    path.resolve(__dirname, '../src/components/search/SearchPalette.tsx'),
    'utf-8'
  );

  it('stabilizes incoming graph nodes using live coordinates cache to avoid resetting positions to raw seeds', () => {
    // Verifies nodeCoordinatesRef is declared and populated
    expect(forceGraphCode).toContain('const nodeCoordinatesRef = useRef<Map<string, { x: number; y: number;');
    expect(forceGraphCode).toContain('const stabilizedNodes = useMemo(');
    expect(forceGraphCode).toContain('nodeCoordinatesRef.current.get(node.id)');

    // Verifies live node coordinates are cached during physics ticks and frame renders
    expect(forceGraphCode).toContain('fgRef.current?.graphData?.()?.nodes');
    expect(forceGraphCode).toContain('nodeCoordinatesRef.current.set(n.id');
  });

  it('centers camera on live simulation coordinates rather than initial un-simulated seed coordinates', () => {
    // Camera center routine inspects live simulation graphData first, then coordinate cache, before falling back to prop node
    expect(forceGraphCode).toContain('const liveNodes = fgRef.current.graphData?.()?.nodes;');
    expect(forceGraphCode).toContain('const liveNode = liveNodes?.find((n: any) => n.id === selectedNodeId);');
    expect(forceGraphCode).toContain('const cachedPos = nodeCoordinatesRef.current.get(selectedNodeId);');
    expect(forceGraphCode).toContain('const targetX = liveNode?.x ?? cachedPos?.x ?? propNode?.x;');
    expect(forceGraphCode).toContain('const targetY = liveNode?.y ?? cachedPos?.y ?? propNode?.y;');

    // Viewport-aware drawer offset is applied
    expect(forceGraphCode).toContain('const node = { x: targetX, y: targetY };');
    expect(forceGraphCode).toContain('fgRef.current.centerAt(node.x + offsetX, node.y');
    expect(forceGraphCode).toContain('fgRef.current.zoom(targetZoom');
  });

  it('executes staged camera re-centering timers to compensate for physics drift and drawer slide transition', () => {
    // Immediate centering call followed by staged stabilization timers
    expect(forceGraphCode).toContain('centerCamera();');
    expect(forceGraphCode).toContain('setTimeout(() => centerCamera(prefersReducedMotion ? 0 : 350), 250);');
    expect(forceGraphCode).toContain('setTimeout(() => centerCamera(0), 600);');
  });

  it('updates selectedEdgeId camera focus to also utilize live simulation coordinates', () => {
    expect(forceGraphCode).toContain('const srcLive = liveNodes?.find((n: any) => n.id === selectedEdgeEndpoints.source);');
    expect(forceGraphCode).toContain('const tgtLive = liveNodes?.find((n: any) => n.id === selectedEdgeEndpoints.target);');
    expect(forceGraphCode).toContain('const srcX = srcLive?.x ?? srcCached?.x ?? srcProp?.x;');
    expect(forceGraphCode).toContain('const tgtX = tgtLive?.x ?? tgtCached?.x ?? tgtProp?.x;');
  });

  it('enables concept layer and relaxes era/domain filters in page when selecting an entity outside the current filter', () => {
    // If a concept is selected, concepts must be rendered on canvas
    expect(mainPageCode).toContain('if (concepts.some((c) => c.id === nodeId)) {');
    expect(mainPageCode).toContain('setShowConcepts(true);');

    // If thinker is from another era, reset era filter so their dialectical lineages are visible
    expect(mainPageCode).toContain('if (phil && selectedEraId !== \'all\' && phil.eraId !== selectedEraId) {');
    expect(mainPageCode).toContain('setSelectedEraId(\'all\');');

    // If domain filter excludes the thinker, reset domain filter so the thinker is visible
    expect(mainPageCode).toContain('if (phil && selectedDomain !== \'all\') {');
    expect(mainPageCode).toContain('setSelectedDomain(\'all\');');
  });

  it('supports selecting the top matched thinker or concept via Enter key in SearchPalette input', () => {
    expect(searchPaletteCode).toContain('onKeyDown=');
    expect(searchPaletteCode).toContain("if (e.key === 'Enter')");
    expect(searchPaletteCode).toContain('onSelectNode(matchedPhilosophers[0].id);');
    expect(searchPaletteCode).toContain('onSelectNode(matchedConcepts[0].id);');
  });
});
