'use client';

import React, { useState } from 'react';
import { X, GitFork, ArrowRight, Sparkles, Check } from 'lucide-react';
import { Philosopher, Edge, getEdgeTypeConfig } from '../../lib/types';
import { findInfluencePath, PathResult } from '../../lib/graph/pathfinding';

interface LineagePathModalProps {
  isOpen: boolean;
  onClose: () => void;
  philosophers: Philosopher[];
  edges: Edge[];
  initialStartId?: string;
  onHighlightPath: (pathNodes: string[]) => void;
}

export function LineagePathModal({
  isOpen,
  onClose,
  philosophers,
  edges,
  initialStartId,
  onHighlightPath,
}: LineagePathModalProps) {
  const [startId, setStartId] = useState(initialStartId || 'plato');
  const [targetId, setTargetId] = useState('arthur-schopenhauer');
  const [pathResult, setPathResult] = useState<PathResult | null>(null);

  if (!isOpen) return null;

  const handleCompute = () => {
    const result = findInfluencePath(startId, targetId, edges);
    setPathResult(result);
  };

  const philMap = new Map(philosophers.map((p) => [p.id, p]));

  const presets = [
    { start: 'plato', target: 'arthur-schopenhauer', label: 'Plato → Schopenhauer (Forms to Will)' },
    { start: 'socrates', target: 'immanuel-kant', label: 'Socrates → Kant (Elenchus to Critical Reason)' },
    { start: 'rene-descartes', target: 'friedrich-nietzsche', label: 'Descartes → Nietzsche (Doubt to Will to Power)' },
    { start: 'aristotle', target: 'thomas-aquinas', label: 'Aristotle → Aquinas (Greek Teleology to Scholasticism)' },
    { start: 'rene-descartes', target: 'nick-bostrom', label: 'Descartes → Bostrom (Evil Demon to Simulation)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-[var(--text-main)] font-serif">
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
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
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

          {/* Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--gold-accent)] uppercase tracking-wider mb-1.5">
                Origin Thinker (Foundation)
              </label>
              <select
                value={startId}
                onChange={(e) => setStartId(e.target.value)}
                className="w-full bg-[var(--bg-subtle)] border border-[var(--border-main)] text-[var(--text-main)] rounded-xl px-3 py-2 text-sm focus:border-[var(--gold-accent)] focus:outline-none"
              >
                {philosophers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.birthYear < 0 ? `${Math.abs(p.birthYear)} BCE` : `${p.birthYear} CE`})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--gold-accent)] uppercase tracking-wider mb-1.5">
                Destination Thinker (Successor)
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full bg-[var(--bg-subtle)] border border-[var(--border-main)] text-[var(--text-main)] rounded-xl px-3 py-2 text-sm focus:border-[var(--gold-accent)] focus:outline-none"
              >
                {philosophers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.birthYear < 0 ? `${Math.abs(p.birthYear)} BCE` : `${p.birthYear} CE`})
                  </option>
                ))}
              </select>
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
                      const toPhil = philMap.get(step.toNodeId);
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
                              <span>{fromPhil?.name || step.fromNodeId}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-[var(--gold-accent)] shrink-0" />
                              <span>{toPhil?.name || step.toNodeId}</span>
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
