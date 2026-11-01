import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Scale,
  Compass,
  Layers,
  Sparkles,
  Calendar,
  Headphones,
  Quote,
  Maximize2,
} from 'lucide-react';
import { concepts, getConceptDetails } from '../../../lib/graph/graph-service';
import { getEdgeTypeConfig, Philosopher, Concept } from '../../../lib/types';
import { getAssetUrl } from '../../../lib/assets';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return concepts.map((c) => ({
    id: c.id,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const details = getConceptDetails(id);
  if (!details || !details.concept) {
    return {
      title: 'Concept Not Found | Philosophia',
    };
  }
  return {
    title: `${details.concept.title} | Dialectical Concept Folio | Philosophia`,
    description: details.concept.summary,
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
  if (death === undefined) return `${fmt(birth)} – present`;
  return `${fmt(birth)} – ${fmt(death)}`;
}

function formatBranchName(branch: string): string {
  return branch
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default async function ConceptPage({ params }: PageProps) {
  const { id } = await params;
  const details = getConceptDetails(id);

  if (!details || !details.concept) {
    notFound();
  }

  const {
    concept,
    era,
    domain,
    introducedByPhilosopher,
    introducedByTradition,
    predecessors,
    successors,
    citations,
    relatedEdges,
    coIntroducedConcepts,
    media: conceptMedia,
  } = details;

  const sepUrl = concept.sepSlug
    ? `https://plato.stanford.edu/entries/${concept.sepSlug}/`
    : null;

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-[var(--bg-main)] text-[var(--text-main)] font-serif">
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
              Folio Conceptus
            </span>
            <Link
              href={`/?node=${concept.id}`}
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
          <span>Concepts</span>
          <span>/</span>
          <span className="text-[var(--gold-accent)] font-semibold truncate">
            {concept.title}
          </span>
        </div>

        {/* Hero Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-mono uppercase px-3 py-1 rounded-full border border-[var(--gold-border)] bg-[var(--bg-subtle)] text-[var(--gold-accent)] font-semibold">
              ✦ {formatBranchName(concept.branch)}
            </span>
            {era && (
              <span
                className="text-xs font-mono uppercase px-3 py-1 rounded-full text-white font-semibold shadow-xs"
                style={{ backgroundColor: era.color }}
              >
                {era.name}
              </span>
            )}
            {domain && (
              <span
                className={`text-xs font-mono uppercase px-3 py-1 rounded-full border font-semibold ${
                  domain === 'psychology'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : domain === 'sociology'
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                }`}
              >
                {domain}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-main)] leading-tight">
            {concept.title}
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed italic">
            {concept.summary}
          </p>
        </div>

        {/* Formulating Thinker Card */}
        {introducedByPhilosopher && (
          <div className="p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-xl space-y-4">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--text-dim)]">
              Originating Philosopher & Formulating Mind
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div
                className="w-20 h-20 rounded-2xl border-2 border-[var(--border-strong)] overflow-hidden flex items-center justify-center font-serif text-2xl font-bold shadow-md shrink-0 bg-[var(--bg-subtle)]"
                style={{
                  borderColor: introducedByTradition?.color || era?.color || 'var(--gold-accent)',
                }}
              >
                {introducedByPhilosopher.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getAssetUrl(introducedByPhilosopher.imageUrl)}
                    alt={introducedByPhilosopher.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  getNodeMonogram(introducedByPhilosopher.name)
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-main)]">
                      {introducedByPhilosopher.name}
                    </h2>
                    <div className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                      {formatLifespan(
                        introducedByPhilosopher.birthYear,
                        introducedByPhilosopher.deathYear
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/?node=${introducedByPhilosopher.id}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] border border-[var(--border-main)] rounded-lg text-xs font-sans text-[var(--text-main)] transition shrink-0"
                  >
                    <Compass className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
                    <span>Locate Thinker in Graph</span>
                  </Link>
                </div>

                {introducedByTradition && (
                  <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--border-main)] bg-[var(--bg-subtle)] text-[var(--text-dim)]">
                    {introducedByTradition.name}
                  </span>
                )}

                {introducedByPhilosopher.centralQuestion && (
                  <p className="text-xs text-[var(--text-muted)] italic pt-1">
                    &ldquo;{introducedByPhilosopher.centralQuestion}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section I: Conceptual Exposition & Dialectical Role */}
        <section className="space-y-4">
          <div className="pb-2 border-b border-[var(--border-main)]">
            <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
              <span>§ I.</span>
              <span>Conceptual Analysis & Philosophical Definition</span>
            </h3>
          </div>

          <div className="prose dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed text-[var(--text-main)] space-y-3">
            <p>{concept.summary}</p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-strong)] border-l-4 border-l-[var(--gold-accent)] space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--gold-accent)]" />
              <span>Dialectical Status & Field Innovation</span>
            </div>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              Formulated within the branch of{' '}
              <strong className="text-[var(--text-main)]">{formatBranchName(concept.branch)}</strong>
              {era ? ` during the ${era.name}` : ''}, this innovation established a pivotal conceptual
              conduit that altered philosophical inquiry and reoriented subsequent epistemological,
              ethical, and metaphysical trajectories.
            </p>
          </div>
        </section>

        {/* Section II: Dialectical Predecessors & Emergence */}
        {predecessors.length > 0 && (
          <section className="space-y-4">
            <div className="pb-2 border-b border-[var(--border-main)] flex items-center justify-between">
              <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
                <span>§ II.</span>
                <span>Dialectical Emergence & Foundational Lineages</span>
              </h3>
              <span className="text-xs font-mono text-[var(--text-dim)]">
                {predecessors.length} Incoming Connections
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {predecessors.map(({ node, edge }) => {
                const isPhil = 'birthYear' in node;
                const nodeName = isPhil ? (node as Philosopher).name : (node as Concept).title;
                const edgeConfig = getEdgeTypeConfig(edge.type);
                const edgeId = edge.id || `${edge.source}--${edge.target}`;

                return (
                  <div
                    key={`${edge.source}--${edge.target}`}
                    className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--gold-border)] transition flex flex-col justify-between space-y-2 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-[var(--text-main)] group-hover:text-[var(--gold-accent)] transition">
                          {nodeName}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${edgeConfig.badgeClass}`}
                        >
                          {edge.type}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                        {edge.label}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[var(--border-main)]/60 flex items-center justify-between text-[11px] font-sans">
                      <Link
                        href={`/influence/${edgeId}`}
                        className="text-[var(--gold-accent)] hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <span>Examine Lineage</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>

                      <Link
                        href={isPhil ? `/?node=${node.id}` : `/concept/${node.id}`}
                        className="text-[var(--text-dim)] hover:text-[var(--text-main)] transition text-[10px] font-mono"
                      >
                        {isPhil ? 'Locate Thinker' : 'Concept Folio'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Section III: Downstream Successors & Critiques */}
        {successors.length > 0 && (
          <section className="space-y-4">
            <div className="pb-2 border-b border-[var(--border-main)] flex items-center justify-between">
              <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
                <span>§ III.</span>
                <span>Dialectical Reception, Critiques & Successors</span>
              </h3>
              <span className="text-xs font-mono text-[var(--text-dim)]">
                {successors.length} Downstream Lines
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {successors.map(({ node, edge }) => {
                const isPhil = 'birthYear' in node;
                const nodeName = isPhil ? (node as Philosopher).name : (node as Concept).title;
                const edgeConfig = getEdgeTypeConfig(edge.type);
                const edgeId = edge.id || `${edge.source}--${edge.target}`;

                return (
                  <div
                    key={`${edge.source}--${edge.target}`}
                    className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--gold-border)] transition flex flex-col justify-between space-y-2 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-[var(--text-main)] group-hover:text-[var(--gold-accent)] transition">
                          {nodeName}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${edgeConfig.badgeClass}`}
                        >
                          {edge.type}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                        {edge.label}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[var(--border-main)]/60 flex items-center justify-between text-[11px] font-sans">
                      <Link
                        href={`/influence/${edgeId}`}
                        className="text-[var(--gold-accent)] hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <span>Examine Lineage</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>

                      <Link
                        href={isPhil ? `/?node=${node.id}` : `/concept/${node.id}`}
                        className="text-[var(--text-dim)] hover:text-[var(--text-main)] transition text-[10px] font-mono"
                      >
                        {isPhil ? 'Locate Thinker' : 'Concept Folio'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Section IV: Academic Proof & Primary Citations */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-main)]">
            <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
              <span>§ IV.</span>
              <span>Academic Proof, Treatises & Canonical References</span>
            </h3>
            <span className="text-xs font-mono text-[var(--text-dim)]">
              Verified Primary & Secondary Sources
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* SEP Reference Card if available */}
            {sepUrl && (
              <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--gold-border)] transition space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                        Stanford Encyclopedia of Philosophy
                      </span>
                      <span className="text-sm font-bold text-[var(--text-main)]">
                        Canonical Reference Entry
                      </span>
                    </div>
                    <div className="text-sm font-serif italic text-[var(--text-muted)] mt-1.5">
                      Peer-reviewed reference cataloged under SEP slug &ldquo;{concept.sepSlug}&rdquo;
                    </div>
                  </div>

                  <a
                    href={sepUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-[var(--text-dim)] hover:text-[var(--gold-accent)] bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-main)] hover:bg-[var(--bg-hover)] transition shrink-0 flex items-center gap-1.5 text-xs font-sans font-medium"
                    title="Open Stanford Encyclopedia entry"
                  >
                    <span>Read in SEP</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Citations from related dialectical edges */}
            {citations.length > 0 ? (
              citations.map((cite, index) => {
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
                            {isPrimary
                              ? 'Primary Source'
                              : isSep
                              ? 'SEP Academic Reference'
                              : 'Secondary Scholarship'}
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
                          <span>Source Archive</span>
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
              })
            ) : !sepUrl ? (
              <p className="text-sm text-[var(--text-dim)] italic">
                Scholarly citations are cataloged and verified in the canon database.
              </p>
            ) : null}
          </div>
        </section>

        {/* Section V: Multimedia & Audio Lectures */}
        {conceptMedia.length > 0 && (
          <section className="space-y-4">
            <div className="pb-2 border-b border-[var(--border-main)]">
              <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
                <span>§ V.</span>
                <span>Curated Lectures & Multimedia Expositions</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {conceptMedia.map((m) => (
                <a
                  key={m.id}
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] border border-[var(--border-main)] hover:border-[var(--gold-border)] transition space-y-2 group block"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--gold-accent)] border border-[var(--border-main)]">
                      {m.type}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--text-dim)] group-hover:text-[var(--gold-accent)] transition" />
                  </div>
                  <h4 className="text-sm font-bold text-[var(--text-main)] group-hover:text-[var(--gold-accent)] transition">
                    {m.title}
                  </h4>
                  {m.creator && (
                    <p className="text-xs text-[var(--text-muted)] font-mono">
                      By {m.creator}
                    </p>
                  )}
                  {m.summary && (
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                      {m.summary}
                    </p>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Section VI: Associated Conceptual Innovations */}
        {coIntroducedConcepts.length > 0 && (
          <section className="space-y-4">
            <div className="pb-2 border-b border-[var(--border-main)]">
              <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
                <span>§ VI.</span>
                <span>Associated Concepts from the Same Lineage</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {coIntroducedConcepts.map((c) => (
                <Link
                  key={c.id}
                  href={`/concept/${c.id}`}
                  className="p-4 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] border border-[var(--border-main)] hover:border-[var(--gold-border)] transition group flex flex-col justify-between space-y-2 focus:outline-hidden focus:ring-2 focus:ring-[var(--gold-accent)]"
                  title={`Examine ${c.title} concept folio`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[var(--text-main)] group-hover:text-[var(--gold-accent)] transition">
                        ✦ {c.title}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[var(--border-main)] text-[var(--text-dim)] shrink-0">
                        {c.branch}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">
                      {c.summary}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[var(--border-main)]/60 flex items-center justify-between text-[11px] font-sans text-[var(--gold-accent)] group-hover:brightness-110">
                    <span className="font-medium">Explore Concept Folio</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Section VII: Connected Dialectical Trajectories in the Constellation */}
        {relatedEdges.length > 0 && (
          <section className="space-y-4">
            <div className="pb-2 border-b border-[var(--border-main)]">
              <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
                <span>§ VII.</span>
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
            href={`/?node=${concept.id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--gold-accent)] text-stone-900 rounded-xl text-sm font-bold font-sans hover:brightness-110 transition shadow-sm"
          >
            <Compass className="w-4 h-4" />
            <span>Examine Concept in Constellation Graph</span>
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
