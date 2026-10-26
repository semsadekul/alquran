'use client';

import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useLocale } from '@/components/providers/LocaleProvider';
import { BookmarkIcon, CopyIcon, ShareIcon, CheckIcon, ImageIcon, PlayIcon } from '@/components/ui/Icon';
import { isHadithSaved, toggleSavedHadith, SavedHadithEntry } from '@/lib/hadith-storage';
import { hadithAudioManager, HadithAudioLang } from '@/lib/speech/hadith-audio-manager';
import { ShareHadithModal } from './ShareHadithModal';
import { HadithTranslation } from './HadithTranslation';

export interface HadithItemData {
  hadithNumber: number;
  arabicNumber?: number;
  arabic: string;
  bangla: string;
  english: string;
  grades?: Array<{ name: string; grade: string }>;
  reference?: { book: number; hadith: number };
  book: string;
  bookTitleBn: string;
  bookTitleEn: string;
  chapter: number;
  chapterNameBn: string;
  chapterNameEn: string;
}

interface HadithCardProps {
  hadith: HadithItemData;
  showEnglishDefault?: boolean;
  arabicFontSize?: number;
  onBookmarkToggled?: () => void;
}

export function HadithCard({
  hadith,
  showEnglishDefault = false,
  arabicFontSize = 26,
  onBookmarkToggled,
}: HadithCardProps) {
  const intl = useIntl();
  const { locale } = useLocale();
  const [copied, setCopied] = useState(false);
  const [showEnglish, setShowEnglish] = useState(showEnglishDefault);
  const [isSaved, setIsSaved] = useState(false);
  const [shareImageOpen, setShareImageOpen] = useState(false);
  const [audioStatus, setAudioStatus] = useState<{ activeKey: string | null; state: string }>({
    activeKey: null,
    state: 'idle',
  });

  const hadithId = `${hadith.book}-${hadith.hadithNumber}`;

  useEffect(() => {
    return hadithAudioManager.subscribe((activeKey, state) => {
      setAudioStatus({ activeKey, state });
    });
  }, []);

  const isPlayingLang = (lang: HadithAudioLang) =>
    audioStatus.activeKey === `${hadithId}-${lang}` && audioStatus.state === 'playing';

  const isLoadingLang = (lang: HadithAudioLang) =>
    audioStatus.activeKey === `${hadithId}-${lang}` && audioStatus.state === 'loading';

  const handleAudioToggle = (text: string, lang: HadithAudioLang) => {
    hadithAudioManager.play(hadithId, text, lang);
  };

  useEffect(() => {
    try {
      if (typeof isHadithSaved === 'function') {
        setIsSaved(isHadithSaved(hadith.book, hadith.hadithNumber));
      }
    } catch {
      /* noop */
    }
  }, [hadith.book, hadith.hadithNumber]);

  const handleCopy = async () => {
    const textToCopy = [
      `【 ${hadith.bookTitleBn} • হাদিস ${hadith.hadithNumber} 】`,
      `অধ্যায়: ${hadith.chapterNameBn} (${hadith.chapterNameEn})`,
      hadith.arabic ? `\n[আরবি মতন]\n${hadith.arabic}` : '',
      `\n[বাংলা অনুবাদ]\n${hadith.bangla}`,
      hadith.english ? `\n[English Translation]\n${hadith.english}` : '',
      `\nউৎস: আল কুরআন ওয়েব অ্যাপ • হাদিস আর্কাইভ`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard write error */
    }
  };

  const handleToggleBookmark = () => {
    const entry: Omit<SavedHadithEntry, 'addedAt'> = {
      book: hadith.book,
      bookTitleBn: hadith.bookTitleBn,
      bookTitleEn: hadith.bookTitleEn,
      chapter: hadith.chapter,
      chapterNameBn: hadith.chapterNameBn,
      chapterNameEn: hadith.chapterNameEn,
      hadithNumber: hadith.hadithNumber,
      arabic: hadith.arabic,
      bangla: hadith.bangla,
      english: hadith.english,
      grades: hadith.grades,
    };
    if (typeof toggleSavedHadith === 'function') {
      const saved = toggleSavedHadith(entry);
      setIsSaved(saved);
      if (onBookmarkToggled) onBookmarkToggled();
    }
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/hadith/${hadith.book}/hadith/${hadith.hadithNumber}` : '';
    const shareTitle = `${hadith.bookTitleBn} • হাদিস ${hadith.hadithNumber}`;
    const shareText = `${shareTitle}\n${hadith.bangla.slice(0, 120)}...`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        /* share dismissed */
      }
    } else {
      handleCopy();
    }
  };

  // Determine grade display
  const primaryGrade = hadith.grades && hadith.grades.length > 0 ? hadith.grades[0] : null;
  const isSahihBook = hadith.book === 'bukhari' || hadith.book === 'muslim';

  return (
    <>
    <article
      id={`hadith-${hadith.hadithNumber}`}
      className="rounded-2xl bg-surface border border-border-subtle p-6 sm:p-8 shadow-soft hover:border-gold/40 hover:shadow-md transition-all duration-300"
    >
      {/* ─── Header: Number, Chapter, Grade & Actions ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border-subtle">
        <div className="flex flex-wrap items-center gap-2">
          {/* Hadith Number Pill */}
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-surface-highlight text-gold-dark border border-gold-line font-mono">
            {intl.formatMessage(
              { id: 'hadith.number' },
              {
                number:
                  locale === 'bn'
                    ? hadith.hadithNumber.toLocaleString('bn-BD')
                    : hadith.hadithNumber,
              }
            )}
          </span>

          {/* Chapter Badge */}
          <span className="text-xs text-text-muted bangla-ui">
            {hadith.chapterNameBn}
            {hadith.chapterNameEn && hadith.chapterNameEn !== hadith.chapterNameBn && (
              <span className="text-text-subtle font-normal ml-1">({hadith.chapterNameEn})</span>
            )}
          </span>
        </div>

        {/* Right side: Authenticity Grade & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Authenticity Grade Badge */}
          {isSahihBook ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {intl.formatMessage({ id: 'hadith.gradeSahih' })}
            </span>
          ) : primaryGrade ? (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                primaryGrade.grade.toLowerCase().includes('sahih')
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : primaryGrade.grade.toLowerCase().includes('hasan')
                  ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}
              title={
                primaryGrade.name
                  ? intl.formatMessage({ id: 'hadith.tahqik' }, { name: primaryGrade.name })
                  : undefined
              }
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {primaryGrade.grade}
              {primaryGrade.name && (
                <span className="text-[10px] opacity-75 font-normal ml-0.5">({primaryGrade.name})</span>
              )}
            </span>
          ) : null}

          {/* Action Buttons: Bookmark, Copy, Share as image, Share link */}
          <div className="flex items-center gap-1 pl-1">
            <button
              type="button"
              onClick={handleToggleBookmark}
              aria-label={
                isSaved
                  ? intl.formatMessage({ id: 'hadith.bookmarkRemove' })
                  : intl.formatMessage({ id: 'hadith.bookmarkAdd' })
              }
              title={
                isSaved
                  ? intl.formatMessage({ id: 'hadith.bookmarkRemove' })
                  : intl.formatMessage({ id: 'hadith.bookmarkAdd' })
              }
              className={`p-1.5 rounded-md transition-colors ${
                isSaved
                  ? 'text-gold bg-gold/15'
                  : 'text-text-muted hover:text-text hover:bg-surface-highlight'
              }`}
            >
              <BookmarkIcon width={16} height={16} fill={isSaved ? 'currentColor' : 'none'} />
            </button>

            <button
              type="button"
              onClick={handleCopy}
              aria-label={intl.formatMessage({ id: 'hadith.copy' })}
              title={intl.formatMessage({ id: 'hadith.copy' })}
              className="p-1.5 rounded-md text-text-muted hover:text-text hover:bg-surface-highlight transition-colors"
            >
              {copied ? (
                <CheckIcon width={16} height={16} className="text-emerald-500" />
              ) : (
                <CopyIcon width={16} height={16} />
              )}
            </button>

            <button
              type="button"
              onClick={() => setShareImageOpen(true)}
              aria-label={intl.formatMessage({ id: 'hadith.shareAsImage' })}
              title={intl.formatMessage({ id: 'hadith.shareAsImage' })}
              className="p-1.5 rounded-md text-text-muted hover:text-text hover:bg-surface-highlight transition-colors"
            >
              <ImageIcon width={16} height={16} />
            </button>

            <button
              type="button"
              onClick={handleShare}
              aria-label={intl.formatMessage({ id: 'hadith.shareLink' })}
              title={intl.formatMessage({ id: 'hadith.shareLink' })}
              className="p-1.5 rounded-md text-text-muted hover:text-text hover:bg-surface-highlight transition-colors"
            >
              <ShareIcon width={16} height={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Arabic Matn (মূল আরবি মতন) ─── */}
      {hadith.arabic && (
        <div className="pt-4 pb-3" dir="rtl">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-border-subtle/50" dir="ltr">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-dark font-mono">
              {intl.formatMessage({ id: 'hadith.arabicText' })}
            </span>
            <button
              type="button"
              onClick={() => handleAudioToggle(hadith.arabic, 'ar')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                isPlayingLang('ar')
                  ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                  : isLoadingLang('ar')
                  ? 'bg-gold/15 text-gold-dark border border-gold/30 animate-pulse'
                  : 'bg-surface hover:bg-surface-highlight text-text-muted hover:text-gold-dark border border-border-subtle'
              }`}
              title={
                isPlayingLang('ar')
                  ? intl.formatMessage({ id: 'hadith.stop' })
                  : intl.formatMessage({ id: 'hadith.listenArabic' })
              }
            >
              {isPlayingLang('ar') ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
                  <span className="bangla-ui text-[11px] font-semibold">
                    {intl.formatMessage({ id: 'hadith.stop' })}
                  </span>
                </>
              ) : isLoadingLang('ar') ? (
                <span className="bangla-ui text-[11px]">
                  {intl.formatMessage({ id: 'hadith.loading' })}
                </span>
              ) : (
                <>
                  <PlayIcon width={11} height={11} />
                  <span className="bangla-ui text-[11px]">
                    {intl.formatMessage({ id: 'hadith.listenArabic' })}
                  </span>
                </>
              )}
            </button>
          </div>
          <p
            className="font-arabic text-text text-right leading-[2.4] sm:leading-[2.6] selection:bg-gold/20 tracking-wide font-normal"
            style={{
              fontSize: `${arabicFontSize}px`,
              fontFamily: 'var(--font-arabic)',
            }}
          >
            {hadith.arabic}
          </p>
        </div>
      )}

      {/* ─── Bangla Translation (বাংলা অনুবাদ ও সনদ) ─── */}
      <div className="pt-3 pb-2">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-dark bangla-ui">
              {intl.formatMessage({ id: 'hadith.banglaTranslation' })}
            </span>
            <span className="h-[1px] flex-1 bg-border-subtle" />
          </div>
          <button
            type="button"
            onClick={() => handleAudioToggle(hadith.bangla, 'bn')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ml-2 ${
              isPlayingLang('bn')
                ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                : isLoadingLang('bn')
                ? 'bg-gold/15 text-gold-dark border border-gold/30 animate-pulse'
                : 'bg-surface hover:bg-surface-highlight text-text-muted hover:text-gold-dark border border-border-subtle'
            }`}
            title={
              isPlayingLang('bn')
                ? intl.formatMessage({ id: 'hadith.stop' })
                : intl.formatMessage({ id: 'hadith.listenBangla' })
            }
          >
            {isPlayingLang('bn') ? (
              <>
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
                <span className="bangla-ui text-[11px] font-semibold">
                  {intl.formatMessage({ id: 'hadith.stop' })}
                </span>
              </>
            ) : isLoadingLang('bn') ? (
              <span className="bangla-ui text-[11px]">
                {intl.formatMessage({ id: 'hadith.loading' })}
              </span>
            ) : (
              <>
                <PlayIcon width={11} height={11} />
                <span className="bangla-ui text-[11px]">
                  {intl.formatMessage({ id: 'hadith.listenBangla' })}
                </span>
              </>
            )}
          </button>
        </div>
        <HadithTranslation
          text={hadith.bangla}
          className="bangla-ui text-text text-[17px] sm:text-[19px] leading-[1.85] sm:leading-[1.95] selection:bg-gold/20 font-normal tracking-[0.01em]"
        />
      </div>

      {/* ─── Optional English Translation ─── */}
      {hadith.english && (
        <div className="pt-2">
          {!showEnglish ? (
            <button
              type="button"
              onClick={() => setShowEnglish(true)}
              className="text-xs text-text-muted hover:text-gold-dark font-medium transition-colors inline-flex items-center gap-1 pt-1"
            >
              {intl.formatMessage({ id: 'hadith.englishTranslation' })}
            </button>
          ) : (
            <div className="mt-2 pt-2 border-t border-border-subtle animate-fade-in">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted font-sans">
                  {intl.formatMessage({ id: 'hadith.englishLabel' })}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAudioToggle(hadith.english, 'en')}
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium transition-all ${
                      isPlayingLang('en')
                        ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                        : isLoadingLang('en')
                        ? 'bg-gold/15 text-gold-dark border border-gold/30 animate-pulse'
                        : 'bg-surface hover:bg-surface-highlight text-text-muted hover:text-gold-dark border border-border-subtle'
                    }`}
                    title={
                      isPlayingLang('en')
                        ? intl.formatMessage({ id: 'hadith.stop' })
                        : intl.formatMessage({ id: 'hadith.listenEnglish' })
                    }
                  >
                    {isPlayingLang('en') ? (
                      <>
                        <span className="w-2 h-2 rounded-xs bg-rose-500" />
                        <span className="text-[11px] font-semibold">
                          {intl.formatMessage({ id: 'hadith.stop' })}
                        </span>
                      </>
                    ) : isLoadingLang('en') ? (
                      <span className="text-[11px]">
                        {intl.formatMessage({ id: 'hadith.loading' })}
                      </span>
                    ) : (
                      <>
                        <PlayIcon width={10} height={10} />
                        <span className="text-[11px]">
                          {intl.formatMessage({ id: 'hadith.listenEnglish' })}
                        </span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEnglish(false)}
                    className="text-[11px] text-text-subtle hover:text-text transition-colors"
                  >
                    {intl.formatMessage({ id: 'action.hide' })}
                  </button>
                </div>
              </div>
              <p className="text-sm text-text-muted leading-relaxed font-sans italic selection:bg-gold/20">
                {hadith.english}
              </p>
            </div>
          )}
        </div>
      )}
    </article>

      {shareImageOpen && (
        <ShareHadithModal
          isOpen={shareImageOpen}
          onClose={() => setShareImageOpen(false)}
          hadith={hadith}
        />
      )}
    </>
  );
}
