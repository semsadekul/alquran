'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { parseAyahReference } from '@/lib/reference';

/**
 * Global Cmd+K / Ctrl+K palette. Accepts an ayah reference such as "2:255",
 * "2 255", "baqarah 255" or "২:২৫৫" and jumps straight to that verse.
 */
export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setError(false);
    }
  }, [isOpen]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = parseAyahReference(query);
    if (!ref) {
      setError(true);
      return;
    }
    setIsOpen(false);
    router.push(`/quran/surahs/${ref.surah.number}#ayah-${ref.ayah}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Go to ayah" size="sm">
      <form onSubmit={submit} className="space-y-3">
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setError(false);
          }}
          placeholder="2:255 · baqarah 255 · ২:২৫৫"
          aria-label="Ayah reference"
          aria-invalid={error}
          className="w-full px-3 py-2.5 rounded-xl border border-gold-line bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
        {error && (
          <p role="alert" className="text-sm text-error">
            No such ayah. Try a form like 2:255.
          </p>
        )}
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-forest text-forest-ink font-medium"
        >
          Go
        </button>
      </form>
    </Modal>
  );
}
