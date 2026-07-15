'use client';

import { useState } from 'react';

interface OfflinePack {
  id: string;
  name: string;
  description: string;
  size: string;
  type: 'quran' | 'hadith' | 'book' | 'audio';
  installed: boolean;
  status: 'available' | 'preview';
}

const availablePacks: OfflinePack[] = [
  { id: 'quran-core', name: 'Quran Core', description: 'Arabic text, Bangla and English translations, transliteration for all 114 surahs.', size: '~15 MB', type: 'quran', installed: true, status: 'available' },
  { id: 'quran-pronunciation', name: 'Bangla Pronunciation', description: 'Bangla phonetic pronunciation guide for all verses.', size: '~3 MB', type: 'quran', installed: true, status: 'available' },
  { id: 'hadith-bukhari', name: 'Sahih al-Bukhari', description: 'Preview pack listing only. Full offline hadith reading is not connected yet.', size: '~25 MB', type: 'hadith', installed: false, status: 'preview' },
  { id: 'hadith-muslim', name: 'Sahih Muslim', description: 'Preview pack listing only. Full offline hadith reading is not connected yet.', size: '~22 MB', type: 'hadith', installed: false, status: 'preview' },
  { id: 'audio-alafasy', name: 'Mishary Alafasy Recitation', description: 'Preview listing for future full Quran recitation downloads.', size: '~1.2 GB', type: 'audio', installed: false, status: 'preview' }
];

export default function OfflinePage() {
  const [packs, setPacks] = useState(availablePacks);

  const togglePack = (id: string) => {
    setPacks(prev => prev.map(p => (p.id === id && p.status === 'available') ? { ...p, installed: !p.installed } : p));
  };

  const installedSize = packs.filter(p => p.installed).length;
  const totalSize = packs.length;

  return (
    <div className="page-container">
      <section className="page-hero">
        <p className="eyebrow">Offline</p>
        <h1>Offline Pack Manager</h1>
        <p className="lede">
          Manage offline reading packs. Quran text is available now. Some larger Hadith and audio packs are listed as previews until their full offline flow is connected.
        </p>
      </section>

      <div className="offline-stats">
        <div className="offline-stat">
          <strong>{installedSize}</strong>
          <small>of {totalSize} packs installed</small>
        </div>
        <div className="offline-stat">
          <strong>Always offline</strong>
          <small>Quran core text</small>
        </div>
      </div>

      <div className="packs-list">
        {packs.map(pack => (
          <div className="pack-card" key={pack.id}>
            <div className="pack-info">
              <div className="pack-header">
                <span className={`pack-type pack-type-${pack.type}`}>{pack.type}</span>
                <span className="pack-size">{pack.size}</span>
                <span className={`card-badge ${pack.status === 'preview' ? 'badge-coming' : 'badge-available'}`}>
                  {pack.status === 'preview' ? 'Preview' : 'Available'}
                </span>
              </div>
              <h3 className="pack-name">{pack.name}</h3>
              <p className="pack-desc">{pack.description}</p>
            </div>
            <button
              className={`pack-btn ${pack.installed ? 'pack-btn-remove' : 'pack-btn-install'}`}
              onClick={() => togglePack(pack.id)}
              disabled={pack.status === 'preview'}
            >
              {pack.status === 'preview' ? 'Not Active' : pack.installed ? 'Remove' : 'Download'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
