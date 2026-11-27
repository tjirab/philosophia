/**
 * Pure, dependency-free graph scoring algorithms shared between the build-time
 * compiler (scripts/build-data.mjs) and the client/SSR scoring engine
 * (src/lib/graph/scoring-engine.ts).
 *
 * Keeping this as plain ESM guarantees identical scores and ranks across
 * static chunks, catalog pages, dossiers, and the interactive canvas.
 */

export const CANON_TIER_PRIORS = {
  pillar: 1.0,
  bridge: 0.68,
  contributor: 0.32,
};

export const HYBRID_SCORING_CONSTANTS = {
  floor: 72,
  span: 28,
  weights: {
    tier: 0.48,
    centrality: 0.32,
    crossBoundary: 0.12,
    apparatus: 0.08,
  },
  frictionSmoothingPrior: 3,
};

/**
 * Resolves a node's coarse 3-tier editorial canon classification.
 * Explicitly authored `canonTier` always takes precedence so compiled
 * `importanceScore` outputs never feed back into tier inference.
 */
export function inferCanonTier(node) {
  const explicit = node?.canonTier || node?.data?.canonTier;
  if (explicit === 'pillar' || explicit === 'bridge' || explicit === 'contributor') {
    return explicit;
  }
  const rawImp = typeof node?.importanceScore === 'number'
    ? node.importanceScore
    : typeof node?.data?.importanceScore === 'number'
    ? node.data.importanceScore
    : 50;
  if (rawImp >= 95) return 'pillar';
  if (rawImp >= 90) return 'bridge';
  return 'contributor';
}

function getLinkEndpoints(link) {
  const src = typeof link.source === 'object' && link.source !== null ? link.source.id : link.source;
  const tgt = typeof link.target === 'object' && link.target !== null ? link.target.id : link.target;
  return { src, tgt };
}

/**
 * Computes directed PageRank over the intellectual influence network.
 * In historical lineages, an edge A -> B represents A influencing B.
 * Citation authority flows back B -> A (the successor acknowledging the predecessor).
 */
export function computeDirectedPageRank(nodeIds, links, options = {}) {
  const { dampingFactor = 0.85, iterations = 25 } = options;
  const N = nodeIds.length;
  if (N === 0) return new Map();

  const idSet = new Set(nodeIds);
  const outDegree = new Map();
  const inEdges = new Map();

  for (const id of nodeIds) {
    outDegree.set(id, 0);
    inEdges.set(id, []);
  }

  for (const link of links) {
    const { src, tgt } = getLinkEndpoints(link);
    if (idSet.has(src) && idSet.has(tgt) && src !== tgt) {
      outDegree.set(tgt, (outDegree.get(tgt) || 0) + 1);
      inEdges.get(src)?.push(tgt);
    }
  }

  let scores = new Map();
  const initialScore = 1 / N;
  for (const id of nodeIds) {
    scores.set(id, initialScore);
  }

  for (let iter = 0; iter < iterations; iter++) {
    const nextScores = new Map();
    let sinkMass = 0;

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
 * Computes bidirectional (undirected) PageRank so both inherited precursors
 * and downstream successors contribute structural centrality without
 * concentrating probability exclusively on earliest chronological roots.
 */
export function computeUndirectedPageRank(nodeIds, links, options = {}) {
  const { dampingFactor = 0.85, iterations = 25 } = options;
  const N = nodeIds.length;
  if (N === 0) return new Map();

  const idSet = new Set(nodeIds);
  const adj = new Map();
  for (const id of nodeIds) {
    adj.set(id, new Set());
  }

  for (const link of links) {
    const { src, tgt } = getLinkEndpoints(link);
    if (idSet.has(src) && idSet.has(tgt) && src !== tgt) {
      adj.get(src).add(tgt);
      adj.get(tgt).add(src);
    }
  }

  let scores = new Map();
  const initialScore = 1 / N;
  for (const id of nodeIds) {
    scores.set(id, initialScore);
  }

  for (let iter = 0; iter < iterations; iter++) {
    const nextScores = new Map();
    let sinkMass = 0;

    for (const id of nodeIds) {
      if (adj.get(id).size === 0) {
        sinkMass += scores.get(id) || 0;
      }
    }

    const baseShare = (1 - dampingFactor) / N + (dampingFactor * sinkMass) / N;

    for (const id of nodeIds) {
      let incomingShare = 0;
      for (const nb of adj.get(id)) {
        const deg = adj.get(nb).size || 1;
        incomingShare += (scores.get(nb) || 0) / deg;
      }
      nextScores.set(id, baseShare + dampingFactor * incomingShare);
    }

    scores = nextScores;
  }

  return scores;
}

/**
 * Computes Dialectical Friction with Laplace/Bayesian degree smoothing (d + 3)
 * to prevent 1-2 edge nodes from saturating to 100 while rewarding sustained
 * paradigm-breaking controversy (CRITIQUED x2 + SYNTHESIZED).
 */
export function computeDialecticalFrictionScores(nodeIds, links) {
  const result = new Map();
  const idSet = new Set(nodeIds);

  const critiques = new Map();
  const syntheses = new Map();
  const totals = new Map();

  for (const id of nodeIds) {
    critiques.set(id, 0);
    syntheses.set(id, 0);
    totals.set(id, 0);
  }

  for (const link of links) {
    const { src, tgt } = getLinkEndpoints(link);

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

  const k = HYBRID_SCORING_CONSTANTS.frictionSmoothingPrior;

  for (const id of nodeIds) {
    const c = critiques.get(id) || 0;
    const s = syntheses.get(id) || 0;
    const tot = totals.get(id) || 0;

    const weightedEvents = c * 2 + s;
    const ratio = tot > 0 ? weightedEvents / (tot + k) : 0;
    const volumeBonus = Math.min(45, weightedEvents * 4);
    const rawScore = ratio * 55 + volumeBonus;
    const score = Math.max(10, Math.min(100, Math.round(rawScore)));

    result.set(id, {
      score,
      rawScore,
      critiqueCount: c,
      synthesisCount: s,
      totalCount: tot,
    });
  }

  return result;
}

/**
 * Computes Option A Hybrid Canonical-Topological Consensus scores across all nodes.
 * Combines:
 *   48% Coarse Editorial Canon Tier (pillar=1.0, bridge=0.68, contributor=0.32)
 *   32% Bidirectional Network Centrality (50% log-degree + 50% undirected PageRank)
 *   12% Cross-Boundary Dialectical Reach (neighbor eras, traditions/branches, multi-domain)
 *    8% Scholarly Apparatus (keyWorks up to 3 + SEP slug presence)
 * Scaled onto [72, 100] for philosophers (with concept nodes preserving their baseline
 * score while still acting as structural conduits in the adjacency graph).
 */
export function computeHybridCanonicalScores(nodes, links) {
  const result = new Map();
  if (!nodes || nodes.length === 0) return result;

  const nodeIds = nodes.map((n) => n.id);
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const idSet = new Set(nodeIds);

  const adj = new Map();
  for (const id of nodeIds) {
    adj.set(id, new Set());
  }

  for (const link of links) {
    const { src, tgt } = getLinkEndpoints(link);
    if (idSet.has(src) && idSet.has(tgt) && src !== tgt) {
      adj.get(src).add(tgt);
      adj.get(tgt).add(src);
    }
  }

  const undirectedPr = computeUndirectedPageRank(nodeIds, links);

  const philNodes = nodes.filter((n) => (n.type || 'philosopher') === 'philosopher');
  const normalizationPool = philNodes.length > 0 ? philNodes : nodes;

  let minPr = Infinity;
  let maxPr = -Infinity;
  let maxDeg = 0;

  for (const n of normalizationPool) {
    const pr = undirectedPr.get(n.id) || 0;
    const deg = adj.get(n.id)?.size || 0;
    if (pr < minPr) minPr = pr;
    if (pr > maxPr) maxPr = pr;
    if (deg > maxDeg) maxDeg = deg;
  }

  if (!Number.isFinite(minPr)) minPr = 0;
  if (!Number.isFinite(maxPr)) maxPr = 0;
  const prRange = maxPr > minPr ? maxPr - minPr : 1;
  const logDenom = Math.log(1 + maxDeg);

  const { floor, span, weights } = HYBRID_SCORING_CONSTANTS;

  for (const node of nodes) {
    const isConcept = node.type === 'concept' || (!node.birthYear && node.data?.birthYear === undefined && Boolean(node.branch || node.data?.branch));
    const deg = adj.get(node.id)?.size || 0;
    const rawPr = undirectedPr.get(node.id) || 0;
    const prNorm = maxPr > minPr ? Math.max(0, Math.min(1, (rawPr - minPr) / prRange)) : 0;
    const logDegree = logDenom > 0 ? Math.log(1 + deg) / logDenom : 0;
    const bidirectionalCentrality = 0.5 * logDegree + 0.5 * prNorm;

    const nbrEras = new Set();
    const nbrTraditions = new Set();
    for (const nbId of adj.get(node.id) || []) {
      const nb = nodeMap.get(nbId);
      if (!nb) continue;
      const nbEra = nb.eraId || nb.data?.eraId;
      const nbTrad = nb.traditionId || nb.data?.traditionId || nb.branch || nb.data?.branch;
      if (nbEra) nbrEras.add(nbEra);
      if (nbTrad) nbrTraditions.add(nbTrad);
    }

    const domains = node.domains || node.data?.domains || [];
    const isInterdisciplinary = Array.isArray(domains) && domains.length >= 2;
    const crossBoundaryReach =
      0.45 * (Math.min(5, nbrEras.size) / 5) +
      0.40 * (Math.min(5, nbrTraditions.size) / 5) +
      0.15 * (isInterdisciplinary ? 1 : 0);

    if (isConcept) {
      const baseConceptScore = typeof node.importanceScore === 'number'
        ? node.importanceScore
        : typeof node.data?.importanceScore === 'number'
        ? node.data.importanceScore
        : 50;
      const sepSlug = node.sepSlug || node.data?.sepSlug;
      const summary = node.summary || node.data?.summary || '';
      const apparatus = 0.5 * (sepSlug ? 1 : 0) + 0.5 * (summary.length > 40 ? 1 : 0);

      result.set(node.id, {
        score: baseConceptScore,
        rawScore: baseConceptScore,
        canonTier: 'contributor',
        tierNorm: CANON_TIER_PRIORS.contributor,
        bidirectionalCentrality,
        logDegree,
        undirectedPageRank: rawPr,
        crossBoundaryReach,
        distinctNeighborEras: nbrEras.size,
        distinctNeighborTraditions: nbrTraditions.size,
        isInterdisciplinary,
        scholarlyApparatus: apparatus,
        degree: deg,
      });
      continue;
    }

    const canonTier = inferCanonTier(node);
    const tierNorm = CANON_TIER_PRIORS[canonTier];
    const keyWorks = node.keyWorks || node.data?.keyWorks || [];
    const sepSlug = node.sepSlug || node.data?.sepSlug;
    const scholarlyApparatus =
      0.7 * (Math.min(3, Array.isArray(keyWorks) ? keyWorks.length : 0) / 3) +
      0.3 * (sepSlug ? 1 : 0);

    const composite =
      weights.tier * tierNorm +
      weights.centrality * bidirectionalCentrality +
      weights.crossBoundary * crossBoundaryReach +
      weights.apparatus * scholarlyApparatus;

    const rawScore = floor + span * composite;
    const score = Math.max(20, Math.min(100, Math.round(rawScore)));

    result.set(node.id, {
      score,
      rawScore,
      canonTier,
      tierNorm,
      bidirectionalCentrality,
      logDegree,
      undirectedPageRank: rawPr,
      crossBoundaryReach,
      distinctNeighborEras: nbrEras.size,
      distinctNeighborTraditions: nbrTraditions.size,
      isInterdisciplinary,
      scholarlyApparatus,
      degree: deg,
    });
  }

  return result;
}

/**
 * Deterministic comparator for ranking scored thinkers/nodes without inheriting
 * arbitrary input-array order (such as chronological birthYear sorting).
 */
export function compareByDeterministicRank(a, b) {
  const scoreDiff = (b.score ?? b.importanceScore ?? 50) - (a.score ?? a.importanceScore ?? 50);
  if (scoreDiff !== 0) return scoreDiff;

  const rawDiff = (b.rawScore ?? b.score ?? 50) - (a.rawScore ?? a.score ?? 50);
  if (Math.abs(rawDiff) > 1e-9) return rawDiff;

  const degDiff = (b.degree ?? 0) - (a.degree ?? 0);
  if (degDiff !== 0) return degDiff;

  const nameA = a.name || a.id || '';
  const nameB = b.name || b.id || '';
  return nameA.localeCompare(nameB);
}
