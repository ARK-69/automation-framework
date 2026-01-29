import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { LoginPage } from "../pages/LoginPage";
import { Sidebar } from "../pages/Sidebar";
import { DriversPage } from "../pages/DriversPage";
import { createDropdownUtils } from "../utils/dropdownUtils";
import { ApiAssertUtils } from "../utils/apiAssertUtils";
import type { Response } from "@playwright/test";

function generateUniqueId(prefix: string = ""): string {
  return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
}

const driverTestData = {
  name: `AutomationTest_${Date.now()}`,
  phone: "03001234567",
  email: `testdriver${Date.now()}@automation.test`,
  nationality: "Pakistan",
  documentType: "Iqama",
  documentNumber: generateUniqueId("DOC"),
  licenseNumber: generateUniqueId("LIC"),
  licenseClass: "Class 2 - Private Vehicles",
  licenseIssueDate: "2025-11-11",
  licenseExpiryDate: "2025-11-30",
  profileImage: "./test-data/images (3).jpg",
  idDocument: "./test-data/Check  Last_Nutrition_Program.pdf",
  additionalDocuments: [
    "./test-data/images (3).jpg",
    "./test-data/Check  Last_Nutrition_Program.pdf",
  ],
};

let driversPage: DriversPage;

Given(
  "the user has logged in and has navigated to the Drivers page",
  async function () {
    const loginPage = new LoginPage(this.page);
    await loginPage.goto();
    await loginPage.login(
      process.env.TEST_USER_EMAIL || "your_username",
      process.env.TEST_USER_PASSWORD || "your_password"
    );
    const sidebar = new Sidebar(this.page);
    
    await sidebar.navigateToDrivers();
    driversPage = new DriversPage(this.page);
    const title = await driversPage.getTitle();
    expect(title).to.include("Drivers");

    this.driverData = driverTestData;
  }
);

When("the user adds a new driver with valid details", async function () {
  await driversPage.clickAddDriver();
  await driversPage.fillDriverForm(driverTestData);
  this.driverData = driverTestData;
  await driversPage.submitDriverForm();
});

Then(
  'a "Driver added successfully!" notification should be displayed',
  async function () {
    const notif = await driversPage.getNotification();
    expect(notif).to.include("Driver added successfully!");
  }
);

Then(
  "the user searches for the new driver's name in the drivers table",
  async function () {
    await driversPage.searchDriver(this.driverData.name);
  }
);

Then(
  "the new driver should be listed in the search results",
  async function () {
    const found = await driversPage.isDriverInTable(this.driverData.name);
    expect(found).to.be.true;
  }
);

When('the user searches for "xyz" in the drivers table', async function () {
  await driversPage.searchDriver("xyz");
});

Then('a "No drivers found" message should be displayed', async function () {
  const msg = await driversPage.getNoDriversMessage();
  expect(msg).to.include("No drivers found");
});

When("the user clicks the view icon for the new driver", async function () {
  await driversPage.clickViewDriver(this.driverData.name);
});

Then("the driver details modal should be displayed", async function () {
  const visible = await driversPage.isDriverModalVisible();
  expect(visible).to.be.true;
});

Then("the modal should show the correct driver details", async function () {
  await driversPage.verifyDriverDetailsPresent({
    name: this.driverData.name,
    email: this.driverData.email,
  });
});

When("the user clicks the edit icon for the new driver", async function () {
  await driversPage.clickEditDriver(this.driverData.name);
});

When(
  "the user edits the driver's details and saves the changes",
  async function () {
    const newEmail = `updated${Date.now()}@automation.test`;
    await driversPage.updateDriverEmail(newEmail);
    await driversPage.saveEdit();
    this.driverData.email = newEmail;
  }
);

Then(
  'a "Driver updated successfully" notification should be displayed',
  async function () {
    const notif = await driversPage.getNotification();
    expect(notif).to.include("Driver updated successfully!");
  }
);

When("the user clicks the delete icon for the new driver", async function () {
  await driversPage.clickDeleteDriver(this.driverData.name);
});

When("the user confirms the deletion", async function () {
  await driversPage.confirmDelete();
});

Then(
  'a "Driver deleted successfully" notification should be displayed',
  async function () {
    const notif = await driversPage.getNotification();
    expect(notif).to.match(
      new RegExp(`${driverTestData.name}.*deleted successfully`, "i")
    );
  }
);

Then(
  "the driver should no longer appear in the drivers table",
  async function () {
    await driversPage.searchDriver(this.driverData.name);
    const found = await driversPage.isDriverInTable(this.driverData.name);
    expect(found).to.be.false;
  }
);

When("the user opens the Add New Driver form", async function () {
  await driversPage.clickAddDriver();
  await driversPage.enterPhone();
});
Then("the user submits the form without filling any fields", async function () {
  await driversPage.submitDriverForm();
  await this.page.waitForTimeout(1000);
});

Then(
  "validation error messages should be displayed for all required fields",
  async function () {
    const errors = await driversPage.getRequiredFieldErrors();

    expect(errors).to.be.true;
  }
);

When("the user opens the filter dialog on the Drivers table", async () => {
  await driversPage.openFilterDialog();
});

When(
  /^the user selects driver filter "Vehicle Assigned" with value "([^"]*)"$/,
  async (value) => {
    await driversPage.selectVehicleAssignedFilter(value as "Yes" | "No");
  }
);

When(
  /^the user selects driver filter "Primary Driver" with value "([^"]*)"$/,
  async (value) => {
    await driversPage.selectPrimaryDriverFilter(value as "Yes" | "No");
  }
);

When(
  /^the user selects driver filter "Behaviour Score" with value "([^"]*)"$/,
  async (range) => {
    await driversPage.selectBehaviourScoreFilter(range);
  }
);

When(
  "the user click Apply button in the driver filter dialog",
  async function () {
    const apiUtils = new ApiAssertUtils(this.page);

    // Capture the API response triggered by Apply
    const apiResponse = await apiUtils.waitForDriversApi(
      async () => {
        await driversPage.clickApplyFilter();
      },
      "filters=" // ensures we catch the filter API, not sort
    );

    this.apiResponse = apiResponse;
  }
);

Then(
  "the Drivers table should display filtered results based on the applied filters",
  async function () {
    const apiData = this.apiResponse;
    const results = apiData?.results ?? [];

    if (results.length === 0) {
      const noDriversVisible = await this.page
        .locator("text=/No drivers found/i")
        .isVisible();
      expect(
        noDriversVisible,
        "Expected empty state since API returned 0 results"
      ).to.be.true;
      return;
    }
    const apiAssert = new ApiAssertUtils(this.page);
    const uiRows = await driversPage.getVisibleRows();

    const normalizedUiRows = uiRows.map((row) => ({
      name: row.driverName, // map field names
      behaviorScore: row.behaviorScore ?? 0, // handle null safely
      isPrimaryDriver: row.isPrimaryDriver,
    }));

    await apiAssert.assertDriversTableMatchesApiResults(
      normalizedUiRows,
      results,
      "firstName"
    );
  }
);

// SORT STEPS
When("the user opens the sort dropdown on the Drivers table", async () => {
  await driversPage.openSortDropdown();
});

Then(
  "the sort dropdown menu should contain the following options:",
  async (dataTable) => {
    const actualOptions = await driversPage.getSortOptions();
    const expectedOptions = dataTable.rawTable.map((row: string[]) =>
      row[0].trim()
    );
    expectedOptions.forEach((opt: string) =>
      expect(actualOptions).to.include(opt)
    );
  }
);

When(
  /^the user selects "([^"]*)" from the sort dropdown menu$/,
  async (sortOption) => {
    await driversPage.selectSortOption(sortOption);
  }
);

Then(/^the Drivers table should be sorted by "([^"]*)"$/, async (criteria) => {
  const applied = await driversPage.verifySortApplied(criteria);
  expect(applied).to.be.true;
});

Then('the sort indicator should show "Sort: {string}"', async (criteria) => {
  const indicator = await driversPage.getSortIndicator();
  expect(indicator).to.include(`Sort: ${criteria}`);
});

// COMBINED FILTER + SORT
Then(
  "the filtered Drivers table should be sorted by {string}",
  async (sortOption) => {
    const sorted = await driversPage.verifyDriversSorted(
      sortOption,
      /* appropriate column index */ 1
    );
    expect(sorted).to.be.true;
  }
);

Then(
  "all displayed Drivers should have Vehicle Assigned {string}",
  async (value) => {
    const matches = await driversPage.verifyFilteredResults({
      vehicleAssigned: value,
    });
    expect(matches).to.be.true;
  }
);

Then(
  "all displayed Drivers should have Primary Driver {string}",
  async (value) => {
    const matches = await driversPage.verifyFilteredResults({
      primaryDriver: value,
    });
    expect(matches).to.be.true;
  }
);

Then(
  "all displayed Drivers should have Behaviour Score {string}",
  async (range) => {
    const matches = await driversPage.verifyFilteredResults({
      behaviourScore: range,
    });
    expect(matches).to.be.true;
  }
);

When("the user change the sort to {string}", async (sortOption) => {
  await driversPage.selectSortOption(sortOption);
});

Then(
  "the filtered Drivers should be re-sorted by {string}",
  async (sortOption) => {
    const sorted = await driversPage.verifyDriversSorted(
      sortOption,
      /* appropriate column index */ 2
    );
    expect(sorted).to.be.true;
  }
);

Then("the filter should show applied filter count", async () => {
  const active = await driversPage.hasActiveFilters();
  expect(active).to.be.true;
});

Then(
  "all displayed Drivers should still match the applied filters",
  async () => {
    const matches = await driversPage.verifyFilteredResults({
      vehicleAssigned: "Yes",
      primaryDriver: "Yes",
      behaviourScore: "80-100",
    });
    expect(matches).to.be.true;
  }
);

// RESET FILTERS
When('the user click "Clear All" button in the filter dialog', async () => {
  await driversPage.clickClearAllFilters();
});

Then("all filters should be cleared", async () => {
  const active = await driversPage.hasActiveFilters();
  expect(active).to.be.false;
});

Then(
  "the Drivers table should display all Drivers without any filters applied",
  async () => {
    const allDisplayed = await driversPage.verifyFilteredResults({});
    expect(allDisplayed).to.be.true;
  }
);

Then("the filter indicator should show no active filter", async () => {
  const active = await driversPage.hasActiveFilters();
  expect(active).to.be.false;
});

Then(
  /^the "([^"]*)" filter should be reset to no selection$/,
  async (filterName) => {
    const isReset = await driversPage.isFilterReset(filterName);
    expect(isReset).to.be.true;
  }
);
Then("the driver filter should show active filters in the filter indicator",async function (){
  const activeFilters=await driversPage.hasActiveFilters();
  expect(activeFilters).to.be.true;

});
Then('the user {string} all the applied driver filters',async function(clear:string){
  await driversPage.clickClearAllFilters();
});

Then("all driver filters should be cleared",async function(){
 const activeFilters= await driversPage.hasActiveFilters();
  expect(activeFilters).to.be.false;
});
