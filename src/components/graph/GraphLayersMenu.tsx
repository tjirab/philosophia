'use client';

import React, { useState, useRef } from 'react';
import { Layers, Check } from 'lucide-react';
import { Branch } from '../../lib/types';
import { useClickOutside } from '../../lib/hooks/useClickOutside';

interface GraphLayersMenuProps {
  showConcepts: boolean;
  onToggleConcepts: () => void;
  selectedBranch: Branch | 'all';
  onSelectBranch: (branch: Branch | 'all') => void;
  branches?: Array<{ id: Branch | 'all'; label: string }>;
  spacingMultiplier: number;
  onSetSpacingMultiplier: (spacing: number) => void;
}

const DEFAULT_BRANCHES: Array<{ id: Branch | 'all'; label: string }> = [
  { id: 'all', label: 'All Branches' },
  { id: 'epistemology', label: 'Epistemology' },
  { id: 'metaphysics', label: 'Metaphysics' },
  { id: 'ethics', label: 'Ethics' },
  { id: 'political', label: 'Political Philosophy' },
  { id: 'mind', label: 'Philosophy of Mind' },
  { id: 'logic', label: 'Logic & Language' },
];

export function GraphLayersMenu({
  showConcepts,
  onToggleConcepts,
  selectedBranch,
  onSelectBranch,
  branches = DEFAULT_BRANCHES,
  spacingMultiplier,
  onSetSpacingMultiplier,
}: GraphLayersMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsOpen(false), isOpen);

  const activeBranchLabel = branches.find((b) => b.id === selectedBranch)?.label || 'All Branches';
  const hasActiveFilter = selectedBranch !== 'all' || showConcepts;

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
        title="Constellation Layers: Toggle concepts, filter philosophical branches, and adjust density"
      >
        <Layers className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
        <span>
          {selectedBranch !== 'all' ? activeBranchLabel : 'Layers & Branches'}
        </span>
        {showConcepts && (
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-accent)]" title="Concepts visible" />
        )}
        <span className="text-[10px] text-[var(--text-dim)] ml-0.5">▾</span>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 sm:w-80 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl p-3 text-[var(--text-main)] font-serif backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--gold-accent)] px-2 pb-2 mb-2 border-b border-[var(--border-main)] flex items-center justify-between">
            <span>Layers & Viewing Controls</span>
          </div>

          {/* Section 1: Network Elements */}
          <div className="mb-3">
            <div className="text-[10px] font-semibold text-[var(--text-dim)] px-2 mb-1 uppercase font-mono tracking-wider">
              Network Elements
            </div>
            <button
              onClick={onToggleConcepts}
              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                showConcepts
                  ? 'bg-[var(--gold-bg)] text-[var(--gold-accent)] border border-[var(--gold-border)] font-semibold'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">✦</span>
                <div>
                  <div className="font-semibold">Landmark Concepts</div>
                  <div className="text-[10px] text-[var(--text-dim)]">
                    {showConcepts ? 'Diamond nodes visible' : 'Hidden (Thinkers only)'}
                  </div>
                </div>
              </div>
              <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                showConcepts ? 'bg-[var(--gold-accent)] text-[var(--bg-card)] border-[var(--gold-accent)]' : 'border-[var(--border-strong)]'
              }`}>
                {showConcepts && '✓'}
              </span>
            </button>
          </div>

          {/* Section 2: Branch / Subdiscipline Focus */}
          <div className="mb-3">
            <div className="text-[10px] font-semibold text-[var(--text-dim)] px-2 mb-1 uppercase font-mono tracking-wider">
              Branch & Discipline Focus
            </div>
            <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
              {branches.map((b) => {
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
                    {isSelected && <Check className="w-3.5 h-3.5 text-[var(--gold-accent)] shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Graph Density & Spacing */}
          <div className="pt-2 border-t border-[var(--border-main)]">
            <div className="text-[10px] font-semibold text-[var(--text-dim)] px-2 mb-1.5 uppercase font-mono tracking-wider flex items-center justify-between">
              <span>Constellation Spread</span>
              <span className="font-mono text-[10px] text-[var(--gold-accent)]">{spacingMultiplier.toFixed(1)}x</span>
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
