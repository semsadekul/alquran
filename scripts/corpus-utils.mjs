// scripts/corpus-utils.mjs
// Shared helpers for the committed Quran corpus (public/data/verses/*.json).
// Used by both the fetch pipeline and the verification gate.

import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CORPUS_DIR = path.join(ROOT, 'public', 'data', 'verses');
export const MANIFEST_PATH = path.join(ROOT, 'public', 'data', 'verses-manifest.json');
export const TOTAL_AYAHS = 6236;
export const TOTAL_SURAHS = 114;

/** Editions the committed corpus is built from. */
export const EDITIONS = {
  arabic: 'quran-uthmani',
  bangla: 'bn.bengali',
  english: 'en.sahih',
  transliteration: 'en.transliteration',
  banglaTransliteration: 'bn.pronunciation',
};

/**
 * Removes the byte-order mark (U+FEFF) and stray zero-width characters that
 * break string comparison, search and equality checks.
 */
export function normalizeText(text) {
  return String(text ?? '')
    .replace(/\uFEFF/g, '')
    .replace(/\u200B/g, '')
    .replace(/\u200E|\u200F/g, '');
}

/** 114 files sorted numerically. */
export async function listSurahFiles(dir = CORPUS_DIR) {
  const entries = await fs.readdir(dir);
  return entries
    .filter((name) => /^\d{1,3}\.json$/.test(name))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
}

export async function readCorpus(dir = CORPUS_DIR) {
  const files = await listSurahFiles(dir);
  const surahs = [];
  for (const file of files) {
    const raw = await fs.readFile(path.join(dir, file), 'utf8');
    surahs.push({ file, raw, data: JSON.parse(raw) });
  }
  return surahs;
}

/**
 * Stable fingerprint of the corpus: surah number + the exact normalised bytes
 * of every file. Any content change produces a new hash, which the service
 * worker uses to name its cache — corrected verse files then reach readers
 * instead of being served cache-first forever.
 */
export function computeCorpusHash(entries) {
  const hash = createHash('sha256');
  for (const { data } of entries) {
    hash.update(`${data.surah}\n`);
    hash.update(JSON.stringify(data));
    hash.update('\n');
  }
  return hash.digest('hex');
}

/** Ayah counts declared by lib/data/quran.ts (the metadata source of truth). */
export async function readMetadataAyahCounts(root = ROOT) {
  const source = await fs.readFile(path.join(root, 'lib', 'data', 'quran.ts'), 'utf8');
  const counts = new Map();
  const pattern = /number:\s*(\d+),[\s\S]*?numberOfAyahs:\s*(\d+)/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    counts.set(Number(match[1]), Number(match[2]));
  }
  return counts;
}

export async function readManifest(pathToManifest = MANIFEST_PATH) {
  try {
    return JSON.parse(await fs.readFile(pathToManifest, 'utf8'));
  } catch {
    return null;
  }
}

export function buildManifest(entries, extra = {}) {
  const ayahCount = entries.reduce((sum, { data }) => sum + (data.ayahs?.length ?? 0), 0);
  return {
    generatedAt: new Date().toISOString(),
    source: 'https://api.alquran.cloud',
    editions: EDITIONS,
    surahCount: entries.length,
    ayahCount,
    corpusHash: computeCorpusHash(entries),
    ...extra,
  };
}

export async function writeManifest(entries, extra = {}) {
  const manifest = buildManifest(entries, extra);
  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return manifest;
}
