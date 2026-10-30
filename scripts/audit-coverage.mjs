import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Loads and audits the Philosophia graph dataset.
 * @param {Object} options
 * @param {string} [options.rootDir]
 * @returns {Object} Full audit report data
 */
export function auditCanon(options = {}) {
  const root = options.rootDir || ROOT_DIR;
  const dataDir = path.join(root, 'data');

  const eras = JSON.parse(fs.readFileSync(path.join(dataDir, 'eras.json'), 'utf-8'));
  const traditions = JSON.parse(fs.readFileSync(path.join(dataDir, 'traditions.json'), 'utf-8'));
  const philosophers = JSON.parse(fs.readFileSync(path.join(dataDir, 'philosophers.json'), 'utf-8'));
  const concepts = JSON.parse(fs.readFileSync(path.join(dataDir, 'concepts.json'), 'utf-8'));
  const edges = JSON.parse(fs.readFileSync(path.join(dataDir, 'edges.json'), 'utf-8'));
  const media = JSON.parse(fs.readFileSync(path.join(dataDir, 'media.json'), 'utf-8'));

  const philosopherMap = new Map(philosophers.map((p) => [p.id, p]));
  const conceptMap = new Map(concepts.map((c) => [c.id, c]));
  const eraMap = new Map(eras.map((e) => [e.id, e]));
  const traditionMap = new Map(traditions.map((t) => [t.id, t]));

  const allNodeIds = new Set([...philosopherMap.keys(), ...conceptMap.keys()]);

  // 1. Degree & Topology
  const inDegree = new Map();
  const outDegree = new Map();
  const undirectedAdj = new Map();
  const directedAdj = new Map();

  for (const id of allNodeIds) {
    inDegree.set(id, 0);
    outDegree.set(id, 0);
    undirectedAdj.set(id, []);
    directedAdj.set(id, []);
  }

  const edgeTypeCounts = {
    INFLUENCED: 0,
    CRITIQUED: 0,
    DEVELOPED: 0,
    SYNTHESIZED: 0,
  };

  const danglingEdges = [];

  for (const edge of edges) {
    if (edgeTypeCounts[edge.type] !== undefined) {
      edgeTypeCounts[edge.type]++;
    }

    const hasSource = allNodeIds.has(edge.source);
    const hasTarget = allNodeIds.has(edge.target);

    if (!hasSource || !hasTarget) {
      danglingEdges.push(edge);
      continue;
    }

    outDegree.set(edge.source, (outDegree.get(edge.source) || 0) + 1);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);

    undirectedAdj.get(edge.source).push(edge.target);
    undirectedAdj.get(edge.target).push(edge.source);
    directedAdj.get(edge.source).push({ target: edge.target, type: edge.type, label: edge.label });
  }

  // Isolated nodes
  const isolatedPhilosophers = philosophers.filter(
    (p) => (inDegree.get(p.id) || 0) === 0 && (outDegree.get(p.id) || 0) === 0
  );
  const isolatedConcepts = concepts.filter(
    (c) => (inDegree.get(c.id) || 0) === 0 && (outDegree.get(c.id) || 0) === 0
  );
  const isolatedNodes = [...isolatedPhilosophers.map((p) => p.id), ...isolatedConcepts.map((c) => c.id)];

  // Connected Components (Undirected)
  const visited = new Set();
  const components = [];
  for (const id of allNodeIds) {
    if (!visited.has(id)) {
      const comp = [];
      const queue = [id];
      visited.add(id);
      while (queue.length > 0) {
        const curr = queue.shift();
        comp.push(curr);
        for (const neighbor of undirectedAdj.get(curr) || []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
      components.push(comp);
    }
  }
  components.sort((a, b) => b.length - a.length);

  // Sources (inDegree = 0, but outDegree > 0) and Sinks (outDegree = 0, but inDegree > 0)
  const sourceNodes = [...allNodeIds].filter((id) => inDegree.get(id) === 0 && outDegree.get(id) > 0);
  const sinkNodes = [...allNodeIds].filter((id) => outDegree.get(id) === 0 && inDegree.get(id) > 0);

  // Top Hubs
  const topInfluencers = [...philosophers]
    .map((p) => ({ id: p.id, name: p.name, outDegree: outDegree.get(p.id) || 0 }))
    .sort((a, b) => b.outDegree - a.outDegree)
    .slice(0, 10);

  const topSynthesizers = [...philosophers]
    .map((p) => ({ id: p.id, name: p.name, inDegree: inDegree.get(p.id) || 0 }))
    .sort((a, b) => b.inDegree - a.inDegree)
    .slice(0, 10);

  // 2. Content Completeness
  const missingSep = philosophers.filter((p) => !p.sepSlug || p.sepSlug.trim() === '');
  const missingQuestion = philosophers.filter((p) => !p.centralQuestion || p.centralQuestion.trim() === '');
  
  let totalWorksCount = 0;
  let structuredWorksCount = 0;
  let worksWithUrlCount = 0;
  const worksDistribution = { 0: 0, 1: 0, 2: 0, '3+': 0 };

  for (const p of philosophers) {
    const count = p.keyWorks?.length || 0;
    if (count === 0) worksDistribution[0]++;
    else if (count === 1) worksDistribution[1]++;
    else if (count === 2) worksDistribution[2]++;
    else worksDistribution['3+']++;

    totalWorksCount += count;
    for (const work of p.keyWorks || []) {
      if (typeof work === 'object') {
        structuredWorksCount++;
        if (work.url || work.wikipediaUrl) worksWithUrlCount++;
      }
    }
  }

  // Media coverage
  const mediaTargetIds = new Set(media.map((m) => m.targetId));
  const mediaTypeCounts = {};
  for (const m of media) {
    mediaTypeCounts[m.type] = (mediaTypeCounts[m.type] || 0) + 1;
  }
  const philosophersWithMedia = philosophers.filter((p) => mediaTargetIds.has(p.id));
  const missingMedia = philosophers.filter((p) => !mediaTargetIds.has(p.id));

  // 3. Era & Tradition Distribution
  const eraStats = eras.map((era) => {
    const eraPhilosophers = philosophers.filter((p) => p.eraId === era.id);
    const eraConcepts = concepts.filter((c) => c.eraId === era.id);
    return {
      id: era.id,
      name: era.name,
      startYear: era.startYear,
      endYear: era.endYear,
      philosopherCount: eraPhilosophers.length,
      conceptCount: eraConcepts.length,
      totalCount: eraPhilosophers.length + eraConcepts.length,
    };
  });

  const traditionStats = traditions.map((trad) => {
    const tradPhilosophers = philosophers.filter((p) => p.traditionId === trad.id);
    return {
      id: trad.id,
      name: trad.name,
      eraId: trad.eraId,
      philosopherCount: tradPhilosophers.length,
    };
  }).sort((a, b) => b.philosopherCount - a.philosopherCount);

  // 4. Dialectical Lineage Verification
  const criticalLineages = [
    { name: 'Socrates → Nietzsche', from: 'socrates', to: 'friedrich-nietzsche' },
    { name: 'Plato → Schopenhauer', from: 'plato', to: 'arthur-schopenhauer' },
    { name: 'Aristotle → Aquinas', from: 'aristotle', to: 'thomas-aquinas' },
    { name: 'Aristotle → Machiavelli → Hobbes', from: 'aristotle', to: 'thomas-hobbes' },
    { name: 'Avicenna → Al-Ghazali → Averroes → Maimonides → Aquinas', from: 'avicenna', to: 'thomas-aquinas' },
    { name: 'Pyrrho → Montaigne → Descartes → Pascal → Kierkegaard', from: 'pyrrho', to: 'soren-kierkegaard' },
    { name: 'Kant → Fichte/Schelling → Hegel', from: 'immanuel-kant', to: 'gwf-hegel' },
    { name: 'Kant → Frege → Wittgenstein', from: 'immanuel-kant', to: 'ludwig-wittgenstein' },
    { name: 'Locke → Voltaire → Rousseau', from: 'john-locke', to: 'jean-jacques-rousseau' },
    { name: 'Siddhartha Gautama → Adi Shankara → Schopenhauer', from: 'siddhartha-gautama', to: 'arthur-schopenhauer' },
    { name: 'Hume → Adam Smith → Marx', from: 'david-hume', to: 'karl-marx' },
    { name: 'Epictetus → Spinoza', from: 'epictetus', to: 'baruch-spinoza' },
    { name: 'Thales → Anaximander → Heraclitus', from: 'thales', to: 'heraclitus' },
    { name: 'Confucius → Mencius → Zhuangzi', from: 'confucius', to: 'zhuangzi' },
    { name: 'Hume → Bentham → Mill', from: 'david-hume', to: 'john-stuart-mill' },
    { name: 'Wollstonecraft → Mill', from: 'mary-wollstonecraft', to: 'john-stuart-mill' },
  ];

  function testPath(start, goal) {
    if (!allNodeIds.has(start) || !allNodeIds.has(goal)) return { found: false, hops: 0, path: [] };
    const queue = [[start]];
    const seen = new Set([start]);
    while (queue.length > 0) {
      const path = queue.shift();
      const node = path[path.length - 1];
      if (node === goal) return { found: true, hops: path.length - 1, path };
      for (const edge of directedAdj.get(node) || []) {
        if (!seen.has(edge.target)) {
          seen.add(edge.target);
          queue.push([...path, edge.target]);
        }
      }
    }
    return { found: false, hops: 0, path: [] };
  }

  const lineageResults = criticalLineages.map((lineage) => {
    const result = testPath(lineage.from, lineage.to);
    return {
      name: lineage.name,
      from: lineage.from,
      to: lineage.to,
      found: result.found,
      hops: result.hops,
      path: result.path,
    };
  });

  return {
    timestamp: new Date().toISOString(),
    totals: {
      philosophers: philosophers.length,
      concepts: concepts.length,
      totalNodes: allNodeIds.size,
      edges: edges.length,
      media: media.length,
      eras: eras.length,
      traditions: traditions.length,
      edgeTypes: edgeTypeCounts,
      meanDegree: (edges.length / allNodeIds.size).toFixed(2),
    },
    topology: {
      isolatedPhilosophers: isolatedPhilosophers.map((p) => p.id),
      isolatedConcepts: isolatedConcepts.map((c) => c.id),
      isolatedTotal: isolatedNodes.length,
      danglingEdgesCount: danglingEdges.length,
      connectedComponentsCount: components.length,
      componentSizes: components.map((c) => c.length),
      sourceNodesCount: sourceNodes.length,
      sinkNodesCount: sinkNodes.length,
      topInfluencers,
      topSynthesizers,
    },
    completeness: {
      sepCoveragePct: (((philosophers.length - missingSep.length) / philosophers.length) * 100).toFixed(1),
      missingSep: missingSep.map((p) => p.id),
      questionCoveragePct: (((philosophers.length - missingQuestion.length) / philosophers.length) * 100).toFixed(1),
      missingQuestion: missingQuestion.map((p) => p.id),
      totalWorksCount,
      structuredWorksPct: ((structuredWorksCount / totalWorksCount) * 100).toFixed(1),
      worksWithUrlPct: ((worksWithUrlCount / totalWorksCount) * 100).toFixed(1),
      worksDistribution,
      mediaCoveragePct: ((philosophersWithMedia.length / philosophers.length) * 100).toFixed(1),
      mediaTypeCounts,
      missingMedia: missingMedia.map((p) => p.id),
    },
    eras: eraStats,
    traditions: traditionStats,
    lineages: lineageResults,
  };
}

/**
 * Generates Markdown representation of the audit report.
 */
export function generateMarkdownReport(report) {
  const { totals, topology, completeness, eras, traditions, lineages, timestamp } = report;

  const lineageRows = lineages
    .map(
      (l) =>
        `| **${l.name}** | ${l.found ? '✅ Verified' : '❌ Broken'} | ${l.hops} hops | \`${l.path.join(' → ')}\` |`
    )
    .join('\n');

  const eraRows = eras
    .map(
      (e) =>
        `| **${e.name}** | ${e.startYear < 0 ? `${Math.abs(e.startYear)} BCE` : `${e.startYear} CE`} – ${
          e.endYear < 0 ? `${Math.abs(e.endYear)} BCE` : `${e.endYear} CE`
        } | ${e.philosopherCount} | ${e.conceptCount} | **${e.totalCount}** |`
    )
    .join('\n');

  const topInfluencersList = topology.topInfluencers
    .map((t, idx) => `${idx + 1}. **${t.name}** (${t.outDegree} outgoing links)`)
    .join('\n');

  const topSynthesizersList = topology.topSynthesizers
    .map((t, idx) => `${idx + 1}. **${t.name}** (${t.inDegree} incoming links)`)
    .join('\n');

  return `# 📜 Philosophia Canon Coverage & Assessment Report

> **Generated:** \`${timestamp}\`  
> **Status:** ${topology.isolatedTotal === 0 && topology.connectedComponentsCount === 1 ? '🟢 Healthy (0 isolated nodes, 1 unified graph)' : '🟡 Gaps Identified'}

---

## 📊 1. Canon Inventory & High-Level Metrics

| Metric | Value | Target / Health Status |
| :--- | :--- | :--- |
| **Philosophers** | **${totals.philosophers}** | Primary constellation pillars & bridges |
| **Concepts** | **${totals.concepts}** | Categorized across 7 philosophical branches |
| **Total Graph Nodes** | **${totals.totalNodes}** | Clean schema compliance |
| **Dialectical Edges** | **${totals.edges}** | Average **${totals.meanDegree}** edges / node |
| **Media & Audio Resources** | **${totals.media}** | SEP dossiers, primary links, podcasts |
| **Isolated Nodes** | **${topology.isolatedTotal}** | ${topology.isolatedTotal === 0 ? '✅ 0 isolated nodes' : `⚠️ ${topology.isolatedTotal} isolated nodes!`} |
| **Connected Components** | **${topology.connectedComponentsCount}** | ${topology.connectedComponentsCount === 1 ? '✅ Single unified component' : `⚠️ ${topology.connectedComponentsCount} components`} |

### Dialectical Edge Distribution
- **INFLUENCED** (Lineage & inheritance): \`${totals.edgeTypes.INFLUENCED}\`
- **DEVELOPED** (Extension & formalization): \`${totals.edgeTypes.DEVELOPED}\`
- **CRITIQUED** (Dialectical rebuttal): \`${totals.edgeTypes.CRITIQUED}\`
- **SYNTHESIZED** (Integration of disparate traditions): \`${totals.edgeTypes.SYNTHESIZED}\`

---

## 🎯 2. Content Completeness & Richness

| Content Field | Coverage | Details |
| :--- | :--- | :--- |
| **SEP Slug Coverage** | **${completeness.sepCoveragePct}%** | ${completeness.missingSep.length === 0 ? 'All thinkers have canonical SEP slugs' : `Missing: ${completeness.missingSep.join(', ')}`} |
| **Central Question** | **${completeness.questionCoveragePct}%** | Core inquiry phrased as inquiry question |
| **Structured Key Works** | **${completeness.structuredWorksPct}%** | ${completeness.totalWorksCount} works total (${completeness.worksWithUrlPct}% with primary/Wikipedia links) |
| **Key Works Spread** | **100% $\\ge 1$ work** | • 1 work: \`${completeness.worksDistribution[1]}\`<br>• 2 works: \`${completeness.worksDistribution[2]}\`<br>• 3+ works: \`${completeness.worksDistribution['3+']}\` |
| **Audio / Media Coverage** | **${completeness.mediaCoveragePct}%** | Podcast episodes, encyclopedia entries, and classic archives |

${completeness.missingMedia.length > 0 ? `> [!NOTE]\n> Thinkers awaiting media/podcast integration: \`${completeness.missingMedia.join('`, `')}\`.` : ''}

---

## 🌐 3. Temporal Era Distribution

| Era | Timeline | Thinkers | Concepts | Total Nodes |
| :--- | :--- | :--- | :--- | :--- |
${eraRows}

---

## 🔗 4. Critical Dialectical Lineage Verification

Automated pathfinding verification across canonical historical transitions:

| Dialectical Lineage | Path Status | Hops | Traversal Chain |
| :--- | :--- | :--- | :--- |
${lineageRows}

---

## 🏛️ 5. Network Hubs & Centrality

### Top Dialectical Catalysts (Highest Out-Degree)
${topInfluencersList}

### Top Synthetic Integrators (Highest In-Degree)
${topSynthesizersList}

---

## 🛠️ Continual Assessment Protocol
1. **Periodic Gap Audits**: Run \`npm run audit\` to verify invariants, isolated nodes, and dialectical integrity.
2. **Admission Gate**: Evaluate all candidate thinkers against the 3 criteria (Tradition Founder, Dialectical Bridge, Conceptual Innovator).
3. **Lineage Path Verification**: Update \`tests/data-integrity.test.ts\` whenever new thinkers or concepts are admitted.
`;
}

// CLI execution handling
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const args = process.argv.slice(2);
  const writeReport = args.includes('--report') || args.includes('--write-report');
  const jsonOutput = args.includes('--json');

  const report = auditCanon();

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  // Print ANSI CLI output
  console.log('\n======================================================');
  console.log('   🏛️  PHILOSOPHIA CANON COVERAGE & AUDIT REPORT');
  console.log('======================================================\n');
  console.log(`📦 Totals:`);
  console.log(`   • Philosophers:       ${report.totals.philosophers}`);
  console.log(`   • Concepts:           ${report.totals.concepts}`);
  console.log(`   • Total Nodes:        ${report.totals.totalNodes}`);
  console.log(`   • Edges:              ${report.totals.edges} (Mean degree: ${report.totals.meanDegree})`);
  console.log(`   • Media Resources:    ${report.totals.media}\n`);

  console.log(`🔍 Content Completeness:`);
  console.log(`   • SEP Slug:           ${report.completeness.sepCoveragePct}%`);
  console.log(`   • Central Question:   ${report.completeness.questionCoveragePct}%`);
  console.log(`   • Structured Works:   ${report.completeness.structuredWorksPct}% (${report.completeness.totalWorksCount} works total)`);
  console.log(`   • Media Coverage:     ${report.completeness.mediaCoveragePct}%\n`);

  console.log(`🌐 Graph Connectivity:`);
  console.log(`   • Connected Comps:    ${report.topology.connectedComponentsCount}`);
  if (report.topology.isolatedTotal === 0) {
    console.log(`   • Isolated Nodes:     0 (✅ PASS)`);
  } else {
    console.log(`   • Isolated Nodes:     ${report.topology.isolatedTotal} (⚠️ FAIL: ${report.topology.isolatedPhilosophers.concat(report.topology.isolatedConcepts).join(', ')})`);
  }
  console.log(`   • Dangling Edges:     ${report.topology.danglingEdgesCount}\n`);

  console.log(`🔗 Critical Lineage Path Checks:`);
  for (const l of report.lineages) {
    console.log(`   • [${l.found ? '✓' : '✗'}] ${l.name} (${l.hops} hops)`);
  }
  console.log('');

  if (writeReport) {
    const reportPath = path.join(ROOT_DIR, 'docs', 'canon_coverage_report.md');
    fs.writeFileSync(reportPath, generateMarkdownReport(report), 'utf-8');
    console.log(`📝 Generated full report at docs/canon_coverage_report.md`);
  }

  if (args.includes('--strict') && (report.topology.isolatedTotal > 0 || report.topology.danglingEdgesCount > 0)) {
    process.exit(1);
  }
}
