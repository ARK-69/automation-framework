import { Page, Locator } from "playwright";

export class EmptyStatePage {
  constructor(private page: Page) {}

  messageHeading(): Locator {
    return this.page.locator("h2.font-semibold");
  }

  async getMessageText(): Promise<string> {
    const text = await this.messageHeading().innerText();
    return text.trim();
  }
}
