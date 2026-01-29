import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { Sidebar } from "../pages/Sidebar";
import { CompanyPage } from "../pages/CompanyPage";
import { BrandingPage } from "../pages/BrandingPage";
import { LoginPage } from "../pages/LoginPage";
import { count } from "console";


function uniqueSuffix() {
  return Date.now().toString().slice(-6);
}

function getRandomCountry() {
  const countries = [
    "Madagascar",
    "Australia",
    "Brazil",
    "Canada",
    "China",
    "France",
    "Germany",
    "India",
    "Japan",
    "Mexico",
    "Netherlands",
    "Pakistan",
    "Russia",
    "South Africa",
    "Spain",
    "Sweden",
    "Thailand",
    "Turkey",
    "United Kingdom",
    "United States",
  ];
  return countries[Math.floor(Math.random() * countries.length)];
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandomAddress() {
  const streets = [
    "Main St",
    "Oak Ave",
    "Elm Street",
    "Pine Road",
    "Maple Drive",
    "Birch Lane",
    "Cedar Court",
    "Ash Way",
  ];
  const numbers = Math.floor(Math.random() * 10000) + 1;
  const suffix = uniqueSuffix();
  const street = streets[Math.floor(Math.random() * streets.length)];
  return `${numbers} ${street}, Test City ${suffix}`;
}

const companyData = {
  adminName: `Test Customer ${uniqueSuffix()}`,
  adminPhone: `+0987${Date.now().toString().slice(-7)}`,
  country: getRandomCountry(),
  industry: "Transportation",
  businessType: "Startup",
  address: getRandomAddress(),
  logoFile: "./test-data/images (3).jpg",
  primaryColor: getRandomColor(),
  secondaryColor: getRandomColor(),
};

const emptyCompanyData = {
  adminName: "",
  adminPhone: "",
  country: getRandomCountry(),
  industry: "Transportation",
  businessType: "Startup",
  address: getRandomAddress(),
  logoFile: "./test-data/images (3).jpg",
  primaryColor: getRandomColor(),
  secondaryColor: getRandomColor(),
};

let companyPage: CompanyPage;
let brandingPage: BrandingPage;

Given(
  "the user is logged in and navigates to the Company page",
  async function () {
    const loginPage = new LoginPage(this.page);
    await loginPage.goto();
    await loginPage.login(
      process.env.TEST_USER_EMAIL || "your_username",
      process.env.TEST_USER_PASSWORD || "your_password"
    );
    const sidebar = new Sidebar(this.page);
    
    await sidebar.navigateToCompany();
    companyPage = new CompanyPage(this.page);
    const title = await companyPage.getTitle();
    expect(title).to.include("Company");

    this.companyData = companyData;
  }
);

When(
  "the user click the edit icon on the Customer information",
  async function () {
    await companyPage.openCustomerInfoEdit();
  }
);

Then(
  "the user update the Admin Name to {string}",
  async function (name: string) {
    const value = name || companyData.adminName;
    await companyPage.updateAdminName(value);
  }
);

Then(
  "the user update the Admin Phone to {string}",
  async function (phone: string) {
    const value = phone || companyData.adminPhone;
    await companyPage.updateAdminPhone(value);
  }
);

Then(
  "the user select {string} as the country",
  async function (country: string) {
    const value = country || companyData.country;
    await companyPage.selectCountry(value);
  }
);

Then(
  "the user select {string} as the industry",
  async function (industry: string) {
    const value = industry || companyData.industry;
    await companyPage.selectIndustry(value);
  }
);

Then(
  "the user select {string} as the business type",
  async function (businessType: string) {
    const value = businessType || companyData.businessType;
    await companyPage.selectBusinessType(value);
  }
);

Then(
  "the user change the address to {string}",
  async function (address: string) {
    const value = address || companyData.address;
    await companyPage.updateAddress(value);
  }
);

When(
  "the user click the edit icon for the branding configuration",
  async function () {
    brandingPage = new BrandingPage(this.page);
    await brandingPage.openBrandingEdit();
  }
);

Then(
  "the user click the delete icon to remove the current logo",
  async function () {
    await brandingPage.removeLogo();
  }
);

Then("the user click the delete icon to remove favicon", async function () {
  await brandingPage.removeFavicon();
});

Then(
  "the user upload {string} company logos",
  async function (fileName: string) {
    const fileToUpload = fileName || companyData.logoFile;
    await brandingPage.uploadLogo(fileToUpload);
  }
);

Then(
  "the user change the primary color to {string}",
  async function (color: string) {
    const value = color || companyData.primaryColor;
    await brandingPage.setPrimaryColor(value);
  }
);

Then(
  "the user change the secondary color to {string}",
  async function (color: string) {
    const value = color || companyData.secondaryColor;
    await brandingPage.setSecondaryColor(value);
  }
);

Then(
  "The customer information changes are saved successfully",
  async function () {
    await companyPage.saveCustomerInfo();
    await this.page.waitForTimeout(500);
    const notif = await companyPage.getNotification();
    expect(notif).to.include("Changes saved successfully.");
  }
);

Then("The branding changes are saved successfully", async function () {
  await brandingPage.save();
  await this.page.waitForTimeout(500);
  const notif = await companyPage.getNotification();
  expect(notif).to.include("Customer updated successfully!");
});

When(
  "the user click the edit icon on the Custoer information",
  async function () {
    await companyPage.openCustomerInfoEdit();
  }
);

Then("the user leave the Admin Name empty", async function () {
  await companyPage.updateAdminName(emptyCompanyData.adminName);
});

Then("the user fills rest of the field", async function () {
  await companyPage.selectCountry(emptyCompanyData.country);
  await companyPage.selectIndustry(emptyCompanyData.industry);
  await companyPage.selectBusinessType(emptyCompanyData.businessType);
  await companyPage.updateAddress(emptyCompanyData.address);
});
Then("The admin name field should give validation error", async function () {
  const isErrorVisible = await companyPage.adminNamevalidation();
  expect(isErrorVisible).to.be.true;
});
