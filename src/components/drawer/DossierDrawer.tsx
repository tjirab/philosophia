'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { getNodeDetails } from '../../lib/graph/graph-service';
import { Philosopher, Concept, KeyWork } from '../../lib/types';
import { AudioPlayer } from '../audio/AudioPlayer';

interface DossierDrawerProps {
  selectedNodeId: string | null;
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
  onTracePath: (startId: string) => void;
}

export function DossierDrawer({
  selectedNodeId,
  onClose,
  onSelectNode,
  onTracePath,
}: DossierDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'works' | 'audio' | 'sep' | 'influence'>('overview');

  if (!selectedNodeId) return null;

  const details = getNodeDetails(selectedNodeId);
  if (!details.node) return null;

  const isPhilosopher = details.type === 'philosopher';
  const phil = isPhilosopher ? (details.node as Philosopher) : null;
  const conc = !isPhilosopher ? (details.node as Concept) : null;

  const podcasts = details.media.filter((m) => m.type === 'podcast');
  const sepResources = details.media.filter((m) => m.type === 'encyclopedia');

  const formatYear = (y?: number) => {
    if (y === undefined) return '';
    return y < 0 ? `${Math.abs(y)} BCE` : `${y} CE`;
  };

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

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] lg:w-[560px] bg-[var(--bg-card)] border-l border-[var(--border-strong)] backdrop-blur-xl shadow-2xl flex flex-col transition-all duration-300 text-[var(--text-main)] font-serif">
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
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--gold-accent)] border border-[var(--border-main)]">
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
          {isPhilosopher ? phil?.name : conc?.title}
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

              {/* Hover Tooltip Popup */}
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

      {/* Classical Tab Navigation */}
      <div className="flex border-b border-[var(--border-main)] bg-[var(--bg-subtle)] px-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-[var(--gold-accent)] text-[var(--gold-accent)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Overview
        </button>

        {isPhilosopher && (
          <button
            onClick={() => setActiveTab('works')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'works'
                ? 'border-[var(--gold-accent)] text-[var(--gold-accent)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Key Texts ({keyWorks.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab('audio')}
          className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'audio'
              ? 'border-[var(--gold-accent)] text-[var(--gold-accent)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          Podcasts ({podcasts.length})
        </button>

        <button
          onClick={() => setActiveTab('sep')}
          className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'sep'
              ? 'border-[var(--gold-accent)] text-[var(--gold-accent)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          SEP Encyclopedia
        </button>

        <button
          onClick={() => setActiveTab('influence')}
          className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'influence'
              ? 'border-[var(--gold-accent)] text-[var(--gold-accent)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          Influence ({details.predecessors.length + details.successors.length})
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {isPhilosopher && phil?.centralQuestion && (
              <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] text-[var(--text-main)]">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--gold-accent)] mb-1">
                  Central Philosophical Inquiry
                </div>
                <div className="text-sm font-serif italic leading-relaxed text-[var(--text-main)]">
                  &ldquo;{phil.centralQuestion}&rdquo;
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-semibold text-[var(--gold-accent)] uppercase tracking-widest mb-2">
                Synopsis
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed font-serif">
                {isPhilosopher ? phil?.shortBio : conc?.summary}
              </p>
            </div>

            {/* Quick Action: Trace Path */}
            <div className="pt-2">
              <button
                onClick={() => onTracePath(selectedNodeId)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--gold-accent)] border border-[var(--gold-border)] rounded-xl text-xs font-semibold transition"
              >
                <GitFork className="w-4 h-4 text-[var(--gold-accent)]" />
                Trace Lineage Path From {isPhilosopher ? phil?.name : conc?.title}...
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Key Works & Primary Texts */}
        {activeTab === 'works' && (
          <div className="space-y-4">
            <div className="text-xs text-[var(--text-muted)] leading-relaxed">
              Canonical editions, direct online texts, Wikipedia analyses, and academic citations.
            </div>

            <div className="space-y-3">
              {keyWorks.map((work, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] hover:border-[var(--border-strong)] transition space-y-2.5"
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

                  <div className="pt-2 border-t border-[var(--border-main)] flex items-center gap-3 text-xs">
                    {work.url && (
                      <a
                        href={work.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[var(--gold-accent)] hover:underline font-semibold"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Read Primary Text <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    )}
                    {work.wikipediaUrl && (
                      <a
                        href={work.wikipediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--text-dim)] hover:text-[var(--text-main)] transition"
                      >
                        Wikipedia Entry <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Podcasts */}
        {activeTab === 'audio' && (
          <div className="space-y-4">
            <div className="text-xs text-[var(--text-muted)] leading-relaxed">
              Listen to episodes from Stephen West&apos;s <em>Philosophize This!</em> covering this thinker.
            </div>

            {podcasts.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-dim)] border border-dashed border-[var(--border-main)] rounded-xl text-xs">
                No direct podcast episode matched for this node. Check the SEP tab for canonical analysis.
              </div>
            ) : (
              podcasts.map((ep) => (
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
                        className="inline-flex items-center gap-1.5 text-xs text-[var(--gold-accent)] hover:underline mt-2"
                      >
                        Listen on PhilosophizeThis.org <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {ep.summary && (
                    <p className="text-xs text-[var(--text-dim)] px-1 leading-relaxed">
                      {ep.summary}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Stanford Encyclopedia */}
        {activeTab === 'sep' && (
          <div className="space-y-4">
            <div className="text-xs text-[var(--text-muted)] leading-relaxed">
              Peer-reviewed, canonical academic philosophy reference from Stanford University.
            </div>

            {sepResources.map((res) => (
              <div
                key={res.id}
                className="p-5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-[var(--bg-card)] text-[#52b788] border border-[var(--border-main)] px-2 py-0.5 rounded">
                      Canonical Reference
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
                    Read on plato.stanford.edu &rarr;
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
          </div>
        )}

        {/* Tab 5: Influence Connections */}
        {activeTab === 'influence' && (
          <div className="space-y-6">
            {/* Predecessors */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--gold-accent)] uppercase tracking-widest mb-3">
                <ArrowLeft className="w-3.5 h-3.5" />
                Influenced By ({details.predecessors.length})
              </div>

              {details.predecessors.length === 0 ? (
                <div className="text-xs text-[var(--text-dim)] italic p-3 bg-[var(--bg-subtle)] rounded-lg">
                  No direct predecessors recorded (original foundational thinker).
                </div>
              ) : (
                <div className="space-y-2">
                  {details.predecessors.map(({ node, edge }) => (
                    <div
                      key={edge.source}
                      onClick={() => onSelectNode(node.id)}
                      className="p-3 bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] border border-[var(--border-main)] hover:border-[var(--gold-border)] rounded-xl cursor-pointer transition group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--gold-accent)] transition">
                          {(node as any).name || (node as any).title}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--gold-accent)] border border-[var(--border-main)]">
                          {edge.type}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-snug">
                        {edge.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Successors */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--gold-accent)] uppercase tracking-widest mb-3">
                <ArrowRight className="w-3.5 h-3.5" />
                Influenced Later Thinkers ({details.successors.length})
              </div>

              {details.successors.length === 0 ? (
                <div className="text-xs text-[var(--text-dim)] italic p-3 bg-[var(--bg-subtle)] rounded-lg">
                  No downstream successors currently recorded in dataset.
                </div>
              ) : (
                <div className="space-y-2">
                  {details.successors.map(({ node, edge }) => (
                    <div
                      key={edge.target}
                      onClick={() => onSelectNode(node.id)}
                      className="p-3 bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] border border-[var(--border-main)] hover:border-[var(--gold-border)] rounded-xl cursor-pointer transition group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--gold-accent)] transition">
                          {(node as any).name || (node as any).title}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--gold-accent)] border border-[var(--border-main)]">
                          {edge.type}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-snug">
                        {edge.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
