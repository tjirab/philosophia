import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getVisualGraph, concepts, philosophers, edges } from '../src/lib/graph/graph-service';

describe('Locate Concept Deep Linking & Graph Framing', () => {
  const forceGraphCode = fs.readFileSync(
    path.resolve(__dirname, '../src/components/graph/ForceGraphView.tsx'),
    'utf-8'
  );

  const mainPageCode = fs.readFileSync(
    path.resolve(__dirname, '../src/app/page.tsx'),
    'utf-8'
  );

  const conceptPageCode = fs.readFileSync(
    path.resolve(__dirname, '../src/app/concept/[id]/page.tsx'),
    'utf-8'
  );

  it('guarantees that unconscious-psychoanalysis is present in the visual graph with valid coordinates and edges', () => {
    const graph = getVisualGraph({
      domainId: 'all',
      eraId: 'all',
      includeConcepts: true,
      focusedNodeId: 'unconscious-psychoanalysis',
    });

    const conceptNode = graph.nodes.find((n) => n.id === 'unconscious-psychoanalysis');
    expect(conceptNode).toBeDefined();
    expect(conceptNode?.name).toBe('Dynamic Unconscious');
    expect(conceptNode?.type).toBe('concept');
    expect(typeof conceptNode?.x).toBe('number');
    expect(typeof conceptNode?.y).toBe('number');
    expect(Number.isFinite(conceptNode?.x)).toBe(true);
    expect(Number.isFinite(conceptNode?.y)).toBe(true);

    // Connected to formulating thinker (Sigmund Freud)
    const freudEdge = graph.links.find(
      (l) => l.source === 'sigmund-freud' && l.target === 'unconscious-psychoanalysis'
    );
    expect(freudEdge).toBeDefined();
    expect(freudEdge?.type).toBe('DEVELOPED');
  });

  it('polls camera centering until fgRef is bound to support dynamically loaded ForceGraph2D', () => {
    // Verifies that centerCamera polls using requestAnimationFrame until fgRef.current is ready
    expect(forceGraphCode).toContain('const attemptCenter = () => {');
    expect(forceGraphCode).toContain('animId = requestAnimationFrame(attemptCenter);');
    expect(forceGraphCode).toContain('attemptCenter();');
  });

  it('prevents initial zoomToFit from overriding node or edge deep-linking framing', () => {
    // Initial zoomToFit must check that neither selectedNodeId nor selectedEdgeId is active
    expect(forceGraphCode).toContain('!hasInitialFitRef.current && !selectedNodeId && !selectedEdgeId');
  });

  it('initializes showConcepts state directly from URL searchParams to eliminate render race conditions', () => {
    expect(mainPageCode).toContain('const initialNode = searchParams.get(\'node\');');
    expect(mainPageCode).toContain('isInitialConcept');
    expect(mainPageCode).toContain('useState<boolean>(isInitialConcept)');
  });

  it('relaxes domain and branch filters when a concept belonging to another discipline is selected', () => {
    expect(mainPageCode).toContain('if (conc && selectedDomain !== \'all\') {');
    expect(mainPageCode).toContain('if (conc && selectedBranch !== \'all\' && conc.branch !== selectedBranch) {');
    expect(mainPageCode).toContain('setSelectedBranch(\'all\');');
  });

  it('distinguishes concept locating from thinker locating on concept folio page', () => {
    // Header locates the concept
    expect(conceptPageCode).toContain('href={`/?node=${concept.id}`}');
    expect(conceptPageCode).toContain('Locate in Graph');

    // Originating thinker card specifies locating the thinker
    expect(conceptPageCode).toContain('href={`/?node=${introducedByPhilosopher.id}`}');
    expect(conceptPageCode).toContain('<span>Locate Thinker in Graph</span>');
  });
});
