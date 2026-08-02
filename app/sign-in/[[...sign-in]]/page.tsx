'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { useIntl } from 'react-intl';
import { useAppAuth, clerkAppearance } from '@/components/providers/AuthProvider';
import { BookOpenIcon, ArrowLeftIcon } from '@/components/ui/Icon';

export default function SignInPage() {
  const intl = useIntl();
  const { enabled } = useAppAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 animate-fade-in">
      {enabled ? (
        <>
          <div className="text-center mb-6">
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-text mb-2">
              {intl.formatMessage({ id: 'auth.signInTitle' })}
            </h1>
            <p className="text-text/70">{intl.formatMessage({ id: 'auth.signInSubtitle' })}</p>
          </div>
          <div className="w-full max-w-md">
            <SignIn
              appearance={clerkAppearance}
              fallbackRedirectUrl="/"
              signUpUrl="/sign-up"
            />
          </div>
        </>
      ) : (
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-highlight border border-border-subtle flex items-center justify-center">
            <BookOpenIcon className="w-8 h-8 text-gold-dark" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-text mb-2">
            {intl.formatMessage({ id: 'auth.notConfigured' })}
          </h1>
          <p className="text-text/70 mb-6">
            {intl.formatMessage({ id: 'auth.notConfiguredSub' })}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gold-dark hover:text-gold transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            {intl.formatMessage({ id: 'auth.backToHome' })}
          </Link>
        </div>
      )}
    </div>
  );
}
