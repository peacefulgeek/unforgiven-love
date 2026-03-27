import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getNextRunTime() {
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

function scheduleNext() {
  const nextRun = getNextRunTime();
  const delay = nextRun.getTime() - Date.now();
  
  console.log(`[cron] Next article generation scheduled for ${nextRun.toISOString()} (in ${Math.round(delay/1000/60)} minutes)`);
  
  setTimeout(() => {
    runGeneration();
    scheduleNext();
  }, delay);
}

function runGeneration() {
  console.log(`[cron] Starting article generation at ${new Date().toISOString()}`);
  
  const child = spawn('node', [path.join(__dirname, 'generate-articles.mjs')], {
    stdio: 'inherit',
    env: { ...process.env },
    timeout: 600000 // 600s timeout
  });
  
  child.on('error', (err) => {
    console.error('[cron] Generation failed:', err);
  });
  
  child.on('exit', (code) => {
    console.log(`[cron] Generation exited with code ${code}`);
  });
}

// Handle --run-now flag
if (process.argv.includes('--run-now')) {
  console.log('[cron] Running generation immediately (--run-now flag)');
  runGeneration();
} else {
  console.log('[cron] Cron worker started. Scheduling article generation Mon-Fri 12:00 UTC.');
  scheduleNext();
}
