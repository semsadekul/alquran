'use client';

import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';

interface ReaderSettings {
  arabicSize: number;
  arabicLineHeight: number;
  translationSize: number;
  showTransliteration: boolean;
  showBanglaPronunciation: boolean;
}

interface ReaderSettingsProps {
  onChange: (settings: ReaderSettings) => void;
}

const STORAGE_KEY = 'alquran_reader_settings';

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  arabicSize: 28,
  arabicLineHeight: 2.4,
  translationSize: 16,
  showTransliteration: true,
  showBanglaPronunciation: true,
};

export function loadReaderSettings(): ReaderSettings {
  if (typeof window === 'undefined') return DEFAULT_READER_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored
      ? { ...DEFAULT_READER_SETTINGS, ...JSON.parse(stored) }
      : DEFAULT_READER_SETTINGS;
  } catch {
    return DEFAULT_READER_SETTINGS;
  }
}

export function saveReaderSettings(settings: ReaderSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function ReaderSettings({ onChange }: ReaderSettingsProps) {
  const intl = useIntl();
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_READER_SETTINGS);
  const [showPanel, setShowPanel] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSettings(loadReaderSettings());
  }, []);

  const update = (patch: Partial<ReaderSettings>) => {
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
        <div className="absolute right-0 top-12 z-50 w-72 bg-surface border border-border rounded-xl shadow-xl p-4 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-text">
              {intl.formatMessage({ id: 'readerSettings.title' })}
            </h4>
            <button
              onClick={() => setShowPanel(false)}
              className="text-text/50 hover:text-text"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Arabic size */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-text/70 mb-2">
              <span>{intl.formatMessage({ id: 'readerSettings.arabicSize' })}</span>
              <span className="font-medium text-text">{settings.arabicSize}px</span>
            </div>
            <input
              type="range"
              min={20}
              max={44}
              step={2}
              value={settings.arabicSize}
              onChange={(e) => update({ arabicSize: Number(e.target.value) })}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Arabic line height */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-text/70 mb-2">
              <span>{intl.formatMessage({ id: 'readerSettings.lineHeight' })}</span>
              <span className="font-medium text-text">{settings.arabicLineHeight.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={1.8}
              max={3.2}
              step={0.1}
              value={settings.arabicLineHeight}
              onChange={(e) => update({ arabicLineHeight: Number(e.target.value) })}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Translation size */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-text/70 mb-2">
              <span>{intl.formatMessage({ id: 'readerSettings.translationSize' })}</span>
              <span className="font-medium text-text">{settings.translationSize}px</span>
            </div>
            <input
              type="range"
              min={13}
              max={22}
              step={1}
              value={settings.translationSize}
              onChange={(e) => update({ translationSize: Number(e.target.value) })}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Transliteration toggle */}
          <div className="mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showTransliteration}
                onChange={(e) => update({ showTransliteration: e.target.checked })}
                className="rounded border-border text-gold-dark focus:ring-gold-dark/30"
              />
              <span className="text-sm text-text">
                {intl.formatMessage({ id: 'readerSettings.showTransliteration' })}
              </span>
            </label>
          </div>

          {/* Bangla pronunciation toggle */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showBanglaPronunciation}
                onChange={(e) => update({ showBanglaPronunciation: e.target.checked })}
                className="rounded border-border text-gold-dark focus:ring-gold-dark/30"
              />
              <span className="text-sm text-text">
                {intl.formatMessage({ id: 'readerSettings.showBanglaPronunciation' })}
              </span>
            </label>
          </div>

          {/* Reset */}
          <button
            onClick={() => update(DEFAULT_READER_SETTINGS)}
            className="w-full py-2 rounded-lg text-sm text-primary hover:bg-primary/10 transition-colors"
          >
            {intl.formatMessage({ id: 'readerSettings.reset' })}
          </button>
        </div>
      )}
    </div>
  );
}
