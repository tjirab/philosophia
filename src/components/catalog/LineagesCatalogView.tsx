'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  X,
  Compass,
  ShieldCheck,
  Scale,
  Sparkles,
} from 'lucide-react';
import { Edge, Philosopher, Concept, getEdgeTypeConfig } from '../../lib/types';
import { getAssetUrl } from '../../lib/assets';

interface LineagesCatalogViewProps {
  initialEdges: Edge[];
  philosophers: Philosopher[];
  concepts: Concept[];
}

function getNodeMonogram(name: string): string {
  const clean = name.replace(/^(von|de|du|of|the)\s+/i, '').trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export function LineagesCatalogView({
  initialEdges,
  philosophers,
  concepts,
}: LineagesCatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedConsensus, setSelectedConsensus] = useState<string>('all');

  const philMap = useMemo(() => new Map(philosophers.map((p) => [p.id, p])), [philosophers]);
  const conceptMap = useMemo(() => new Map(concepts.map((c) => [c.id, c])), [concepts]);

  const filteredEdges = useMemo(() => {
    return initialEdges.filter((edge) => {
      // Type filter
      if (selectedType !== 'all' && edge.type !== selectedType) {
        return false;
      }
      // Consensus filter
      if (selectedConsensus !== 'all' && edge.academicConsensus !== selectedConsensus) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const srcPhil = philMap.get(edge.source);
        const tgtPhil = philMap.get(edge.target);
        const srcConc = conceptMap.get(edge.source);
        const tgtConc = conceptMap.get(edge.target);

        const srcName = srcPhil?.name || srcConc?.title || edge.source;
        const tgtName = tgtPhil?.name || tgtConc?.title || edge.target;
        const matchNodes = srcName.toLowerCase().includes(q) || tgtName.toLowerCase().includes(q);
        const matchLabel = (edge.label || '').toLowerCase().includes(q);
        const matchDesc = (edge.description || '').toLowerCase().includes(q);
        return matchNodes || matchLabel || matchDesc;
      }
      return true;
    });
  }, [initialEdges, searchQuery, selectedType, selectedConsensus, philMap, conceptMap]);

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-[var(--bg-main)] text-[var(--text-main)] font-serif">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border-main)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
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
              Intellectual Lineages
            </span>
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Folio Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-dim)]">
          <Link href="/" className="hover:underline">
            Constellation
          </Link>
          <span>/</span>
          <span className="text-[var(--gold-accent)] font-semibold truncate">
            Lineages
          </span>
        </div>

        {/* Hero Banner */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-main)] text-xs text-[var(--gold-accent)] font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dialectical Transmission & Critique</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-main)] font-serif">
            Canonical Intellectual Lineages
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-3xl leading-relaxed italic">
            Peer-reviewed historical connections, philosophical departures, paradigm transmissions, and dialectical critiques
            linking thinkers and concepts across millennia.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-md space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lineages by thinker name, concept, thesis, or keyword..."
                className="w-full pl-10 pr-9 py-2 bg-[var(--bg-subtle)] border border-[var(--border-main)] rounded-xl text-sm font-sans placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--gold-accent)] transition text-[var(--text-main)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[var(--text-dim)] hover:text-[var(--text-main)] transition"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Consensus Filter Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-[var(--text-dim)] uppercase">Consensus:</span>
              <select
                value={selectedConsensus}
                onChange={(e) => setSelectedConsensus(e.target.value)}
                className="px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-main)] rounded-xl text-xs font-sans text-[var(--text-main)] focus:outline-none focus:border-[var(--gold-accent)] cursor-pointer"
              >
                <option value="all">All Academic Consensus</option>
                <option value="unanimous">Unanimous Consensus</option>
                <option value="broad-consensus">Broad Consensus</option>
                <option value="debated">Scholarly Debated</option>
                <option value="revisionist">Revisionist Historiography</option>
              </select>
            </div>
          </div>

          {/* Relationship Type Filter Pills */}
          <div className="pt-3 border-t border-[var(--border-main)]/60 flex flex-wrap items-center gap-1.5 text-xs font-sans">
            <span className="text-[11px] font-mono text-[var(--text-dim)] uppercase mr-1">Relationship:</span>
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-[var(--gold-accent)] text-stone-900 font-bold shadow-xs'
                  : 'bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] border border-[var(--border-main)]'
              }`}
            >
              All Types
            </button>
            {(['INFLUENCED', 'DEVELOPED', 'CRITIQUED', 'SYNTHESIZED'] as const).map((type) => {
              const cfg = getEdgeTypeConfig(type);
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer border ${
                    isSelected
                      ? `${cfg.badgeClass} font-bold shadow-xs`
                      : 'bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] border-[var(--border-main)]'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs font-mono text-[var(--text-dim)]">
          <span>
            Displaying {filteredEdges.length} of {initialEdges.length} canonical lineages
          </span>
          {(searchQuery || selectedType !== 'all' || selectedConsensus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedConsensus('all');
              }}
              className="text-[var(--gold-accent)] hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Lineages Grid */}
        {filteredEdges.length === 0 ? (
          <div className="p-12 text-center bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl space-y-3">
            <p className="text-base text-[var(--text-muted)] italic">
              No lineages found matching &ldquo;{searchQuery}&rdquo; within the selected filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedConsensus('all');
              }}
              className="px-4 py-2 bg-[var(--gold-accent)] text-stone-900 rounded-xl text-xs font-bold font-sans hover:brightness-110 transition cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEdges.map((edge) => {
              const edgeId = edge.id || `${edge.source}--${edge.target}`;
              const edgeConfig = getEdgeTypeConfig(edge.type);

              const srcPhil = philMap.get(edge.source);
              const tgtPhil = philMap.get(edge.target);
              const srcConc = conceptMap.get(edge.source);
              const tgtConc = conceptMap.get(edge.target);

              const srcName = srcPhil?.name || srcConc?.title || edge.source;
              const tgtName = tgtPhil?.name || tgtConc?.title || edge.target;

              const isSrcPhil = !!srcPhil;
              const isTgtPhil = !!tgtPhil;

              const consensusLabel =
                edge.academicConsensus === 'unanimous'
                  ? 'Unanimous'
                  : edge.academicConsensus === 'debated'
                  ? 'Debated'
                  : edge.academicConsensus === 'revisionist'
                  ? 'Revisionist'
                  : 'Consensus';

              return (
                <Link
                  key={edgeId}
                  href={`/influence/${edgeId}`}
                  className="p-5 bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--gold-border)] rounded-2xl transition group flex flex-col justify-between shadow-xs hover:shadow-md space-y-4"
                >
                  <div className="space-y-3">
                    {/* Source and Target Nodes Heading */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Source icon */}
                        {isSrcPhil ? (
                          <div className="w-7 h-7 rounded-full border border-[var(--border-strong)] bg-[var(--bg-subtle)] flex items-center justify-center font-serif text-[10px] font-bold text-[var(--gold-accent)] shrink-0 overflow-hidden">
                            {srcPhil?.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={getAssetUrl(srcPhil.imageUrl)}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              getNodeMonogram(srcName)
                            )}
                          </div>
                        ) : (
                          <div className="w-7 h-7 flex items-center justify-center shrink-0">
                            <div className="w-5 h-5 rotate-45 rounded-[3px] border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center">
                              <span className="-rotate-45 text-[8px] text-emerald-500 font-bold">✦</span>
                            </div>
                          </div>
                        )}

                        <span className="text-sm font-bold text-[var(--text-main)] group-hover:text-[var(--gold-accent)] transition truncate">
                          {srcName}
                        </span>

                        <ArrowRight className="w-3.5 h-3.5 text-[var(--text-dim)] shrink-0" />

                        {/* Target icon */}
                        {isTgtPhil ? (
                          <div className="w-7 h-7 rounded-full border border-[var(--border-strong)] bg-[var(--bg-subtle)] flex items-center justify-center font-serif text-[10px] font-bold text-[var(--gold-accent)] shrink-0 overflow-hidden">
                            {tgtPhil?.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={getAssetUrl(tgtPhil.imageUrl)}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              getNodeMonogram(tgtName)
                            )}
                          </div>
                        ) : (
                          <div className="w-7 h-7 flex items-center justify-center shrink-0">
                            <div className="w-5 h-5 rotate-45 rounded-[3px] border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center">
                              <span className="-rotate-45 text-[8px] text-emerald-500 font-bold">✦</span>
                            </div>
                          </div>
                        )}

                        <span className="text-sm font-bold text-[var(--text-main)] group-hover:text-[var(--gold-accent)] transition truncate">
                          {tgtName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${edgeConfig.badgeClass}`}
                        >
                          {edge.type}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-main)] text-[9px] text-[var(--text-muted)] font-mono">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span>{consensusLabel}</span>
                        </span>
                      </div>
                    </div>

                    {/* Edge Label & Description */}
                    <div className="space-y-1">
                      <h2 className="text-base font-serif font-bold text-[var(--text-main)] leading-snug">
                        {edge.label}
                      </h2>
                      {edge.description && (
                        <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                          {edge.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-main)]/60 flex items-center justify-between text-xs font-sans">
                    <span className="text-[11px] font-mono text-[var(--text-dim)]">
                      {edge.citations?.length || 0} Primary & Academic Sources
                    </span>
                    <span className="inline-flex items-center gap-1 text-[var(--gold-accent)] group-hover:underline font-semibold">
                      <span>Examine Lineage</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
