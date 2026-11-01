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

export interface Philosopher {
  id: string;
  name: string;
  birthYear: number;
  deathYear?: number;
  eraId: EraId;
  traditionId: string;
  domains?: DomainId[];
  primaryDomain?: DomainId;
  shortBio: string;
  centralQuestion: string;
  keyWorks: (string | KeyWork)[];
  sepSlug: string;
  externalRefs?: ExternalReferences;
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
  importanceScore: number;
  color: string;
  summary: string;
  imageUrl?: string;
  domains?: DomainId[];
  isInterdisciplinary?: boolean;
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
