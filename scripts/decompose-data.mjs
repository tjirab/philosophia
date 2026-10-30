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
const MEDIA_CURATED_DIR = path.join(MEDIA_DIR, 'curated');
const MEDIA_PODCASTS_DIR = path.join(MEDIA_DIR, 'podcasts');

export function decomposeData() {
  console.log('Decomposing static data files into modular entities...\n');

  // Ensure directories exist
  fs.mkdirSync(PHILOSOPHERS_DIR, { recursive: true });
  fs.mkdirSync(CONCEPTS_DIR, { recursive: true });
  fs.mkdirSync(EDGES_DIR, { recursive: true });
  fs.mkdirSync(MEDIA_CURATED_DIR, { recursive: true });
  fs.mkdirSync(MEDIA_PODCASTS_DIR, { recursive: true });

  // 1. Decompose Philosophers
  const philsFile = path.join(DATA_DIR, 'philosophers.json');
  if (fs.existsSync(philsFile)) {
    const philosophers = JSON.parse(fs.readFileSync(philsFile, 'utf-8'));
    for (const p of philosophers) {
      const filePath = path.join(PHILOSOPHERS_DIR, `${p.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(p, null, 2) + '\n', 'utf-8');
    }
    console.log(`✓ Decomposed ${philosophers.length} philosophers into data/philosophers/*.json`);
  }

  // 2. Decompose Concepts
  const conceptsFile = path.join(DATA_DIR, 'concepts.json');
  if (fs.existsSync(conceptsFile)) {
    const concepts = JSON.parse(fs.readFileSync(conceptsFile, 'utf-8'));
    for (const c of concepts) {
      const filePath = path.join(CONCEPTS_DIR, `${c.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(c, null, 2) + '\n', 'utf-8');
    }
    console.log(`✓ Decomposed ${concepts.length} concepts into data/concepts/*.json`);
  }

  // 3. Decompose Edges
  // Group edges by their source node
  const edgesFile = path.join(DATA_DIR, 'edges.json');
  if (fs.existsSync(edgesFile)) {
    const edges = JSON.parse(fs.readFileSync(edgesFile, 'utf-8'));
    const edgesBySource = new Map();
    for (const e of edges) {
      if (!edgesBySource.has(e.source)) {
        edgesBySource.set(e.source, []);
      }
      edgesBySource.get(e.source).push(e);
    }

    for (const [source, list] of edgesBySource.entries()) {
      const filePath = path.join(EDGES_DIR, `${source}.json`);
      fs.writeFileSync(filePath, JSON.stringify(list, null, 2) + '\n', 'utf-8');
    }
    console.log(`✓ Decomposed ${edges.length} edges across ${edgesBySource.size} files into data/edges/*.json`);
  }

  // 4. Decompose Media
  // Separate podcasts from curated items (encyclopedia, books, links)
  const mediaFile = path.join(DATA_DIR, 'media.json');
  if (fs.existsSync(mediaFile)) {
    const media = JSON.parse(fs.readFileSync(mediaFile, 'utf-8'));
    const curatedByTarget = new Map();
    const podcastsByTarget = new Map();

    for (const m of media) {
      const map = m.type === 'podcast' ? podcastsByTarget : curatedByTarget;
      if (!map.has(m.targetId)) {
        map.set(m.targetId, []);
      }
      map.get(m.targetId).push(m);
    }

    for (const [targetId, items] of curatedByTarget.entries()) {
      const filePath = path.join(MEDIA_CURATED_DIR, `${targetId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(items, null, 2) + '\n', 'utf-8');
    }

    for (const [targetId, items] of podcastsByTarget.entries()) {
      const filePath = path.join(MEDIA_PODCASTS_DIR, `${targetId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(items, null, 2) + '\n', 'utf-8');
    }

    console.log(
      `✓ Decomposed ${media.length} media items: ${curatedByTarget.size} curated files, ${podcastsByTarget.size} podcast files into data/media/`
    );
  }

  console.log('\n🎉 Decomposition complete!\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  decomposeData();
}
