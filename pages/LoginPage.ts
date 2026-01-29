import { Page } from "playwright";
import dotenv from "dotenv";

dotenv.config();
export class LoginPage {
  constructor(private page: Page) {}

  async goto(url: string= "https://dev.fms-fleet.autilent.com") {
     url = `${url}/login`;

    await this.page.goto(url);
    await this.page.waitForSelector('input[name="email"]', { timeout: 15000 });
  }

  async login(username: string, password: string) {
    await this.page.fill('input[name="email"]', username);
    await this.page.fill('input[name="password"]', password);
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: "networkidle" }).catch(() => {}),
      this.page.click('button[type="submit"]'),
    ]);
  }
}
