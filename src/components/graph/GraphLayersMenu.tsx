'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Layers, Check, Globe, Compass, Brain, Users, Sparkles } from 'lucide-react';
import {
  Branch,
  DomainId,
  BRANCH_METAS,
  DOMAINS,
  getBranchesForDomain,
} from '../../lib/types';
import { useClickOutside } from '../../lib/hooks/useClickOutside';

export interface GraphLayersMenuProps {
  showConcepts: boolean;
  onToggleConcepts: () => void;
  selectedBranch: Branch | 'all';
  onSelectBranch: (branch: Branch | 'all') => void;
  selectedDomain?: DomainId | 'all';
  onSelectDomain?: (domain: DomainId | 'all') => void;
  interdisciplinaryOnly?: boolean;
  onToggleInterdisciplinaryOnly?: () => void;
  branches?: Array<{ id: Branch | 'all'; label: string }>;
  spacingMultiplier: number;
  onSetSpacingMultiplier: (spacing: number) => void;
  isConceptSpotlighted?: boolean;
  focusedConceptTitle?: string;
}

export function GraphLayersMenu({
  showConcepts,
  onToggleConcepts,
  selectedBranch,
  onSelectBranch,
  selectedDomain = 'all',
  onSelectDomain,
  interdisciplinaryOnly = false,
  onToggleInterdisciplinaryOnly,
  branches,
  spacingMultiplier,
  onSetSpacingMultiplier,
  isConceptSpotlighted = false,
  focusedConceptTitle,
}: GraphLayersMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsOpen(false), isOpen);

  // Compute available branches based on active discipline filter
  const domainFilteredBranches = useMemo(() => {
    if (selectedDomain && selectedDomain !== 'all') {
      return getBranchesForDomain(selectedDomain);
    }
    return BRANCH_METAS;
  }, [selectedDomain]);

  const activeBranchLabel =
    selectedBranch !== 'all'
      ? BRANCH_METAS.find((b) => b.id === selectedBranch)?.label ||
        branches?.find((b) => b.id === selectedBranch)?.label ||
        selectedBranch
      : null;

  const activeDomainMeta =
    selectedDomain && selectedDomain !== 'all'
      ? DOMAINS.find((d) => d.id === selectedDomain)
      : null;

  const triggerLabel = activeBranchLabel
    ? activeBranchLabel
    : activeDomainMeta
    ? activeDomainMeta.name
    : interdisciplinaryOnly
    ? 'Bridges'
    : 'Layers & Branches';

  const hasActiveFilter =
    selectedBranch !== 'all' ||
    showConcepts ||
    (selectedDomain && selectedDomain !== 'all') ||
    Boolean(interdisciplinaryOnly);

  const domainGroups: Array<{ domain: DomainId; label: string }> = [
    { domain: 'philosophy', label: 'Philosophy' },
    { domain: 'psychology', label: 'Psychology' },
    { domain: 'sociology', label: 'Sociology' },
  ];

  return (
    <div className="relative font-serif" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-md transition shadow-sm ${
          hasActiveFilter
            ? 'bg-[var(--gold-bg)] text-[var(--gold-accent)] border-[var(--gold-border)]'
            : 'bg-[var(--bg-card)]/90 text-[var(--text-muted)] border-[var(--border-main)] hover:text-[var(--text-main)] hover:border-[var(--gold-border)]'
        }`}
        title="Constellation Layers: Toggle concepts, filter disciplines & branches, and adjust density"
      >
        <Layers className="w-3.5 h-3.5 text-[var(--gold-accent)] shrink-0" />
        <span className="truncate max-w-[130px] sm:max-w-[160px]">{triggerLabel}</span>
        {showConcepts && (
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-accent)] shrink-0" title="Concepts visible" />
        )}
        {!showConcepts && isConceptSpotlighted && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#52b788] shrink-0" title={`Spotlight: ${focusedConceptTitle || 'Concept'}`} />
        )}
        <span className="text-[10px] text-[var(--text-dim)] ml-0.5 shrink-0">▾</span>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 sm:w-80 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl p-3 text-[var(--text-main)] font-serif backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--gold-accent)] px-2 pb-2 mb-2 border-b border-[var(--border-main)] flex items-center justify-between">
            <span>Layers & Viewing Controls</span>
          </div>

          {/* Section 1: Disciplinary Domain */}
          {onSelectDomain && (
            <div className="mb-3">
              <div className="text-[10px] font-semibold text-[var(--text-dim)] px-2 mb-1.5 uppercase font-mono tracking-wider">
                Disciplinary Domain
              </div>
              <div className="grid grid-cols-2 gap-1 px-1">
                <button
                  onClick={() => onSelectDomain('all')}
                  className={`px-2 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition ${
                    selectedDomain === 'all' && !interdisciplinaryOnly
                      ? 'bg-[var(--gold-bg)] text-[var(--gold-accent)] font-semibold border border-[var(--gold-border)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">All Disciplines</span>
                </button>
                <button
                  onClick={() => onSelectDomain('philosophy')}
                  className={`px-2 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition ${
                    selectedDomain === 'philosophy'
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/30'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">Philosophy</span>
                </button>
                <button
                  onClick={() => onSelectDomain('psychology')}
                  className={`px-2 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition ${
                    selectedDomain === 'psychology'
                      ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 font-semibold border border-teal-500/30'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span className="truncate">Psychology</span>
                </button>
                <button
                  onClick={() => onSelectDomain('sociology')}
                  className={`px-2 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition ${
                    selectedDomain === 'sociology'
                      ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/30'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span className="truncate">Sociology</span>
                </button>
              </div>

              {onToggleInterdisciplinaryOnly && (
                <div className="mt-1 px-1">
                  <button
                    onClick={onToggleInterdisciplinaryOnly}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                      interdisciplinaryOnly
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/40'
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]'
                    }`}
                    title="Filter to thinkers whose work bridges across multiple disciplines"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Interdisciplinary Bridges</span>
                    </div>
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                        interdisciplinaryOnly
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'border-[var(--border-strong)]'
                      }`}
                    >
                      {interdisciplinaryOnly && '✓'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Section 2: Network Elements */}
          <div className="mb-3 pt-2 border-t border-[var(--border-main)]">
            <div className="text-[10px] font-semibold text-[var(--text-dim)] px-2 mb-1 uppercase font-mono tracking-wider">
              Network Elements
            </div>
            <button
              onClick={onToggleConcepts}
              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                showConcepts
                  ? 'bg-[var(--gold-bg)] text-[var(--gold-accent)] border border-[var(--gold-border)] font-semibold'
                  : isConceptSpotlighted
                  ? 'bg-[#52b788]/10 text-[#52b788] border border-[#52b788]/25'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">✦</span>
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    <span>Landmark Concepts</span>
                    {!showConcepts && isConceptSpotlighted && (
                      <span className="text-[9px] font-mono px-1 py-0.2 bg-[#52b788]/20 text-[#52b788] rounded">
                        Spotlight
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[var(--text-dim)]">
                    {showConcepts
                      ? 'Diamond nodes visible'
                      : isConceptSpotlighted
                      ? `Spotlight active: ${focusedConceptTitle ? `"${focusedConceptTitle}"` : '1 visible'} • Click to show all`
                      : 'Hidden (Thinkers only)'}
                  </div>
                </div>
              </div>
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                  showConcepts
                    ? 'bg-[var(--gold-accent)] text-[var(--bg-card)] border-[var(--gold-accent)]'
                    : isConceptSpotlighted
                    ? 'border-[#52b788]/40 text-[#52b788]'
                    : 'border-[var(--border-strong)]'
                }`}
              >
                {showConcepts ? '✓' : isConceptSpotlighted ? '◆' : null}
              </span>
            </button>
          </div>

          {/* Section 3: Branch Focus (Filtered by selected discipline) */}
          <div className="mb-3 pt-2 border-t border-[var(--border-main)]">
            <div className="text-[10px] font-semibold text-[var(--text-dim)] px-2 mb-1.5 uppercase font-mono tracking-wider flex items-center justify-between">
              <span>
                {activeDomainMeta
                  ? `${activeDomainMeta.name} Branches`
                  : 'Branch Focus'}
              </span>
              {selectedBranch !== 'all' && (
                <button
                  onClick={() => onSelectBranch('all')}
                  className="text-[10px] text-[var(--gold-accent)] hover:underline capitalize font-serif"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-0.5 max-h-44 overflow-y-auto pr-1">
              {/* All Branches option */}
              <button
                onClick={() => onSelectBranch('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                  selectedBranch === 'all'
                    ? 'bg-[var(--gold-bg)] text-[var(--gold-accent)] font-semibold border border-[var(--gold-border)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]'
                }`}
              >
                <span className="truncate">
                  {activeDomainMeta
                    ? `All ${activeDomainMeta.name} Branches`
                    : 'All Branches'}
                </span>
                {selectedBranch === 'all' && (
                  <Check className="w-3.5 h-3.5 text-[var(--gold-accent)] shrink-0 ml-1" />
                )}
              </button>

              {/* Grouped view when All Disciplines is selected */}
              {(!selectedDomain || selectedDomain === 'all') ? (
                domainGroups.map((grp) => {
                  const grpBranches = domainFilteredBranches.filter((b) => b.domain === grp.domain);
                  if (grpBranches.length === 0) return null;
                  return (
                    <div key={grp.domain} className="pt-1.5">
                      <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--text-dim)] px-2 pb-0.5">
                        {grp.label}
                      </div>
                      {grpBranches.map((b) => {
                        const isSelected = selectedBranch === b.id;
                        return (
                          <button
                            key={b.id}
                            onClick={() => onSelectBranch(b.id)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                              isSelected
                                ? 'bg-[var(--gold-bg)] text-[var(--gold-accent)] font-semibold border border-[var(--gold-border)]'
                                : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]'
                            }`}
                          >
                            <span className="truncate">{b.label}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[var(--gold-accent)] shrink-0 ml-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                /* Filtered flat view when a specific discipline is selected */
                domainFilteredBranches.map((b) => {
                  const isSelected = selectedBranch === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => onSelectBranch(b.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-[var(--gold-bg)] text-[var(--gold-accent)] font-semibold border border-[var(--gold-border)]'
                          : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      <span className="truncate">{b.label}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[var(--gold-accent)] shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 4: Graph Density & Spacing */}
          <div className="pt-2 border-t border-[var(--border-main)]">
            <div className="text-[10px] font-semibold text-[var(--text-dim)] px-2 mb-1.5 uppercase font-mono tracking-wider flex items-center justify-between">
              <span>Constellation Spread</span>
              <span className="font-mono text-[10px] text-[var(--gold-accent)]">
                {spacingMultiplier.toFixed(1)}x
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 px-1">
              {[
                { val: 1.4, label: 'Compact' },
                { val: 1.9, label: 'Balanced' },
                { val: 2.4, label: 'Spacious' },
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => onSetSpacingMultiplier(s.val)}
                  className={`py-1 px-2 rounded-lg text-[11px] font-serif transition text-center ${
                    Math.abs(spacingMultiplier - s.val) < 0.1
                      ? 'bg-[var(--gold-bg)] text-[var(--gold-accent)] font-semibold border border-[var(--gold-border)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
