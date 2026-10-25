'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Card } from '@/components/ui/Card';
import {
  bookmarkKey,
  createBookmarkFolder,
  deleteBookmarkFolder,
  moveBookmark,
  readBookmarkFolders,
  readBookmarks,
  setBookmarkNote,
  toggleBookmark,
  updateBookmarkFolder,
  type BookmarkEntry,
  type BookmarkFolder,
} from '@/lib/storage';

/** 'all' | 'unfiled' | a folder id. */
type Filter = string;

const ALL: Filter = 'all';
const UNFILED: Filter = 'unfiled';

export default function BookmarksPage() {
  const intl = useIntl();
  const [items, setItems] = useState<BookmarkEntry[]>([]);
  const [folders, setFolders] = useState<BookmarkFolder[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<Filter>(ALL);
  // Folder being created or renamed; null when no form is open.
  const [newFolderName, setNewFolderName] = useState<string | null>(null);
  const [folderNameDraft, setFolderNameDraft] = useState('');
  const [folderError, setFolderError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [noteKey, setNoteKey] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const label = (id: string) => intl.formatMessage({ id });

  // Bookmarks live in localStorage, so they are read after mount.
  useEffect(() => {
    setItems([...readBookmarks()].sort((a, b) => b.addedAt - a.addedAt));
    setFolders(readBookmarkFolders());
    setLoaded(true);
  }, []);

  const reload = () => {
    setItems([...readBookmarks()].sort((a, b) => b.addedAt - a.addedAt));
    setFolders(readBookmarkFolders());
  };

  const counts = useMemo(() => {
    const byFolder = new Map<string, number>();
    let unfiled = 0;
    items.forEach((entry) => {
      const id = entry.folderId ?? null;
      if (!id) unfiled += 1;
      else byFolder.set(id, (byFolder.get(id) ?? 0) + 1);
    });
    return { byFolder, unfiled };
  }, [items]);

  const visible = useMemo(() => {
    if (filter === ALL) return items;
    if (filter === UNFILED) return items.filter((entry) => !entry.folderId);
    return items.filter((entry) => entry.folderId === filter);
  }, [items, filter]);

  const activeFolder = folders.find((folder) => folder.id === filter) ?? null;

  const remove = (entry: BookmarkEntry) => {
    toggleBookmark(entry.surah, entry.ayah, entry.surahName);
    setItems((prev) => prev.filter((b) => !(b.surah === entry.surah && b.ayah === entry.ayah)));
  };

  const move = (entry: BookmarkEntry, folderId: string | null) => {
    moveBookmark(entry.surah, entry.ayah, folderId);
    reload();
  };

  const submitFolder = () => {
    if (newFolderName === null) return;
    const created = createBookmarkFolder(newFolderName);
    setNewFolderName(null);
    if (created) {
      reload();
      setFilter(created.id);
    }
  };

  const submitRename = () => {
    if (!activeFolder) return;
    const next = updateBookmarkFolder(activeFolder.id, { name: folderNameDraft });
    const renamed = next.find((folder) => folder.id === activeFolder.id);
    if (renamed && renamed.name !== folderNameDraft.trim()) {
      // updateBookmarkFolder silently rejects duplicates and blank names.
      setFolderError(label('bookmarks.folders.duplicate'));
      setFolderNameDraft(renamed.name);
      return;
    }
    setFolderError(null);
    setFolders(next);
  };

  const openNote = (entry: BookmarkEntry) => {
    setNoteKey(bookmarkKey(entry));
    setNoteDraft(entry.note ?? '');
  };

  const saveNote = (entry: BookmarkEntry) => {
    setBookmarkNote(entry.surah, entry.ayah, noteDraft);
    setNoteKey(null);
    reload();
  };

  const chipClass = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
      active
        ? 'border-gold bg-gold/15 text-gold-dark font-medium'
        : 'border-gold-line bg-surface text-text-muted hover:text-text'
    }`;

  return (
    <div className="space-y-4 animate-fade-in">
      <header className="pt-2">
        <h1 className="bangla-display text-[24px] font-semibold text-text">
          {label('more.bookmarks')}
        </h1>
      </header>

      {/* ─── Folder filters ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setFilter(ALL)} className={chipClass(filter === ALL)}>
          {label('bookmarks.folders.all')}
          <span className="ml-1 text-text/40">{items.length}</span>
        </button>

        {folders.length > 0 && (
          <button
            type="button"
            onClick={() => setFilter(UNFILED)}
            className={chipClass(filter === UNFILED)}
          >
            {label('bookmarks.folders.unfiled')}
            <span className="ml-1 text-text/40">{counts.unfiled}</span>
          </button>
        )}

        {folders.map((folder) => (
          <button
            key={folder.id}
            type="button"
            onClick={() => {
              setFilter(folder.id);
              setFolderNameDraft(folder.name);
              setFolderError(null);
            }}
            className={chipClass(filter === folder.id)}
          >
            {folder.name}
            <span className="ml-1 text-text/40">{counts.byFolder.get(folder.id) ?? 0}</span>
          </button>
        ))}

        {newFolderName === null ? (
          <button
            type="button"
            onClick={() => setNewFolderName('')}
            className="rounded-full border border-dashed border-gold-line px-3 py-1.5 text-[13px] text-text-muted hover:text-text hover:border-gold/40 transition-colors"
          >
            + {label('bookmarks.folders.new')}
          </button>
        ) : (
          <span className="flex items-center gap-1.5">
            <input
              autoFocus
              value={newFolderName}
              onChange={(event) => setNewFolderName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submitFolder();
                if (event.key === 'Escape') setNewFolderName(null);
              }}
              placeholder={label('bookmarks.folders.placeholder')}
              maxLength={60}
              aria-label={label('bookmarks.folders.placeholder')}
              className="rounded-full border border-gold-line bg-surface px-3 py-1.5 text-[13px] text-text outline-none focus:border-gold/50 w-40"
            />
            <button
              type="button"
              onClick={submitFolder}
              className="text-[13px] text-gold-dark hover:underline"
            >
              {label('bookmarks.folders.create')}
            </button>
            <button
              type="button"
              onClick={() => setNewFolderName(null)}
              className="text-[13px] text-text-muted hover:text-text"
            >
              {label('bookmarks.folders.cancel')}
            </button>
          </span>
        )}
      </div>

      {/* ─── Manage the selected folder ─────────────────────────────── */}
      {activeFolder && (
        <Card className="rounded-card border-gold-line bg-surface px-5 py-4 space-y-3">
          <input
            value={folderNameDraft}
            onChange={(event) => {
              setFolderNameDraft(event.target.value);
              setFolderError(null);
            }}
            onBlur={submitRename}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submitRename();
              if (event.key === 'Escape') {
                setFolderNameDraft(activeFolder.name);
                setFolderError(null);
              }
            }}
            maxLength={60}
            aria-label={label('bookmarks.folders.rename')}
            className="w-full rounded-md border border-gold-line bg-surface px-3 py-1.5 text-[14px] text-text outline-none focus:border-gold/50"
          />
          {folderError && <p className="text-[12px] text-error">{folderError}</p>}

          {confirmingDelete ? (
            <div className="flex items-center gap-3">
              <p className="text-[12px] text-text-muted">{label('bookmarks.folders.deleteHint')}</p>
              <button
                type="button"
                onClick={() => {
                  setFolders(deleteBookmarkFolder(activeFolder.id));
                  setConfirmingDelete(false);
                  setFilter(ALL);
                  reload();
                }}
                className="text-[13px] text-error hover:underline"
              >
                {label('bookmarks.folders.delete')}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="text-[13px] text-text-muted hover:text-text"
              >
                {label('bookmarks.folders.cancel')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-[13px] text-text-muted hover:text-error"
            >
              {label('bookmarks.folders.delete')}
            </button>
          )}
        </Card>
      )}

      {/* ─── Empty states ───────────────────────────────────────────── */}
      {loaded && items.length === 0 && (
        <Card className="rounded-card border-gold-line bg-surface px-5 py-8 text-center">
          <p className="text-[14px] text-text-muted">{label('bookmarks.empty')}</p>
        </Card>
      )}

      {loaded && items.length > 0 && visible.length === 0 && (
        <Card className="rounded-card border-gold-line bg-surface px-5 py-8 text-center">
          <p className="text-[14px] text-text-muted">{label('bookmarks.emptyFolder')}</p>
        </Card>
      )}

      {/* ─── Bookmark list ──────────────────────────────────────────── */}
      <ul className="space-y-2.5">
        {visible.map((entry) => {
          const key = bookmarkKey(entry);
          const editingNote = noteKey === key;
          return (
            <li key={key}>
              <Card className="rounded-card border-gold-line bg-surface px-5 py-4 space-y-3">
                <div className="flex items-center gap-4">
                  <Link
                    href={`/quran/surahs/${entry.surah}#ayah-${entry.ayah}`}
                    className="flex-1 min-w-0 block"
                  >
                    <span className="block text-[15px] font-medium text-text truncate">
                      {entry.surahName ?? `Surah ${entry.surah}`} {entry.surah}:{entry.ayah}
                    </span>
                    {!editingNote && entry.note && (
                      <span className="block text-[12px] text-text-muted truncate">
                        {entry.note}
                      </span>
                    )}
                  </Link>

                  <button
                    type="button"
                    onClick={() => (editingNote ? setNoteKey(null) : openNote(entry))}
                    className="text-[13px] text-text-muted hover:text-text shrink-0"
                  >
                    {entry.note ? label('bookmarks.note') : label('bookmarks.noteAdd')}
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(entry)}
                    aria-label={label('bookmarks.removeLabel')}
                    className="text-[13px] text-text-muted hover:text-text shrink-0"
                  >
                    {label('bookmarks.remove')}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor={`move-${key}`} className="text-[12px] text-text-muted shrink-0">
                    {label('bookmarks.move')}
                  </label>
                  <select
                    id={`move-${key}`}
                    value={entry.folderId ?? ''}
                    onChange={(event) => move(entry, event.target.value || null)}
                    className="flex-1 rounded-md border border-gold-line bg-surface px-2 py-1.5 text-[13px] text-text outline-none focus:border-gold/50"
                  >
                    <option value="">{label('bookmarks.folders.unfiled')}</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>

                {editingNote && (
                  <div className="space-y-2">
                    <textarea
                      autoFocus
                      value={noteDraft}
                      onChange={(event) => setNoteDraft(event.target.value)}
                      rows={2}
                      maxLength={500}
                      placeholder={label('bookmarks.notePlaceholder')}
                      aria-label={label('bookmarks.note')}
                      className="w-full rounded-md border border-gold-line bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-gold/50 resize-y"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => saveNote(entry)}
                        className="text-[13px] text-gold-dark hover:underline"
                      >
                        {label('bookmarks.noteSave')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoteKey(null)}
                        className="text-[13px] text-text-muted hover:text-text"
                      >
                        {label('bookmarks.folders.cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
