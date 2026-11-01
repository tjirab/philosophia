import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  fetchGraphIndex,
  fetchThinkerChunk,
  fetchConceptChunk,
  fetchEdgeChunk,
  clearChunkCache,
} from '../src/lib/graph/chunk-loader';
import philosophersData from '../data/philosophers.json';
import conceptsData from '../data/concepts.json';
import edgesData from '../data/edges.json';

describe('Stage 2 Static Chunking Architecture', () => {
  const publicDir = path.resolve(__dirname, '..', 'public', 'data', 'chunks');
  const graphIndexFile = path.join(publicDir, 'graph-index.json');
  const thinkersDir = path.join(publicDir, 'thinkers');
  const conceptsDir = path.join(publicDir, 'concepts');
  const edgesDir = path.join(publicDir, 'edges');

  beforeEach(() => {
    clearChunkCache();
    vi.restoreAllMocks();
  });

  it('generates a valid, lightweight graph-index.json manifest', () => {
    expect(fs.existsSync(graphIndexFile)).toBe(true);
    const raw = fs.readFileSync(graphIndexFile, 'utf-8');
    const index = JSON.parse(raw);

    expect(index.version).toBe('2.0-chunked');
    expect(typeof index.generatedAt).toBe('string');
    expect(index.nodeCount).toBe(philosophersData.length + conceptsData.length);
    expect(index.edgeCount).toBe(edgesData.length);

    expect(Array.isArray(index.nodes)).toBe(true);
    expect(Array.isArray(index.edges)).toBe(true);
    expect(Array.isArray(index.eras)).toBe(true);
    expect(Array.isArray(index.traditions)).toBe(true);
    expect(Array.isArray(index.domains)).toBe(true);

    // Verify lightweight nodes lack heavy biographical dossiers
    const socrates = index.nodes.find((n: any) => n.id === 'socrates');
    expect(socrates).toBeDefined();
    expect(socrates.name).toBe('Socrates');
    expect(socrates.shortBio).toBeUndefined();
    expect(socrates.centralQuestion).toBeUndefined();
    expect(socrates.keyWorks).toBeUndefined();
  });

  it('generates individual on-demand chunk dossiers for every philosopher', () => {
    expect(fs.existsSync(thinkersDir)).toBe(true);

    for (const p of philosophersData) {
      const chunkPath = path.join(thinkersDir, `${p.id}.json`);
      expect(fs.existsSync(chunkPath), `Missing chunk file for thinker ${p.id}`).toBe(true);

      const content = JSON.parse(fs.readFileSync(chunkPath, 'utf-8'));
      expect(content.id).toBe(p.id);
      expect(content.name).toBe(p.name);
      expect(content.shortBio).toBeDefined();
      expect(content.centralQuestion).toBeDefined();
      expect(Array.isArray(content.keyWorks)).toBe(true);
      expect(Array.isArray(content.media)).toBe(true);
    }
  });

  it('generates individual on-demand chunk dossiers for every concept', () => {
    expect(fs.existsSync(conceptsDir)).toBe(true);

    for (const c of conceptsData) {
      const chunkPath = path.join(conceptsDir, `${c.id}.json`);
      expect(fs.existsSync(chunkPath), `Missing chunk file for concept ${c.id}`).toBe(true);

      const content = JSON.parse(fs.readFileSync(chunkPath, 'utf-8'));
      expect(content.id).toBe(c.id);
      expect(content.title).toBe(c.title);
      expect(content.summary).toBeDefined();
      expect(content.branch).toBe(c.branch);
      expect(Array.isArray(content.media)).toBe(true);
    }
  });

  it('generates individual on-demand chunk dossiers for every edge', () => {
    expect(fs.existsSync(edgesDir)).toBe(true);

    for (const e of edgesData as any[]) {
      const edgeId = e.id || `${e.source}--${e.target}`;
      const chunkPath = path.join(edgesDir, `${edgeId}.json`);
      expect(fs.existsSync(chunkPath), `Missing chunk file for edge ${edgeId}`).toBe(true);

      const content = JSON.parse(fs.readFileSync(chunkPath, 'utf-8'));
      expect(content.source).toBe(e.source);
      expect(content.target).toBe(e.target);
      expect(content.type).toBe(e.type);
      expect(Array.isArray(content.citations)).toBe(true);
    }
  });

  it('fetches thinker chunks with in-memory caching', async () => {
    const mockThinker = { id: 'immanuel-kant', name: 'Immanuel Kant', shortBio: 'German philosopher.' };
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockThinker,
    } as any);

    const first = await fetchThinkerChunk('immanuel-kant');
    expect(first).toEqual(mockThinker);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Second call should resolve from cache without additional fetch
    const second = await fetchThinkerChunk('immanuel-kant');
    expect(second).toEqual(mockThinker);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('gracefully handles missing chunks by returning null', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
    } as any);

    const result = await fetchThinkerChunk('non-existent-thinker');
    expect(result).toBeNull();
  });
});
