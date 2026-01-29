import { Page } from "playwright";
import { DropdownUtils } from "../utils/dropdownUtils";
import { createFileUploadUtils } from "../utils/fileUploadUtils";
import { createDatePickerUtils } from "../utils/datePickerUtils";
import { FilterUtils } from "../utils/filterUtils";
import { SortUtils } from "../utils/sortUtils";

export interface VehicleData {
  plate: string;
  vin: string;
  year: string;
  make: string;
  model: string;
  vehicleType?: string;
  fuelType?: string;
  color?: string;
  maxWeight?: string;
  seats?: string;
  tires?: string;
  mileage?: string;
  driverName?: string;
  speedThreshold?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  policyExpiry?: string;
  coverageType?: string;
  registrationNumber?: string;
  registrationExpiry?: string;
  registrationState?: string;
  additionalNotes?: string;
  insuranceDocument?: string;
  registrationDocument?: string;
  additionalDocuments?: string[];
}

export class VehiclesPage {
  private filterUtils: FilterUtils;
  private sortUtils: SortUtils;
  constructor(private page: Page) {
    this.filterUtils = new FilterUtils(page);
    this.sortUtils = new SortUtils(page);
  }

  async getTitle() {
    return await this.page.locator("h1, .page-title").textContent();
  }

  async clickAddVehicle() {
    await this.page.locator('button:has-text("Add Vehicle")').click();
  }

  async fillVehicleForm(data: VehicleData) {
    const dropdownUtils = new DropdownUtils(this.page);
    const uploadUtils = createFileUploadUtils(this.page);
    const datePickerUtils = createDatePickerUtils(this.page);

    await this.page.fill('input[name="plateNo"]', data.plate);
    await this.page.fill('input[name="vinNumber"]', data.vin);
    await this.page.fill('input[name="year"]', data.year);
    await this.page.fill('input[name="make"]', data.make);
    await this.page.fill('input[name="model"]', data.model);
    await this.page.fill('input[name="color"]', data.color ?? "");

    await dropdownUtils.selectDropdownOption(
      "Vehicle Type",
      data.vehicleType ?? "SUV"
    );
    await dropdownUtils.selectDropdownOption(
      "Fuel Type",
      data.fuelType ?? "Diesel"
    );
    await dropdownUtils.selectDropdownOptionByClick(
      "Coverage Type",
      data.coverageType ?? "Comprehensive"
    );
    await dropdownUtils.selectDropdownOption(
      "State/Province",
      data.registrationState ?? "Jeddah"
    );

    await this.page.fill('input[name="maxWeight"]', data.maxWeight ?? "");
    await this.page.fill('input[name="numberOfSeats"]', data.seats ?? "");
    await this.page.fill('input[name="numberOfTires"]', data.tires ?? "");
    await this.page.fill('input[name="currentMileage"]', data.mileage ?? "");
    await this.page.fill(
      'input[name="speedThreshold"]',
      data.speedThreshold ?? ""
    );
    await this.page.fill(
      'input[name="insuranceProviderName"]',
      data.insuranceProvider ?? ""
    );
    await this.page.fill(
      'input[name="insurancePolicyNumber"]',
      data.policyNumber ?? ""
    );
    await this.page.fill(
      'input[name="registrationNumber"]',
      data.registrationNumber ?? ""
    );
    await this.page.fill(
      'textarea[name="additionalNotes"]',
      data.additionalNotes ?? ""
    );

    if (data.policyExpiry) {
      await datePickerUtils.dateByType(data.policyExpiry,"Policy Expiry Date");
      
    }
    if (data.registrationExpiry) {
      await datePickerUtils.dateByType(data.registrationExpiry,"Registration Expiry Date");
      
    }

    if (data.insuranceDocument && data.insuranceDocument.length) {
      await uploadUtils.uploadFile(
        "Insurance Documents",
        data.insuranceDocument
      );
    }
    if (data.registrationDocument && data.registrationDocument.length) {
      await uploadUtils.uploadFile(
        "Registration Documents",
        data.registrationDocument
      );
    }
    if (data.additionalDocuments && data.additionalDocuments.length) {
      await uploadUtils.uploadMultipleFiles(
        "Additional Documents",
        data.additionalDocuments
      );
    }
  }

  async submitVehicleForm() {
    await this.page.click('button:has-text("Save Vehicle")');
    await this.page.waitForTimeout(2000);
  }

  async searchVehicle(plate: string) {
    await this.page.locator('input[placeholder="Search"]').fill(plate);
    await this.page.waitForTimeout(2000);
  }

  async isVehicleInTable(plate: string) {
    await this.page.waitForTimeout(4000);
    return await this.page.locator(`tr:has-text("${plate}")`).isVisible();
  }

  async getNoVehiclesMessage() {
    return await this.page.locator("text=No vehicles found").textContent();
  }

  async clickViewVehicle(plate: string) {
    await this.searchVehicle(plate);
    await this.page.waitForTimeout(500);
    const row = this.page.locator(`tr:has-text("${plate}"):visible`).first();
    const viewButton = row.locator("button").first();
    await viewButton.click();
    await this.page.waitForTimeout(500);
  }

  async isVehicleModalVisible() {
    const vehicleHeader = this.page.locator("p", {
      hasText: "Vehicle Details",
    });
    await vehicleHeader.waitFor({ state: "visible", timeout: 5000 });
    return await vehicleHeader.isVisible();
  }

  async waitForVehicleDetailsModal() {
    const modal = this.page.locator('h3:has-text("Vehicle Information")');
    await modal.waitFor({ state: "visible", timeout: 10000 });
    return modal;
  }

  async verifyVehicleDetailsPresent(details: { plate: string; vin: string }) {
    const modal = await this.waitForVehicleDetailsModal();
    const modalContainer = modal.locator(
      'xpath=ancestor::div[contains(@class,"bg-card")]'
    );
    await modalContainer.waitFor({ state: "visible", timeout: 5000 });
    const modalText = await modalContainer.textContent();
    if (!modalText) throw new Error("Modal text content not found");
    const text = modalText.toLowerCase();
    const plateFound = text.includes(details.plate.toLowerCase());
    const vinFound = text.includes(details.vin.toLowerCase());
    if (!plateFound || !vinFound) {
      throw new Error(
        `Expected details not found in modal.\n` +
          `Found text: ${modalText}\n` +
          `Expected plate: ${details.plate}, vin: ${details.vin}`
      );
    }
    console.log(`  Verified vehicle modal shows correct plate and VIN.`);
  }

  async clickEditVehicle(plate: string) {
    await this.searchVehicle(plate);
    await this.page.waitForTimeout(500);
    const row = this.page.locator(`tr:has-text("${plate}"):visible`).first();
    const editButton = row.locator("button").nth(1);
    await editButton.click();
    await this.page.waitForTimeout(3000);
  }

  async updateVehicleModel(model: string) {
    await this.page.locator('input[name="model"]').fill(model);
  }

  async saveEdit() {
    await this.page.click('button:has-text("Save Changes")');
    await this.page.waitForTimeout(1500);
  }

  async clickDeleteVehicle(plate: string) {
    await this.searchVehicle(plate);
    await this.page.waitForTimeout(500);
    const row = this.page.locator(`tr:has-text("${plate}"):visible`).first();
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
  async requiredFieldValidationErrror() {
    const errorMessages = [
      "Vehicle Plate No. is required",
      "VIN Number is required",
      "Year is required",
      "Make is required",
      "Model is required",
      "Vehicle Type is required",
      "Fuel Type is required",
      "Color is required",
      "Max Weight is required",
      "Number of seats is required",
      "Number of tires is required",
      "Current mileage is required",
      "Speed Threshold is required",
      "Insurance Provider Name is required",
      "Policy Number is required",
      "Coverage Type is required",
      "Registration Number is required",
    ];
    for (const msg of errorMessages) {
      const isVisible = await this.page.locator(`text=${msg}`).isVisible();
      if (!isVisible) {
        return false;
      }
    }
    return true;
  }


  async openFilterDialog() {
    await this.filterUtils.openFilterDialog();
  }

  async selectVehiclesAssignedFilter(value: "Yes" | "No") {
    await this.filterUtils.selectRadioFilter("Driver Assigned", value);
  }

  async selectFleetGroupFilter(value: string) {
    await this.filterUtils.selectRadixFilterOption("Fleet Group", value);
  }

  async selectVehicleTypeFilter(value: string) {
    await this.filterUtils.selectCheckboxFilter("Vehicle Type", value);
  }

  async selectFuelTypeFilter(fuel: string) {
    await this.filterUtils.selectCheckboxFilter("Fuel Type", fuel);
  }

  async selectInsurancePolicyExpiryFilter(
    value:
      | "Expired"
      | "Expires within 7 days"
      | "Expires within 10 days"
      | "Expires within 15 days"
  ) {
    await this.filterUtils.selectRadioFilter("Insurance Policy Expiry", value);
  }
  async selectRegistrationExpiryFilter(
    value:
      | "Expired"
      | "Expires within 7 days"
      | "Expires within 10 days"
      | "Expires within 15 days"
  ) {
    await this.filterUtils.selectRadioFilter("Registration Expiry", value);
  }

  async selectPolicyExpiryRangeFilter(fromRange: string, toRange: string) {
    const datePickerUtils = createDatePickerUtils(this.page);
    await datePickerUtils.setDateByDiv("Policy Expiry Range", "From", toRange);
    await datePickerUtils.setDateByDiv("Policy Expiry Range", "To", toRange);
  }

  async selectRegistrationExpiryRangeFilter(
    fromRange: string,
    toRange: string
  ) {
    const datePickerUtils = createDatePickerUtils(this.page);
    await datePickerUtils.setDateByDiv(
      "Registration Expiry Range",
      "From",
      toRange
    );
    await datePickerUtils.setDateByDiv(
      "Registration Expiry Range",
      "To",
      toRange
    );
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
    vehiclesAssigned?: string;
  }): Promise<boolean> {
    await this.page.waitForTimeout(1500);
    const vehiclesRows = this.page
      .locator('tbody tr, [role="row"]:not([role="columnheader"])')
      .filter({ hasNot: this.page.locator(':has-text("No vehicles")') });
    const rowCount = await vehiclesRows.count();

    if (rowCount === 0) {
      const noVehiclesMessage = await this.page
        .locator("text=/No Vehicles found|No results/i")
        .isVisible();
      return noVehiclesMessage;
    }

    for (let i = 0; i < Math.min(rowCount, 10); i++) {
      const row = vehiclesRows.nth(i);
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

  async verifyAllVehiclesDisplayed(): Promise<boolean> {
    await this.page.waitForTimeout(1500);
    const noVehiclesMessage = await this.page
      .locator("text=/No Vehicles found /i")
      .isVisible();
    return !noVehiclesMessage;
  }

  async verifyVehiclesMatchFilters(filters: {
    manufacturer?: string;
    model?: string;
    status?: string;
  }): Promise<boolean> {
    return await this.verifyFilteredResults(filters);
  }
  async isNoVehiclesMessageVisible(): Promise<boolean> {
    return this.page
      .locator("text=/No vehicles found/i")
      .isVisible({ timeout: 5000 });
  }

  async waitForVehiclesApiResponse(): Promise<any> {
    const response = await this.page.waitForResponse(
      (resp) => {
        return (
          resp.url().includes("/core/api/v1/vehicles") &&
          resp.request().method() === "GET" &&
          resp.ok()
        );
      },
      { timeout: 30000 }
    );

    return await response.json();
  }

  async getVisibleRows() {
    await this.page.waitForTimeout(1000);

    const rows = this.page.locator("tbody tr");
    const count = await rows.count();

    const output = [];

    for (let i = 0; i < count; i++) {
      const cells = rows.nth(i).locator("td");
      const vehicleCell = cells.nth(1);
      const fullVehicleText = await vehicleCell.innerText();
      const cleanText = fullVehicleText.replace(/\s+/g, " ").trim();

      const plateNo =
        cleanText
          .split(/\s+(?=[A-Z][a-z])/)[0]
          ?.trim()
          .toLowerCase() ?? "";
      output.push({
        plateNo: plateNo,

        model: (await cells.nth(1).textContent())?.split("\n")[1]?.trim() ?? "",
        assignedTo: (await cells.nth(2).textContent())?.trim() ?? "",
        fleetGroup: (await cells.nth(3).textContent())?.trim() ?? "",
        speedThreshold: (await cells.nth(4).textContent())?.trim() ?? "",
        status: (await cells.nth(5).textContent())?.trim() ?? "",
        insurancePolicyNo: (await cells.nth(6).textContent())?.trim() ?? "",
        policyExpiry: (await cells.nth(7).textContent())?.trim() ?? "",
        registrationNo: (await cells.nth(8).textContent())?.trim() ?? "",
        registrationExpiry: (await cells.nth(9).textContent())?.trim() ?? "",
      });
    }

    return output;
  }

  async assertTableMatchesApiResults(apiResults: any[]): Promise<boolean> {
    const rows = this.page.locator("tbody tr");
    const rowCount = await rows.count();

    if (rowCount !== apiResults.length) return false;

    for (let i = 0; i < rowCount; i++) {
      const rowText = (await rows.nth(i).textContent())?.toLowerCase() ?? "";

      const item = apiResults[i];
      if (item.plateNo && !rowText.includes(item.plateNo.toLowerCase()))
        return false;
      if (
        item.registration &&
        !rowText.includes(item.registration.toLowerCase())
      )
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

    const vehiclesRows = this.page
      .locator('tbody tr, [role="row"]:not([role="columnheader"])')
      .filter({ hasNot: this.page.locator(':has-text("No vehicless")') });

    const rowCount = await vehiclesRows.count();
    const rowsData: {
      manufacturer?: string;
      model?: string;
      status?: string;
      imei?: string;
    }[] = [];

    for (let i = 0; i < rowCount; i++) {
      const row = vehiclesRows.nth(i);
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

  async verifyVehicleSorted(sortOption: string): Promise<boolean> {
    let columnIndex = 1;
    if (sortOption.includes("Vehicle Plate No.")) {
      columnIndex = 1;
    } else if (sortOption.includes("Assigned To")) {
      columnIndex = 2;
    } else if (sortOption.includes("Policy Expiry")) {
      columnIndex = 7;
    }

    return await this.sortUtils.verifySortOrder(sortOption, columnIndex);
  }
}
