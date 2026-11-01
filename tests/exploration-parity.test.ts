import { describe, it, expect } from 'vitest';
import { getVisualGraph, getNodeDetails, getThinkerDetails } from '../src/lib/graph/graph-service';

describe('Cartographic Exploration State Parity (Map vs Dossier & Thinker Folio)', () => {
  it('ensures Kierkegaard has Canonical Citadel status identically on the map and in the dossier', () => {
    // Test with default map settings where concepts are hidden
    const graphNoConcepts = getVisualGraph({ includeConcepts: false });
    const kNodeNoConcepts = graphNoConcepts.nodes.find((n) => n.id === 'soren-kierkegaard');

    expect(kNodeNoConcepts).toBeDefined();
    expect(kNodeNoConcepts?.exploration?.state).toBe('citadel');
    expect(kNodeNoConcepts?.exploration?.label).toBe('Canonical Citadel');
    expect(kNodeNoConcepts?.exploration?.badgeIcon).toBe('🏛️');
    expect(kNodeNoConcepts?.exploration?.score).toBe(87);

    // Test with concepts visible
    const graphWithConcepts = getVisualGraph({ includeConcepts: true });
    const kNodeWithConcepts = graphWithConcepts.nodes.find((n) => n.id === 'soren-kierkegaard');

    expect(kNodeWithConcepts).toBeDefined();
    expect(kNodeWithConcepts?.exploration?.state).toBe('citadel');
    expect(kNodeWithConcepts?.exploration?.score).toBe(87);

    // Test drawer node details
    const nodeDetails = getNodeDetails('soren-kierkegaard');
    expect(nodeDetails.exploration).toBeDefined();
    expect(nodeDetails.exploration?.state).toBe('citadel');
    expect(nodeDetails.exploration?.label).toBe('Canonical Citadel');
    expect(nodeDetails.exploration?.score).toBe(87);

    // Test thinker folio page details
    const thinkerDetails = getThinkerDetails('soren-kierkegaard');
    expect(thinkerDetails).not.toBeNull();
    expect(thinkerDetails?.exploration?.state).toBe('citadel');
    expect(thinkerDetails?.exploration?.label).toBe('Canonical Citadel');
    expect(thinkerDetails?.exploration?.score).toBe(87);

    // Verify absolute parity across all representations
    expect(kNodeNoConcepts?.exploration?.state).toBe(nodeDetails.exploration?.state);
    expect(kNodeNoConcepts?.exploration?.score).toBe(nodeDetails.exploration?.score);
    expect(kNodeNoConcepts?.exploration?.label).toBe(nodeDetails.exploration?.label);
    expect(thinkerDetails?.exploration?.state).toBe(nodeDetails.exploration?.state);
  });

  it('ensures all thinkers maintain identical exploration classifications regardless of concept visibility or era isolation', () => {
    const fullGraph = getVisualGraph({ includeConcepts: true, eraId: 'all' });
    const filteredGraph = getVisualGraph({ includeConcepts: false, eraId: 'nineteenth-century' });

    for (const node of filteredGraph.nodes) {
      if (node.type === 'philosopher') {
        const fullNode = fullGraph.nodes.find((n) => n.id === node.id);
        const details = getNodeDetails(node.id);

        expect(node.exploration?.state).toBe(details.exploration?.state);
        expect(node.exploration?.score).toBe(details.exploration?.score);
        expect(node.exploration?.label).toBe(details.exploration?.label);

        if (fullNode) {
          expect(node.exploration?.state).toBe(fullNode.exploration?.state);
          expect(node.exploration?.score).toBe(fullNode.exploration?.score);
        }
      }
    }
  });
});
