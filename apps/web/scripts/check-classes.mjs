/**
 * Guard script: scans all .tsx/.ts files under app/ and components/ for
 * CSS class names that are neither Tailwind utilities nor defined in globals.css.
 *
 * Exit code 1 if any undefined classes are found.
 *
 * Usage: node scripts/check-classes.mjs
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const APP_DIR = join(ROOT, 'app');
const COMPONENTS_DIR = join(ROOT, 'components');
const GLOBALS_CSS = join(ROOT, 'app', 'globals.css');

// Known Tailwind utility prefixes/patterns that should NOT be flagged
const TAILWIND_PREFIXES = [
  'bg-', 'text-', 'flex', 'grid-', 'border', 'border-', 'rounded-', 'shadow-',
  'p-', 'pl-', 'pr-', 'pt-', 'pb-', 'px-', 'py-',
  'm-', 'ml-', 'mr-', 'mt-', 'mb-', 'mx-', 'my-',
  'gap-', 'w-', 'h-', 'min-', 'max-',
  'items-', 'justify-', 'self-', 'place-',
  'font-', 'tracking-', 'leading-', 'text-',
  'z-', 'top-', 'bottom-', 'left-', 'right-', 'inset-',
  'overflow-', 'transition', 'duration-', 'ease-', 'animate-',
  'hover:', 'focus', 'active:', 'group', 'peer',
  'md:', 'lg:', 'sm:', 'xl:', '2xl:',
  'sr-', 'not-', 'first:', 'last:', 'odd:', 'even:',
  'dark:', 'print:', 'motion-safe:', 'motion-reduce:',
  'aspect-', 'columns-', 'break-', 'box-', 'decoration-', 'underline',
  'line-clamp-', 'list-', 'object-', 'opacity-', 'outline-', 'ring-',
  'scale-', 'rotate-', 'translate-', 'skew-', 'origin-',
  'select-', 'resize-', 'cursor-', 'caret-', 'accent-',
  'fill-', 'stroke-', 'backdrop-', 'blur-', 'grayscale-', 'invert-',
  'saturate-', 'sepia-', 'filter', 'contain-', 'content-',
  'order-', 'col-', 'row-', 'auto-', 'start-', 'end-',
  'whitespace-', 'truncate', 'align-', 'vertical-',
  'space-', 'divide-', 'caption-', 'table-',
  'static', 'fixed', 'absolute', 'relative', 'sticky',
  'visible', 'invisible', 'collapse', 'block', 'inline', 'hidden',
  'shrink-', 'grow-', 'basis-', 'uppercase', 'lowercase', 'capitalize',
  'italic', 'not-italic', 'normal-case', 'tabular-nums', 'lining-nums',
  'transform', 'origin-', 'pointer-events-', 'select-', 'appearance-',
  'scroll-m', 'scroll-p', 'snap-', 'touch-', 'will-change-',
  'from-', 'to-', 'via-', 'gradient-',
  'antialiased', 'subpixel-antialiased',
  'no-underline', 'line-through', 'overline',
  'truncate', 'text-ellipsis', 'text-clip', 'text-wrap', 'text-nowrap',
  'fill-', 'stroke-', 'paint-',
  'inset-', 'float-', 'clear-', 'isolation-', 'isolate',
  'forced-color-adjust-',
];

function walk(dir, extensions) {
  const results = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      try {
        const stat = statSync(full);
        if (stat.isDirectory()) {
          if (entry === 'node_modules' || entry === '.next' || entry === 'out') continue;
          results.push(...walk(full, extensions));
        } else if (extensions.some((ext) => entry.endsWith(ext))) {
          results.push(full);
        }
      } catch {
        // skip unreadable
      }
    }
  } catch {
    // skip unreadable
  }
  return results;
}

// Parse classes defined in globals.css
function parseDefinedClasses(cssContent) {
  const defined = new Set();
  // Match .class-name selectors
  const re = /\.([a-z][a-z0-9]*(?:-[a-z0-9]+)*)/g;
  let m;
  while ((m = re.exec(cssContent)) !== null) {
    defined.add(m[1]);
  }
  return defined;
}

// Check if a token looks like a Tailwind utility
function isTailwindUtility(token) {
  // Arbitrary values: bg-[#fff], text-[14px], etc.
  if (token.includes('[') && token.includes(']')) return true;
  // Negative utilities: -mt-4, -mx-2
  if (token.startsWith('-') && TAILWIND_PREFIXES.some((p) => token.slice(1).startsWith(p))) return true;
  // Standard prefixes
  if (TAILWIND_PREFIXES.some((p) => token.startsWith(p))) return true;
  // Numeric-only or short tokens (likely Tailwind)
  if (/^\d+$/.test(token)) return true;
  return false;
}

// Extract class tokens from a source file
function extractClassTokens(content) {
  const tokens = new Set();

  // Match className="..." and class="..."
  const classAttrRe = /(?:className|class)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = classAttrRe.exec(content)) !== null) {
    m[1].split(/\s+/).forEach((t) => t && tokens.add(t));
  }

  // Match className={`...`} (template literals)
  const tplRe = /(?:className|class)\s*=\s*\{`([^`]*)`\}/g;
  while ((m = tplRe.exec(content)) !== null) {
    m[1].split(/\s+/).forEach((t) => t && tokens.add(t));
  }

  // Match cn('...', '...') calls
  const cnRe = /cn\(\s*['"]([^'"]*)['"]/g;
  while ((m = cnRe.exec(content)) !== null) {
    m[1].split(/\s+/).forEach((t) => t && tokens.add(t));
  }

  return tokens;
}

// Main
const cssContent = readFileSync(GLOBALS_CSS, 'utf-8');
const definedClasses = parseDefinedClasses(cssContent);

const files = [
  ...walk(APP_DIR, ['.tsx', '.ts']),
  ...walk(COMPONENTS_DIR, ['.tsx', '.ts']),
];

const issues = [];

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  const tokens = extractClassTokens(content);

  for (const token of tokens) {
    // Skip Tailwind utilities
    if (isTailwindUtility(token)) continue;
    // Skip defined classes
    if (definedClasses.has(token)) continue;
    // Skip empty, single-char, or numeric
    if (token.length <= 1 || /^\d+$/.test(token)) continue;
    // Skip CSS variable references
    if (token.startsWith('var(')) continue;
    // Skip dynamic class patterns like `verse-${n}`
    if (token.includes('${')) continue;
    // Skip common non-class tokens
    if (['true', 'false', 'null', 'undefined', 'none', 'auto'].includes(token)) continue;

    const rel = relative(ROOT, file);
    issues.push(`${rel}: undefined class "${token}"`);
  }
}

if (issues.length > 0) {
  console.error(`\n❌ Found ${issues.length} undefined CSS class(es):\n`);
  issues.forEach((i) => console.error(`  ${i}`));
  console.error('\nFix: replace with Tailwind utilities or add to globals.css\n');
  process.exit(1);
} else {
  console.log('✅ No undefined CSS classes found.');
  process.exit(0);
}
