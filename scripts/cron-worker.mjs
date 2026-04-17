import cron from 'node-cron';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

// ─── Cron 1: Article generation — Mon-Fri 06:00 UTC ───
// '0 6 * * 1-5'
cron.schedule('0 6 * * 1-5', () => {
  if (!AUTO_GEN_ENABLED) { console.log('[cron-1] AUTO_GEN_ENABLED is false, skipping'); return; }
  run('cron-1-articles', 'generate-articles.mjs', 600_000);
}, { timezone: 'UTC' });

// ─── Cron 2: Product spotlight — Saturday 08:00 UTC ───
// '0 8 * * 6'
cron.schedule('0 8 * * 6', () => {
  if (!AUTO_GEN_ENABLED) { console.log('[cron-2] AUTO_GEN_ENABLED is false, skipping'); return; }
  run('cron-2-spotlight', 'generate-product-spotlight.mjs', 600_000);
}, { timezone: 'UTC' });

// ─── Cron 3: Monthly content refresh — 1st of every month 03:00 UTC ───
// '0 3 1 * *'
cron.schedule('0 3 1 * *', () => {
  if (!AUTO_GEN_ENABLED) { console.log('[cron-3] AUTO_GEN_ENABLED is false, skipping'); return; }
  run('cron-3-monthly', 'content-refresh.mjs', 1_800_000);
}, { timezone: 'UTC' });

// ─── Cron 4: Quarterly deep refresh — 1st of Jan, Apr, Jul, Oct 04:00 UTC ───
// '0 4 1 1,4,7,10 *'
cron.schedule('0 4 1 1,4,7,10 *', () => {
  if (!AUTO_GEN_ENABLED) { console.log('[cron-4] AUTO_GEN_ENABLED is false, skipping'); return; }
  run('cron-4-quarterly', 'content-refresh.mjs', 3_600_000);
}, { timezone: 'UTC' });

// ─── Cron 5: ASIN health check — Sunday 05:00 UTC ───
// '0 5 * * 0'
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
} else if (process.argv.includes('--run-linkcheck')) {
  run('manual-linkcheck', 'product-link-checker.mjs', 1_200_000);
} else {
  console.log('[cron] Worker started with node-cron. AUTO_GEN_ENABLED =', AUTO_GEN_ENABLED);
  console.log('[cron] Cron 1: Article generation      — 0 6 * * 1-5   (Mon-Fri 06:00 UTC)');
  console.log('[cron] Cron 2: Product spotlight        — 0 8 * * 6     (Saturday 08:00 UTC)');
  console.log('[cron] Cron 3: Monthly content refresh  — 0 3 1 * *     (1st of month 03:00 UTC)');
  console.log('[cron] Cron 4: Quarterly deep refresh   — 0 4 1 1,4,7,10 * (Quarterly 04:00 UTC)');
  console.log('[cron] Cron 5: ASIN health check        — 0 5 * * 0     (Sunday 05:00 UTC)');
}
