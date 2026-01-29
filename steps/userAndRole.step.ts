import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { LoginPage } from "../pages/LoginPage";
import { Sidebar } from "../pages/Sidebar";
import {  UserAndRolesPage } from "../pages/userAndRolesPage";
import { createDropdownUtils } from "../utils/dropdownUtils";
import { ApiAssertUtils } from "../utils/apiAssertUtils";

function generateUniqueId(prefix: string = ""): string {
  return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
}

const userData={
   fullName: `AutomationTest_${Date.now()}`,
    email: `testdriver${Date.now()}@automation.test`,
    phoneNumber: "03001234567",
    role:"Fleet Admin"
};

const emptyUserData={
   fullName: ``,
    email: ``,
    phoneNumber: "03001234567",
    role:""
};
const editUserData={
    fullName: `Edited_AutomationTest_${Date.now()}`,
    email: `testdriver${Date.now()}@automation.test`,
    phoneNumber: "03001234567",
    role:"Fleet Admin"
};
let userAndRolesPage:UserAndRolesPage;

Given(
  "the user is logged in and the user navigates through the sidebar to the User and Role page",
  async function () {
    const loginPage = new LoginPage(this.page);
    await loginPage.goto();
    await loginPage.login(
      process.env.TEST_USER_EMAIL || "your_username",
      process.env.TEST_USER_PASSWORD || "your_password"
    );
    const sidebar = new Sidebar(this.page);
    
    await sidebar.navigateTousers();
    userAndRolesPage = new UserAndRolesPage(this.page);
    const title = await userAndRolesPage.getTitle();
    expect(title).to.include("Users & Roles");

    this.userData = userData;
    this.emptyUserData = emptyUserData;
    this.editUserData = editUserData;
  }


);

  When("the user selects the {string} tab",async function(tabName:string){
    await userAndRolesPage.clickUserPageTabs(tabName);
  });

  Then("the Users table is displayed",async function(){
    const verification=await userAndRolesPage.isUsersTableDisplayed();
    expect(verification).to.be.true;
  });

   Then("the Invite User button is visible",async function(){
    const verification=await userAndRolesPage.isInviteButtonVisible();
    expect(verification).to.be.true;
  });
  Then("search, filter, and sort options are available",async function(){
    const searchVerifcation=await userAndRolesPage.isSearchVisible();
    expect(searchVerifcation).to.be.true;
    const filterVerification=await userAndRolesPage.isFilterVisible();
    expect(filterVerification).to.be.true;
    const sortVerification=await userAndRolesPage.isSortVisible();
    expect(sortVerification).to.be.true;
  });

  When("the user clicks Invite User",async function(){
    await userAndRolesPage.clickInviteUser();
  });

  Then("the user fills the new user form",async function(){
    await userAndRolesPage.fillUserData(this.userData);

  });

  Then("the user clicks Send Invite",async function(){
    await userAndRolesPage.submitUserForm();

  });

Then("the toast message {string} should be displayed",async function(toastMessage:string){
    const verification=await userAndRolesPage.verifyTripAddToastMessage(toastMessage);
});

Then("the user should be displayed in the table with status Pending",async function(){
    await userAndRolesPage.searchUser(this.userData.fullName);
    const verification=await userAndRolesPage.isUserInTable(this.userData.fullName);
expect(verification).to.be.true;   });

When("the user searches using the new user name",async function(){
    await userAndRolesPage.searchUser(this.userData.fullName);
});

Then("the new user should be displayed in the table",async function(){
    await userAndRolesPage.searchUser(this.userData.fullName);
    const verification=await userAndRolesPage.isUserInTable(this.userData.fullName);
expect(verification).to.be.true;
});

When("the user clicks the edit user icon",async function(){
    await userAndRolesPage.searchUser(this.userData.fullName);
    await userAndRolesPage.clickEditUser(this.userData.fullName);
});

Then("the user updates the new user details",async function(){
    await userAndRolesPage.updateUserFullName(editUserData.fullName);
});
Then("the user clicks Save Changes",async function(){
    await userAndRolesPage.submitUserForm();
});
Then("the update should be visible in the table",async function(){
    await userAndRolesPage.searchUser(editUserData.fullName);
    await this.page.waitForTimeout(2000);
    const verification=await userAndRolesPage.isUserInTable(editUserData.fullName);
    expect(verification).to.be.true;
});

When("the user clicks the resend button",async function(){

    await userAndRolesPage.clickResendInvite(this.editUserData.fullName);
});

Then("the user confirms the Resend Invite modal",async function(){
    await userAndRolesPage.confirmInvite();
});

Given("the admin is on the Users tab",async function(){
    await userAndRolesPage.clickUserPageTabs("Users");
});

When("the admin searches for a valid user keyword",async function(){
    await userAndRolesPage.searchUser("Edited_");
});

Then("only users matching Name, Email, or Role are displayed",async function(){
    const verification=await userAndRolesPage.isUserInTable("Edited_");
    expect(verification).to.be.true;
});

When("the admin searches with an invalid keyword",async function(){
    await userAndRolesPage.searchUser("$");
});

Then("the empty state message is displayed {string}",async function(expectedMessage:string){
    const verification=await userAndRolesPage.getNoUsersMessage();
    expect(verification).to.be.true;
});

Then("a Clear all filters button is visible",async function(){
   const verification=await userAndRolesPage.clearFilterButtonVisible();
   expect(verification).to.be.true;
});

Then ("the user submits the form without filling required fields",async function name() {
    await userAndRolesPage.fillUserData(this.emptyUserData);
});
Then("Send Invite button should be disabled",async function(){
    const verification=await userAndRolesPage.isSendInviteButtonDisabled();
    expect(verification).to.be.true;
});

When ("the user opens the filter dialog on the users table",async function(){
    await userAndRolesPage.openFilterDialog();
});
Then ("the user selects user filter {string} with value {string}",async function(filterName:string,filterValue:string){
    switch(filterName){
        case "Role":
            await userAndRolesPage.selectRoleFilter(filterValue);
            break;
        case "Status":
            await userAndRolesPage.selectStatusFilter(filterValue);
            break;
        default:
            throw new Error(`Unknown filter name: ${filterName}`);
    }
});
Then ("the user clicks Apply in the user filter dialog",async function(){
    await userAndRolesPage.applyFilters();
});

Then("the users table should display filtered results based on the applied filters",async function (){
    const verification=await userAndRolesPage.verifyFilteredResults({
        role: "Fleet Admin",
        status: "Active"
    });
    expect(verification).to.be.true;
});

When("the user opens the user sort dropdown on the users table",async function(){
    await userAndRolesPage.openSortDropdown();
});

Then("the user sort dropdown menu should contain the following options:",async function (dataTable){
    const expectedOptions=dataTable.raw().flat();
    const actualOptions=await userAndRolesPage.getSortOptions();
    expect(actualOptions).to.have.members(expectedOptions);
});

When("the user selects {string} from the user sort dropdown",async function(sortOption:string){
      switch (sortOption) {
        case "Newest":
            await userAndRolesPage.selectSortOption("Newest");
            break;
        case "Oldest":
            await userAndRolesPage.selectSortOption("Oldest");
            break;
        case "Email (A-Z)":
            await userAndRolesPage.selectSortOption("Email (A-Z)");
            break;
        case "Email (Z-A)":
            await userAndRolesPage.selectSortOption("Email (Z-A)");
            break;
        case "Last Login (Most Recent)":
            await userAndRolesPage.selectSortOption("Last Login (Most Recent)");
            break;
        case "Last Login (Least Recent)":
            await userAndRolesPage.selectSortOption("Last Login (Least Recent)");
            break;
        default:
            throw new Error(`Unknown sort option: ${sortOption}`);
    }
});
Then ("the users table should be sorted by {string}",async function(sortOption:string){
    const verification=await userAndRolesPage.verifySortApplied(sortOption);
    expect(verification).to.be.true;
});
