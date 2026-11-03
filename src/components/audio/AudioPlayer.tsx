'use client';

import React from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Headphones, Radio } from 'lucide-react';
import { useAudio } from '../../lib/audio-context';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  episodeNumber?: number;
  duration?: string;
  thinkerId?: string;
  thinkerName?: string;
}

export function AudioPlayer({
  audioUrl,
  title,
  episodeNumber,
  duration,
  thinkerId,
  thinkerName,
}: AudioPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    totalDuration,
    playbackRate,
    isMuted,
    playTrack,
    togglePlay,
    seek,
    skip,
    cyclePlaybackRate,
    toggleMute,
  } = useAudio();

  const isCurrentTrack = currentTrack?.audioUrl === audioUrl;
  const isThisPlaying = isCurrentTrack && isPlaying;

  const handleStartOrToggle = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack({
        audioUrl,
        title,
        episodeNumber,
        duration,
        thinkerId,
        thinkerName,
      });
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCurrentTrack) {
      seek(parseFloat(e.target.value));
    }
  };

  return (
    <div className={`border rounded-xl p-3.5 shadow-md transition font-serif ${
      isCurrentTrack
        ? 'bg-[var(--gold-bg)] border-[var(--gold-border)]'
        : 'bg-[var(--bg-card)] border-[var(--border-main)] hover:border-[var(--border-strong)]'
    }`}>
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-2 rounded-lg border transition ${
            isCurrentTrack
              ? 'bg-[var(--gold-bg)] text-[var(--gold-accent)] border-[var(--gold-border)]'
              : 'bg-[var(--bg-subtle)] text-[var(--gold-accent)] border-[var(--border-main)]'
          }`}>
            <Headphones className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-mono tracking-widest text-[var(--gold-accent)] font-semibold truncate flex items-center gap-1.5">
              <span>{episodeNumber ? `Episode #${episodeNumber}` : 'Philosophize This!'}</span>
              {isThisPlaying && (
                <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded-full bg-[var(--gold-accent)] text-[var(--bg-card)] font-bold animate-pulse">
                  <Radio className="w-2.5 h-2.5" /> Playing
                </span>
              )}
            </div>
            <div className="text-sm font-semibold text-[var(--text-main)] truncate" title={title}>
              {title}
            </div>
          </div>
        </div>

        <button
          onClick={handleStartOrToggle}
          className="px-3 py-1.5 bg-[var(--gold-bg)] hover:bg-[var(--bg-hover)] text-[var(--gold-accent)] border border-[var(--gold-border)] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shrink-0 shadow-sm"
          title={isThisPlaying ? 'Pause Episode' : 'Play Episode in Persistent Player'}
        >
          {isThisPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isCurrentTrack ? 'Resume' : 'Listen'}</span>
            </>
          )}
        </button>
      </div>

      {/* Progress & Scrub (Active when this track is loaded in player) */}
      {isCurrentTrack && (
        <div className="pt-2 border-t border-[var(--border-main)] space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[var(--text-dim)] w-9 text-right shrink-0">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={totalDuration || 100}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Seek progress"
              className="flex-1 h-1.5 bg-[var(--bg-subtle)] rounded-lg appearance-none cursor-pointer accent-[var(--gold-accent)]"
            />
            <span className="text-[10px] font-mono text-[var(--text-dim)] w-9 shrink-0">
              {formatTime(totalDuration || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => skip(-15)}
                className="p-1 hover:text-[var(--text-main)] transition"
                title="Rewind 15 seconds"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => skip(30)}
                className="p-1 hover:text-[var(--text-main)] transition"
                title="Skip 30 seconds"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px]">
              <button
                onClick={cyclePlaybackRate}
                className="px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] border border-[var(--border-main)] transition"
                title="Cycle playback speed"
              >
                {playbackRate}x
              </button>
              <button
                onClick={toggleMute}
                className="p-1 hover:text-[var(--text-main)] transition"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
