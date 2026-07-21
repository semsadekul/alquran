'use client';

import { Settings } from 'lucide-react';
import { useState } from 'react';
import { ReaderPreferences } from '@alquran/types';
import { Sheet } from '@/components/ui/Sheet';
import { Toggle } from '@/components/ui/Toggle';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';

interface ReadingSettingsProps {
  preferences: ReaderPreferences;
  onChange: (newPrefs: Partial<ReaderPreferences>) => void;
}

export function ReadingSettings({ preferences, onChange }: ReadingSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <IconButton
        ariaLabel="Reading Settings"
        onClick={() => setIsOpen(true)}
      >
        <Settings size={20} />
      </IconButton>

      <Sheet
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Reading Settings"
      >
        <div className="space-y-6">
          {/* Arabic Font Size */}
          <div>
            <label className="block text-sm font-medium text-ink-2 mb-2">
              Arabic Font Size: {preferences.arabicFontSize}px
            </label>
            <input
              type="range"
              min="28"
              max="60"
              value={preferences.arabicFontSize}
              onChange={(e) =>
                onChange({ arabicFontSize: Number(e.target.value) })
              }
              className="w-full accent-majestic-gold"
            />
          </div>

          {/* Translation Font Size */}
          <div>
            <label className="block text-sm font-medium text-ink-2 mb-2">
              Translation Font Size: {preferences.banglaFontSize}px
            </label>
            <input
              type="range"
              min="13"
              max="22"
              value={preferences.banglaFontSize}
              onChange={(e) =>
                onChange({
                  banglaFontSize: Number(e.target.value),
                  englishFontSize: Number(e.target.value) - 1,
                })
              }
              className="w-full accent-majestic-gold"
            />
          </div>

          {/* Line Spacing */}
          <div>
            <label className="block text-sm font-medium text-ink-2 mb-2">
              Line Spacing
            </label>
            <div className="flex gap-2">
              {(['compact', 'normal', 'spacious'] as const).map((spacing) => (
                <button
                  key={spacing}
                  type="button"
                  onClick={() => onChange({ lineSpacing: spacing })}
                  className={cn(
                    'flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
                    preferences.lineSpacing === spacing
                      ? 'bg-accent-subtle border-accent text-accent'
                      : 'bg-[var(--surface-muted)] border-[var(--border)] text-ink-3 hover:text-ink-2',
                  )}
                >
                  {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility Toggles */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-ink-2">Visibility</p>

            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-2">Show Arabic</span>
              <Toggle
                checked={preferences.showArabic}
                onChange={(checked) => onChange({ showArabic: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-2">Show Bangla Translation</span>
              <Toggle
                checked={preferences.showBangla}
                onChange={(checked) => onChange({ showBangla: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-2">Show English Translation</span>
              <Toggle
                checked={preferences.showEnglish}
                onChange={(checked) => onChange({ showEnglish: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-2">Show Urdu Translation</span>
              <Toggle
                checked={preferences.showUrdu}
                onChange={(checked) => onChange({ showUrdu: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-2">Show Transliteration</span>
              <Toggle
                checked={preferences.showTransliteration}
                onChange={(checked) =>
                  onChange({ showTransliteration: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-2">Bangla Pronunciation</span>
              <Toggle
                checked={preferences.showBanglaTransliteration}
                onChange={(checked) =>
                  onChange({ showBanglaTransliteration: checked })
                }
              />
            </div>
          </div>
        </div>
      </Sheet>
    </>
  );
}
