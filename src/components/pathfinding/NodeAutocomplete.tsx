'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, User, BookOpen, Check, ChevronDown } from 'lucide-react';
import { Philosopher, Concept } from '../../lib/types';
import { useClickOutside } from '../../lib/hooks/useClickOutside';

export interface NodeAutocompleteProps {
  id?: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (nodeId: string) => void;
  philosophers: Philosopher[];
  concepts?: Concept[];
}

export function NodeAutocomplete({
  id,
  label,
  placeholder = 'Search thinker or concept...',
  value,
  onChange,
  philosophers,
  concepts = [],
}: NodeAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Find the selected entity
  const currentNode = useMemo(() => {
    return philosophers.find((p) => p.id === value) || concepts.find((c) => c.id === value);
  }, [philosophers, concepts, value]);

  const currentDisplayName = useMemo(() => {
    if (!currentNode) return value;
    return 'name' in currentNode ? currentNode.name : currentNode.title;
  }, [currentNode, value]);

  const [searchTerm, setSearchTerm] = useState(currentDisplayName);

  // Sync display name when external value changes (e.g. preset click or swap)
  useEffect(() => {
    setSearchTerm(currentDisplayName);
  }, [currentDisplayName]);

  // Close dropdown on outside click and restore selection label if needed
  useClickOutside(
    containerRef,
    () => {
      setIsOpen(false);
      setSearchTerm(currentDisplayName);
    },
    isOpen
  );

  // Filter thinkers and concepts based on search term
  const { filteredPhilosophers, filteredConcepts, isQuerying } = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const querying = q.length > 0 && q !== currentDisplayName.toLowerCase();

    if (!querying) {
      return {
        filteredPhilosophers: philosophers.slice(0, 15),
        filteredConcepts: concepts.slice(0, 6),
        isQuerying: false,
      };
    }

    const matchedP = philosophers.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        (p.shortBio || '').toLowerCase().includes(q) ||
        (p.centralQuestion || '').toLowerCase().includes(q) ||
        (p.eraId || '').toLowerCase().includes(q) ||
        (p.keyWorks || []).some((w) => {
          const title = typeof w === 'string' ? w : w.title || '';
          return title.toLowerCase().includes(q);
        })
      );
    });

    // Prioritize prefix matches, then substring matches
    matchedP.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q);
      const bStarts = b.name.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.name.localeCompare(b.name);
    });

    const matchedC = concepts.filter((c) => {
      return (
        (c.title || '').toLowerCase().includes(q) ||
        (c.summary || '').toLowerCase().includes(q) ||
        (c.branch || '').toLowerCase().includes(q)
      );
    });

    return {
      filteredPhilosophers: matchedP.slice(0, 20),
      filteredConcepts: matchedC.slice(0, 10),
      isQuerying: true,
    };
  }, [searchTerm, currentDisplayName, philosophers, concepts]);

  // Unified items list for keyboard navigation
  const flatItems = useMemo(() => {
    const list: Array<{
      id: string;
      displayName: string;
      type: 'philosopher' | 'concept';
      meta?: string;
      subtext?: string;
    }> = [];

    for (const p of filteredPhilosophers) {
      const yearStr = p.birthYear < 0 ? `${Math.abs(p.birthYear)} BCE` : `${p.birthYear} CE`;
      list.push({
        id: p.id,
        displayName: p.name,
        type: 'philosopher',
        meta: yearStr,
        subtext: p.shortBio,
      });
    }

    for (const c of filteredConcepts) {
      list.push({
        id: c.id,
        displayName: c.title || (c as any).name || c.id,
        type: 'concept',
        meta: c.branch,
        subtext: c.summary || (c as any).description,
      });
    }

    return list;
  }, [filteredPhilosophers, filteredConcepts]);

  // Keep highlighted index in bounds
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && listRef.current && listRef.current.children[highlightedIndex]) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement;
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (selectedId: string) => {
    const chosen =
      philosophers.find((p) => p.id === selectedId) ||
      concepts.find((c) => c.id === selectedId);

    onChange(selectedId);
    if (chosen) {
      setSearchTerm('name' in chosen ? chosen.name : chosen.title);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (flatItems.length === 0 ? 0 : (prev + 1) % flatItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        flatItems.length === 0 ? 0 : (prev - 1 + flatItems.length) % flatItems.length
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems[highlightedIndex]) {
        handleSelect(flatItems[highlightedIndex].id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation(); // prevent modal close on first Escape
      setIsOpen(false);
      setSearchTerm(currentDisplayName);
    } else if (e.key === 'Tab') {
      setIsOpen(false);
      setSearchTerm(currentDisplayName);
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    setTimeout(() => {
      inputRef.current?.select();
    }, 10);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchTerm('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const inputId = id || `node-autocomplete-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div ref={containerRef} className="relative w-full">
      <label
        htmlFor={inputId}
        className="block text-xs font-semibold text-[var(--gold-accent)] uppercase tracking-wider mb-1.5"
      >
        {label}
      </label>

      {/* Input container */}
      <div className="relative flex items-center">
        <div className="absolute left-3 pointer-events-none text-[var(--text-dim)]">
          <Search className="w-4 h-4 text-[var(--gold-accent)]" />
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`${inputId}-list`}
          aria-activedescendant={
            isOpen && flatItems[highlightedIndex]
              ? `${inputId}-option-${flatItems[highlightedIndex].id}`
              : undefined
          }
          className="w-full bg-[var(--bg-subtle)] border border-[var(--border-main)] hover:border-[var(--gold-border)] focus:border-[var(--gold-accent)] text-[var(--text-main)] rounded-xl pl-9 pr-16 py-2 text-sm focus:outline-none transition font-serif placeholder-[var(--text-dim)]"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-[var(--text-dim)] hover:text-[var(--text-main)] rounded hover:bg-[var(--bg-hover)] transition"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) inputRef.current?.focus();
            }}
            className="p-1 text-[var(--text-dim)] hover:text-[var(--text-main)] rounded hover:bg-[var(--bg-hover)] transition"
            title="Toggle suggestions"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-150 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Autocomplete Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-xl shadow-2xl overflow-hidden font-serif">
          {flatItems.length === 0 ? (
            <div className="p-4 text-center text-xs text-[var(--text-dim)]">
              No matching thinkers or concepts found for &ldquo;{searchTerm}&rdquo;.
            </div>
          ) : (
            <div>
              {/* Category summary header */}
              <div className="px-3 py-1.5 bg-[var(--bg-subtle)] border-b border-[var(--border-main)] flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)]">
                <span>
                  {isQuerying ? 'Matching Intellectual Figures' : 'Canonical & Available Thinkers'}
                </span>
                <span>
                  {flatItems.length} {flatItems.length === 1 ? 'result' : 'results'}
                </span>
              </div>

              <ul
                ref={listRef}
                id={`${inputId}-list`}
                role="listbox"
                className="max-h-60 overflow-y-auto divide-y divide-[var(--border-main)]/40 focus:outline-none"
              >
                {flatItems.map((item, idx) => {
                  const isSelected = item.id === value;
                  const isHighlighted = idx === highlightedIndex;

                  return (
                    <li
                      key={item.id}
                      id={`${inputId}-option-${item.id}`}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onClick={() => handleSelect(item.id)}
                      className={`px-3 py-2 text-left cursor-pointer transition flex flex-col group ${
                        isHighlighted
                          ? 'bg-[var(--gold-bg)] text-[var(--gold-accent)]'
                          : 'hover:bg-[var(--bg-subtle)] text-[var(--text-main)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {item.type === 'philosopher' ? (
                            <User
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isHighlighted
                                  ? 'text-[var(--gold-accent)]'
                                  : 'text-[var(--text-dim)] group-hover:text-[var(--gold-accent)]'
                              }`}
                            />
                          ) : (
                            <BookOpen className="w-3.5 h-3.5 shrink-0 text-[#52b788]" />
                          )}
                          <span className="font-semibold text-xs tracking-wide truncate">
                            {item.displayName}
                          </span>
                          {item.type === 'concept' && (
                            <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                              Concept
                            </span>
                          )}
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[var(--gold-accent)] shrink-0 ml-1" />
                          )}
                        </div>

                        {item.meta && (
                          <span className="text-[10px] font-mono text-[var(--text-dim)] shrink-0 whitespace-nowrap">
                            {item.meta}
                          </span>
                        )}
                      </div>

                      {item.subtext && (
                        <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5 pl-5.5">
                          {item.subtext}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
