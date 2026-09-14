import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('\x1b[36m%s\x1b[0m', '🚀 Starting Top News Backend (Port 3000), Main Website (Port 8080) & Admin Panel (Port 5173)...');

const backendProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'top-news-backend'),
  stdio: 'inherit',
  shell: true
});

const newsProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'top-news'),
  stdio: 'inherit',
  shell: true
});

const adminProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'top-news-admin'),
  stdio: 'inherit',
  shell: true
});

backendProcess.on('close', (code) => {
  if (code !== 0 && code !== null) console.log(`Backend process exited with code ${code}`);
});

newsProcess.on('close', (code) => {
  if (code !== 0 && code !== null) console.log(`Top News process exited with code ${code}`);
});

adminProcess.on('close', (code) => {
  if (code !== 0 && code !== null) console.log(`Admin process exited with code ${code}`);
});

process.on('SIGINT', () => {
  backendProcess.kill();
  newsProcess.kill();
  adminProcess.kill();
  process.exit();
});
