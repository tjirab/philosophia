import erasData from '../../../data/eras.json';
import traditionsData from '../../../data/traditions.json';
import philosophersData from '../../../data/philosophers.json';
import conceptsData from '../../../data/concepts.json';
import edgesData from '../../../data/edges.json';
import mediaData from '../../../data/media.json';
import {
  Era,
  Tradition,
  Philosopher,
  Concept,
  Edge,
  MediaResource,
  GraphData,
  VisualNode,
  VisualLink,
  EraId,
  Branch,
} from '../types';

export const eras: Era[] = erasData as Era[];
export const traditions: Tradition[] = traditionsData as Tradition[];
export const philosophers: Philosopher[] = philosophersData as Philosopher[];
export const concepts: Concept[] = conceptsData as Concept[];
export const edges: Edge[] = edgesData as Edge[];
export const media: MediaResource[] = mediaData as MediaResource[];

export function getFullGraph(): GraphData {
  return {
    eras,
    traditions,
    philosophers,
    concepts,
    edges,
    media,
  };
}

export interface GraphFilterOptions {
  maxYear?: number;
  minYear?: number;
  eraId?: EraId | 'all';
  traditionId?: string | 'all';
  branch?: Branch | 'all';
  includeConcepts?: boolean;
  searchQuery?: string;
}

export function getVisualGraph(options: GraphFilterOptions = {}): {
  nodes: VisualNode[];
  links: VisualLink[];
} {
  const {
    maxYear,
    minYear,
    eraId = 'all',
    traditionId = 'all',
    branch = 'all',
    includeConcepts = true,
    searchQuery = '',
  } = options;

  const traditionMap = new Map(traditions.map((t) => [t.id, t]));
  const eraMap = new Map(eras.map((e) => [e.id, e]));

  // Filter philosophers
  let filteredPhilosophers = philosophers.filter((p) => {
    if (minYear !== undefined && p.deathYear < minYear) return false;
    if (maxYear !== undefined && p.birthYear > maxYear) return false;
    if (eraId !== 'all' && p.eraId !== eraId) return false;
    if (traditionId !== 'all' && p.traditionId !== traditionId) return false;
    return true;
  });

  // Filter concepts
  let filteredConcepts: Concept[] = [];
  if (includeConcepts) {
    filteredConcepts = concepts.filter((c) => {
      if (eraId !== 'all' && c.eraId !== eraId) return false;
      if (branch !== 'all' && c.branch !== branch) return false;
      return true;
    });
  }

  // Text search filter if present
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredPhilosophers = filteredPhilosophers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortBio.toLowerCase().includes(q) ||
        p.centralQuestion.toLowerCase().includes(q) ||
        p.keyWorks.some((w) => w.toLowerCase().includes(q))
    );
    filteredConcepts = filteredConcepts.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.branch.toLowerCase().includes(q)
    );
  }

  const validNodeIds = new Set<string>();

  const nodes: VisualNode[] = [];

  for (const p of filteredPhilosophers) {
    validNodeIds.add(p.id);
    const era = eraMap.get(p.eraId);
    const tradition = traditionMap.get(p.traditionId);
    nodes.push({
      id: p.id,
      name: p.name,
      type: 'philosopher',
      eraId: p.eraId,
      traditionId: p.traditionId,
      year: p.birthYear,
      importanceScore: p.importanceScore,
      color: tradition?.color || era?.color || '#3b82f6',
      summary: p.shortBio,
      data: p,
      val: Math.max(8, Math.round(p.importanceScore / 8)),
    });
  }

  for (const c of filteredConcepts) {
    validNodeIds.add(c.id);
    const era = eraMap.get(c.eraId);
    nodes.push({
      id: c.id,
      name: c.title,
      type: 'concept',
      eraId: c.eraId,
      branch: c.branch,
      importanceScore: 50,
      color: era?.color ? `${era.color}cc` : '#94a3b8',
      summary: c.summary,
      data: c,
      val: 6,
    });
  }

  // Filter links where both source and target exist in validNodeIds
  const links: VisualLink[] = [];
  for (const edge of edges) {
    if (validNodeIds.has(edge.source) && validNodeIds.has(edge.target)) {
      links.push({
        source: edge.source,
        target: edge.target,
        type: edge.type,
        label: edge.label,
        strength: edge.strength || 3,
      });
    }
  }

  return { nodes, links };
}

export function getNodeDetails(nodeId: string): {
  node: Philosopher | Concept | null;
  type: 'philosopher' | 'concept' | null;
  predecessors: Array<{ node: Philosopher | Concept; edge: Edge }>;
  successors: Array<{ node: Philosopher | Concept; edge: Edge }>;
  media: MediaResource[];
  era?: Era;
  tradition?: Tradition;
} {
  const phil = philosophers.find((p) => p.id === nodeId);
  const conc = concepts.find((c) => c.id === nodeId);

  if (!phil && !conc) {
    return {
      node: null,
      type: null,
      predecessors: [],
      successors: [],
      media: [],
    };
  }

  const isPhil = Boolean(phil);
  const targetNode = phil || conc!;
  const nodeType = isPhil ? 'philosopher' : 'concept';

  const era = eras.find((e) => e.id === targetNode.eraId);
  const tradition = isPhil
    ? traditions.find((t) => t.id === (targetNode as Philosopher).traditionId)
    : undefined;

  const allItems = new Map<string, Philosopher | Concept>();
  for (const p of philosophers) allItems.set(p.id, p);
  for (const c of concepts) allItems.set(c.id, c);

  // Predecessors: edges where target == nodeId
  const predecessors: Array<{ node: Philosopher | Concept; edge: Edge }> = [];
  // Successors: edges where source == nodeId
  const successors: Array<{ node: Philosopher | Concept; edge: Edge }> = [];

  for (const edge of edges) {
    if (edge.target === nodeId) {
      const srcNode = allItems.get(edge.source);
      if (srcNode) predecessors.push({ node: srcNode, edge });
    }
    if (edge.source === nodeId) {
      const tgtNode = allItems.get(edge.target);
      if (tgtNode) successors.push({ node: tgtNode, edge });
    }
  }

  // Linked media
  const linkedMedia = media.filter((m) => m.targetId === nodeId);

  return {
    node: targetNode,
    type: nodeType,
    predecessors,
    successors,
    media: linkedMedia,
    era,
    tradition,
  };
}
