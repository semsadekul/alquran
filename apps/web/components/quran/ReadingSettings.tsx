'use client';

import { Settings, X } from 'lucide-react';
import { useState } from 'react';
import { ReaderPreferences } from '@alquran/types';

interface ReadingSettingsProps {
  preferences: ReaderPreferences;
  onChange: (newPrefs: Partial<ReaderPreferences>) => void;
}

export function ReadingSettings({ preferences, onChange }: ReadingSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="settings-trigger-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Reading Settings"
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <div className="settings-overlay" onClick={() => setIsOpen(false)}>
          <div className="settings-panel" onClick={e => e.stopPropagation()}>
            <div className="settings-header">
              <h3>Reading Settings</h3>
              <button onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>

            <div className="settings-section">
              <label>Arabic Font Size: {preferences.arabicFontSize}px</label>
              <input 
                type="range" 
                min="28" max="60" 
                value={preferences.arabicFontSize}
                onChange={e => onChange({ arabicFontSize: Number(e.target.value) })}
              />
            </div>

            <div className="settings-section">
              <label>Translation Font Size: {preferences.banglaFontSize}px</label>
              <input 
                type="range" 
                min="13" max="22" 
                value={preferences.banglaFontSize}
                onChange={e => onChange({ 
                  banglaFontSize: Number(e.target.value),
                  englishFontSize: Number(e.target.value) - 1 // keep english slightly smaller
                })}
              />
            </div>

            <div className="settings-section toggles">
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={preferences.showArabic}
                  onChange={e => onChange({ showArabic: e.target.checked })}
                />
                Show Arabic
              </label>
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={preferences.showBangla}
                  onChange={e => onChange({ showBangla: e.target.checked })}
                />
                Show Bangla Translation
              </label>
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={preferences.showEnglish}
                  onChange={e => onChange({ showEnglish: e.target.checked })}
                />
                Show English Translation
              </label>
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={preferences.showTransliteration}
                  onChange={e => onChange({ showTransliteration: e.target.checked })}
                />
                Show Transliteration (English)
              </label>
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={preferences.showBanglaTransliteration}
                  onChange={e => onChange({ showBanglaTransliteration: e.target.checked })}
                />
                Show Bangla Pronunciation
              </label>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .settings-trigger-btn {
          background: var(--surface-muted);
          border: 1px solid var(--border);
          color: var(--text-2);
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .settings-trigger-btn:hover {
          color: var(--accent);
          border-color: var(--accent);
        }
        .settings-overlay {
          position: fixed;
          inset: 0;
          background: var(--overlay);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .settings-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          width: 90%;
          max-width: 400px;
          box-shadow: var(--shadow-xl);
          animation: fadeSlideUp 0.3s var(--ease-spring);
        }
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .settings-header h3 {
          margin: 0;
        }
        .settings-header button {
          background: none;
          border: none;
          color: var(--text-2);
          cursor: pointer;
        }
        .settings-section {
          margin-bottom: 24px;
        }
        .settings-section label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: var(--text-2);
        }
        .settings-section input[type="range"] {
          width: 100%;
          accent-color: var(--accent);
        }
        .toggles {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .toggle-label {
          display: flex !important;
          align-items: center;
          gap: 12px;
          margin: 0 !important;
          cursor: pointer;
        }
        .toggle-label input {
          width: 18px;
          height: 18px;
          accent-color: var(--accent);
        }
      `}</style>
    </>
  );
}
