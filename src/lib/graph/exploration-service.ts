import fieldExplorationData from '../../../data/field_exploration.json';
import {
  ExplorationState,
  ExplorationMeta,
  BranchExplorationProfile,
  VisualNode,
  VisualLink,
  Edge,
  Philosopher,
  Concept,
} from '../types';

export interface ExplorationStateConfig {
  state: ExplorationState;
  label: string;
  badgeIcon: string;
  tagline: string;
  badgeClass: string;
  cardBorderClass: string;
  accentColor: string;
  haloColorDark: string;
  haloColorLight: string;
}

export const EXPLORATION_STATE_CONFIG: Record<ExplorationState, ExplorationStateConfig> = {
  citadel: {
    state: 'citadel',
    label: 'Canonical Citadel',
    badgeIcon: '🏛️',
    tagline: 'Deeply charted foundational stronghold with extensive primary treatises and centuries of commentary.',
    badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    cardBorderClass: 'border-l-4 border-l-amber-500',
    accentColor: '#d4af37',
    haloColorDark: 'rgba(212, 175, 55, 0.22)',
    haloColorLight: 'rgba(212, 175, 55, 0.28)',
  },
  frontier: {
    state: 'frontier',
    label: 'Disputed Frontier',
    badgeIcon: '⚔️',
    tagline: 'Active intellectual battleground characterized by ongoing dialectical clashes and rival paradigms.',
    badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    cardBorderClass: 'border-l-4 border-l-rose-500',
    accentColor: '#e11d48',
    haloColorDark: 'rgba(225, 29, 72, 0.20)',
    haloColorLight: 'rgba(225, 29, 72, 0.22)',
  },
  emerging: {
    state: 'emerging',
    label: 'Pioneer Outpost',
    badgeIcon: '🧭',
    tagline: 'Rapidly expanding modern inquiry forging novel bridges with empirical sciences or technologies.',
    badgeClass: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
    cardBorderClass: 'border-l-4 border-l-teal-500',
    accentColor: '#0d9488',
    haloColorDark: 'rgba(13, 148, 136, 0.20)',
    haloColorLight: 'rgba(13, 148, 136, 0.22)',
  },
  uncharted: {
    state: 'uncharted',
    label: 'Terra Incognita',
    badgeIcon: '🌫️',
    tagline: 'Historically marginalized tradition or unresolved open problem where philosophical inquiry remains sparse.',
    badgeClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    cardBorderClass: 'border-l-4 border-l-indigo-500',
    accentColor: '#6366f1',
    haloColorDark: 'rgba(99, 102, 241, 0.20)',
    haloColorLight: 'rgba(99, 102, 241, 0.22)',
  },
};

export function getExplorationStateConfig(state: ExplorationState): ExplorationStateConfig {
  return EXPLORATION_STATE_CONFIG[state] || EXPLORATION_STATE_CONFIG.citadel;
}

export function getBranchExplorationProfiles(): BranchExplorationProfile[] {
  return fieldExplorationData.branches as BranchExplorationProfile[];
}

/**
 * Computes hybrid exploration metadata for an individual node given topology degree and field catalog.
 */
export function computeNodeExploration(
  node: {
    id: string;
    type?: 'philosopher' | 'concept';
    traditionId?: string;
    branch?: string;
    importanceScore?: number;
    keyWorks?: any[];
  },
  edgeCount = 0,
  critiqueCount = 0
): ExplorationMeta {
  const nodeOverrides = (fieldExplorationData.nodeOverrides || {}) as Record<string, any>;
  const traditionOverrides = (fieldExplorationData.traditionOverrides || {}) as Record<string, any>;
  const branchList = (fieldExplorationData.branches || []) as BranchExplorationProfile[];

  // 1. Direct Node Override
  if (nodeOverrides[node.id]) {
    const override = nodeOverrides[node.id];
    const cfg = getExplorationStateConfig(override.state);
    return {
      state: override.state,
      score: override.score,
      label: cfg.label,
      badgeIcon: cfg.badgeIcon,
      tagline: override.tagline || cfg.tagline,
      openQuestions: override.openQuestions || [],
    };
  }

  // 2. Tradition Override (for philosophers)
  if (node.traditionId && traditionOverrides[node.traditionId]) {
    const trad = traditionOverrides[node.traditionId];
    // Baseline score adjusted slightly by importanceScore and connectivity
    let score = trad.score;
    if (typeof node.importanceScore === 'number') {
      score += Math.round((node.importanceScore - 70) * 0.15);
    }
    score += Math.min(10, edgeCount * 1.5);
    score = Math.max(10, Math.min(100, Math.round(score)));

    // Determine state from score if not strictly overridden
    let state = trad.state as ExplorationState;
    if (score >= 82) state = 'citadel';
    else if (score >= 60) state = 'frontier';
    else if (score >= 40) state = 'emerging';
    else state = 'uncharted';

    const cfg = getExplorationStateConfig(state);
    return {
      state,
      score,
      label: cfg.label,
      badgeIcon: cfg.badgeIcon,
      tagline: trad.tagline || cfg.tagline,
      openQuestions: trad.openQuestions || [],
    };
  }

  // 3. Branch Profile (for concepts or branch-tagged nodes)
  if (node.branch) {
    const branchProfile = branchList.find((b) => b.id === node.branch);
    if (branchProfile) {
      let score = branchProfile.baseExplorationScore;
      if (typeof node.importanceScore === 'number') {
        score += Math.round((node.importanceScore - 70) * 0.12);
      }
      score += Math.min(10, edgeCount * 1.5);
      score = Math.max(10, Math.min(100, Math.round(score)));

      let state = branchProfile.defaultState;
      if (score >= 82) state = 'citadel';
      else if (score >= 60) state = 'frontier';
      else if (score >= 40) state = 'emerging';
      else state = 'uncharted';

      const cfg = getExplorationStateConfig(state);
      return {
        state,
        score,
        label: cfg.label,
        badgeIcon: cfg.badgeIcon,
        tagline: cfg.tagline,
        openQuestions: branchProfile.openProblems || [],
        estimatedPublications: branchProfile.estimatedPublications,
      };
    }
  }

  // 4. Default hybrid heuristic based on importanceScore, degree, and dialectical tension
  const baseImportance = node.importanceScore || 65;
  const topologyBonus = Math.min(15, edgeCount * 2);
  const dialecticalBonus = Math.min(10, critiqueCount * 3);
  let score = Math.round(baseImportance * 0.75 + topologyBonus + dialecticalBonus);
  score = Math.max(10, Math.min(100, score));

  let state: ExplorationState = 'citadel';
  if (score >= 82) state = 'citadel';
  else if (score >= 60) state = 'frontier';
  else if (score >= 40) state = 'emerging';
  else state = 'uncharted';

  const cfg = getExplorationStateConfig(state);
  return {
    state,
    score,
    label: cfg.label,
    badgeIcon: cfg.badgeIcon,
    tagline: cfg.tagline,
  };
}

/**
 * Attaches hybrid exploration metadata to all VisualNodes in a graph.
 */
export function attachExplorationMetadata(
  nodes: VisualNode[],
  links: VisualLink[] | Edge[]
): VisualNode[] {
  // Pre-calculate edge degree per node
  const degreeMap = new Map<string, number>();
  const critiqueMap = new Map<string, number>();

  for (const link of links) {
    const sId = typeof link.source === 'object' ? link.source.id : link.source;
    const tId = typeof link.target === 'object' ? link.target.id : link.target;
    if (sId) {
      degreeMap.set(sId, (degreeMap.get(sId) || 0) + 1);
    }
    if (tId) {
      degreeMap.set(tId, (degreeMap.get(tId) || 0) + 1);
    }
    if (link.type === 'CRITIQUED') {
      if (sId) critiqueMap.set(sId, (critiqueMap.get(sId) || 0) + 1);
      if (tId) critiqueMap.set(tId, (critiqueMap.get(tId) || 0) + 1);
    }
  }

  return nodes.map((node) => {
    const deg = degreeMap.get(node.id) || 0;
    const crit = critiqueMap.get(node.id) || 0;
    const exploration = computeNodeExploration(
      {
        id: node.id,
        type: node.type,
        traditionId: node.traditionId,
        branch: node.branch,
        importanceScore: node.importanceScore,
        keyWorks: (node.data as Philosopher)?.keyWorks,
      },
      deg,
      crit
    );

    return {
      ...node,
      exploration,
    };
  });
}

export interface ExplorationDistributionStats {
  total: number;
  citadelCount: number;
  frontierCount: number;
  emergingCount: number;
  unchartedCount: number;
  citadelPct: number;
  frontierPct: number;
  emergingPct: number;
  unchartedPct: number;
  meanScore: number;
}

/**
 * Calculates domain distribution stats across active nodes.
 */
export function getExplorationDistributionStats(
  nodes: VisualNode[]
): ExplorationDistributionStats {
  const total = nodes.length;
  if (total === 0) {
    return {
      total: 0,
      citadelCount: 0,
      frontierCount: 0,
      emergingCount: 0,
      unchartedCount: 0,
      citadelPct: 0,
      frontierPct: 0,
      emergingPct: 0,
      unchartedPct: 0,
      meanScore: 0,
    };
  }

  let citadelCount = 0;
  let frontierCount = 0;
  let emergingCount = 0;
  let unchartedCount = 0;
  let scoreSum = 0;

  for (const n of nodes) {
    const state = n.exploration?.state || 'citadel';
    const score = n.exploration?.score ?? 70;
    scoreSum += score;
    if (state === 'citadel') citadelCount++;
    else if (state === 'frontier') frontierCount++;
    else if (state === 'emerging') emergingCount++;
    else if (state === 'uncharted') unchartedCount++;
  }

  return {
    total,
    citadelCount,
    frontierCount,
    emergingCount,
    unchartedCount,
    citadelPct: Math.round((citadelCount / total) * 100),
    frontierPct: Math.round((frontierCount / total) * 100),
    emergingPct: Math.round((emergingCount / total) * 100),
    unchartedPct: Math.round((unchartedCount / total) * 100),
    meanScore: Math.round(scoreSum / total),
  };
}
