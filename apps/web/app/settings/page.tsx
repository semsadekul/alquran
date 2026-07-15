'use client';

import { useEffect, useState } from 'react';
import { getSettings, type LegacySettings } from '@/lib/storage/indexeddb';

const defaultSettings: LegacySettings = {
  theme: 'dark',
  arabicFont: 'amiri',
  fontSizeMultiplier: 1.0,
  showArabic: true,
  showTransliteration: true,
  showBangla: true,
  showBanglaTransliteration: true,
  showEnglish: true,
  sidebarCollapsed: false
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<LegacySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then(data => { if (data) setSettings(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="empty-state">Loading settings…</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <section className="page-hero">
        <p className="eyebrow">Settings</p>
        <h1>Settings & Display</h1>
        <p className="lede">Adjust reading density, typography, language visibility, and theme comfort.</p>
      </section>

      <div className="settings-groups">
        <div className="settings-group">
          <h3>Display Options</h3>
          <SettingToggle label="Arabic Text" description="Show original Arabic Uthmani script" checked={settings.showArabic} />
          <SettingToggle label="Transliteration" description="Show English phonetic pronunciation" checked={settings.showTransliteration} />
          <SettingToggle label="Bangla Meaning" description="Show Muhiuddin Khan Bengali translation" checked={settings.showBangla} />
          <SettingToggle label="Bangla Pronunciation" description="Show Bengali phonetic pronunciation" checked={settings.showBanglaTransliteration} />
          <SettingToggle label="English Meaning" description="Show Saheeh International translation" checked={settings.showEnglish} />
        </div>

        <div className="settings-group">
          <h3>Visual Style</h3>
          <div className="setting-row">
            <div>
              <div className="setting-label">Arabic Font</div>
              <div className="setting-desc">{settings.arabicFont === 'amiri' ? 'Amiri (Classical)' : 'Scheherazade New (Thin)'}</div>
            </div>
          </div>
          <div className="setting-row">
            <div>
              <div className="setting-label">Font Scale</div>
              <div className="setting-desc">{Math.round(settings.fontSizeMultiplier * 100)}%</div>
            </div>
          </div>
          <div className="setting-row">
            <div>
              <div className="setting-label">Theme</div>
              <div className="setting-desc">{settings.theme === 'dark' ? 'Emerald Dark' : 'Sage Light'}</div>
            </div>
          </div>
        </div>
      </div>

      <p className="settings-note">
        Settings are read from your existing app. Editing will be supported once the new app has full IndexedDB write access.
      </p>
    </div>
  );
}

function SettingToggle({ label, description, checked }: { label: string; description: string; checked: boolean }) {
  return (
    <div className="setting-row">
      <div>
        <div className="setting-label">{label}</div>
        <div className="setting-desc">{description}</div>
      </div>
      <div className={`toggle-indicator ${checked ? 'on' : 'off'}`}>
        {checked ? 'On' : 'Off'}
      </div>
    </div>
  );
}
