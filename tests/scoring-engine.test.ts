import { describe, it, expect } from 'vitest';
import {
  computePageRank,
  computeDialecticalFriction,
  applyScoringMethodology,
} from '../src/lib/graph/scoring-engine';
import {
  computeHybridCanonicalScores,
  compareByDeterministicRank,
  inferCanonTier,
} from '../src/lib/graph/scoring-algorithms.mjs';
import { VisualNode, VisualLink, METHODOLOGY_CONFIG } from '../src/lib/types';
import philosophersData from '../data/philosophers.json';
import conceptsData from '../data/concepts.json';
import edgesData from '../data/edges.json';

describe('Runtime Scoring Engine & Historiographical Methodology Calculator', () => {
  it('computes directed PageRank correctly across an intellectual network', () => {
    const nodeIds = ['plato', 'aristotle', 'kant', 'fichte'];
    const links = [
      { source: 'plato', target: 'aristotle' },
      { source: 'aristotle', target: 'kant' },
      { source: 'plato', target: 'kant' },
      { source: 'kant', target: 'fichte' },
    ];

    const pr = computePageRank(nodeIds, links, { iterations: 20 });
    expect(pr.size).toBe(4);

    let sum = 0;
    for (const val of pr.values()) {
      sum += val;
    }
    expect(sum).toBeCloseTo(1.0, 3);

    const platoPr = pr.get('plato') || 0;
    const fichtePr = pr.get('fichte') || 0;
    expect(platoPr).toBeGreaterThan(fichtePr);
  });

  it('computes Bayesian-smoothed dialectical friction without 2-edge ratio saturation', () => {
    const nodeIds = ['dogmatist', 'rebel', 'synthesizer', 'sparse-contrarian', 'other'];
    const links = [
      { source: 'dogmatist', target: 'rebel', type: 'CRITIQUED' },
      { source: 'dogmatist', target: 'synthesizer', type: 'SYNTHESIZED' },
      { source: 'rebel', target: 'synthesizer', type: 'DEVELOPED' },
      { source: 'sparse-contrarian', target: 'other', type: 'CRITIQUED' },
    ];

    const friction = computeDialecticalFriction(nodeIds, links);
    expect(friction.size).toBe(5);

    const dogmatistFriction = friction.get('dogmatist')?.score || 0;
    expect(dogmatistFriction).toBeGreaterThan(30);

    // A 1-edge node should be damped well below 100 by the Laplace +3 smoothing prior
    const sparseScore = friction.get('sparse-contrarian')?.score || 0;
    expect(sparseScore).toBeLessThan(60);

    const rebelFriction = friction.get('rebel')?.critiqueCount;
    expect(rebelFriction).toBe(1);
  });

  it('applies topology scoring methodology and dynamically rescales node importance and val', () => {
    const testNodes: VisualNode[] = [
      {
        id: 'plato',
        name: 'Plato',
        type: 'philosopher',
        eraId: 'classical-greek',
        importanceScore: 99,
        color: '#d4af37',
        summary: '',
        data: philosophersData[0] as any,
      },
      {
        id: 'aristotle',
        name: 'Aristotle',
        type: 'philosopher',
        eraId: 'classical-greek',
        importanceScore: 99,
        color: '#d4af37',
        summary: '',
        data: philosophersData[1] as any,
      },
      {
        id: 'minor-thinker',
        name: 'Minor Thinker',
        type: 'philosopher',
        eraId: 'contemporary',
        importanceScore: 40,
        color: '#94a3b8',
        summary: '',
        data: {} as any,
      },
    ];

    const testLinks: VisualLink[] = [
      { source: 'plato', target: 'aristotle', type: 'INFLUENCED', label: '' },
      { source: 'aristotle', target: 'minor-thinker', type: 'DEVELOPED', label: '' },
    ];

    const topologyScored = applyScoringMethodology(testNodes, testLinks, 'topology');
    expect(topologyScored).toHaveLength(3);

    const plato = topologyScored.find((n) => n.id === 'plato')!;
    const minor = topologyScored.find((n) => n.id === 'minor-thinker')!;

    expect(plato.methodology).toBe('topology');
    expect(plato.scoreBreakdown?.rank).toBe(1);
    expect(plato.importanceScore).toBeGreaterThan(minor.importanceScore);
    expect(plato.val).toBeGreaterThanOrEqual(minor.val || 0);
    expect(plato.scoreBreakdown?.components.length).toBeGreaterThan(0);
  });

  it('computes Hybrid Canonical Consensus identically between build-time compiler and runtime engine', () => {
    const allNodes: VisualNode[] = [
      ...philosophersData.map((p: any) => ({
        id: p.id,
        name: p.name,
        type: 'philosopher' as const,
        eraId: p.eraId,
        traditionId: p.traditionId,
        domains: p.domains,
        canonTier: p.canonTier,
        importanceScore: p.importanceScore,
        color: '#d4af37',
        summary: p.shortBio,
        data: p,
      })),
      ...conceptsData.map((c: any) => ({
        id: c.id,
        name: c.title,
        type: 'concept' as const,
        eraId: c.eraId,
        branch: c.branch,
        importanceScore: 50,
        color: '#94a3b8',
        summary: c.summary,
        data: c,
      })),
    ];

    const hybridMap = computeHybridCanonicalScores(allNodes, edgesData as any);
    const runtimeScored = applyScoringMethodology(allNodes, edgesData as any, 'canonical');

    for (const p of philosophersData as any[]) {
      const runtimeNode = runtimeScored.find((n) => n.id === p.id)!;
      const buildEntry = hybridMap.get(p.id)!;
      expect(runtimeNode.importanceScore).toBe(p.importanceScore);
      expect(runtimeNode.importanceScore).toBe(buildEntry.score);
      expect(runtimeNode.scoreBreakdown?.components.length).toBe(5);
    }
  });

  it('resolves ties deterministically without relying on birthYear ordering', () => {
    const a = { id: 'z-thinker', name: 'Z Thinker', score: 94, rawScore: 93.8, degree: 8 };
    const b = { id: 'a-thinker', name: 'A Thinker', score: 94, rawScore: 93.6, degree: 6 };
    const c = { id: 'b-thinker', name: 'B Thinker', score: 94, rawScore: 93.6, degree: 9 };
    const d = { id: 'c-thinker', name: 'C Thinker', score: 94, rawScore: 93.6, degree: 9 };

    const sorted = [d, b, a, c].sort(compareByDeterministicRank);
    expect(sorted.map((x) => x.id)).toEqual(['z-thinker', 'b-thinker', 'c-thinker', 'a-thinker']);
    expect(inferCanonTier({ canonTier: 'pillar', importanceScore: 70 })).toBe('pillar');
    expect(inferCanonTier({ importanceScore: 95 })).toBe('pillar');
    expect(inferCanonTier({ importanceScore: 91 })).toBe('bridge');
    expect(inferCanonTier({ importanceScore: 84 })).toBe('contributor');
  });

  it('provides complete metadata and formulas for all three methodologies', () => {
    const methodologies = ['canonical', 'topology', 'friction'] as const;
    for (const m of methodologies) {
      const meta = METHODOLOGY_CONFIG[m];
      expect(meta.id).toBe(m);
      expect(meta.name.length).toBeGreaterThan(0);
      expect(meta.icon.length).toBeGreaterThan(0);
      expect(meta.formula.length).toBeGreaterThan(0);
      expect(meta.description.length).toBeGreaterThan(0);
    }
  });

  it('runs on full dataset in under 50ms', () => {
    const nodes: VisualNode[] = philosophersData.map((p: any) => ({
      id: p.id,
      name: p.name,
      type: 'philosopher',
      eraId: p.eraId,
      traditionId: p.traditionId,
      domains: p.domains,
      canonTier: p.canonTier,
      importanceScore: p.importanceScore,
      color: '#d4af37',
      summary: p.shortBio,
      data: p,
    }));

    const start = performance.now();
    const scoredCanonical = applyScoringMethodology(nodes, edgesData as any, 'canonical');
    const scoredTopology = applyScoringMethodology(nodes, edgesData as any, 'topology');
    const scoredFriction = applyScoringMethodology(nodes, edgesData as any, 'friction');
    const elapsed = performance.now() - start;

    expect(scoredCanonical.length).toBe(philosophersData.length);
    expect(scoredTopology.length).toBe(philosophersData.length);
    expect(scoredFriction.length).toBe(philosophersData.length);
    expect(elapsed).toBeLessThan(50);
  });
});
