'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, User } from 'lucide-react';
import { Philosopher, Concept } from '../../lib/types';

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  philosophers: Philosopher[];
  concepts: Concept[];
  onSelectNode: (nodeId: string) => void;
}

export function SearchPalette({
  isOpen,
  onClose,
  philosophers,
  concepts,
  onSelectNode,
}: SearchPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedPhilosophers = q
    ? philosophers.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortBio.toLowerCase().includes(q) ||
          p.centralQuestion.toLowerCase().includes(q) ||
          p.keyWorks.some((w) => {
            const title = typeof w === 'string' ? w : (w as any).title;
            return title.toLowerCase().includes(q);
          })
      )
    : philosophers.slice(0, 6);

  const matchedConcepts = q
    ? concepts.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.branch.toLowerCase().includes(q)
      )
    : concepts.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[#14120f] border border-[#3d3328] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col font-serif text-[#f4efe6]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-[#2a241e] bg-[#1a1714]">
          <Search className="w-5 h-5 text-[#c59b27] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search philosophers, ideas (e.g. Kant, Forms, Will, Dualism)..."
            className="flex-1 bg-transparent text-sm text-[#f5f0e6] placeholder-[#786c5c] focus:outline-none font-serif"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-[#a89b88] hover:text-[#f5f0e6]">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[10px] font-mono px-2 py-1 rounded bg-[#25201a] text-[#a89b88] border border-[#3d3328] hover:text-[#f5f0e6]"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Philosophers */}
          {matchedPhilosophers.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-[#c59b27] px-3 mb-1.5 flex items-center gap-1.5">
                <User className="w-3 h-3 text-[#c59b27]" />
                Philosophers
              </div>
              <div className="space-y-1">
                {matchedPhilosophers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectNode(p.id);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#1a1714] border border-transparent hover:border-[#2a241e] transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#f5f0e6] group-hover:text-[#e5b94c] transition">
                        {p.name}
                      </div>
                      <div className="text-xs text-[#a89b88] truncate max-w-md">
                        {p.shortBio}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#a89b88] whitespace-nowrap ml-2">
                      {p.birthYear < 0 ? `${Math.abs(p.birthYear)} BCE` : `${p.birthYear} CE`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Concepts */}
          {matchedConcepts.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-[#c59b27] px-3 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-[#52b788]" />
                Concepts & Ideas
              </div>
              <div className="space-y-1">
                {matchedConcepts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectNode(c.id);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#1a1714] border border-transparent hover:border-[#2a241e] transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#f5f0e6] group-hover:text-[#52b788] transition">
                        {c.title}
                      </div>
                      <div className="text-xs text-[#a89b88] truncate max-w-md">
                        {c.summary}
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1a1714] text-[#a89b88] border border-[#2a241e]">
                      {c.branch}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedPhilosophers.length === 0 && matchedConcepts.length === 0 && (
            <div className="p-8 text-center text-[#786c5c] text-sm">
              No matching thinkers or concepts found for &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
