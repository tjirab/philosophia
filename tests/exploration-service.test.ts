import { describe, it, expect } from 'vitest';
import {
  computeNodeExploration,
  attachExplorationMetadata,
  getExplorationDistributionStats,
  getBranchExplorationProfiles,
  getExplorationStateConfig,
} from '../src/lib/graph/exploration-service';
import { VisualNode, VisualLink } from '../src/lib/types';
import philosophersData from '../data/philosophers.json';
import conceptsData from '../data/concepts.json';
import edgesData from '../data/edges.json';

describe('Exploration Service & Hybrid Cartography Metrics', () => {
  it('identifies canonical citadels with high scores', () => {
    const platoMeta = computeNodeExploration({ id: 'plato', importanceScore: 99 });
    expect(platoMeta.state).toBe('citadel');
    expect(platoMeta.score).toBeGreaterThanOrEqual(90);
    expect(platoMeta.badgeIcon).toBe('🏛️');

    const kantMeta = computeNodeExploration({ id: 'kant', importanceScore: 99 });
    expect(kantMeta.state).toBe('citadel');
    expect(kantMeta.score).toBeGreaterThanOrEqual(90);
  });

  it('identifies marginalized or open conceptual voids as Terra Incognita', () => {
    const nagarjunaMeta = computeNodeExploration({ id: 'nagarjuna', traditionId: 'eastern-wisdom' });
    expect(nagarjunaMeta.state).toBe('uncharted');
    expect(nagarjunaMeta.score).toBeLessThan(40);
    expect(nagarjunaMeta.badgeIcon).toBe('🌫️');
    expect(nagarjunaMeta.openQuestions?.length).toBeGreaterThan(0);

    const sunyataMeta = computeNodeExploration({ id: 'sunyata-emptiness', branch: 'metaphysics' });
    expect(sunyataMeta.state).toBe('uncharted');
    expect(sunyataMeta.score).toBeLessThan(40);
  });

  it('identifies active dialectical frontiers', () => {
    const chalmersMeta = computeNodeExploration({ id: 'chalmers-david', branch: 'mind' });
    expect(chalmersMeta.state).toBe('frontier');
    expect(chalmersMeta.score).toBeGreaterThanOrEqual(60);
    expect(chalmersMeta.badgeIcon).toBe('⚔️');

    const hardProblemMeta = computeNodeExploration({ id: 'hard-problem-consciousness', branch: 'mind' });
    expect(hardProblemMeta.state).toBe('frontier');
  });

  it('attaches exploration metadata to VisualNodes and respects degree centrality bonuses', () => {
    const testNodes: VisualNode[] = [
      {
        id: 'plato',
        name: 'Plato',
        type: 'philosopher',
        eraId: 'classical-greek',
        importanceScore: 99,
        color: '#d4af37',
        summary: 'Plato summary',
        data: philosophersData[0] as any,
      },
      {
        id: 'nagarjuna',
        name: 'Nagarjuna',
        type: 'philosopher',
        eraId: 'classical-greek',
        traditionId: 'eastern-wisdom',
        importanceScore: 80,
        color: '#6366f1',
        summary: 'Nagarjuna summary',
        data: philosophersData[1] as any,
      },
    ];

    const testLinks: VisualLink[] = [
      {
        source: 'plato',
        target: 'nagarjuna',
        type: 'CRITIQUED',
        label: 'critique',
      },
    ];

    const enriched = attachExplorationMetadata(testNodes, testLinks);
    expect(enriched).toHaveLength(2);
    expect(enriched[0].exploration).toBeDefined();
    expect(enriched[0].exploration?.state).toBe('citadel');
    expect(enriched[1].exploration).toBeDefined();
    expect(enriched[1].exploration?.state).toBe('uncharted');
  });

  it('computes accurate domain distribution stats across nodes', () => {
    const mockNodes: VisualNode[] = [
      {
        id: 'c1',
        name: 'Citadel Node',
        type: 'philosopher',
        eraId: 'classical-greek',
        importanceScore: 95,
        color: '#d4af37',
        summary: '',
        data: {} as any,
        exploration: { state: 'citadel', score: 95, label: 'Citadel', badgeIcon: '🏛️', tagline: '' },
      },
      {
        id: 'f1',
        name: 'Frontier Node',
        type: 'philosopher',
        eraId: 'contemporary',
        importanceScore: 75,
        color: '#f43f5e',
        summary: '',
        data: {} as any,
        exploration: { state: 'frontier', score: 75, label: 'Frontier', badgeIcon: '⚔️', tagline: '' },
      },
      {
        id: 'u1',
        name: 'Uncharted Node',
        type: 'philosopher',
        eraId: 'eastern',
        importanceScore: 30,
        color: '#6366f1',
        summary: '',
        data: {} as any,
        exploration: { state: 'uncharted', score: 30, label: 'Terra Incognita', badgeIcon: '🌫️', tagline: '' },
      },
    ];

    const stats = getExplorationDistributionStats(mockNodes);
    expect(stats.total).toBe(3);
    expect(stats.citadelCount).toBe(1);
    expect(stats.frontierCount).toBe(1);
    expect(stats.unchartedCount).toBe(1);
    expect(stats.emergingCount).toBe(0);
    expect(stats.citadelPct).toBe(33);
    expect(stats.meanScore).toBe(Math.round((95 + 75 + 30) / 3));
  });

  it('returns valid branch exploration profiles with publication volumes and open problems', () => {
    const branches = getBranchExplorationProfiles();
    expect(branches.length).toBeGreaterThanOrEqual(6);

    for (const b of branches) {
      expect(b.id).toBeDefined();
      expect(b.name).toBeDefined();
      expect(b.estimatedPublications).toBeGreaterThan(1000);
      expect(b.openProblems.length).toBeGreaterThan(0);
      expect(b.exploredSummary.length).toBeGreaterThan(0);
      expect(b.frontierSummary.length).toBeGreaterThan(0);
    }
  });

  it('provides complete UI configuration for each exploration state', () => {
    const states = ['citadel', 'frontier', 'emerging', 'uncharted'] as const;
    for (const state of states) {
      const cfg = getExplorationStateConfig(state);
      expect(cfg.label).toBeDefined();
      expect(cfg.badgeIcon).toBeDefined();
      expect(cfg.badgeClass).toBeDefined();
      expect(cfg.accentColor).toBeDefined();
      expect(cfg.haloColorDark).toBeDefined();
      expect(cfg.haloColorLight).toBeDefined();
    }
  });
});
