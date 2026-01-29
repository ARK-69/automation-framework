import { Page } from "playwright";

export class Sidebar {
  constructor(private page: Page) {}

  async navigateTousers() {
    const spanLocator = this.page.locator('//*[@id="root"]/div/div/div/div[2]/div/div[2]/div[2]/div[2]/ul/li[2]/button');
    if ((await spanLocator.count()) > 0) {
      await spanLocator.first().click();
    } 
    await this.page.waitForURL(/\/users-and-roles$/);
  }

  async navigateToDrivers() {
    const spanLocator = this.page.locator('//*[@id="root"]/div/div/div/div[2]/div/div[2]/div[1]/div/ul/li[4]/a/button');
    if ((await spanLocator.count()) > 0) {
      await spanLocator.first().click();
    } 
    await this.page.waitForURL(/\/drivers$/);
  }

  async navigateToScheduling() {
    const spanLocator = this.page.locator('button[data-slot="sidebar-menu-button"]:has-text("Scheduling")');
    if ((await spanLocator.count()) > 0) {
      await spanLocator.first().click();
    }
    await this.page.waitForURL(/\/scheduling$/);
  }

  async navigateToroutes() {
    const spanLocator = this.page.locator('//*[@id="root"]/div/div/div/div[2]/div/div[2]/div[1]/div/ul/li[5]/a/button' );
    if ((await spanLocator.count()) > 0) {
      await spanLocator.first().click();
    } 
    await this.page.waitForURL(/\/routes$/);
    
  }

  async navigateToDevices() {
    const spanLocator = this.page.locator('//*[@id="root"]/div/div/div/div[2]/div/div[2]/div[2]/div[2]/ul/li[1]/button');
    if ((await spanLocator.count()) > 0) {
      await spanLocator.first().click();
    } 
    await this.page.waitForURL(/\/devices$/);
  }

  async navigateToVehicles() {
    const spanLocator = this.page.locator('//*[@id="root"]/div/div/div/div[2]/div/div[2]/div[1]/div/ul/li[3]/a/button');
    if ((await spanLocator.count()) > 0) {
      await spanLocator.first().click();
    } 
    await this.page.waitForURL(/\/vehicles$/);
  }

  async navigateToFleetGroups() {
    const spanLocator = this.page.locator('//*[@id="root"]/div/div/div/div[2]/div/div[2]/div[2]/div[2]/ul/li[4]/button');
    if ((await spanLocator.count()) > 0) {
      await spanLocator.first().click();
    } 
    await this.page.waitForURL(/\/groups$/);
  }

  async navigateToCompany() {
  const spanLocator = this.page.locator('//*[@id="root"]/div/div/div/div[2]/div/div[2]/div[2]/div[2]/ul/li[5]/button');
  if ((await spanLocator.count()) > 0) {
    await spanLocator.first().click();
  } 
  await this.page.waitForURL(/\/company-detail$/);
}

}
