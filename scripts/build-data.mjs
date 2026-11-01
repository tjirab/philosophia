import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const CHUNKS_DIR = path.join(PUBLIC_DIR, 'data', 'chunks');

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

/**
 * Write a JSON file atomically using a temporary file and rename to prevent
 * partial reads or race conditions during parallel test execution.
 */
function writeJsonAtomic(filePath, data) {
  const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2) + '\n';
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmpPath = `${filePath}.tmp.${process.pid}.${Math.random().toString(36).slice(2)}`;
  fs.writeFileSync(tmpPath, content, 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

export function buildData() {
  const startTime = Date.now();

  let philosophers = [];
  let concepts = [];
  let edges = [];
  let media = [];

  // 1. Philosophers
  if (fs.existsSync(PHILOSOPHERS_DIR)) {
    philosophers = loadJsonDir(PHILOSOPHERS_DIR);
    // Ensure default domains and primaryDomain
    for (const p of philosophers) {
      if (!p.domains || !Array.isArray(p.domains) || p.domains.length === 0) {
        p.domains = ['philosophy'];
      }
      if (!p.primaryDomain) {
        p.primaryDomain = p.domains[0];
      }
    }
    // Sort chronologically by birthYear (and then by id)
    philosophers.sort((a, b) => {
      if (a.birthYear !== b.birthYear) return a.birthYear - b.birthYear;
      return a.id.localeCompare(b.id);
    });
    const targetFile = path.join(DATA_DIR, 'philosophers.json');
    writeJsonAtomic(targetFile, philosophers);
    console.log(`✓ Compiled ${philosophers.length} philosophers -> data/philosophers.json`);
  }

  // 2. Concepts
  if (fs.existsSync(CONCEPTS_DIR)) {
    concepts = loadJsonDir(CONCEPTS_DIR);
    concepts.sort((a, b) => a.id.localeCompare(b.id));
    const targetFile = path.join(DATA_DIR, 'concepts.json');
    writeJsonAtomic(targetFile, concepts);
    console.log(`✓ Compiled ${concepts.length} concepts -> data/concepts.json`);
  }

  // 3. Edges
  if (fs.existsSync(EDGES_DIR)) {
    const rawEdges = loadJsonDir(EDGES_DIR, { recursive: true });
    // Deduplicate by source + target + type
    const seenEdges = new Set();
    for (const edge of rawEdges) {
      if (!edge || !edge.source || !edge.target || !edge.type) continue;
      const key = `${edge.source}->${edge.target}:${edge.type}`;
      if (!seenEdges.has(key)) {
        seenEdges.add(key);
        if (!edge.id) {
          edge.id = `${edge.source}--${edge.target}`;
        }
        edges.push(edge);
      }
    }
    const targetFile = path.join(DATA_DIR, 'edges.json');
    writeJsonAtomic(targetFile, edges);
    console.log(`✓ Compiled ${edges.length} edges (deduplicated from ${rawEdges.length}) -> data/edges.json`);
  }

  // 4. Media
  if (fs.existsSync(MEDIA_DIR)) {
    const rawMedia = loadJsonDir(MEDIA_DIR, { recursive: true });
    // Deduplicate by media item id
    const seenMedia = new Set();
    for (const item of rawMedia) {
      if (!item || !item.id) continue;
      if (!seenMedia.has(item.id)) {
        seenMedia.add(item.id);
        media.push(item);
      }
    }
    const targetFile = path.join(DATA_DIR, 'media.json');
    writeJsonAtomic(targetFile, media);
    console.log(`✓ Compiled ${media.length} media items -> data/media.json`);
  }

  // 5. Stage 2: Static Chunks Compilation
  const thinkersChunkDir = path.join(CHUNKS_DIR, 'thinkers');
  const conceptsChunkDir = path.join(CHUNKS_DIR, 'concepts');
  const edgesChunkDir = path.join(CHUNKS_DIR, 'edges');

  fs.mkdirSync(thinkersChunkDir, { recursive: true });
  fs.mkdirSync(conceptsChunkDir, { recursive: true });
  fs.mkdirSync(edgesChunkDir, { recursive: true });

  // Map media by targetId
  const mediaByTarget = new Map();
  for (const m of media) {
    if (!m.targetId) continue;
    if (!mediaByTarget.has(m.targetId)) mediaByTarget.set(m.targetId, []);
    mediaByTarget.get(m.targetId).push(m);
  }

  // Write per-thinker chunks
  for (const p of philosophers) {
    const chunkData = {
      ...p,
      media: mediaByTarget.get(p.id) || [],
    };
    writeJsonAtomic(path.join(thinkersChunkDir, `${p.id}.json`), chunkData);
  }

  // Write per-concept chunks
  for (const c of concepts) {
    const chunkData = {
      ...c,
      media: mediaByTarget.get(c.id) || [],
    };
    writeJsonAtomic(path.join(conceptsChunkDir, `${c.id}.json`), chunkData);
  }

  // Write per-edge chunks
  for (const e of edges) {
    const edgeId = e.id || `${e.source}--${e.target}`;
    writeJsonAtomic(path.join(edgesChunkDir, `${edgeId}.json`), e);
  }

  // Generate lightweight graph-index.json manifest (~35 KB)
  let eras = [];
  let traditions = [];
  let domains = [];
  try {
    eras = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'eras.json'), 'utf-8'));
    traditions = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'traditions.json'), 'utf-8'));
    domains = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'domains.json'), 'utf-8'));
  } catch (err) {
    console.warn('[WARN] Failed to read auxiliary metadata for graph-index:', err.message);
  }

  const lightweightNodes = [
    ...philosophers.map((p) => ({
      id: p.id,
      name: p.name,
      type: 'philosopher',
      birthYear: p.birthYear,
      deathYear: p.deathYear,
      eraId: p.eraId,
      traditionId: p.traditionId,
      domains: p.domains,
      primaryDomain: p.primaryDomain,
      importanceScore: p.importanceScore,
      imageUrl: p.imageUrl,
    })),
    ...concepts.map((c) => ({
      id: c.id,
      name: c.title,
      type: 'concept',
      eraId: c.eraId,
      branch: c.branch,
      introducedBy: c.introducedBy,
      importanceScore: c.importanceScore,
    })),
  ];

  const lightweightEdges = edges.map((e) => ({
    id: e.id || `${e.source}--${e.target}`,
    source: e.source,
    target: e.target,
    type: e.type,
    label: e.label,
    strength: e.strength,
  }));

  const graphIndex = {
    version: '2.0-chunked',
    generatedAt: new Date().toISOString(),
    nodeCount: lightweightNodes.length,
    edgeCount: lightweightEdges.length,
    nodes: lightweightNodes,
    edges: lightweightEdges,
    eras,
    traditions,
    domains,
  };

  const graphIndexFile = path.join(CHUNKS_DIR, 'graph-index.json');
  writeJsonAtomic(graphIndexFile, graphIndex);
  console.log(`✓ Compiled Stage 2 static chunks (${philosophers.length} thinkers, ${concepts.length} concepts, ${edges.length} edges, graph-index.json) -> public/data/chunks/`);

  const elapsed = Date.now() - startTime;
  console.log(`✨ Philosophia data compilation completed in ${elapsed}ms\n`);
}

// Allow CLI execution: `node scripts/build-data.mjs`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildData();
}
