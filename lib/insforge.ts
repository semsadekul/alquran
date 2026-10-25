// lib/insforge.ts
// InsForge BaaS client singleton and configuration helper.

import { createClient, type InsForgeClient } from '@insforge/sdk';

let clientInstance: InsForgeClient | null = null;

export function getInsForgeClient(token?: string | null): InsForgeClient {
  const baseUrl =
    process.env.NEXT_PUBLIC_INSFORGE_URL ||
    process.env.INSFORGE_URL ||
    'https://n67g5t6p.ap-southeast.insforge.app';
  const anonKey =
    process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ||
    process.env.INSFORGE_API_KEY ||
    'ik_b11eab0fe7d6a36633cbe6b50debf8e7';

  if (!clientInstance) {
    clientInstance = createClient({
      baseUrl,
      anonKey,
    });
  }

  if (token) {
    clientInstance.setAccessToken(token);
  }

  return clientInstance;
}

export function isInsForgeConfigured(): boolean {
  const baseUrl =
    process.env.NEXT_PUBLIC_INSFORGE_URL || process.env.INSFORGE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || process.env.INSFORGE_API_KEY;
  return Boolean(baseUrl && anonKey);
}
