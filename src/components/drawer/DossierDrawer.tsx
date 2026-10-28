'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  BookOpen,
  Headphones,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  GitFork,
  Calendar,
  Compass,
  FileText,
  ChevronDown,
  GitPullRequest,
} from 'lucide-react';
import { getNodeDetails } from '../../lib/graph/graph-service';
import { Philosopher, Concept, KeyWork, getEdgeTypeConfig } from '../../lib/types';
import { AudioPlayer } from '../audio/AudioPlayer';

interface DossierDrawerProps {
  selectedNodeId: string | null;
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
  onTracePath: (startId: string) => void;
  onOpenSuggestion?: (nodeId: string) => void;
}

export function DossierDrawer({
  selectedNodeId,
  onClose,
  onSelectNode,
  onTracePath,
  onOpenSuggestion,
}: DossierDrawerProps) {
  const [activeSection, setActiveSection] = useState<string>('section-synopsis');
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const details = selectedNodeId ? getNodeDetails(selectedNodeId) : null;
  const isPhilosopher = details?.type === 'philosopher';
  const phil = isPhilosopher ? (details?.node as Philosopher) : null;
  const conc = !isPhilosopher ? (details?.node as Concept) : null;

  const podcasts = details?.media.filter((m) => m.type === 'podcast') || [];
  const sepResources = details?.media.filter((m) => m.type === 'encyclopedia') || [];

  const keyWorks: KeyWork[] = isPhilosopher && phil?.keyWorks
    ? phil.keyWorks.map((w) =>
        typeof w === 'string'
          ? {
              title: w,
              url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(w)}`,
              wikipediaUrl: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(w)}`,
            }
          : w
      )
    : [];

  const formatYear = (y?: number) => {
    if (y === undefined) return '';
    return y < 0 ? `${Math.abs(y)} BCE` : `${y} CE`;
  };

  // Track active section on scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const sections = ['section-synopsis', 'section-works', 'section-podcasts', 'section-sep', 'section-influence'];
      const scrollPos = container.scrollTop + 120;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [selectedNodeId]);

  if (!selectedNodeId || !details?.node) return null;

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el && scrollContainerRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navSections = [
    { id: 'section-synopsis', label: 'Synopsis', count: null },
    ...(isPhilosopher && keyWorks.length > 0
      ? [{ id: 'section-works', label: 'Key Texts', count: keyWorks.length }]
      : []),
    ...(podcasts.length > 0
      ? [{ id: 'section-podcasts', label: 'Podcasts', count: podcasts.length }]
      : []),
    { id: 'section-sep', label: 'SEP Reference', count: null },
    {
      id: 'section-influence',
      label: 'Influence',
      count: details.predecessors.length + details.successors.length,
    },
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] lg:w-[600px] bg-[var(--bg-card)] border-l border-[var(--border-strong)] backdrop-blur-xl shadow-2xl flex flex-col transition-all duration-300 text-[var(--text-main)] font-serif">
      {/* Header */}
      <div className="p-6 border-b border-[var(--border-main)] relative bg-[var(--bg-card)]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[var(--text-dim)] hover:text-[var(--text-main)] rounded-lg hover:bg-[var(--bg-hover)] transition"
          aria-label="Close dossier"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {details.era && (
            <span
              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white shadow-sm"
              style={{ backgroundColor: details.era.color }}
            >
              {details.era.name}
            </span>
          )}
          {details.tradition && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--gold-accent)] border border-[var(--border-main)] font-semibold">
              {details.tradition.name}
            </span>
          )}
          {conc && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--gold-accent)] border border-[var(--border-main)] uppercase font-mono">
              {conc.branch}
            </span>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-main)] tracking-tight">
          {isPhilosopher ? phil?.name : (conc?.title || (conc as any)?.name || 'Concept')}
        </h2>

        {isPhilosopher && phil && (
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mt-2">
            <span className="flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
              {formatYear(phil.birthYear)} – {formatYear(phil.deathYear)}
            </span>

            {/* Centrality with Hover Explanation */}
            <div className="relative group/centrality flex items-center gap-1.5 cursor-help">
              <Compass className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
              <span className="font-semibold text-[var(--gold-accent)]">
                Centrality: {phil.importanceScore}/100
              </span>
              <span className="text-[10px] text-[var(--text-dim)] font-mono border border-[var(--border-main)] rounded px-1">
                ?
              </span>

              {/* Tooltip Popup */}
              <div className="absolute left-0 top-full mt-1.5 hidden group-hover/centrality:block z-50 w-72 p-3 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-xl shadow-2xl text-[11px] text-[var(--text-main)] font-serif leading-relaxed">
                <div className="font-bold text-[var(--gold-accent)] mb-1 flex items-center gap-1">
                  <span>✦ What is Degree Centrality?</span>
                </div>
                <p className="text-[var(--text-muted)]">
                  Measures historical influence density (0–100) based on total incoming and outgoing intellectual connections (mentorships, critiques, extensions, and syntheses). A higher score indicates a pivotal thinker who shaped or challenged multiple philosophical traditions.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Table of Contents Jump Bar */}
      <div className="sticky top-0 z-20 flex items-center gap-1.5 px-6 py-2.5 bg-[var(--bg-card)]/95 border-b border-[var(--border-main)] backdrop-blur-md overflow-x-auto no-scrollbar shadow-sm">
        <span className="text-[10px] uppercase tracking-widest text-[var(--text-dim)] font-semibold shrink-0 mr-1">
          Jump to:
        </span>
        {navSections.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                isActive
                  ? 'bg-[var(--gold-bg)] text-[var(--gold-accent)] border-[var(--gold-border)] shadow-sm'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--border-main)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <span>{sec.label}</span>
              {sec.count !== null && (
                <span className="ml-1 opacity-70 text-[10px] font-mono">({sec.count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Single Scrollable Page with Rich Sections */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-10 scroll-smooth"
      >
        {/* SECTION 1: Synopsis & Central Question */}
        <section id="section-synopsis" className="space-y-4 pt-1">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-main)]">
            <h3 className="text-sm font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
              <span>§ I.</span>
              <span>Philosophical Thesis & Synopsis</span>
            </h3>
          </div>

          {isPhilosopher && phil?.centralQuestion && (
            <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--gold-border)]/60 text-[var(--text-main)] shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--gold-accent)] mb-1">
                Central Inquiry
              </div>
              <div className="text-base font-serif italic leading-relaxed text-[var(--text-main)]">
                &ldquo;{phil.centralQuestion}&rdquo;
              </div>
            </div>
          )}

          <div>
            <p className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed font-serif">
              {isPhilosopher ? phil?.shortBio : (conc?.summary || (conc as any)?.description || '')}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onTracePath(selectedNodeId)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[var(--gold-bg)] hover:bg-[var(--bg-hover)] text-[var(--gold-accent)] border border-[var(--gold-border)] rounded-xl text-xs font-semibold tracking-wide transition shadow-sm"
            >
              <GitFork className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
              <span>Trace Lineage...</span>
            </button>
            {onOpenSuggestion && (
              <button
                onClick={() => onOpenSuggestion(selectedNodeId)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-main)] rounded-xl text-xs font-semibold tracking-wide transition"
                title="Suggest an edit, link, or citation for this entry on GitHub"
              >
                <GitPullRequest className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
                <span>Suggest Edit</span>
              </button>
            )}
          </div>
        </section>

        {/* SECTION 2: Canonical Texts & Primary Sources */}
        {isPhilosopher && keyWorks.length > 0 && (
          <section id="section-works" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-main)]">
              <h3 className="text-sm font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
                <span>§ II.</span>
                <span>Canonical Works & Primary Texts</span>
              </h3>
              <span className="text-xs text-[var(--text-dim)] font-mono">{keyWorks.length} Volumes</span>
            </div>

            <div className="space-y-3">
              {keyWorks.map((work, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] hover:border-[var(--gold-border)] transition space-y-2.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-main)]">
                        {work.title}
                      </h4>
                      {work.year && (
                        <div className="text-[11px] font-mono text-[var(--text-dim)] mt-0.5">
                          Published: {work.year}
                        </div>
                      )}
                    </div>
                    {work.isbn && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--gold-accent)] border border-[var(--border-main)] whitespace-nowrap">
                        ISBN {work.isbn}
                      </span>
                    )}
                  </div>

                  {work.description && (
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {work.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-[var(--border-main)] flex items-center gap-4 text-xs flex-wrap">
                    {work.url && (
                      <a
                        href={work.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[var(--gold-accent)] hover:underline font-semibold"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read Primary Text</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    )}
                    {work.wikipediaUrl && (
                      <a
                        href={work.wikipediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--text-dim)] hover:text-[var(--text-main)] transition"
                      >
                        <span>Wikipedia Treatise</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3: Podcasts (Philosophize This!) */}
        {podcasts.length > 0 && (
          <section id="section-podcasts" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-main)]">
              <h3 className="text-sm font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
                <span>§ III.</span>
                <span>Audio Discourse (Philosophize This!)</span>
              </h3>
              <span className="text-xs text-[var(--text-dim)] font-mono">{podcasts.length} Episodes</span>
            </div>

            <div className="space-y-3">
              {podcasts.map((ep) => (
                <div key={ep.id} className="space-y-2">
                  {ep.audioUrl ? (
                    <AudioPlayer
                      audioUrl={ep.audioUrl}
                      title={ep.title}
                      episodeNumber={ep.episodeNumber}
                      duration={ep.duration}
                    />
                  ) : (
                    <div className="p-4 bg-[var(--bg-subtle)] border border-[var(--border-main)] rounded-xl">
                      <div className="text-sm font-semibold text-[var(--text-main)]">{ep.title}</div>
                      <a
                        href={ep.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[var(--gold-accent)] hover:underline mt-2 font-semibold"
                      >
                        Listen on PhilosophizeThis.org <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 4: Stanford Encyclopedia (SEP) */}
        <section id="section-sep" className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-main)]">
            <h3 className="text-sm font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
              <span>§ IV.</span>
              <span>Canonical Scholarship (Stanford Encyclopedia)</span>
            </h3>
          </div>

          {sepResources.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-[var(--bg-card)] text-[#52b788] border border-[var(--border-main)] px-2 py-0.5 rounded font-semibold">
                    Peer-Reviewed Canonical Entry
                  </span>
                  <h4 className="text-sm font-bold text-[var(--text-main)] mt-2">
                    {res.title}
                  </h4>
                </div>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-[var(--text-dim)] hover:text-[var(--text-main)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] rounded-lg transition"
                  title="Open in Stanford Encyclopedia of Philosophy"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {res.summary}
              </p>

              <div className="pt-3 border-t border-[var(--border-main)] flex items-center justify-between text-xs text-[var(--text-dim)]">
                <span>Faculty: {res.creator || 'Stanford University'}</span>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#52b788] hover:underline flex items-center gap-1 font-semibold"
                >
                  Read treatise on plato.stanford.edu &rarr;
                </a>
              </div>
            </div>
          ))}

          {sepResources.length === 0 && (details.node as any).sepSlug && (
            <div className="p-5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)]">
              <h4 className="text-sm font-semibold text-[var(--text-main)]">
                Stanford Encyclopedia Entry
              </h4>
              <p className="text-xs text-[var(--text-dim)] mt-1">
                Canonical article available at Stanford Encyclopedia of Philosophy.
              </p>
              <a
                href={`https://plato.stanford.edu/entries/${(details.node as any).sepSlug}/`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-card)] text-[#52b788] border border-[var(--border-main)] rounded-lg text-xs font-semibold hover:bg-[var(--bg-hover)] transition"
              >
                Visit SEP Entry <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </section>

        {/* SECTION 5: Web of Influence */}
        <section id="section-influence" className="space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-main)]">
            <h3 className="text-sm font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
              <span>§ V.</span>
              <span>Web of Intellectual Influence</span>
            </h3>
            <span className="text-xs text-[var(--text-dim)] font-mono">
              {details.predecessors.length + details.successors.length} Direct Relations
            </span>
          </div>

          {/* Predecessors */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 dark:text-sky-300 uppercase tracking-widest mb-3">
              <ArrowLeft className="w-3.5 h-3.5 text-sky-500" />
              <span>Influenced By ({details.predecessors.length})</span>
            </div>

            {details.predecessors.length === 0 ? (
              <div className="text-xs text-[var(--text-dim)] italic p-3 bg-[var(--bg-subtle)] rounded-lg">
                No direct predecessors recorded (original foundational thinker).
              </div>
            ) : (
              <div className="space-y-2">
                {details.predecessors.map(({ node, edge }) => {
                  const edgeConfig = getEdgeTypeConfig(edge.type);
                  return (
                    <div
                      key={edge.source}
                      onClick={() => onSelectNode(node.id)}
                      className={`p-3 bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] border border-[var(--border-main)] hover:border-[var(--gold-border)] rounded-xl cursor-pointer transition group shadow-sm ${edgeConfig.cardBorderClass}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--gold-accent)] transition">
                          {(node as any).name || (node as any).title}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border transition-colors ${edgeConfig.badgeClass}`}
                          title={edgeConfig.description}
                        >
                          {edge.type}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-snug">
                        {edge.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Successors */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-widest mb-3">
              <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
              <span>Influenced Later Thinkers ({details.successors.length})</span>
            </div>

            {details.successors.length === 0 ? (
              <div className="text-xs text-[var(--text-dim)] italic p-3 bg-[var(--bg-subtle)] rounded-lg">
                No downstream successors currently recorded in dataset.
              </div>
            ) : (
              <div className="space-y-2">
                {details.successors.map(({ node, edge }) => {
                  const edgeConfig = getEdgeTypeConfig(edge.type);
                  return (
                    <div
                      key={edge.target}
                      onClick={() => onSelectNode(node.id)}
                      className={`p-3 bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] border border-[var(--border-main)] hover:border-[var(--gold-border)] rounded-xl cursor-pointer transition group shadow-sm ${edgeConfig.cardBorderClass}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--gold-accent)] transition">
                          {(node as any).name || (node as any).title}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border transition-colors ${edgeConfig.badgeClass}`}
                          title={edgeConfig.description}
                        >
                          {edge.type}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-snug">
                        {edge.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Folio Colophon & GitHub Edit Prompt */}
          <div className="pt-6 pb-2 border-t border-[var(--border-main)] text-center space-y-2">
            <div className="text-[11px] text-[var(--text-dim)]">
              Know an influence link, book citation, or podcast episode missing for {isPhilosopher ? phil?.name : conc?.title}?
            </div>
            {onOpenSuggestion && (
              <button
                onClick={() => onOpenSuggestion(selectedNodeId)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--gold-accent)] border border-[var(--border-main)] rounded-xl text-xs font-semibold transition"
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>Suggest Edit or Content on GitHub</span>
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
