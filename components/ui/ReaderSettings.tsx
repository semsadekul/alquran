'use client';

import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { BANGLA_TRANSLATIONS, ENGLISH_TRANSLATIONS } from '@/lib/data/translations';

export type ReadingMode = 'verse' | 'mushaf' | 'focus';
export type ArabicScript = 'uthmani' | 'indopak';

export interface ReaderSettingsState {
  arabicSize: number;
  arabicLineHeight: number;
  translationSize: number;
  readingMode: ReadingMode;
  arabicScript: ArabicScript;
  tajweedColors: boolean;
  showArabic: boolean;
  showBangla: boolean;
  showEnglish: boolean;
  showTransliteration: boolean;
  showWordByWord: boolean;
  showBanglaPronunciation: boolean;
  banglaEdition: string;
  englishEdition: string;
}

interface ReaderSettingsProps {
  onChange: (settings: ReaderSettingsState) => void;
}

const STORAGE_KEY = 'alquran_reader_settings';

export const DEFAULT_READER_SETTINGS: ReaderSettingsState = {
  arabicSize: 28,
  arabicLineHeight: 2.4,
  translationSize: 16,
  readingMode: 'verse',
  arabicScript: 'uthmani',
  tajweedColors: false,
  showArabic: true,
  showBangla: true,
  showEnglish: true,
  showTransliteration: true,
  showWordByWord: false,
  showBanglaPronunciation: true,
  banglaEdition: 'muhiuddin',
  englishEdition: 'sahih',
};

export function loadReaderSettings(): ReaderSettingsState {
  if (typeof window === 'undefined') return DEFAULT_READER_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_READER_SETTINGS;
    const parsed = JSON.parse(stored);
    return {
      ...DEFAULT_READER_SETTINGS,
      ...parsed,
      showTransliteration: parsed.showTransliteration ?? true,
      showBanglaPronunciation: parsed.showBanglaPronunciation ?? true,
    };
  } catch {
    return DEFAULT_READER_SETTINGS;
  }
}

export function saveReaderSettings(settings: ReaderSettingsState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function ReaderSettings({ onChange }: ReaderSettingsProps) {
  const intl = useIntl();
  const [settings, setSettings] = useState<ReaderSettingsState>(DEFAULT_READER_SETTINGS);
  const [showPanel, setShowPanel] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSettings(loadReaderSettings());
  }, []);

  const update = (patch: Partial<ReaderSettingsState>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveReaderSettings(next);
      onChange(next);
      return next;
    });
  };

  if (!mounted) return null;

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={() => setShowPanel((v) => !v)}
        className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-lg hover:bg-surface-highlight transition-colors"
        aria-label={intl.formatMessage({ id: 'readerSettings.title' })}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
        </svg>
      </button>

      {/* Panel */}
      {showPanel && (
        <div className="absolute right-0 top-12 z-50 w-80 max-h-[85vh] overflow-y-auto bg-surface border border-border rounded-xl shadow-xl p-4 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-text">
              {intl.formatMessage({ id: 'readerSettings.title' })}
            </h4>
            <button
              onClick={() => setShowPanel(false)}
              className="text-text/50 hover:text-text"
              aria-label={intl.formatMessage({ id: 'action.close' })}
            >
              ✕
            </button>
          </div>

          {/* Reading mode */}
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wider font-semibold text-text/70 mb-2">
              {intl.formatMessage({ id: 'readerSettings.mode' })}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {(['verse', 'mushaf', 'focus'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={settings.readingMode === mode}
                  onClick={() => update({ readingMode: mode })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                    settings.readingMode === mode
                      ? 'bg-forest text-forest-ink border-transparent shadow-sm'
                      : 'bg-surface text-text-muted border-gold-line hover:bg-surface-highlight'
                  }`}
                >
                  {intl.formatMessage({ id: `readerSettings.mode.${mode}` })}
                </button>
              ))}
            </div>
          </div>

          {/* Arabic Script Selection */}
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wider font-semibold text-text/70 mb-2">
              {intl.formatMessage({ id: 'readerSettings.script' })}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {(['uthmani', 'indopak'] as const).map((script) => (
                <button
                  key={script}
                  type="button"
                  aria-pressed={settings.arabicScript === script}
                  onClick={() => update({ arabicScript: script })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                    settings.arabicScript === script
                      ? 'bg-forest text-forest-ink border-transparent shadow-sm'
                      : 'bg-surface text-text-muted border-gold-line hover:bg-surface-highlight'
                  }`}
                >
                  {intl.formatMessage({ id: `readerSettings.script.${script}` })}
                </button>
              ))}
            </div>
          </div>

          {/* Tajweed Toggle */}
          <div className="mb-4 p-2.5 rounded-lg bg-surface-highlight/60 border border-gold-line">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-medium text-text">
                {intl.formatMessage({ id: 'readerSettings.tajweed' })}
              </span>
              <input
                type="checkbox"
                checked={settings.tajweedColors}
                onChange={(e) => update({ tajweedColors: e.target.checked })}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Visible layers */}
          <fieldset className="mb-4 space-y-2">
            <legend className="text-xs uppercase tracking-wider font-semibold text-text/70 mb-2">
              {intl.formatMessage({ id: 'readerSettings.layers' })}
            </legend>
            <div className="grid grid-cols-1 gap-2">
              {(
                [
                  'showArabic',
                  'showBangla',
                  'showEnglish',
                  'showTransliteration',
                  'showWordByWord',
                  'showBanglaPronunciation',
                ] as const
              ).map((key) => (
                <label key={key} className="flex items-center gap-2.5 text-xs text-text cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={(e) => update({ [key]: e.target.checked } as Partial<ReaderSettingsState>)}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                  {intl.formatMessage({ id: `readerSettings.${key}` })}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Translation Editions */}
          <div className="mb-4 space-y-3">
            {settings.showBangla && (
              <div>
                <label htmlFor="reader-bn-translation" className="block text-xs font-medium text-text/70 mb-1">
                  বাংলা অনুবাদ (Bengali Translation):
                </label>
                <select
                  id="reader-bn-translation"
                  value={settings.banglaEdition || 'muhiuddin'}
                  onChange={(e) => update({ banglaEdition: e.target.value })}
                  className="w-full text-xs bg-surface-highlight border border-border-subtle rounded-lg px-2.5 py-1.5 text-text font-medium focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  {BANGLA_TRANSLATIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.banglaName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {settings.showEnglish && (
              <div>
                <label htmlFor="reader-en-translation" className="block text-xs font-medium text-text/70 mb-1">
                  English Translation:
                </label>
                <select
                  id="reader-en-translation"
                  value={settings.englishEdition || 'sahih'}
                  onChange={(e) => update({ englishEdition: e.target.value })}
                  className="w-full text-xs bg-surface-highlight border border-border-subtle rounded-lg px-2.5 py-1.5 text-text font-medium focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  {ENGLISH_TRANSLATIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Arabic size */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-text/70 mb-1.5">
              <span>{intl.formatMessage({ id: 'readerSettings.arabicSize' })}</span>
              <span className="font-medium text-text tabular-nums">{settings.arabicSize}px</span>
            </div>
            <input
              type="range"
              min={20}
              max={44}
              step={2}
              value={settings.arabicSize}
              onChange={(e) => update({ arabicSize: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Arabic line height */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-text/70 mb-1.5">
              <span>{intl.formatMessage({ id: 'readerSettings.lineHeight' })}</span>
              <span className="font-medium text-text tabular-nums">{settings.arabicLineHeight.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={1.8}
              max={3.2}
              step={0.1}
              value={settings.arabicLineHeight}
              onChange={(e) => update({ arabicLineHeight: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Translation size */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-text/70 mb-1.5">
              <span>{intl.formatMessage({ id: 'readerSettings.translationSize' })}</span>
              <span className="font-medium text-text tabular-nums">{settings.translationSize}px</span>
            </div>
            <input
              type="range"
              min={13}
              max={22}
              step={1}
              value={settings.translationSize}
              onChange={(e) => update({ translationSize: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Reset */}
          <button
            onClick={() => update(DEFAULT_READER_SETTINGS)}
            className="w-full py-2 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            {intl.formatMessage({ id: 'readerSettings.reset' })}
          </button>
        </div>
      )}
    </div>
  );
}
