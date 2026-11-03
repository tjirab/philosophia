'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

export interface AudioTrack {
  audioUrl: string;
  title: string;
  episodeNumber?: number;
  duration?: string;
  thinkerId?: string;
  thinkerName?: string;
}

interface AudioContextType {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
  playbackRate: number;
  isMuted: boolean;
  playTrack: (track: AudioTrack) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  skip: (seconds: number) => void;
  cyclePlaybackRate: () => void;
  toggleMute: () => void;
  closePlayer: () => void;
}

const AudioContext = createContext<AudioContextType>({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  totalDuration: 0,
  playbackRate: 1,
  isMuted: false,
  playTrack: () => {},
  togglePlay: () => {},
  seek: () => {},
  skip: () => {},
  cyclePlaybackRate: () => {},
  toggleMute: () => {},
  closePlayer: () => {},
});

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (!totalDuration && audio.duration && !isNaN(audio.duration)) {
        setTotalDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setTotalDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: Event) => {
      console.warn('Audio playback error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const playTrack = useCallback((track: AudioTrack) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack?.audioUrl === track.audioUrl) {
      if (audio.paused) {
        audio.play().then(() => setIsPlaying(true)).catch((err) => console.warn(err));
      } else {
        audio.pause();
        setIsPlaying(false);
      }
      return;
    }

    setCurrentTrack(track);
    setCurrentTime(0);
    setTotalDuration(0);
    audio.src = track.audioUrl;
    audio.playbackRate = playbackRate;
    audio.muted = isMuted;

    audio.play().then(() => {
      setIsPlaying(true);
    }).catch((err) => {
      console.warn('Playback error:', err);
      setIsPlaying(false);
    });
  }, [currentTrack, playbackRate, isMuted]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch((err) => console.warn(err));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [currentTrack]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clamped = Math.max(0, Math.min(totalDuration || 99999, seconds));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  }, [totalDuration]);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clamped = Math.max(0, Math.min(totalDuration || 99999, audio.currentTime + seconds));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  }, [totalDuration]);

  const cyclePlaybackRate = useCallback(() => {
    const rates = [1, 1.25, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  }, [playbackRate]);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const nextMute = !isMuted;
      audioRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  }, [isMuted]);

  const closePlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setCurrentTime(0);
    setTotalDuration(0);
  }, []);

  return (
    <AudioContext.Provider
      value={{
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
        closePlayer,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}
