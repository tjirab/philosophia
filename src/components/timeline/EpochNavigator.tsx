'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';
import { Era } from '../../lib/types';

interface EpochNavigatorProps {
  eras: Era[];
  selectedEraId: string; // 'all' or era.id
  onSelectEra: (eraId: string) => void;
  isolateEra: boolean;
  onToggleIsolateEra: (isolate: boolean) => void;
}

export function EpochNavigator({
  eras,
  selectedEraId,
  onSelectEra,
  isolateEra,
  onToggleIsolateEra,
}: EpochNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);
  const selectedEraIdRef = useRef(selectedEraId);

  useEffect(() => {
    selectedEraIdRef.current = selectedEraId;
  }, [selectedEraId]);

  const currentEraIndex = eras.findIndex((e) => e.id === selectedEraId);
  const currentEra = currentEraIndex >= 0 ? eras[currentEraIndex] : null;

  // Step through eras smoothly when playing
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        const currentId = selectedEraIdRef.current;
        const idx = eras.findIndex((e) => e.id === currentId);
        if (idx === -1 || idx >= eras.length - 1) {
          setIsPlaying(false);
          onSelectEra('all');
        } else {
          onSelectEra(eras[idx + 1].id);
        }
      }, 5000); // 5 seconds per era so the user can easily read and observe
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, eras, onSelectEra]);

  const handleStepEra = (direction: 'prev' | 'next') => {
    setIsPlaying(false);
    if (selectedEraId === 'all') {
      onSelectEra(direction === 'next' ? eras[0].id : eras[eras.length - 1].id);
      return;
    }
    const idx = eras.findIndex((e) => e.id === selectedEraId);
    if (direction === 'next') {
      const nextIdx = (idx + 1) % eras.length;
      onSelectEra(eras[nextIdx].id);
    } else {
      const prevIdx = (idx - 1 + eras.length) % eras.length;
      onSelectEra(eras[prevIdx].id);
    }
  };

  const formatYears = (era: Era) => {
    const s = era.startYear < 0 ? `${Math.abs(era.startYear)} BCE` : `${era.startYear} CE`;
    const e = era.endYear < 0 ? `${Math.abs(era.endYear)} BCE` : `${era.endYear} CE`;
    return `${s} – ${e}`;
  };

  return (
    <>
      {/* Top Header Selector Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-[#1a1714] hover:bg-[#25201a] border border-[#3d3328] hover:border-[#c59b27]/60 rounded-xl text-xs text-[#f5f0e6] transition shadow-sm font-serif"
        >
          <Clock className="w-3.5 h-3.5 text-[#c59b27]" />
          <span>
            {currentEra ? (
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: currentEra.color }}
                />
                <span className="font-semibold">{currentEra.name}</span>
                <span className="text-[#a89b88] hidden md:inline">({formatYears(currentEra)})</span>
              </span>
            ) : (
              <span>All Epochs (624 BCE – Present)</span>
            )}
          </span>
          <span className="text-[10px] text-[#a89b88] ml-1">▾</span>
        </button>

        {/* Dropdown Folio */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 z-50 w-80 sm:w-96 bg-[#14120f] border border-[#3d3328] rounded-2xl shadow-2xl p-4 text-[#f4efe6] font-serif backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a241e]">
              <div>
                <div className="text-xs font-semibold text-[#f5f0e6] uppercase tracking-wider">
                  Chronological Epochs
                </div>
                <div className="text-[11px] text-[#a89b88]">
                  Select an era or step through history
                </div>
              </div>

              {/* Isolate vs Lineage Toggle */}
              <button
                onClick={() => onToggleIsolateEra(!isolateEra)}
                className={`text-[10px] px-2 py-1 rounded-lg border transition ${
                  isolateEra
                    ? 'bg-[#2a2318] text-[#e5b94c] border-[#4a3b25]'
                    : 'bg-[#1a1714] text-[#a89b88] border-[#2a241e] hover:text-[#f5f0e6]'
                }`}
                title="When isolated, only thinkers from the selected era are displayed"
              >
                {isolateEra ? '✓ Isolate Era' : 'Show Lineage'}
              </button>
            </div>

            {/* List of Eras */}
            <div className="max-h-64 overflow-y-auto py-2 space-y-1">
              <button
                onClick={() => {
                  onSelectEra('all');
                  setIsOpen(false);
                }}
                className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition ${
                  selectedEraId === 'all'
                    ? 'bg-[#2a2318] text-[#e5b94c] font-semibold border border-[#4a3b25]'
                    : 'text-[#d8cfc0] hover:bg-[#1a1714]'
                }`}
              >
                <span>All Epochs (Show Entire Constellation)</span>
                {selectedEraId === 'all' && <Check className="w-3.5 h-3.5" />}
              </button>

              {eras.map((era) => {
                const isSelected = selectedEraId === era.id;
                return (
                  <button
                    key={era.id}
                    onClick={() => {
                      onSelectEra(era.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-[#2a2318] text-[#e5b94c] font-semibold border border-[#4a3b25]'
                        : 'text-[#d8cfc0] hover:bg-[#1a1714]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: era.color }}
                      />
                      <span className="truncate">{era.name}</span>
                    </div>
                    <span className="text-[10px] text-[#a89b88] font-mono shrink-0 ml-2">
                      {formatYears(era)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Footer with Guided Step / Play */}
            <div className="pt-3 border-t border-[#2a241e] flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  if (selectedEraId === 'all') onSelectEra(eras[0].id);
                  setIsPlaying(!isPlaying);
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  isPlaying
                    ? 'bg-[#7f1d1d] hover:bg-[#991b1b] text-white'
                    : 'bg-[#2a2318] hover:bg-[#352c1e] text-[#e5b94c] border border-[#4a3b25]'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause Journey' : 'Play Guided Journey'}</span>
              </button>

              <button
                onClick={() => onSelectEra('all')}
                className="p-1.5 text-[#a89b88] hover:text-[#f5f0e6] bg-[#1a1714] hover:bg-[#25201a] rounded-lg border border-[#2a241e] transition"
                title="Reset to All Eras"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Understated Banner when an Era is selected or Guided Journey is Playing */}
      {currentEra && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 max-w-xl w-[90%] sm:w-auto bg-[#14120f]/95 border border-[#3d3328] rounded-full py-1.5 px-4 shadow-xl backdrop-blur-md flex items-center gap-3 text-xs font-serif text-[#f4efe6]">
          <button
            onClick={() => handleStepEra('prev')}
            className="p-1 text-[#a89b88] hover:text-[#f5f0e6] transition"
            title="Previous Epoch"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2 text-center">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: currentEra.color }}
            />
            <span className="font-semibold text-[#e5b94c]">{currentEra.name}</span>
            <span className="text-[#a89b88] hidden sm:inline">({formatYears(currentEra)})</span>
            <span className="text-[#c4b8a5] hidden md:inline truncate max-w-xs">
              — {currentEra.description}
            </span>
          </div>

          <button
            onClick={() => handleStepEra('next')}
            className="p-1 text-[#a89b88] hover:text-[#f5f0e6] transition"
            title="Next Epoch"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onSelectEra('all')}
            className="text-[10px] text-[#a89b88] hover:text-[#f5f0e6] ml-1 pl-2 border-l border-[#2a241e]"
            title="Show All"
          >
            Show All
          </button>
        </div>
      )}
    </>
  );
}
