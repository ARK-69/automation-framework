import { Page, Locator } from "playwright";
import { DropdownUtils } from "./dropdownUtils";

export class FilterUtils {
  private dropdownUtils: DropdownUtils;

  constructor(private page: Page) {
    this.dropdownUtils = new DropdownUtils(page);
  }

  private async getFilterDialog(): Promise<Locator> {
    let filterDialog = this.page
      .locator('[role="dialog"]')
      .filter({ hasText: /Filter/i })
      .first();

    if ((await filterDialog.count()) === 0) {
      const heading = this.page
        .locator('h2:has-text("Filter"), h3:has-text("Filter")')
        .first();
      if ((await heading.count()) > 0) {
        filterDialog = heading
          .locator(
            'xpath=ancestor::div[@role="dialog"] | ancestor::div[contains(@class,"dialog")] | ancestor::div[contains(@class,"modal")]'
          )
          .first();
      }
    }

    if ((await filterDialog.count()) === 0) {
      filterDialog = this.page.locator('[role="dialog"]:visible').first();
    }

    await filterDialog.waitFor({ state: "visible", timeout: 5000 });
    return filterDialog;
  }

  async openFilterDialog(filterButtonText: string = "Filter"): Promise<void> {
    const filterButton = this.page
      .locator(
        `button:has-text("${filterButtonText}"), button[aria-label*="${filterButtonText}" i]`
      )
      .first();
    await filterButton.waitFor({ state: "visible", timeout: 5000 });
    await filterButton.click();
    await this.page.waitForTimeout(500);

    await this.getFilterDialog();
  }

  async isFilterDialogVisible(): Promise<boolean> {
    try {
      const filterDialog = this.page
        .locator(
          'h2:has-text("Filter"), h3:has-text("Filter"), [role="dialog"]:has-text("Filter")'
        )
        .first();
      return await filterDialog.isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }

  async closeFilterDialog(): Promise<void> {
    try {
      const cancelButton = this.page
        .locator('button:has-text("Cancel")')
        .first();
      if (await cancelButton.isVisible({ timeout: 1000 })) {
        await cancelButton.click();
      } else {
        await this.page.keyboard.press("Escape");
      }
      await this.page.waitForTimeout(300);
    } catch {
      await this.page.keyboard.press("Escape");
      await this.page.waitForTimeout(300);
    }
  }

  async selectRadioFilter(filterLabel: string, value: string): Promise<void> {
    let section = this.page
      .locator(
        `h3:has-text("${filterLabel}"), h2:has-text("${filterLabel}"),label:has-text("${filterLabel}")`
      )
      .locator("..")
      .first();

    if ((await section.count()) === 0) {
      section = this.page
        .locator(`h3:has-text("${filterLabel}"), h2:has-text("${filterLabel}")`)
        .first()
        .locator('xpath=ancestor::div[contains(@class, "space-y")] | ..')
        .first();
    }

    await section.waitFor({ state: "visible", timeout: 5000 });

    const optionLabel = section.locator(`label:has-text("${value}")`).first();
    await optionLabel.waitFor({ state: "visible", timeout: 5000 });

    const labelFor = await optionLabel.getAttribute("for");
    let radioButton = null;

    if (labelFor) {
      // Use attribute selector [id="..."] instead of #id to handle special characters like "+"
      radioButton = this.page.locator(`[id="${labelFor}"]`).first();
    } else {
      radioButton = section
        .locator('button[role="radio"]')
        .filter({ hasText: new RegExp(value, "i") })
        .first();
    }

    if (radioButton) {
      const ariaChecked = await radioButton.getAttribute("aria-checked");
      const dataState = await radioButton.getAttribute("data-state");
      const isChecked = ariaChecked === "true" || dataState === "checked";

      if (!isChecked) {
        await radioButton.click({ force: true });
        console.log(` Selected "${value}" for "${filterLabel}" radio group`);
      } else {
        console.log(`"${value}" already selected for "${filterLabel}"`);
      }
    } else {
      await optionLabel.click({ force: true });
    }

    await this.page.waitForTimeout(300);
  }

  async selectCheckboxFilter(
    filterLabel: string,
    value: string
  ): Promise<void> {
    const divsection = this.page
      .locator(
        `h3:has-text("${filterLabel}"), h2:has-text("${filterLabel}"),label:has-text("${filterLabel}")`
      )
      .first()
      .locator('xpath=ancestor::div[contains(@class, "space-y")] | ..')
      .first();

    const checkboxLabel = divsection
      .locator(`label:has-text("${value}")`)
      .first();
    await checkboxLabel.waitFor({ state: "visible", timeout: 5000 });

    const labelFor = await checkboxLabel.getAttribute("for");

    let checkbox: Locator | null = null;

    if (labelFor) {
      checkbox = this.page.locator(`#${labelFor}`).first();
      const count = await checkbox.count();
      if (count > 0) {
        await checkbox.waitFor({ state: "visible", timeout: 5000 });
      } else {
        checkbox = null;
      }
    }

    if (!checkbox) {
      const labelContainer = checkboxLabel.locator("..");
      checkbox = labelContainer.locator('button[role="checkbox"]').first();
      const count = await checkbox.count();
      if (count === 0) {
        checkbox = null;
      }
    }

    if (!checkbox) {
      const valueLower = value.toLowerCase();
      checkbox = divsection
        .locator(`button[role="checkbox"][id="${valueLower}"]`)
        .first();
      const count = await checkbox.count();
      if (count === 0) {
        checkbox = null;
      }
    }

    if (!checkbox) {
      checkbox = checkboxLabel.locator('input[type="checkbox"]').first();
      const count = await checkbox.count();
      if (count === 0) {
        checkbox = null;
      }
    }

    if (checkbox) {
      const tagName = await checkbox.evaluate((el) => el.tagName.toLowerCase());

      if (tagName === "button") {
        const ariaChecked = await checkbox.getAttribute("aria-checked");
        const dataState = await checkbox.getAttribute("data-state");
        const isChecked = ariaChecked === "true" || dataState === "checked";

        if (!isChecked) {
          await checkbox.click();
        }
      } else {
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.click();
        }
      }
    } else {
      await checkboxLabel.click();
    }

    await this.page.waitForTimeout(300);
  }

  



async selectDropdownFilterScheduling(
    filterLabel: string,
    filterId:string,
    value: string
  ): Promise<void> {
    await this.page.waitForTimeout(500);


    // Only search for dropdowns inside the visible filter dialog to avoid background dropdowns
    const filterDialog = await this.getFilterDialog();
    const label = filterDialog.locator(`label[for=${filterId}]`).first();
    await label.waitFor({ state: "visible", timeout: 10000 });

    let container = label.locator("..");
    let trigger = container.locator('button[role="combobox"]').first();

    if ((await trigger.count()) === 0) {
      trigger = container.locator('button[aria-haspopup="listbox"],button[aria-hashpopup="dialog"]').first();
    }
    if ((await trigger.count()) === 0) {
      trigger = container.locator("button[aria-haspopup]").first();
    }
    if ((await trigger.count()) === 0) {
      const parentContainer = container.locator("..");
      trigger = parentContainer
        .locator(
          'button[role="combobox"], button[aria-haspopup="listbox"], button[aria-haspopup],button[aria-haspopup="dialog"],button[data-slot="popover-trigger"]'
        )
        .first();
    }
    if ((await trigger.count()) === 0) {
      trigger = container.locator("button").first();
    }

    await trigger.waitFor({ state: "visible", timeout: 10000 });
    await trigger.click();
    await this.page.waitForTimeout(500);

    // Check if this is a checkbox-based dropdown (like "Created By" with .searchbar-container)
    const searchContainer = this.page.locator('.searchbar-container').first();
    const isCheckboxDropdown = await searchContainer.isVisible({ timeout: 1000 }).catch(() => false);

    if (isCheckboxDropdown) {
      // Handle checkbox dropdown with search
      const searchInput = searchContainer.locator(`input[placeholder="Search ${filterLabel}"],input[placeholder="Search"]`).first();
      await searchInput.waitFor({ state: "visible", timeout: 5000 });
      await searchInput.fill(value);
      await this.page.waitForTimeout(300);

      // Find the option label and click its checkbox
      const optionLabel = this.page.locator(`.option-label:text-is("${value}")`).first();
      await optionLabel.waitFor({ state: "visible", timeout: 9000 });

      const listOption = optionLabel.locator('xpath=ancestor::div[contains(@class, "list-option")]').first();
      const checkbox = listOption.locator(`button[role="checkbox"],p:has-text('${value}')`).first();
      await checkbox.click();
      
      console.log(`✓ Selected "${value}" for "${filterLabel}" checkbox dropdown`);
    } else {
      // Handle standard listbox dropdown (original functionality)
      await this.page.waitForSelector('[role="listbox"], [role="menu"]', {
        timeout: 5000,
      });
      await this.page.waitForTimeout(300);

      const dropdownMenu = this.page
        .locator('[role="listbox"], [role="menu"]')
        .first();
      const option = dropdownMenu
        .locator(
          `[role="option"]:has-text("${value}"), [role="menuitem"]:has-text("${value}")`
        )
        .first();
      await option.waitFor({ state: "visible", timeout: 5000 });
      await option.click();
    }

    await this.page.waitForTimeout(300);
  }





  async selectDropdownFilter(
    filterLabel: string,
    value: string
  ): Promise<void> {
    await this.page.waitForTimeout(500);


    // Only search for dropdowns inside the visible filter dialog to avoid background dropdowns
    const filterDialog = await this.getFilterDialog();
    const label = filterDialog.locator(`label:has-text("${filterLabel}"),p:has-text("${filterLabel}"),div:has-text("${filterLabel}")`).first();
    await label.waitFor({ state: "visible", timeout: 10000 });

    let container = label.locator("..");
    let trigger = container.locator('button[role="combobox"]').first();

    if ((await trigger.count()) === 0) {
      trigger = container.locator('button[aria-haspopup="listbox"],button[aria-hashpopup="dialog"]').first();
    }
    if ((await trigger.count()) === 0) {
      trigger = container.locator("button[aria-haspopup]").first();
    }
    if ((await trigger.count()) === 0) {
      const parentContainer = container.locator("..");
      trigger = parentContainer
        .locator(
          'button[role="combobox"], button[aria-haspopup="listbox"], button[aria-haspopup],button[aria-haspopup="dialog"],button[data-slot="popover-trigger"]'
        )
        .first();
    }
    if ((await trigger.count()) === 0) {
      trigger = container.locator("button").first();
    }

    await trigger.waitFor({ state: "visible", timeout: 10000 });
    await trigger.click();
    await this.page.waitForTimeout(500);

    // Check if this is a checkbox-based dropdown (like "Created By" with .searchbar-container)
    const searchContainer = this.page.locator('.searchbar-container').first();
    const isCheckboxDropdown = await searchContainer.isVisible({ timeout: 1000 }).catch(() => false);

    if (isCheckboxDropdown) {
      // Handle checkbox dropdown with search
      const searchInput = searchContainer.locator(`input[placeholder="Search ${filterLabel}"],input[placeholder="Search"]`).first();
      await searchInput.waitFor({ state: "visible", timeout: 5000 });
      await searchInput.fill(value);
      await this.page.waitForTimeout(300);

      // Find the option label and click its checkbox
      const optionLabel = this.page.locator(`.option-label:text-is("${value}")`).first();
      await optionLabel.waitFor({ state: "visible", timeout: 9000 });

      const listOption = optionLabel.locator('xpath=ancestor::div[contains(@class, "list-option")]').first();
      const checkbox = listOption.locator(`button[role="checkbox"],p:has-text('${value}')`).first();
      await checkbox.click();
      
      console.log(`✓ Selected "${value}" for "${filterLabel}" checkbox dropdown`);
    } else {
      // Handle standard listbox dropdown (original functionality)
      await this.page.waitForSelector('[role="listbox"], [role="menu"]', {
        timeout: 5000,
      });
      await this.page.waitForTimeout(300);

      const dropdownMenu = this.page
        .locator('[role="listbox"], [role="menu"]')
        .first();
      const option = dropdownMenu
        .locator(
          `[role="option"]:has-text("${value}"), [role="menuitem"]:has-text("${value}")`
        )
        .first();
      await option.waitFor({ state: "visible", timeout: 5000 });
      await option.click();
    }

    await this.page.waitForTimeout(300);
  }

  async selectRadixFilterOption(
    labelText: string,
    optionText: string
  ): Promise<void> {
    const label = this.page
      .locator(
        `h3:has-text("${labelText}"), h2:has-text("${labelText}"),label:has-text("${labelText}")`
      )
      .first();
    await label.waitFor({ state: "visible", timeout: 5000 });

    const container = label.locator("..");

    const trigger = container.locator(".popover-trigger").first();
    await trigger.waitFor({ state: "visible", timeout: 5000 });

    await trigger.click();

    const popover = this.page
      .locator('div[role="dialog"]')
      .filter({
        has: this.page.locator(".searchbar-container"),
      })
      .first();

    await popover.waitFor({ state: "visible", timeout: 5000 });

    const searchInput = popover.locator(
      `input[placeholder="Search"],input[placeholder="Search fleet group"]`
    );
    await searchInput.waitFor({ state: "visible", timeout: 5000 });

    await searchInput.fill(optionText);
    await this.page.waitForTimeout(500);

    const option = popover
      .locator(`.option-label:text-is("${optionText}")`)
      .first();
    await option.waitFor({ state: "visible", timeout: 5000 });

    const row = option
      .locator('xpath=ancestor::div[contains(@class, "list-option")]')
      .first();
    await row.click({ force: true });

    const closeIcon = container.locator(".dropdown-arrow-icon").first();

    if (await closeIcon.isVisible()) {
      await closeIcon.click({ force: true });
    }

    await this.page.waitForTimeout(300);
  }

  async selectFilter(
    filterLabel: string,
    value: string,
    filterType?: "radio" | "checkbox" | "dropdown"
  ): Promise<void> {
    if (filterType === "radio") {
      await this.selectRadioFilter(filterLabel, value);
    } else if (filterType === "checkbox") {
      await this.selectCheckboxFilter(filterLabel, value);
    } else if (filterType === "dropdown") {
      await this.selectDropdownFilter(filterLabel, value);
    } else {
      const section = this.page
        .locator(`label:has-text("${filterLabel}")`)
        .locator("..")
        .first();

      const radioButton = section
        .locator(`input[type="radio"] + label:has-text("${value}")`)
        .first();
      if ((await radioButton.count()) > 0) {
        await this.selectRadioFilter(filterLabel, value);
        return;
      }

      const checkbox = section
        .locator(`input[type="checkbox"] + label:has-text("${value}")`)
        .first();
      if ((await checkbox.count()) > 0) {
        await this.selectCheckboxFilter(filterLabel, value);
        return;
      }

      await this.selectDropdownFilter(filterLabel, value);
    }
  }

  async applyFilters(): Promise<void> {
    await this.page.waitForTimeout(500);

    const applyButton = this.page.locator('button:has-text("Apply")').first();

    await applyButton.waitFor({
      state: "visible",
      timeout: 10000,
    });

    console.log("Clicking Apply filters...");
    await applyButton.click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  /**
   * Selects an option inside Radix popover single-select dropdowns
   * (Used for "Created By")
   */
  async selectRadixSingleSelectOption(
    labelText: string,
    optionText: string
  ): Promise<void> {
    const label = this.page.locator(`label:has-text("${labelText}")`).first();
    await label.waitFor({ state: "visible", timeout: 5000 });

    const container = label.locator("..");

    const trigger = container.locator(".popover-trigger").first();
    await trigger.waitFor({ state: "visible", timeout: 5000 });

    await trigger.click();

    const popover = this.page
      .locator('div[role="dialog"]')
      .filter({
        has: this.page.locator(".searchbar-container"),
      })
      .first();
    await popover.waitFor({ state: "visible", timeout: 5000 });

    const searchInput = popover.locator('input[placeholder="Search"]');
    await searchInput.waitFor({ state: "visible", timeout: 5000 });
    await searchInput.fill(optionText);
    await this.page.waitForTimeout(300);

    const option = popover
      .locator(`.option-label:text-is("${optionText}")`)
      .first();
    await option.waitFor({ state: "visible", timeout: 5000 });

    await option.click({ force: true });

    await this.page.waitForTimeout(300);
  }

  async clearAllFilters(): Promise<void> {
    const modal = this.page
      .locator('[role="dialog"]')
      .filter({ hasText: /Filter/i });
    await modal.waitFor({ state: "visible", timeout: 10000 });

    const clearAllButton = modal
      .locator('button:has-text("Clear All")')
      .first();
    await clearAllButton.waitFor({ state: "visible", timeout: 10000 });

    console.log("Clicking Clear All inside modal...");
    await clearAllButton.click({ force: true });

    await this.page.waitForTimeout(1000);
    const closeDialogBtn=modal.locator('button[data-slot="dialog-close"]');
    if(await closeDialogBtn.isVisible()){
      await closeDialogBtn.click();
    }
  }

  async hasActiveFilters(): Promise<boolean> {
    await this.page.waitForTimeout(1000);

    const filterButton = this.page.locator(
      'button:has(span:text-is("Filter"))'
    );

    const badge = filterButton.locator(
      'div:is([class*="bg-primary"], [class*="bg-[var(--primary)]"])'
    );

    if ((await badge.count()) > 0) {
      const badgeText =
        (await badge.locator("span").first().textContent())?.trim() ?? "";
      const badgeNumber = parseInt(badgeText, 10);
      if (!isNaN(badgeNumber) && badgeNumber > 0) {
        console.log(`Active filter count detected: ${badgeNumber}`);
        return true;
      }
    }

    console.log("No active filter indicator found on Filter button");
    return false;
  }

  async isFilterReset(
    filterLabel: string,
    isDialogOpen: boolean = false
  ): Promise<boolean> {
    try {
      if (!isDialogOpen) {
        const dialogOpen = await this.isFilterDialogVisible();
        if (!dialogOpen) {
          await this.openFilterDialog();
        }
      }

      await this.page.waitForTimeout(500);
      const section = this.page
        .locator(`label:has-text("${filterLabel}")`)
        .locator("..")
        .first();
      await section.waitFor({ state: "visible", timeout: 3000 });

      const selectedRadio = section
        .locator('input[type="radio"]:checked')
        .first();
      if ((await selectedRadio.count()) > 0) {
        if (!isDialogOpen) {
          await this.closeFilterDialog();
        }
        return false;
      }

      const checkedCheckbox = section
        .locator('input[type="checkbox"]:checked')
        .first();
      if ((await checkedCheckbox.count()) > 0) {
        if (!isDialogOpen) {
          await this.closeFilterDialog();
        }
        return false;
      }

      const dropdownButton = section
        .locator('button[role="combobox"], [role="combobox"]')
        .first();
      if ((await dropdownButton.count()) > 0) {
        const value = await dropdownButton.textContent();
        const isReset =
          value?.includes("Select") || !value || value.trim() === "";
        if (!isDialogOpen) {
          await this.closeFilterDialog();
        }
        return isReset;
      }

      if (!isDialogOpen) {
        await this.closeFilterDialog();
      }
      return true;
    } catch (error) {
      if (!isDialogOpen) {
        try {
          await this.closeFilterDialog();
        } catch {}
      }
      return false;
    }
  }

  async resetAllFilters(): Promise<void> {
    await this.clearAllFilters();
    await this.applyFilters();
  }

  async getFilterDropdownOptions(filterLabel: string): Promise<string[]> {
    return await this.dropdownUtils.getAllOptions(filterLabel);
  }
}

export function createFilterUtils(page: Page): FilterUtils {
  return new FilterUtils(page);
}
