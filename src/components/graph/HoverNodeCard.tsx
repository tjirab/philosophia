'use client';

import React from 'react';
import { HelpCircle, Sparkles, BookOpen, User, Calendar, Compass } from 'lucide-react';
import { VisualNode, Philosopher, Concept } from '../../lib/types';
import { eras, traditions } from '../../lib/graph/graph-service';

interface HoverNodeCardProps {
  node: VisualNode;
  position: { x: number; y: number };
}

export function HoverNodeCard({ node, position }: HoverNodeCardProps) {
  const isPhilosopher = node.type === 'philosopher';
  const phil = isPhilosopher ? (node.data as Philosopher) : null;
  const conc = !isPhilosopher ? (node.data as Concept) : null;

  const era = eras.find((e) => e.id === node.eraId);
  const tradition = isPhilosopher
    ? traditions.find((t) => t.id === phil?.traditionId)
    : undefined;

  const formatYear = (y?: number) => {
    if (y === undefined) return '';
    return y < 0 ? `${Math.abs(y)} BCE` : `${y} CE`;
  };

  // Keep card within viewport bounds
  const cardWidth = 320;
  const cardHeight = 220;

  // Calculate coordinates with safe padding
  const posX = Math.min(Math.max(20, position.x + 15), (typeof window !== 'undefined' ? window.innerWidth : 1200) - cardWidth - 25);
  const posY = Math.min(Math.max(20, position.y + 15), (typeof window !== 'undefined' ? window.innerHeight : 800) - cardHeight - 25);

  return (
    <div
      style={{
        position: 'fixed',
        left: `${posX}px`,
        top: `${posY}px`,
        width: `${cardWidth}px`,
      }}
      className="z-40 pointer-events-none bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl p-4 text-[var(--text-main)] font-serif backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header Badges */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        {era && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white uppercase tracking-wider shadow-sm"
            style={{ backgroundColor: era.color }}
          >
            {era.name}
          </span>
        )}
        {tradition && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--gold-accent)] border border-[var(--border-main)]">
            {tradition.name}
          </span>
        )}
        {conc && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--gold-accent)] border border-[var(--border-main)] uppercase font-mono">
            {conc.branch}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-[var(--text-main)] leading-tight font-serif mb-1">
        {node.name}
      </h3>

      {/* Lifespan & Centrality for Philosopher */}
      {isPhilosopher && phil && (
        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] mb-2 font-mono">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[var(--gold-accent)]" />
            {formatYear(phil.birthYear)} – {formatYear(phil.deathYear)}
          </span>
          <span
            className="flex items-center gap-1 text-[var(--gold-accent)] font-semibold"
            title="Degree Centrality: Historical influence density based on total incoming and outgoing connections"
          >
            <Compass className="w-3 h-3" />
            Centrality: {phil.importanceScore}/100
          </span>
        </div>
      )}

      {/* Quote / Summary */}
      <div className="text-xs text-[var(--text-muted)] leading-relaxed mb-3 line-clamp-3">
        {isPhilosopher && phil?.centralQuestion ? (
          <span className="italic">&ldquo;{phil.centralQuestion}&rdquo;</span>
        ) : (
          node.summary
        )}
      </div>

      {/* Centrality Explanation Pill */}
      {isPhilosopher && (
        <div className="p-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-main)] text-[10px] text-[var(--text-dim)] leading-tight mb-2">
          <strong className="text-[var(--gold-accent)]">Centrality {phil?.importanceScore}/100:</strong> Measures historical influence density (number of mentors, disciples, refutations & syntheses).
        </div>
      )}

      {/* Action Prompt */}
      <div className="pt-2 border-t border-[var(--border-main)] flex items-center justify-between text-[11px] text-[var(--gold-accent)] font-semibold">
        <span>Click to open dossier</span>
        <span>&rarr;</span>
      </div>
    </div>
  );
}
