import type { CanonTier } from '../types';

export const CANON_TIER_PRIORS: Record<CanonTier, number>;

export const HYBRID_SCORING_CONSTANTS: {
  floor: number;
  span: number;
  weights: {
    tier: number;
    centrality: number;
    crossBoundary: number;
    apparatus: number;
  };
  frictionSmoothingPrior: number;
};

export interface FrictionScoreEntry {
  score: number;
  rawScore: number;
  critiqueCount: number;
  synthesisCount: number;
  totalCount: number;
}

export interface HybridCanonicalScoreEntry {
  score: number;
  rawScore: number;
  canonTier: CanonTier;
  tierNorm: number;
  bidirectionalCentrality: number;
  logDegree: number;
  undirectedPageRank: number;
  crossBoundaryReach: number;
  distinctNeighborEras: number;
  distinctNeighborTraditions: number;
  isInterdisciplinary: boolean;
  scholarlyApparatus: number;
  degree: number;
}

export function inferCanonTier(node: Record<string, any>): CanonTier;

export function computeDirectedPageRank(
  nodeIds: string[],
  links: Array<{ source: string | { id: string }; target: string | { id: string } }>,
  options?: { dampingFactor?: number; iterations?: number }
): Map<string, number>;

export function computeUndirectedPageRank(
  nodeIds: string[],
  links: Array<{ source: string | { id: string }; target: string | { id: string } }>,
  options?: { dampingFactor?: number; iterations?: number }
): Map<string, number>;

export function computeDialecticalFrictionScores(
  nodeIds: string[],
  links: Array<{ source: string | { id: string }; target: string | { id: string }; type: string }>
): Map<string, FrictionScoreEntry>;

export function computeHybridCanonicalScores(
  nodes: Array<Record<string, any>>,
  links: Array<{ source: string | { id: string }; target: string | { id: string }; type?: string }>
): Map<string, HybridCanonicalScoreEntry>;

export function compareByDeterministicRank(
  a: { id?: string; name?: string; score?: number; rawScore?: number; importanceScore?: number; degree?: number },
  b: { id?: string; name?: string; score?: number; rawScore?: number; importanceScore?: number; degree?: number }
): number;
