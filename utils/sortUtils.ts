import { Page } from "playwright";

export class SortUtils {
  constructor(private page: Page) {}

  async openSortDropdown(): Promise<void> {
    const sortButton = this.page
      .locator("button", { hasText: /^Sort:/i })
      .first();

    console.log("Trying to open Sort dropdown...");

    await sortButton.waitFor({ state: "visible", timeout: 10000 });
    await sortButton.scrollIntoViewIfNeeded();

    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`Attempt ${attempt}: clicking Sort button`);
      await sortButton.click({ force: true, delay: 100 });

      await this.page.waitForTimeout(500);

      const dropdown = this.page.locator("div.py-1").first();
      if (await dropdown.isVisible()) {
        console.log("Sort dropdown opened successfully!");
        return;
      }
    }

    throw new Error("Sort dropdown did not open after 3 attempts");
  }

  async getSortOptions(): Promise<string[]> {
    const options = await this.page
      .locator("div.py-1 button span.text-sm")
      .allTextContents();
     
    await this.closeSortDropdown();
    return options.map((o) => o.trim()).filter(Boolean);
  }

  async isSortDropdownOpen(): Promise<boolean> {
    try {
      const sortMenu = this.page
        .locator('[role="menu"], [role="listbox"]')
        .filter({ hasText: /Newest|Oldest|Manufacturer|Model/i })
        .first();
      return await sortMenu.isVisible({ timeout: 1000 });
    } catch {
      return false;
    }
  }

  async closeSortDropdown(): Promise<void> {
    await this.page.keyboard.press("Escape");
    await this.page.waitForTimeout(300);
  }

  async selectSortOption(optionText: string): Promise<void> {
    await this.openSortDropdown();
    await this.page.waitForTimeout(500);
    const option = this.page
      .locator("div.py-1 button", { hasText: optionText })
      .first();
    await option.waitFor({ state: "visible", timeout: 5000 });
    await option.click();
    await this.page.waitForTimeout(1000);
  }

  async  getSortIndicator(): Promise<string | null> {
    const text = await this.page
      .locator("button", { hasText: /^Sort(:| By:)/i })
      .first()
      .textContent();
    return text?.trim() ?? null;
  }

  async isSortApplied(sortOption: string): Promise<boolean> {
    const indicator = await this.getSortIndicator();
    return indicator?.includes(sortOption) || false;
  }

async verifySort

  async verifySortOrder(
    sortOption: string,
    columnIndex: number = 1
  ): Promise<boolean> {
    await this.page.waitForTimeout(1500);

    const tableRows = this.page
      .locator('tbody tr, [role="row"]:not([role="columnheader"])')
      .filter({ hasNot: this.page.locator(':has-text("No ")') });
    const rowCount = await tableRows.count();

    if (rowCount < 2) {
      return true;
    }

    const values: string[] = [];
    for (let i = 0; i < Math.min(rowCount, 10); i++) {
      const row = tableRows.nth(i);
      const cells = row.locator("td");
      const cellCount = await cells.count();

      if (cellCount > columnIndex) {
        const cell = cells.nth(columnIndex);
        const value = await cell.textContent();
        if (value) {
          values.push(value.trim().toLowerCase());
        }
      }
    }

    if (values.length < 2) {
      return true;
    }

    if (sortOption.includes("(Z-A)") || sortOption === "Oldest") {
      for (let i = 0; i < values.length - 1; i++) {
        if (values[i] < values[i + 1]) {
          return false;
        }
      }
    } else {
      for (let i = 0; i < values.length - 1; i++) {
        if (values[i] > values[i + 1]) {
          return false;
        }
      }
    }

    return true;
  }

  async changeSort(newSortOption: string): Promise<void> {
    await this.selectSortOption(newSortOption);
  }
}

export function createSortUtils(page: Page): SortUtils {
  return new SortUtils(page);
}
