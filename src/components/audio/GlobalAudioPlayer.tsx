'use client';

import React from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Headphones, X, MapPin } from 'lucide-react';
import { useAudio } from '../../lib/audio-context';

interface GlobalAudioPlayerProps {
  onSelectNode?: (nodeId: string) => void;
}

export function GlobalAudioPlayer({ onSelectNode }: GlobalAudioPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    totalDuration,
    playbackRate,
    isMuted,
    togglePlay,
    seek,
    skip,
    cyclePlaybackRate,
    toggleMute,
    closePlayer,
  } = useAudio();

  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  return (
    <div
      role="region"
      aria-label="Philosophia Audio Player"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[420px] z-40 bg-[var(--bg-card)]/95 border border-[var(--border-strong)] rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl text-[var(--text-main)] font-serif animate-in slide-in-from-bottom-4 duration-200"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-[var(--bg-subtle)] text-[var(--gold-accent)] rounded-lg border border-[var(--border-main)] shrink-0">
            <Headphones className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--gold-accent)] font-semibold truncate">
              {currentTrack.episodeNumber
                ? `Philosophize This! • Episode #${currentTrack.episodeNumber}`
                : 'Philosophize This! Audio'}
            </div>
            <div className="text-xs font-semibold text-[var(--text-main)] truncate max-w-[260px]" title={currentTrack.title}>
              {currentTrack.title}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {currentTrack.thinkerId && onSelectNode && (
            <button
              onClick={() => onSelectNode(currentTrack.thinkerId!)}
              className="p-1 text-[var(--text-dim)] hover:text-[var(--gold-accent)] hover:bg-[var(--bg-hover)] rounded-lg transition"
              title={`Center on ${currentTrack.thinkerName || 'thinker'} in Constellation`}
            >
              <MapPin className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={closePlayer}
            className="p-1 text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] rounded-lg transition"
            title="Close Audio Player"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar & Timestamps */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[10px] font-mono text-[var(--text-dim)] w-9 text-right shrink-0">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={totalDuration || 100}
          value={currentTime}
          onChange={handleSeek}
          aria-label="Audio progress slider"
          className="flex-1 h-1.5 bg-[var(--bg-subtle)] rounded-lg appearance-none cursor-pointer accent-[var(--gold-accent)]"
        />
        <span className="text-[10px] font-mono text-[var(--text-dim)] w-9 shrink-0">
          {formatTime(totalDuration || 0)}
        </span>
      </div>

      {/* Transport Controls */}
      <div className="flex items-center justify-between pt-1 border-t border-[var(--border-main)]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => skip(-15)}
            className="p-1.5 text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] rounded-lg transition"
            title="Rewind 15 seconds"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={togglePlay}
            className="p-2 bg-[var(--gold-bg)] hover:bg-[var(--bg-hover)] text-[var(--gold-accent)] border border-[var(--gold-border)] rounded-full transition active:scale-95 shadow-md"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={() => skip(30)}
            className="p-1.5 text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] rounded-lg transition"
            title="Forward 30 seconds"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={cyclePlaybackRate}
            className="px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] rounded-lg border border-[var(--border-main)] transition font-mono"
            title="Change Playback Speed"
          >
            {playbackRate}x
          </button>
          <button
            onClick={toggleMute}
            className="p-1.5 text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] rounded-lg transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[var(--gold-accent)]" />}
          </button>
        </div>
      </div>
    </div>
  );
}
