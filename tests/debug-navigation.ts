import * as dotenv from 'dotenv';
dotenv.config();

import { chromium } from 'playwright';
import path from 'path';

async function tryNavigate(page: any, url: string) {
  console.log(`Attempting navigation to ${url}`);
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Navigation response status:', resp?.status());
    console.log('Page URL after nav:', page.url());
    console.log('Page closed?', page.isClosed());
    const title = await page.title();
    console.log('Page title:', title);
    return true;
  } catch (err) {
    console.error(`Navigation to ${url} failed:`, err);
    console.log('Page closed?', page.isClosed());
    return false;
  }
}

(async () => {
  const base = process.env.BASE_URL || 'https://example.com';
  const headless = false; // headed for debugging
  console.log('Debug navigation starting. BASE_URL=' + base + ' headless=' + headless);

  const browser = await chromium.launch({ headless, slowMo: Number(process.env.SLOWMO || 0) });
  browser.on('disconnected', () => console.error('Browser disconnected event'));
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('close', () => console.warn('Page close event emitted'));
  page.on('crash', () => console.error('Page crash event emitted'));
  page.on('console', msg => console.log('[PAGE CONSOLE]', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('[PAGE ERROR]', err));

  try {
    // 1) Navigate to a known safe site first
    const okExample = await tryNavigate(page, 'https://example.com');
    if (!okExample) {
      console.warn('example.com navigation failed — local environment may block traffic or browser is unstable');
    }

    // 2) Then try the configured BASE_URL
    const okBase = await tryNavigate(page, base);

    const screenshotPath = path.resolve('reports', 'debug-screenshot.png');
    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log('Saved screenshot to', screenshotPath);
    } catch (sErr) {
      console.warn('Screenshot failed:', sErr);
    }

    console.log('Final page closed?', page.isClosed(), 'Browser connected?', browser.isConnected());
    if (!okExample && !okBase) process.exitCode = 2;
  } catch (err) {
    console.error('Unexpected error in debug script:', err);
    process.exitCode = 3;
  } finally {
    try {
      await browser.close();
    } catch (e) {
      console.warn('Error closing browser:', e);
    }
  }
})();
