import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { LoginPage } from "../pages/LoginPage";
import { Sidebar } from "../pages/Sidebar";
import { EmptyStatePage } from "../pages/EmptyStatePage";

Given("the user logs in using empty-state credentials", async function () {
  const login = new LoginPage(this.page);
  await login.goto();

  const email = process.env.EMPTY_STATE_EMAIL!;
  const password = process.env.EMPTY_STATE_PASSWORD!;

  await login.login(email, password);
});

When("the user navigates to the Vehicle tab", async function () {
  const sidebar = new Sidebar(this.page);
   
  await sidebar.navigateToVehicles();
});

When("the user navigates to the Drivers tab", async function () {
  const sidebar = new Sidebar(this.page);
   
  await sidebar.navigateToDrivers();
});

When("the user navigates to the Devices tab", async function () {
  const sidebar = new Sidebar(this.page);
   
  await sidebar.navigateToDevices();
});

When("the user navigates to the Fleet Group tab", async function () {
  const sidebar = new Sidebar(this.page);
   
  await sidebar.navigateToFleetGroups();
});

Then(
  "the page should display the message {string}",
  async function (expectedMessage: string) {
    const emptyPage = new EmptyStatePage(this.page);

    const actual = await emptyPage.getMessageText();

    expect(actual).to.equal(expectedMessage);
  }
);
