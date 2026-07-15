'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioPlayerProps {
  surah: number;
  ayah: number;
  surahName?: string;
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function getAudioUrl(surah: number, ayah: number): string {
  return `https://everyayah.com/data/Alafasy_128kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`;
}

export default function AudioPlayer({ surah, ayah, surahName }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  const url = getAudioUrl(surah, ayah);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration || 0);
    const onEnded = () => setPlaying(false);
    const onError = () => { setError(true); setPlaying(false); };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onDuration);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onDuration);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [url]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setError(true));
    }
  }, [playing]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
  }, [duration]);

  if (error) {
    return (
      <div className="audio-player offline">
        <audio ref={audioRef} src={url} preload="none" />
        <span className="audio-error">Audio requires internet connection</span>
      </div>
    );
  }

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={url} preload="none" />
      <button className="audio-play-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? '⏸' : '▶'}
      </button>
      <div className="audio-info">
        <div className="audio-title">{surahName || `Surah ${surah}`} — Ayah {ayah}</div>
        <div className="audio-progress" onClick={handleSeek}>
          <div className="audio-progress-fill" style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
        </div>
        <div className="audio-times">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
