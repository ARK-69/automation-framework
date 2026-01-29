import { Page } from "playwright";
export class Header {
  constructor(private page: Page) {}

  async selectMyProfile() {
    await this.page.waitForSelector('[data-slot="avatar"]');
    await this.page.click('[data-slot="avatar"]');
    await this.page.getByRole("menuitem", { name: "My Profile" }).click();
    await this.page.waitForSelector("text=Account Details", { timeout: 6000 });
  }

  async logout() {
    await this.page.click('[data-slot="avatar"]');
    const logout = this.page.locator('[data-slot="dropdown-menu-item"]', {
      hasText: /log\s*out/i,
    });
    await logout.waitFor({ state: "visible", timeout: 15000 });
    await logout.click();
    await this.page.waitForSelector('[name="email"]', { timeout: 10000 });
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.page.locator('h1:has-text("Fleet Overview")').isVisible();
  }
}
