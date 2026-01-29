import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { LoginPage } from "../pages/LoginPage";
import { Header } from "../pages/Header";
import { ProfilePage } from "../pages/ProfilePage";

const changedPassword = "Testing@1234";
const NEW_NAME = `John Doe Testing`;
const NEW_PHONE = "+9876543210";
const NEW_PROFILE_PIC = "./test-data/images (3).jpg";

let loginPage: LoginPage;
let header: Header;
let profilePage: ProfilePage;

Given(
  "the user has logged in and has navigated to My profile",
  async function () {
    loginPage = new LoginPage(this.page);
    await loginPage.goto();
    await loginPage.login(
      process.env.TEST_USER_EMAIL || "your_username",
      process.env.TEST_USER_PASSWORD || "your_password"
    );
    header = new Header(this.page);
    await header.selectMyProfile();
    profilePage = new ProfilePage(this.page);
  }
);

When("the user opens the Personal Information edit section", async function () {
  await profilePage.openEditPersonalInfo();
});

Then(
  "the user edits the name, phone number, and uploads a new profile picture",
  async function () {
    await profilePage.editPersonalInfo({
      name: NEW_NAME,
      phone: NEW_PHONE,
      profilePicture: NEW_PROFILE_PIC,
    });
  }
);

Then("the user saves the changes in personal information", async function () {
  await profilePage.savePersonalInfoChanges();
});

Then(
  'a "Profile updated Successfully" message should be displayed',
  async function () {
    const notif = await profilePage.getNotification();
    expect(notif).to.include("Profile updated successfully");
  }
);

When("the user clicks on Change Password", async function () {
  await profilePage.openChangePassword();
});

Then("the user enters the current password", async function () {
  await profilePage.enterPasswordCurrent(
    process.env.TEST_USER_PASSWORD || "your_password"
  );
});

Then("the user enters a new password", async function () {
  await profilePage.enterPasswordCurrent(changedPassword);
});

Then(
  "the user enters the new password in the New Password and Confirm New Password fields",
  async function () {
    await profilePage.enterPasswordNew(changedPassword, changedPassword);
  }
);

Then("the user enters the previous password", async function () {
  await profilePage.enterPasswordPrevious(
    process.env.TEST_USER_PASSWORD || "your_password",
    process.env.TEST_USER_PASSWORD || "your_password"
  );
});

Then("the user saves the password changes", async function () {
  const notif = await profilePage.savePasswordChange();
  expect(notif).to.include("Password changed successfully");
});

Then("the user logs out of the system", async function () {
  await header.logout();
});

Then(
  "the user should be able to log in again with email and the new password",
  async function () {
    await loginPage.login(
      process.env.TEST_USER_EMAIL || "your_username",
      changedPassword
    );
    await this.page.waitForTimeout(2000);
    await header.selectMyProfile();
  }
);

Then(
  "the user enters the current password in New Password field",
  async function () {
    await profilePage.enterPasswordCurrent(
      process.env.TEST_USER_PASSWORD || "your_password"
    );
    await profilePage.enterPasswordNew(
      process.env.TEST_USER_PASSWORD || "your_password",
      changedPassword
    );
  }
);
Then("the new password should display the validation error", async function () {
  const error = await profilePage.getNewPasswordError();
  expect(error).to.be.true;
});

When("the user opens the Personal information edit section", async function () {
  await profilePage.openEditPersonalInfo();
});
Then("the user removes the name", async function () {
  await profilePage.clearName();
});
Then("the save Changes button should be disabled", async function () {
  const isDisabled = await profilePage.verifyDisabledSaveButton();
  expect(isDisabled).to.be.true;
});
