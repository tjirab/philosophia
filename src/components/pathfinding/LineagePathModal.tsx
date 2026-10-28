'use client';

import React, { useState } from 'react';
import { X, GitFork, ArrowRight, Sparkles, Check } from 'lucide-react';
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
    { start: 'plato', target: 'arthur-schopenhauer', label: 'Plato to Schopenhauer (Forms to Will)' },
    { start: 'socrates', target: 'immanuel-kant', label: 'Socrates to Kant (Examined Life to Critical Reason)' },
    { start: 'rene-descartes', target: 'friedrich-nietzsche', label: 'Descartes to Nietzsche (Doubt to Will to Power)' },
    { start: 'aristotle', target: 'thomas-aquinas', label: 'Aristotle to Aquinas (Greek Teleology to Scholasticism)' },
    { start: 'rene-descartes', target: 'nick-bostrom', label: 'Descartes to Bostrom (Evil Demon to Simulation)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Trace Influence & Lineage Path</h3>
              <p className="text-xs text-slate-400">
                Discover the intellectual bridge and concept evolution between any two thinkers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick Presets */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Popular Lineages
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
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 border border-slate-800 transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Starting Philosopher (Origin)
              </label>
              <select
                value={startId}
                onChange={(e) => setStartId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                {philosophers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.birthYear < 0 ? `${Math.abs(p.birthYear)} BCE` : `${p.birthYear} CE`})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Philosopher (Destination)
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
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
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            <GitFork className="w-4 h-4" />
            Calculate Intellectual Path
          </button>

          {/* Results Display */}
          {pathResult && (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              {pathResult.found ? (
                <>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      Influence Path Found: {pathResult.totalHops} {pathResult.totalHops === 1 ? 'Hop' : 'Hops'}
                    </span>
                    <button
                      onClick={() => {
                        onHighlightPath(pathResult.nodes);
                        onClose();
                      }}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
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
                          className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex items-start gap-3"
                        >
                          <div className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-700/50 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-100 flex-wrap">
                              <span>{fromPhil?.name || step.fromNodeId}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span>{toPhil?.name || step.toNodeId}</span>
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                                {step.edge.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              {step.edge.label}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="p-4 bg-rose-950/30 border border-rose-900/40 text-rose-300 rounded-xl text-xs text-center">
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
