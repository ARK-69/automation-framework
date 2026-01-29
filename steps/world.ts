import { setWorldConstructor, World } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page, chromium } from "playwright";
import * as dotenv from "dotenv";

dotenv.config();

type WorldParams = {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
};

class CustomWorld extends World implements WorldParams {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;

  constructor(options: any) {
    super(options);
  }

  async init(): Promise<void> {
    const pwdebug =
      process.env.PWDEBUG &&
      ["1", "true"].includes(process.env.PWDEBUG.toLowerCase());
    const headlessEnv = process.env.HEADLESS;
    const headless = pwdebug
      ? false
      : headlessEnv
      ? !(headlessEnv === "false" || headlessEnv === "0")
      : true;
    const slowMo = Number(process.env.SLOWMO || 0);

    console.log(
      `Launching browser: headless=${headless} slowMo=${slowMo} PWDEBUG=${process.env.PWDEBUG}`
    );

    this.browser = await chromium.launch({ headless, slowMo });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    this.page.on("console", (msg) => {
      try {
        const args = msg.args?.().map((a) => a.toString()) ?? [];
        console.log("[PAGE CONSOLE]", msg.type(), ...args);
      } catch (e) {
        console.log("[PAGE CONSOLE]", msg.type(), msg.text());
      }
    });
    this.page.on("pageerror", (err) => console.error("[PAGE ERROR]", err));
    this.page.on("requestfailed", (req) => {
      console.warn(
        "[REQUEST FAILED]",
        req.url(),
        req.failure()?.errorText || "no details"
      );
    });
    console.log("New Playwright page created");
  }

  async dispose(): Promise<void> {
    try {
      await this.page?.close();
      await this.context?.close();
      await this.browser?.close();
    } catch (e) {
    }
  }
}

setWorldConstructor(CustomWorld as any);
