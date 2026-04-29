/**
 * Cron Worker — 5 Scheduled Jobs
 * 
 * 1. Article Publisher: Phase 1 (5x/day, every day) / Phase 2 (1x/weekday)
 * 2. Product Spotlight: Saturdays 08:00 UTC
 * 3. Monthly Refresh: 1st of month 03:00 UTC
 * 4. Quarterly Refresh: 1st of Jan/Apr/Jul/Oct 04:00 UTC
 * 5. ASIN Health Check: Sundays 05:00 UTC
 */
import cron from 'node-cron';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_FILE = path.join(__dirname, '..', 'content', 'articles.json');
const AUTO_GEN_ENABLED = process.env.AUTO_GEN_ENABLED === 'true';

function run(label, script, timeoutMs = 600_000) {
  console.log(`[${label}] Starting at ${new Date().toISOString()}`);
  const child = spawn('node', [path.join(__dirname, script)], {
    stdio: 'inherit',
    env: { ...process.env },
    timeout: timeoutMs
  });
  child.on('error', (err) => console.error(`[${label}] Failed:`, err));
  child.on('exit', (code) => console.log(`[${label}] Exited with code ${code}`));
}

function getPublishedCount() {
  try {
    const articles = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf-8'));
    return articles.filter(a => a.status === 'published').length;
  } catch {
    return 0;
  }
}

function isPhase1() {
  return getPublishedCount() < 60;
}

// ─── Cron 1: Article Publisher ───
// Phase 1 (published < 60): 5x/day every day — 07:00, 10:00, 13:00, 16:00, 19:00 UTC
// Phase 2 (published >= 60): 1x/weekday — 08:00 UTC Mon-Fri

// Phase 1 schedules (all 7 days)
const phase1Times = ['0 7 * * *', '0 10 * * *', '0 13 * * *', '0 16 * * *', '0 19 * * *'];
for (const schedule of phase1Times) {
  cron.schedule(schedule, () => {
    if (!AUTO_GEN_ENABLED) { console.log('[cron-1] AUTO_GEN_ENABLED is false, skipping'); return; }
    if (!isPhase1()) { console.log('[cron-1] Phase 2 active, skipping Phase 1 schedule'); return; }
    run('cron-1-publish-p1', 'generate-articles.mjs', 600_000);
  }, { timezone: 'UTC' });
}

// Phase 2 schedule (Mon-Fri only)
cron.schedule('0 8 * * 1-5', () => {
  if (!AUTO_GEN_ENABLED) { console.log('[cron-1] AUTO_GEN_ENABLED is false, skipping'); return; }
  if (isPhase1()) { console.log('[cron-1] Phase 1 still active, skipping Phase 2 schedule'); return; }
  run('cron-1-publish-p2', 'generate-articles.mjs', 600_000);
}, { timezone: 'UTC' });

// ─── Cron 2: Product Spotlight — Saturday 08:00 UTC ───
cron.schedule('0 8 * * 6', () => {
  if (!AUTO_GEN_ENABLED) { console.log('[cron-2] AUTO_GEN_ENABLED is false, skipping'); return; }
  run('cron-2-spotlight', 'generate-product-spotlight.mjs', 600_000);
}, { timezone: 'UTC' });

// ─── Cron 3: Monthly Content Refresh — 1st of every month 03:00 UTC ───
cron.schedule('0 3 1 * *', () => {
  if (!AUTO_GEN_ENABLED) { console.log('[cron-3] AUTO_GEN_ENABLED is false, skipping'); return; }
  run('cron-3-monthly', 'content-refresh.mjs', 1_800_000);
}, { timezone: 'UTC' });

// ─── Cron 4: Quarterly Deep Refresh — 1st of Jan, Apr, Jul, Oct 04:00 UTC ───
cron.schedule('0 4 1 1,4,7,10 *', () => {
  if (!AUTO_GEN_ENABLED) { console.log('[cron-4] AUTO_GEN_ENABLED is false, skipping'); return; }
  run('cron-4-quarterly', 'content-refresh.mjs', 3_600_000);
}, { timezone: 'UTC' });

// ─── Cron 5: ASIN Health Check — Sunday 05:00 UTC ───
cron.schedule('0 5 * * 0', () => {
  run('cron-5-asin-health', 'product-link-checker.mjs', 1_200_000);
}, { timezone: 'UTC' });

// ─── Manual triggers via CLI flags ───
if (process.argv.includes('--run-now')) {
  run('manual-articles', 'generate-articles.mjs');
} else if (process.argv.includes('--run-spotlight')) {
  run('manual-spotlight', 'generate-product-spotlight.mjs');
} else if (process.argv.includes('--run-refresh')) {
  run('manual-refresh', 'content-refresh.mjs', 1_800_000);
} else if (process.argv.includes('--run-asin-check')) {
  run('manual-asin-check', 'product-link-checker.mjs', 1_200_000);
} else if (process.argv.includes('--run-bulk-seed')) {
  run('manual-bulk-seed', 'bulk-seed.mjs', 7_200_000);
}

const publishedCount = getPublishedCount();
const phase = isPhase1() ? 'Phase 1 (5x/day)' : 'Phase 2 (1x/weekday)';
console.log(`[cron-worker] Started. Published: ${publishedCount}. Mode: ${phase}. AUTO_GEN: ${AUTO_GEN_ENABLED}`);
