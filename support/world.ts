import { World, setWorldConstructor } from "@cucumber/cucumber";
import { Browser, BrowserContext, chromium, Page } from "playwright";

export class CustomWorld extends World {
  private browser: Browser | undefined;
  private context: BrowserContext | undefined;
  public page: Page | undefined;

  constructor(options: any) {
    super(options);
  }

  async init() {
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async dispose() {
    await this.page?.close();
    await this.context?.close();
    await this.browser?.close();
  }
}

setWorldConstructor(CustomWorld);
