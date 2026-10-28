'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { Era } from '../../lib/types';

interface EraScrubberProps {
  eras: Era[];
  currentYear: number;
  onYearChange: React.Dispatch<React.SetStateAction<number>>;
  selectedEraId: string;
  onSelectEra: (eraId: string) => void;
}

export function EraScrubber({
  eras,
  currentYear,
  onYearChange,
  selectedEraId,
  onSelectEra,
}: EraScrubberProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number | null>(null);

  const minYear = -624;
  const maxYear = 2026;

  useEffect(() => {
    if (isPlaying) {
      let lastTime = performance.now();
      const step = (time: number) => {
        const delta = time - lastTime;
        if (delta > 50) {
          lastTime = time;
          onYearChange((prev) => {
            if (prev >= maxYear) {
              setIsPlaying(false);
              return maxYear;
            }
            return Math.min(maxYear, prev + 15);
          });
        }
        animationRef.current = requestAnimationFrame(step);
      };
      animationRef.current = requestAnimationFrame(step);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, onYearChange]);

  const formatYear = (y: number) => {
    if (y < 0) return `${Math.abs(y)} BCE`;
    return `${y} CE`;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    onYearChange(parseInt(e.target.value, 10));
  };

  const currentEra = eras.find((e) => currentYear >= e.startYear && currentYear <= e.endYear);

  return (
    <div className="bg-slate-950/90 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-2xl max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-950/70 text-indigo-400 rounded-xl border border-indigo-800/30">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-100 font-mono">
                {formatYear(currentYear)}
              </span>
              {currentEra && (
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: currentEra.color }}
                >
                  {currentEra.name}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-md">
              {currentEra?.description || 'Exploring all eras'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (currentYear >= maxYear) onYearChange(minYear);
              setIsPlaying(!isPlaying);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              isPlaying
                ? 'bg-amber-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause' : 'Play Evolution'}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              onYearChange(maxYear);
              onSelectEra('all');
            }}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            title="Reset to Present (Show All)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrubber Range Input */}
      <div className="relative mb-3">
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={currentYear}
          onChange={handleSliderChange}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
          <span>624 BCE (Thales)</span>
          <span>0 (Antiquity)</span>
          <span>1781 (Kant)</span>
          <span>2026 CE (Present)</span>
        </div>
      </div>

      {/* Quick Era Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
        <button
          onClick={() => {
            onSelectEra('all');
            onYearChange(maxYear);
          }}
          className={`text-[11px] px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
            selectedEraId === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          All Eras
        </button>

        {eras.map((era) => {
          const isSelected = selectedEraId === era.id;
          return (
            <button
              key={era.id}
              onClick={() => {
                onSelectEra(era.id);
                onYearChange(era.endYear);
              }}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition border ${
                isSelected
                  ? 'border-indigo-400 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
              style={{
                backgroundColor: isSelected ? era.color : undefined,
              }}
            >
              {era.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
