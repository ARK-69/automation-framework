import { chromium } from 'playwright';
import { expect } from 'chai';

describe('sample playwright test', () => {
  it('opens the home page', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(process.env.BASE_URL || 'https://example.com');
    expect(await page.title()).to.be.a('string');
    await browser.close();
  });
});
