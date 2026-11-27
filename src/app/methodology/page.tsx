import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Scale,
  Network,
  Swords,
  Map as MapIcon,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { philosophers, concepts, edges } from '../../lib/graph/graph-service';
import { VisualNode, METHODOLOGY_CONFIG } from '../../lib/types';
import { applyScoringMethodology } from '../../lib/graph/scoring-engine';
import {
  computeHybridCanonicalScores,
  computeDirectedPageRank,
  computeDialecticalFrictionScores,
  compareByDeterministicRank,
  CANON_TIER_PRIORS,
  HYBRID_SCORING_CONSTANTS,
} from '../../lib/graph/scoring-algorithms.mjs';

export const metadata: Metadata = {
  title: 'Scoring Methodology & Mathematical Formulas | Philosophia',
  description:
    'Mathematical specification and historiographical rationale behind Hybrid Canonical Consensus, Directed PageRank Topology, Dialectical Controversy, and Cartographic Research Depth in Philosophia.',
};

const BENCHMARK_IDS = [
  'immanuel-kant',
  'simone-de-beauvoir',
  'melanie-klein',
  'hannah-arendt',
  'elisabeth-of-bohemia',
  'socrates',
  'ptahhotep',
  'anthony-giddens',
];

function formatTierName(tier: string): string {
  if (tier === 'pillar') return 'Pillar';
  if (tier === 'bridge') return 'Bridge';
  return 'Contributor';
}

export default function MethodologyPage() {
  const allNodes: VisualNode[] = [
    ...philosophers.map((p) => ({
      id: p.id,
      name: p.name,
      type: 'philosopher' as const,
      eraId: p.eraId,
      traditionId: p.traditionId,
      domains: p.domains,
      canonTier: p.canonTier,
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
      branch: c.branch,
      importanceScore: 50,
      color: '#94a3b8',
      summary: c.summary || (c as any).description || '',
      data: c,
    })),
  ];

  const hybridMap = computeHybridCanonicalScores(allNodes, edges);
  const allNodeIds = allNodes.map((n) => n.id);
  const directedPrMap = computeDirectedPageRank(allNodeIds, edges);
  const frictionMap = computeDialecticalFrictionScores(allNodeIds, edges);

  const hybridScored = applyScoringMethodology(allNodes, edges, 'canonical').filter(
    (n) => n.type === 'philosopher'
  );
  const topologyScored = applyScoringMethodology(allNodes, edges, 'topology').filter(
    (n) => n.type === 'philosopher'
  );
  const frictionScored = applyScoringMethodology(allNodes, edges, 'friction').filter(
    (n) => n.type === 'philosopher'
  );

  const rankThinkers = (list: VisualNode[]) => {
    const sorted = [...list].sort((a, b) =>
      compareByDeterministicRank(
        {
          id: a.id,
          name: a.name,
          score: a.importanceScore,
          rawScore: a.scoreBreakdown?.rawScore,
          degree: a.scoreBreakdown?.degree,
        },
        {
          id: b.id,
          name: b.name,
          score: b.importanceScore,
          rawScore: b.scoreBreakdown?.rawScore,
          degree: b.scoreBreakdown?.degree,
        }
      )
    );
    const map = new Map<string, { score: number; rank: number }>();
    sorted.forEach((n, idx) => map.set(n.id, { score: n.importanceScore, rank: idx + 1 }));
    return map;
  };

  const hybridRanks = rankThinkers(hybridScored);
  const topologyRanks = rankThinkers(topologyScored);
  const frictionRanks = rankThinkers(frictionScored);

  const benchmarkRows = BENCHMARK_IDS.map((id) => {
    const p = philosophers.find((item) => item.id === id);
    if (!p) return null;
    const h = hybridMap.get(id);
    const f = frictionMap.get(id);
    const pr = directedPrMap.get(id) || 0;
    return {
      id,
      name: p.name,
      tier: h ? formatTierName(h.canonTier) : 'Contributor',
      degree: h?.degree ?? 0,
      cBi: h ? Math.round(h.bidirectionalCentrality * 100) : 0,
      rCross: h ? Math.round(h.crossBoundaryReach * 100) : 0,
      apparatus: h ? Math.round(h.scholarlyApparatus * 100) : 0,
      hybridScore: hybridRanks.get(id)?.score ?? p.importanceScore,
      hybridRank: hybridRanks.get(id)?.rank ?? 0,
      topoScore: topologyRanks.get(id)?.score ?? 50,
      topoRank: topologyRanks.get(id)?.rank ?? 0,
      directedPrPct: (pr * 100).toFixed(2) + '%',
      frictionScore: frictionRanks.get(id)?.score ?? f?.score ?? 50,
      frictionRank: frictionRanks.get(id)?.rank ?? 0,
    };
  }).filter((row): row is NonNullable<typeof row> => row !== null);

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-[var(--bg-main)] text-[var(--text-main)] font-serif">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border-main)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-sans text-[var(--text-dim)] hover:text-[var(--gold-accent)] transition shrink-0"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Return to Constellation Graph</span>
            <span className="sm:hidden font-medium">Constellation</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/thinkers"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-sans text-[var(--text-muted)] hover:text-[var(--gold-accent)] hover:bg-[var(--bg-hover)] border border-[var(--border-main)] transition"
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Thinkers Roster</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--gold-accent)] text-stone-900 rounded-lg text-xs font-bold font-sans hover:brightness-110 transition shadow-xs"
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>Explore Graph</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Folio Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-dim)]">
          <Link href="/" className="hover:underline">
            Constellation
          </Link>
          <span>/</span>
          <Link href="/thinkers" className="hover:underline hover:text-[var(--gold-accent)] transition">
            Thinkers
          </Link>
          <span>/</span>
          <span className="text-[var(--gold-accent)] font-semibold truncate">
            Scoring Methodology &amp; Formulas
          </span>
        </div>

        {/* Hero Section */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-main)] text-xs text-[var(--gold-accent)] font-mono">
            <Scale className="w-3.5 h-3.5" />
            <span>Historiographical &amp; Quantitative Apparatus</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-main)]">
            How Importance &amp; Centrality Are Calculated
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-3xl leading-relaxed italic">
            No single number captures intellectual history. Philosophia evaluates every thinker
            through three transparent mathematical lenses computed identically at build time and in
            browser runtime across {philosophers.length} thinkers, {concepts.length} concepts, and{' '}
            {edges.length} cited dialectical edges.
          </p>
        </section>

        {/* Historiographical Rationale */}
        <section className="p-6 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-md space-y-4">
          <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[var(--gold-accent)] shrink-0" />
            <span>Why a Hybrid Model? Three Distortions We Explicitly Correct</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed text-[var(--text-muted)]">
            <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] space-y-1.5">
              <div className="font-bold text-[var(--text-main)]">1. Manual Integer Drift</div>
              <p>
                Assigning raw 0–100 numbers by hand causes calibration drift across additions
                (e.g. newly onboarded thinkers in underrepresented traditions scored lower than
                early domain seeds) and forces arbitrary ties resolved only by birth year.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] space-y-1.5">
              <div className="font-bold text-[var(--text-main)]">2. Directed Root-Sink Bias</div>
              <p>
                Because historical influence flows forward in time, pure directed PageRank flows
                backward onto earliest ancestors with zero predecessors (pushing ancient figures
                like Ptahhotep to #1 while burying 20th-century thinkers).
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] space-y-1.5">
              <div className="font-bold text-[var(--text-main)]">3. Small-Degree Ratio Spikes</div>
              <p>
                Unsmoothed controversy ratios divide critiques by total connections, allowing a
                thinker with only 2 edges (1 critique, 1 synthesis) to outscore Aristotle or
                Descartes. Laplace smoothing eliminates sparse-edge saturation.
              </p>
            </div>
          </div>
        </section>

        {/* Section I: Hybrid Canonical-Topological Consensus */}
        <section className="space-y-5">
          <div className="pb-2 border-b border-[var(--border-main)] flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <Compass className="w-5 h-5 text-[var(--gold-accent)]" />
              <span>&sect; I. {METHODOLOGY_CONFIG.canonical.name} (Default)</span>
            </h2>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[var(--gold-bg)] text-[var(--gold-accent)] border border-[var(--gold-border)]">
              Weights: 48% Tier &middot; 32% Centrality &middot; 12% Reach &middot; 8% Apparatus
            </span>
          </div>

          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            The default ranking blends a coarse 3-tier editorial prior with live bidirectional
            network metrics computed across the full graph. This protects sparse-edge ancients
            (such as Socrates or Augustine) while letting well-connected thinkers automatically
            rise as new dialectical lineages are documented.
          </p>

          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--gold-border)] shadow-sm space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--gold-accent)]">
              Composite Master Equation
            </div>
            <pre className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] font-mono text-xs sm:text-sm text-[var(--text-main)] overflow-x-auto leading-relaxed">
{`S_raw(i)    = ${HYBRID_SCORING_CONSTANTS.floor} + ${HYBRID_SCORING_CONSTANTS.span} × ( 0.48 · T(i) + 0.32 · C_bi(i) + 0.12 · R_cross(i) + 0.08 · A(i) )
S_hybrid(i) = clamp( round( S_raw(i) ), 20, 100 )`}
            </pre>
            <p className="text-xs text-[var(--text-dim)] font-mono">
              Deterministic tie-breaker: S_hybrid(i) desc &rarr; S_raw(i) desc &rarr; totalDegree(i) desc &rarr; name asc
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[var(--text-main)]">1. Coarse Canon Tier Prior T(i)</h3>
                <span className="text-xs font-mono text-[var(--gold-accent)]">48%</span>
              </div>
              <pre className="p-3 rounded-xl bg-[var(--bg-subtle)] font-mono text-xs text-[var(--text-main)] overflow-x-auto">
{`T(i) = { ${CANON_TIER_PRIORS.pillar.toFixed(2)}  if tier = "pillar"      (epochal canon)
       { ${CANON_TIER_PRIORS.bridge.toFixed(2)}  if tier = "bridge"      (tradition / bridge)
       { ${CANON_TIER_PRIORS.contributor.toFixed(2)}  if tier = "contributor" (catalyst / specialist)`}
              </pre>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Curators assign one of three coarse qualitative tiers rather than hand-tuning
                arbitrary 0–100 integers, eliminating cross-PR score drift.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[var(--text-main)]">2. Bidirectional Centrality C_bi(i)</h3>
                <span className="text-xs font-mono text-[var(--gold-accent)]">32%</span>
              </div>
              <pre className="p-3 rounded-xl bg-[var(--bg-subtle)] font-mono text-xs text-[var(--text-main)] overflow-x-auto">
{`D_log(i) = ln(1 + deg(i)) / ln(1 + max_j deg(j))
PR_norm(i) = (PR_bi(i) - min PR_bi) / (max PR_bi - min PR_bi)
C_bi(i)  = 0.50 · D_log(i) + 0.50 · PR_norm(i)`}
              </pre>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Computes PageRank on the undirected (symmetrized) graph and blends it with
                logarithmically damped degree so both predecessors and successors count equally.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[var(--text-main)]">3. Cross-Boundary Reach R_cross(i)</h3>
                <span className="text-xs font-mono text-[var(--gold-accent)]">12%</span>
              </div>
              <pre className="p-3 rounded-xl bg-[var(--bg-subtle)] font-mono text-xs text-[var(--text-main)] overflow-x-auto">
{`R_cross(i) = 0.45 · min(5, |Eras_nbr(i)|) / 5
           + 0.40 · min(5, |Traditions_nbr(i)|) / 5
           + 0.15 · I(|Domains(i)| >= 2)`}
              </pre>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Rewards thinkers who bridge across historical epochs, philosophical traditions, and
                disciplines (Philosophy, Psychology, Sociology).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[var(--text-main)]">4. Scholarly Apparatus A(i)</h3>
                <span className="text-xs font-mono text-[var(--gold-accent)]">8%</span>
              </div>
              <pre className="p-3 rounded-xl bg-[var(--bg-subtle)] font-mono text-xs text-[var(--text-main)] overflow-x-auto">
{`A(i) = 0.70 · min(3, |keyWorks(i)|) / 3
     + 0.30 · I(sepSlug(i) present)`}
              </pre>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Captures documented primary-text and Stanford Encyclopedia coverage, capped at 3
                works so sample list length never dominates graph structure.
              </p>
            </div>
          </div>
        </section>

        {/* Section II: Network Topology */}
        <section className="space-y-4">
          <div className="pb-2 border-b border-[var(--border-main)] flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <Network className="w-5 h-5 text-[var(--gold-accent)]" />
              <span>&sect; II. {METHODOLOGY_CONFIG.topology.name} (Directed PageRank)</span>
            </h2>
            <span className="text-[11px] font-mono text-[var(--text-dim)]">d = 0.85 &middot; 25 iterations</span>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-3">
            <pre className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] font-mono text-xs sm:text-sm text-[var(--text-main)] overflow-x-auto leading-relaxed">
{`For each directed influence edge (u -> v), citation flows backward (v cites u):

PR(u) = (1 - d) / N  +  (d · S_sink) / N  +  d · Σ_{v ∈ B_u} ( PR(v) / L_out(v) )

Score_topology(u) = clamp( round( 25 + 74 · (PR(u) - PR_min) / (PR_max - PR_min) ), 20, 99 )`}
            </pre>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Here <code>N</code> is the active node count, <code>S_sink</code> is the sum of
              probability mass held by nodes with zero outgoing citations (roots), <code>B_u</code>{' '}
              is the set of successors influenced by <code>u</code>, and <code>L_out(v)</code> is
              the number of predecessors cited by <code>v</code>. Use this lens to inspect pure
              upstream lineage provenance—while keeping in mind its structural preference for
              earliest chronological origins.
            </p>
          </div>
        </section>

        {/* Section III: Dialectical Controversy */}
        <section className="space-y-4">
          <div className="pb-2 border-b border-[var(--border-main)] flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <Swords className="w-5 h-5 text-[var(--gold-accent)]" />
              <span>&sect; III. {METHODOLOGY_CONFIG.friction.name} (Smoothed Friction)</span>
            </h2>
            <span className="text-[11px] font-mono text-[var(--text-dim)]">Laplace prior k = {HYBRID_SCORING_CONSTANTS.frictionSmoothingPrior}</span>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-3">
            <pre className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] font-mono text-xs sm:text-sm text-[var(--text-main)] overflow-x-auto leading-relaxed">
{`W(i) = 2 · critiques(i) + syntheses(i)
F(i) = clamp( round( 55 · ( W(i) / (totalEdges(i) + ${HYBRID_SCORING_CONSTANTS.frictionSmoothingPrior}) ) + min(45, 4 · W(i)) ), 10, 100 )`}
            </pre>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Measures paradigm friction rather than quiet consensus. Critique edges carry double
              weight (<code>2x</code>) and syntheses single weight (<code>1x</code>). Adding{' '}
              <code>k = {HYBRID_SCORING_CONSTANTS.frictionSmoothingPrior}</code> to the denominator
              acts as a Bayesian shrinkage prior so sparse 2-edge nodes cannot saturate to 100
              without sustained dialectical volume.
            </p>
          </div>
        </section>

        {/* Section IV: Cartographic Research Depth */}
        <section className="space-y-4">
          <div className="pb-2 border-b border-[var(--border-main)] flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-[var(--gold-accent)]" />
              <span>&sect; IV. Cartographic Research Depth (Terra Incognita)</span>
            </h2>
            <span className="text-[11px] font-mono text-[var(--text-dim)]">4 Relief Terrains</span>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-3">
            <pre className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] font-mono text-xs sm:text-sm text-[var(--text-main)] overflow-x-auto leading-relaxed">
{`Tradition / Branch Depth = clamp( round( baseScore + round((S_hybrid - 70) · 0.15) + min(10, 1.5 · deg) ), 10, 100 )
Default Heuristic Depth  = clamp( round( 0.75 · S_hybrid + min(15, 2 · deg) + min(10, 3 · critiques) ), 10, 100 )`}
            </pre>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                <div className="font-bold">82 – 100</div>
                <div>Canonical Citadel</div>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300">
                <div className="font-bold">60 – 81</div>
                <div>Disputed Frontier</div>
              </div>
              <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300">
                <div className="font-bold">40 – 59</div>
                <div>Pioneer Outpost</div>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
                <div className="font-bold">&lt; 40</div>
                <div>Terra Incognita</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section V: Live Worked Examples from the Current Graph */}
        <section className="space-y-4">
          <div className="pb-2 border-b border-[var(--border-main)] flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[var(--gold-accent)]" />
              <span>&sect; V. Live Worked Examples from the Constellation</span>
            </h2>
            <span className="text-[11px] font-mono text-[var(--text-dim)]">
              Computed across {philosophers.length} thinkers &amp; {edges.length} edges
            </span>
          </div>

          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Compare how benchmark thinkers behave across all three lenses. Notice how Hybrid
            Consensus elevates deeply connected philosophers like Simone de Beauvoir, Melanie
            Klein, and Hannah Arendt while avoiding Ptahhotep&apos;s PageRank root spike and
            Anthony Giddens&apos;s former unsmoothed 2-edge friction spike.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-card)] shadow-md">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-main)] bg-[var(--bg-subtle)] font-mono text-[11px] text-[var(--text-dim)] uppercase">
                  <th className="py-3 px-4">Thinker</th>
                  <th className="py-3 px-3">Tier</th>
                  <th className="py-3 px-3 text-right">Deg</th>
                  <th className="py-3 px-3 text-right">C_bi</th>
                  <th className="py-3 px-3 text-right">R_cross</th>
                  <th className="py-3 px-3 text-right">App.</th>
                  <th className="py-3 px-3 text-right text-[var(--gold-accent)]">Hybrid</th>
                  <th className="py-3 px-3 text-right">PageRank</th>
                  <th className="py-3 px-4 text-right">Controversy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-main)]/60">
                {benchmarkRows.map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--bg-hover)]/50 transition">
                    <td className="py-3 px-4 font-semibold text-[var(--text-main)]">
                      <Link href={`/thinker/${row.id}`} className="hover:text-[var(--gold-accent)] hover:underline">
                        {row.name}
                      </Link>
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--text-muted)]">{row.tier}</td>
                    <td className="py-3 px-3 font-mono text-right">{row.degree}</td>
                    <td className="py-3 px-3 font-mono text-right">{row.cBi}%</td>
                    <td className="py-3 px-3 font-mono text-right">{row.rCross}%</td>
                    <td className="py-3 px-3 font-mono text-right">{row.apparatus}%</td>
                    <td className="py-3 px-3 font-mono text-right font-bold text-[var(--gold-accent)]">
                      {row.hybridScore} <span className="text-[10px] text-[var(--text-dim)] font-normal">(#{row.hybridRank})</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-right text-[var(--text-muted)]">
                      {row.topoScore} <span className="text-[10px] text-[var(--text-dim)]">(#{row.topoRank}, {row.directedPrPct})</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-right text-[var(--text-muted)]">
                      {row.frictionScore} <span className="text-[10px] text-[var(--text-dim)]">(#{row.frictionRank})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              href="/thinkers"
              className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-[var(--gold-accent)] hover:underline"
            >
              <span>Inspect live rankings in Thinkers Roster</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-[var(--text-muted)] hover:text-[var(--gold-accent)]"
            >
              <span>Switch scoring lens on interactive graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
