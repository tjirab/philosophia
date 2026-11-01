import erasData from '../../../data/eras.json';
import traditionsData from '../../../data/traditions.json';
import domainsData from '../../../data/domains.json';
import philosophersData from '../../../data/philosophers.json';
import conceptsData from '../../../data/concepts.json';
import edgesData from '../../../data/edges.json';
import mediaData from '../../../data/media.json';
import {
  Era,
  Tradition,
  DomainMeta,
  DomainId,
  Philosopher,
  Concept,
  Edge,
  MediaResource,
  AcademicCitation,
  GraphData,
  VisualNode,
  VisualLink,
  EraId,
  Branch,
  ExplorationState,
  ExplorationMeta,
  ScoringMethodology,
  NodeScoreBreakdown,
  KeyWork,
} from '../types';
import { attachExplorationMetadata, computeNodeExploration } from './exploration-service';
import { applyScoringMethodology } from './scoring-engine';

export const eras: Era[] = erasData as Era[];
export const traditions: Tradition[] = traditionsData as Tradition[];
export const domains: DomainMeta[] = domainsData as DomainMeta[];
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
  domainId?: DomainId | 'all';
  interdisciplinaryOnly?: boolean;
  traditionId?: string | 'all';
  branch?: Branch | 'all';
  includeConcepts?: boolean;
  searchQuery?: string;
  explorationFilter?: ExplorationState | 'all';
  methodology?: ScoringMethodology;
}

export function getVisualGraph(options: GraphFilterOptions = {}): {
  nodes: VisualNode[];
  links: VisualLink[];
} {
  const {
    maxYear,
    minYear,
    eraId = 'all',
    domainId = 'all',
    interdisciplinaryOnly = false,
    traditionId = 'all',
    branch = 'all',
    includeConcepts = true,
    searchQuery = '',
    explorationFilter = 'all',
    methodology = 'canonical',
  } = options;

  const traditionMap = new Map(traditions.map((t) => [t.id, t]));
  const eraMap = new Map(eras.map((e) => [e.id, e]));

  // Filter philosophers
  let filteredPhilosophers = philosophers.filter((p) => {
    if (minYear !== undefined && p.deathYear !== undefined && p.deathYear !== null && p.deathYear < minYear) return false;
    if (maxYear !== undefined && p.birthYear > maxYear) return false;
    if (eraId !== 'all' && p.eraId !== eraId) return false;
    if (traditionId !== 'all' && p.traditionId !== traditionId) return false;

    const pDomains = p.domains && p.domains.length > 0 ? p.domains : ['philosophy'];
    if (domainId !== 'all' && !pDomains.includes(domainId)) return false;
    if (interdisciplinaryOnly && pDomains.length < 2) return false;

    return true;
  });

  const philosopherMap = new Map(philosophers.map((p) => [p.id, p]));

  // Filter concepts
  let filteredConcepts: Concept[] = [];
  if (includeConcepts) {
    filteredConcepts = concepts.filter((c) => {
      if (eraId !== 'all' && c.eraId !== eraId) return false;
      if (branch !== 'all' && c.branch !== branch) return false;

      const introducingPhil = c.introducedBy ? philosopherMap.get(c.introducedBy) : undefined;
      const cDomains = c.domainId
        ? [c.domainId]
        : introducingPhil?.domains && introducingPhil.domains.length > 0
        ? introducingPhil.domains
        : ['philosophy'];

      if (domainId !== 'all' && !cDomains.includes(domainId)) return false;
      if (interdisciplinaryOnly && (!introducingPhil || (introducingPhil.domains && introducingPhil.domains.length < 2))) {
        return false;
      }

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
        p.keyWorks.some((w) => {
          const title = typeof w === 'string' ? w : w.title;
          return title.toLowerCase().includes(q);
        })
    );
    filteredConcepts = filteredConcepts.filter((c) => {
      const title = c.title || (c as any).name || '';
      const summary = c.summary || (c as any).description || '';
      const branch = c.branch || '';
      return (
        title.toLowerCase().includes(q) ||
        summary.toLowerCase().includes(q) ||
        branch.toLowerCase().includes(q)
      );
    });
  }

  const validNodeIds = new Set<string>();
  const nodes: VisualNode[] = [];

  const timelineStartYear = -650;
  const timelineEndYear = 2020;
  const totalSpan = timelineEndYear - timelineStartYear;

  for (let idx = 0; idx < filteredPhilosophers.length; idx++) {
    const p = filteredPhilosophers[idx];
    validNodeIds.add(p.id);
    const era = eraMap.get(p.eraId);
    const tradition = traditionMap.get(p.traditionId);

    // Deterministic chronological coordinate seeding:
    // Antiquity starts on the left (-1700), Modernity progresses to the right (+1700).
    const norm = Math.max(0, Math.min(1, (p.birthYear - timelineStartYear) / totalSpan));
    const x = (norm - 0.5) * 3400 + Math.sin(idx * 3.1) * 55;
    // Alternate polarity and stagger vertically across [-550, 550] so adjacent thinkers never collide initially
    const ySign = idx % 2 === 0 ? 1 : -1;
    const yMagnitude = 160 + ((idx * 89) % 380);
    const y = ySign * yMagnitude;

    const pDomains: DomainId[] = (p.domains && p.domains.length > 0 ? p.domains : ['philosophy']) as DomainId[];
    const isInterdisciplinary = pDomains.length >= 2;

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
      imageUrl: p.imageUrl || `/portraits/${p.id}.jpg`,
      domains: pDomains,
      isInterdisciplinary,
      data: p,
      val: Math.max(8, Math.round(p.importanceScore / 8)),
      x,
      y,
    });
  }

  for (let idx = 0; idx < filteredConcepts.length; idx++) {
    const c = filteredConcepts[idx];
    validNodeIds.add(c.id);
    const era = eraMap.get(c.eraId);

    // Concept chronology: anchor near introducing philosopher or era midpoint
    const introducingPhil = c.introducedBy ? philosopherMap.get(c.introducedBy) : undefined;
    const cDomains: DomainId[] = (
      c.domainId
        ? [c.domainId]
        : introducingPhil?.domains && introducingPhil.domains.length > 0
        ? introducingPhil.domains
        : ['philosophy']
    ) as DomainId[];
    const conceptYear = introducingPhil
      ? introducingPhil.birthYear + 25
      : era
      ? Math.round((era.startYear + era.endYear) / 2)
      : 1500;

    const norm = Math.max(0, Math.min(1, (conceptYear - timelineStartYear) / totalSpan));
    const x = (norm - 0.5) * 3400 + Math.cos(idx * 2.9) * 65;
    // Place concepts in distinct vertical alternating bands offset from thinkers
    const ySign = idx % 2 === 0 ? -1 : 1;
    const yMagnitude = 120 + ((idx * 73) % 420);
    const y = ySign * yMagnitude;

    nodes.push({
      id: c.id,
      name: c.title || (c as any).name || c.id,
      type: 'concept',
      eraId: c.eraId,
      branch: c.branch,
      year: conceptYear,
      importanceScore: 50,
      color: era?.color ? `${era.color}cc` : '#94a3b8',
      summary: c.summary || (c as any).description || '',
      domains: cDomains,
      isInterdisciplinary: false,
      data: c,
      val: 6,
      x,
      y,
    });
  }

  // Filter links where both source and target exist in validNodeIds
  const links: VisualLink[] = [];
  for (const edge of edges) {
    if (validNodeIds.has(edge.source) && validNodeIds.has(edge.target)) {
      links.push({
        id: edge.id || `${edge.source}--${edge.target}`,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        label: edge.label,
        strength: Math.min(5, Math.max(1, edge.strength || 3)),
        edge,
      });
    }
  }

  // Attach hybrid exploration metadata to all nodes using the canonical edge corpus
  // to ensure consistent terrain classification regardless of active visibility filters
  let finalNodes = attachExplorationMetadata(nodes, edges);

  // Apply active scoring methodology (canonical, topology PageRank, or dialectical friction)
  finalNodes = applyScoringMethodology(finalNodes, links, methodology);

  // If filtered by exploration state, filter finalNodes and prune links
  if (explorationFilter !== 'all') {
    finalNodes = finalNodes.filter((n) => n.exploration?.state === explorationFilter);
    const retainedIds = new Set(finalNodes.map((n) => n.id));
    const filteredLinks = links.filter((l) => {
      const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      return retainedIds.has(sId) && retainedIds.has(tId);
    });
    return { nodes: finalNodes, links: filteredLinks };
  }

  return { nodes: finalNodes, links };
}

export function getNodeDetails(nodeId: string, methodology: ScoringMethodology = 'canonical'): {
  node: Philosopher | Concept | null;
  type: 'philosopher' | 'concept' | null;
  predecessors: Array<{ node: Philosopher | Concept; edge: Edge }>;
  successors: Array<{ node: Philosopher | Concept; edge: Edge }>;
  media: MediaResource[];
  era?: Era;
  tradition?: Tradition;
  exploration?: ExplorationMeta;
  scoreBreakdown?: NodeScoreBreakdown;
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

  const edgeCount = predecessors.length + successors.length;
  const critiqueCount = [...predecessors, ...successors].filter((e) => e.edge.type === 'CRITIQUED').length;
  const exploration = computeNodeExploration(
    {
      id: targetNode.id,
      type: nodeType,
      traditionId: (targetNode as Philosopher).traditionId,
      branch: (targetNode as Concept).branch,
      importanceScore: (targetNode as Philosopher).importanceScore || 50,
      keyWorks: (targetNode as Philosopher).keyWorks,
    },
    edgeCount,
    critiqueCount
  );

  // Fast computation of score breakdown for this node
  const allNodes: VisualNode[] = [
    ...philosophers.map((p) => ({
      id: p.id,
      name: p.name,
      type: 'philosopher' as const,
      eraId: p.eraId,
      importanceScore: p.importanceScore,
      color: '#3b82f6',
      summary: p.shortBio,
      data: p,
    })),
    ...concepts.map((c) => ({
      id: c.id,
      name: c.title || (c as any).name || c.id,
      type: 'concept' as const,
      eraId: c.eraId,
      importanceScore: 50,
      color: '#94a3b8',
      summary: c.summary || (c as any).description || '',
      data: c,
    })),
  ];
  const scoredNodes = applyScoringMethodology(allNodes, edges, methodology);
  const matched = scoredNodes.find((n) => n.id === nodeId);
  const scoreBreakdown = matched?.scoreBreakdown;

  return {
    node: targetNode,
    type: nodeType,
    predecessors,
    successors,
    media: linkedMedia,
    era,
    tradition,
    exploration,
    scoreBreakdown,
  };
}

export function getEdgeDetails(edgeId: string): {
  edge: Edge;
  sourceNode: Philosopher | Concept | null;
  targetNode: Philosopher | Concept | null;
  sourceEra?: Era;
  targetEra?: Era;
  sourceTradition?: Tradition;
  targetTradition?: Tradition;
  connectedConcepts: Concept[];
  relatedEdges: Edge[];
} | null {
  const edge = edges.find(
    (e) => e.id === edgeId || `${e.source}--${e.target}` === edgeId
  );
  if (!edge) return null;

  const allItems = new Map<string, Philosopher | Concept>();
  for (const p of philosophers) allItems.set(p.id, p);
  for (const c of concepts) allItems.set(c.id, c);

  const sourceNode = allItems.get(edge.source) || null;
  const targetNode = allItems.get(edge.target) || null;

  const sourceEra = sourceNode ? eras.find((e) => e.id === sourceNode.eraId) : undefined;
  const targetEra = targetNode ? eras.find((e) => e.id === targetNode.eraId) : undefined;

  const sourceTradition =
    sourceNode && 'traditionId' in sourceNode
      ? traditions.find((t) => t.id === sourceNode.traditionId)
      : undefined;
  const targetTradition =
    targetNode && 'traditionId' in targetNode
      ? traditions.find((t) => t.id === targetNode.traditionId)
      : undefined;

  // Concepts directly linked to either source or target
  const connectedConcepts: Concept[] = concepts.filter(
    (c) => c.introducedBy === edge.source || c.introducedBy === edge.target
  );

  // Other related edges involving either source or target
  const relatedEdges = edges.filter(
    (e) =>
      e !== edge &&
      (e.source === edge.source ||
        e.target === edge.target ||
        e.source === edge.target ||
        e.target === edge.source)
  );

  return {
    edge,
    sourceNode,
    targetNode,
    sourceEra,
    targetEra,
    sourceTradition,
    targetTradition,
    connectedConcepts,
    relatedEdges,
  };
}

export function getConceptDetails(conceptId: string): {
  concept: Concept;
  era?: Era;
  domain?: DomainId;
  introducedByPhilosopher?: Philosopher;
  introducedByTradition?: Tradition;
  predecessors: Array<{ node: Philosopher | Concept; edge: Edge }>;
  successors: Array<{ node: Philosopher | Concept; edge: Edge }>;
  citations: AcademicCitation[];
  relatedEdges: Edge[];
  coIntroducedConcepts: Concept[];
  media: MediaResource[];
  exploration?: ExplorationMeta;
  scoreBreakdown?: NodeScoreBreakdown;
} | null {
  const concept = concepts.find((c) => c.id === conceptId);
  if (!concept) return null;

  const nodeDetails = getNodeDetails(conceptId);

  const era = eras.find((e) => e.id === concept.eraId) || nodeDetails.era;
  const introducedByPhilosopher = philosophers.find((p) => p.id === concept.introducedBy);
  const introducedByTradition = introducedByPhilosopher
    ? traditions.find((t) => t.id === introducedByPhilosopher.traditionId)
    : undefined;

  const domain: DomainId =
    concept.domainId ||
    (introducedByPhilosopher?.domains && introducedByPhilosopher.domains.length > 0
      ? introducedByPhilosopher.domains[0]
      : 'philosophy');

  const coIntroducedConcepts = concepts.filter(
    (c) => c.id !== conceptId && c.introducedBy === concept.introducedBy
  );

  // Extract unique citations across predecessors and successors
  const citations: AcademicCitation[] = [];
  const seenCitations = new Set<string>();
  for (const { edge } of [...nodeDetails.predecessors, ...nodeDetails.successors]) {
    if (edge.citations) {
      for (const cite of edge.citations) {
        const key = `${cite.author}--${cite.work}--${cite.sectionOrPage || ''}`;
        if (!seenCitations.has(key)) {
          seenCitations.add(key);
          citations.push(cite);
        }
      }
    }
  }

  // Related edges: edges connecting to this concept or to its formulating philosopher
  const relatedEdges = edges.filter(
    (e) =>
      e.source === conceptId ||
      e.target === conceptId ||
      (introducedByPhilosopher &&
        (e.source === introducedByPhilosopher.id || e.target === introducedByPhilosopher.id))
  );

  // Media targeting this concept
  const mediaItems = media.filter((m) => m.targetId === conceptId);

  return {
    concept,
    era,
    domain,
    introducedByPhilosopher,
    introducedByTradition,
    predecessors: nodeDetails.predecessors,
    successors: nodeDetails.successors,
    citations,
    relatedEdges,
    coIntroducedConcepts,
    media: mediaItems,
    exploration: nodeDetails.exploration,
    scoreBreakdown: nodeDetails.scoreBreakdown,
  };
}

export function getThinkerDetails(thinkerId: string): {
  thinker: Philosopher;
  era?: Era;
  tradition?: Tradition;
  predecessors: Array<{ node: Philosopher | Concept; edge: Edge }>;
  successors: Array<{ node: Philosopher | Concept; edge: Edge }>;
  formulatedConcepts: Concept[];
  connectedConcepts: Concept[];
  keyWorks: KeyWork[];
  citations: AcademicCitation[];
  relatedEdges: Edge[];
  contemporaryThinkers: Philosopher[];
  media: MediaResource[];
  exploration?: ExplorationMeta;
  scoreBreakdown?: NodeScoreBreakdown;
} | null {
  const thinker = philosophers.find((p) => p.id === thinkerId);
  if (!thinker) return null;

  const nodeDetails = getNodeDetails(thinkerId);
  const era = eras.find((e) => e.id === thinker.eraId) || nodeDetails.era;
  const tradition = traditions.find((t) => t.id === thinker.traditionId) || nodeDetails.tradition;

  // Formulated concepts: concepts explicitly introduced by this thinker
  const formulatedConcepts = concepts.filter((c) => c.introducedBy === thinkerId);

  // Connected concepts: concepts linked via predecessors or successors
  const connectedConceptIds = new Set<string>();
  const connectedConcepts: Concept[] = [];
  for (const item of [...nodeDetails.predecessors, ...nodeDetails.successors]) {
    if ('branch' in item.node) {
      if (!connectedConceptIds.has(item.node.id)) {
        connectedConceptIds.add(item.node.id);
        connectedConcepts.push(item.node as Concept);
      }
    }
  }

  // Key works normalized into KeyWork objects
  const keyWorks: KeyWork[] = thinker.keyWorks
    ? thinker.keyWorks.map((w) =>
        typeof w === 'string'
          ? {
              title: w,
              url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(w)}`,
              wikipediaUrl: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(w)}`,
            }
          : w
      )
    : [];

  // Extract unique citations across predecessors and successors
  const citations: AcademicCitation[] = [];
  const seenCitations = new Set<string>();
  for (const { edge } of [...nodeDetails.predecessors, ...nodeDetails.successors]) {
    if (edge.citations) {
      for (const cite of edge.citations) {
        const key = `${cite.author}--${cite.work}--${cite.sectionOrPage || ''}`;
        if (!seenCitations.has(key)) {
          seenCitations.add(key);
          citations.push(cite);
        }
      }
    }
  }

  // Related edges
  const relatedEdges = edges.filter(
    (e) => e.source === thinkerId || e.target === thinkerId
  );

  // Contemporary peers in same tradition or era
  const contemporaryThinkers = philosophers.filter(
    (p) =>
      p.id !== thinkerId &&
      (p.traditionId === thinker.traditionId || p.eraId === thinker.eraId)
  ).slice(0, 6);

  // Media targeting this thinker
  const thinkerMedia = media.filter((m) => m.targetId === thinkerId);

  return {
    thinker,
    era,
    tradition,
    predecessors: nodeDetails.predecessors,
    successors: nodeDetails.successors,
    formulatedConcepts,
    connectedConcepts,
    keyWorks,
    citations,
    relatedEdges,
    contemporaryThinkers,
    media: thinkerMedia,
    exploration: nodeDetails.exploration,
    scoreBreakdown: nodeDetails.scoreBreakdown,
  };
}

export const getPhilosopherDetails = getThinkerDetails;

