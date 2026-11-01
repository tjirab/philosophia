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
  BookOpen,
  Check,
} from 'lucide-react';
import {
  ExplorationState,
  VisualNode,
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

const TERRAIN_ITEMS: Array<{
  id: ExplorationState | 'all';
  label: string;
  badgeIcon: string;
  colorClass: string;
}> = [
  { id: 'all', label: 'All Terrain', badgeIcon: '✦', colorClass: 'text-[var(--gold-accent)]' },
  { id: 'citadel', label: 'Canonical Citadels', badgeIcon: '🏛️', colorClass: 'text-amber-600 dark:text-amber-400' },
  { id: 'frontier', label: 'Contested Frontiers', badgeIcon: '⚔️', colorClass: 'text-rose-600 dark:text-rose-400' },
  { id: 'emerging', label: 'Pioneer Outposts', badgeIcon: '🧭', colorClass: 'text-teal-600 dark:text-teal-400' },
  { id: 'uncharted', label: 'Terra Incognita', badgeIcon: '🌫️', colorClass: 'text-indigo-600 dark:text-indigo-400' },
];

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAlmanacOpen, setIsAlmanacOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const almanacRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsMenuOpen(false), isMenuOpen);
  useClickOutside(almanacRef, () => setIsAlmanacOpen(false), isAlmanacOpen);
  useClickOutside(helpRef, () => setIsHelpOpen(false), isHelpOpen);

  const stats = getExplorationDistributionStats(nodes);
  const branchProfiles = getBranchExplorationProfiles();
  const currentMethodology = METHODOLOGY_CONFIG[methodology] || METHODOLOGY_CONFIG.canonical;

  const getTerrainCount = (id: ExplorationState | 'all') => {
    switch (id) {
      case 'all': return stats.total;
      case 'citadel': return stats.citadelCount;
      case 'frontier': return stats.frontierCount;
      case 'emerging': return stats.emergingCount;
      case 'uncharted': return stats.unchartedCount;
    }
  };

  const isCustomLens = isExplorationMode || methodology !== 'canonical' || explorationFilter !== 'all';

  return (
    <>
      {/* Consolidated Cartography Popover Trigger */}
      <div className="relative font-serif" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-md transition shadow-sm ${
            isCustomLens
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/35'
              : 'bg-[var(--bg-card)]/90 text-[var(--text-muted)] border-[var(--border-main)] hover:text-[var(--text-main)] hover:border-[var(--gold-border)]'
          }`}
          title="Atlas Cartography & Historiographical Methodology"
        >
          <Compass className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
          <span>
            {isExplorationMode
              ? explorationFilter === 'all'
                ? 'Terra Incognita'
                : `Atlas: ${TERRAIN_ITEMS.find((t) => t.id === explorationFilter)?.label.split(' ')[0]}`
              : 'Cartography & Lens'}
          </span>
          {methodology !== 'canonical' && (
            <span className="text-[10px] font-mono opacity-80">({currentMethodology.shortLabel})</span>
          )}
          <span className="text-[10px] text-[var(--text-dim)] ml-0.5">▾</span>
        </button>

        {/* Unified Popover */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 mt-2 z-50 w-80 sm:w-88 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl p-3.5 text-[var(--text-main)] font-serif backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[var(--border-main)]">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-[var(--gold-accent)]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                  Cartography & Methodology
                </span>
              </div>
              <button
                onClick={() => setIsHelpOpen(true)}
                className="text-[var(--text-dim)] hover:text-[var(--text-main)] p-0.5"
                title="Cartography Guide"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Section 1: Terra Incognita (Fog of War) Toggle */}
            <div className="mb-3">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)]">
                <div>
                  <div className="text-xs font-semibold text-[var(--text-main)]">
                    Terra Incognita (Fog of War)
                  </div>
                  <div className="text-[11px] text-[var(--text-dim)]">
                    Relief map of research depth & mist
                  </div>
                </div>
                <button
                  onClick={() => onToggleExplorationMode(!isExplorationMode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    isExplorationMode
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                      : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-main)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {isExplorationMode ? 'Active' : 'Off'}
                </button>
              </div>

              {/* Sub-filters when exploration mode is active */}
              {isExplorationMode && (
                <div className="mt-2 space-y-1 pl-1">
                  <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--text-dim)] mb-1">
                    Filter by Terrain Type
                  </div>
                  {TERRAIN_ITEMS.map((item) => {
                    const isSelected = explorationFilter === item.id;
                    const count = getTerrainCount(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelectExplorationFilter(item.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-[var(--gold-bg)] text-[var(--gold-accent)] font-semibold border border-[var(--gold-border)]'
                            : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>{item.badgeIcon}</span>
                          <span>{item.label}</span>
                        </span>
                        <span className="text-[10px] font-mono opacity-75">({count})</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2: Historiographical Methodology */}
            {onSelectMethodology && (
              <div className="mb-3 pt-2.5 border-t border-[var(--border-main)]">
                <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--text-dim)] mb-1.5 px-1">
                  Historiographical Lens
                </div>
                <div className="space-y-1">
                  {(Object.keys(METHODOLOGY_CONFIG) as ScoringMethodology[]).map((mId) => {
                    const m = METHODOLOGY_CONFIG[mId];
                    const isSelected = methodology === mId;
                    return (
                      <button
                        key={mId}
                        onClick={() => onSelectMethodology(mId)}
                        className={`w-full text-left p-2 rounded-xl text-xs transition flex items-start gap-2 ${
                          isSelected
                            ? 'bg-[var(--gold-bg)] text-[var(--gold-accent)] border border-[var(--gold-border)] font-semibold'
                            : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        <span className="text-sm shrink-0 mt-0.5">{m.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[var(--text-main)]">{m.name}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[var(--gold-accent)] shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-[var(--text-dim)] leading-tight mt-0.5">
                            {m.tagline}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 3: Scholarly Instruments & Actions */}
            <div className="pt-2.5 border-t border-[var(--border-main)] flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsAlmanacOpen(true);
                }}
                className="flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--gold-accent)] border border-[var(--border-main)] hover:border-[var(--gold-border)] flex items-center justify-center gap-1.5 transition"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Field Almanac</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsHelpOpen(true);
                }}
                className="py-1.5 px-2.5 rounded-xl text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] border border-[var(--border-main)] transition"
                title="Cartography Relief Guide"
              >
                Guide
              </button>
            </div>
          </div>
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
            className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl p-6 text-[var(--text-main)] font-serif max-h-[85vh] overflow-y-auto"
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

              {/* Lantern Spotlight Callout */}
              <div className="p-3 rounded-xl border border-[var(--gold-border)] bg-[var(--gold-bg)] text-[var(--text-main)]">
                <div className="font-bold text-[var(--gold-accent)] flex items-center gap-1.5 mb-1">
                  <span>🕯️</span>
                  <span>What is the circular halo around the cursor? (Lantern Spotlight)</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Moving your cursor across the canvas acts as an explorer’s torchlight. It casts an active
                  ~240px lantern dispel field over the parchment, revealing node halos and beacon glyphs as
                  you travel through history.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10">
                  <span className="font-bold text-amber-700 dark:text-amber-300">🏛️ Canonical Citadels (82–100):</span>
                  <p className="mt-0.5">
                    Regions with centuries of continuous scholarship, massive literature volumes, and foundational consensus
                    (e.g., Plato, Aristotle, Kant, Descartes). Bathed in warm golden hearth halos with fortified crenellated ramparts.
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
                    (e.g., AI ethics, cognitive science, philosophy of science). Marked with teal dashed rings.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300">🌫️ Terra Incognita (&lt; 40):</span>
                  <p className="mt-0.5">
                    Historically marginalized traditions (classical non-Western philosophies) or radical open conceptual voids
                    (e.g., Nagarjuna, Zhuangzi, Sunyata). Marked with antique dashed compass beacons and celestial star glyphs (✦).
                  </p>
                </div>
              </div>

              {/* Filtering & Interaction Tip */}
              <div className="pt-2 border-t border-[var(--border-main)] text-[11px] space-y-1">
                <p>
                  <strong>Terrain Filtering:</strong> Clicking quick pills above (e.g. <em>Citadels</em> or <em>Terra Incognita</em>)
                  filters the graph down to only nodes of that terrain class.
                </p>
                <p>
                  <strong>Field Almanac & Dossiers:</strong> Click <em>Field Almanac</em> in the HUD to view publication counts and
                  open research problems per philosophical branch, or click any node to read its quantified research depth in the dossier drawer.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
