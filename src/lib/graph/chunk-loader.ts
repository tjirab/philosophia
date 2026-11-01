import { getAssetUrl } from '../assets';
import { Philosopher, Concept, Edge, MediaResource, Era, Tradition, DomainMeta } from '../types';

export interface ChunkedGraphIndex {
  version: string;
  generatedAt: string;
  nodeCount: number;
  edgeCount: number;
  nodes: Array<{
    id: string;
    name: string;
    type: 'philosopher' | 'concept';
    birthYear?: number;
    deathYear?: number;
    eraId: string;
    traditionId?: string;
    branch?: string;
    introducedBy?: string;
    domains?: string[];
    primaryDomain?: string;
    importanceScore: number;
    imageUrl?: string;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type: string;
    label: string;
    strength?: number;
  }>;
  eras: Era[];
  traditions: Tradition[];
  domains: DomainMeta[];
}

export interface ThinkerChunk extends Philosopher {
  media?: MediaResource[];
}

export interface ConceptChunk extends Concept {
  media?: MediaResource[];
}

export interface EdgeChunk extends Edge {}

// In-memory cache to prevent redundant HTTP requests across the application session
const thinkerCache = new Map<string, Promise<ThinkerChunk | null> | ThinkerChunk>();
const conceptCache = new Map<string, Promise<ConceptChunk | null> | ConceptChunk>();
const edgeCache = new Map<string, Promise<EdgeChunk | null> | EdgeChunk>();
let indexCache: Promise<ChunkedGraphIndex | null> | ChunkedGraphIndex | null = null;

export async function fetchGraphIndex(): Promise<ChunkedGraphIndex | null> {
  if (indexCache) {
    return Promise.resolve(indexCache);
  }

  const url = getAssetUrl('/data/chunks/graph-index.json');
  indexCache = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[chunk-loader] Failed to fetch graph-index from ${url} (status ${res.status})`);
        return null;
      }
      const data: ChunkedGraphIndex = await res.json();
      indexCache = data;
      return data;
    } catch (err) {
      console.warn(`[chunk-loader] Error fetching graph-index:`, err);
      return null;
    }
  })();

  return indexCache;
}

export async function fetchThinkerChunk(id: string): Promise<ThinkerChunk | null> {
  if (thinkerCache.has(id)) {
    return Promise.resolve(thinkerCache.get(id)!);
  }

  const url = getAssetUrl(`/data/chunks/thinkers/${id}.json`);
  const promise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        return null;
      }
      const data: ThinkerChunk = await res.json();
      thinkerCache.set(id, data);
      return data;
    } catch (err) {
      console.warn(`[chunk-loader] Error fetching thinker chunk "${id}":`, err);
      return null;
    }
  })();

  thinkerCache.set(id, promise);
  return promise;
}

export async function fetchConceptChunk(id: string): Promise<ConceptChunk | null> {
  if (conceptCache.has(id)) {
    return Promise.resolve(conceptCache.get(id)!);
  }

  const url = getAssetUrl(`/data/chunks/concepts/${id}.json`);
  const promise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        return null;
      }
      const data: ConceptChunk = await res.json();
      conceptCache.set(id, data);
      return data;
    } catch (err) {
      console.warn(`[chunk-loader] Error fetching concept chunk "${id}":`, err);
      return null;
    }
  })();

  conceptCache.set(id, promise);
  return promise;
}

export async function fetchEdgeChunk(id: string): Promise<EdgeChunk | null> {
  if (edgeCache.has(id)) {
    return Promise.resolve(edgeCache.get(id)!);
  }

  const url = getAssetUrl(`/data/chunks/edges/${id}.json`);
  const promise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        return null;
      }
      const data: EdgeChunk = await res.json();
      edgeCache.set(id, data);
      return data;
    } catch (err) {
      console.warn(`[chunk-loader] Error fetching edge chunk "${id}":`, err);
      return null;
    }
  })();

  edgeCache.set(id, promise);
  return promise;
}

export function clearChunkCache(): void {
  thinkerCache.clear();
  conceptCache.clear();
  edgeCache.clear();
  indexCache = null;
}
