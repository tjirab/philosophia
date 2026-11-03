'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, GitFork, ArrowRight, Sparkles, Check, BookOpen, ArrowRightLeft } from 'lucide-react';
import { Philosopher, Concept, Edge, getEdgeTypeConfig } from '../../lib/types';
import { findInfluencePath, PathResult } from '../../lib/graph/pathfinding';
import { useClickOutside } from '../../lib/hooks/useClickOutside';
import { NodeAutocomplete } from './NodeAutocomplete';

interface LineagePathModalProps {
  isOpen: boolean;
  onClose: () => void;
  philosophers: Philosopher[];
  concepts?: Concept[];
  edges: Edge[];
  initialStartId?: string;
  initialTargetId?: string;
  onHighlightPath: (pathNodes: string[]) => void;
}

export function LineagePathModal({
  isOpen,
  onClose,
  philosophers,
  concepts = [],
  edges,
  initialStartId,
  initialTargetId,
  onHighlightPath,
}: LineagePathModalProps) {
  const [startId, setStartId] = useState(initialStartId || 'plato');
  const [targetId, setTargetId] = useState(initialTargetId || 'arthur-schopenhauer');
  const [pathResult, setPathResult] = useState<PathResult | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);

  // Close modal when user clicks outside the modal card or hits Escape
  useClickOutside(modalRef, onClose, isOpen);

  // Sync state if initial IDs change or modal reopens
  useEffect(() => {
    if (isOpen) {
      if (initialStartId) setStartId(initialStartId);
      if (initialTargetId) setTargetId(initialTargetId);
    }
  }, [isOpen, initialStartId, initialTargetId]);

  if (!isOpen) return null;

  const handleCompute = () => {
    const result = findInfluencePath(startId, targetId, edges);
    setPathResult(result);
  };

  const handleSwap = () => {
    const nextStart = targetId;
    const nextTarget = startId;
    setStartId(nextStart);
    setTargetId(nextTarget);
    if (pathResult) {
      const res = findInfluencePath(nextStart, nextTarget, edges);
      setPathResult(res);
    }
  };

  const philMap = new Map(philosophers.map((p) => [p.id, p]));
  const concMap = new Map(concepts.map((c) => [c.id, c]));

  const presets = [
    { start: 'plato', target: 'arthur-schopenhauer', label: 'Plato → Schopenhauer (Forms to Will)' },
    { start: 'socrates', target: 'immanuel-kant', label: 'Socrates → Kant (Elenchus to Critical Reason)' },
    { start: 'rene-descartes', target: 'friedrich-nietzsche', label: 'Descartes → Nietzsche (Doubt to Will to Power)' },
    { start: 'aristotle', target: 'thomas-aquinas', label: 'Aristotle → Aquinas (Greek Teleology to Scholasticism)' },
    { start: 'rene-descartes', target: 'nick-bostrom', label: 'Descartes → Bostrom (Evil Demon to Simulation)' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-[var(--text-main)] font-serif"
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-card)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--gold-bg)] text-[var(--gold-accent)] rounded-xl border border-[var(--gold-border)]">
              <GitFork className="w-5 h-5 text-[var(--gold-accent)]" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[var(--text-main)] tracking-wide">
                Trace Lineage & Conceptual Route
              </h3>
              <p className="text-xs text-[var(--text-dim)]">
                Calculate the intellectual chain and transitional concepts connecting any two thinkers
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

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 min-h-[360px]">
          {/* Quick Presets */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--gold-accent)] mb-2">
              Canonical Intellectual Lineages
            </div>
            <div className="flex flex-wrap gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setStartId(p.start);
                    setTargetId(p.target);
                    const res = findInfluencePath(p.start, p.target, edges);
                    setPathResult(res);
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--gold-accent)] border border-[var(--border-main)] hover:border-[var(--gold-border)] transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-[var(--gold-accent)]" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Autocomplete Selectors */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--gold-accent)]">
                Dialectical Coordinates
              </span>
              <button
                type="button"
                onClick={handleSwap}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--gold-accent)] flex items-center gap-1.5 transition px-2.5 py-1 rounded-lg hover:bg-[var(--bg-subtle)] border border-transparent hover:border-[var(--border-main)]"
                title="Swap origin and destination"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
                <span>Swap Trajectory</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NodeAutocomplete
                label="Origin Thinker (Foundation)"
                placeholder="Search origin thinker or concept..."
                value={startId}
                onChange={(id) => {
                  setStartId(id);
                  setPathResult(null);
                }}
                philosophers={philosophers}
                concepts={concepts}
              />

              <NodeAutocomplete
                label="Destination Thinker (Successor)"
                placeholder="Search destination thinker or concept..."
                value={targetId}
                onChange={(id) => {
                  setTargetId(id);
                  setPathResult(null);
                }}
                philosophers={philosophers}
                concepts={concepts}
              />
            </div>
          </div>

          <button
            onClick={handleCompute}
            className="w-full py-2.5 bg-[var(--gold-bg)] hover:bg-[var(--bg-hover)] text-[var(--gold-accent)] border border-[var(--gold-border)] rounded-xl text-xs font-semibold tracking-wide transition shadow-sm flex items-center justify-center gap-2"
          >
            <GitFork className="w-4 h-4 text-[var(--gold-accent)]" />
            Calculate Intellectual Lineage
          </button>

          {/* Results Display */}
          {pathResult && (
            <div className="pt-4 border-t border-[var(--border-main)] space-y-4">
              {pathResult.found ? (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#52b788] font-semibold flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      Lineage Found: {pathResult.totalHops} {pathResult.totalHops === 1 ? 'Transition' : 'Transitions'}
                    </span>
                    <button
                      onClick={() => {
                        onHighlightPath(pathResult.nodes);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-[var(--gold-bg)] hover:bg-[var(--bg-hover)] text-[var(--gold-accent)] border border-[var(--gold-border)] rounded-lg text-xs font-semibold transition"
                    >
                      Highlight On Graph &rarr;
                    </button>
                  </div>

                  <div className="space-y-3">
                    {pathResult.steps.map((step, idx) => {
                      const fromPhil = philMap.get(step.fromNodeId);
                      const fromConc = concMap.get(step.fromNodeId);
                      const toPhil = philMap.get(step.toNodeId);
                      const toConc = concMap.get(step.toNodeId);

                      const fromName = fromPhil?.name || fromConc?.title || step.fromNodeId;
                      const toName = toPhil?.name || toConc?.title || step.toNodeId;

                      return (
                        <div
                          key={idx}
                          className="p-3.5 bg-[var(--bg-subtle)] border border-[var(--border-main)] rounded-xl flex items-start gap-3"
                        >
                          <div className="w-6 h-6 rounded-full bg-[var(--bg-card)] text-[var(--gold-accent)] border border-[var(--border-main)] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)] flex-wrap">
                              <span className="flex items-center gap-1.5">
                                <span>{fromName}</span>
                                {fromConc && (
                                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                    Concept
                                  </span>
                                )}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-[var(--gold-accent)] shrink-0" />
                              <span className="flex items-center gap-1.5">
                                <span>{toName}</span>
                                {toConc && (
                                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                    Concept
                                  </span>
                                )}
                              </span>
                              <span
                                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getEdgeTypeConfig(step.edge.type).badgeClass}`}
                                title={getEdgeTypeConfig(step.edge.type).description}
                              >
                                {step.edge.type}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                              {step.edge.label}
                            </p>
                            <div className="mt-2.5 pt-2 border-t border-[var(--border-main)] flex items-center justify-between">
                              <span className="text-[10px] font-mono text-[var(--text-dim)]">
                                Academic Proof Verified
                              </span>
                              <Link
                                href={`/influence/${step.edge.id || `${step.fromNodeId}--${step.toNodeId}`}`}
                                onClick={onClose}
                                className="text-xs text-[var(--gold-accent)] hover:underline flex items-center gap-1 font-semibold"
                              >
                                <BookOpen className="w-3 h-3" />
                                <span>Inspect Proof &rarr;</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="p-4 bg-[var(--bg-subtle)] border border-rose-800/40 text-rose-500 rounded-xl text-xs text-center">
                  No direct influence path discovered between these two thinkers in the current dataset.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
