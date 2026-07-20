'use client';

import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLocale } from '@/components/providers/LocaleProvider';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ReaderPreferences } from '@alquran/types';
import { Sun, Moon, Monitor } from 'lucide-react';

const defaultPrefs: ReaderPreferences = {
  theme: 'dark',
  arabicFontSize: 38,
  banglaFontSize: 16,
  englishFontSize: 15,
  showArabic: true,
  showBangla: true,
  showEnglish: true,
  showTransliteration: false,
  showBanglaTransliteration: false,
  lineSpacing: 'normal',
  readingMode: 'study',
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const [preferences, setPreferences] = useLocalStorage<ReaderPreferences>(
    'alquran_preferences',
    defaultPrefs,
  );

  const updatePref = (partial: Partial<ReaderPreferences>) => {
    setPreferences({ ...preferences, ...partial });
  };

  return (
    <PageShell
      title={t('settings.title')}
      eyebrow="Settings"
      lede="Adjust reading density, typography, language visibility, and theme comfort."
    >
      <div className="space-y-6 max-w-2xl">
        {/* Theme */}
        <Card>
          <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
            {theme === 'dark' ? <Moon size={18} /> : theme === 'light' ? <Sun size={18} /> : <Monitor size={18} />}
            {t('settings.theme')}
          </h3>
          <SegmentedControl
            segments={[
              { id: 'light', label: t('settings.light') },
              { id: 'dark', label: t('settings.dark') },
              { id: 'system', label: t('settings.system') },
            ]}
            value={theme}
            onChange={(id) => setTheme(id as 'light' | 'dark' | 'system')}
          />
        </Card>

        {/* Language */}
        <Card>
          <h3 className="font-semibold text-ink mb-4">{t('settings.language')}</h3>
          <SegmentedControl
            segments={[
              { id: 'bn', label: t('settings.bangla') },
              { id: 'en', label: t('settings.english') },
            ]}
            value={locale}
            onChange={(id) => setLocale(id as 'en' | 'bn')}
          />
        </Card>

        {/* Font Size */}
        <Card>
          <h3 className="font-semibold text-ink mb-4">{t('settings.font_size')}</h3>
          <div className="space-y-4">
            <div>
              <label className="flex justify-between text-sm text-ink-2 mb-2">
                <span>{t('settings.arabic_size')}</span>
                <span className="font-mono text-ink-4">{preferences.arabicFontSize}px</span>
              </label>
              <input
                type="range"
                min="28"
                max="60"
                value={preferences.arabicFontSize}
                onChange={(e) => updatePref({ arabicFontSize: Number(e.target.value) })}
                className="w-full accent-majestic-gold"
              />
            </div>
            <div>
              <label className="flex justify-between text-sm text-ink-2 mb-2">
                <span>{t('settings.translation_size')}</span>
                <span className="font-mono text-ink-4">{preferences.banglaFontSize}px</span>
              </label>
              <input
                type="range"
                min="13"
                max="22"
                value={preferences.banglaFontSize}
                onChange={(e) =>
                  updatePref({
                    banglaFontSize: Number(e.target.value),
                    englishFontSize: Number(e.target.value) - 1,
                  })
                }
                className="w-full accent-majestic-gold"
              />
            </div>
          </div>
        </Card>

        {/* Display Options */}
        <Card>
          <h3 className="font-semibold text-ink mb-4">Display Options</h3>
          <div className="space-y-4">
            <SettingRow
              label="Arabic Text"
              description="Show original Arabic Uthmani script"
              checked={preferences.showArabic}
              onChange={(v) => updatePref({ showArabic: v })}
            />
            <SettingRow
              label="Bangla Translation"
              description="Show Muhiuddin Khan Bengali translation"
              checked={preferences.showBangla}
              onChange={(v) => updatePref({ showBangla: v })}
            />
            <SettingRow
              label="English Translation"
              description="Show Saheeh International translation"
              checked={preferences.showEnglish}
              onChange={(v) => updatePref({ showEnglish: v })}
            />
            <SettingRow
              label="Transliteration"
              description="Show English phonetic pronunciation"
              checked={preferences.showTransliteration}
              onChange={(v) => updatePref({ showTransliteration: v })}
            />
            <SettingRow
              label="Bangla Pronunciation"
              description="Show Bengali phonetic pronunciation"
              checked={preferences.showBanglaTransliteration}
              onChange={(v) => updatePref({ showBanglaTransliteration: v })}
            />
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

function SettingRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium text-ink">{label}</div>
        <div className="text-xs text-ink-3">{description}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}
