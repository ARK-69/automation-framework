import { Page } from "playwright";
import { DropdownUtils } from "../utils/dropdownUtils";
import { createFileUploadUtils } from "../utils/fileUploadUtils";
import { createDatePickerUtils } from "../utils/datePickerUtils";
import { FilterUtils } from "../utils/filterUtils";
import { SortUtils } from "../utils/sortUtils";

export interface DriverData {
  name: string;
  phone: string;
  email: string;
  nationality?: string;
  documentType?: string;
  documentNumber?: string;
  licenseNumber?: string;
  licenseClass?: string;
  licenseIssueDate?: string;
  licenseExpiryDate?: string;
  profileImage?: string;
  idDocument?: string;
  additionalDocuments?: string[];
}

export class DriversPage {
  private filterUtils: FilterUtils;
  private sortUtils: SortUtils;
  constructor(private page: Page) {
    this.filterUtils = new FilterUtils(page);
    this.sortUtils = new SortUtils(page);
  }

  async getTitle() {
    return await this.page.locator("h1, .page-title").textContent();
  }

  async clickAddDriver() {
    await this.page.locator('button:has-text("Add Driver")').click();
  }

  async fillDriverForm(data: DriverData) {
    const dropdownUtils = new DropdownUtils(this.page);
    const uploadUtils = createFileUploadUtils(this.page);
    const datePickerUtils = createDatePickerUtils(this.page);

    await this.page.fill("#driverName", data.name);
    await this.page.fill("#mobileNumber", data.phone);
    await this.page.fill("#email", data.email);

    await this.filterUtils.selectDropdownFilter(
      "Nationality",
      data.nationality ?? "Pakistan"
    );
    await dropdownUtils.selectDropdownOption(
      "Document Type",
      data.documentType ?? "Iqama"
    );
    await dropdownUtils.selectDropdownOption(
      "License Class",
      data.licenseClass ?? "Class 2 - Private Vehicles"
    );

    await this.page.fill(
      'input[name="documentNumber"]',
      data.documentNumber ?? ""
    );
    await this.page.fill(
      'input[name="licenseNumber"]',
      data.licenseNumber ?? ""
    );

    if (data.licenseIssueDate) {
      await datePickerUtils.dateByType(data.licenseIssueDate,"License Issue Date");
    }

    if (data.licenseExpiryDate) {
      await datePickerUtils.dateByType(data.licenseExpiryDate,"License Expiry Date");
    }

    if (data.profileImage) {
      await uploadUtils.uploadFile("Upload Image", data.profileImage);
    }

    if (data.idDocument) {
      await uploadUtils.uploadFile("ID Document Copy", data.idDocument);
    }

    if (data.additionalDocuments && data.additionalDocuments.length > 0) {
      await uploadUtils.uploadMultipleFiles(
        "Additional Documents",
        data.additionalDocuments
      );
    }
  }

  async submitDriverForm() {
    await this.page.click('button:has-text("Save")');
    await this.page.waitForTimeout(2000);
  }

  async searchDriver(name: string) {
    await this.page.locator('input[placeholder="Search"]').fill(name);
    await this.page.waitForTimeout(2000);
  }

  async isDriverInTable(name: string) {
    await this.page.waitForTimeout(4000);
    return await this.page.locator(`tr:has-text("${name}")`).isVisible();
  }

  async getNoDriversMessage() {
    return await this.page.locator("text=No drivers found").textContent();
  }

  async clickViewDriver(name: string) {
    await this.searchDriver(name);
    await this.page.waitForTimeout(500);

    const row = this.page.locator(`tr:has-text("${name}"):visible`).first();
    const viewButton = row.locator("button").first();

    await viewButton.click();
    await this.page.waitForTimeout(500);
  }

  async isDriverModalVisible() {
    const driverHeader = this.page.locator("p", { hasText: "Driver Details" });
    await driverHeader.waitFor({ state: "visible", timeout: 5000 });
    return await driverHeader.isVisible();
  }

  async waitForDriverDetailsModal() {
    const modal = this.page.locator('h3:has-text("Driver Details")');
    await modal.waitFor({ state: "visible", timeout: 10000 });
    return modal;
  }

  async verifyDriverDetailsPresent(details: { name: string; email: string }) {
    const modal = await this.waitForDriverDetailsModal();
    const modalContainer = modal.locator(
      'xpath=ancestor::div[contains(@class,"bg-card")]'
    );

    await modalContainer.waitFor({ state: "visible", timeout: 5000 });

    const modalText = await modalContainer.textContent();

    if (!modalText) throw new Error("Modal text content not found");

    const text = modalText.toLowerCase();
    const nameFound = text.includes(details.name.toLowerCase());
    const emailFound = text.includes(details.email.toLowerCase());

    if (!nameFound || !emailFound) {
      throw new Error(
        `Expected details not found in modal.\n` +
          `Found text: ${modalText}\n` +
          `Expected name: ${details.name}, email: ${details.email}`
      );
    }

    console.log(`  Verified driver modal shows correct name and email.`);
  }

  async clickEditDriver(name: string) {
    await this.searchDriver(name);
    await this.page.waitForTimeout(500);

    const row = this.page.locator(`tr:has-text("${name}"):visible`).first();
    const editButton = row.locator("button").nth(1);

    await editButton.click();
    await this.page.waitForTimeout(3000);
  }

  async updateDriverEmail(email: string) {
    await this.page.locator('input[name="email"]').fill(email);
  }

  async saveEdit() {
    await this.page.click('button:has-text("Save Changes")');
    await this.page.waitForTimeout(1500);
  }

  async clickDeleteDriver(name: string) {
    await this.searchDriver(name);
    await this.page.waitForTimeout(500);

    const row = this.page.locator(`tr:has-text("${name}"):visible`).first();
    const deleteButton = row.locator("button").nth(2);

    await deleteButton.click();
    await this.page.waitForTimeout(500);
  }

  async confirmDelete() {
    await this.page.click('button:has-text("Delete")');
    await this.page.waitForTimeout(1500);
  }

  async getNotification() {
    await this.page.waitForTimeout(2000);

    const notification = this.page
      .locator("text=/successfully|updated|deleted|created|added/i")
      .first();

    return await notification.textContent();
  }
  async getRequiredFieldErrors() {
    const messages = [
      "Document number is required",
      "Driver name is required",
      "Document type is required",
      "License number is required",
      "License class is required",
      "Expiry date must be after issue date",
      "At least one ID document file is required",
    ];
    let allTrue = false;
    for (const message of messages) {
      const isVisible = await this.page.locator(`text=${message}`).isVisible();

      if (isVisible) {
        allTrue = true;
      } else {
        return (allTrue = false);
      }
    }
    return allTrue;
  }
  async enterPhone() {
    await this.page.fill("#mobileNumber", "1234567890");
  }

  async openFilterDialog() {
    await this.filterUtils.openFilterDialog();
  }

  async selectVehicleAssignedFilter(value: "Yes" | "No") {
    await this.filterUtils.selectRadioFilter("Vehicle Assigned", value);
  }

  async selectPrimaryDriverFilter(value: "Yes" | "No") {
    await this.filterUtils.selectRadioFilter("Primary Driver", value);
  }

  async selectBehaviourScoreFilter(range: string) {
    await this.filterUtils.selectRadioFilter("Behaviour Score", range);
  }

  async clickApplyFilter() {
    await this.filterUtils.applyFilters();
  }

  async clickClearAllFilters() {
    await this.filterUtils.clearAllFilters();
  }

  async hasActiveFilters(): Promise<boolean> {
    return this.filterUtils.hasActiveFilters();
  }

  async isFilterReset(filterLabel: string): Promise<boolean> {
    return this.filterUtils.isFilterReset(filterLabel);
  }

  async verifyFilteredResults(filterCriteria: {
    vehicleAssigned?: string;
    primaryDriver?: string;
    behaviourScore?: string;
  }): Promise<boolean> {
    await this.page.waitForTimeout(1500);
    const rows = this.page
      .locator("tbody tr")
      .filter({ hasNot: this.page.locator(':has-text("No drivers")') });
    const count = await rows.count();
    if (count === 0) {
      return this.page.locator("text=No drivers found").isVisible();
    }
    for (let i = 0; i < Math.min(count, 10); i++) {
      const row = rows.nth(i);
      const text = (await row.textContent())?.toLowerCase() ?? "";
      if (
        filterCriteria.vehicleAssigned &&
        !text.includes(filterCriteria.vehicleAssigned.toLowerCase())
      )
        return false;
      if (
        filterCriteria.primaryDriver &&
        !text.includes(filterCriteria.primaryDriver.toLowerCase())
      )
        return false;
      if (
        filterCriteria.behaviourScore &&
        !text.includes(filterCriteria.behaviourScore.toLowerCase())
      )
        return false;
    }
    return true;
  }

  async openSortDropdown() {
    await this.sortUtils.openSortDropdown();
  }

  async getSortOptions(): Promise<string[]> {
    return this.sortUtils.getSortOptions();
  }

  async selectSortOption(sortOption: string) {
    await this.sortUtils.selectSortOption(sortOption);
  }

  async getSortIndicator(): Promise<string | null> {
    return this.sortUtils.getSortIndicator();
  }

  async verifySortApplied(sortOption: string): Promise<boolean> {
    return this.sortUtils.isSortApplied(sortOption);
  }

  async verifyDriversSorted(
    sortOption: string,
    columnIndex: number
  ): Promise<boolean> {
    return this.sortUtils.verifySortOrder(sortOption, columnIndex);
  }

 
  async getVisibleRows(): Promise<
    {
      index?: string;
      driverName?: string;
      vehicle?: string;
      isPrimaryDriver?: boolean;
      behaviorScore?: number | null;
      authorizationStatus?: string;
    }[]
  > {
    await this.page.waitForTimeout(1500);

    const tableRows = this.page
      .locator('tbody tr, [role="row"]:not([role="columnheader"])')
      .filter({ hasNot: this.page.locator(':has-text("No drivers found")') });

    const rowCount = await tableRows.count();
    const rowsData: {
      index?: string;
      driverName?: string;
      vehicle?: string;
      isPrimaryDriver?: boolean;
      behaviorScore?: number | null;
      authorizationStatus?: string;
    }[] = [];

    for (let i = 0; i < rowCount; i++) {
      const row = tableRows.nth(i);
      const cells = row.locator("td");
      const cellCount = await cells.count();
      const texts: string[] = [];

      for (let j = 0; j < cellCount; j++) {
        const text = (await cells.nth(j).textContent())?.trim() ?? "";
        texts.push(text);
      }

      const rowData = {
        index: texts[0],
        driverName: texts[1],
        vehicle: texts[2] || "-",
        isPrimaryDriver: /yes/i.test(texts[3]),
        behaviorScore:
          texts[4] === "-" || texts[4] === "" ? null : parseFloat(texts[4]),
        authorizationStatus: texts[5] || "",
      };

      rowsData.push(rowData);
    }

    console.log(
      " Extracted Driver Table Rows (first 5):",
      JSON.stringify(rowsData.slice(0, 5), null, 2)
    );

    return rowsData;
  }
}
