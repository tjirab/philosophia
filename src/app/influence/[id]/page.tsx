import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ExternalLink,
  GitFork,
  Quote,
  ShieldCheck,
  Scale,
  Compass,
  Layers,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { edges, getEdgeDetails, philosophers, concepts, eras, traditions } from '../../../lib/graph/graph-service';
import { getEdgeTypeConfig, Philosopher, Concept } from '../../../lib/types';
import { getAssetUrl } from '../../../lib/assets';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return edges.map((e) => ({
    id: e.id || `${e.source}--${e.target}`,
  }));
}

function getNodeMonogram(name: string): string {
  const clean = name.replace(/^(von|de|du|of|the)\s+/i, '').trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function formatLifespan(birth?: number, death?: number): string {
  if (birth === undefined) return '';
  const fmt = (y: number) => (y < 0 ? `${Math.abs(y)} BCE` : `${y} CE`);
  if (death === undefined) return `${fmt(birth)} – present`;
  return `${fmt(birth)} – ${fmt(death)}`;
}

export default async function InfluencePage({ params }: PageProps) {
  const { id } = await params;
  const details = getEdgeDetails(id);

  if (!details || !details.edge) {
    notFound();
  }

  const {
    edge,
    sourceNode,
    targetNode,
    sourceEra,
    targetEra,
    sourceTradition,
    targetTradition,
    connectedConcepts,
    relatedEdges,
  } = details;

  const edgeConfig = getEdgeTypeConfig(edge.type);

  const sourceName =
    (sourceNode as Philosopher)?.name || (sourceNode as Concept)?.title || edge.source;
  const targetName =
    (targetNode as Philosopher)?.name || (targetNode as Concept)?.title || edge.target;

  const isSourcePhil = sourceNode && 'birthYear' in sourceNode;
  const isTargetPhil = targetNode && 'birthYear' in targetNode;

  const sourcePhil = isSourcePhil ? (sourceNode as Philosopher) : null;
  const targetPhil = isTargetPhil ? (targetNode as Philosopher) : null;

  const consensusLabel =
    edge.academicConsensus === 'unanimous'
      ? 'Unanimous Academic Consensus'
      : edge.academicConsensus === 'debated'
      ? 'Scholarly Debated / Dialectical Division'
      : edge.academicConsensus === 'revisionist'
      ? 'Revisionist Historiography'
      : 'Broad Scholarly Consensus';

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-serif">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border-main)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-sans text-[var(--text-dim)] hover:text-[var(--gold-accent)] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Constellation Graph</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs font-mono uppercase tracking-widest text-[var(--text-dim)]">
              Folio Dialectica
            </span>
            <Link
              href={`/?focusEdge=${edge.id || `${edge.source}--${edge.target}`}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--gold-accent)] text-stone-900 rounded-lg text-xs font-bold font-sans hover:brightness-110 transition shadow-xs"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Locate in Graph</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Folio */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Folio Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-dim)]">
          <Link href="/" className="hover:underline">
            Constellation
          </Link>
          <span>/</span>
          <span>Lineages</span>
          <span>/</span>
          <span className="text-[var(--gold-accent)] font-semibold truncate">
            {sourceName} ➔ {targetName}
          </span>
        </div>

        {/* Hero Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2.5">
            <span
              className={`text-xs font-mono uppercase px-3 py-1 rounded-full border font-semibold ${edgeConfig.badgeClass}`}
            >
              {edge.type}
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-main)] text-xs text-[var(--text-muted)]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{consensusLabel}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-main)] leading-tight">
            {edge.label}
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed italic">
            A dialectical investigation into the intellectual transmission, transformation, and philosophical departure between {sourceName} and {targetName}.
          </p>
        </div>

        {/* Grand Thinker Dyad Display */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-xl">
          {/* Thinker 1 (Source) */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-3">
            <div
              className="w-20 h-20 rounded-full border-2 border-[var(--border-strong)] overflow-hidden flex items-center justify-center font-serif text-2xl font-bold shadow-md"
              style={{
                backgroundColor: `${sourceTradition?.color || sourceEra?.color || '#3b82f6'}22`,
                borderColor: sourceTradition?.color || sourceEra?.color || '#3b82f6',
                color: sourceTradition?.color || sourceEra?.color || '#3b82f6',
              }}
            >
              {sourcePhil?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getAssetUrl(sourcePhil.imageUrl)}
                  alt={sourceName}
                  className="w-full h-full object-cover"
                />
              ) : (
                getNodeMonogram(sourceName)
              )}
            </div>

            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--text-dim)]">
                Originating Thinker
              </div>
              <h2 className="text-xl font-bold text-[var(--text-main)] mt-0.5">
                {sourceName}
              </h2>
              {isSourcePhil && (
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  {formatLifespan(sourcePhil?.birthYear, sourcePhil?.deathYear)}
                </div>
              )}
              {sourceTradition && (
                <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--border-main)] bg-[var(--bg-subtle)] text-[var(--text-dim)]">
                  {sourceTradition.name}
                </span>
              )}
            </div>

            {sourcePhil?.centralQuestion && (
              <p className="text-xs text-[var(--text-muted)] italic max-w-xs">
                &ldquo;{sourcePhil.centralQuestion}&rdquo;
              </p>
            )}
          </div>

          {/* Central Dialectical Bridge */}
          <div className="flex flex-col items-center justify-center py-4 px-2">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--gold-accent)] shadow-inner">
              <ArrowRight className="w-6 h-6 rotate-90 md:rotate-0" />
            </div>
            <span className="mt-2 text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-wider">
              Dialectical Flow
            </span>
          </div>

          {/* Thinker 2 (Target) */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-3">
            <div
              className="w-20 h-20 rounded-full border-2 border-[var(--border-strong)] overflow-hidden flex items-center justify-center font-serif text-2xl font-bold shadow-md"
              style={{
                backgroundColor: `${targetTradition?.color || targetEra?.color || '#0d9488'}22`,
                borderColor: targetTradition?.color || targetEra?.color || '#0d9488',
                color: targetTradition?.color || targetEra?.color || '#0d9488',
              }}
            >
              {targetPhil?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getAssetUrl(targetPhil.imageUrl)}
                  alt={targetName}
                  className="w-full h-full object-cover"
                />
              ) : (
                getNodeMonogram(targetName)
              )}
            </div>

            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--text-dim)]">
                Downstream Successor
              </div>
              <h2 className="text-xl font-bold text-[var(--text-main)] mt-0.5">
                {targetName}
              </h2>
              {isTargetPhil && (
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  {formatLifespan(targetPhil?.birthYear, targetPhil?.deathYear)}
                </div>
              )}
              {targetTradition && (
                <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--border-main)] bg-[var(--bg-subtle)] text-[var(--text-dim)]">
                  {targetTradition.name}
                </span>
              )}
            </div>

            {targetPhil?.centralQuestion && (
              <p className="text-xs text-[var(--text-muted)] italic max-w-xs">
                &ldquo;{targetPhil.centralQuestion}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Section I: Dialectical Exposition & Thesis */}
        <section className="space-y-4">
          <div className="pb-2 border-b border-[var(--border-main)]">
            <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
              <span>§ I.</span>
              <span>Dialectical Analysis & Philosophical Argument</span>
            </h3>
          </div>

          <div className="prose dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed text-[var(--text-main)]">
            <p>{edge.description || edge.label}</p>
          </div>

          {edge.dialecticalTension && (
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-strong)] border-l-4 border-l-[var(--gold-accent)] space-y-2">
              <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-2">
                <Scale className="w-4 h-4 text-[var(--gold-accent)]" />
                <span>Dialectical Departure & Crux of Dispute</span>
              </div>
              <p className="text-sm sm:text-base text-[var(--text-muted)] italic leading-relaxed">
                {edge.dialecticalTension}
              </p>
            </div>
          )}
        </section>

        {/* Section II: Historical Circumstances */}
        {edge.historicalContext && (
          <section className="space-y-4">
            <div className="pb-2 border-b border-[var(--border-main)]">
              <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
                <span>§ II.</span>
                <span>Historical Circumstances & Transmission</span>
              </h3>
            </div>
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
              {edge.historicalContext}
            </div>
          </section>
        )}

        {/* Section III: Academic Proof & Primary Citations */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-main)]">
            <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
              <span>§ III.</span>
              <span>Academic Proof, Treatises & Primary Citations</span>
            </h3>
            <span className="text-xs font-mono text-[var(--text-dim)]">
              {edge.citations?.length || 0} Peer-Reviewed & Primary Sources
            </span>
          </div>

          {edge.citations && edge.citations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {edge.citations.map((cite, index) => {
                const isPrimary = cite.citationType === 'primary';
                const isSep = cite.citationType === 'sep';

                return (
                  <div
                    key={index}
                    className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--gold-border)] transition space-y-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-semibold ${
                              isPrimary
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                                : isSep
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                : 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30'
                            }`}
                          >
                            {isPrimary ? 'Primary Source' : isSep ? 'SEP Academic Reference' : 'Secondary Scholarship'}
                          </span>
                          <span className="text-sm font-bold text-[var(--text-main)]">
                            {cite.author}
                          </span>
                        </div>

                        <div className="text-sm font-serif italic text-[var(--text-muted)] mt-1.5">
                          {cite.work}
                          {cite.sectionOrPage && ` — ${cite.sectionOrPage}`}
                          {cite.year && ` (${cite.year})`}
                        </div>
                      </div>

                      {cite.url && (
                        <a
                          href={cite.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-[var(--text-dim)] hover:text-[var(--gold-accent)] bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-main)] hover:bg-[var(--bg-hover)] transition shrink-0 flex items-center gap-1.5 text-xs font-sans font-medium"
                          title="Open canonical source archive"
                        >
                          <span>Treatise Archive</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {cite.quote && (
                      <div className="pt-3 border-t border-[var(--border-main)] flex items-start gap-3 text-sm text-[var(--text-muted)] italic leading-relaxed">
                        <Quote className="w-4 h-4 text-[var(--gold-accent)] shrink-0 mt-1" />
                        <span>&ldquo;{cite.quote}&rdquo;</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-dim)] italic">
              Scholarly citations are cataloged and verified in the canon database.
            </p>
          )}
        </section>

        {/* Section IV: Conceptual Bridges */}
        {connectedConcepts.length > 0 && (
          <section className="space-y-4">
            <div className="pb-2 border-b border-[var(--border-main)]">
              <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
                <span>§ IV.</span>
                <span>Associated Conceptual Innovations</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {connectedConcepts.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--text-main)]">
                      ✦ {c.title}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[var(--border-main)] text-[var(--text-dim)]">
                      {c.branch}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {c.summary}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section V: Lineage Context & Related Trajectories */}
        {relatedEdges.length > 0 && (
          <section className="space-y-4">
            <div className="pb-2 border-b border-[var(--border-main)]">
              <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
                <span>§ V.</span>
                <span>Connected Dialectical Trajectories in the Constellation</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedEdges.slice(0, 6).map((relEdge) => {
                const relEdgeId = relEdge.id || `${relEdge.source}--${relEdge.target}`;
                const relConfig = getEdgeTypeConfig(relEdge.type);
                return (
                  <Link
                    key={relEdgeId}
                    href={`/influence/${relEdgeId}`}
                    className="p-3.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] border border-[var(--border-main)] hover:border-[var(--gold-border)] transition group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--gold-accent)] transition">
                          {relEdge.source} ➔ {relEdge.target}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${relConfig.badgeClass}`}
                        >
                          {relEdge.type}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1.5 line-clamp-2 leading-snug">
                        {relEdge.label}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Bottom Colophon Actions */}
        <div className="pt-8 pb-12 border-t border-[var(--border-main)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href={`/?focusEdge=${edge.id || `${edge.source}--${edge.target}`}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--gold-accent)] text-stone-900 rounded-xl text-sm font-bold font-sans hover:brightness-110 transition shadow-sm"
          >
            <Compass className="w-4 h-4" />
            <span>Examine Connection in Constellation Graph</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] border border-[var(--border-main)] text-[var(--text-main)] rounded-xl text-sm font-medium font-sans transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Constellation Canvas</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
