// lib/speech/hadith-audio-manager.ts
// Handles real audio playback for Hadith narrations (Arabic, Bangla, English)

export type HadithAudioLang = 'ar' | 'bn' | 'en';

type PlaybackListener = (activeKey: string | null, state: 'idle' | 'loading' | 'playing' | 'error') => void;

class HadithAudioManager {
  private audio: HTMLAudioElement | null = null;
  private activeKey: string | null = null; // format: `${hadithId}-${lang}`
  private state: 'idle' | 'loading' | 'playing' | 'error' = 'idle';
  private listeners: Set<PlaybackListener> = new Set();
  private currentObjectUrl: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.addEventListener('ended', () => {
        this.cleanupObjectUrl();
        this.setState(null, 'idle');
      });
      this.audio.addEventListener('error', () => {
        this.cleanupObjectUrl();
        this.setState(null, 'error');
      });
      this.audio.addEventListener('pause', () => {
        if (this.audio && this.audio.currentTime > 0 && !this.audio.ended && this.state === 'playing') {
          // If paused externally or finished
        }
      });
    }
  }

  private cleanupObjectUrl() {
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
  }

  private setState(key: string | null, state: 'idle' | 'loading' | 'playing' | 'error') {
    this.activeKey = key;
    this.state = state;
    this.notify();
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.activeKey, this.state));
  }

  public subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    listener(this.activeKey, this.state);
    return () => this.listeners.delete(listener);
  }

  public getActiveKey(): string | null {
    return this.activeKey;
  }

  public getState(): 'idle' | 'loading' | 'playing' | 'error' {
    return this.state;
  }

  public isKeyPlaying(hadithId: string, lang: HadithAudioLang): boolean {
    return this.activeKey === `${hadithId}-${lang}` && (this.state === 'playing' || this.state === 'loading');
  }

  public isKeyLoading(hadithId: string, lang: HadithAudioLang): boolean {
    return this.activeKey === `${hadithId}-${lang}` && this.state === 'loading';
  }

  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.cleanupObjectUrl();
    this.setState(null, 'idle');
  }

  public async play(hadithId: string, text: string, lang: HadithAudioLang): Promise<void> {
    const key = `${hadithId}-${lang}`;

    // If currently playing or loading this exact section, clicking again acts as Stop
    if (this.activeKey === key && (this.state === 'playing' || this.state === 'loading')) {
      this.stop();
      return;
    }

    // Stop any existing playback first
    this.stop();

    if (!text || !text.trim()) {
      return;
    }

    this.setState(key, 'loading');

    try {
      const res = await fetch('/api/hadith/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang }),
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch audio (${res.status})`);
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      this.currentObjectUrl = objectUrl;

      if (!this.audio) {
        this.audio = new Audio();
      }

      this.audio.src = objectUrl;
      await this.audio.play();

      this.setState(key, 'playing');
    } catch (err) {
      console.error('Playback error:', err);
      this.cleanupObjectUrl();
      this.setState(null, 'error');
    }
  }
}

export const hadithAudioManager = new HadithAudioManager();
