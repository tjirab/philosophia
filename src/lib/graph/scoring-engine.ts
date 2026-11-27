/**
 * Runtime Scoring Engine & Historiographical Methodology Calculator
 * Delegates core mathematical algorithms to scoring-algorithms.mjs so build-time
 * compilation and client/SSR runtime produce identical scores and deterministic ranks.
 */

import {
  ScoringMethodology,
  NodeScoreBreakdown,
  VisualNode,
  VisualLink,
  Edge,
} from '../types';
import {
  computeDirectedPageRank,
  computeDialecticalFrictionScores,
  computeHybridCanonicalScores,
  compareByDeterministicRank,
} from './scoring-algorithms.mjs';

export interface PageRankOptions {
  dampingFactor?: number;
  iterations?: number;
  tolerance?: number;
}

/**
 * Computes directed PageRank over the intellectual influence network.
 * In historical lineages, an edge A -> B represents A influencing B.
 * Citation authority flows back B -> A (the successor acknowledging the predecessor).
 */
export function computePageRank(
  nodeIds: string[],
  links: Array<{ source: string | { id: string }; target: string | { id: string } }>,
  options: PageRankOptions = {}
): Map<string, number> {
  return computeDirectedPageRank(nodeIds, links, options);
}

/**
 * Computes Dialectical Friction: measures controversy and intensity of paradigm breaks
 * using Bayesian-smoothed critique & synthesis ratios.
 */
export function computeDialecticalFriction(
  nodeIds: string[],
  links: Array<{
    source: string | { id: string };
    target: string | { id: string };
    type: string;
  }>
): Map<string, { score: number; critiqueCount: number; synthesisCount: number; totalCount: number }> {
  const raw = computeDialecticalFrictionScores(nodeIds, links);
  const result = new Map<string, { score: number; critiqueCount: number; synthesisCount: number; totalCount: number }>();
  for (const [id, entry] of raw.entries()) {
    result.set(id, {
      score: entry.score,
      critiqueCount: entry.critiqueCount,
      synthesisCount: entry.synthesisCount,
      totalCount: entry.totalCount,
    });
  }
  return result;
}

function formatTierLabel(tier: string): string {
  if (tier === 'pillar') return 'Foundational Pillar';
  if (tier === 'bridge') return 'Dialectical Bridge';
  return 'Canonical Contributor';
}

/**
 * Applies the selected ScoringMethodology to all nodes, updating importanceScore,
 * node visual sizing (val), and attaching detailed score breakdown recipes.
 */
export function applyScoringMethodology(
  nodes: VisualNode[],
  links: VisualLink[] | Edge[],
  methodology: ScoringMethodology = 'canonical'
): VisualNode[] {
  if (nodes.length === 0) return [];

  const nodeIds = nodes.map((n) => n.id);
  const totalNodes = nodes.length;
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Compute undirected degrees once for deterministic tie-breaking across all lenses
  const degrees = new Map<string, number>();
  for (const id of nodeIds) degrees.set(id, 0);
  for (const l of links) {
    const src = typeof l.source === 'object' ? l.source.id : l.source;
    const tgt = typeof l.target === 'object' ? l.target.id : l.target;
    if (degrees.has(src)) degrees.set(src, (degrees.get(src) || 0) + 1);
    if (degrees.has(tgt)) degrees.set(tgt, (degrees.get(tgt) || 0) + 1);
  }

  if (methodology === 'topology') {
    // 1. Pure Network Topology (Directed PageRank)
    const rawPageRank = computePageRank(nodeIds, links);

    const inDegrees = new Map<string, number>();
    for (const l of links) {
      const src = typeof l.source === 'object' ? l.source.id : l.source;
      inDegrees.set(src, (inDegrees.get(src) || 0) + 1);
    }

    let maxPr = 0;
    let minPr = Infinity;
    for (const pr of rawPageRank.values()) {
      if (pr > maxPr) maxPr = pr;
      if (pr < minPr) minPr = pr;
    }
    const prRange = maxPr > minPr ? maxPr - minPr : 1;

    const scores = new Map<string, number>();
    const rawScores = new Map<string, number>();
    for (const id of nodeIds) {
      const pr = rawPageRank.get(id) || 0;
      const rawNormalized = 25 + ((pr - minPr) / prRange) * 74;
      const clamped = Math.max(20, Math.min(99, Math.round(rawNormalized)));
      scores.set(id, clamped);
      rawScores.set(id, rawNormalized);
    }

    const sorted = [...nodeIds].sort((a, b) =>
      compareByDeterministicRank(
        { id: a, name: nodeMap.get(a)?.name, score: scores.get(a), rawScore: rawScores.get(a), degree: degrees.get(a) },
        { id: b, name: nodeMap.get(b)?.name, score: scores.get(b), rawScore: rawScores.get(b), degree: degrees.get(b) }
      )
    );
    const ranks = new Map<string, number>();
    sorted.forEach((id, idx) => ranks.set(id, idx + 1));

    return nodes.map((node) => {
      const score = scores.get(node.id) || 50;
      const rawScore = rawScores.get(node.id) || score;
      const rank = ranks.get(node.id) || totalNodes;
      const rawPr = rawPageRank.get(node.id) || 0;
      const citations = inDegrees.get(node.id) || 0;
      const percentile = Math.round(((totalNodes - rank) / totalNodes) * 100);

      const breakdown: NodeScoreBreakdown = {
        methodology: 'topology',
        score,
        rawScore,
        degree: degrees.get(node.id) || 0,
        rank,
        totalNodes,
        percentile,
        components: [
          { label: 'Directed PageRank', value: (rawPr * 100).toFixed(3) + '%', weight: '70%' },
          { label: 'Downstream Lineages Cited', value: citations, weight: '30%' },
          { label: 'Network Rank', value: `#${rank} of ${totalNodes}` },
        ],
      };

      return {
        ...node,
        importanceScore: score,
        val: Math.max(8, Math.round(score / 7.5)),
        methodology: 'topology',
        scoreBreakdown: breakdown,
      };
    });
  }

  if (methodology === 'friction') {
    // 2. Dialectical Friction & Controversy (Bayesian-smoothed)
    const frictionData = computeDialecticalFrictionScores(nodeIds, links);
    const sorted = [...nodeIds].sort((a, b) => {
      const fA = frictionData.get(a);
      const fB = frictionData.get(b);
      return compareByDeterministicRank(
        { id: a, name: nodeMap.get(a)?.name, score: fA?.score || 0, rawScore: fA?.rawScore || 0, degree: fA?.totalCount || 0 },
        { id: b, name: nodeMap.get(b)?.name, score: fB?.score || 0, rawScore: fB?.rawScore || 0, degree: fB?.totalCount || 0 }
      );
    });

    const ranks = new Map<string, number>();
    sorted.forEach((id, idx) => ranks.set(id, idx + 1));

    return nodes.map((node) => {
      const data = frictionData.get(node.id) || {
        score: 50,
        rawScore: 50,
        critiqueCount: 0,
        synthesisCount: 0,
        totalCount: 0,
      };
      const rank = ranks.get(node.id) || totalNodes;
      const percentile = Math.round(((totalNodes - rank) / totalNodes) * 100);

      const breakdown: NodeScoreBreakdown = {
        methodology: 'friction',
        score: data.score,
        rawScore: data.rawScore,
        degree: data.totalCount,
        rank,
        totalNodes,
        percentile,
        components: [
          { label: 'Critiques & Rebuttals Provoked', value: data.critiqueCount, weight: '50%' },
          { label: 'Synthetic Integrations', value: data.synthesisCount, weight: '25%' },
          { label: 'Total Philosophical Connections', value: data.totalCount, weight: '25%' },
          { label: 'Controversy Rank', value: `#${rank} of ${totalNodes}` },
        ],
      };

      return {
        ...node,
        importanceScore: data.score,
        val: Math.max(8, Math.round(data.score / 7.5)),
        methodology: 'friction',
        scoreBreakdown: breakdown,
      };
    });
  }

  // 3. Hybrid Canonical-Topological Consensus (Default — Recommendation A)
  const hybridData = computeHybridCanonicalScores(nodes, links);
  const sorted = [...nodeIds].sort((a, b) => {
    const hA = hybridData.get(a);
    const hB = hybridData.get(b);
    return compareByDeterministicRank(
      { id: a, name: nodeMap.get(a)?.name, score: hA?.score || 50, rawScore: hA?.rawScore || 50, degree: hA?.degree || 0 },
      { id: b, name: nodeMap.get(b)?.name, score: hB?.score || 50, rawScore: hB?.rawScore || 50, degree: hB?.degree || 0 }
    );
  });

  const ranks = new Map<string, number>();
  sorted.forEach((id, idx) => ranks.set(id, idx + 1));

  return nodes.map((node) => {
    const h = hybridData.get(node.id);
    const score = h?.score ?? node.importanceScore ?? 50;
    const rawScore = h?.rawScore ?? score;
    const rank = ranks.get(node.id) || totalNodes;
    const percentile = Math.round(((totalNodes - rank) / totalNodes) * 100);

    const breakdown: NodeScoreBreakdown = {
      methodology: 'canonical',
      score,
      rawScore,
      degree: h?.degree ?? (degrees.get(node.id) || 0),
      canonTier: h?.canonTier,
      rank,
      totalNodes,
      percentile,
      components: [
        { label: 'Canon Tier Prior', value: h ? formatTierLabel(h.canonTier) : 'Contributor', weight: '48%' },
        { label: 'Bidirectional Centrality', value: h ? `${Math.round(h.bidirectionalCentrality * 100)}/100` : '0/100', weight: '32%' },
        { label: 'Cross-Boundary Reach', value: h ? `${h.distinctNeighborEras} eras · ${h.distinctNeighborTraditions} traditions` : '0', weight: '12%' },
        { label: 'Scholarly Apparatus', value: h ? `${Math.round(h.scholarlyApparatus * 100)}%` : '0%', weight: '8%' },
        { label: 'Hybrid Consensus Rank', value: `#${rank} of ${totalNodes}` },
      ],
    };

    return {
      ...node,
      canonTier: h?.canonTier ?? node.canonTier,
      importanceScore: score,
      val: node.type === 'philosopher' ? Math.max(8, Math.round(score / 8)) : node.val,
      methodology: 'canonical',
      scoreBreakdown: breakdown,
    };
  });
}
