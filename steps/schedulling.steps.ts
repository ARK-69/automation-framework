import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { LoginPage } from "../pages/LoginPage";
import { Sidebar } from "../pages/Sidebar";
import { FilterCriteria, SchedulingPage} from "../pages/schedulingPage";
import { createDropdownUtils } from "../utils/dropdownUtils";
import { ApiAssertUtils } from "../utils/apiAssertUtils";


function getFormattedDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const tripData={
    fleetGroupName:"Test Name",
    vehicleName:"SSA-9835",
    usePrimaryDriver:true,
    primaryDriverName:"awd",
    routeName:"Route",
    recurranceType:"Does not exist",
    customRecurrance:false,
    customRecurranceData:{},
    startTime: "10 : 00-AM",
    startDate: getFormattedDate(0),
    endTime: "11 : 00-AM",
    endDate: getFormattedDate(1)
}

const fleetManagerTripData={
    fleetGroupName:"Testing Group",
    vehicleName:"AT74903100",
    usePrimaryDriver:true,
    primaryDriverName:"Test Driver",
    routeName:"Route",
    recurranceType:"Does not exist",
    customRecurrance:false,
    customRecurranceData:{},
    startTime: "10 : 00-AM",
   startDate: getFormattedDate(0),
    endTime: "11 : 00-AM",
  endDate: getFormattedDate(1)
}

const editTripData={
    fleetGroupName:"Test Name",
    vehicleName:"SSA-9835",
    usePrimaryDriver:true,
    primaryDriverName:"awd",
    routeName:"Route",
    recurranceType:"Does not exist",
    customRecurrance:false,
    customRecurranceData:{},
    startTime: "10 : 00-AM",
   startDate: getFormattedDate(0),
    endTime: "11 : 00-AM",
  endDate: getFormattedDate(1)
}
const editFleetManagerTripData={
    fleetGroupName:"Testing Group",
    vehicleName:"AT75911435",
    usePrimaryDriver:true,
    primaryDriverName:"Sarah Al-Rashid",
    routeName:"Route",
    recurranceType:"Does not exist",
    customRecurrance:false,
    customRecurranceData:{},
    startTime: "10 : 00-AM",
   startDate: getFormattedDate(0),
    endTime: "11 : 00-AM",
  endDate: getFormattedDate(1)
}

const emptyTripData={
    fleetGroupName:"",
    vehicleName:"",
    usePrimaryDriver:true,
    primaryDriverName:"",
    routeName:"",
    recurranceType:"Does not exist",
    customRecurrance:false,
    customRecurranceData:{},
   startTime: "10 : 00-AM",
   startDate: getFormattedDate(0),
    endTime: "11 : 00-AM",
  endDate: getFormattedDate(1)
    
}

let filterCriteria:FilterCriteria={};
let fleetGroupFilterApiData:any;
let driverFilterApiData:any;
let vehicleFilterApiData:any;
let routeFilterApiData:any;
let schedulePage:SchedulingPage;
Given(
  "the user has logged in and has navigated to scheduling",
  async function () {
    const loginPage = new LoginPage(this.page);
    await loginPage.goto();
    await loginPage.login(
      process.env.TEST_USER_EMAIL || "your_username",
      process.env.TEST_USER_PASSWORD || "your_password"
    );
    const sidebar = new Sidebar(this.page);
     
    await sidebar.navigateToScheduling();
    schedulePage = new SchedulingPage(this.page);
    const title = await schedulePage.getTitle();
    expect(title).to.include("Scheduling");
 
    this.tripData = tripData;
    this.fleetManagerTripData = fleetManagerTripData;   
    this.editTripData = editTripData;
    this.filterCriteria=filterCriteria;
    this.editFleetManagerTripData=editFleetManagerTripData;
    this.emptyTripData=emptyTripData;
  }

);

When("the user clicks the New Trip button", async function(){
    await schedulePage.clickNewTrip();
});
Then ("the user fills the trip form and submit the form",async function(){
    await this.page.waitForSelector('h2:has-text("Schedule New Trip")');
    await schedulePage.fillTripForm(this.tripData);
});
Then('a success toast {string} is shown',async function(expectedToast:string){
 await schedulePage.verifyTripAddToastMessage(expectedToast);

});
Then ("the trip should appear in the calendar with all its recurrences",async function(){
   const verification= await schedulePage.verifyTripInCalendar(this.tripData);
    expect(verification).to.be.true;
});

Then("the user clicks a trip card",async function(){
    await schedulePage.clickTripCard(this.tripData);
});
Then("the trip Details modal opens with correct trip details",async function() {
   const verification= await schedulePage.verifyTripDetails(this.tripData);
    expect(verification).to.be.true;
});

When("the user opens New Trip Modal",async function(){
    await schedulePage.clickNewTrip();
});

Then("user click save without filling required fields",async function(){
    await schedulePage.submitTripForm();
});

Then("inline validation errors should appear",async function (){
    const validationErrors=await schedulePage.verifyMissingFieldErrorMessage(this.tripData);
    expect(validationErrors).to.be.true;
});

When("the Trip Details view is open",async function(){
    await schedulePage.clickTripCard(this.tripData);

});
Then("the user clicks Delete button",async function(){
    await schedulePage.clickDeleteTrip();
});
Then("user confirms deletion of the trip",async function(){
    await schedulePage.confirmDeleteTrip();
});
Then("the trip is no longer visible in the calendar",async function(){
   const verification= await schedulePage.verifyTripDetails(this.tripData);
   expect(verification).to.be.false;
});

When("the user logs in as Fleet Manager",async function () {
    await this.page.click('[data-slot="avatar"]');
           await this.page.getByRole("menuitem", { name: "Log out" }).click();
       
       
           const loginPage = new LoginPage(this.page);
           await loginPage.goto();
           await loginPage.login(
             process.env.FLEET_ADMIN_EMAIL || "your_username",
             process.env.FLEET_ADMIN_PASSWORD || "your_password"
           );
           const sidebar = new Sidebar(this.page);
            
           await sidebar.navigateToScheduling();
           schedulePage = new SchedulingPage(this.page);
           const title = await schedulePage.getTitle();
           expect(title).to.include("Scheduling");
       
           this.tripData = tripData;
});

Then('the user clicks Edit',async function(){
    await schedulePage.clickEditTrip();
});
Then('the user fills the trip form and submit the changes',async function(){
    await schedulePage.fillTripForm(this.editTripData);
});
Then ("the updated trip should appear in the calendar with all its recurrences",async function(){
   const verification= await schedulePage.verifyTripInCalendar(this.editTripData);
    expect(verification).to.be.true;
});



When("the user selects Fleet Group filter with value {string}", async function( filterCriteria:string){
   
     const filterApiResponse=new ApiAssertUtils(this.page);
        this.filterCriteria.fleetGroupName=filterCriteria;
    fleetGroupFilterApiData=await filterApiResponse.waitForScheduleApi(
      async()=>{
        await schedulePage.applyFilter("Fleet Group",filterCriteria);
      },
      "groupId"
  );
  await this.page.waitForTimeout(2000);
});
When("the user selects Vehicle filter with value {string}", async function( filterCriteria:string){
   
     const filterApiResponse=new ApiAssertUtils(this.page);
     this.filterCriteria.vehicle=filterCriteria;
    vehicleFilterApiData=await filterApiResponse.waitForScheduleApi(
      async()=>{
        await schedulePage.applyFilter("Vehicle",filterCriteria);
      },
      "vehicleId"
  );
});
When("the user selects Driver filter with value {string}", async function( filterCriteria:string){
   
     const filterApiResponse=new ApiAssertUtils(this.page);
     this.filterCriteria.driverName=filterCriteria;
    driverFilterApiData=await filterApiResponse.waitForScheduleApi(
      async()=>{
        await schedulePage.applyFilter("Driver",filterCriteria);
      },
      "primaryDriverId"
  );
});
When("the user selects Routes filter with value {string}", async function( filterCriteria:string){
   
     const filterApiResponse=new ApiAssertUtils(this.page);
     this.filterCriteria.route=filterCriteria;
    routeFilterApiData=await filterApiResponse.waitForScheduleApi(
      async()=>{
        await schedulePage.applyFilter("Routes",filterCriteria);
      },
      "routeId"
  );
});
Then ("only trips belonging to the selected Fleet Groups are shown",async function(){
   const verification= await schedulePage.verifyFilterResults(this.filterCriteria,"Fleet Group",fleetGroupFilterApiData);
    expect(verification).to.be.true;
    
});

Then ("only trips belonging to the selected Vehicle are shown",async function(){
   const verification= await schedulePage.verifyFilterResults(this.filterCriteria,"Vehicles", vehicleFilterApiData);
    expect(verification).to.be.true;
    
});
Then ("only trips belonging to the selected Driver are shown",async function(){
   const verification= await schedulePage.verifyFilterResults(this.filterCriteria,"Driver",driverFilterApiData);
    expect(verification).to.be.true;
    
});
Then ("only trips belonging to the selected Route are shown",async function(){
   const verification= await schedulePage.verifyFilterResults(this.filterCriteria,"Routes",routeFilterApiData);
    expect(verification).to.be.true;
    
});


Then("the Fleet Manager fills the trip form and submit the form",async function(){
    await schedulePage.fillTripForm(this.fleetManagerTripData);
});

Then ("the trip scheduled by fleet manager should appear in the calendar with all its recurrences",async function(){
    const verification= await schedulePage.verifyTripInCalendar(this.fleetManagerTripData);
    expect(verification).to.be.true;
});

Then ("the updated trip scheduled by fleet manager should appear in the calendar with all its recurrences",async function(){
     const verification= await schedulePage.verifyTripInCalendar(this.editFleetManagerTripData);
    expect(verification).to.be.true;
});

Then("only trips belonging to the selected Filters are shown",async function(){
       const verification= await schedulePage.verifyFilterResults(this.filterCriteria,"Routes",routeFilterApiData);
    expect(verification).to.be.true;
});

Then ("the filter should persist after user switches between Day, Week, and Month views",async function(){
     const filterApiResponse=new ApiAssertUtils(this.page);
    routeFilterApiData=await filterApiResponse.waitForScheduleApi(
      async()=>{
           await this.page.getByRole('combobox').click();
        await this.page.getByRole('option', { name: 'Day' }).click();
      },
      "routeId"
  );
//   console.log(JSON.stringify(routeFilterApiData, null, 2));

  const verificationVehicleDays= await schedulePage.verifyFilterResults(this.filterCriteria,"Vehicle",routeFilterApiData);
  const verificationDriverDays= await schedulePage.verifyFilterResults(this.filterCriteria,"Driver",routeFilterApiData);
  const verificationFleetGroupDays= await schedulePage.verifyFilterResults(this.filterCriteria,"Fleet Group",routeFilterApiData);
  const verificationRouteDays= await schedulePage.verifyFilterResults(this.filterCriteria,"Routes",routeFilterApiData);

    routeFilterApiData=await filterApiResponse.waitForScheduleApi(
      async()=>{
           await this.page.getByRole('combobox').click();
        await this.page.getByRole('option', { name: 'Week' }).click();
      },
      "routeId"
  );

  const verificationDriverWeek= await schedulePage.verifyFilterResults(this.filterCriteria,"Driver",routeFilterApiData);
  const verificationVehicleWeek= await schedulePage.verifyFilterResults(this.filterCriteria,"Vehicle",routeFilterApiData);
  const verificationFleetGroupWeek= await schedulePage.verifyFilterResults(this.filterCriteria,"Fleet Group",routeFilterApiData);
  const verificationRouteWeek= await schedulePage.verifyFilterResults(this.filterCriteria,"Routes",routeFilterApiData);
//  console.log(JSON.stringify(routeFilterApiData, null, 2));

  expect(verificationRouteDays&&verificationRouteWeek&&verificationDriverWeek&&verificationVehicleWeek&&verificationFleetGroupWeek&&verificationVehicleDays&&verificationDriverDays&&verificationFleetGroupDays).to.be.true;
});

Then ("the user remove the Driver Filter",async function(){
    const filterApiResponse=new ApiAssertUtils(this.page);
    await this.page.waitForTimeout(2000);
    routeFilterApiData=await filterApiResponse.waitForScheduleApi(
      async()=>{
        
         await schedulePage.removeDriverFilter(filterCriteria.driverName!);
      }
      
  );});
  
Then ("the calendar updates to reflect remaining filters",async function(){
    const verificationVehicle= await schedulePage.verifyFilterResults(this.filterCriteria,"Vehicle",routeFilterApiData);
  const verificationFleetGroup= await schedulePage.verifyFilterResults(this.filterCriteria,"Fleet Group",routeFilterApiData);
  const verificationRoute= await schedulePage.verifyFilterResults(this.filterCriteria,"Routes",routeFilterApiData);
//  console.log(JSON.stringify(routeFilterApiData, null, 2));
    expect(verificationRoute&&verificationFleetGroup&&verificationVehicle).to.be.true;
});

Then("all accessible trips are displayed on the calendar",async function(){
    this.filterCriteria={};
     const verificationVehicle= await schedulePage.verifyFilterResults(this.filterCriteria,"Vehicle",routeFilterApiData);
     const verificationDriver= await schedulePage.verifyFilterResults(this.filterCriteria,"Driver",routeFilterApiData);
  const verificationFleetGroup= await schedulePage.verifyFilterResults(this.filterCriteria,"Fleet Group",routeFilterApiData);
  const verificationRoute= await schedulePage.verifyFilterResults(this.filterCriteria,"Routes",routeFilterApiData);
    expect(verificationRoute&&verificationFleetGroup&&verificationVehicle&&verificationDriver).to.be.true;
});

Then ("the fleet manager fills the trip form and submit the changes",async function(){
    await schedulePage.fillTripForm(this.editFleetManagerTripData);
});

