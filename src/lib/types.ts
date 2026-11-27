export type DomainId = 'philosophy' | 'psychology' | 'sociology';

export interface DomainMeta {
  id: DomainId;
  name: string;
  shortName: string;
  description: string;
  color: string;
  colorDark: string;
  icon: string;
  experimental?: boolean;
}

export const DOMAINS: DomainMeta[] = [
  {
    id: 'philosophy',
    name: 'Philosophy',
    shortName: 'Phil',
    description: 'Metaphysics, Epistemology, Ethics, Mind, and the Foundations of Reason',
    color: '#2563eb',
    colorDark: '#60a5fa',
    icon: 'Compass',
  },
  {
    id: 'psychology',
    name: 'Psychology',
    shortName: 'Psych',
    description: 'Consciousness, Cognition, the Unconscious, and Human Behavior',
    color: '#0d9488',
    colorDark: '#2dd4bf',
    icon: 'Brain',
    experimental: true,
  },
  {
    id: 'sociology',
    name: 'Sociology',
    shortName: 'Soc',
    description: 'Social Structures, Collective Dynamics, Institutions, and Power',
    color: '#9333ea',
    colorDark: '#c084fc',
    icon: 'Users',
    experimental: true,
  },
];

export type EraId =
  | 'pre-socratic'
  | 'classical-greek'
  | 'hellenistic'
  | 'eastern'
  | 'medieval'
  | 'early-modern'
  | 'enlightenment'
  | 'german-idealism'
  | 'nineteenth-century'
  | 'twentieth-century'
  | 'contemporary';

export type PhilosophyBranch =
  | 'epistemology'
  | 'metaphysics'
  | 'ethics'
  | 'political'
  | 'aesthetics'
  | 'mind'
  | 'logic';

export type PsychologyBranch =
  | 'psychoanalytic'
  | 'behavioral'
  | 'cognitive'
  | 'developmental'
  | 'humanistic'
  | 'social-psychology'
  | 'neuropsychology';

export type SociologyBranch =
  | 'social-theory'
  | 'structural-functionalism'
  | 'conflict-theory'
  | 'symbolic-interactionism'
  | 'critical-sociology'
  | 'macrosociology';

export type Branch = PhilosophyBranch | PsychologyBranch | SociologyBranch;

export interface BranchMeta {
  id: Branch;
  label: string;
  domain: DomainId;
}

export const BRANCH_METAS: BranchMeta[] = [
  // Philosophy
  { id: 'epistemology', label: 'Epistemology', domain: 'philosophy' },
  { id: 'metaphysics', label: 'Metaphysics', domain: 'philosophy' },
  { id: 'ethics', label: 'Ethics', domain: 'philosophy' },
  { id: 'political', label: 'Political Philosophy', domain: 'philosophy' },
  { id: 'aesthetics', label: 'Aesthetics', domain: 'philosophy' },
  { id: 'mind', label: 'Philosophy of Mind', domain: 'philosophy' },
  { id: 'logic', label: 'Logic & Language', domain: 'philosophy' },

  // Psychology
  { id: 'psychoanalytic', label: 'Psychoanalysis', domain: 'psychology' },
  { id: 'behavioral', label: 'Behaviorism', domain: 'psychology' },
  { id: 'cognitive', label: 'Cognitive Science', domain: 'psychology' },
  { id: 'developmental', label: 'Developmental Psychology', domain: 'psychology' },
  { id: 'humanistic', label: 'Humanistic Psychology', domain: 'psychology' },
  { id: 'social-psychology', label: 'Social Psychology', domain: 'psychology' },
  { id: 'neuropsychology', label: 'Neuropsychology', domain: 'psychology' },

  // Sociology
  { id: 'social-theory', label: 'Social Theory', domain: 'sociology' },
  { id: 'structural-functionalism', label: 'Structural Functionalism', domain: 'sociology' },
  { id: 'conflict-theory', label: 'Conflict Theory', domain: 'sociology' },
  { id: 'symbolic-interactionism', label: 'Symbolic Interactionism', domain: 'sociology' },
  { id: 'critical-sociology', label: 'Critical Sociology', domain: 'sociology' },
  { id: 'macrosociology', label: 'Macrosociology', domain: 'sociology' },
];

export function getBranchesForDomain(domain: DomainId | 'all'): BranchMeta[] {
  if (domain === 'all') return BRANCH_METAS;
  return BRANCH_METAS.filter((b) => b.domain === domain);
}

export function getDomainForBranch(branch: Branch): DomainId | undefined {
  return BRANCH_METAS.find((b) => b.id === branch)?.domain;
}

export type CanonTier = 'pillar' | 'bridge' | 'contributor';

export type ScoringMethodology = 'canonical' | 'topology' | 'friction';

export interface MethodologyMeta {
  id: ScoringMethodology;
  name: string;
  shortLabel: string;
  icon: string;
  tagline: string;
  description: string;
  formula: string;
}

export const METHODOLOGY_CONFIG: Record<ScoringMethodology, MethodologyMeta> = {
  canonical: {
    id: 'canonical',
    name: 'Hybrid Canonical Consensus',
    shortLabel: 'Hybrid',
    icon: '🏛️',
    tagline: 'Coarse editorial canon tier blended with live bidirectional network centrality.',
    description: 'Balances a 3-tier historical stature prior (48%) with bidirectional log-degree & PageRank centrality (32%), cross-era/domain reach (12%), and primary corpus coverage (8%).',
    formula: '72 + 28 × (0.48·T + 0.32·C_bi + 0.12·R_cross + 0.08·A)',
  },
  topology: {
    id: 'topology',
    name: 'Network Topology',
    shortLabel: 'PageRank',
    icon: '🕸️',
    tagline: 'Pure mathematical centrality (directed PageRank and influence conduits).',
    description: 'Algorithmic centrality computed live from the directed knowledge graph, revealing structural linchpins and forgotten conduits regardless of cultural fame.',
    formula: 'Directed PageRank (d=0.85, 25 iterations) rescaled to [25, 99]',
  },
  friction: {
    id: 'friction',
    name: 'Dialectical Controversy',
    shortLabel: 'Controversy',
    icon: '⚔️',
    tagline: 'Density of philosophical breaks, rebuttals, and paradigm fractures.',
    description: 'Calculates the intensity of intellectual debate provoked by each thinker using Bayesian-smoothed critique & synthesis ratios.',
    formula: '55 × (2·Critiques + Syntheses) / (Total + 3) + min(45, 4·(2·Critiques + Syntheses))',
  },
};

export interface NodeScoreBreakdown {
  methodology: ScoringMethodology;
  score: number; // 0 to 100
  rawScore?: number;
  degree?: number;
  canonTier?: CanonTier;
  rank: number;
  totalNodes: number;
  percentile: number;
  components: {
    label: string;
    value: string | number;
    weight?: string;
  }[];
}

export type ExplorationState = 'citadel' | 'frontier' | 'emerging' | 'uncharted';

export interface ExplorationMeta {
  state: ExplorationState;
  score: number; // 0 to 100
  label: string; // e.g. "Canonical Citadel", "Disputed Frontier"
  badgeIcon: string; // "🏛️", "⚔️", "🧭", "🌫️"
  tagline: string;
  openQuestions?: string[];
  estimatedPublications?: number;
}

export interface BranchExplorationProfile {
  id: string;
  name: string;
  historicalWeight: number;
  contemporaryVelocity: number;
  estimatedPublications: number;
  baseExplorationScore: number;
  defaultState: ExplorationState;
  exploredSummary: string;
  frontierSummary: string;
  openProblems: string[];
}

export type EdgeType = 'INFLUENCED' | 'CRITIQUED' | 'DEVELOPED' | 'SYNTHESIZED';
export type AcademicConsensus = 'unanimous' | 'broad-consensus' | 'debated' | 'revisionist';
export type CitationType = 'primary' | 'secondary' | 'sep' | 'iep';

export interface AcademicCitation {
  id?: string;
  citationType: CitationType;
  author: string;
  work: string;
  sectionOrPage?: string;      // e.g. "Bekker 1003a20-32", "Stephanus 514a-520a", "B132", "DK 22 B30"
  year?: number | string;
  quote?: string;              // Direct translated excerpt or key axiom
  url?: string;                // External link (SEP, Perseus, Gutenberg, PhilPapers, etc.)
}

export interface EdgeTypeMeta {
  type: EdgeType;
  label: string;
  description: string;
  color: string;
  colorDark: string;
  badgeClass: string;
  cardBorderClass: string;
}

export const EDGE_TYPE_CONFIG: Record<EdgeType, EdgeTypeMeta> = {
  CRITIQUED: {
    type: 'CRITIQUED',
    label: 'Critique & Rebuttal',
    description: 'Direct dialectical rebuttal or rejection of a predecessor’s axioms.',
    color: '#dc2626',
    colorDark: '#f87171',
    badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
    cardBorderClass: 'border-l-4 border-l-rose-500/80',
  },
  DEVELOPED: {
    type: 'DEVELOPED',
    label: 'Extension & Systematization',
    description: 'Advanced, expanded, or formalized an existing line of thought.',
    color: '#0d9488',
    colorDark: '#2dd4bf',
    badgeClass: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30',
    cardBorderClass: 'border-l-4 border-l-teal-500/80',
  },
  SYNTHESIZED: {
    type: 'SYNTHESIZED',
    label: 'Synthetic Integration',
    description: 'Merged previously incompatible or disparate traditions.',
    color: '#9333ea',
    colorDark: '#c084fc',
    badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
    cardBorderClass: 'border-l-4 border-l-purple-500/80',
  },
  INFLUENCED: {
    type: 'INFLUENCED',
    label: 'Intellectual Lineage',
    description: 'Foundational reading, direct pedagogical mentorship, or acknowledged philosophical lineage.',
    color: '#2563eb',
    colorDark: '#60a5fa',
    badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30',
    cardBorderClass: 'border-l-4 border-l-sky-500/80',
  },
};

export function getEdgeTypeConfig(type?: string): EdgeTypeMeta {
  if (type && type in EDGE_TYPE_CONFIG) {
    return EDGE_TYPE_CONFIG[type as EdgeType];
  }
  return EDGE_TYPE_CONFIG.INFLUENCED;
}

export type MediaType = 'podcast' | 'encyclopedia' | 'video' | 'book';

export interface Era {
  id: EraId;
  name: string;
  startYear: number;
  endYear: number;
  color: string;
  description: string;
}

export interface Tradition {
  id: string;
  name: string;
  eraId: EraId;
  color: string;
  description: string;
}

export interface KeyWork {
  title: string;
  year?: number | string;
  url?: string;
  wikipediaUrl?: string;
  isbn?: string;
  description?: string;
}

export interface ExternalReferences {
  sep?: string;
  iep?: string;
  apa?: string;
  sociologyRef?: string;
  wikipedia?: string;
}

export type ThinkerGender = 'woman' | 'man' | 'non-binary';

export type CulturalSphere =
  | 'western'
  | 'east-asian'
  | 'south-asian'
  | 'mena'
  | 'african'
  | 'latin-american'
  | 'indigenous';

export interface Philosopher {
  id: string;
  name: string;
  birthYear: number;
  deathYear?: number;
  eraId: EraId;
  traditionId: string;
  domains?: DomainId[];
  primaryDomain?: DomainId;
  gender?: ThinkerGender;
  culturalSphere?: CulturalSphere;
  shortBio: string;
  centralQuestion: string;
  keyWorks: (string | KeyWork)[];
  sepSlug: string;
  externalRefs?: ExternalReferences;
  canonTier?: CanonTier;
  importanceScore: number;
  imageUrl?: string;
}

export type Thinker = Philosopher;

export interface Concept {
  id: string;
  title: string;
  branch: Branch;
  eraId: EraId;
  introducedBy: string; // Philosopher ID
  summary: string;
  sepSlug?: string;
  domainId?: DomainId;
}

export interface Edge {
  id?: string;
  source: string;
  target: string;
  type: EdgeType;
  label: string;
  strength?: number;
  description?: string;
  historicalContext?: string;
  dialecticalTension?: string;
  academicConsensus?: AcademicConsensus;
  citations?: AcademicCitation[];
  keyConcepts?: string[];
}

export interface MediaResource {
  id: string;
  targetId: string; // Philosopher ID or Concept ID
  type: MediaType;
  title: string;
  url: string;
  creator?: string;
  episodeNumber?: number;
  audioUrl?: string;
  duration?: string;
  summary?: string;
}

export interface GraphData {
  eras: Era[];
  traditions: Tradition[];
  philosophers: Philosopher[];
  concepts: Concept[];
  edges: Edge[];
  media: MediaResource[];
}

export interface VisualNode {
  id: string;
  name: string;
  type: 'philosopher' | 'concept';
  eraId: EraId;
  traditionId?: string;
  branch?: Branch;
  year?: number;
  canonTier?: CanonTier;
  importanceScore: number;
  color: string;
  summary: string;
  imageUrl?: string;
  domains?: DomainId[];
  isInterdisciplinary?: boolean;
  exploration?: ExplorationMeta;
  methodology?: ScoringMethodology;
  scoreBreakdown?: NodeScoreBreakdown;
  data: Philosopher | Concept;
  // Graph engine coordinates
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  val?: number; // node size in react-force-graph
}

export interface VisualLink {
  id?: string;
  source: string | VisualNode;
  target: string | VisualNode;
  type: EdgeType;
  label: string;
  strength?: number;
  edge?: Edge;
}
