import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Compass,
  Sparkles,
  Calendar,
  Headphones,
  Quote,
  Layers,
  Scale,
} from 'lucide-react';
import { philosophers, getThinkerDetails } from '../../../lib/graph/graph-service';
import { getEdgeTypeConfig, Philosopher, Concept } from '../../../lib/types';
import { getAssetUrl } from '../../../lib/assets';
import { AudioPlayer } from '../../../components/audio/AudioPlayer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return philosophers.map((p) => ({
    id: p.id,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const details = getThinkerDetails(id);
  if (!details || !details.thinker) {
    return {
      title: 'Thinker Not Found | Philosophia',
    };
  }
  return {
    title: `${details.thinker.name} | Dialectical Thinker Folio | Philosophia`,
    description: details.thinker.shortBio,
  };
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
  if (death === undefined || death === null) return `${fmt(birth)} – present`;
  return `${fmt(birth)} – ${fmt(death)}`;
}

export default async function ThinkerPage({ params }: PageProps) {
  const { id } = await params;
  const details = getThinkerDetails(id);

  if (!details || !details.thinker) {
    notFound();
  }

  const {
    thinker,
    era,
    tradition,
    predecessors,
    successors,
    formulatedConcepts,
    connectedConcepts,
    keyWorks,
    citations,
    contemporaryThinkers,
    media: thinkerMedia,
    exploration,
    scoreBreakdown,
  } = details;

  const sepUrl = thinker.sepSlug
    ? `https://plato.stanford.edu/entries/${thinker.sepSlug}/`
    : null;
  const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(thinker.name)}`;

  const podcasts = thinkerMedia.filter((m) => m.type === 'podcast');
  const encyclopedias = thinkerMedia.filter((m) => m.type === 'encyclopedia');

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
            <span className="hidden sm:inline-block text-xs font-mono uppercase tracking-widest text-[var(--text-dim)]">
              Folio Thinker
            </span>
            <Link
              href={`/?node=${thinker.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--gold-accent)] text-stone-900 rounded-lg text-xs font-bold font-sans hover:brightness-110 transition shadow-xs"
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Locate in Graph</span>
              <span className="sm:hidden">Locate</span>
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
          <span>Thinkers</span>
          <span>/</span>
          <span className="text-[var(--gold-accent)] font-semibold truncate">
            {thinker.name}
          </span>
        </div>

        {/* Grand Hero Section */}
        <div className="p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Portrait / Monogram */}
            <div className="relative shrink-0">
              <div
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-[var(--gold-border)] shadow-xl bg-[var(--bg-subtle)] flex items-center justify-center relative"
                style={{
                  boxShadow: `0 6px 20px -3px ${era?.color ? era.color + '40' : 'rgba(0,0,0,0.25)'}`,
                }}
              >
                {thinker.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getAssetUrl(thinker.imageUrl)}
                    alt={thinker.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <span className="font-serif font-bold text-3xl text-[var(--gold-accent)] select-none">
                    {getNodeMonogram(thinker.name)}
                  </span>
                )}
              </div>
              {era && (
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[var(--bg-card)] shadow-sm"
                  style={{ backgroundColor: era.color }}
                  title={era.name}
                />
              )}
            </div>

            {/* Thinker Details */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {era && (
                  <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white shadow-xs"
                    style={{ backgroundColor: era.color }}
                  >
                    {era.name}
                  </span>
                )}
                {tradition && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--gold-accent)] border border-[var(--border-main)] font-semibold">
                    {tradition.name}
                  </span>
                )}
                {thinker.domains?.map((d) => (
                  <span
                    key={d}
                    className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border font-semibold ${
                      d === 'psychology'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : d === 'sociology'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                    }`}
                  >
                    {d}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-main)]">
                {thinker.name}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
                  {formatLifespan(thinker.birthYear, thinker.deathYear)}
                </span>

                {scoreBreakdown && (
                  <span className="flex items-center gap-1.5 text-[var(--gold-accent)] font-semibold">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Centrality: {scoreBreakdown.score}/100</span>
                    <span className="text-[var(--text-dim)]">
                      (#{scoreBreakdown.rank})
                    </span>
                  </span>
                )}

                {exploration && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-main)]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="capitalize">{exploration.state.replace('-', ' ')}</span>
                  </span>
                )}
              </div>

              {thinker.centralQuestion && (
                <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--gold-border)]/50 text-left">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--gold-accent)] mb-1 flex items-center gap-1.5">
                    <Quote className="w-3 h-3" />
                    <span>Core Philosophical Inquiry</span>
                  </div>
                  <p className="text-sm italic font-serif text-[var(--text-main)] leading-relaxed">
                    &ldquo;{thinker.centralQuestion}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section I: Philosophical Synopsis */}
        <section className="space-y-4">
          <div className="pb-2 border-b border-[var(--border-main)]">
            <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
              <span>§ I.</span>
              <span>Philosophical Thesis & Intellectual Biography</span>
            </h3>
          </div>

          <p className="text-base sm:text-lg leading-relaxed text-[var(--text-main)] font-serif">
            {thinker.shortBio}
          </p>

          {exploration && (
            <div className="p-4 rounded-xl border border-[var(--border-main)] bg-[var(--bg-card)] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--text-main)]">
                  Cartography of Thought: {exploration.label}
                </span>
                <span className="font-mono text-[var(--gold-accent)] font-semibold">
                  Consensus Depth: {exploration.score}/100
                </span>
              </div>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {exploration.tagline}
              </p>
            </div>
          )}
        </section>

        {/* Section II: Canonical Works & Treatises */}
        {keyWorks.length > 0 && (
          <section className="space-y-4">
            <div className="pb-2 border-b border-[var(--border-main)]">
              <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
                <span>§ II.</span>
                <span>Canonical Works & Treatises ({keyWorks.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {keyWorks.map((work, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-2 hover:border-[var(--gold-border)] transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-[var(--text-main)] font-serif leading-snug">
                      {work.title}
                    </h4>
                    {work.year && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-dim)] shrink-0 border border-[var(--border-main)]">
                        {work.year}
                      </span>
                    )}
                  </div>

                  {work.description && (
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-3">
                      {work.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-[var(--border-main)]/50 flex items-center justify-between text-xs font-sans">
                    {work.isbn && (
                      <span className="text-[10px] font-mono text-[var(--text-dim)]">
                        ISBN: {work.isbn}
                      </span>
                    )}
                    {work.url && (
                      <a
                        href={work.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--gold-accent)] hover:underline ml-auto"
                      >
                        <span>Scholarly Entry</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section III: Formulated Landmark Concepts */}
        {formulatedConcepts.length > 0 && (
          <section className="space-y-4">
            <div className="pb-2 border-b border-[var(--border-main)]">
              <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
                <span>§ III.</span>
                <span>Formulated Landmark Concepts ({formulatedConcepts.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formulatedConcepts.map((conc) => (
                <Link
                  key={conc.id}
                  href={`/concept/${conc.id}`}
                  className="p-4 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] border border-[var(--border-main)] hover:border-[var(--gold-border)] transition group flex flex-col justify-between space-y-2 focus:outline-hidden focus:ring-2 focus:ring-[var(--gold-accent)]"
                  title={`Examine ${conc.title} concept folio`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[var(--text-main)] group-hover:text-[var(--gold-accent)] transition">
                        ✦ {conc.title}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[var(--border-main)] text-[var(--text-dim)] shrink-0">
                        {conc.branch}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">
                      {conc.summary}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[var(--border-main)]/60 flex items-center justify-between text-[11px] font-sans text-[var(--gold-accent)] group-hover:brightness-110">
                    <span className="font-medium">Examine Concept Folio</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Section IV: Dialectical Lineage & Network */}
        <section className="space-y-6">
          <div className="pb-2 border-b border-[var(--border-main)]">
            <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
              <span>§ IV.</span>
              <span>Dialectical Lineage & Transmission Network</span>
            </h3>
          </div>

          {/* Incoming Lines: Intellectual Predecessors */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5 text-blue-500" />
                <span>Intellectual Predecessors & Influences ({predecessors.length})</span>
              </h4>
            </div>

            {predecessors.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic">
                Originating node: no documented predecessors recorded in this lineage stage.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {predecessors.map(({ node, edge }) => {
                  const edgeConfig = getEdgeTypeConfig(edge.type);
                  const isPhil = 'birthYear' in node;
                  const nodeName = (node as Philosopher).name || (node as Concept).title;
                  const folioHref = isPhil ? `/thinker/${node.id}` : `/concept/${node.id}`;
                  const edgeHref = `/influence/${edge.id || `${edge.source}--${edge.target}`}`;

                  return (
                    <div
                      key={edge.id || `${edge.source}--${edge.target}`}
                      className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--border-strong)] transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <Link
                            href={folioHref}
                            className="w-8 h-8 rounded-full border border-[var(--border-strong)] bg-[var(--bg-subtle)] flex items-center justify-center font-serif text-xs font-bold text-[var(--gold-accent)] hover:scale-105 transition shrink-0"
                          >
                            {getNodeMonogram(nodeName)}
                          </Link>
                          <div>
                            <Link
                              href={folioHref}
                              className="text-sm font-bold text-[var(--text-main)] hover:text-[var(--gold-accent)] transition"
                            >
                              {nodeName}
                            </Link>
                            <span className="text-[11px] text-[var(--text-dim)] font-mono ml-2">
                              {isPhil ? 'Thinker' : 'Concept'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border font-semibold ${edgeConfig.badgeClass}`}
                          >
                            {edge.type}
                          </span>
                          <Link
                            href={edgeHref}
                            className="inline-flex items-center gap-1 text-xs font-sans text-[var(--gold-accent)] hover:underline"
                            title="Read dialectical influence folio"
                          >
                            <span>Read Folio</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>

                      {edge.label && (
                        <p className="text-xs font-medium text-[var(--text-main)] italic">
                          &ldquo;{edge.label}&rdquo;
                        </p>
                      )}

                      {edge.description && (
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed font-serif">
                          {edge.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Outgoing Lines: Downstream Heirs & Impact */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                <span>Downstream Successors & Intellectual Heirs ({successors.length})</span>
              </h4>
            </div>

            {successors.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic">
                Culminating node: no downstream direct successors documented in this canon partition.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {successors.map(({ node, edge }) => {
                  const edgeConfig = getEdgeTypeConfig(edge.type);
                  const isPhil = 'birthYear' in node;
                  const nodeName = (node as Philosopher).name || (node as Concept).title;
                  const folioHref = isPhil ? `/thinker/${node.id}` : `/concept/${node.id}`;
                  const edgeHref = `/influence/${edge.id || `${edge.source}--${edge.target}`}`;

                  return (
                    <div
                      key={edge.id || `${edge.source}--${edge.target}`}
                      className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--border-strong)] transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <Link
                            href={folioHref}
                            className="w-8 h-8 rounded-full border border-[var(--border-strong)] bg-[var(--bg-subtle)] flex items-center justify-center font-serif text-xs font-bold text-[var(--gold-accent)] hover:scale-105 transition shrink-0"
                          >
                            {getNodeMonogram(nodeName)}
                          </Link>
                          <div>
                            <Link
                              href={folioHref}
                              className="text-sm font-bold text-[var(--text-main)] hover:text-[var(--gold-accent)] transition"
                            >
                              {nodeName}
                            </Link>
                            <span className="text-[11px] text-[var(--text-dim)] font-mono ml-2">
                              {isPhil ? 'Thinker' : 'Concept'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border font-semibold ${edgeConfig.badgeClass}`}
                          >
                            {edge.type}
                          </span>
                          <Link
                            href={edgeHref}
                            className="inline-flex items-center gap-1 text-xs font-sans text-[var(--gold-accent)] hover:underline"
                            title="Read dialectical influence folio"
                          >
                            <span>Read Folio</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>

                      {edge.label && (
                        <p className="text-xs font-medium text-[var(--text-main)] italic">
                          &ldquo;{edge.label}&rdquo;
                        </p>
                      )}

                      {edge.description && (
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed font-serif">
                          {edge.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Section V: Scholarly Audio & Lectures */}
        {podcasts.length > 0 && (
          <section className="space-y-4">
            <div className="pb-2 border-b border-[var(--border-main)]">
              <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
                <Headphones className="w-3.5 h-3.5" />
                <span>Scholarly Audio & Lectures ({podcasts.length})</span>
              </h3>
            </div>

            <div className="space-y-3">
              {podcasts.map((ep) => (
                <div
                  key={ep.id}
                  className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-main)]">
                        {ep.title}
                      </h4>
                      {ep.creator && (
                        <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                          By {ep.creator}
                        </p>
                      )}
                    </div>

                    {ep.url && (
                      <a
                        href={ep.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-[var(--text-dim)] hover:text-[var(--gold-accent)] rounded transition"
                        title="Open episode source"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {ep.audioUrl && (
                    <AudioPlayer
                      audioUrl={ep.audioUrl}
                      title={ep.title}
                      episodeNumber={ep.episodeNumber}
                      duration={ep.duration}
                    />
                  )}

                  {ep.summary && (
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {ep.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section VI: Verified Academic Citations */}
        {citations.length > 0 && (
          <section className="space-y-4">
            <div className="pb-2 border-b border-[var(--border-main)]">
              <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
                <span>§ VI.</span>
                <span>Academic Citations & Verified Literature ({citations.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {citations.map((cite, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-1.5 text-xs font-serif"
                >
                  <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-[var(--text-dim)] uppercase">
                    <span>{cite.citationType} citation</span>
                    {cite.year && <span>{cite.year}</span>}
                  </div>
                  <div className="font-bold text-[var(--text-main)]">
                    {cite.author}
                  </div>
                  <div className="italic text-[var(--gold-accent)]">
                    {cite.work}
                  </div>
                  {cite.sectionOrPage && (
                    <div className="text-[var(--text-muted)] text-[11px] font-sans">
                      {cite.sectionOrPage}
                    </div>
                  )}
                  {cite.url && (
                    <a
                      href={cite.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-sans text-[var(--gold-accent)] hover:underline pt-1"
                    >
                      <span>Consult Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section VII: External Compendiums & Encyclopedias */}
        <section className="space-y-4">
          <div className="pb-2 border-b border-[var(--border-main)]">
            <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
              <span>§ VII.</span>
              <span>Authoritative Encyclopedias & External References</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sepUrl && (
              <a
                href={sepUrl}
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] border border-[var(--border-main)] hover:border-[var(--gold-border)] transition flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-main)] group-hover:text-[var(--gold-accent)] transition">
                    Stanford Encyclopedia of Philosophy
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Peer-reviewed entries and exhaustive bibliography
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-[var(--text-dim)] group-hover:text-[var(--gold-accent)] transition shrink-0 ml-2" />
              </a>
            )}

            <a
              href={wikiUrl}
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] border border-[var(--border-main)] hover:border-[var(--gold-border)] transition flex items-center justify-between group"
            >
              <div>
                <h4 className="text-sm font-bold text-[var(--text-main)] group-hover:text-[var(--gold-accent)] transition">
                  Wikipedia Historical Archive
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Biographical history, context, and public bibliography
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-[var(--text-dim)] group-hover:text-[var(--gold-accent)] transition shrink-0 ml-2" />
            </a>
          </div>
        </section>

        {/* Section VIII: Contemporary Thinkers & Tradition Peers */}
        {contemporaryThinkers.length > 0 && (
          <section className="space-y-4">
            <div className="pb-2 border-b border-[var(--border-main)]">
              <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
                <span>§ VIII.</span>
                <span>Contemporary Thinkers & Tradition Peers</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {contemporaryThinkers.map((peer) => (
                <Link
                  key={peer.id}
                  href={`/thinker/${peer.id}`}
                  className="p-3.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] border border-[var(--border-main)] hover:border-[var(--gold-border)] transition group flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-full border border-[var(--border-strong)] bg-[var(--bg-subtle)] flex items-center justify-center font-serif text-xs font-bold text-[var(--gold-accent)] shrink-0 group-hover:scale-105 transition">
                    {getNodeMonogram(peer.name)}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--gold-accent)] transition truncate">
                      {peer.name}
                    </h5>
                    <p className="text-[10px] font-mono text-[var(--text-muted)] truncate">
                      {formatLifespan(peer.birthYear, peer.deathYear)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
