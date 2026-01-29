import { Page } from "playwright";
import { DropdownUtils } from "../utils/dropdownUtils";
import { FilterUtils } from "../utils/filterUtils";
import { SortUtils } from "../utils/sortUtils";

export class FleetGroupsPage {
  private filterUtils: FilterUtils;
  private sortUtils: SortUtils;
  constructor(private page: Page) {
    this.filterUtils = new FilterUtils(page);
    this.sortUtils = new SortUtils(page);
  }

  async getTitle() {
    return await this.page.locator("h1, .page-title").textContent();
  }

  async clickAddGroup() {
    await this.page
      .locator('button:has-text("Create Group")')
      .click({ force: true });
  }

  async fillGroupForm(data: {
    groupName: string;
    manager: string;
    vehicles: string;
  }) {
    const dropdownUtils = new DropdownUtils(this.page);
    await this.page.fill('input[name="groupName"]', data.groupName);
    await this.page
      .locator('label[for="userIds"]')
      .locator("..")
      .locator('button[aria-haspopup="dialog"]')
      .click();
    await this.page.waitForTimeout(500);

    await this.page.keyboard.type(data.manager);

    await this.page.waitForTimeout(500);

    await this.page.locator(`text="${data.manager}"`).first().click();
    await this.page
      .locator('input[placeholder="Search vehicle"]')
      .fill(data.vehicles);
    await this.page
      .locator('tbody[data-slot="table-body"] input[type="checkbox"]')
      .first()
      .click();
  }

  async submitGroupForm() {
    await this.page.click('button:has-text("Save Group")');
  }

  async searchGroup(groupName: string) {
    await this.page.locator('input[placeholder="Search"]').fill(groupName);
    await this.page.waitForTimeout(1500);
  }

  async isGroupInTable(groupName: string) {
    await this.page.waitForTimeout(2000);
    return await this.page.locator(`tr:has-text("${groupName}")`).isVisible();
  }

  async getNoGroupsMessage() {
    return await this.page.locator("text=No results found").textContent();
  }

  async clickViewGroup(groupName: string) {
    await this.searchGroup(groupName);
    await this.page.waitForTimeout(500);
    const row = this.page
      .locator(`tr:has-text("${groupName}"):visible`)
      .first();
    const viewButton = row.locator("button").nth(0);
    await viewButton.click();
    await this.page.waitForTimeout(500);
  }

  async isGroupModalVisible() {
    const groupHeader = this.page.locator("p", {
      hasText: "Fleet Group Details",
    });
    await groupHeader.waitFor({ state: "visible", timeout: 5000 });
    return await groupHeader.isVisible();
  }

  async waitForGroupDetailsModal() {
    const modal = this.page.locator('span:has-text("Group Details")');
    await modal.waitFor({ state: "visible", timeout: 10000 });
    return modal;
  }

  async verifyGroupDetailsPresent(details: {
    groupName: string;
    manager: string;
  }) {
    const modalContainer = this.page
      .locator('div:has(span:text("Group Details"))')
      .first();
    await modalContainer.waitFor({ state: "visible", timeout: 10000 });

    const modalText = (await modalContainer.textContent()) ?? "";
    const text = modalText.toLowerCase();

    if (
      !text.includes(details.groupName.toLowerCase()) ||
      !text.includes(details.manager.toLowerCase())
    ) {
      throw new Error(
        `❌ Expected details not found in modal.\nFound text: ${modalText}\nExpected group: ${details.groupName}, manager: ${details.manager}`
      );
    }

    console.log("Verified group modal shows correct name and manager.");
  }

  async clickEditGroup(groupName: string) {
    await this.searchGroup(groupName);
    await this.page.waitForTimeout(500);
    const row = this.page
      .locator(`tr:has-text("${groupName}"):visible`)
      .first();
    const editButton = row.locator("button").nth(1);
    await editButton.click();
    await this.page.waitForTimeout(3000);
  }

  async updateGroupName(groupName: string) {
    this.page.waitForTimeout(20000);
    await this.page.locator('input[name="groupName"]').fill(groupName);
  }

  async saveEdit() {
    await this.page.click('button:has-text("Save Changes")');
  }

  async isGroupWithManagerInTable(groupName: string, manager: string) {
    await this.page.waitForTimeout(1500);
    return await this.page
      .locator(`tr:has-text("${groupName}") >> td:has-text("${manager}")`)
      .isVisible();
  }

  async clickDeleteGroup(groupName: string) {
    await this.searchGroup(groupName);
    const row = this.page
      .locator(`tr:has-text("${groupName}"):visible`)
      .first();
    const deleteButton = row.locator("button").nth(2);
    await deleteButton.click();
    await this.page.waitForTimeout(1000);
  }

  async confirmDelete() {
    await this.page.fill('input[name="confirmationText"]', "DELETE");
    await this.page.click('button:has-text("Delete Group")');
    await this.page.waitForTimeout(1500);
  }

  async getNotification() {
    await this.page.waitForTimeout(1500);
    const notification = this.page
      .locator("text=/successfully|created|deleted|updated/i")
      .first();
    return await notification.textContent();
  }
  async verifyDisabledSaveButton() {
    return this.page.locator('button[form="group-form"]').isDisabled();
  }

  async openFilterDialog() {
    await this.filterUtils.openFilterDialog();
  }

  async selectFleetManagerFilter(value: string) {
    await this.filterUtils.selectRadixFilterOption("Fleet Manager", value);
  }

  async selectCreatedByFilter(value: string) {
    await this.filterUtils.selectRadixSingleSelectOption("Created By", value);
  }

  async selectVehicleCountFilter(value: string) {
    await this.filterUtils.selectCheckboxFilter("No. of Vehicles", value);
  }

  async applyFilter() {
    await this.filterUtils.applyFilters();
  }

  async clearAllFilters() {
    await this.filterUtils.clearAllFilters();
  }

  async hasActiveFilters() {
    return await this.filterUtils.hasActiveFilters();
  }

  async verifyFilteredResults(criteria: {
    manager?: string;
    createdBy?: string;
    vehicles?: string;
  }) {
    await this.page.waitForTimeout(1500);

    const rows = this.page.locator("tbody tr");
    const count = await rows.count();

    if (count === 0) {
      return await this.page.locator("text=No groups found").isVisible();
    }

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const text = (await row.textContent())?.toLowerCase() ?? "";

      if (criteria.manager && !text.includes(criteria.manager.toLowerCase()))
        return false;

      if (
        criteria.createdBy &&
        !text.includes(criteria.createdBy.toLowerCase())
      )
        return false;

      if (criteria.vehicles && !text.includes(criteria.vehicles.toLowerCase()))
        return false;
    }

    return true;
  }

  async noGroupsFoundVisible(): Promise<boolean> {
    return await this.page.locator("text=/No groups found/i").isVisible();
  }


  async openSortDropdown() {
    await this.sortUtils.openSortDropdown();
  }

  async getSortOptions() {
    return await this.sortUtils.getSortOptions();
  }

  async selectSortOption(option: string) {
    await this.sortUtils.selectSortOption(option);
  }

  async getSortIndicator() {
    return await this.sortUtils.getSortIndicator();
  }

  async verifySortApplied(criteria: string) {
    return await this.sortUtils.isSortApplied(criteria);
  }

  async verifyFleetGroupsSorted(criteria: string, columnIndex: number) {
    return await this.sortUtils.verifySortOrder(criteria, columnIndex);
  }


  async getVisibleRows() {
    await this.page.waitForTimeout(1000);
    const rows = this.page.locator("tbody tr");
    const count = await rows.count();

    const output = [];

    for (let i = 0; i < count; i++) {
      const cells = rows.nth(i).locator("td");

      output.push({
        groupName: (await cells.nth(1).textContent())?.trim() ?? "",
        manager: (await cells.nth(2).textContent())?.trim() ?? "",
        createdBy: (await cells.nth(3).textContent())?.trim() ?? "",
        vehicles: (await cells.nth(4).textContent())?.trim() ?? "",
      });
    }

    return output;
  }
}
