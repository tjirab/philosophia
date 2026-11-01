'use client';

import React from 'react';
import { X, Compass } from 'lucide-react';
import { eras } from '../../lib/graph/graph-service';
import { getEdgeTypeConfig } from '../../lib/types';

interface GraphLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GraphLegendModal({ isOpen, onClose }: GraphLegendModalProps) {
  if (!isOpen) return null;

  const edgeTypes = [
    {
      type: 'INFLUENCED',
      color: '#3b82f6',
      label: 'Intellectual Influence & Mentorship',
      description: 'Foundational reading, direct pedagogical mentorship, or acknowledged philosophical lineage.',
    },
    {
      type: 'CRITIQUED',
      color: '#ef4444',
      label: 'Critique, Refutation & Paradigm Break',
      description: 'Direct dialectical rebuttal or rejection of a predecessor’s axioms (e.g., Hume awakened Kant; Nietzsche critiqued Kant).',
    },
    {
      type: 'DEVELOPED',
      color: '#0d9488',
      label: 'Extension & Systematization',
      description: 'Advanced, expanded, or formalized an existing line of thought (e.g., Heidegger extending Husserlian phenomenology).',
    },
    {
      type: 'SYNTHESIZED',
      color: '#9333ea',
      label: 'Synthetic Integration',
      description: 'Merged previously incompatible or disparate traditions (e.g., Schopenhauer synthesizing Kantian Idealism with Buddhism).',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-[var(--text-main)] font-serif">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-card)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--gold-bg)] text-[var(--gold-accent)] rounded-xl border border-[var(--gold-border)]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[var(--text-main)] tracking-wide">
                Folio Key & Graph Cartography
              </h3>
              <p className="text-xs text-[var(--text-dim)] font-serif">
                Understanding the colors, glyphs, and relations of the philosophical constellation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-dim)] hover:text-[var(--text-main)] rounded-lg hover:bg-[var(--bg-hover)] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 font-serif">
          {/* Section 1: Node Colors & Eras */}
          <div>
            <div className="text-xs uppercase tracking-widest text-[var(--gold-accent)] font-semibold mb-3 flex items-center gap-2">
              <span>✦</span> Node Colors: Chronological Epochs
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
              Every philosopher and conceptual movement is tinted according to their foundational historical era:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {eras.map((era) => (
                <div
                  key={era.id}
                  className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] flex items-center gap-3"
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 shadow-sm border border-white/20"
                    style={{ backgroundColor: era.color }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[var(--text-main)] truncate">
                      {era.name}
                    </div>
                    <div className="text-[10px] text-[var(--text-dim)] font-mono">
                      {era.startYear < 0 ? `${Math.abs(era.startYear)} BCE` : `${era.startYear} CE`} –{' '}
                      {era.endYear < 0 ? `${Math.abs(era.endYear)} BCE` : `${era.endYear} CE`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Node Geometry & Sizing */}
          <div className="pt-2 border-t border-[var(--border-main)]">
            <div className="text-xs uppercase tracking-widest text-[var(--gold-accent)] font-semibold mb-3 flex items-center gap-2">
              <span>✦</span> Node Geometry & Scale
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border-main)] rounded-xl flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#f4a261] border border-white/40 flex items-center justify-center text-[10px] font-bold text-slate-900 shrink-0 mt-0.5">
                  ◯
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-main)]">
                    Philosophers & Thinkers
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                    Represented by circular portrait badges. Larger circles indicate higher historical degree centrality (interconnection density across eras).
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border-main)] rounded-xl flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-[#2a9d8f] border border-white/40 flex items-center justify-center text-[10px] font-bold text-slate-900 shrink-0 mt-0.5 rotate-45">
                  ⬨
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-main)]">
                    Concepts & Paradigm Shifts
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                    Represented by geometric diamond tablets (e.g. <em>Theory of Forms, Noumena, Will to Power</em>), linked to the thinker who introduced them.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Directed Edge Relations */}
          <div className="pt-2 border-t border-[var(--border-main)]">
            <div className="text-xs uppercase tracking-widest text-[var(--gold-accent)] font-semibold mb-3 flex items-center gap-2">
              <span>✦</span> Relationship Edges & Connectors
            </div>
            <div className="space-y-2">
              {edgeTypes.map((et) => (
                <div
                  key={et.type}
                  className="p-3 bg-[var(--bg-subtle)] border border-[var(--border-main)] rounded-xl flex items-start gap-3"
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 mt-1"
                    style={{ backgroundColor: et.color }}
                  />
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-2">
                      <span>{et.label}</span>
                      <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${getEdgeTypeConfig(et.type).badgeClass}`}>
                        {et.type}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                      {et.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Exploration Cartography & Terra Incognita */}
          <div className="pt-2 border-t border-[var(--border-main)]">
            <div className="text-xs uppercase tracking-widest text-[var(--gold-accent)] font-semibold mb-3 flex items-center gap-2">
              <span>✦</span> Cartography of Thought: Terra Incognita & Research Depth
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
              When toggled into <strong>Terra Incognita</strong> mode, the graph reveals well-charted canonical citadels vs. less explored or marginalized frontiers:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                  <span>🏛️</span>
                  <span>Canonical Citadels (82–100)</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Centuries of scholarship, thousands of published treatises, and foundational Western canon. Bathed in radiant golden halos.
                </p>
              </div>

              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                <div className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 mb-1">
                  <span>⚔️</span>
                  <span>Disputed Frontiers (60–81)</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Intensely contested intellectual battlegrounds with competing paradigms (e.g. Philosophy of Mind, Free Will).
                </p>
              </div>

              <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl">
                <div className="text-xs font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-1.5 mb-1">
                  <span>🧭</span>
                  <span>Pioneer Outposts (40–59)</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Rapidly expanding 20th–21st century inquiries interfacing with empirical sciences, computing, and social critique.
                </p>
              </div>

              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mb-1">
                  <span>🌫️</span>
                  <span>Terra Incognita (&lt; 40)</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Historically marginalized traditions (classical non-Western philosophies) or open unresolved conceptual voids. Marked with dashed compass rings and star glyphs (✦).
                </p>
              </div>
            </div>

            {/* Dynamic Lantern Spotlight Callout */}
            <div className="mt-3 p-3 bg-[var(--bg-subtle)] border border-[var(--gold-border)] rounded-xl flex items-start gap-2.5">
              <span className="text-base shrink-0">🕯️</span>
              <div className="text-[11px] leading-relaxed text-[var(--text-muted)]">
                <strong className="text-[var(--text-main)]">Dynamic Lantern Spotlight:</strong> As you move your mouse across the canvas in exploration mode, your cursor casts a circular torchlight dispel field (~240px radius) across the parchment, illuminating nearby nodes, halos, and beacons.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
