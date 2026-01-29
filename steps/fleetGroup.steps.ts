import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { LoginPage } from "../pages/LoginPage";
import { Sidebar } from "../pages/Sidebar";
import { FleetGroupsPage } from "../pages/FleetGroupsPage";
import { ApiAssertUtils } from "../utils/apiAssertUtils";

function generateUniqueGroupName() {
  return `TGA ${Math.floor(Math.random() * 1000)}`;
}

const fleetGroupData = {
  groupName: generateUniqueGroupName(),
  manager: "Test Name 01",
  vehicles: "CSV-5089",
  newManager: "Test Customer",
};

const emptyFleetGroupData = {
  groupName: "",
  manager: "",
  vehicles: "",
  newManager: "",
};

let groupsPage: FleetGroupsPage;

Given("the user is logged in and on the Fleet Groups page", async function () {
  const loginPage = new LoginPage(this.page);
  await loginPage.goto();
  await loginPage.login(
    process.env.TEST_USER_EMAIL || "your_username",
    process.env.TEST_USER_PASSWORD || "your_password"
  );
  const sidebar = new Sidebar(this.page);
   
  await sidebar.navigateToFleetGroups();
  groupsPage = new FleetGroupsPage(this.page);
  const title = await groupsPage.getTitle();
  expect(title).to.include("Fleet Groups");
  this.fleetGroupData = { ...fleetGroupData };
});

When("the user adds a new fleet group", async function () {
  await groupsPage.clickAddGroup();
  await groupsPage.fillGroupForm(this.fleetGroupData);
  await groupsPage.submitGroupForm();
});

Then(
  'a "Group created successfully" notification should be displayed',
  async function () {
    const notif = await groupsPage.getNotification();
    expect(notif).to.include("Group created successfully");
  }
);

Then(
  "the user searches for the new group name in the groups table",
  async function () {
    await groupsPage.searchGroup(this.fleetGroupData.groupName);
  }
);

Then(
  "the new fleet group should be listed in the search results",
  async function () {
    const found = await groupsPage.isGroupInTable(
      this.fleetGroupData.groupName
    );
    expect(found).to.be.true;
  }
);

When('the user searches for "xyz" in the groups table', async function () {
  await groupsPage.searchGroup("xyz");
});

Then('a "No results found" message should be displayed', async function () {
  const msg = await groupsPage.getNoGroupsMessage();
  expect(msg).to.include("No results found");
});

When(
  "the user clicks the view icon for the new fleet group",
  async function () {
    await groupsPage.clickViewGroup(this.fleetGroupData.groupName);
  }
);

Then("the group details modal should be displayed", async function () {
  const visible = await groupsPage.isGroupModalVisible();
  expect(visible).to.be.true;
});

Then("the modal should show the correct group details", async function () {
  await groupsPage.verifyGroupDetailsPresent({
    groupName: this.fleetGroupData.groupName,
    manager: this.fleetGroupData.manager,
  });
});

When("the user clicks the edit icon for the new group", async function () {
  await groupsPage.clickEditGroup(this.fleetGroupData.groupName);
});

When(
  "the user edits the group's manager and saves the changes",
  async function () {
    const randomLetter = String.fromCharCode(
      65 + Math.floor(Math.random() * 26)
    );
    const updatedName = `${this.fleetGroupData.groupName}${randomLetter}`;
    await groupsPage.updateGroupName(updatedName);
    await groupsPage.saveEdit();
    this.fleetGroupData.groupName = updatedName;
  }
);

Then(
  'a "Group updated successfully" notification should be displayed',
  async function () {
    const notif = await groupsPage.getNotification();
    expect(notif).to.include("Group updated successfully");
  }
);

When("the user clicks the delete icon for the new group", async function () {
  await groupsPage.clickDeleteGroup(this.fleetGroupData.groupName);
});

When("the user confirms group deletion", async function () {
  await groupsPage.confirmDelete();
});

Then(
  'a "Group deleted successfully" notification should be displayed',
  async function () {
    const notif = await groupsPage.getNotification();
    expect(notif).to.include("Group deleted successfully");
  }
);

Then(
  "the group should no longer appear in the groups table",
  async function () {
    await groupsPage.searchGroup(this.fleetGroupData.groupName);
    const found = await groupsPage.isGroupInTable(
      this.fleetGroupData.groupName
    );
    expect(found).to.be.false;
  }
);
When("the user click create fleet group", async function () {
  await groupsPage.clickAddGroup();
});
Then("all the required fields are empty", async function () {
  await groupsPage.fillGroupForm(emptyFleetGroupData);
});
Then("the save button should be disabled", async function () {
  const isDisabled = await groupsPage.verifyDisabledSaveButton();
  expect(isDisabled).to.be.true;
});


When(
  "the user opens the filter dialog on the Fleet Groups table",
  async function () {
    await groupsPage.openFilterDialog();
  }
);

When(
  /^the user selects Fleet Group filter "Fleet Manager" with value "([^"]*)"$/,
  async function (value) {
    await groupsPage.selectFleetManagerFilter(value);
  }
);

When(
  /^the user selects Fleet Group filter "Created By" with value "([^"]*)"$/,
  async function (value) {
    await groupsPage.selectCreatedByFilter(value);
  }
);

When(
  /^the user selects Fleet Group filter "No. of Vehicles" with value "([^"]*)"$/,
  async function (value) {
    await groupsPage.selectVehicleCountFilter(value);
  }
);

When("the user clicks Apply to apply filters", async function () {
  const apiUtils = new ApiAssertUtils(this.page);

  const response = await apiUtils.waitForFleetGroupsApi(
    async () => await groupsPage.applyFilter(),
    "filters="
  );

  this.apiResponse = response;
});

Then(
  "the Fleet Groups table should display filtered results based on the applied filters",
  async function () {
    const apiData = this.apiResponse;
    const results = apiData?.results ?? [];

    // EMPTY CASE (same as Drivers)
    if (results.length === 0) {
      const noGroupVisible = await this.page
        .locator("text=/No results|No groups/i")
        .isVisible();

      expect(
        noGroupVisible,
        "Expected empty state since API returned 0 results"
      ).to.be.true;

      return;
    }

    // NORMAL CASE
    const uiRows = await groupsPage.getVisibleRows();

    const normalizedUiRows = uiRows.map((row) => ({
      groupName: row.groupName,
      manager: row.manager,
      vehicles: row.vehicles,
    }));

    const apiAssert = new ApiAssertUtils(this.page);
    await apiAssert.assertFleetGroupsMatchApi(
      normalizedUiRows,
      results,
      "groupName"
    );
  }
);


When(
  "the user opens the sort dropdown on the Fleet Groups table",
  async function () {
    await groupsPage.openSortDropdown();
  }
);

Then(
  "the fleet group sort dropdown should contain the following options:",
  async function (dataTable) {
    const expected = dataTable.raw().map((r: string[]) => r[0].trim());

    let actual = await groupsPage.getSortOptions();

    
    const normalize = (text: string) =>
      text
        .replace(/→/g, "-->") 
        .replace(/\u2192/g, "-->")
        .replace(/→/g, "-->")
        .trim();

    const normalizedActual = actual.map(normalize);
    const normalizedExpected = expected.map(normalize);

    normalizedExpected.forEach((opt: string) => {
      expect(normalizedActual).to.include(opt);
    });
  }
);

When(
  /^the user select "([^"]*)" from the sort dropdown$/,
  async function (option) {
    await groupsPage.selectSortOption(option);
  }
);

Then(
  /^the Fleet Groups table should be sorted by "([^"]*)"$/,
  async function (criteria) {
    expect(await groupsPage.verifySortApplied(criteria)).to.be.true;
  }
);

Then(
  'the sort indicator should show "Sort: {string}"',
  async function (criteria) {
    const indicator = await groupsPage.getSortIndicator();
    expect(indicator).to.include(`Sort: ${criteria}`);
  }
);


Then(
  "the filtered Fleet Groups table should be sorted by {string}",
  async function (criteria) {
    expect(await groupsPage.verifyFleetGroupsSorted(criteria, 1)).to.be.true;
  }
);

Then(
  "all displayed Fleet Groups should have Fleet Manager {string}",
  async function (manager) {
    expect(await groupsPage.verifyFilteredResults({ manager })).to.be.true;
  }
);

Then(
  "all displayed Fleet Groups should have Created By {string}",
  async function (createdBy) {
    expect(await groupsPage.verifyFilteredResults({ createdBy })).to.be.true;
  }
);

Then(
  "all displayed Fleet Groups should have No. of Vehicles {string}",
  async function (vehicles) {
    expect(await groupsPage.verifyFilteredResults({ vehicles })).to.be.true;
  }
);

Then(
  "the filtered Fleet Groups should be re-sorted by {string}",
  async function (criteria) {
    expect(await groupsPage.verifyFleetGroupsSorted(criteria, 1)).to.be.true;
  }
);

Then(
  "all displayed Fleet Groups should still match the applied filters",
  async function () {
    expect(
      await groupsPage.verifyFilteredResults({
        manager: "Test User 01",
        createdBy: "John Doe Testing",
        vehicles: "1-10",
      })
    ).to.be.true;
  }
);


Then("the Fleet Groups filter should show active filters in the filter indicator",async function (){
  const activeFilters=await groupsPage.hasActiveFilters();
  expect(activeFilters).to.be.true;

});
Then('the user {string} all the applied Fleet Groups filters',async function(clear:string){
  await groupsPage.clearAllFilters();
});

Then("all Fleet Groups filters should be cleared",async function(){
 const activeFilters= await groupsPage.hasActiveFilters();
  expect(activeFilters).to.be.false;
});

Then(
  "the Fleet Groups table should display all Fleet Groups without any filters applied",
  async () => {
    const allDisplayed = await groupsPage.verifyFilteredResults({});
    expect(allDisplayed).to.be.true;
  }
);