import { describe, it, expect } from 'vitest';
import {
  computePageRank,
  computeDialecticalFriction,
  applyScoringMethodology,
} from '../src/lib/graph/scoring-engine';
import { VisualNode, VisualLink, METHODOLOGY_CONFIG } from '../src/lib/types';
import philosophersData from '../data/philosophers.json';
import edgesData from '../data/edges.json';

describe('Runtime Scoring Engine & Historiographical Methodology Calculator', () => {
  it('computes directed PageRank correctly across an intellectual network', () => {
    const nodeIds = ['plato', 'aristotle', 'kant', 'fichte'];
    // In historical influence: Plato influenced Aristotle, Kant influenced Fichte
    // In citation authority: Aristotle cites Plato, Fichte cites Kant
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
    // PageRank probability distribution sums to 1.0
    expect(sum).toBeCloseTo(1.0, 3);

    // Plato is cited by Aristotle and Kant, so Plato should have substantial authority
    const platoPr = pr.get('plato') || 0;
    const fichtePr = pr.get('fichte') || 0;
    expect(platoPr).toBeGreaterThan(fichtePr);
  });

  it('computes dialectical friction and controversy scores based on critique edges', () => {
    const nodeIds = ['dogmatist', 'rebel', 'synthesizer'];
    const links = [
      { source: 'dogmatist', target: 'rebel', type: 'CRITIQUED' },
      { source: 'dogmatist', target: 'synthesizer', type: 'SYNTHESIZED' },
      { source: 'rebel', target: 'synthesizer', type: 'DEVELOPED' },
    ];

    const friction = computeDialecticalFriction(nodeIds, links);
    expect(friction.size).toBe(3);

    const dogmatistFriction = friction.get('dogmatist')?.score || 0;
    expect(dogmatistFriction).toBeGreaterThan(30);

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
    const nodes: VisualNode[] = philosophersData.map((p) => ({
      id: p.id,
      name: p.name,
      type: 'philosopher',
      eraId: p.eraId as any,
      importanceScore: p.importanceScore,
      color: '#d4af37',
      summary: p.shortBio,
      data: p as any,
    }));

    const start = performance.now();
    const scoredTopology = applyScoringMethodology(nodes, edgesData as any, 'topology');
    const scoredFriction = applyScoringMethodology(nodes, edgesData as any, 'friction');
    const elapsed = performance.now() - start;

    expect(scoredTopology.length).toBe(philosophersData.length);
    expect(scoredFriction.length).toBe(philosophersData.length);
    expect(elapsed).toBeLessThan(50);
  });
});
