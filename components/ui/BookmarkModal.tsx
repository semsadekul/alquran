'use client';

import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  readBookmarkFolders,
  createBookmarkFolder,
  readBookmarks,
  moveBookmark,
  setBookmarkNote,
  toggleBookmark,
  type BookmarkFolder,
} from '@/lib/storage';

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  surah: number;
  ayah: number;
  surahName: string;
  onBookmarkChanged?: (bookmarked: boolean) => void;
}

export function BookmarkModal({
  isOpen,
  onClose,
  surah,
  ayah,
  surahName,
  onBookmarkChanged,
}: BookmarkModalProps) {
  const intl = useIntl();
  const [folders, setFolders] = useState<BookmarkFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const currentFolders = readBookmarkFolders();
    setFolders(currentFolders);

    const bookmarks = readBookmarks();
    const existing = bookmarks.find((b) => b.surah === surah && b.ayah === ayah);
    if (existing) {
      setIsBookmarked(true);
      setSelectedFolderId(existing.folderId ?? null);
      setNote(existing.note ?? '');
    } else {
      setIsBookmarked(false);
      setSelectedFolderId(null);
      setNote('');
    }
  }, [isOpen, surah, ayah]);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const folder = createBookmarkFolder(newFolderName.trim());
    if (folder) {
      setFolders(readBookmarkFolders());
      setSelectedFolderId(folder.id);
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  const handleSave = () => {
    if (!isBookmarked) {
      toggleBookmark(surah, ayah, surahName);
      setIsBookmarked(true);
    }
    moveBookmark(surah, ayah, selectedFolderId);
    setBookmarkNote(surah, ayah, note);
    onBookmarkChanged?.(true);
    onClose();
  };

  const handleRemove = () => {
    if (isBookmarked) {
      toggleBookmark(surah, ayah, surahName);
      onBookmarkChanged?.(false);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${surahName} · ${surah}:${ayah}`}
      size="md"
    >
      <div className="space-y-5 animate-fade-in">
        {/* Folder Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text/70">
              Folder / Collection
            </label>
            <button
              type="button"
              onClick={() => setShowNewFolder((v) => !v)}
              className="text-xs font-medium text-gold-dark hover:underline"
            >
              {showNewFolder ? 'Cancel' : '+ New Folder'}
            </button>
          </div>

          {showNewFolder && (
            <form onSubmit={handleCreateFolder} className="flex gap-2 mb-3">
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name (e.g. Duas, Friday)"
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gold-line bg-surface text-text focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <Button type="submit" variant="primary" size="sm">
                Add
              </Button>
            </form>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedFolderId(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                selectedFolderId === null
                  ? 'bg-forest text-forest-ink border-transparent shadow-sm'
                  : 'bg-surface text-text-muted border-gold-line hover:bg-surface-highlight'
              }`}
            >
              All Bookmarks
            </button>
            {folders.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFolderId(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  selectedFolderId === f.id
                    ? 'bg-forest text-forest-ink border-transparent shadow-sm'
                    : 'bg-surface text-text-muted border-gold-line hover:bg-surface-highlight'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        {/* Personal Tadabbur Note */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text/70 mb-2">
            Personal Reflection (Tadabbur Note)
          </label>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write your personal reflections, du'a intentions, or reminders for this verse…"
            className="w-full px-3 py-2 text-sm rounded-xl border border-gold-line bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          {isBookmarked ? (
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs font-medium text-error hover:underline"
            >
              Remove Bookmark
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save Bookmark
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
