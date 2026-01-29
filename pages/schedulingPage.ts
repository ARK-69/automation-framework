import { Page } from "playwright";
import { DropdownUtils } from "../utils/dropdownUtils";
import { createFileUploadUtils } from "../utils/fileUploadUtils";
import { createDatePickerUtils } from "../utils/datePickerUtils";
import { FilterUtils } from "../utils/filterUtils";
import { SortUtils } from "../utils/sortUtils";



export interface tripData{
    fleetGroupName: string;
    vehicleName: string;
    usePrimaryDriver: boolean;
    primaryDriverName: string;
    secondaryDriverName?: string;
    routeName: string;
    startTime: string;
    startDate: string;
    endTime: string;
    endDate: string;
    customRecurrance: boolean;
    customRecurranceData:{
        repeatEvery:number;
        repeatType: "Days" | "Weeks" | "Months"| "Years";
        repeatOnDays: "Monday" | "Tuesday" | "Wedenesday" | "Thursday"|"Friday"|"Saturday"|"Sunday"; // only for Weeks
        endstype: "Never" | "After" | "On";
        endDate?:string;
        endAfterOccurrences?:number;

    }
    recurranceType:"Does not Exist"|"Daily"|"Weekly on Friday"| "Every Weekday"
}
export interface FilterCriteria{
    fleetGroupName?:string;
    vehicleName?:string;
    driverName?:string;
    routeName?:string;
}

export class SchedulingPage {
     private filterUtils: FilterUtils;
    private sortUtils: SortUtils;
    constructor(private page: Page) {
        this.filterUtils = new FilterUtils(this.page);
        this.sortUtils = new SortUtils(this.page);
    }
    async getTitle(){
        return await this.page.locator("h1, .page-title").textContent(); 
    }

    async clickNewTrip(){
        await this.page.locator('button:has-text("New Trip")').click();
    }
       
    async verifyTripAddToastMessage(message:string):Promise<boolean>{
        const toastLocator=await this.page.locator(`li:has-text("${message}")`);
        if (toastLocator){
            return true;
        }
        return false;
    }

    async fillTripForm(tripDetails:tripData){
        const datePickerUtils=createDatePickerUtils(this.page);
        const dropdownUtils=new DropdownUtils(this.page);   

        await this.page.waitForSelector('h2:has-text("Schedule New Trip"),h2:has-text("Edit Trip")');

        await this.filterUtils.selectDropdownFilterScheduling(
            "Fleet Group","fleetGroupId",
            tripDetails.fleetGroupName
        );
        await this.filterUtils.selectDropdownFilterScheduling(
            "Vehicle",'vehicleId',
            tripDetails.vehicleName
        );
        if(!tripDetails.usePrimaryDriver){
            await this.filterUtils.selectDropdownFilterScheduling(
                'Primary Driver',"mainDriverId",
                tripDetails.primaryDriverName
            );
            if(tripDetails.secondaryDriverName){
                await this.filterUtils.selectDropdownFilterScheduling(
                    'Secondary Driver',"secondaryDriverId",
                    tripDetails.secondaryDriverName
                );
            }
        }
        await this.filterUtils.selectDropdownFilterScheduling(
            'Route Name',"routeId",
            tripDetails.routeName
        );

        await this.datePicker(tripDetails.startDate,tripDetails.startTime,tripDetails.endDate,tripDetails.endTime);
        if (tripDetails.customRecurrance){
        await dropdownUtils.selectDropdownOption(
            'Recurrance',
            tripDetails.recurranceType
        );

        await this.customRecurranceSetup(tripDetails.customRecurranceData);
       
    }
     await this.submitTripForm();
     
    }
    async customRecurranceSetup(recurranceData:tripData["customRecurranceData"]){
        const dropdownUtils=new DropdownUtils(this.page);
        await this.page.locator('input[type="number"]').fill(recurranceData.repeatEvery.toString());
        await dropdownUtils.selectDropdownOption(
            'Repeat Type',
            recurranceData.repeatType
        );
        const repeatDays=await this.page.locator('label:has-text("Repeat On")').locator('..');
        switch(recurranceData.repeatOnDays){
            case "Monday":
                await repeatDays.locator('button:has-text("M")').click();
                break;
            case "Tuesday":
                await repeatDays.locator('button:has-text("T")').first().click();
                break;
            case "Wedenesday":
                await repeatDays.locator('button:has-text("W")').click();
                break;
            case "Thursday":
                await repeatDays.locator('button:has-text("T")').nth(1).click();
                break;
            case "Friday":
                await repeatDays.locator('button:has-text("F")').click();
                break;
            case "Saturday":
                await repeatDays.locator('button:has-text("S")').first().click();
                break;
            case "Sunday":
                await repeatDays.locator('button:has-text("S")').nth(1).click();
                break;

    }
    await this.filterUtils.selectRadioFilter("Ends", recurranceData.endstype);
    switch(recurranceData.endstype){
        case "On":

    }

    
}
async verifyTripInCalendar(tripDetails:tripData):Promise<boolean>{
    // const targetMonth=parseInt(tripDetails.startDate.split("-")[1]);
    // const targetYear=tripDetails.startDate.split("-")[0];
    // const targetDay=parseInt(tripDetails.startDate.split("-")[2]);
    
    // const datesInMonth=await this.page.locator(`span:has-text("${targetDay}")`);


     await this.page.locator('button[role="combobox"]').click();
  await this.page.getByRole('option', { name: 'Day' }).click();

    const time=`${tripDetails.startTime} - ${tripDetails.endTime}`;
    await this.page.waitForTimeout(2000);
    const vehiceleName=await this.page.locator(`div[type='button']:has-text("${tripDetails.vehicleName}")`).isVisible();
    const driverName=await this.page.locator(`div[type='button']:has-text("${tripDetails.primaryDriverName}")`).isVisible();
    const timeLocator=await this.page.locator(`div[type='button']:has-text("${time}")`).isVisible();
    // console.log(`Vehicle Name: ${vehiceleName}, Driver Name: ${driverName}, Time: ${timeLocator}`);
    if(vehiceleName && driverName){
        return true;
    }
    else{
        return false;
    }
         
}
async navigateToMonth(targetMonth:number,targetYear:string){
    const date = new Date();
        const current_day = date.getDate();
        const current_month = date.getMonth() + 1; // months are 0-based
        const current_year = date.getFullYear();
    
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const targetMonthName = months[targetMonth - 1];
    console.log(`Navigating to ${targetMonthName} ${targetYear}...`);

    const header = this.page.locator("text=/[A-Za-z]+ \\d{4}/").first();

    let attempts = 0;
    const maxAttempts = 25;

    while (attempts < maxAttempts) {
      const headerText = await header.textContent();
      console.log(`Current calendar: ${headerText}`);

      if (
        headerText?.includes(targetMonthName) &&
        headerText?.includes(targetYear)
      ) {
        console.log(`Reached target month: ${targetMonthName} ${targetYear}`);
        return;
      }

      const [currentMonth, currentYear] = this.parseMonthYear(headerText || "");
      const shouldClickNext = this.shouldMoveForward(
        currentMonth,
        parseInt(currentYear),
        targetMonth,
        parseInt(targetYear)
      );

      let arrow;
      if (shouldClickNext) {
        arrow = this.page.locator('xpath=/html/body/div/div/div/main/div/div[3]/div/div[2]/div/button[1]');
      } else {
        arrow = this.page.locator(
          'xpath=//*[@id="root"]/div/div/main/div/div[3]/div/div[2]/div/button[3]'
        );
      }

      if ((await arrow.count()) === 0) {
        console.warn(
          `Arrow button (${shouldClickNext ? "next" : "previous"}) not found`
        );
        break;
      }

      await arrow.click();
      await this.page.waitForTimeout(400);
      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.warn(
        `Could not reach target month after ${maxAttempts} attempts`
      );
    }

}
  private parseMonthYear(headerText: string): [number, string] {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    let monthNum = 1;
    for (let i = 0; i < months.length; i++) {
      if (headerText.includes(months[i])) {
        monthNum = i + 1;
        break;
      }
    }

    const yearMatch = headerText.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : "2025";

    return [monthNum, year];
  }
  private shouldMoveForward(
    currentMonth: number,
    currentYear: number,
    targetMonth: number,
    targetYear: number
  ): boolean {
    if (currentYear < targetYear) return true;
    if (currentYear > targetYear) return false;
    return currentMonth < targetMonth;
  }

    async clickTripCard(tripData:tripData){
                await this.page.locator('button[role="combobox"]').click();
        await this.page.getByRole('option', { name: 'Day' }).click();
        
        await this.page.locator(`div[role="presentation"]:has-text("${tripData.vehicleName}")`).click();
    }
  async verifyTripDetails(tripData: tripData): Promise<boolean> {
    const vehicleName = await this.page.locator(`h3:has-text("${tripData.vehicleName}")`).isVisible({ timeout: 1000 });
    const driverName = await this.page.locator(`p:has-text("${tripData.primaryDriverName}")`).isVisible({ timeout: 1000 });
    const routeName = await this.page.locator(`p:has-text("${tripData.routeName}")`).isVisible({ timeout: 1000 });

    let checkVehicleName = null, checkDriverName = null, checkRouteName = null;
    if (vehicleName) checkVehicleName = await this.page.locator(`h3:has-text("${tripData.vehicleName}")`).textContent();
    if (driverName) checkDriverName = await this.page.locator(`p:has-text("${tripData.primaryDriverName}")`).textContent();
    if (routeName) checkRouteName = await this.page.locator(`p:has-text("${tripData.routeName}")`).textContent();

    console.log(`Vehicle Name in Details: ${checkVehicleName}, Driver Name in Details: ${checkDriverName}, Route Name in Details: ${checkRouteName}`);

    if (vehicleName && driverName && routeName) {
        return true;
    }
    return false;
}

    async editTripDetails(editTripData:tripData){
        await this.submitTripForm()
        await this.fillTripForm(editTripData);

    }
    async submitTripForm(){
        await this.page.locator('button[type="submit"]:has-text("Save")').click();
        
    }
    async verifyMissingFieldErrorMessage(tripData:tripData){
     
        
        const errorMessages=[
            "Fleet Group is required",
            "Vehicle is required",
            "Route is required",
            "Main Driver is required",
            "End Date must be after Start Date"
            
        ]
        for (const message of errorMessages){
            const errorLocator=await this.page.locator(`text=${message}`);
            if (!errorLocator){
                return false;
            }
        }
        return true;

        
    }
    async clickDeleteTrip(){
        await this.page.locator('button:has-text("Delete")').click();  

    }

    async confirmDeleteTrip(){
        await this.page.locator('button:has-text("Delete Trip")').click();
    }

    async clickEditTrip(){
        await this.page.locator('button:has-text("Edit")').click();
        
}   
    async applyFilter(filterLabel:string,value:string){
        
        
            const button=await this.page.locator(`button[data-slot="popover-trigger"]:has-text("${filterLabel}")`).first();
            
        
           
      
        await button.click();
        const searchContainer = this.page.locator('.searchbar-container').first();
    const isCheckboxDropdown = await searchContainer.isVisible({ timeout: 1000 }).catch(() => false);

    if (isCheckboxDropdown) {
      // Handle checkbox dropdown with search
      const searchInput = searchContainer.locator(`input[placeholder="Search ${filterLabel}"]`).first();
      await searchInput.waitFor({ state: "visible", timeout: 5000 });
      await searchInput.fill(value);
      await this.page.waitForTimeout(300);

      // Find the option label and click its checkbox
      const optionLabel = this.page.locator(`.option-label:text-is("${value}")`).first();
      await optionLabel.waitFor({ state: "visible", timeout: 5000 });

      const listOption = optionLabel.locator('xpath=ancestor::div[contains(@class, "list-option")]').first();
      const checkbox = listOption.locator(`button[role="checkbox"],p:has-text('${value}')`).first();
      await checkbox.click();
      
      console.log(`✓ Selected "${value}" for "${filterLabel}" checkbox dropdown`);
    } else {
      // Handle standard listbox dropdown (original functionality)
      await this.page.waitForSelector('[role="listbox"], [role="menu"]', {
        timeout: 5000,
      });
      await this.page.waitForTimeout(300);

      const dropdownMenu = this.page
        .locator('[role="listbox"], [role="menu"]')
        .first();
      const option = dropdownMenu
        .locator(
          `[role="option"]:has-text("${value}"), [role="menuitem"]:has-text("${value}")`
        )
        .first();
      await option.waitFor({ state: "visible", timeout: 5000 });
      await option.click();
    }

    await this.page.waitForTimeout(300);


    }
    async verifyFilterResults(filterCriteria:FilterCriteria,filterLabel:string,filterApiData:any):Promise<boolean>{ 
        
           if (!Array.isArray(filterApiData) || filterApiData.length === 0) {
        return true;
    }

    // Check each filter type
        for (const [i, trip] of filterApiData.entries()) {
            console.log(`Verifying trip ${i + 1}/${trip.vehicle?.group?.groupName} ${trip.vehicle?.plateNo}, ${trip.primaryDriver?.name},${trip.route?.name}...`);
            if (filterLabel === "Fleet Group" && filterCriteria.fleetGroupName) {
                const actual = trip.vehicle?.group?.groupName;
                const expected = filterCriteria.fleetGroupName;
                console.log(`[Trip ${i}] Fleet Group: actual='${actual}', expected='${expected}'`);
                if (actual !== expected) {
                    console.log(`[Trip ${i}] MISMATCH: Fleet Group`);
                    return false;
                }
            }
            if (filterLabel === "Vehicles" && filterCriteria.vehicleName) {
                const actual = trip.vehicle?.plateNo;
                const expected = filterCriteria.vehicleName;
                console.log(`[Trip ${i}] Vehicle: actual='${actual}', expected='${expected}'`);
                if (actual !== expected) {
                    console.log(`[Trip ${i}] MISMATCH: Vehicle`);
                    return false;
                }
            }
            if (filterLabel === "Driver" && filterCriteria.driverName) {
                const actual = trip.primaryDriver?.name;
                const expected = filterCriteria.driverName;
                console.log(`[Trip ${i}] Driver: actual='${actual}', expected='${expected}'`);
                if (actual !== expected) {
                    console.log(`[Trip ${i}] MISMATCH: Driver`);
                    return false;
                }
            }
            if (filterLabel === "Routes" && filterCriteria.routeName) {
                const actual = trip.route?.name;
                const expected = filterCriteria.routeName;
                console.log(`[Trip ${i}] Route: actual='${actual}', expected='${expected}'`);
                if (!actual || !actual.includes(expected)) {
                    console.log(`[Trip ${i}] MISMATCH: Route`);
                    return false;
                }
            }
        }
        console.log(`All trips matched for filter '${filterLabel}' with values`);
        return true;


     } 
     async removeDriverFilter(driverName:String){
        await this.page.locator(`span:has-text("${driverName}")+svg`).click();
     }

     async datePicker(startDate:string,startTime:string,endDate:string,endTime:string){
        await this.page.locator("label:has-text('End Date')").locator('..').locator('input').click();
        this.navigateToMonth(parseInt(endDate.split("-")[1]),endDate.split("-")[0]);
        const day=parseInt(endDate.split("-")[2]).toString();
        await this.page.locator(`button:has-text("${day}")`).nth(1).click();
        const timeSelector=await this.page.locator("h3:has-text('Select Time')").locator('..');
        const time=endTime.split("-");
        console.log(`Selecting time: ${endTime},${time[0]}, ${time[1]}`);
        await timeSelector.locator(`button:has-text("${time[0]}")`).click();
        await this.page.waitForSelector(`button:has-text('${time[1]}')`);


           await this.page.locator("label:has-text('Start Date')").locator('..').locator('input').click();
        this.navigateToMonth(parseInt(startDate.split("-")[1]),startDate.split("-")[0]);
        const startday=parseInt(startDate.split("-")[2]).toString();
        await this.page.locator(`button:has-text("${startday}")`).nth(1).click();
        const starttimeSelector=await this.page.locator("h3:has-text('Select Time')").locator('..');
        const starttime=startTime.split("-");
        console.log(`Selecting time: ${startTime},${starttime[0]}, ${starttime[1]}`);
        await starttimeSelector.locator(`button:has-text("${starttime[0]}")`).click();
        await this.page.waitForSelector(`button:has-text('${starttime[1]}')`);


     }
}
