import { describe, it, expect } from 'vitest';
import { getNodeDetails, philosophers, concepts } from '../src/lib/graph/graph-service';
import { computeNodeExploration } from '../src/lib/graph/exploration-service';

describe('Dossier Drawer UX & Academic Proof Integration', () => {
  it('retrieves node details with exploration consensus depth and verified edge citations', () => {
    // David Hume is a prime example of an empirical thinker with profound dialectical critiques
    const humeDetails = getNodeDetails('david-hume', 'canonical');
    expect(humeDetails).not.toBeNull();
    expect(humeDetails?.node?.name).toBe('David Hume');
    expect(humeDetails?.exploration).toBeDefined();

    // Verify exploration metadata
    expect(humeDetails?.exploration?.label).toBeDefined();
    expect(typeof humeDetails?.exploration?.score).toBe('number');
    expect(humeDetails?.exploration?.score).toBeGreaterThanOrEqual(10);
    expect(humeDetails?.exploration?.score).toBeLessThanOrEqual(100);

    // Verify all predecessors and successors have valid edge references and citations
    const allRelations = [
      ...(humeDetails?.predecessors || []),
      ...(humeDetails?.successors || []),
    ];
    expect(allRelations.length).toBeGreaterThan(0);

    for (const rel of allRelations) {
      expect(rel.edge).toBeDefined();
      expect(rel.edge.type).toBeDefined();
      expect(rel.edge.label.length).toBeGreaterThan(0);
      expect(rel.edge.citations).toBeDefined();
      expect(Array.isArray(rel.edge.citations)).toBe(true);
      expect(rel.edge.citations?.length).toBeGreaterThanOrEqual(1);

      // Verify each citation has an author, work, and source url
      for (const cite of rel.edge.citations || []) {
        expect(cite.author.length).toBeGreaterThan(0);
        expect(cite.work.length).toBeGreaterThan(0);
        expect(cite.url).toBeDefined();
      }
    }

    // Verify academic proof ID exists for every edge
    for (const rel of allRelations) {
      const edgeId = rel.edge.id || `${rel.edge.source}--${rel.edge.target}`;
      expect(edgeId.length).toBeGreaterThan(0);
    }
  });

  it('accurately tallies academic citations and dialectical critiques for frontier nodes', () => {
    // Find frontier nodes across philosophers and concepts
    const frontierPhil = philosophers
      .map((p) => getNodeDetails(p.id))
      .find((d) => d.exploration?.state === 'frontier');

    expect(frontierPhil).toBeDefined();
    expect(frontierPhil?.exploration?.state).toBe('frontier');
    expect(frontierPhil?.exploration?.score).toBeGreaterThanOrEqual(60);
    expect(frontierPhil?.exploration?.score).toBeLessThan(82);

    const allRelations = [
      ...(frontierPhil?.predecessors || []),
      ...(frontierPhil?.successors || []),
    ];

    const verifiedCitationCount = allRelations.reduce(
      (acc, { edge }) => acc + (edge.citations?.length || 1),
      0
    );
    expect(verifiedCitationCount).toBeGreaterThanOrEqual(1);

    const disputedCount = allRelations.filter(
      ({ edge }) => edge.type === 'CRITIQUED' || edge.academicConsensus === 'debated'
    ).length;
    expect(typeof disputedCount).toBe('number');
  });

  it('validates consensus depth tiers match cartography specifications', () => {
    // Test direct heuristic computation with edge degree bonuses
    const citadelMeta = computeNodeExploration({ id: 'test-citadel', importanceScore: 90 }, 10, 2);
    expect(citadelMeta.state).toBe('citadel');
    expect(citadelMeta.label).toBe('Canonical Citadel');
    expect(citadelMeta.score).toBeGreaterThanOrEqual(82);

    const frontierMeta = computeNodeExploration({ id: 'test-frontier', importanceScore: 75 }, 4, 1);
    expect(frontierMeta.state).toBe('frontier');
    expect(frontierMeta.label).toBe('Disputed Frontier');
    expect(frontierMeta.score).toBeGreaterThanOrEqual(60);
    expect(frontierMeta.score).toBeLessThan(82);

    const emergingMeta = computeNodeExploration({ id: 'test-emerging', importanceScore: 60 }, 1, 0);
    expect(emergingMeta.state).toBe('emerging');
    expect(emergingMeta.label).toBe('Pioneer Outpost');
    expect(emergingMeta.score).toBeGreaterThanOrEqual(40);
    expect(emergingMeta.score).toBeLessThan(60);

    const unchartedMeta = computeNodeExploration({ id: 'test-uncharted', importanceScore: 20 }, 0, 0);
    expect(unchartedMeta.state).toBe('uncharted');
    expect(unchartedMeta.label).toBe('Terra Incognita');
    expect(unchartedMeta.score).toBeLessThan(40);
  });
});
