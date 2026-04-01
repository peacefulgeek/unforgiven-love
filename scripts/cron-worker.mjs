import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── CRON 1: Daily article publishing (Mon-Fri 12:00 UTC, 5/day) ───
function getNextDailyRun() {
  const now = new Date();
  const next = new Date(now);
  
  // Mon-Fri 12:00 UTC (6AM MDT)
  next.setUTCHours(12, 0, 0, 0);
  
  if (now >= next || next.getUTCDay() === 0 || next.getUTCDay() === 6) {
    next.setDate(next.getDate() + 1);
  }
  
  // Skip weekends
  while (next.getUTCDay() === 0 || next.getUTCDay() === 6) {
    next.setDate(next.getDate() + 1);
  }
  
  return next;
}

function scheduleDailyArticles() {
  const nextRun = getNextDailyRun();
  const delay = nextRun.getTime() - Date.now();
  
  console.log(`[cron-daily] Next article publish scheduled for ${nextRun.toISOString()} (in ${Math.round(delay/1000/60)} minutes)`);
  
  setTimeout(() => {
    runDailyGeneration();
    scheduleDailyArticles();
  }, delay);
}

function runDailyGeneration() {
  console.log(`[cron-daily] Starting article generation at ${new Date().toISOString()}`);
  
  const child = spawn('node', [path.join(__dirname, 'generate-articles.mjs')], {
    stdio: 'inherit',
    env: { ...process.env },
    timeout: 600000
  });
  
  child.on('error', (err) => {
    console.error('[cron-daily] Generation failed:', err);
  });
  
  child.on('exit', (code) => {
    console.log(`[cron-daily] Generation exited with code ${code}`);
  });
}

// ─── CRON 2: Weekly product spotlight (Saturday 14:00 UTC) ───
function getNextWeeklyRun() {
  const now = new Date();
  const next = new Date(now);
  
  // Saturday 14:00 UTC (8AM MDT)
  next.setUTCHours(14, 0, 0, 0);
  
  // Find next Saturday
  const daysUntilSaturday = (6 - next.getUTCDay() + 7) % 7;
  if (daysUntilSaturday === 0 && now >= next) {
    next.setDate(next.getDate() + 7);
  } else {
    next.setDate(next.getDate() + daysUntilSaturday);
  }
  
  return next;
}

function scheduleWeeklySpotlight() {
  const nextRun = getNextWeeklyRun();
  const delay = nextRun.getTime() - Date.now();
  
  console.log(`[cron-weekly] Next product spotlight scheduled for ${nextRun.toISOString()} (in ${Math.round(delay/1000/60/60)} hours)`);
  
  setTimeout(() => {
    runWeeklySpotlight();
    scheduleWeeklySpotlight();
  }, delay);
}

function runWeeklySpotlight() {
  console.log(`[cron-weekly] Starting product spotlight generation at ${new Date().toISOString()}`);
  
  const child = spawn('node', [path.join(__dirname, 'generate-product-spotlight.mjs')], {
    stdio: 'inherit',
    env: { ...process.env },
    timeout: 600000
  });
  
  child.on('error', (err) => {
    console.error('[cron-weekly] Product spotlight failed:', err);
  });
  
  child.on('exit', (code) => {
    console.log(`[cron-weekly] Product spotlight exited with code ${code}`);
  });
}

// Handle --run-now flag
if (process.argv.includes('--run-now')) {
  console.log('[cron] Running generation immediately (--run-now flag)');
  runDailyGeneration();
} else if (process.argv.includes('--run-spotlight')) {
  console.log('[cron] Running product spotlight immediately');
  runWeeklySpotlight();
} else {
  console.log('[cron] Cron worker started.');
  console.log('[cron] Cron 1: Daily article publishing Mon-Fri 12:00 UTC (5/day)');
  console.log('[cron] Cron 2: Weekly product spotlight Saturday 14:00 UTC');
  scheduleDailyArticles();
  scheduleWeeklySpotlight();
}
