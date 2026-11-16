'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  X,
  Compass,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Philosopher, Era, Tradition } from '../../lib/types';
import { getAssetUrl } from '../../lib/assets';

interface ThinkersCatalogViewProps {
  initialThinkers: Philosopher[];
  eras: Era[];
  traditions: Tradition[];
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

export function ThinkersCatalogView({
  initialThinkers,
  eras,
  traditions,
}: ThinkersCatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'chronological' | 'importance' | 'name'>('chronological');

  const eraMap = useMemo(() => new Map(eras.map((e) => [e.id, e])), [eras]);
  const traditionMap = useMemo(() => new Map(traditions.map((t) => [t.id, t])), [traditions]);

  const filteredThinkers = useMemo(() => {
    return initialThinkers
      .filter((p) => {
        // Domain filter
        if (selectedDomain !== 'all') {
          if (!p.domains?.includes(selectedDomain as any)) {
            return false;
          }
        }
        // Era filter
        if (selectedEra !== 'all' && p.eraId !== selectedEra) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBio = (p.shortBio || '').toLowerCase().includes(q);
          const matchQuestion = (p.centralQuestion || '').toLowerCase().includes(q);
          const tradition = traditionMap.get(p.traditionId);
          const matchTradition = (tradition?.name || '').toLowerCase().includes(q);
          return matchName || matchBio || matchQuestion || matchTradition;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'chronological') {
          return (a.birthYear ?? 0) - (b.birthYear ?? 0);
        }
        if (sortBy === 'importance') {
          return (b.importanceScore ?? 50) - (a.importanceScore ?? 50);
        }
        return a.name.localeCompare(b.name);
      });
  }, [initialThinkers, searchQuery, selectedDomain, selectedEra, sortBy, traditionMap]);

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
              Roster of Thinkers
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
            Thinkers
          </span>
        </div>

        {/* Hero Banner */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-main)] text-xs text-[var(--gold-accent)] font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Canonical Intellectual Roster</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-main)] font-serif">
            Thinkers of the Constellation
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-3xl leading-relaxed italic">
            Chronological and topological directory of philosophers, psychologists, and sociologists
            whose dialectical trajectories shaped human thought from Antiquity to Modernity.
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
                placeholder="Search by thinker name, core question, or philosophical tradition..."
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

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-[var(--text-dim)] uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-main)] rounded-xl text-xs font-sans text-[var(--text-main)] focus:outline-none focus:border-[var(--gold-accent)] cursor-pointer"
              >
                <option value="chronological">Chronological (Oldest First)</option>
                <option value="importance">Centrality / Importance</option>
                <option value="name">Alphabetical (A–Z)</option>
              </select>
            </div>
          </div>

          {/* Domain & Era Pills */}
          <div className="pt-3 border-t border-[var(--border-main)]/60 flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono text-[var(--text-dim)] uppercase mr-1">Domain:</span>
              {(['all', 'philosophy', 'psychology', 'sociology'] as const).map((dom) => (
                <button
                  key={dom}
                  onClick={() => setSelectedDomain(dom)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                    selectedDomain === dom
                      ? 'bg-[var(--gold-accent)] text-stone-900 font-bold shadow-xs'
                      : 'bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] border border-[var(--border-main)]'
                  }`}
                >
                  {dom.charAt(0).toUpperCase() + dom.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[var(--text-dim)] uppercase">Era:</span>
              <select
                value={selectedEra}
                onChange={(e) => setSelectedEra(e.target.value)}
                className="px-2.5 py-1 bg-[var(--bg-subtle)] border border-[var(--border-main)] rounded-lg text-xs text-[var(--text-main)] focus:outline-none cursor-pointer"
              >
                <option value="all">All Historical Eras</option>
                {eras.map((era) => (
                  <option key={era.id} value={era.id}>
                    {era.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs font-mono text-[var(--text-dim)]">
          <span>
            Displaying {filteredThinkers.length} of {initialThinkers.length} canonical thinkers
          </span>
          {(searchQuery || selectedDomain !== 'all' || selectedEra !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDomain('all');
                setSelectedEra('all');
                setSortBy('chronological');
              }}
              className="text-[var(--gold-accent)] hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Thinkers Grid */}
        {filteredThinkers.length === 0 ? (
          <div className="p-12 text-center bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl space-y-3">
            <p className="text-base text-[var(--text-muted)] italic">
              No thinkers found matching &ldquo;{searchQuery}&rdquo; within the selected filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDomain('all');
                setSelectedEra('all');
              }}
              className="px-4 py-2 bg-[var(--gold-accent)] text-stone-900 rounded-xl text-xs font-bold font-sans hover:brightness-110 transition cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredThinkers.map((thinker) => {
              const era = eraMap.get(thinker.eraId);
              const tradition = traditionMap.get(thinker.traditionId);

              return (
                <Link
                  key={thinker.id}
                  href={`/thinker/${thinker.id}`}
                  className="p-5 bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--gold-border)] rounded-2xl transition group flex flex-col justify-between shadow-xs hover:shadow-md space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      {/* Portrait / Monogram Medallion */}
                      <div
                        className="w-14 h-14 rounded-full border-2 overflow-hidden flex items-center justify-center font-serif text-lg font-bold shrink-0 bg-[var(--bg-subtle)] shadow-xs group-hover:scale-105 transition"
                        style={{
                          borderColor: tradition?.color || era?.color || 'var(--gold-accent)',
                          backgroundColor: `${tradition?.color || era?.color || '#3b82f6'}22`,
                          color: tradition?.color || era?.color || '#3b82f6',
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
                          getNodeMonogram(thinker.name)
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {era && (
                            <span
                              className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full text-white font-semibold"
                              style={{ backgroundColor: era.color }}
                            >
                              {era.name}
                            </span>
                          )}
                          {thinker.domains?.map((d) => (
                            <span
                              key={d}
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border font-semibold ${
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

                        <h2 className="text-lg font-bold text-[var(--text-main)] group-hover:text-[var(--gold-accent)] transition mt-1 truncate">
                          {thinker.name}
                        </h2>

                        <div className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-[var(--gold-accent)] shrink-0" />
                          <span>{formatLifespan(thinker.birthYear, thinker.deathYear)}</span>
                        </div>
                      </div>
                    </div>

                    {tradition && (
                      <div className="inline-block text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--border-main)] bg-[var(--bg-subtle)] text-[var(--text-dim)]">
                        {tradition.name}
                      </div>
                    )}

                    {thinker.centralQuestion && (
                      <p className="text-xs text-[var(--text-muted)] italic line-clamp-2 leading-relaxed">
                        &ldquo;{thinker.centralQuestion}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[var(--border-main)]/60 flex items-center justify-between text-xs font-sans">
                    <span className="text-[11px] font-mono text-[var(--text-dim)]">
                      Centrality: {thinker.importanceScore}/100
                    </span>
                    <span className="inline-flex items-center gap-1 text-[var(--gold-accent)] group-hover:underline font-semibold">
                      <span>Examine Folio</span>
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
