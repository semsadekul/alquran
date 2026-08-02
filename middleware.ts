import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';

// Clerk needs BOTH keys to manage sessions — the secret key for the server
// and the publishable key for the client (see .env.local / .env.example).
// Until both are set, the app runs as a guest with no auth.
const clerkEnabled =
  !!process.env.CLERK_SECRET_KEY && !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerk = clerkEnabled ? clerkMiddleware() : null;

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!clerk) return NextResponse.next();
  return clerk(request, event);
}

export const config = {
  // Run on all app routes, skipping static assets and files with extensions
  // (public/data/verses/*.json, icons, sw.js, etc.).
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
