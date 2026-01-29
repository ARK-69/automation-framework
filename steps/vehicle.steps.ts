import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { LoginPage } from "../pages/LoginPage";
import { Sidebar } from "../pages/Sidebar";
import { VehiclesPage } from "../pages/VehiclePage";
import { createDropdownUtils } from "../utils/dropdownUtils";
import { ApiAssertUtils } from "../utils/apiAssertUtils";
import type { Response } from "@playwright/test";
import { create } from "domain";
import { createDatePickerUtils } from "../utils/datePickerUtils";


function generateUniqueId(prefix: string = "", maxLength: number = 15): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 5);
  const combined = `${prefix}${timestamp}${random}`;
  return combined.slice(0, maxLength);
}

function getRandomYear(): string {
  const minYear = 2018;
  const maxYear = 2026;
  return Math.floor(
    Math.random() * (maxYear - minYear + 1) + minYear
  ).toString();
}

const vehicleTestData = {
  plate: `AT${Date.now().toString().slice(-8)}`.slice(0, 10),
  vin: generateUniqueId("VIN", 15),
  year: getRandomYear(),
  make: "Toyota",
  model: "Automation Model",
  vehicleType: "SUV",
  fuelType: "Diesel",
  color: "Grey",
  maxWeight: "2500",
  seats: "5",
  tires: "4",
  mileage: "6000",
  speedThreshold: "160",
  insuranceProvider: "Allianz",
  policyNumber: generateUniqueId("POL", 15),
  policyExpiry: "2025-11-30",
  coverageType: "Comprehensive",
  registrationNumber: generateUniqueId("REG", 15),
  registrationExpiry: "2025-11-30",
  registrationState: "Jeddah",
  additionalNotes: "Automated vehicle record",
  insuranceDocument: "./test-data/images (3).jpg",
  registrationDocument: "./test-data/Check  Last_Nutrition_Program.pdf",
  additionalDocuments: [
    "./test-data/images (3).jpg",
    "./test-data/Check  Last_Nutrition_Program.pdf",
  ],
};

let vehiclesPage: VehiclesPage;

When(
  "I select {string} from {string} dropdown",
  async function (optionText: string, dropdownLabel: string) {
    const dropdownUtils = createDropdownUtils(this.page);
    await dropdownUtils.selectDropdownOption(dropdownLabel, optionText);
  }
);

Given(
  "the user has logged in and has navigated to the Vehicles page",
  async function () {
    const loginPage = new LoginPage(this.page);
    await loginPage.goto();
    await loginPage.login(
      process.env.TEST_USER_EMAIL || "your_username",
      process.env.TEST_USER_PASSWORD || "your_password"
    );
    const sidebar = new Sidebar(this.page);
     
    await sidebar.navigateToVehicles();
    vehiclesPage = new VehiclesPage(this.page);
    const title = await vehiclesPage.getTitle();
    expect(title).to.include("Vehicles");
    this.vehicleData = vehicleTestData;
  }
);

When("the user adds a new vehicle with valid details", async function () {
  await vehiclesPage.clickAddVehicle();
  await vehiclesPage.fillVehicleForm(this.vehicleData);
  await vehiclesPage.submitVehicleForm();
});

Then(
  'a "Vehicle created and files uploaded successfully" notification should be displayed',
  async function () {
    const notif = await vehiclesPage.getNotification();
    expect(notif).to.include("Vehicle created successfully!");
  }
);

Then(
  "the user searches for the new vehicle's plate in the vehicles table",
  async function () {
    await vehiclesPage.searchVehicle(this.vehicleData.plate);
  }
);

Then(
  "the new vehicle should be listed in the search results",
  async function () {
    const found = await vehiclesPage.isVehicleInTable(this.vehicleData.plate);
    expect(found).to.be.true;
  }
);

When('the user searches for "xyz" in the vehicles table', async function () {
  await vehiclesPage.searchVehicle("xyz");
});

Then('a "No vehicles found" message should be displayed', async function () {
  const msg = await vehiclesPage.getNoVehiclesMessage();
  expect(msg).to.include("No vehicles found");
});

When("the user clicks the view icon for the new vehicle", async function () {
  await vehiclesPage.clickViewVehicle(this.vehicleData.plate);
});

Then("the vehicle details modal should be displayed", async function () {
  const visible = await vehiclesPage.isVehicleModalVisible();
  expect(visible).to.be.true;
});

Then("the modal should show the correct vehicle details", async function () {
  await vehiclesPage.verifyVehicleDetailsPresent({
    plate: this.vehicleData.plate,
    vin: this.vehicleData.vin,
  });
});

When("the user clicks the edit icon for the new vehicle", async function () {
  await vehiclesPage.clickEditVehicle(this.vehicleData.plate);
});

When(
  "the user edits the vehicle's details and saves the changes",
  async function () {
    const newModel = `Model_${Date.now()}`;
    await vehiclesPage.updateVehicleModel(newModel);
    await vehiclesPage.saveEdit();
    this.vehicleData.model = newModel;
  }
);

Then(
  'a "Vehicle updated successfully" notification should be displayed',
  async function () {
    const notif = await vehiclesPage.getNotification();
    expect(notif).to.include("Vehicle updated successfully!");
  }
);

When("the user clicks the delete icon for the new vehicle", async function () {
  await vehiclesPage.clickDeleteVehicle(this.vehicleData.plate);
});

When("the user confirms deletion of the added vehicle", async function () {
  await vehiclesPage.confirmDelete();
});

Then(
  'a "Vehicle deleted successfully" notification should be displayed',
  async function () {
    const notif = await vehiclesPage.getNotification();
    const expectedMessage = `${vehicleTestData.plate} deleted successfully`;
    expect(notif).to.include(expectedMessage);
  }
);

Then(
  "the vehicle should no longer appear in the vehicles table",
  async function () {
    await vehiclesPage.searchVehicle(this.vehicleData.plate);
    const found = await vehiclesPage.isVehicleInTable(this.vehicleData.plate);
    expect(found).to.be.false;
  }
);
When("the user clicks add vehicle button", async function () {
  await vehiclesPage.clickAddVehicle();
});
Then("the user click save vehicle without entering data", async function () {
  await vehiclesPage.submitVehicleForm();
});
Then("the required fields should give validation error", async function () {
  const validationChecks = await vehiclesPage.requiredFieldValidationErrror();
  expect(validationChecks).to.be.true;
});


When("the user opens the filter dialog on the vehicles table", async () => {
  await vehiclesPage.openFilterDialog();
});

When(
  "the user selects {string} filter with value {string}",
  async function (filterLabel: string, value: string) {
    switch (filterLabel.toLowerCase()) {
      case "driver assigned":
        await vehiclesPage.selectVehiclesAssignedFilter(value as "Yes" | "No");
        break;

      case "fleet group":
        await vehiclesPage.selectFleetGroupFilter(value);
        break;
      case "vehicle type":
        await vehiclesPage.selectVehicleTypeFilter(
          value as "Sedan" | "SUV" | "Truck" | "Van" | "Bus"
        );
        break;
      case "fuel type":
        await vehiclesPage.selectFuelTypeFilter(
          value as "Gasoline" | "Diesel" | "Hybrid" | "Electric" | "CNG"
        );
        break;
      case "insurance policy expiry":
        await vehiclesPage.selectInsurancePolicyExpiryFilter(
          value as
            | "Expired"
            | "Expires within 7 days"
            | "Expires within 10 days"
            | "Expires within 15 days"
        );
        break;
      case "registration expiry":
        await vehiclesPage.selectRegistrationExpiryFilter(
          value as
            | "Expired"
            | "Expires within 7 days"
            | "Expires within 10 days"
            | "Expires within 15 days"
        );
        break;
      default:
        throw new Error(`Unsupported filter: ${filterLabel}`);
    }
  }
);

Then(
  "the user selects {string} from {string} till {string}",
  async function (filterLabel: string, fromDate: string, toDate: string) {
    const datepikcer = createDatePickerUtils(this.page);
    if (filterLabel.toLowerCase() === "policy expiry range") {
      await datepikcer.setDateByDiv(filterLabel, "From", fromDate);
      await datepikcer.setDateByDiv(filterLabel, "To", toDate);
    } else if (filterLabel.toLowerCase() === "registration expiry range") {
      await datepikcer.setDateByDiv(filterLabel, "From", fromDate);
      await datepikcer.setDateByDiv(filterLabel, "To", toDate);
    } else {
      throw new Error(`Unsupported filter for date range: ${filterLabel}`);
    }
  }
);

When(
  "the user clicks Apply button in the vehicles filter dialog",
  async function () {
    const [apiResponse] = await Promise.all([
      vehiclesPage.waitForVehiclesApiResponse(),
      vehiclesPage.clickApplyFilter(),
    ]);

    this.apiResponse = apiResponse;
  }
);

When('the user "Clear All" all the applied filters', async () => {
  await vehiclesPage.clickClearAllFilters();
});

When(
  "the user opens the filter dialog on the vehicles table again",
  async () => {
    await vehiclesPage.openFilterDialog();
  }
);

Then(
  "the vehicles table should display filtered results based on the applied filters",
  async function () {
    const apiData = this.apiResponse;
    const results = apiData?.results ?? [];

    if (results.length === 0) {
      const noVehicleVisible = await this.page
        .locator("text=/No results|No vehicles found/i")
        .isVisible();

      expect(
        noVehicleVisible,
        "Expected empty state since API returned 0 results"
      ).to.be.true;

      return;
    }

    const uiRows = await vehiclesPage.getVisibleRows();

    const normalizedUiRows = uiRows.map((row) => ({
      plateNo: row.plateNo,
      model: row.model,
      assignedTo: row.assignedTo,
      fleetGroup: row.fleetGroup,
      speedThreshold: row.speedThreshold,
      status: row.status,
      insurancePolicyNo: row.insurancePolicyNo,
      policyExpiry: row.policyExpiry,
      registrationNo: row.registrationNo,
      registrationExpiry: row.registrationExpiry,
    }));

    const apiAssert = new ApiAssertUtils(this.page);
    await apiAssert.assertVehicleMatchApi(
      normalizedUiRows,
      results,
      "Vehicle Plate No."
    );
  }
);

Then(
  "the filter should show active vehicle filters in the filter indicator",
  async () => {
    const hasActiveFilters = await vehiclesPage.hasActiveFilters();
    expect(hasActiveFilters).to.be.true;
  }
);

Then("all filters should be cleared", async () => {
  const hasActiveFilters = await vehiclesPage.hasActiveFilters();
  expect(hasActiveFilters).to.be.false;
});

Then(
  "the vehicles table should display all vehicles without any filters applied",
  async () => {
    const allVehiclesDisplayed =
      await vehiclesPage.verifyAllVehiclesDisplayed();
    expect(allVehiclesDisplayed).to.be.true;
  }
);

Then("the filter indicator should show no active filters", async () => {
  const hasActiveFilters = await vehiclesPage.hasActiveFilters();
  expect(hasActiveFilters).to.be.false;
});

Then(
  /^the "([^"]*)" filter should be reset to no selection$/,
  async (filterName: string) => {
    const isReset = await vehiclesPage.isFilterReset(filterName);
    expect(isReset).to.be.true;
  }
);


When("the user opens the sort dropdown on the vehicles table", async () => {
  await vehiclesPage.openSortDropdown();
});

When("the user opens the vehicle sort dropdown again", async () => {
  await vehiclesPage.openSortDropdown();
});

Then(
  "the vehicle sort dropdown should contain the following options:",
  async (dataTable: any) => {
    const expectedOptions = dataTable.rawTable.map((row: string[]) =>
      row[0].trim()
    );
    const actualOptions = await vehiclesPage.getSortOptions();

    for (const expectedOption of expectedOptions) {
      expect(actualOptions).to.include(expectedOption);
    }
  }
);

When(
  /^the user selects "([^"]*)" from the vehicle sort dropdown$/,
  async function (sortOption: string) {
    const apiAssert = new ApiAssertUtils(this.page);

    let sortKey: "Vehicle Plate No." | "Assigned To" | "Policy Expiry" | "id" =
      "id";

    let sortParam = "id";

    if (sortOption === "Vehicle Plate No. (Z-A)") {
      sortKey = "Vehicle Plate No.";
      sortParam = "-PlateNo";
    } else if (sortOption === "Vehicle Plate No. (A-Z)") {
      sortKey = "Vehicle Plate No.";
      sortParam = "PlateNo";
    } else if (sortOption === "Assigned To (A-Z)") {
      sortKey = "Assigned To";
      sortParam = "AssignedDriver.FirstName";
    } else if (sortOption === "Assigned To (Z-A)") {
      sortKey = "Assigned To";
      sortParam = "-AssignedDriver.FirstName";
    } else if (sortOption === "Policy Expiry (Soon)") {
      sortKey = "Policy Expiry";
      sortParam = "policyExpiryDate";
    } else if (sortOption === "Policy Expiry (Latest)") {
      sortKey = "Policy Expiry";
      sortParam = "-policyExpiryDate";
    }
    this.apiResponse = await apiAssert.waitForVehiclesApi(
      async () => {
        await vehiclesPage.selectSortOption(sortOption);
      },
      `sorts=${sortParam}`
    );
  }
);

Then(
  /^the vehicles table should be sorted by "([^"]*)"$/,
  async (sortOption: string) => {
    const isSorted = await vehiclesPage.verifySortApplied(sortOption);
    expect(isSorted).to.be.true;
  }
);

Then(
  "the vehicles table should display results sorted according to the applied sort",
  async function () {
    const apiAssert = new ApiAssertUtils(this.page);


    const sortIndicator = await vehiclesPage.getSortIndicator();
    let sortKey: "Vehicle Plate No." | "Assigned To" | "Policy Expiry" | "id" =
      "id";

    let sortParam = "id";

    if (sortIndicator?.includes("Vehicle Plate No. (Z-A)")) {
      sortKey = "Vehicle Plate No.";
    } else if (sortIndicator?.includes("Vehicle Plate No. (A-Z)")) {
      sortKey = "Vehicle Plate No.";
    } else if (sortIndicator?.includes("Assigned To (A-Z)")) {
      sortKey = "Assigned To";
    } else if (sortIndicator?.includes("Assigned To (Z-A)")) {
      sortKey = "Assigned To";
    } else if (sortIndicator?.includes("Policy Expiry (Soon)")) {
      sortKey = "Policy Expiry";
    } else if (sortIndicator?.includes("Policy Expiry (Latest)")) {
      sortKey = "Policy Expiry";
    }


    const apiResults = this.apiResponse?.results || [];

    const uiRows = await vehiclesPage.getVisibleRows();


    await apiAssert.assertVehicleMatchApi(uiRows, apiResults, sortKey);
  }
);

Then(
  /^the vehicle sort indicator should show "Sort: ([^"]*)"$/,
  async (sortOption: string) => {
    const indicator = await vehiclesPage.getSortIndicator();
    expect(indicator).to.include(sortOption);
  }
);

When("the user changes the sort to {string}", async (sortOption: string) => {
  await vehiclesPage.selectSortOption(sortOption);
});

Then("the vehicle filter should show active filters in the filter indicator",async function (){
  const activeFilters=await vehiclesPage.hasActiveFilters();
  expect(activeFilters).to.be.true;

});
Then('the user {string} all the applied vehicle filters',async function(clear:string){
  await vehiclesPage.clickClearAllFilters();
});

Then("all vehicle filters should be cleared",async function(){
 const activeFilters= await vehiclesPage.hasActiveFilters();
  expect(activeFilters).to.be.false;
});
