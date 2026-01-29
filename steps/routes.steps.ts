import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { LoginPage } from "../pages/LoginPage";
import { Sidebar } from "../pages/Sidebar";
import { FilterCriteria, RoutesPage} from "../pages/RoutesPage";
import { createDropdownUtils } from "../utils/dropdownUtils";
import { ApiAssertUtils } from "../utils/apiAssertUtils";
import type { Response } from "@playwright/test";

function generateUniqueId(prefix: string = ""): string {
  return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
}
let apiResponse:any
let filterApiData:any;
const filterCriteria:FilterCriteria={};

const routeData={
    routeName:generateUniqueId("Route_"),
    startLocation:"King Faisal Specialist Hospital & Research Centre",
    startaddress:"Makkah Al Mukarramah Br Rd, Al Mathar Ash Shamali, Riyadh 12713, Saudi Arabia",
    endLocation:"Children's Specialized Hospital, King Fahad Medical City",

    endaddress:"Prince Abdulaziz Ibn Musaid Ibn Jalawi St, Riyadh 12231, Saudi Arabia"
};

const editRouteData={
    routeName:generateUniqueId("Edited_Route_"),
    startLocation:"King Abdullah Park",
    startaddress:"Al Ameen Abdullah Al Ali Al Naeem St, Al Malaz, Riyadh 12836, Saudi Arabia",
    endLocation:"Royal Clinic",
    endaddress:"PP9X+3G, King Abdullah Dt., Riyadh 12423, Saudi Arabia"}

let routesPage:RoutesPage;
Given(
  "the user has logged in and has navigated to Routes",
  async function () {
    const loginPage = new LoginPage(this.page);
    await loginPage.goto();
    await loginPage.login(
      process.env.TEST_USER_EMAIL || "your_username",
      process.env.TEST_USER_PASSWORD || "your_password"
    );
    const sidebar = new Sidebar(this.page);
     
    await sidebar.navigateToroutes();
    routesPage = new RoutesPage(this.page);
    const title = await routesPage.getTitle();
    expect(title).to.include("Routes");

    this.routeData = routeData;
  }
);

When("the user click Add Route button", async function () {
   await routesPage.clickAddRoute(); 
});
Then("the user has filled the route form", async function () {
    await routesPage.fillRouteForm(this.routeData);
});
Then("the user has clicked Save Route button",async function(){
    await routesPage.submitRouteForm();
    await this.page.waitForTimeout(2000);
});
Then("the route should appear in the Routes list",async function(){
    await routesPage.searchRoute(this.routeData.routeName!);
    const isPresent=await routesPage.isRouteInTable(this.routeData.routeName!);
    expect(isPresent).to.be.true;
});

When("the user clicks the edit icon for the new Route",async function(){
    await routesPage.editRoute(this.routeData.routeName!);
});



Then("the user has changed the route information",async function(){
  await routesPage.editRouteInformation(editRouteData);
});

Then ("the new route information should be visible in the Routes list",async function(){
    await routesPage.searchRoute(editRouteData.routeName!);
    const isPresent=await routesPage.isRouteInTable(editRouteData.routeName!);
    expect(isPresent).to.be.true;  
});

When("the user searches the route with route name",async function (){
    await routesPage.searchRoute(editRouteData.routeName!);
});

Then ("the user is the owner of the Route",async function(){
    await routesPage.isRouteOwner();
});
Then ("the user has clicked Archive button",async function(){
  await routesPage.archiveRoute();
});
Then("the Routes should appear in the Archive Route",async function (){
   expect( await routesPage.checkArchiveRoute(editRouteData.routeName!)).to.be.true;
});

Then ("the user clicked unarchive button",async function(){
  await routesPage.unarchiveRoute();
});
Then("the Route should be remove from Archived Routes",async function (){
   expect( await routesPage.checkArchiveRoute(editRouteData.routeName!)).to.be.false;
});

When ("the user press the view icon on a route",async function(){
    await routesPage.searchRoute(editRouteData.routeName!);
       await routesPage.clickViewRoute()
});
When("the user logs in with another account",async function(){
   
 await this.page.waitForSelector('[data-slot="avatar"]');
    await this.page.click('[data-slot="avatar"]');
    await this.page.getByRole("menuitem", { name: "Log out" }).click();


    const loginPage = new LoginPage(this.page);
    await loginPage.goto();
    await loginPage.login(
      process.env.SECOND_USER_EMAIL || "your_username",
      process.env.SECOND_USER_PASSWORD || "your_password"
    );
    const sidebar = new Sidebar(this.page);
     
    await sidebar.navigateToroutes();
    routesPage = new RoutesPage(this.page);
    const title = await routesPage.getTitle();
    expect(title).to.include("Routes");

    this.routeData = routeData;
   
});
Then ("that routes detailed information should be displayed",async function(){
 
  expect (await routesPage.verifyViewRouteDetails(editRouteData)).to.be.true;
});
Then ("the routes that are created by other users are not editable",async function(){
  await routesPage.searchRoute(editRouteData.routeName);
  expect (await routesPage.checkEditRouteDisabled()).to.be.true;
});

Then ("the routes that are created by other users cannot be archived",async function(){
  await routesPage.searchRoute(editRouteData.routeName);
  expect (await routesPage.checkEditRouteDisabled()).to.be.true;
});

Then("the user opens the filter dialog on the routes page",async function(){
  await routesPage.openFilterDialog();  
});
Then("the user clicks Apply button in the routes filter dialog",async function(){
  const filterApiResponse = new ApiAssertUtils(this.page);
  filterApiData=await filterApiResponse.waitForRoutesApi(
      async()=>{
        await routesPage.clickApplyFilter();
      }
  );
});



Then(
  "the user selects {string} route filter with value {string}", async function(filterLabel:string,filterValue:string){
    switch(filterLabel){
      case "No of Stops":
        await routesPage.selectNoOfStopsFilter(filterValue);
        filterCriteria.noOfStops=filterValue;
        break;
      
      case "Total Distance":
        await routesPage.selectTotalDistanceFilter(filterValue);
        filterCriteria.totalDistance=filterValue;
        break;
      
      case "Total Duration":
      await routesPage.selectTotalDurationFilter(filterValue);
      filterCriteria.totalDuration=filterValue;
        break;
      
      case "Created By":
      await routesPage.selectCreatedByFilter(filterValue);
      filterCriteria.createdBy=filterValue;
        break;  
      default:
        throw new Error(`Unknown filter label: ${filterLabel}`);
    }

  }
);

Then("the routes table should display filtered results based on the applied filters",async function(){
 expect( await routesPage.verifyFilteredResults(filterCriteria,filterApiData)).to.be.true;});

When("the user opens the sort dropdown on the Routes table",async function(){
  await routesPage.openSortDropdown();
});

Then("the route sort dropdown menu should contain the following options:",async function(dataTable:any){
  const expectedOptions = dataTable.rawTable.map((row: string[]) =>
        row[0].trim()
      );
      const actualOptions = await routesPage.getSortOptions();
  
      for (const expectedOption of expectedOptions) {
        expect(actualOptions).to.include(expectedOption);
      }
      routesPage.closeSortDropdown();
});

Then("the user selects {string} from the route sort dropdown menu",async function(sortOption:string){
  
  const apiAssert = new ApiAssertUtils(this.page);
  
      let sortKey: "Oldest"| "Newest" | "Shortest Distance" |"Longest Distance"| "Fewest Stops" | "Most Stops" | "id" =
        "id";
  
      let sortParam = "id";
  
      if (sortOption === "Newest") {
        sortKey = "Newest";
        sortParam = "-Id";
      } else if (sortOption === "Oldest") {
        sortKey = "Oldest";
        sortParam = "Id";
      } else if (sortOption === "Shortest Distance") {
        sortKey = "Shortest Distance";
        sortParam = "distance";
      } else if (sortOption === "Longest Distance") {
        sortKey = "Longest Distance";
        sortParam = "-distance";
      } else if (sortOption === "Most Stops") {
        sortKey = "Most Stops";
        sortParam = "-numberOfStops";
      } else if (sortOption === "Fewest Stops") {
        sortKey = "Fewest Stops";
        sortParam = "numberOfStops";
      }
      apiResponse = await apiAssert.waitForRoutesApi(
        async () => {
          await routesPage.selectSortOption(sortOption);
        },
        `sorts=${sortParam}`
      );
});

Then ("the Routes table should be sorted by {string}",async function(sortOption:string){

  const sortIndicator = await routesPage.getSortIndicator();
    let sortKey: "Newest"|"Oldest" | "Most Stops"| "Shortest Distance" | "Fewest Stops" | "Longest Distance" | "id" =
      "id";

    let sortParam = "id";

    if (sortIndicator?.includes("Newest")) {
      sortKey = "Newest";
    } else if (sortIndicator?.includes("Oldest")) {
      sortKey = "Oldest";
    } else if (sortIndicator?.includes("Most Stops")) {
      sortKey = "Most Stops";
    } else if (sortIndicator?.includes("Fewest Stops")) {
      sortKey = "Fewest Stops";
    } else if (sortIndicator?.includes("Longest Distance")) {
      sortKey = "Longest Distance";
    } else if (sortIndicator?.includes("Shortest Distance")) {
      sortKey = "Shortest Distance";
    }

    const apiResult= apiResponse?.results || [];

  expect (await routesPage.verifyRoutesSortedBy(sortKey,apiResult)).to.be.true;
});