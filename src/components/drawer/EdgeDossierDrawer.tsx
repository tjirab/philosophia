'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Maximize2,
  ExternalLink,
  BookOpen,
  ArrowRight,
  GitFork,
  Calendar,
  Sparkles,
  Quote,
  CheckCircle2,
  ShieldCheck,
  Scale,
  Compass,
} from 'lucide-react';
import { getEdgeDetails } from '../../lib/graph/graph-service';
import { getEdgeTypeConfig, Philosopher, Concept } from '../../lib/types';
import { getAssetUrl } from '../../lib/assets';

interface EdgeDossierDrawerProps {
  selectedEdgeId: string | null;
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
  onTracePath?: (startId: string, targetId?: string) => void;
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

export function EdgeDossierDrawer({
  selectedEdgeId,
  onClose,
  onSelectNode,
  onTracePath,
}: EdgeDossierDrawerProps) {
  const [sourceImgError, setSourceImgError] = useState(false);
  const [targetImgError, setTargetImgError] = useState(false);

  if (!selectedEdgeId) return null;

  const details = getEdgeDetails(selectedEdgeId);
  if (!details || !details.edge) return null;

  const {
    edge,
    sourceNode,
    targetNode,
    sourceEra,
    targetEra,
    sourceTradition,
    targetTradition,
    connectedConcepts,
  } = details;

  const edgeConfig = getEdgeTypeConfig(edge.type);

  const sourceName =
    (sourceNode as Philosopher)?.name || (sourceNode as Concept)?.title || edge.source;
  const targetName =
    (targetNode as Philosopher)?.name || (targetNode as Concept)?.title || edge.target;

  const isSourcePhil = sourceNode && 'birthYear' in sourceNode;
  const isTargetPhil = targetNode && 'birthYear' in targetNode;

  const sourceImg = isSourcePhil ? (sourceNode as Philosopher).imageUrl : undefined;
  const targetImg = isTargetPhil ? (targetNode as Philosopher).imageUrl : undefined;

  const consensusLabel =
    edge.academicConsensus === 'unanimous'
      ? 'Unanimous Academic Consensus'
      : edge.academicConsensus === 'debated'
      ? 'Scholarly Debated / Dialectical Division'
      : edge.academicConsensus === 'revisionist'
      ? 'Revisionist Historiography'
      : 'Broad Scholarly Consensus';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[560px] lg:w-[620px] bg-[var(--bg-card)] border-l border-[var(--border-strong)] backdrop-blur-xl shadow-2xl flex flex-col transition-all duration-300 text-[var(--text-main)] font-serif animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="p-5 border-b border-[var(--border-main)] bg-[var(--bg-card)] relative shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span
              className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-semibold ${edgeConfig.badgeClass}`}
            >
              {edge.type}
            </span>
            <span className="text-xs text-[var(--text-dim)] font-mono whitespace-nowrap">
              Strength {edge.strength || 3}/5
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Link
              href={`/influence/${edge.id || `${edge.source}--${edge.target}`}`}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-[var(--text-dim)] hover:text-[var(--gold-accent)] rounded-lg hover:bg-[var(--bg-hover)] border border-transparent hover:border-[var(--border-main)] transition flex items-center gap-1.5 text-xs"
              title="Expand into full scholarly folio page"
            >
              <Maximize2 className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline font-sans text-[11px] font-medium">Expand Page</span>
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--text-dim)] hover:text-[var(--text-main)] rounded-lg hover:bg-[var(--bg-hover)] transition"
              aria-label="Close influence drawer"
            >
              <X className="w-5 h-5 shrink-0" />
            </button>
          </div>
        </div>

        {/* Title / Label */}
        <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)] mt-3 leading-snug">
          {edge.label}
        </h2>

        {/* Dyad Display: Source -> Target */}
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-3 bg-[var(--bg-subtle)] border border-[var(--border-main)] rounded-xl">
          {/* Source Thinker */}
          <button
            onClick={() => sourceNode && onSelectNode(sourceNode.id)}
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--bg-hover)] transition text-left group overflow-hidden"
          >
            <div
              className="w-9 h-9 rounded-full border border-[var(--border-strong)] shrink-0 overflow-hidden flex items-center justify-center font-serif text-xs font-bold shadow-xs transition group-hover:scale-105"
              style={{
                backgroundColor: `${sourceTradition?.color || sourceEra?.color || '#3b82f6'}22`,
                borderColor: sourceTradition?.color || sourceEra?.color || '#3b82f6',
                color: sourceTradition?.color || sourceEra?.color || '#3b82f6',
              }}
            >
              {sourceImg && !sourceImgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getAssetUrl(sourceImg)}
                  alt={sourceName}
                  className="w-full h-full object-cover"
                  onError={() => setSourceImgError(true)}
                />
              ) : (
                getNodeMonogram(sourceName)
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-dim)]">
                Precursor
              </div>
              <div className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--gold-accent)] transition truncate">
                {sourceName}
              </div>
              {isSourcePhil && (
                <div className="text-[10px] text-[var(--text-muted)] truncate">
                  {formatLifespan((sourceNode as Philosopher).birthYear, (sourceNode as Philosopher).deathYear)}
                </div>
              )}
            </div>
          </button>

          {/* Directional Flow */}
          <div className="flex flex-col items-center justify-center px-1 text-[var(--gold-accent)]">
            <ArrowRight className="w-4 h-4 animate-pulse" />
          </div>

          {/* Target Thinker */}
          <button
            onClick={() => targetNode && onSelectNode(targetNode.id)}
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--bg-hover)] transition text-left group overflow-hidden"
          >
            <div
              className="w-9 h-9 rounded-full border border-[var(--border-strong)] shrink-0 overflow-hidden flex items-center justify-center font-serif text-xs font-bold shadow-xs transition group-hover:scale-105"
              style={{
                backgroundColor: `${targetTradition?.color || targetEra?.color || '#0d9488'}22`,
                borderColor: targetTradition?.color || targetEra?.color || '#0d9488',
                color: targetTradition?.color || targetEra?.color || '#0d9488',
              }}
            >
              {targetImg && !targetImgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getAssetUrl(targetImg)}
                  alt={targetName}
                  className="w-full h-full object-cover"
                  onError={() => setTargetImgError(true)}
                />
              ) : (
                getNodeMonogram(targetName)
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-dim)]">
                Successor
              </div>
              <div className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--gold-accent)] transition truncate">
                {targetName}
              </div>
              {isTargetPhil && (
                <div className="text-[10px] text-[var(--text-muted)] truncate">
                  {formatLifespan((targetNode as Philosopher).birthYear, (targetNode as Philosopher).deathYear)}
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Consensus Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-main)] text-xs text-[var(--text-muted)]">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{consensusLabel}</span>
        </div>

        {/* Section: Dialectical Analysis */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
            <span>§ I.</span>
            <span>Dialectical Analysis & Argument</span>
          </h3>
          <p className="text-sm leading-relaxed text-[var(--text-main)]">
            {edge.description || edge.label}
          </p>

          {edge.dialecticalTension && (
            <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] border-l-4 border-l-[var(--gold-accent)] space-y-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
                <span>Dialectical Departure</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed italic">
                {edge.dialecticalTension}
              </p>
            </div>
          )}
        </div>

        {/* Section: Historical Context */}
        {edge.historicalContext && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
              <span>§ II.</span>
              <span>Historical Circumstances & Setting</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {edge.historicalContext}
            </p>
          </div>
        )}

        {/* Section: Academic Citations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-[var(--border-main)]">
            <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
              <span>§ III.</span>
              <span>Academic Proof & Citations</span>
            </h3>
            <span className="text-xs text-[var(--text-dim)] font-mono">
              {edge.citations?.length || 0} Sources
            </span>
          </div>

          {edge.citations && edge.citations.length > 0 ? (
            <div className="space-y-3">
              {edge.citations.map((cite, index) => {
                const isPrimary = cite.citationType === 'primary';
                const isSep = cite.citationType === 'sep';

                return (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] hover:border-[var(--gold-border)] transition space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                              isPrimary
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                                : isSep
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                : 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30'
                            }`}
                          >
                            {isPrimary ? 'Primary Source' : isSep ? 'SEP Academic' : 'Secondary'}
                          </span>
                          <span className="text-xs font-bold text-[var(--text-main)]">
                            {cite.author}
                          </span>
                        </div>
                        <div className="text-xs font-serif italic text-[var(--text-muted)] mt-1">
                          {cite.work}
                          {cite.sectionOrPage && ` (${cite.sectionOrPage})`}
                          {cite.year && `, ${cite.year}`}
                        </div>
                      </div>

                      {cite.url && (
                        <a
                          href={cite.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-[var(--text-dim)] hover:text-[var(--gold-accent)] bg-[var(--bg-card)] rounded-lg border border-[var(--border-main)] hover:bg-[var(--bg-hover)] transition shrink-0"
                          title="Open scholarly source"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {cite.quote && (
                      <div className="pt-2 border-t border-[var(--border-main)] flex items-start gap-2 text-xs text-[var(--text-muted)] italic leading-relaxed">
                        <Quote className="w-3.5 h-3.5 text-[var(--gold-accent)] shrink-0 mt-0.5" />
                        <span>&ldquo;{cite.quote}&rdquo;</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-dim)] italic">
              Academic citations being verified for this relation.
            </p>
          )}
        </div>

        {/* Section: Connected Concepts */}
        {connectedConcepts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[var(--gold-accent)] uppercase tracking-wider flex items-center gap-2">
              <span>§ IV.</span>
              <span>Conceptual Bridges</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {connectedConcepts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectNode(c.id)}
                  className="px-2.5 py-1 bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] border border-[var(--border-main)] hover:border-[var(--gold-border)] rounded-lg text-xs font-sans text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
                >
                  ✦ {c.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Footer */}
      <div className="p-4 border-t border-[var(--border-main)] bg-[var(--bg-card)] flex flex-col gap-2 shrink-0">
        <Link
          href={`/influence/${edge.id || `${edge.source}--${edge.target}`}`}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--gold-accent)] text-stone-900 rounded-xl text-xs font-bold hover:brightness-110 transition shadow-sm"
        >
          <BookOpen className="w-4 h-4" />
          <span>Open Full Scholarly Folio Page</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        {onTracePath && sourceNode && targetNode && (
          <button
            onClick={() => onTracePath(sourceNode.id, targetNode.id)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl text-xs font-medium transition"
          >
            <GitFork className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
            <span>Trace Lineage Path Between Thinkers</span>
          </button>
        )}
      </div>
    </div>
  );
}
