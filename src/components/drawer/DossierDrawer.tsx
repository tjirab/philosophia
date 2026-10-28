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
  Bookmark,
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
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] lg:w-[560px] bg-[#12100d]/95 border-l border-[#3d3328] backdrop-blur-xl shadow-2xl flex flex-col transition-all duration-300 text-[#f4efe6] font-serif">
      {/* Header */}
      <div className="p-6 border-b border-[#2a241e] relative bg-[#171411]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#a89b88] hover:text-[#f5f0e6] rounded-lg hover:bg-[#25201a] transition"
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
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#25201a] text-[#c59b27] border border-[#3d3328]">
              {details.tradition.name}
            </span>
          )}
          {conc && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#201d18] text-[#e5b94c] border border-[#4a3b25] uppercase font-mono">
              {conc.branch}
            </span>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#f5f0e6] tracking-tight">
          {isPhilosopher ? phil?.name : conc?.title}
        </h2>

        {isPhilosopher && phil && (
          <div className="flex items-center gap-4 text-xs text-[#a89b88] mt-2">
            <span className="flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#c59b27]" />
              {formatYear(phil.birthYear)} – {formatYear(phil.deathYear)}
            </span>
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#c59b27]" />
              Centrality: {phil.importanceScore}/100
            </span>
          </div>
        )}
      </div>

      {/* Classical Tab Navigation */}
      <div className="flex border-b border-[#2a241e] bg-[#171411]/80 px-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-[#c59b27] text-[#e5b94c]'
              : 'border-transparent text-[#a89b88] hover:text-[#f5f0e6]'
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
                ? 'border-[#c59b27] text-[#e5b94c]'
                : 'border-transparent text-[#a89b88] hover:text-[#f5f0e6]'
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
              ? 'border-[#c59b27] text-[#e5b94c]'
              : 'border-transparent text-[#a89b88] hover:text-[#f5f0e6]'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          Podcasts ({podcasts.length})
        </button>

        <button
          onClick={() => setActiveTab('sep')}
          className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'sep'
              ? 'border-[#c59b27] text-[#e5b94c]'
              : 'border-transparent text-[#a89b88] hover:text-[#f5f0e6]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          SEP Encyclopedia
        </button>

        <button
          onClick={() => setActiveTab('influence')}
          className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'influence'
              ? 'border-[#c59b27] text-[#e5b94c]'
              : 'border-transparent text-[#a89b88] hover:text-[#f5f0e6]'
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
              <div className="p-4 rounded-xl bg-[#1f1a14] border border-[#3d3328] text-[#f4efe6]">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-[#c59b27] mb-1">
                  Central Philosophical Inquiry
                </div>
                <div className="text-sm font-serif italic leading-relaxed text-[#e8ded1]">
                  &ldquo;{phil.centralQuestion}&rdquo;
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-semibold text-[#c59b27] uppercase tracking-widest mb-2">
                Synopsis
              </h3>
              <p className="text-sm text-[#d8cfc0] leading-relaxed font-serif">
                {isPhilosopher ? phil?.shortBio : conc?.summary}
              </p>
            </div>

            {/* Quick Action: Trace Path */}
            <div className="pt-2">
              <button
                onClick={() => onTracePath(selectedNodeId)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1a1714] hover:bg-[#25201a] text-[#e5b94c] border border-[#4a3b25] rounded-xl text-xs font-semibold transition"
              >
                <GitFork className="w-4 h-4 text-[#c59b27]" />
                Trace Lineage Path From {isPhilosopher ? phil?.name : conc?.title}...
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Key Works & Primary Texts */}
        {activeTab === 'works' && (
          <div className="space-y-4">
            <div className="text-xs text-[#a89b88] leading-relaxed">
              Canonical editions, direct online texts, Wikipedia analyses, and academic citations.
            </div>

            <div className="space-y-3">
              {keyWorks.map((work, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#1a1714] border border-[#2a241e] hover:border-[#3d3328] transition space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-[#f5f0e6]">
                        {work.title}
                      </h4>
                      {work.year && (
                        <div className="text-[11px] font-mono text-[#a89b88] mt-0.5">
                          Published: {work.year}
                        </div>
                      )}
                    </div>
                    {work.isbn && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#25201a] text-[#c59b27] border border-[#3d3328] whitespace-nowrap">
                        ISBN {work.isbn}
                      </span>
                    )}
                  </div>

                  {work.description && (
                    <p className="text-xs text-[#d8cfc0] leading-relaxed">
                      {work.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-[#25201a] flex items-center gap-3 text-xs">
                    {work.url && (
                      <a
                        href={work.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[#e5b94c] hover:underline font-semibold"
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
                        className="inline-flex items-center gap-1 text-[#a89b88] hover:text-[#f5f0e6] transition"
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
            <div className="text-xs text-[#a89b88] leading-relaxed">
              Listen to episodes from Stephen West&apos;s <em>Philosophize This!</em> covering this thinker.
            </div>

            {podcasts.length === 0 ? (
              <div className="p-8 text-center text-[#786c5c] border border-dashed border-[#2a241e] rounded-xl text-xs">
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
                    <div className="p-4 bg-[#1a1714] border border-[#2a241e] rounded-xl">
                      <div className="text-sm font-semibold text-[#f5f0e6]">{ep.title}</div>
                      <a
                        href={ep.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[#e5b94c] hover:underline mt-2"
                      >
                        Listen on PhilosophizeThis.org <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {ep.summary && (
                    <p className="text-xs text-[#a89b88] px-1 leading-relaxed">
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
            <div className="text-xs text-[#a89b88] leading-relaxed">
              Peer-reviewed, canonical academic philosophy reference from Stanford University.
            </div>

            {sepResources.map((res) => (
              <div
                key={res.id}
                className="p-5 rounded-xl bg-[#1a1714] border border-[#2a241e] space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-[#1e2a22] text-[#52b788] border border-[#2d4a36] px-2 py-0.5 rounded">
                      Canonical Reference
                    </span>
                    <h4 className="text-sm font-bold text-[#f5f0e6] mt-2">
                      {res.title}
                    </h4>
                  </div>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-[#a89b88] hover:text-[#f5f0e6] bg-[#25201a] hover:bg-[#302920] rounded-lg transition"
                    title="Open in Stanford Encyclopedia of Philosophy"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <p className="text-xs text-[#d8cfc0] leading-relaxed">
                  {res.summary}
                </p>

                <div className="pt-3 border-t border-[#25201a] flex items-center justify-between text-xs text-[#a89b88]">
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
              <div className="p-5 rounded-xl bg-[#1a1714] border border-[#2a241e]">
                <h4 className="text-sm font-semibold text-[#f5f0e6]">
                  Stanford Encyclopedia Entry
                </h4>
                <p className="text-xs text-[#a89b88] mt-1">
                  Canonical article available at Stanford Encyclopedia of Philosophy.
                </p>
                <a
                  href={`https://plato.stanford.edu/entries/${(details.node as any).sepSlug}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2a22] text-[#52b788] border border-[#2d4a36] rounded-lg text-xs font-semibold hover:bg-[#283b30] transition"
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
              <div className="flex items-center gap-2 text-xs font-semibold text-[#c59b27] uppercase tracking-widest mb-3">
                <ArrowLeft className="w-3.5 h-3.5" />
                Influenced By ({details.predecessors.length})
              </div>

              {details.predecessors.length === 0 ? (
                <div className="text-xs text-[#786c5c] italic p-3 bg-[#171411] rounded-lg">
                  No direct predecessors recorded (original foundational thinker).
                </div>
              ) : (
                <div className="space-y-2">
                  {details.predecessors.map(({ node, edge }) => (
                    <div
                      key={edge.source}
                      onClick={() => onSelectNode(node.id)}
                      className="p-3 bg-[#1a1714] hover:bg-[#25201a] border border-[#2a241e] hover:border-[#c59b27]/50 rounded-xl cursor-pointer transition group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#f5f0e6] group-hover:text-[#e5b94c] transition">
                          {(node as any).name || (node as any).title}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#25201a] text-[#c59b27] border border-[#3d3328]">
                          {edge.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#a89b88] mt-1.5 leading-snug">
                        {edge.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Successors */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#c59b27] uppercase tracking-widest mb-3">
                <ArrowRight className="w-3.5 h-3.5" />
                Influenced Later Thinkers ({details.successors.length})
              </div>

              {details.successors.length === 0 ? (
                <div className="text-xs text-[#786c5c] italic p-3 bg-[#171411] rounded-lg">
                  No downstream successors currently recorded in dataset.
                </div>
              ) : (
                <div className="space-y-2">
                  {details.successors.map(({ node, edge }) => (
                    <div
                      key={edge.target}
                      onClick={() => onSelectNode(node.id)}
                      className="p-3 bg-[#1a1714] hover:bg-[#25201a] border border-[#2a241e] hover:border-[#c59b27]/50 rounded-xl cursor-pointer transition group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#f5f0e6] group-hover:text-[#e5b94c] transition">
                          {(node as any).name || (node as any).title}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#25201a] text-[#c59b27] border border-[#3d3328]">
                          {edge.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#a89b88] mt-1.5 leading-snug">
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
