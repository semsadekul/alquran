// lib/speech/hadith-tts.ts
// Browser Web Speech API engine for Hadith text reading (Arabic & Bengali)

export type SpeechLanguage = 'ar' | 'bn' | 'en';

export interface TTSOptions {
  lang: SpeechLanguage;
  rate?: number; // 0.5 - 2.0 (default: 0.9 for Arabic tajweed/clarity, 1.0 for others)
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (error: any) => void;
  onChunkChange?: (chunkIndex: number, totalChunks: number) => void;
}

class HadithSpeechService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isCurrentlyPlaying = false;
  private isCurrentlyPaused = false;
  private chunks: string[] = [];
  private currentChunkIndex = 0;
  private currentOptions: TTSOptions | null = null;
  private keepAliveInterval: any = null;
  private activeId: string | null = null;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) return [];
    return window.speechSynthesis.getVoices();
  }

  public hasVoiceFor(lang: SpeechLanguage): boolean {
    if (!this.isSupported()) return false;
    const voices = this.getVoices();
    const prefix = lang === 'ar' ? 'ar' : lang === 'bn' ? 'bn' : 'en';
    return voices.some((v) => v.lang.toLowerCase().startsWith(prefix));
  }

  /**
   * Splits a long text into speech-friendly natural sentences/phrases
   * to prevent browser synthesis timeouts on long narrations.
   */
  private splitText(text: string, lang: SpeechLanguage): string[] {
    if (!text) return [];

    // Clean up excessive whitespace
    const clean = text.replace(/\s+/g, ' ').trim();

    if (lang === 'ar') {
      // Split on Arabic sentence boundaries: periods, commas, semicolons, question marks
      const segments = clean.split(/([.،؛؟\n]+)/);
      const chunks: string[] = [];
      let temp = '';

      for (let i = 0; i < segments.length; i++) {
        temp += segments[i];
        if (temp.length >= 100 || i === segments.length - 1) {
          if (temp.trim()) chunks.push(temp.trim());
          temp = '';
        }
      }
      return chunks.length > 0 ? chunks : [clean];
    } else if (lang === 'bn') {
      // Split on Bengali Dari (।), double-danda (॥), commas, question marks, exclamation
      const segments = clean.split(/([।॥,!?\n]+)/);
      const chunks: string[] = [];
      let temp = '';

      for (let i = 0; i < segments.length; i++) {
        temp += segments[i];
        if (temp.length >= 100 || i === segments.length - 1) {
          if (temp.trim()) chunks.push(temp.trim());
          temp = '';
        }
      }
      return chunks.length > 0 ? chunks : [clean];
    } else {
      // English
      const segments = clean.split(/([.?!,;\n]+)/);
      const chunks: string[] = [];
      let temp = '';

      for (let i = 0; i < segments.length; i++) {
        temp += segments[i];
        if (temp.length >= 120 || i === segments.length - 1) {
          if (temp.trim()) chunks.push(temp.trim());
          temp = '';
        }
      }
      return chunks.length > 0 ? chunks : [clean];
    }
  }

  private pickVoice(lang: SpeechLanguage): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices.length) return null;

    const langCode = lang === 'ar' ? 'ar' : lang === 'bn' ? 'bn' : 'en';

    // 1. Try to find local natural / high quality voice for the dialect
    const primary = voices.find((v) => {
      const vLang = v.lang.toLowerCase();
      if (lang === 'ar') return vLang === 'ar-sa' || vLang === 'ar-eg' || vLang.startsWith('ar');
      if (lang === 'bn') return vLang === 'bn-bd' || vLang === 'bn-in' || vLang.startsWith('bn');
      return vLang === 'en-us' || vLang === 'en-gb' || vLang.startsWith('en');
    });

    return primary || voices.find((v) => v.lang.toLowerCase().startsWith(langCode)) || null;
  }

  public speak(id: string, text: string, options: TTSOptions): void {
    if (!this.isSupported()) {
      options.onError?.(new Error('Speech synthesis not supported in this browser'));
      return;
    }

    // Stop existing speech
    this.stop();

    this.activeId = id;
    this.currentOptions = options;
    this.chunks = this.splitText(text, options.lang);
    this.currentChunkIndex = 0;
    this.isCurrentlyPlaying = true;
    this.isCurrentlyPaused = false;

    if (this.chunks.length === 0) {
      options.onEnd?.();
      return;
    }

    options.onStart?.();
    this.speakCurrentChunk();
  }

  private speakCurrentChunk(): void {
    if (!this.isCurrentlyPlaying || !this.currentOptions) return;

    if (this.currentChunkIndex >= this.chunks.length) {
      this.stop();
      return;
    }

    const chunk = this.chunks[this.currentChunkIndex];
    const utterance = new SpeechSynthesisUtterance(chunk);

    // Language code
    const lang = this.currentOptions.lang;
    utterance.lang = lang === 'ar' ? 'ar-SA' : lang === 'bn' ? 'bn-BD' : 'en-US';

    // Voice
    const voice = this.pickVoice(lang);
    if (voice) {
      utterance.voice = voice;
    }

    // Rate & Pitch
    // For Arabic, slightly slower rate (0.9x) gives clearer tajweed/diacritics pronunciation
    const defaultRate = lang === 'ar' ? 0.9 : 1.0;
    utterance.rate = this.currentOptions.rate ?? defaultRate;
    utterance.pitch = this.currentOptions.pitch ?? 1.0;
    utterance.volume = this.currentOptions.volume ?? 1.0;

    utterance.onstart = () => {
      this.currentOptions?.onChunkChange?.(this.currentChunkIndex, this.chunks.length);
      this.startKeepAlive();
    };

    utterance.onend = () => {
      this.stopKeepAlive();
      if (!this.isCurrentlyPlaying) return;

      this.currentChunkIndex++;
      if (this.currentChunkIndex < this.chunks.length) {
        this.speakCurrentChunk();
      } else {
        const onEnd = this.currentOptions?.onEnd;
        this.stop();
        onEnd?.();
      }
    };

    utterance.onerror = (e) => {
      this.stopKeepAlive();
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        this.currentOptions?.onError?.(e);
      }
      this.stop();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Chrome bug workaround: speech synthesis can get stuck if pause is called or audio is long.
   * Periodically calling resume keeps the utterance active.
   */
  private startKeepAlive(): void {
    this.stopKeepAlive();
    this.keepAliveInterval = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 14000);
  }

  private stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  public pause(): void {
    if (!this.isSupported() || !this.isCurrentlyPlaying || this.isCurrentlyPaused) return;
    this.stopKeepAlive();
    window.speechSynthesis.pause();
    this.isCurrentlyPaused = true;
    this.currentOptions?.onPause?.();
  }

  public resume(): void {
    if (!this.isSupported() || !this.isCurrentlyPlaying || !this.isCurrentlyPaused) return;
    window.speechSynthesis.resume();
    this.isCurrentlyPaused = false;
    this.startKeepAlive();
    this.currentOptions?.onResume?.();
  }

  public stop(): void {
    if (!this.isSupported()) return;
    this.stopKeepAlive();
    this.isCurrentlyPlaying = false;
    this.isCurrentlyPaused = false;
    this.currentChunkIndex = 0;
    this.chunks = [];
    this.activeId = null;
    this.currentUtterance = null;
    window.speechSynthesis.cancel();
  }

  public getActiveId(): string | null {
    return this.activeId;
  }

  public isPlaying(id?: string): boolean {
    if (!id) return this.isCurrentlyPlaying && !this.isCurrentlyPaused;
    return this.activeId === id && this.isCurrentlyPlaying && !this.isCurrentlyPaused;
  }

  public isPaused(id?: string): boolean {
    if (!id) return this.isCurrentlyPaused;
    return this.activeId === id && this.isCurrentlyPaused;
  }
}

export const hadithSpeech = new HadithSpeechService();
