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
} from 'lucide-react';
import { getNodeDetails } from '../../lib/graph/graph-service';
import { Philosopher, Concept } from '../../lib/types';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'audio' | 'sep' | 'influence'>('overview');

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

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] lg:w-[540px] bg-slate-950/95 border-l border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-6 border-b border-slate-800/80 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Close dossier"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          {details.era && (
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white"
              style={{ backgroundColor: details.era.color }}
            >
              {details.era.name}
            </span>
          )}
          {details.tradition && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {details.tradition.name}
            </span>
          )}
          {conc && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 uppercase font-mono">
              {conc.branch}
            </span>
          )}
        </div>

        <h2 className="text-2xl font-bold text-slate-50 tracking-tight">
          {isPhilosopher ? phil?.name : conc?.title}
        </h2>

        {isPhilosopher && phil && (
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {formatYear(phil.birthYear)} – {formatYear(phil.deathYear)}
            </span>
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-slate-500" />
              Centrality: {phil.importanceScore}/100
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 px-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'audio'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          Podcasts ({podcasts.length})
        </button>

        <button
          onClick={() => setActiveTab('sep')}
          className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'sep'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          SEP Encyclopedia
        </button>

        <button
          onClick={() => setActiveTab('influence')}
          className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'influence'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
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
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-200">
                <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
                  Central Philosophical Question
                </div>
                <div className="text-sm font-serif italic">
                  &ldquo;{phil.centralQuestion}&rdquo;
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Synopsis
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {isPhilosopher ? phil?.shortBio : conc?.summary}
              </p>
            </div>

            {isPhilosopher && phil?.keyWorks && phil.keyWorks.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Key Texts & Major Works
                </h3>
                <ul className="space-y-1.5">
                  {phil.keyWorks.map((work, idx) => (
                    <li
                      key={idx}
                      className="text-xs font-medium text-slate-200 flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      {work}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick Action: Trace Path */}
            <div className="pt-2">
              <button
                onClick={() => onTracePath(selectedNodeId)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-medium transition"
              >
                <GitFork className="w-4 h-4" />
                Trace Influence Path From {isPhilosopher ? phil?.name : conc?.title}...
              </button>
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Listen to episodes from Stephen West&apos;s <em>Philosophize This!</em> covering this thinker.
            </div>

            {podcasts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No direct podcast episodes mapped yet. Check the SEP tab for deep reference.
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
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                      <div className="text-sm font-semibold text-slate-200">{ep.title}</div>
                      <a
                        href={ep.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 mt-2"
                      >
                        Listen on PhilosophizeThis.org <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {ep.summary && (
                    <p className="text-xs text-slate-400 px-1 leading-relaxed">
                      {ep.summary}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'sep' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Peer-reviewed, canonical academic philosophy reference from Stanford University.
            </div>

            {sepResources.map((res) => (
              <div
                key={res.id}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded">
                      Canonical Reference
                    </span>
                    <h4 className="text-sm font-semibold text-slate-100 mt-2">
                      {res.title}
                    </h4>
                  </div>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                    title="Open in Stanford Encyclopedia of Philosophy"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {res.summary}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Author: {res.creator || 'Stanford Encyclopedia Faculty'}</span>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Read on plato.stanford.edu &rarr;
                  </a>
                </div>
              </div>
            ))}

            {sepResources.length === 0 && (details.node as any).sepSlug && (
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <h4 className="text-sm font-semibold text-slate-100">
                  Stanford Encyclopedia Entry
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Canonical article available at Stanford Encyclopedia of Philosophy.
                </p>
                <a
                  href={`https://plato.stanford.edu/entries/${(details.node as any).sepSlug}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 rounded-lg text-xs font-medium hover:bg-emerald-900/60 transition"
                >
                  Visit SEP Entry <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        {activeTab === 'influence' && (
          <div className="space-y-6">
            {/* Predecessors */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                Influenced By ({details.predecessors.length})
              </div>

              {details.predecessors.length === 0 ? (
                <div className="text-xs text-slate-500 italic p-3 bg-slate-900/40 rounded-lg">
                  No direct predecessors recorded (original foundational thinker).
                </div>
              ) : (
                <div className="space-y-2">
                  {details.predecessors.map(({ node, edge }) => (
                    <div
                      key={edge.source}
                      onClick={() => onSelectNode(node.id)}
                      className="p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl cursor-pointer transition group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition">
                          {(node as any).name || (node as any).title}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {edge.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 leading-snug">
                        {edge.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Successors */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                Influenced Later Thinkers ({details.successors.length})
              </div>

              {details.successors.length === 0 ? (
                <div className="text-xs text-slate-500 italic p-3 bg-slate-900/40 rounded-lg">
                  No downstream successors currently recorded in dataset.
                </div>
              ) : (
                <div className="space-y-2">
                  {details.successors.map(({ node, edge }) => (
                    <div
                      key={edge.target}
                      onClick={() => onSelectNode(node.id)}
                      className="p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl cursor-pointer transition group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition">
                          {(node as any).name || (node as any).title}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {edge.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 leading-snug">
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
