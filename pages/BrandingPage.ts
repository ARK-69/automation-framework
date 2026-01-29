import { Page } from "playwright";

export class BrandingPage {
  constructor(private page: Page) {}

  async openBrandingEdit() {
    const brandingConfigSection = this.page.locator(
      "div.text-card-foreground",
      {
        has: this.page.locator("h3", { hasText: "Branding Configuration" }),
      }
    );
    await brandingConfigSection.waitFor({ state: "visible", timeout: 10000 });
    const editButton = brandingConfigSection.locator(
      "button:has(svg.lucide-pencil)"
    );
    await editButton.waitFor({ state: "visible", timeout: 5000 });
    await editButton.click();
    await this.page.waitForTimeout(500);
  }

  async removeLogo() {
    const section = this.page.locator('label:text("Customer Logo")');
    const container = section.locator(
      'xpath=ancestor::div[contains(@class,"flex-1")]'
    );

    const deleteBtn = container.locator("button:has(svg.lucide-trash-2)");

    await deleteBtn.first().waitFor({ state: "visible", timeout: 10000 });
    await deleteBtn.first().click();
    console.log("  Removed customer logo");
  }

  async removeFavicon() {
    const section = this.page.locator('label:text("Favicon")');
    const container = section.locator(
      'xpath=ancestor::div[contains(@class,"flex-1")]'
    );
    const deleteBtn = container.locator("button:has(svg.lucide-trash-2)");

    await deleteBtn.first().waitFor({ state: "visible", timeout: 10000 });
    await deleteBtn.first().click();
    console.log("  Removed favicon logo");
  }

  async uploadLogo(logoFile: string) {
    const customerLogoInput = this.page.locator('[id="customerLogo-upload"]');
    await customerLogoInput.setInputFiles(logoFile);

    const faviconInput = this.page.locator('[id="favicon-upload"]');
    await faviconInput.setInputFiles(logoFile);



  }

  async setPrimaryColor(primaryColor: string) {
    const primaryColorInput = this.page.locator('input[name="primaryColor"]');
    await primaryColorInput.waitFor({ state: "visible", timeout: 10000 });
    await primaryColorInput.click();
    const primaryColorInputForm = this.page.locator(
      'input[id="rc-editable-input-1"]'
    );
    await primaryColorInputForm.waitFor({ state: "visible", timeout: 10000 });
    await primaryColorInputForm.fill(primaryColor.replace("#", ""));
  }

  async setSecondaryColor(secondaryColor: string) {
    const secondaryColorInput = this.page.locator(
      'input[name="secondaryColor"]'
    );
    await secondaryColorInput.waitFor({ state: "visible", timeout: 10000 });
    await secondaryColorInput.click();
    const secondaryColorInputForm = this.page.locator(
      'input[id="rc-editable-input-6"]'
    );
    await secondaryColorInputForm.waitFor({ state: "visible", timeout: 10000 });
    await secondaryColorInputForm.fill(secondaryColor.replace("#", ""));
  }

  async save() {
    await this.page.locator('button:has-text("Save Changes")').click();
  }
}
