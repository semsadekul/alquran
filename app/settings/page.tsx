'use client';

import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { useTheme } from '../../components/providers/ThemeProvider';
import { useLocale, LOCALES } from '../../components/providers/LocaleProvider';
import { useAppAuth } from '../../components/providers/AuthProvider';
import { clearAppData } from '../../lib/storage';
import {
  SunIcon,
  MoonIcon,
  DownloadIcon,
  TrashIcon,
  LogInIcon,
  LogOutIcon,
  UserIcon,
} from '@/components/ui/Icon';
import Link from 'next/link';

export default function SettingsPage() {
  const intl = useIntl();
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const { enabled, isLoaded, isSignedIn, user, signOut, openUserProfile } = useAppAuth();
  const { showToast } = useToast();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <header className="text-center lg:text-left">
        <div className="inline-block px-4 py-1 rounded-full bg-surface-highlight border border-border-subtle mb-4">
          <p className="text-sm font-medium text-gold-dark">
            {intl.formatMessage({ id: 'home.quickActions' }).toLowerCase()}
          </p>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-text mb-2">
          {intl.formatMessage({ id: 'settings.title' })}
        </h1>
        <p className="text-lg text-text/70" style={{ fontFamily: 'var(--font-bengali-ui)' }}>
          সেটিংস
        </p>
      </header>

      {/* Account */}
      {enabled && (
        <Card variant="elevated" className="p-6">
          <h2 className="text-xl font-bold text-text mb-4">
            {intl.formatMessage({ id: 'auth.account' })}
          </h2>
          {enabled && !isLoaded ? (
            <div className="flex items-center gap-4">
              <span className="w-14 h-14 rounded-full bg-surface-highlight animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-surface-highlight animate-pulse rounded" />
                <div className="h-3 w-48 bg-surface-highlight animate-pulse rounded" />
              </div>
            </div>
          ) : isLoaded && isSignedIn && user ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {user.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt={user.name ?? ''}
                  className="w-14 h-14 rounded-full object-cover border border-gold/50"
                />
              ) : (
                <span className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold bg-gold border border-gold-light text-[#1a1814]">
                  {user.initials}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-text truncate">
                  {user.name ?? user.email ?? 'Reader'}
                </p>
                {user.email && (
                  <p className="text-sm text-text/70 truncate">{user.email}</p>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" onClick={openUserProfile}>
                  <UserIcon className="w-4 h-4" />{' '}
                  {intl.formatMessage({ id: 'auth.manageAccount' })}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => signOut()}
                  className="text-ink-2 hover:text-red-400"
                >
                  <LogOutIcon className="w-4 h-4" />{' '}
                  {intl.formatMessage({ id: 'auth.signOut' })}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-surface-highlight border border-border-subtle flex items-center justify-center">
                <UserIcon className="w-7 h-7 text-gold-dark" />
              </div>
              <p className="text-text/70 mb-1">
                {intl.formatMessage({ id: 'auth.guestReader' })}
              </p>
              <p className="text-sm text-text/50 mb-5">
                {intl.formatMessage({ id: 'auth.accountSubtitle' })}
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/sign-in">
                  <Button variant="primary">
                    <LogInIcon className="w-4 h-4" />{' '}
                    {intl.formatMessage({ id: 'auth.signIn' })}
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button variant="outline">
                    {intl.formatMessage({ id: 'auth.signUp' })}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Appearance */}
      <Card variant="elevated" className="p-6">
        <h2 className="text-xl font-bold text-text mb-4">
          {intl.formatMessage({ id: 'settings.appearance' })}
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text">
              {intl.formatMessage({ id: 'settings.theme' })}
            </p>
            <p className="text-sm text-text/70">
              {theme === 'light'
                ? intl.formatMessage({ id: 'settings.themeLight' })
                : intl.formatMessage({ id: 'settings.themeDark' })}
            </p>
          </div>
          <Button variant="outline" onClick={toggleTheme}>
            {theme === 'light' ? (
              <><MoonIcon className="w-4 h-4" /> {intl.formatMessage({ id: 'settings.themeDark' })}</>
            ) : (
              <><SunIcon className="w-4 h-4" /> {intl.formatMessage({ id: 'settings.themeLight' })}</>
            )}
          </Button>
        </div>
      </Card>

      {/* Language */}
      <Card variant="elevated" className="p-6">
        <h2 className="text-xl font-bold text-text mb-4">
          {intl.formatMessage({ id: 'settings.language' })}
        </h2>
        <div className="space-y-2">
          {Object.entries(LOCALES).map(([code, { name, dir }]) => (
            <button
              key={code}
              onClick={() => setLocale(code as 'en' | 'bn' | 'ar')}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg transition-colors
                ${locale === code 
                  ? 'bg-primary/10 border border-primary' 
                  : 'bg-surface-highlight hover:bg-surface-highlight/80'
                }
              `}
            >
              <span className="font-medium text-text" dir={dir}>{name}</span>
              {locale === code && (
                <span className="text-primary">✓</span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Data Management */}
      <Card variant="elevated" className="p-6">
        <h2 className="text-xl font-bold text-text mb-4">
          {intl.formatMessage({ id: 'settings.dataManagement' })}
        </h2>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              const data = localStorage.getItem('alquran_reading_stats');
              if (!data) {
                showToast(intl.formatMessage({ id: 'settings.noDataToExport' }), 'info');
                return;
              }
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'al-quran-reading-stats.json';
              a.style.display = 'none';
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
              showToast(intl.formatMessage({ id: 'settings.dataExported' }), 'success');
            }}
          >
            <DownloadIcon className="w-4 h-4" /> {intl.formatMessage({ id: 'settings.exportData' })}
          </Button>
          <Button
            variant="danger"
            className="w-full justify-start"
            onClick={() => setConfirmClear(true)}
          >
            <TrashIcon className="w-4 h-4" /> {intl.formatMessage({ id: 'settings.clearData' })}
          </Button>
        </div>
      </Card>

      {/* Clear confirmation */}
      <Modal
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        title={intl.formatMessage({ id: 'settings.modal.title' })}
        size="sm"
      >
        <p className="text-sm text-text/70 mb-5">
          {intl.formatMessage({ id: 'settings.modal.desc' })}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmClear(false)}>
            {intl.formatMessage({ id: 'settings.modal.cancel' })}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              clearAppData(true);
              setConfirmClear(false);
              window.location.reload();
            }}
          >
            {intl.formatMessage({ id: 'settings.modal.confirm' })}
          </Button>
        </div>
      </Modal>

      {/* About */}
      <Card variant="elevated" className="p-6">
        <h2 className="text-xl font-bold text-text mb-4">
          {intl.formatMessage({ id: 'settings.about' })}
        </h2>
        <div className="text-sm text-text/70 space-y-2">
          <p><strong>{intl.formatMessage({ id: 'settings.version' })}:</strong> 1.0.0</p>
          <p><strong>{intl.formatMessage({ id: 'settings.builtWith' })}:</strong> Next.js, React, Tailwind CSS</p>
          <p><strong>{intl.formatMessage({ id: 'settings.features' })}:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Full Quran reader with Arabic, Bangla, and English</li>
            <li>Hifz tracking with achievements</li>
            <li>Search across the full Quran corpus</li>
            <li>Reading statistics and progress tracking</li>
            <li>Dark/Light theme support</li>
            <li>Multi-language support (EN, BN, AR)</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
