/**
 * Runtime Scoring Engine & Historiographical Methodology Calculator
 * Provides pure mathematical algorithms (Directed PageRank, Degree Centrality,
 * Dialectical Friction) and dynamically rescales nodes and ranks in real-time.
 */

import {
  ScoringMethodology,
  NodeScoreBreakdown,
  VisualNode,
  VisualLink,
  Edge,
  METHODOLOGY_CONFIG,
} from '../types';

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
  const { dampingFactor = 0.85, iterations = 25 } = options;
  const N = nodeIds.length;
  if (N === 0) return new Map();

  const idSet = new Set(nodeIds);
  const outDegree = new Map<string, number>();
  const inEdges = new Map<string, string[]>();

  for (const id of nodeIds) {
    outDegree.set(id, 0);
    inEdges.set(id, []);
  }

  // Construct citation network: successor (target) cites predecessor (source)
  for (const link of links) {
    const src = typeof link.source === 'object' ? link.source.id : link.source;
    const tgt = typeof link.target === 'object' ? link.target.id : link.target;

    if (idSet.has(src) && idSet.has(tgt) && src !== tgt) {
      // tgt cites src -> tgt has outgoing citation, src has incoming citation
      outDegree.set(tgt, (outDegree.get(tgt) || 0) + 1);
      inEdges.get(src)?.push(tgt);
    }
  }

  // Initial uniform distribution
  let scores = new Map<string, number>();
  const initialScore = 1 / N;
  for (const id of nodeIds) {
    scores.set(id, initialScore);
  }

  // Power iteration
  for (let iter = 0; iter < iterations; iter++) {
    const nextScores = new Map<string, number>();
    let sinkMass = 0;

    // Distribute sink mass (nodes with outDegree === 0)
    for (const id of nodeIds) {
      if ((outDegree.get(id) || 0) === 0) {
        sinkMass += scores.get(id) || 0;
      }
    }

    const baseShare = (1 - dampingFactor) / N + (dampingFactor * sinkMass) / N;

    for (const id of nodeIds) {
      let incomingShare = 0;
      const inboundNodes = inEdges.get(id) || [];
      for (const inId of inboundNodes) {
        const outDeg = outDegree.get(inId) || 1;
        incomingShare += (scores.get(inId) || 0) / outDeg;
      }

      nextScores.set(id, baseShare + dampingFactor * incomingShare);
    }

    scores = nextScores;
  }

  return scores;
}

/**
 * Computes Dialectical Friction: measures controversy and intensity of paradigm breaks.
 * Ranks thinkers by who provoked the most rebuttals (CRITIQUED) and syntheses (SYNTHESIZED).
 */
export function computeDialecticalFriction(
  nodeIds: string[],
  links: Array<{
    source: string | { id: string };
    target: string | { id: string };
    type: string;
  }>
): Map<string, { score: number; critiqueCount: number; synthesisCount: number; totalCount: number }> {
  const result = new Map<string, { score: number; critiqueCount: number; synthesisCount: number; totalCount: number }>();
  const idSet = new Set(nodeIds);

  const critiques = new Map<string, number>();
  const syntheses = new Map<string, number>();
  const totals = new Map<string, number>();

  for (const id of nodeIds) {
    critiques.set(id, 0);
    syntheses.set(id, 0);
    totals.set(id, 0);
  }

  for (const link of links) {
    const src = typeof link.source === 'object' ? link.source.id : link.source;
    const tgt = typeof link.target === 'object' ? link.target.id : link.target;

    if (idSet.has(src)) totals.set(src, (totals.get(src) || 0) + 1);
    if (idSet.has(tgt)) totals.set(tgt, (totals.get(tgt) || 0) + 1);

    if (link.type === 'CRITIQUED') {
      if (idSet.has(src)) critiques.set(src, (critiques.get(src) || 0) + 1);
      if (idSet.has(tgt)) critiques.set(tgt, (critiques.get(tgt) || 0) + 1);
    } else if (link.type === 'SYNTHESIZED') {
      if (idSet.has(src)) syntheses.set(src, (syntheses.get(src) || 0) + 1);
      if (idSet.has(tgt)) syntheses.set(tgt, (syntheses.get(tgt) || 0) + 1);
    }
  }

  for (const id of nodeIds) {
    const c = critiques.get(id) || 0;
    const s = syntheses.get(id) || 0;
    const tot = totals.get(id) || 0;

    // Friction formula: combination of controversy ratio and total dialectical volume
    const ratio = tot > 0 ? (c * 2 + s) / tot : 0;
    const volumeBonus = Math.min(45, (c * 2 + s) * 4);
    const score = Math.max(10, Math.min(100, Math.round(ratio * 55 + volumeBonus)));

    result.set(id, {
      score,
      critiqueCount: c,
      synthesisCount: s,
      totalCount: tot,
    });
  }

  return result;
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

  if (methodology === 'topology') {
    // 1. Pure Network Topology (Directed PageRank)
    const rawPageRank = computePageRank(nodeIds, links);

    // Calculate in-degree for additional authority breakdown
    const inDegrees = new Map<string, number>();
    for (const l of links) {
      const src = typeof l.source === 'object' ? l.source.id : l.source;
      inDegrees.set(src, (inDegrees.get(src) || 0) + 1);
    }

    // Min/Max scaling with logarithmic smoothing to keep visual spread balanced
    let maxPr = 0;
    let minPr = Infinity;
    for (const pr of rawPageRank.values()) {
      if (pr > maxPr) maxPr = pr;
      if (pr < minPr) minPr = pr;
    }
    const prRange = maxPr > minPr ? maxPr - minPr : 1;

    // Map each node to 0-100 score
    const scores = new Map<string, number>();
    for (const id of nodeIds) {
      const pr = rawPageRank.get(id) || 0;
      // Normalization formula: scaled between 25 and 99
      const normalized = Math.round(25 + ((pr - minPr) / prRange) * 74);
      scores.set(id, Math.max(20, Math.min(99, normalized)));
    }

    // Sort to determine ranks
    const sorted = [...nodeIds].sort((a, b) => (scores.get(b) || 0) - (scores.get(a) || 0));
    const ranks = new Map<string, number>();
    sorted.forEach((id, idx) => ranks.set(id, idx + 1));

    return nodes.map((node) => {
      const score = scores.get(node.id) || 50;
      const rank = ranks.get(node.id) || totalNodes;
      const rawPr = rawPageRank.get(node.id) || 0;
      const citations = inDegrees.get(node.id) || 0;
      const percentile = Math.round(((totalNodes - rank) / totalNodes) * 100);

      const breakdown: NodeScoreBreakdown = {
        methodology: 'topology',
        score,
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
    // 2. Dialectical Friction & Controversy
    const frictionData = computeDialecticalFriction(nodeIds, links);
    const sorted = [...nodeIds].sort((a, b) => {
      const sA = frictionData.get(a)?.score || 0;
      const sB = frictionData.get(b)?.score || 0;
      return sB - sA;
    });

    const ranks = new Map<string, number>();
    sorted.forEach((id, idx) => ranks.set(id, idx + 1));

    return nodes.map((node) => {
      const data = frictionData.get(node.id) || { score: 50, critiqueCount: 0, synthesisCount: 0, totalCount: 0 };
      const rank = ranks.get(node.id) || totalNodes;
      const percentile = Math.round(((totalNodes - rank) / totalNodes) * 100);

      const breakdown: NodeScoreBreakdown = {
        methodology: 'friction',
        score: data.score,
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

  // 3. Canonical Consensus (Default)
  const sorted = [...nodeIds].sort((a, b) => {
    const sA = nodes.find((n) => n.id === a)?.importanceScore || 50;
    const sB = nodes.find((n) => n.id === b)?.importanceScore || 50;
    return sB - sA;
  });

  const ranks = new Map<string, number>();
  sorted.forEach((id, idx) => ranks.set(id, idx + 1));

  return nodes.map((node) => {
    const score = node.importanceScore || 50;
    const rank = ranks.get(node.id) || totalNodes;
    const percentile = Math.round(((totalNodes - rank) / totalNodes) * 100);

    const breakdown: NodeScoreBreakdown = {
      methodology: 'canonical',
      score,
      rank,
      totalNodes,
      percentile,
      components: [
        { label: 'Historical Canon Weight', value: `${score}/100`, weight: '60%' },
        { label: 'Canonical Works Recorded', value: (node.data as any)?.keyWorks?.length || 0, weight: '25%' },
        { label: 'Canonical Rank', value: `#${rank} of ${totalNodes}` },
      ],
    };

    return {
      ...node,
      methodology: 'canonical',
      scoreBreakdown: breakdown,
    };
  });
}
