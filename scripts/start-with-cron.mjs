import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Start web server
const web = spawn('node', [path.join(__dirname, '..', 'server', 'index.mjs')], {
  stdio: 'inherit',
  env: { ...process.env }
});

web.on('error', (err) => {
  console.error('[start] Web server failed to start:', err);
  process.exit(1);
});

// Start cron worker
const cron = spawn('node', [path.join(__dirname, 'cron-worker.mjs')], {
  stdio: 'inherit',
  env: { ...process.env }
});

cron.on('error', (err) => {
  console.error('[start] Cron worker failed to start:', err);
});

// Handle shutdown
process.on('SIGTERM', () => {
  console.log('[start] SIGTERM received, shutting down...');
  web.kill('SIGTERM');
  cron.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[start] SIGINT received, shutting down...');
  web.kill('SIGTERM');
  cron.kill('SIGTERM');
  process.exit(0);
});

console.log('[start] Web server and cron worker started.');
