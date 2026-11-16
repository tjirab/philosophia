'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  X,
  Compass,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Concept, Era, Philosopher } from '../../lib/types';

interface ConceptsCatalogViewProps {
  initialConcepts: Concept[];
  eras: Era[];
  philosophers: Philosopher[];
}

function formatBranchName(branch: string): string {
  return branch
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function ConceptsCatalogView({
  initialConcepts,
  eras,
  philosophers,
}: ConceptsCatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'branch'>('name');

  const eraMap = useMemo(() => new Map(eras.map((e) => [e.id, e])), [eras]);
  const philMap = useMemo(() => new Map(philosophers.map((p) => [p.id, p])), [philosophers]);

  const branches = useMemo(() => {
    const set = new Set<string>();
    for (const c of initialConcepts) {
      if (c.branch) set.add(c.branch);
    }
    return Array.from(set).sort();
  }, [initialConcepts]);

  const filteredConcepts = useMemo(() => {
    return initialConcepts
      .filter((c) => {
        // Branch filter
        if (selectedBranch !== 'all' && c.branch !== selectedBranch) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = c.title.toLowerCase().includes(q);
          const matchSummary = (c.summary || '').toLowerCase().includes(q);
          const matchBranch = (c.branch || '').toLowerCase().includes(q);
          const introPhil = c.introducedBy ? philMap.get(c.introducedBy) : null;
          const matchPhil = (introPhil?.name || '').toLowerCase().includes(q);
          return matchTitle || matchSummary || matchBranch || matchPhil;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'branch') {
          const bComp = (a.branch || '').localeCompare(b.branch || '');
          if (bComp !== 0) return bComp;
        }
        return a.title.localeCompare(b.title);
      });
  }, [initialConcepts, searchQuery, selectedBranch, sortBy, philMap]);

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
              Lexicon of Concepts
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
            Concepts
          </span>
        </div>

        {/* Hero Banner */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-main)] text-xs text-[var(--gold-accent)] font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Landmark Conceptual Formulations</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-main)] font-serif">
            Lexicon of Landmark Concepts
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-3xl leading-relaxed italic">
            Catalog of seminal philosophical concepts, paradigms, and conceptual departures
            mapped across ethics, metaphysics, epistemology, politics, and the philosophy of mind.
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
                placeholder="Search concepts by title, philosophical branch, formulating thinker..."
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
                <option value="name">Alphabetical (A–Z)</option>
                <option value="branch">By Philosophical Branch</option>
              </select>
            </div>
          </div>

          {/* Branch Filter Pills */}
          <div className="pt-3 border-t border-[var(--border-main)]/60 flex flex-wrap items-center gap-1.5 text-xs font-sans">
            <span className="text-[11px] font-mono text-[var(--text-dim)] uppercase mr-1">Branch:</span>
            <button
              onClick={() => setSelectedBranch('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                selectedBranch === 'all'
                  ? 'bg-[var(--gold-accent)] text-stone-900 font-bold shadow-xs'
                  : 'bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] border border-[var(--border-main)]'
              }`}
            >
              All Branches
            </button>
            {branches.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBranch(b)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                  selectedBranch === b
                    ? 'bg-[var(--gold-accent)] text-stone-900 font-bold shadow-xs'
                    : 'bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] border border-[var(--border-main)]'
                }`}
              >
                {formatBranchName(b)}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs font-mono text-[var(--text-dim)]">
          <span>
            Displaying {filteredConcepts.length} of {initialConcepts.length} landmark concepts
          </span>
          {(searchQuery || selectedBranch !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBranch('all');
                setSortBy('name');
              }}
              className="text-[var(--gold-accent)] hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Concepts Grid */}
        {filteredConcepts.length === 0 ? (
          <div className="p-12 text-center bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl space-y-3">
            <p className="text-base text-[var(--text-muted)] italic">
              No concepts found matching &ldquo;{searchQuery}&rdquo; within the selected branch.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBranch('all');
              }}
              className="px-4 py-2 bg-[var(--gold-accent)] text-stone-900 rounded-xl text-xs font-bold font-sans hover:brightness-110 transition cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConcepts.map((concept) => {
              const era = eraMap.get(concept.eraId);
              const formulatingPhil = concept.introducedBy ? philMap.get(concept.introducedBy) : null;

              return (
                <Link
                  key={concept.id}
                  href={`/concept/${concept.id}`}
                  className="p-5 bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--gold-border)] rounded-2xl transition group flex flex-col justify-between shadow-xs hover:shadow-md space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      {/* Geometric Diamond Tablet Emblem */}
                      <div className="w-12 h-12 flex items-center justify-center shrink-0">
                        <div
                          className="w-9 h-9 rotate-45 rounded-[6px] border-2 shadow-xs flex items-center justify-center bg-[var(--bg-subtle)] group-hover:scale-110 transition"
                          style={{
                            borderColor: era?.color || '#2a9d8f',
                            backgroundColor: `${era?.color || '#2a9d8f'}22`,
                            color: era?.color || '#2a9d8f',
                          }}
                        >
                          <span className="-rotate-45 text-sm font-bold select-none text-[var(--gold-accent)]">
                            ✦
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded border border-[var(--gold-border)] bg-[var(--bg-subtle)] text-[var(--gold-accent)] font-semibold">
                            ✦ {formatBranchName(concept.branch)}
                          </span>
                          {era && (
                            <span
                              className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full text-white font-semibold"
                              style={{ backgroundColor: era.color }}
                            >
                              {era.name}
                            </span>
                          )}
                        </div>

                        <h2 className="text-lg font-bold text-[var(--text-main)] group-hover:text-[var(--gold-accent)] transition mt-1.5 leading-snug">
                          {concept.title}
                        </h2>
                      </div>
                    </div>

                    {formulatingPhil && (
                      <div className="text-xs text-[var(--text-muted)] font-sans">
                        Introduced by{' '}
                        <span className="font-semibold text-[var(--text-main)]">
                          {formulatingPhil.name}
                        </span>
                      </div>
                    )}

                    {concept.summary && (
                      <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed font-serif">
                        {concept.summary}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[var(--border-main)]/60 flex items-center justify-between text-xs font-sans">
                    <span className="text-[11px] font-mono text-[var(--text-dim)] uppercase">
                      Dialectical Folio
                    </span>
                    <span className="inline-flex items-center gap-1 text-[var(--gold-accent)] group-hover:underline font-semibold">
                      <span>Examine Concept</span>
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
