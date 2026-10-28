'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Headphones } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  episodeNumber?: number;
  duration?: string;
}

export function AudioPlayer({ audioUrl, title, episodeNumber, duration }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [audioUrl, playbackRate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn('Playback error:', err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!totalDuration && audioRef.current.duration) {
        setTotalDuration(audioRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setTotalDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const skipSeconds = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(totalDuration || 9999, audioRef.current.currentTime + seconds));
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-[#1a1714] border border-[#2a241e] rounded-xl p-4 shadow-lg text-[#f4efe6] font-serif">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex items-center gap-3 mb-2.5">
        <div className="p-2 bg-[#25201a] text-[#c59b27] rounded-lg border border-[#3d3328]">
          <Headphones className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-[#c59b27] font-semibold">
            {episodeNumber ? `Philosophize This! • Episode #${episodeNumber}` : 'Philosophize This!'}
          </div>
          <div className="text-sm font-semibold text-[#f5f0e6] truncate" title={title}>
            {title}
          </div>
        </div>
      </div>

      {/* Progress slider */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-mono text-[#a89b88] w-10 text-right">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={totalDuration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1.5 bg-[#25201a] rounded-lg appearance-none cursor-pointer accent-[#c59b27]"
        />
        <span className="text-[11px] font-mono text-[#a89b88] w-10">
          {formatTime(totalDuration || 0)}
        </span>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => skipSeconds(-15)}
            className="p-1.5 text-[#a89b88] hover:text-[#f5f0e6] transition"
            title="Rewind 15 seconds"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={togglePlay}
            className="p-2 bg-[#2a2318] hover:bg-[#352c1e] text-[#e5b94c] border border-[#4a3b25] rounded-full transition active:scale-95 shadow-md"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={() => skipSeconds(30)}
            className="p-1.5 text-[#a89b88] hover:text-[#f5f0e6] transition"
            title="Forward 30 seconds"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={cyclePlaybackRate}
            className="px-2 py-0.5 text-xs font-medium text-[#d8cfc0] bg-[#25201a] hover:bg-[#302920] rounded border border-[#3d3328] transition font-mono"
          >
            {playbackRate}x
          </button>
          <button
            onClick={toggleMute}
            className="p-1.5 text-[#a89b88] hover:text-[#f5f0e6] transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
