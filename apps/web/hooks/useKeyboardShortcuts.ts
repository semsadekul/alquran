import { useEffect } from 'react';

interface ShortcutsConfig {
  onNextVerse: () => void;
  onPrevVerse: () => void;
  onTogglePlay: () => void;
}

export function useKeyboardShortcuts({ onNextVerse, onPrevVerse, onTogglePlay }: ShortcutsConfig) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'j':
          e.preventDefault();
          onNextVerse();
          break;
        case 'k':
          e.preventDefault();
          onPrevVerse();
          break;
        case ' ': // spacebar
          e.preventDefault();
          onTogglePlay();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextVerse, onPrevVerse, onTogglePlay]);
}
