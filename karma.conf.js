// Karma + Jasmine configuration
const fs = require('fs');
const path = require('path');

// Keep Puppeteer Chrome inside the project so CI/local runs share the same cache.
process.env.PUPPETEER_CACHE_DIR =
  process.env.PUPPETEER_CACHE_DIR || path.join(__dirname, '.cache', 'puppeteer');

function resolveChromeBin() {
  if (process.env.CHROME_BIN && fs.existsSync(process.env.CHROME_BIN)) {
    return process.env.CHROME_BIN;
  }

  try {
    const puppeteerPath = require('puppeteer').executablePath();
    if (puppeteerPath && fs.existsSync(puppeteerPath)) {
      return puppeteerPath;
    }
  } catch (_) {
    // Puppeteer Chrome not installed yet
  }

  const candidates = [
    process.env.LOCALAPPDATA &&
      path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
    process.env.PROGRAMFILES &&
      path.join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'),
    process.env['PROGRAMFILES(X86)'] &&
      path.join(process.env['PROGRAMFILES(X86)'], 'Google/Chrome/Application/chrome.exe'),
    process.env.LOCALAPPDATA &&
      path.join(process.env.LOCALAPPDATA, 'Microsoft/Edge/Application/msedge.exe'),
    process.env.PROGRAMFILES &&
      path.join(process.env.PROGRAMFILES, 'Microsoft/Edge/Application/msedge.exe')
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate));
}

const chromeBin = resolveChromeBin();
if (chromeBin) {
  process.env.CHROME_BIN = chromeBin;
} else {
  console.warn(
    '[karma] No se encontró Chrome/Edge. Ejecuta: npm run test:install-browser'
  );
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        random: false
      },
      clearContext: false
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/patients'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' }
      ]
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    browsers: ['Chrome'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage'
        ]
      }
    },
    restartOnFileChange: true,
    singleRun: false,
    autoWatch: true,
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO
  });
};
