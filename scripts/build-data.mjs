import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');

const PHILOSOPHERS_DIR = path.join(DATA_DIR, 'philosophers');
const CONCEPTS_DIR = path.join(DATA_DIR, 'concepts');
const EDGES_DIR = path.join(DATA_DIR, 'edges');
const MEDIA_DIR = path.join(DATA_DIR, 'media');

/**
 * Recursively load all JSON files in a directory.
 * Flattens array contents or single objects.
 */
function loadJsonDir(dir, { recursive = false } = {}) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && recursive) {
      results.push(...loadJsonDir(fullPath, { recursive: true }));
    } else if (entry.isFile() && entry.name.endsWith('.json') && !entry.name.startsWith('.')) {
      try {
        const raw = fs.readFileSync(fullPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          results.push(...parsed);
        } else if (parsed && typeof parsed === 'object') {
          results.push(parsed);
        }
      } catch (err) {
        console.error(`[ERROR] Failed to parse ${fullPath}:`, err.message);
        throw err;
      }
    }
  }

  return results;
}

export function buildData() {
  const startTime = Date.now();

  // 1. Philosophers
  if (fs.existsSync(PHILOSOPHERS_DIR)) {
    const philosophers = loadJsonDir(PHILOSOPHERS_DIR);
    // Sort chronologically by birthYear (and then by id)
    philosophers.sort((a, b) => {
      if (a.birthYear !== b.birthYear) return a.birthYear - b.birthYear;
      return a.id.localeCompare(b.id);
    });
    const targetFile = path.join(DATA_DIR, 'philosophers.json');
    fs.writeFileSync(targetFile, JSON.stringify(philosophers, null, 2) + '\n', 'utf-8');
    console.log(`✓ Compiled ${philosophers.length} philosophers -> data/philosophers.json`);
  }

  // 2. Concepts
  if (fs.existsSync(CONCEPTS_DIR)) {
    const concepts = loadJsonDir(CONCEPTS_DIR);
    concepts.sort((a, b) => a.id.localeCompare(b.id));
    const targetFile = path.join(DATA_DIR, 'concepts.json');
    fs.writeFileSync(targetFile, JSON.stringify(concepts, null, 2) + '\n', 'utf-8');
    console.log(`✓ Compiled ${concepts.length} concepts -> data/concepts.json`);
  }

  // 3. Edges
  if (fs.existsSync(EDGES_DIR)) {
    const rawEdges = loadJsonDir(EDGES_DIR, { recursive: true });
    // Deduplicate by source + target + type
    const seenEdges = new Set();
    const edges = [];
    for (const edge of rawEdges) {
      if (!edge || !edge.source || !edge.target || !edge.type) continue;
      const key = `${edge.source}->${edge.target}:${edge.type}`;
      if (!seenEdges.has(key)) {
        seenEdges.add(key);
        edges.push(edge);
      }
    }
    const targetFile = path.join(DATA_DIR, 'edges.json');
    fs.writeFileSync(targetFile, JSON.stringify(edges, null, 2) + '\n', 'utf-8');
    console.log(`✓ Compiled ${edges.length} edges (deduplicated from ${rawEdges.length}) -> data/edges.json`);
  }

  // 4. Media
  if (fs.existsSync(MEDIA_DIR)) {
    const rawMedia = loadJsonDir(MEDIA_DIR, { recursive: true });
    // Deduplicate by media item id
    const seenMedia = new Set();
    const media = [];
    for (const item of rawMedia) {
      if (!item || !item.id) continue;
      if (!seenMedia.has(item.id)) {
        seenMedia.add(item.id);
        media.push(item);
      }
    }
    const targetFile = path.join(DATA_DIR, 'media.json');
    fs.writeFileSync(targetFile, JSON.stringify(media, null, 2) + '\n', 'utf-8');
    console.log(`✓ Compiled ${media.length} media items -> data/media.json`);
  }

  const elapsed = Date.now() - startTime;
  console.log(`✨ Philosophia data compilation completed in ${elapsed}ms\n`);
}

// Allow CLI execution: `node scripts/build-data.mjs`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildData();
}
