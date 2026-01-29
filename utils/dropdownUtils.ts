import { Page, Locator } from "playwright";

export class DropdownUtils {
  constructor(private page: Page) {}

  async openDropdownByLabel(labelText: string): Promise<Locator> {
    const label = this.page.locator(`label:has-text("${labelText}")`);

    const container = label.locator("..");

    const trigger = container.locator('button[role="combobox"]');

    await trigger.waitFor({ state: "visible", timeout: 5000 });

    await trigger.click();

    await this.page.waitForSelector('[role="listbox"], [role="menu"]', {
      timeout: 5000,
    });

    return trigger;
  }

  async selectOptionByKeyboard(optionText: string): Promise<void> {
    const option = this.page
      .locator(`[role="option"]:has-text("${optionText}")`)
      .first();

    await option.waitFor({ state: "visible", timeout: 5000 });

    await this.page.keyboard.press("ArrowDown");
    await this.page.waitForTimeout(300);

    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      const focusedOption = this.page
        .locator(
          '[role="option"][data-highlighted], [role="option"][aria-selected="true"]'
        )
        .first();
      const focusedText = await focusedOption.textContent();

      if (focusedText?.includes(optionText)) {
        break;
      }

      await this.page.keyboard.press("ArrowDown");
      await this.page.waitForTimeout(200);
      attempts++;
    }

    await this.page.keyboard.press("Enter");

    await this.page.waitForTimeout(300);
  }

  async selectDropdownOption(
    labelText: string,
    optionText: string
  ): Promise<void> {
    try {
      await this.openDropdownByLabel(labelText);
      await this.selectOptionByKeyboard(optionText);
    } catch (error) {
      throw new Error(
        `Failed to select option "${optionText}" from dropdown "${labelText}": ${error}`
      );
    }
  }

  async selectDropdownOptionByTyping(
    labelText: string,
    optionText: string
  ): Promise<void> {
    try {
      const trigger = await this.openDropdownByLabel(labelText);

      await this.page.keyboard.type(optionText[0], { delay: 100 });
      await this.page.waitForTimeout(300);

      const option = this.page
        .locator(`[role="option"]:has-text("${optionText}")`)
        .first();
      await option.waitFor({ state: "visible", timeout: 3000 });

      await this.page.keyboard.press("ArrowDown");
      await this.page.waitForTimeout(200);
      await this.page.keyboard.press("Enter");
      await this.page.waitForTimeout(300);
    } catch (error) {
      throw new Error(
        `Failed to select option "${optionText}" from dropdown "${labelText}" by typing: ${error}`
      );
    }
  }

  async getSelectedValue(labelText: string): Promise<string | null> {
    const label = this.page.locator(`label:has-text("${labelText}")`);
    const container = label.locator("..");
    const selectedValue = container.locator('[data-slot="select-value"]');

    return await selectedValue.textContent();
  }

  async isOptionAvailable(
    labelText: string,
    optionText: string
  ): Promise<boolean> {
    try {
      await this.openDropdownByLabel(labelText);
      const option = this.page.locator(
        `[role="option"]:has-text("${optionText}")`
      );
      const isVisible = await option.isVisible({ timeout: 2000 });

      await this.page.keyboard.press("Escape");
      await this.page.waitForTimeout(200);

      return isVisible;
    } catch {
      return false;
    }
  }

  async closeDropdown(): Promise<void> {
    await this.page.keyboard.press("Escape");
    await this.page.waitForTimeout(300);
  }

  async getAllOptions(labelText: string): Promise<string[]> {
    try {
      await this.openDropdownByLabel(labelText);

      const options = await this.page
        .locator('[role="option"]')
        .allTextContents();

      await this.closeDropdown();

      return options;
    } catch (error) {
      console.error(
        `Failed to get options for dropdown "${labelText}": ${error}`
      );
      return [];
    }
  }

  async selectDropdownOptionByClick(
    labelText: string,
    optionText: string
  ): Promise<void> {
    try {
      const trigger = await this.openDropdownByLabel(labelText);

      const dropdownMenu = this.page
        .locator('[role="listbox"], [role="menu"]')
        .first();
      await dropdownMenu.waitFor({ state: "visible", timeout: 5000 });

      const option = dropdownMenu
        .locator(`[role="option"]:has-text("${optionText}")`)
        .first();
      await option.waitFor({ state: "visible", timeout: 3000 });

      await option.click();

      await this.page.waitForTimeout(300);

      const selectedValue = await this.getSelectedValue(labelText);
      if (!selectedValue?.includes(optionText)) {
        throw new Error(
          `Dropdown "${labelText}" failed to select "${optionText}". Got "${selectedValue}" instead.`
        );
      }
    } catch (error) {
      throw new Error(
        `Failed to select option "${optionText}" from dropdown "${labelText}": ${error}`
      );
    }
  }
}

export function createDropdownUtils(page: Page): DropdownUtils {
  return new DropdownUtils(page);
}
