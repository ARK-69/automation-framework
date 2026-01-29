import { Page } from "playwright";
import { DropdownUtils } from "../utils/dropdownUtils";
import { FilterUtils } from "../utils/filterUtils";
import { SortUtils } from "../utils/sortUtils";
import { expect } from "chai";

export class DevicesPage {
  private filterUtils: FilterUtils;
  private sortUtils: SortUtils;

  constructor(private page: Page) {
    this.filterUtils = new FilterUtils(page);
    this.sortUtils = new SortUtils(page);
  }

  async getPageTitle() {
    return this.page.locator("h1").textContent();
  }

  async clickAddDevice() {
    await this.page.locator('button:has-text("Add Device")').click();
  }

  async fillDeviceForm({
    manufacturer,
    model,
    imei,
    userName,
    password,
    phoneNumber,
  }: {
    manufacturer: string;
    model: string;
    imei: string;
    userName: string;
    password: string;
    phoneNumber: string;
  }) {
    const dropdownUtils = new DropdownUtils(this.page);
    await dropdownUtils.selectDropdownOption(
      "Manufacturer",
      manufacturer ?? "Teltonika"
    );
    await dropdownUtils.selectDropdownOption("Model", model ?? "FMB920");
    await this.page.fill('input[name="imei"]', imei);
    await this.page.fill('input[name="userName"]', userName);
    await this.page.fill('input[name="password"]', password);
    await this.page.fill('input[name="phoneNumber"]', phoneNumber);
  }

  async saveDeviceForm() {
    await this.page.locator('button:has-text("Save Device")').click();
  }

  async updateDeviceForm() {
    await this.page.locator('button:has-text("Save Changes")').click();
  }

  async getNotification() {
    await this.page.waitForTimeout(2000);

    const notification = this.page
      .locator("text=/successfully|updated|deleted|created|added/i")
      .first();

    return await notification.textContent();
  }

  async search(term: string) {
    await this.page.fill('input[placeholder="Search"]', term);
    await this.page.waitForTimeout(1500);
  }

  async isDeviceListed(imei: string) {
    return await this.page.locator(`tr:has-text("${imei}")`).isVisible();
  }

  async isDeviceRowVisible(imei: string) {
    return await this.page.locator(`tr:has-text("${imei}")`).isVisible();
  }

  async getEmptyTableMessage() {
    return await this.page
      .locator("text=No devices found matching your criteria.")
      .textContent();
  }

  async editDeviceModel(editedModel: string) {
    const dropdownUtils = new DropdownUtils(this.page);
    await dropdownUtils.selectDropdownOption("Model", editedModel ?? "FMB900");
    await this.updateDeviceForm();
  }

  async clickEditDevice(imei: string) {
    await this.search(imei);
    await this.page.waitForTimeout(500);

    const row = this.page.locator(`tr:has-text("${imei}"):visible`).first();
    const editButton = row.locator("button").nth(0);

    await editButton.click();
    await this.page.waitForTimeout(3000);
  }

  async deleteDevice(imei: string) {
    await this.search(imei);
    await this.page.waitForTimeout(500);

    const row = this.page.locator(`tr:has-text("${imei}"):visible`).first();
    const deleteButton = row.locator("button").nth(1);
    await deleteButton.click();
    await this.page.waitForTimeout(3000);
    await this.page.fill('input[placeholder="DELETE"]', "DELETE");
    await this.page.locator('button:has-text("Delete Device")').click();
    await this.getNotification();
  }


  async openFilterDialog() {
    await this.filterUtils.openFilterDialog();
  }

  async selectDeviceAssignedFilter(value: "Yes" | "No") {
    await this.filterUtils.selectRadioFilter("Device Assigned", value);
  }

  async selectManufacturerFilter(manufacturer: string) {
    await this.filterUtils.selectDropdownFilter("Manufacturer", manufacturer);
  }

  async selectModelFilter(model: string) {
    await this.filterUtils.selectDropdownFilter("Model", model);
  }

  async selectStatusFilter(status: "Online" | "Offline") {
    await this.filterUtils.selectCheckboxFilter("Status", status);
  }

  async clickApplyFilter() {
    await this.filterUtils.applyFilters();
  }

  async clickClearAllFilters() {
    await this.filterUtils.clearAllFilters();
  }

  async closeFilterDialog() {
    await this.filterUtils.closeFilterDialog();
  }

  async hasActiveFilters(): Promise<boolean> {
    return await this.filterUtils.hasActiveFilters();
  }

  async isFilterReset(filterName: string): Promise<boolean> {
    return await this.filterUtils.isFilterReset(filterName);
  }

  async verifyFilteredResults(filterCriteria: {
    manufacturer?: string;
    model?: string;
    status?: string;
    deviceAssigned?: string;
  }): Promise<boolean> {
    await this.page.waitForTimeout(1500);
    const deviceRows = this.page
      .locator('tbody tr, [role="row"]:not([role="columnheader"])')
      .filter({ hasNot: this.page.locator(':has-text("No devices")') });
    const rowCount = await deviceRows.count();

    if (rowCount === 0) {
      const noDevicesMessage = await this.page
        .locator("text=/No devices|No results/i")
        .isVisible();
      return noDevicesMessage;
    }

    for (let i = 0; i < Math.min(rowCount, 10); i++) {
      const row = deviceRows.nth(i);
      const rowText = await row.textContent();

      if (filterCriteria.manufacturer && rowText) {
        if (
          !rowText
            .toLowerCase()
            .includes(filterCriteria.manufacturer.toLowerCase())
        ) {
          return false;
        }
      }

      if (filterCriteria.model && rowText) {
        if (
          !rowText.toLowerCase().includes(filterCriteria.model.toLowerCase())
        ) {
          return false;
        }
      }
    }

    return true;
  }

  async verifyAllDevicesDisplayed(): Promise<boolean> {
    await this.page.waitForTimeout(1500);
    const noDevicesMessage = await this.page
      .locator("text=/No devices found matching your criteria/i")
      .isVisible();
    return !noDevicesMessage;
  }

  async verifyDevicesMatchFilters(filters: {
    manufacturer?: string;
    model?: string;
    status?: string;
  }): Promise<boolean> {
    return await this.verifyFilteredResults(filters);
  }


  async openSortDropdown() {
    await this.sortUtils.openSortDropdown();
  }

  async getSortOptions(): Promise<string[]> {
    return await this.sortUtils.getSortOptions();
  }

  async selectSortOption(sortOption: string) {
    await this.sortUtils.selectSortOption(sortOption);
  }

  async getSortIndicator(): Promise<string | null> {
    return await this.sortUtils.getSortIndicator();
  }

  async verifySortApplied(sortOption: string): Promise<boolean> {
    return await this.sortUtils.isSortApplied(sortOption);
  }

  async verifyDevicesSorted(sortOption: string): Promise<boolean> {
    let columnIndex = 1;
    if (sortOption.includes("Manufacturer")) {
      columnIndex = 1;
    } else if (sortOption.includes("Model")) {
      columnIndex = 2;
    } else if (sortOption.includes("Assigned Vehicle")) {
      columnIndex = 3;
    }

    return await this.sortUtils.verifySortOrder(sortOption, columnIndex);
  }

  async waitForDevicesApiResponse(): Promise<any> {
    const response = await this.page.waitForResponse(
      (resp) => {
        return (
          resp.url().includes("/core/api/v1/devices") &&
          resp.request().method() === "GET" &&
          resp.ok()
        );
      },
      { timeout: 30000 }
    );

    return await response.json();

    const json = await response.json();
    console.log("  Captured API URL:", response.url());
    console.log("  API returned count:", json?.results?.length ?? 0);
    console.log(
      " First 3 API results:",
      JSON.stringify(json?.results?.slice(0, 3), null, 2)
    );
    return json.results ?? [];
  }

  async assertTableMatchesApiResults(apiResults: any[]): Promise<boolean> {
    const rows = this.page.locator("tbody tr");
    const rowCount = await rows.count();

    if (rowCount !== apiResults.length) return false;

    for (let i = 0; i < rowCount; i++) {
      const rowText = (await rows.nth(i).textContent())?.toLowerCase() ?? "";

      const item = apiResults[i];
      if (
        item.manufacturer &&
        !rowText.includes(item.manufacturer.toLowerCase())
      )
        return false;
      if (item.model && !rowText.includes(item.model.toLowerCase()))
        return false;
      if (
        typeof item.isVehicleAssigned === "boolean" &&
        !rowText.includes(item.isVehicleAssigned ? "yes" : "no")
      )
        return false;
      if (item.status && !rowText.includes(item.status.toLowerCase()))
        return false;
    }

    return true;
  }


  async getVisibleTableRows(): Promise<
    { manufacturer?: string; model?: string; status?: string; imei?: string }[]
  > {
    await this.page.waitForTimeout(1500);

    const deviceRows = this.page
      .locator('tbody tr, [role="row"]:not([role="columnheader"])')
      .filter({ hasNot: this.page.locator(':has-text("No devices")') });

    const rowCount = await deviceRows.count();
    const rowsData: {
      manufacturer?: string;
      model?: string;
      status?: string;
      imei?: string;
    }[] = [];

    for (let i = 0; i < rowCount; i++) {
      const row = deviceRows.nth(i);
      const cells = row.locator("td");
      const cellCount = await cells.count();

      const texts: string[] = [];
      for (let j = 0; j < cellCount; j++) {
        const text = (await cells.nth(j).textContent())?.trim() ?? "";
        texts.push(text);
      }

      const rowData = {
        manufacturer: texts[1],
        model: texts[2],
        imei: texts[3],
        status: texts.find(
          (t) =>
            t.toLowerCase().includes("online") ||
            t.toLowerCase().includes("offline")
        ),
      };

      rowsData.push(rowData);
    }
    console.log(
      "Extracted UI Table Rows (first 5):",
      JSON.stringify(rowsData.slice(0, 5), null, 2)
    );

    return rowsData;
  }

  async verifyDisabledSaveButton() {
    const button = this.page.locator('button[form="device-form"][disabled]');
    const isDisabled = await button.isDisabled();
    return isDisabled;
  }
  async fieldValidationError() {
    const errorMessages = [
      "IMEI is required",
      "Phone Number is required",
      "Device username is required",
      "Device password is required",
    ];
    for (const message of errorMessages) {
      const errorLocator = this.page.locator(`text=${message}`).isVisible();
      if (!errorLocator) {
        return false;
      }
    }
    return true;
  }

  async isNoDevicesMessageVisible(): Promise<boolean> {
    return this.page
      .locator("text=/No devices found matching your criteria/i")
      .isVisible({ timeout: 5000 });
  }
}
