import { describe, it, expect } from 'vitest';
import { getVisualGraph } from '../src/lib/graph/graph-service';

describe('Concept Targeted Focal Injection & Canvas Spotlighting', () => {
  it('injects focused concept and its incident edges when includeConcepts is false', () => {
    // By default, when includeConcepts is false, no concepts are rendered
    const defaultGraph = getVisualGraph({ includeConcepts: false });
    const defaultConceptCount = defaultGraph.nodes.filter((n) => n.type === 'concept').length;
    expect(defaultConceptCount).toBe(0);

    // When focusedNodeId is provided for a concept, only that concept is spotlighted
    const spotlightGraph = getVisualGraph({
      includeConcepts: false,
      focusedNodeId: 'categorical-imperative',
    });

    const conceptsInGraph = spotlightGraph.nodes.filter((n) => n.type === 'concept');
    expect(conceptsInGraph.length).toBe(1);
    expect(conceptsInGraph[0].id).toBe('categorical-imperative');
    expect(conceptsInGraph[0].name).toBe('The Categorical Imperative');

    // Edge connected to the introducing philosopher (Kant) is present in links
    const relevantLinks = spotlightGraph.links.filter(
      (l) => l.source === 'immanuel-kant' && l.target === 'categorical-imperative'
    );
    expect(relevantLinks.length).toBeGreaterThan(0);
    expect(relevantLinks[0].type).toBe('DEVELOPED');

    // Other concepts remain excluded (no map clutter)
    expect(spotlightGraph.nodes.find((n) => n.id === 'theory-of-forms')).toBeUndefined();
    expect(spotlightGraph.nodes.find((n) => n.id === 'will-to-power')).toBeUndefined();
  });

  it('guarantees valid finite coordinates for spotlighted concept', () => {
    const { nodes } = getVisualGraph({
      includeConcepts: false,
      focusedNodeId: 'theory-of-forms',
    });

    const formsNode = nodes.find((n) => n.id === 'theory-of-forms');
    expect(formsNode).toBeDefined();
    expect(typeof formsNode?.x).toBe('number');
    expect(typeof formsNode?.y).toBe('number');
    expect(Number.isFinite(formsNode?.x)).toBe(true);
    expect(Number.isFinite(formsNode?.y)).toBe(true);
  });

  it('injects introducing philosopher if missing due to era isolation', () => {
    // Isolating to antiquity would normally exclude 18th-century Kant
    const eraGraph = getVisualGraph({
      includeConcepts: false,
      eraId: 'classical-antiquity',
      focusedNodeId: 'categorical-imperative',
    });

    // Both the concept and its author are guaranteed to be present
    expect(eraGraph.nodes.find((n) => n.id === 'categorical-imperative')).toBeDefined();
    expect(eraGraph.nodes.find((n) => n.id === 'immanuel-kant')).toBeDefined();
  });

  it('retains focused node when exploration filter is active', () => {
    // Filter to citadel nodes only
    const explorationGraph = getVisualGraph({
      explorationFilter: 'citadel',
      focusedNodeId: 'categorical-imperative',
    });

    // The focused concept is preserved on the visual canvas
    expect(explorationGraph.nodes.find((n) => n.id === 'categorical-imperative')).toBeDefined();
  });

  it('reverts to clean graph when focusedNodeId is cleared', () => {
    const cleanGraph = getVisualGraph({
      includeConcepts: false,
      focusedNodeId: null,
    });

    expect(cleanGraph.nodes.filter((n) => n.type === 'concept').length).toBe(0);
  });
});
