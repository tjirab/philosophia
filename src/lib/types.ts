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

export type Branch =
  | 'epistemology'
  | 'metaphysics'
  | 'ethics'
  | 'political'
  | 'aesthetics'
  | 'mind'
  | 'logic';

export type EdgeType = 'INFLUENCED' | 'CRITIQUED' | 'DEVELOPED' | 'SYNTHESIZED';

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

export interface Philosopher {
  id: string;
  name: string;
  birthYear: number;
  deathYear: number;
  eraId: EraId;
  traditionId: string;
  shortBio: string;
  centralQuestion: string;
  keyWorks: (string | KeyWork)[];
  sepSlug: string;
  importanceScore: number;
}

export interface Concept {
  id: string;
  title: string;
  branch: Branch;
  eraId: EraId;
  introducedBy: string; // Philosopher ID
  summary: string;
  sepSlug?: string;
}

export interface Edge {
  source: string;
  target: string;
  type: EdgeType;
  label: string;
  strength?: number;
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
  data: Philosopher | Concept;
  // Graph engine coordinates
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  val?: number; // node size in react-force-graph
}

export interface VisualLink {
  source: string | VisualNode;
  target: string | VisualNode;
  type: EdgeType;
  label: string;
  strength?: number;
}
