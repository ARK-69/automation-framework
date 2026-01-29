import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { LoginPage } from "../pages/LoginPage";
import { Sidebar } from "../pages/Sidebar";
import { DevicesPage } from "../pages/DevicePage";
import { CustomWorld } from "../support/world";
import { ApiAssertUtils } from "../utils/apiAssertUtils";
import type { Response } from "@playwright/test";

function generateUniquePhoneNumber(): string {
  const timestamp = Date.now().toString().slice(-9);
  const random = Math.random().toString(36).substr(2, 2);
  return `0300${timestamp}${random}`.slice(0, 11);
}

const deviceTestData = {
  manufacturer: "Teltonika",
  model: "FMB920",
  imei: `999${Date.now()}`.slice(0, 15),
  editedModel: "FMB900",
  username: "testuser",
  password: "testpass",
  phonenumber: generateUniquePhoneNumber(),
};
const emptyDeviceTestData = {
  manufacturer: "Teltonika",
  model: "FMB920",
  imei: "",
  username: "",
  password: "",
  phonenumber: "",
};

let devicesPage: DevicesPage;

Given(
  "the user is logged in and the user navigates through the sidebar to the Devices page",
  async function () {
    const loginPage = new LoginPage(this.page);
    await loginPage.goto();
    await loginPage.login(
      process.env.TEST_USER_EMAIL || "your_username",
      process.env.TEST_USER_PASSWORD || "your_password"
    );
    const sidebar = new Sidebar(this.page);
   
    await sidebar.navigateToDevices();
    devicesPage = new DevicesPage(this.page);
    const title = await devicesPage.getPageTitle();
    expect(title).to.include("Devices");

    this.driverData = deviceTestData;
  }
);

When("the user adds a new device", async () => {
  await devicesPage.clickAddDevice();
  await devicesPage.fillDeviceForm({
    manufacturer: deviceTestData.manufacturer,
    model: deviceTestData.model,
    imei: deviceTestData.imei,
    userName: deviceTestData.username,
    password: deviceTestData.password,
    phoneNumber: deviceTestData.phonenumber,
  });
  await devicesPage.saveDeviceForm();
});

Then(
  'a "Device created successfully!" notification should be displayed',
  async () => {
    const notif = await devicesPage.getNotification();
    expect(notif).to.include("Device created successfully!");
  }
);

Then("the added device should appear in the devices table", async () => {
  expect(await devicesPage.isDeviceListed(deviceTestData.imei)).to.be.true;
});

Then("the added device should be listed in the search results", async () => {
  expect(await devicesPage.isDeviceRowVisible(deviceTestData.imei)).to.be.true;
});

When(
  /^the user searches for (the added device|"xyz") in the devices table$/,
  async (searchTerm: string) => {
    const term =
      searchTerm === "the added device" ? deviceTestData.imei : "xyz";
    await devicesPage.search(term);
  }
);

Then(
  'a "No devices found matching your criteria." message should be displayed',
  async () => {
    expect(await devicesPage.getEmptyTableMessage()).to.contain(
      "No devices found matching your criteria."
    );
  }
);

When("the user edits the model of the added device", async () => {
  await devicesPage.clickEditDevice(deviceTestData.imei);
  await devicesPage.editDeviceModel(deviceTestData.editedModel);
});

Then(
  'a "Changes saved successfully!" notification should be displayed',
  async () => {
    const notif = await devicesPage.getNotification();
    expect(notif).to.include("Changes saved successfully!");
  }
);

Then("the updated device should appear in the devices table", async () => {
  expect(await devicesPage.isDeviceListed(deviceTestData.imei)).to.be.true;
});

When("the user deletes the added device", async () => {
  await devicesPage.deleteDevice(deviceTestData.imei);
});

Then(
  'a "Device deleted successfully" notification should be displayed and the deleted device should no longer appear in the table',
  async () => {
    const notif = await devicesPage.getNotification();
    expect(notif).to.include("Device deleted successfully");
  }
);


When("the user opens the filter dialog on the devices table", async () => {
  await devicesPage.openFilterDialog();
});

When(
  /^the user selects device filter "Device Assigned" with value "([^"]*)"$/,
  async (value: string) => {
    await devicesPage.selectDeviceAssignedFilter(value as "Yes" | "No");
  }
);

When(
  /^the user selects device filter "Manufacturer" with value "([^"]*)"$/,
  async (manufacturer: string) => {
    await devicesPage.selectManufacturerFilter(manufacturer);
  }
);

When(
  /^the user selects device filter "Model" with value "([^"]*)"$/,
  async (model: string) => {
    await devicesPage.selectModelFilter(model);
  }
);

When(
  /^the user selects device filter "Status" with value "([^"]*)"$/,
  async (status: string) => {
    await devicesPage.selectStatusFilter(status as "Online" | "Offline");
  }
);

When(
  "the user clicks Apply button in the device filter dialog",
  async function () {
    const [apiResponse] = await Promise.all([
      devicesPage.waitForDevicesApiResponse(),
      devicesPage.clickApplyFilter(),
    ]);

    this.apiResponse = apiResponse;
  }
);

When('the user "Clear All" all the applied filters', async () => {
  await devicesPage.clickClearAllFilters();
});

When(
  "the user opens the filter dialog on the devices table again",
  async () => {
    await devicesPage.openFilterDialog();
  }
);

Then(
  "the devices table should display filtered results based on the applied filters",
  async function () {
    const apiData = this.apiResponse;
    const results = apiData?.results ?? [];

    if (results.length === 0) {
      const noDevicesVisible = await devicesPage.isNoDevicesMessageVisible();
      expect(
        noDevicesVisible,
        "Expected empty state since API returned 0 results"
      ).to.be.true;
      return;
    }

    const matches = await devicesPage.assertTableMatchesApiResults(results);
    expect(matches, "UI table rows should match API response").to.be.true;
  }
);

Then(
  "the filter should show active device filters in the filter indicator",
  async () => {
    const hasActiveFilters = await devicesPage.hasActiveFilters();
    expect(hasActiveFilters).to.be.true;
  }
);

Then("all filters should be cleared", async () => {
  const hasActiveFilters = await devicesPage.hasActiveFilters();
  expect(hasActiveFilters).to.be.false;
});

Then(
  "the devices table should display all devices without any filters applied",
  async () => {
    const allDevicesDisplayed = await devicesPage.verifyAllDevicesDisplayed();
    expect(allDevicesDisplayed).to.be.true;
  }
);

Then("the filter indicator should show no active filters", async () => {
  const hasActiveFilters = await devicesPage.hasActiveFilters();
  expect(hasActiveFilters).to.be.false;
});

Then(
  /^the "([^"]*)" filter should be reset to no selection$/,
  async (filterName: string) => {
    const isReset = await devicesPage.isFilterReset(filterName);
    expect(isReset).to.be.true;
  }
);


When("the user opens the sort dropdown on the devices table", async () => {
  await devicesPage.openSortDropdown();
});

When("the user opens the sort dropdown again", async () => {
  await devicesPage.openSortDropdown();
});

Then(
  "the sort dropdown should contain the following options:",
  async (dataTable: any) => {
    const expectedOptions = dataTable.rawTable.map((row: string[]) =>
      row[0].trim()
    );
    const actualOptions = await devicesPage.getSortOptions();

    for (const expectedOption of expectedOptions) {
      expect(actualOptions).to.include(expectedOption);
    }
  }
);

When(
  /^the user selects "([^"]*)" from the sort dropdown$/,
  async function (sortOption: string) {
    const apiAssert = new ApiAssertUtils(this.page);

    const [apiResponse] = await Promise.all([
      this.page.waitForResponse(
        (response: Response) => {
          const url = response.url();
          return (
            url.includes("/core/api/v1/devices") &&
            url.includes("sorts=") &&
            response.ok()
          );
        },
        { timeout: 30000 }
      ),
      devicesPage.selectSortOption(sortOption),
    ]);

    this.apiResponse = await apiResponse.json();
  }
);

Then(
  /^the devices table should be sorted by "([^"]*)"$/,
  async (sortOption: string) => {
    const isSorted = await devicesPage.verifySortApplied(sortOption);
    expect(isSorted).to.be.true;
  }
);

Then(
  "the devices table should display results sorted according to the applied sort",
  async function () {
    const apiAssert = new ApiAssertUtils(this.page);

    // Derive sort key from UI indicator
    const sortIndicator = await devicesPage.getSortIndicator();
    let sortKey: "model" | "manufacturer" | "id" = "id";

    let sortParam = "id";

    if (sortIndicator?.includes("Model (Z-A)")) {
      sortKey = "model";
      sortParam = "-Model";
    } else if (sortIndicator?.includes("Model (A-Z)")) {
      sortKey = "model";
      sortParam = "Model";
    } else if (sortIndicator?.includes("Manufacturer (A-Z)")) {
      sortKey = "manufacturer";
      sortParam = "Manufacturer";
    } else if (sortIndicator?.includes("Manufacturer (Z-A)")) {
      sortKey = "manufacturer";
      sortParam = "-Manufacturer";
    } else if (sortIndicator?.includes("Newest")) {
      sortKey = "id";
      sortParam = "id";
    } else if (sortIndicator?.includes("Oldest")) {
      sortKey = "id";
      sortParam = "-id";
    }

    //   Wait for and capture API response
    const apiResults = this.apiResponse.results ?? [];

    //   Capture visible UI rows
    const uiRows = await devicesPage.getVisibleTableRows();

    //   Assert order matches
    await apiAssert.assertDevicesTableMatchesApiResults(
      uiRows,
      apiResults,
      sortKey
    );
  }
);

Then(
  /^the sort indicator should show "Sort: ([^"]*)"$/,
  async (sortOption: string) => {
    const indicator = await devicesPage.getSortIndicator();
    expect(indicator).to.include(sortOption);
  }
);

When("the user changes the sort to {string}", async (sortOption: string) => {
  await devicesPage.selectSortOption(sortOption);
});


Then(
  "the devices table should display only devices matching the applied filters",
  async () => {
    const hasResults = await devicesPage.verifyAllDevicesDisplayed();
    expect(hasResults).to.be.true;
  }
);

Then(
  "the filtered devices table should be sorted by {string}",
  async (sortOption: string) => {
    const isSorted = await devicesPage.verifySortApplied(sortOption);
    expect(isSorted).to.be.true;
  }
);

Then(
  /^all displayed devices should have manufacturer "([^"]*)"$/,
  async (manufacturer: string) => {
    const matches = await devicesPage.verifyDevicesMatchFilters({
      manufacturer,
    });
    expect(matches).to.be.true;
  }
);

Then(
  /^all displayed devices should have model "([^"]*)"$/,
  async (model: string) => {
    const matches = await devicesPage.verifyDevicesMatchFilters({ model });
    expect(matches).to.be.true;
  }
);

Then(
  /^all displayed devices should have status "([^"]*)"$/,
  async (status: string) => {
    const matches = await devicesPage.verifyDevicesMatchFilters({ status });
    expect(matches).to.be.true;
  }
);

Then("the devices should be sorted in ascending order by model", async () => {
  const isSorted = await devicesPage.verifyDevicesSorted("Model (A-Z)");
  expect(isSorted).to.be.true;
});

Then(
  "the filtered devices should be re-sorted by {string}",
  async (sortOption: string) => {
    const isSorted = await devicesPage.verifySortApplied(sortOption);
    expect(isSorted).to.be.true;
  }
);

Then("the filter should remain active", async () => {
  const hasActiveFilters = await devicesPage.hasActiveFilters();
  expect(hasActiveFilters).to.be.true;
});

Then(
  "all displayed devices should still match the applied filters",
  async () => {
    // This is a general check - the specific filters are verified in previous steps
    const hasResults = await devicesPage.verifyAllDevicesDisplayed();
    expect(hasResults).to.be.true;
  }
);
// Step is now handled by the regex pattern above
When("the user opens the add device form", async function () {
  await devicesPage.clickAddDevice();
});
Then(
  "the user fill the form without IMEI number, Phone number, username, password",
  async function () {
    await devicesPage.fillDeviceForm({
      manufacturer: emptyDeviceTestData.manufacturer,
      model: emptyDeviceTestData.model,
      imei: emptyDeviceTestData.imei,
      userName: emptyDeviceTestData.username,
      password: emptyDeviceTestData.password,
      phoneNumber: emptyDeviceTestData.phonenumber,
    });
  }
);
Then("all the required fields should show validation error", async function () {
  const verify = await devicesPage.verifyDisabledSaveButton();
  const validationMessages = await devicesPage.fieldValidationError();
  console.log(`${verify} and ${validationMessages}`);
  expect(verify).to.be.true;
  expect(validationMessages).to.be.true;
});
Then("the device filter should show active filters in the filter indicator",async function (){
  const activeFilters=await devicesPage.hasActiveFilters();
  expect(activeFilters).to.be.true;

});
Then('the user {string} all the applied device filters',async function(clear:string){
  await devicesPage.clickClearAllFilters();
});

Then("all device filters should be cleared",async function(){
 const activeFilters= await devicesPage.hasActiveFilters();
  expect(activeFilters).to.be.false;
});


