const path = require('path');
const { execSync } = require('child_process');

process.env.PUPPETEER_CACHE_DIR = path.join(__dirname, '..', '.cache', 'puppeteer');

execSync('npx puppeteer browsers install chrome', {
  stdio: 'inherit',
  env: process.env
});
