import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const serverPath = path.join(rootDir, '.next', 'standalone', 'server.js');

process.env.PORT = '3000';
process.env.HOSTNAME = '0.0.0.0';
process.env.NODE_ENV = 'production';

console.log('[socratic-daemon] Starting Next.js standalone server on port 3000...');

function run() {
  const child = spawn('node', [serverPath], {
    cwd: path.join(rootDir, '.next', 'standalone'),
    env: { ...process.env, PORT: '3000', HOSTNAME: '0.0.0.0', NODE_ENV: 'production' },
    stdio: 'inherit'
  });

  child.on('exit', (code, signal) => {
    console.log(`[socratic-daemon] Server exited with code ${code}, signal ${signal}. Restarting in 2s...`);
    setTimeout(run, 2000);
  });

  child.on('error', (err) => {
    console.error('[socratic-daemon] Process error:', err);
  });
}

run();

// Keep parent process alive
setInterval(() => {}, 60000);
