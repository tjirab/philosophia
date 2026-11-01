'use client';

import React, { useState, useRef } from 'react';
import {
  Map,
  Compass,
  Sparkles,
  HelpCircle,
  X,
  ChevronDown,
  Layers,
  Flame,
  ShieldAlert,
  BookOpen,
} from 'lucide-react';
import {
  ExplorationState,
  VisualNode,
  BranchExplorationProfile,
  ScoringMethodology,
  METHODOLOGY_CONFIG,
} from '../../lib/types';
import {
  getExplorationDistributionStats,
  getBranchExplorationProfiles,
  EXPLORATION_STATE_CONFIG,
} from '../../lib/graph/exploration-service';
import { useClickOutside } from '../../lib/hooks/useClickOutside';

interface ExplorationHudProps {
  nodes: VisualNode[];
  isExplorationMode: boolean;
  onToggleExplorationMode: (enabled: boolean) => void;
  explorationFilter: ExplorationState | 'all';
  onSelectExplorationFilter: (filter: ExplorationState | 'all') => void;
  onSelectBranch?: (branch: any) => void;
  methodology?: ScoringMethodology;
  onSelectMethodology?: (methodology: ScoringMethodology) => void;
}

export function ExplorationHud({
  nodes,
  isExplorationMode,
  onToggleExplorationMode,
  explorationFilter,
  onSelectExplorationFilter,
  onSelectBranch,
  methodology = 'canonical',
  onSelectMethodology,
}: ExplorationHudProps) {
  const [isAlmanacOpen, setIsAlmanacOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const almanacRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const methodologyRef = useRef<HTMLDivElement>(null);

  useClickOutside(almanacRef, () => setIsAlmanacOpen(false), isAlmanacOpen);
  useClickOutside(helpRef, () => setIsHelpOpen(false), isHelpOpen);
  useClickOutside(methodologyRef, () => setIsMethodologyOpen(false), isMethodologyOpen);

  const stats = getExplorationDistributionStats(nodes);
  const branchProfiles = getBranchExplorationProfiles();
  const currentMethodology = METHODOLOGY_CONFIG[methodology] || METHODOLOGY_CONFIG.canonical;

  return (
    <>
      {/* Floating HUD Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-main)] rounded-2xl shadow-xl font-serif text-xs">
        {/* Mode Toggle Button */}
        <button
          onClick={() => onToggleExplorationMode(!isExplorationMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition ${
            isExplorationMode
              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)]'
          }`}
          title="Toggle Age-of-Discovery Fog of War cartography and research depth halos"
        >
          <Map className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
          <span>{isExplorationMode ? 'Terra Incognita (Fog of War)' : 'Cartography of Thought'}</span>
        </button>

        {isExplorationMode && (
          <>
            <div className="w-px h-4 bg-[var(--border-main)] mx-0.5" />

            {/* Filter Pills */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSelectExplorationFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  explorationFilter === 'all'
                    ? 'bg-[var(--gold-bg)] text-[var(--gold-accent)] font-semibold border border-[var(--gold-border)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                All Terrain ({stats.total})
              </button>

              <button
                onClick={() => onSelectExplorationFilter('citadel')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                  explorationFilter === 'citadel'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/40'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)]'
                }`}
                title="Foundational, heavily researched citadels (e.g. Plato, Aristotle, Kant)"
              >
                <span>🏛️ Citadels</span>
                <span className="text-[10px] opacity-75 font-mono">({stats.citadelCount})</span>
              </button>

              <button
                onClick={() => onSelectExplorationFilter('frontier')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                  explorationFilter === 'frontier'
                    ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold border border-rose-500/40'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)]'
                }`}
                title="Active, fiercely contested dialectical battlegrounds (e.g. Free Will, Consciousness)"
              >
                <span>⚔️ Frontiers</span>
                <span className="text-[10px] opacity-75 font-mono">({stats.frontierCount})</span>
              </button>

              <button
                onClick={() => onSelectExplorationFilter('emerging')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                  explorationFilter === 'emerging'
                    ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 font-semibold border border-teal-500/40'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)]'
                }`}
                title="Modern pioneer outposts (e.g. Philosophy of Science, Cognitive Science)"
              >
                <span>🧭 Outposts</span>
                <span className="text-[10px] opacity-75 font-mono">({stats.emergingCount})</span>
              </button>

              <button
                onClick={() => onSelectExplorationFilter('uncharted')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                  explorationFilter === 'uncharted'
                    ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-500/40'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)]'
                }`}
                title="Marginalized non-Western traditions or open conceptual voids"
              >
                <span>🌫️ Terra Incognita</span>
                <span className="text-[10px] opacity-75 font-mono">({stats.unchartedCount})</span>
              </button>
            </div>

            <div className="w-px h-4 bg-[var(--border-main)] mx-0.5" />

            {/* Field Almanac Button */}
            <button
              onClick={() => setIsAlmanacOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-[var(--gold-accent)] hover:bg-[var(--bg-hover)] rounded-lg transition"
              title="Open the Field Almanac of Open Problems and Publication Volume"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Field Almanac</span>
            </button>

            {/* Methodology Switcher Dropdown */}
            {onSelectMethodology && (
              <div className="relative font-serif" ref={methodologyRef}>
                <button
                  onClick={() => setIsMethodologyOpen(!isMethodologyOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[var(--text-main)] hover:text-[var(--gold-accent)] hover:bg-[var(--bg-hover)] rounded-lg transition border border-[var(--border-main)] hover:border-[var(--gold-border)]"
                  title="Switch Historiographical Methodology: Canonical Consensus, Network PageRank, or Dialectical Controversy"
                >
                  <span>{currentMethodology.icon}</span>
                  <span className="font-semibold">{currentMethodology.shortLabel}</span>
                  <ChevronDown className="w-3 h-3 text-[var(--text-dim)]" />
                </button>

                {isMethodologyOpen && (
                  <div className="absolute top-full right-0 mt-2 z-50 w-80 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl p-2.5 text-[var(--text-main)] font-serif backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--gold-accent)] px-2.5 py-1 mb-1.5 border-b border-[var(--border-main)]">
                      Historiographical Methodology
                    </div>
                    {(Object.keys(METHODOLOGY_CONFIG) as ScoringMethodology[]).map((mId) => {
                      const m = METHODOLOGY_CONFIG[mId];
                      const isSelected = methodology === mId;
                      return (
                        <button
                          key={mId}
                          onClick={() => {
                            onSelectMethodology(mId);
                            setIsMethodologyOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition mb-1 flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-[var(--gold-bg)] text-[var(--gold-accent)] border border-[var(--gold-border)] font-semibold'
                              : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]'
                          }`}
                        >
                          <span className="text-base shrink-0 mt-0.5">{m.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[var(--text-main)]">{m.name}</span>
                              {isSelected && (
                                <span className="text-[10px] uppercase font-mono tracking-tight text-[var(--gold-accent)]">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">
                              {m.tagline}
                            </p>
                            <p className="text-[10px] text-[var(--text-dim)] font-mono mt-1">
                              Formula: {m.formula}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Info / Legend Button */}
            <button
              onClick={() => setIsHelpOpen(true)}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] rounded-lg transition"
              title="Cartography Guide: What is well-researched vs unexplored?"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Field Almanac Flyout Modal */}
      {isAlmanacOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            ref={almanacRef}
            className="w-full max-w-2xl max-h-[85vh] bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl p-6 text-[var(--text-main)] font-serif overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-[var(--gold-accent)]" />
                <h2 className="text-xl font-bold tracking-tight">The Field Almanac of Philosophical Inquiry</h2>
              </div>
              <button
                onClick={() => setIsAlmanacOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-[var(--text-muted)] mb-5 leading-relaxed">
              Human thought is not uniformly charted. While classical Western metaphysics and epistemological
              foundationalism represent fortified citadels with tens of thousands of commentaries, vast areas
              like non-Western logic, digital ontology, and the Hard Problem of Consciousness remain contested
              or largely uncharted waters.
            </p>

            <div className="space-y-4">
              {branchProfiles.map((branch) => {
                const cfg = EXPLORATION_STATE_CONFIG[branch.defaultState];
                return (
                  <div
                    key={branch.id}
                    className="p-4 rounded-xl border border-[var(--border-main)] bg-[var(--bg-subtle)] hover:border-[var(--border-strong)] transition"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-[var(--text-main)]">{branch.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${cfg.badgeClass}`}>
                            {cfg.badgeIcon} {cfg.label}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--text-dim)]">
                          ~{branch.estimatedPublications.toLocaleString()} academic works cataloged
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-[var(--gold-accent)]">
                          {branch.baseExplorationScore}/100
                        </span>
                        <div className="w-20 h-1.5 bg-[var(--border-main)] rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-[var(--gold-accent)] rounded-full"
                            style={{ width: `${branch.baseExplorationScore}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-xs space-y-1.5 my-2.5">
                      <p className="text-[var(--text-muted)]">
                        <strong className="text-[var(--text-main)]">Mapped Ground:</strong> {branch.exploredSummary}
                      </p>
                      <p className="text-[var(--text-muted)]">
                        <strong className="text-[var(--text-main)]">Frontier / Gaps:</strong> {branch.frontierSummary}
                      </p>
                    </div>

                    {branch.openProblems && branch.openProblems.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-[var(--border-main)]">
                        <span className="text-[10px] uppercase font-mono font-bold text-[var(--text-dim)] tracking-wider">
                          Key Open Problems:
                        </span>
                        <ul className="mt-1 space-y-1">
                          {branch.openProblems.map((prob, idx) => (
                            <li key={idx} className="text-xs text-[var(--gold-accent)] flex items-start gap-1.5">
                              <span className="opacity-60">•</span>
                              <span>{prob}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cartography Guide Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            ref={helpRef}
            className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl p-6 text-[var(--text-main)] font-serif"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-[var(--gold-accent)]" />
                <h3 className="text-lg font-bold">Cartography of Thought: Guide</h3>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-[var(--text-muted)]">
              <p>
                In the <strong>Terra Incognita</strong> exploration view, the canvas operates as an intellectual
                relief map. Thinkers and concepts are evaluated based on historical canonical density, dialectical
                controversy, and modern academic publication volume.
              </p>

              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10">
                  <span className="font-bold text-amber-700 dark:text-amber-300">🏛️ Canonical Citadels (82–100):</span>
                  <p className="mt-0.5">
                    Regions with centuries of continuous scholarship, massive literature volumes, and foundational consensus
                    (e.g., Plato, Aristotle, Kant, Descartes). Bathed in warm golden hearth halos.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10">
                  <span className="font-bold text-rose-700 dark:text-rose-300">⚔️ Disputed Frontiers (60–81):</span>
                  <p className="mt-0.5">
                    Fiercely contested territory with intense dialectical friction and unresolved rival paradigms
                    (e.g., Philosophy of Mind, Free Will, Post-Structuralism). Highlighted with crimson dialectical rings.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl border border-teal-500/30 bg-teal-500/10">
                  <span className="font-bold text-teal-700 dark:text-teal-300">🧭 Pioneer Outposts (40–59):</span>
                  <p className="mt-0.5">
                    Rapidly developing modern frontiers interfacing with empirical sciences, computing, and social changes
                    (e.g., AI ethics, cognitive science, philosophy of science).
                  </p>
                </div>

                <div className="p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300">🌫️ Terra Incognita (&lt; 40):</span>
                  <p className="mt-0.5">
                    Historically marginalized traditions (classical non-Western philosophies) or radical open conceptual voids.
                    Marked with antique dashed compass beacons (✦). Moving your cursor across them acts as a torchlight that dispels the mist.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
