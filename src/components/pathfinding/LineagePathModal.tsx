'use client';

import React, { useState } from 'react';
import { X, GitFork, ArrowRight, Sparkles, Check, Compass } from 'lucide-react';
import { Philosopher, Edge } from '../../lib/types';
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
    { start: 'plato', target: 'arthur-schopenhauer', label: 'Plato &rarr; Schopenhauer (Forms to Will)' },
    { start: 'socrates', target: 'immanuel-kant', label: 'Socrates &rarr; Kant (Elenchus to Critical Reason)' },
    { start: 'rene-descartes', target: 'friedrich-nietzsche', label: 'Descartes &rarr; Nietzsche (Doubt to Will to Power)' },
    { start: 'aristotle', target: 'thomas-aquinas', label: 'Aristotle &rarr; Aquinas (Greek Teleology to Scholasticism)' },
    { start: 'rene-descartes', target: 'nick-bostrom', label: 'Descartes &rarr; Bostrom (Evil Demon to Simulation)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[#14120f] border border-[#3d3328] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-[#f4efe6] font-serif">
        {/* Header */}
        <div className="p-5 border-b border-[#2a241e] flex items-center justify-between bg-[#1a1714]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2a2318] text-[#e5b94c] rounded-xl border border-[#4a3b25]">
              <GitFork className="w-5 h-5 text-[#c59b27]" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#f5f0e6] tracking-wide">
                Trace Lineage & Conceptual Route
              </h3>
              <p className="text-xs text-[#a89b88]">
                Calculate the intellectual chain and transitional concepts connecting any two thinkers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#a89b88] hover:text-[#f5f0e6] rounded-lg hover:bg-[#25201a] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick Presets */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#c59b27] mb-2">
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
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#1a1714] hover:bg-[#25201a] text-[#d8cfc0] hover:text-[#e5b94c] border border-[#2a241e] hover:border-[#4a3b25] transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-[#c59b27]" />
                  <span dangerouslySetInnerHTML={{ __html: p.label }} />
                </button>
              ))}
            </div>
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#c59b27] uppercase tracking-wider mb-1.5">
                Origin Thinker (Foundation)
              </label>
              <select
                value={startId}
                onChange={(e) => setStartId(e.target.value)}
                className="w-full bg-[#1a1714] border border-[#2a241e] text-[#f5f0e6] rounded-xl px-3 py-2 text-sm focus:border-[#c59b27] focus:outline-none"
              >
                {philosophers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.birthYear < 0 ? `${Math.abs(p.birthYear)} BCE` : `${p.birthYear} CE`})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#c59b27] uppercase tracking-wider mb-1.5">
                Destination Thinker (Successor)
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full bg-[#1a1714] border border-[#2a241e] text-[#f5f0e6] rounded-xl px-3 py-2 text-sm focus:border-[#c59b27] focus:outline-none"
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
            className="w-full py-2.5 bg-[#2a2318] hover:bg-[#352c1e] text-[#e5b94c] border border-[#4a3b25] rounded-xl text-xs font-semibold tracking-wide transition shadow-md flex items-center justify-center gap-2"
          >
            <GitFork className="w-4 h-4 text-[#c59b27]" />
            Calculate Intellectual Lineage
          </button>

          {/* Results Display */}
          {pathResult && (
            <div className="pt-4 border-t border-[#2a241e] space-y-4">
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
                      className="px-3 py-1.5 bg-[#2a2318] hover:bg-[#352c1e] text-[#e5b94c] border border-[#4a3b25] rounded-lg text-xs font-semibold transition"
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
                          className="p-3.5 bg-[#1a1714] border border-[#2a241e] rounded-xl flex items-start gap-3"
                        >
                          <div className="w-6 h-6 rounded-full bg-[#25201a] text-[#c59b27] border border-[#3d3328] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[#f5f0e6] flex-wrap">
                              <span>{fromPhil?.name || step.fromNodeId}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-[#c59b27] shrink-0" />
                              <span>{toPhil?.name || step.toNodeId}</span>
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#25201a] text-[#c59b27] border border-[#3d3328]">
                                {step.edge.type}
                              </span>
                            </div>
                            <p className="text-xs text-[#d8cfc0] mt-1 leading-relaxed">
                              {step.edge.label}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="p-4 bg-[#2a1b18] border border-[#4a2822] text-[#e78b7a] rounded-xl text-xs text-center">
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
