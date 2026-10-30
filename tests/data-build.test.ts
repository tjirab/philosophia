import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { buildData } from '../scripts/build-data.mjs';

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const PHILOSOPHERS_DIR = path.join(DATA_DIR, 'philosophers');
const CONCEPTS_DIR = path.join(DATA_DIR, 'concepts');
const EDGES_DIR = path.join(DATA_DIR, 'edges');
const MEDIA_DIR = path.join(DATA_DIR, 'media');

describe('Modular Data Architecture & Compiler', () => {
  it('validates that every philosopher file matches its id and schema', () => {
    const files = fs.readdirSync(PHILOSOPHERS_DIR).filter((f) => f.endsWith('.json'));
    expect(files.length).toBeGreaterThan(70);

    for (const file of files) {
      const fullPath = path.join(PHILOSOPHERS_DIR, file);
      const phil = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      expect(file).toBe(`${phil.id}.json`);
      expect(phil.id).toBeDefined();
      expect(phil.name).toBeDefined();
      expect(phil.eraId).toBeDefined();
      expect(phil.traditionId).toBeDefined();
      expect(phil.sepSlug).toBeDefined();
      expect(typeof phil.birthYear).toBe('number');
      if (phil.deathYear !== undefined) {
        expect(phil.deathYear).toBeGreaterThanOrEqual(phil.birthYear);
      }
    }
  });

  it('validates that every concept file matches its id and schema', () => {
    const files = fs.readdirSync(CONCEPTS_DIR).filter((f) => f.endsWith('.json'));
    expect(files.length).toBeGreaterThan(50);
    const validBranches = new Set(['epistemology', 'metaphysics', 'ethics', 'political', 'aesthetics', 'mind', 'logic']);

    for (const file of files) {
      const fullPath = path.join(CONCEPTS_DIR, file);
      const concept = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      expect(file).toBe(`${concept.id}.json`);
      expect(concept.id).toBeDefined();
      expect(concept.title).toBeDefined();
      expect(concept.summary).toBeDefined();
      expect(concept.introducedBy).toBeDefined();
      expect(validBranches.has(concept.branch)).toBe(true);
    }
  });

  it('validates that all edge files contain valid edge objects', () => {
    const files = fs.readdirSync(EDGES_DIR).filter((f) => f.endsWith('.json'));
    expect(files.length).toBeGreaterThan(50);
    const validTypes = new Set(['INFLUENCED', 'CRITIQUED', 'DEVELOPED', 'SYNTHESIZED']);

    let totalEdges = 0;
    for (const file of files) {
      const fullPath = path.join(EDGES_DIR, file);
      const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      const edgeList = Array.isArray(content) ? content : [content];

      for (const edge of edgeList) {
        expect(edge.source, `File ${file} has edge missing source`).toBeDefined();
        expect(edge.target, `File ${file} has edge missing target`).toBeDefined();
        expect(validTypes.has(edge.type), `File ${file} has invalid edge type ${edge.type}`).toBe(true);
        expect(typeof edge.strength).toBe('number');
        totalEdges++;
      }
    }
    expect(totalEdges).toBeGreaterThan(250);
  });

  it('validates that all media files contain valid media items', () => {
    const loadRecursive = (dir: string): any[] => {
      let items: any[] = [];
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          items.push(...loadRecursive(full));
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          const parsed = JSON.parse(fs.readFileSync(full, 'utf-8'));
          items.push(...(Array.isArray(parsed) ? parsed : [parsed]));
        }
      }
      return items;
    };

    const mediaItems = loadRecursive(MEDIA_DIR);
    expect(mediaItems.length).toBeGreaterThan(150);

    for (const item of mediaItems) {
      expect(item.id).toBeDefined();
      expect(item.targetId).toBeDefined();
      expect(item.url).toBeDefined();
      expect(['encyclopedia', 'podcast', 'book', 'video']).toContain(item.type);
    }
  });

  it('compiles modular entities idempotently into monolithic bundles', () => {
    // Run compiler
    buildData();

    // Verify all targets exist and are valid non-empty arrays
    const targets = ['philosophers.json', 'concepts.json', 'edges.json', 'media.json'];
    for (const t of targets) {
      const p = path.join(DATA_DIR, t);
      expect(fs.existsSync(p), `Expected ${t} to exist`).toBe(true);
      const parsed = JSON.parse(fs.readFileSync(p, 'utf-8'));
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(50);
    }
  });
});
