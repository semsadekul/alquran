'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { ClerkProvider, useUser, useAuth, useClerk } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export interface AppUser {
  id: string;
  name: string | null;
  email: string | null;
  imageUrl: string | null;
  initials: string;
}

export interface AppAuthValue {
  /** Whether real authentication is configured (Clerk keys present in env). */
  enabled: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  user: AppUser | null;
  signOut: () => Promise<void>;
  /** Opens the Clerk account-management modal/page. */
  openUserProfile: () => void;
  /** Retrieves the active auth JWT for API/DB requests. */
  getToken: () => Promise<string | null>;
}

const GuestAuth: AppAuthValue = {
  enabled: false,
  isLoaded: true,
  isSignedIn: false,
  user: null,
  signOut: async () => {},
  openUserProfile: () => {},
  getToken: async () => null,
};

const AppAuthContext = createContext<AppAuthValue>(GuestAuth);

function initialsOf(name: string | null | undefined, email: string | null | undefined): string {
  const source = name?.trim() || email || '?';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

/** Shared appearance so the hosted auth screens match the app's theme. */
export const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: '#b8964a',
    colorBackground: '#17150f',
    colorText: '#e9e4d8',
    colorInputBackground: '#211d15',
    colorInputText: '#e9e4d8',
    borderRadius: '0.75rem',
  },
};

/**
 * Bridges Clerk's hooks into a plain React context so the rest of the app
 * can call useAppAuth() safely — even when Clerk isn't configured (guest
 * mode / no keys). This component only ever mounts under <ClerkProvider>.
 */
function ClerkAuthBridge({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut, getToken } = useAuth();
  const { openUserProfile } = useClerk();

  const value = useMemo<AppAuthValue>(() => {
    const appUser: AppUser | null =
      isSignedIn && user
        ? {
            id: user.id,
            name:
              user.fullName ??
              user.username ??
              user.primaryEmailAddress?.emailAddress ??
              null,
            email: user.primaryEmailAddress?.emailAddress ?? null,
            imageUrl: user.imageUrl ?? null,
            initials: initialsOf(
              user.fullName ?? user.username,
              user.primaryEmailAddress?.emailAddress
            ),
          }
        : null;
    return {
      enabled: true,
      isLoaded,
      isSignedIn: !!isSignedIn,
      user: appUser,
      signOut: () => signOut(),
      openUserProfile,
      getToken: () => getToken(),
    };
  }, [isLoaded, isSignedIn, user, signOut, openUserProfile, getToken]);

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}

/**
 * Wraps the app in Clerk's provider when keys are configured, or a no-op
 * guest provider otherwise — so `next build`/`next dev` work without keys.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return <AppAuthContext.Provider value={GuestAuth}>{children}</AppAuthContext.Provider>;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={clerkAppearance}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
      afterSignOutUrl="/"
    >
      <ClerkAuthBridge>{children}</ClerkAuthBridge>
    </ClerkProvider>
  );
}

export function useAppAuth(): AppAuthValue {
  return useContext(AppAuthContext);
}
