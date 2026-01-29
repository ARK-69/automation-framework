import { Page, Locator } from "playwright";
import { DropdownUtils } from "../utils/dropdownUtils";

export class CompanyPage {
  private adminNameInput: Locator;
  private adminPhoneInput: Locator;
  private addressTextarea: Locator;
  private saveButton: Locator;
  private dropdownUtils: DropdownUtils;

  constructor(private page: Page) {
    this.adminNameInput = page.locator('input[name="adminName"]');
    this.adminPhoneInput = page.locator('input[name="adminPhoneNumber"]');
    this.addressTextarea = page.locator('textarea[name="address"]');
    this.saveButton = page.locator('button:has-text("Save changes")');
    this.dropdownUtils = new DropdownUtils(page);
  }

  async getTitle() {
    return await this.page.locator("h1, .page-title").textContent();
  }

  async openCustomerInfoEdit() {
    const customerInfoSection = this.page.locator("div.text-card-foreground", {
      has: this.page.locator("h3", { hasText: "Company information" }),
    });
    const editButton = customerInfoSection.locator(
      'button[data-slot="button"]:has(svg.lucide-pencil)'
    );
    await editButton.waitFor({ state: "visible", timeout: 10000 });
    await editButton.click();
  }

  async updateAdminName(name: string) {
    await this.adminNameInput.fill(name);
  }

  async updateAdminPhone(phone: string) {
    await this.adminPhoneInput.fill(phone);
  }

  async selectCountry(country: string) {
    await this.dropdownUtils.selectDropdownOptionByClick("Country", country);
  }

  async selectIndustry(industry: string) {
    await this.dropdownUtils.selectDropdownOptionByClick("Industry", industry);
  }

  async selectBusinessType(type: string) {
    await this.dropdownUtils.selectDropdownOptionByClick("Business Type", type);
  }

  async updateAddress(address: string) {
    await this.addressTextarea.fill(address);
  }

  async saveCustomerInfo() {
    await this.saveButton.click();
  }

  async getNotification() {
    await this.page.waitForTimeout(2000);

    const notification = this.page
      .locator("text=/successfully|updated|deleted|created|added/i")
      .first();

    return await notification.textContent();
  }
  async adminNamevalidation() {
    const errorMessage = this.page.locator("id=adminName-error");
    if (await errorMessage.isVisible()) {
      return true;
    } else {
      return false;
    }
  }
}
