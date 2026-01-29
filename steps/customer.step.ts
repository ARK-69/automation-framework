import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { LoginPage } from "../pages/LoginPage";
import { Sidebar } from "../pages/Sidebar";
import { AdminCustomerPage } from "../pages/adminCustomerPage";
import { createDropdownUtils } from "../utils/dropdownUtils";
import { ApiAssertUtils } from "../utils/apiAssertUtils";
import dotenv from "dotenv"
import { createDatePickerUtils } from "../utils/datePickerUtils";


function generateUniqueId(prefix: string = "", maxLength: number = 15): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 5);
  const combined = `${prefix}${timestamp}${random}`;
  return combined.slice(0, maxLength);
}

const customerData = {
  customerName: `Customer${Date.now().toString().slice(-6)}${generateUniqueId("",4)}`,
  adminEmail: `admin${Date.now().toString().slice(-5)}@example.com`,
  adminName: `Admin${Date.now().toString().slice(-4)}`,
  adminPhoneNumber: `050${Math.floor(1000000 + Math.random() * 9000000)}`,
  country: "Saudi Arabia",
  industry: "Transportation",
  businessType: "Startup",
  address: "King Abdullah Road, Riyadh",
  licenseType: "SaaS Cloud-based",
  maxUsers: Math.floor(Math.random() * 200) + 50, // 50–250
  maxVehicle: Math.floor(Math.random() * 500) + 100, // 100–600
  featureAccess: [
    "Dashboard",
  
  ],
  setDefault: false,
  customerLogoPath: "./test-data/images (3).jpg",
  faviconPath: "./test-data/images (3).jpg",
  primaryColor: "#1A73E8",
  secondaryColor: "#34A853",
  subdomain:`Customer${Date.now().toString().slice(-6)}`
};


let customerPage:AdminCustomerPage

Given(
  "the admin user is logged in",
  async function () {
    const loginPage = new LoginPage(this.page);
    await loginPage.goto(process.env.ADMIN_BASE_URL||"https://fms-admin.autilent.com");
    await loginPage.login(
      process.env.ADMIN_TEST_USER_EMAIL || "your_username",
      process.env.ADMIN_TEST_USER_PASSWORD || "your_password"
    );
   customerPage=new AdminCustomerPage(this.page);
   const title=await customerPage.getpageTitle();
    expect(title).to.include("Customers")
    this.customerData=customerData
  }
);

When("the user add a new customer with valid details",async function(){
    await customerPage.clickAddCustomer();
    await customerPage.fillCustomerForm(this.customerData);
    await customerPage.submitCustomerForm();
});
Then("a customer created sucessfully should appear",async function (){
    const notif = await customerPage.getNotification();
        expect(notif).to.include("Customer created successfully!");

});

Then("the customer searches for the new customer's name in the customer table",async function (){
  
    await customerPage.searchCustomer(this.customerData.customerName);
  
});
Then(
  "the new customer should be listed in the search results",
  async function () {
    const found = await customerPage.isinCustomerTable(this.customerData.customerName);
    expect(found).to.be.true;
  }
);

When("the user searches for {string} in the customers table",async function (customerName:string){
    await customerPage.searchCustomer(customerName);
});

Then('a "No customers found" message should be displayed', async function () {
  const msg = await customerPage.getNoCustomerMessage();
  expect(msg).to.include("No customers found");
});
When("the user clicks the view icon for the new customer", async function () {
  await customerPage.clickViewCustomer(this.customerData.customerName);
});
When("the customer details modal should be displayed",async function(){
    const visible = await customerPage.isCustomerModalVisible();
      expect(visible).to.be.true;
});
Then("the modal should show the correct customer details", async function () {
  await customerPage.verifyCustomerDetailsPresent({
    customerName: this.customerData.customerName,
    adminEmail: this.customerData.adminEmail,
  });
});

When("the user clicks the edit icon for the new customer", async function () {
  await customerPage.clickEditCustomer(this.customerData.customerName);
});

When("the user edits the customer's details and saves the changes",async function(){
    const newAdminEmail = `admin${Date.now().toString().slice(-5)}1@example.com`;
    await customerPage.updateCustomerAdminEmail(newAdminEmail);
    await customerPage.saveEdit();
    this.customerData.adminEmail = newAdminEmail;
});
Then(
  'a "Customer updated successfully!" notification should be displayed',
  async function () {
    const notif = await customerPage.getNotification();
    expect(notif).to.include("Customer updated successfully!");
  }
);
When("the user clicks the delete icon for the new customer", async function () {
  await customerPage.clickDeleteCustomer(this.customerData.customerName);
});
Then("the user confirms the deletion of the added customer",async function (){
     await customerPage.confirmDelete();
});
Then(
  'a "Customer deleted successfully" notification should be displayed',
  async function () {
    const notif = await customerPage.getNotification();
    const expectedMessage = "Customer deleted successfully";
    expect(notif).to.include(expectedMessage);
  }
);

Then(
  "the customer should no longer appear in the customers table",
  async function () {
    await customerPage.searchCustomer(this.customerData.customerName);
    const found = await customerPage.isinCustomerTable(this.customerData.customerName);
    expect(found).to.be.false;
  }
);

When("the user opens the Add New customer form",async function(){
    await customerPage.clickAddCustomer();
});
Then("the user submits the customer form without filling any fields",async function(){
    
    await customerPage.submitEmptyCustomerForm(this.customerData.licenseType);

});
Then("validation error messages should be displayed for all required fields for customer form",async function (){
    const validation = await customerPage.validRequiredFieldErrors();

    expect(validation).to.be.true;
});



When("the user opens the filter dialog on the Customers table", async () => {
  await customerPage.openFilterDialog();
});

When(
  "the user selects customer filter {string} with value {string}",
  async function (filterLabel: string, value: string) {
    switch (filterLabel.toLowerCase()) {
      case "deployment type":
        await customerPage.selectDeploymentTypeFilter(value as "SaaS" | "On-Premise");
        break;
        break;
      default:
        throw new Error(`Unsupported filter: ${filterLabel}`);
    }
  }
);

Then(
  "the user selects customer {string} from {string} till {string}",
  async function (filterLabel: string, fromDate: string, toDate: string) {
    // await selectExpiryRageFilter("");
      }
);

Then(
  "the user click Apply button in the customer filter dialog",
  async function () {
    const [apiResponse] = await Promise.all([
      customerPage.waitForCustomersApiResponse(),
      customerPage.clickApplyFilter(),
    ]);

    this.apiResponse = apiResponse;
  }
);

When('the user "Clear All" all the applied filters', async () => {
  await customerPage.clickClearAllFilters();
});

When(
  "the user opens the filter dialog on the customer table again",
  async () => {
    await customerPage.openFilterDialog();
  }
);

Then(
  "the Customers table should display filtered results based on the applied filters",
  async function () {
    const apiData = this.apiResponse;
    const results = apiData?.results ?? [];

    if (results.length === 0) {
      const noCustomerVisible = await this.page
        .locator("text=/No results|No customers found/i")
        .isVisible();

      expect(
        noCustomerVisible,
        "Expected empty state since API returned 0 results"
      ).to.be.true;

      return;
    }

    const uiRows = await customerPage.getVisibleRows();

    const normalizedUiRows = uiRows.map((row) => ({
      customerName: row.customerName,
      adminName: row.adminName,
    }));

    const apiAssert = new ApiAssertUtils(this.page);
    await apiAssert.assertCustomerMatchApi(
      normalizedUiRows,
      results,
      "Customer Name"
    );
  }
);

Then(
  "the filter should show active Customer filters in the filter indicator",
  async () => {
    const hasActiveFilters = await customerPage.hasActiveFilters();
    expect(hasActiveFilters).to.be.true;
  }
);

Then("all filters should be cleared", async () => {
  const hasActiveFilters = await customerPage.hasActiveFilters();
  expect(hasActiveFilters).to.be.false;
});

Then(
  "the customer table should display all customer without any filters applied",
  async () => {
    const allcustomerDisplayed =
      await customerPage.verifyAllcustomerDisplayed();
    expect(allcustomerDisplayed).to.be.true;
  }
);

Then("the filter indicator should show no active filters", async () => {
  const hasActiveFilters = await customerPage.hasActiveFilters();
  expect(hasActiveFilters).to.be.false;
});

Then(
  /^the "([^"]*)" filter should be reset to no selection$/,
  async (filterName: string) => {
    const isReset = await customerPage.isFilterReset(filterName);
    expect(isReset).to.be.true;
  }
);


When("the user opens the sort dropdown on the Customers table", async () => {
  await customerPage.openSortDropdown();
});

When("the user opens the Customer sort dropdown again", async () => {
  await customerPage.openSortDropdown();
});

Then(
  "the Customer sort dropdown menu should contain the following options:",
  async (dataTable: any) => {
    const expectedOptions = dataTable.rawTable.map((row: string[]) =>
      row[0].trim()
    );
    
    const actualOptions = await customerPage.getSortOptions();
    console.log("Expected Sort Options:", actualOptions);
    for (const expectedOption of expectedOptions) {
      expect(actualOptions).to.include(expectedOption);
    }
  }
);

When(
  /^the user selects "([^"]*)" from the Customer sort dropdown menu$/,
  async function (sortOption: string) {
    const apiAssert = new ApiAssertUtils(this.page);

    let sortKey: "Customer Name" | "Admin Name" |"id" = "id";

    let sortParam = "id";

    if (sortOption === "Customer Name (Z-A)") {
      sortKey = "Customer Name";
      sortParam = "-companyName";
    } else if (sortOption === "Customer Name (A-Z)") {
      sortKey = "Customer Name";
      sortParam = "companyName";
    } else if (sortOption === "Admin Name (A-Z)") {
      sortKey = "Admin Name";
      sortParam = "orgAdminName";
    } else if (sortOption === "Admin Name (Z-A)") {
      sortKey = "Admin Name";
      sortParam = "-orgAdminName";

    }
    this.apiResponse = await apiAssert.waitForCustomersApi(
      async () => {
        await customerPage.selectSortOption(sortOption);
      },
      `sorts=${sortParam}`
    );
  }
);

Then(
  /^the Customers table should be sorted by "([^"]*)"$/,
  async (sortOption: string) => {
    const isSorted = await customerPage.verifySortApplied(sortOption);
    expect(isSorted).to.be.true;
  }
);

Then(
  "the customer table should display results sorted according to the applied sort",
  async function () {
    const apiAssert = new ApiAssertUtils(this.page);


    const sortIndicator = await customerPage.getSortIndicator();
    let sortKey: "Customer Name" | "Admin Name" | "id"="id" ;

    let sortParam = "id";

    if (sortIndicator?.includes("Customer Name (Z-A)")) {
      sortKey = "Customer Name";
    } else if (sortIndicator?.includes("Customer Name (A-Z)")) {
      sortKey = "Customer Name";
    } else if (sortIndicator?.includes("Admin Name (A-Z)")) {
      sortKey = "Admin Name";
    } else if (sortIndicator?.includes("dmin Name (Z-A)")) {
      sortKey = "Admin Name";

    }


    const apiResults = this.apiResponse?.results || [];

    const uiRows = await customerPage.getVisibleRows();


    await apiAssert.assertCustomerMatchApi(uiRows, apiResults, sortKey);
  }
);

Then(
  /^the customer sort indicator should show "Sort: ([^"]*)"$/,
  async (sortOption: string) => {
    const indicator = await customerPage.getSortIndicator();
    expect(indicator).to.include(sortOption);
  }
);

When("the user changes the sort to {string}", async (sortOption: string) => {
  await customerPage.selectSortOption(sortOption);
});
