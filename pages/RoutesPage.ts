import { Page } from "playwright";
import { DropdownUtils } from "../utils/dropdownUtils";
import { createFileUploadUtils } from "../utils/fileUploadUtils";
import { createDatePickerUtils } from "../utils/datePickerUtils";
import { FilterUtils } from "../utils/filterUtils";
import { SortUtils } from "../utils/sortUtils";
import { ApiAssertUtils } from "../utils/apiAssertUtils";


export interface RouteData{
    routeName?:string;
    startLocation?:string;
    endLocation?:string;
    startaddress?:string;
    endaddress?:string;
    additionalPoints?:string[];
}

export interface FilterCriteria {
    noOfStops?: string; // "2-5", "6-10", "10+"
    totalDistance?: string; // "<50 km", "50-200 km", "200+ km"
    totalDuration?: string; // "<1h", "1-4h", "4-8h", "8h+"
    createdBy?: string; // username or "Test"
}
export class RoutesPage {
    private filterUtils: FilterUtils;
    private sortUtils: SortUtils;
    constructor(private page: Page) {
        this.filterUtils = new FilterUtils(this.page);
        this.sortUtils = new SortUtils(this.page);
    }

    async getTitle(){
        return await this.page.locator("h1, .page-title").textContent(); 
    }
    async clickAddRoute(){
        await this.page.locator('button:has-text("Add Route")').click();
    }

    async fillRouteForm(routeData:RouteData){
        const dropdownUtils = new DropdownUtils(this.page);

        await this.page.waitForSelector('input[name="routeName"]');

        await this.page.fill('input[name="routeName"]', routeData.routeName ||"");
        await this.page.fill('input[name="points.0.displayName"]', routeData.startLocation ||"");
        await this.page.fill('input[name="points.1.displayName"]', routeData.endLocation ||"");

        const startPointDiv=await this.page.locator('span:has-text("Point 1")').locator("..").locator("..");
        await startPointDiv.locator('input[placeholder="Enter address"]').fill(routeData.startaddress ||"");
        
        // Wait for the address option to be visible, then click it
        // Use partial match (*=) because aria-label contains full address, not just the search term
        const startAddressOption = this.page.locator(`div[role="button"][aria-label*="${routeData.startaddress}"]`).first();
        await startAddressOption.waitFor({ state: 'visible', timeout: 50000 });
       
        await startAddressOption.click();

        const endPointDiv=await this.page.locator('span:has-text("Point 2")').locator("..").locator("..");
        await endPointDiv.locator('input[placeholder="Enter address"]').fill(routeData.endaddress ||"");
        
        // Wait for the address option to be visible, then click it
        // Use partial match (*=) because aria-label contains full address, not just the search term
        const endAddressOption =await this.page.locator(`div[role="button"][aria-label*="${routeData.endaddress}"]`).first();
        await endAddressOption.waitFor({ state: 'visible', timeout: 50000 });
        await endAddressOption.scrollIntoViewIfNeeded();
        await endAddressOption.click();

        //Need to add additional points logic 

    }
    async submitRouteForm(){
        const saveButton = this.page.locator('button:has-text("Save Route")').or(this.page.locator('button:has-text("Update Route")'));
        await saveButton.click();
        await this.page.click('button:has-text("Back to Routes")');
    }

    async searchRoute(routeName:string){
        await this.page.fill('input[placeholder="Search"]', routeName);
        await this.page.waitForTimeout(2000);
    }
    async isRouteInTable(routeName:string){
        await this.page.waitForTimeout(2000);
    return await this.page.locator(`h3:has-text("${routeName}")`).isVisible()&&
           await this.page.locator('span:has-text("Created by Me")').isVisible();
    }
    async getNoRouteMessage(){
        return await this.page.locator('text=No routes found').textContent();
    }
    async clickViewRoute(){
        
        const editButton=await this.page.locator('//*[@id="root"]/div/div/main/main/div/div[3]/div[1]/div[1]/div[2]/div[2]/div[2]/button[1]').first();
        await editButton.click();
    }
    
    async checkEditRouteDisabled(){
            return await this.page.locator('button[data-state="closed"]').nth(1).isVisible();
    }

    async checkArchiveRouteDisabled(){
        return await this.page.locator('button[data-state="closed"]').nth(2).isVisible();
    }

    async editRoute(routeName:string){
        await this.searchRoute(routeName);
       await this.page.locator('button[data-testid="routes-main-route-card-edit-icon"]').click();
        
        await this.page.click('button:has-text("Continue Editing")');
    }
        
    

    async editRouteInformation(routeData:RouteData){
        await this.fillRouteForm(routeData);
        await this.updateRouteForm();
    }

    async updateRouteForm(){
        const saveButton = this.page.locator('button:has-text("Save Route")').or(this.page.locator('button:has-text("Save Changes")'));
        await saveButton.click();
        await this.page.locator('button[data-testid="routes-add-modal-success-back-to-routes"]').click();
    }

    async isRouteOwner(){
        await this.page.locator('span:has-text("Created by Me")').isVisible();
        
    }
    async archiveRoute(){
         
        const editButton=this.page.locator('button[data-testid="routes-main-route-card-archive-icon"]');
        await editButton.click();
        await this.page.click('button:has-text("Archive Route")');

    }
    async checkArchiveRoute(routeName:string){
        await this.page.click('button:has-text("Archived")');
        await this.searchRoute(routeName);
        return await this.page.locator(`h3:has-text("${routeName}")`).isVisible();

    }


    async unarchiveRoute(){
        const editButton=this.page.locator('button[data-testid="routes-main-route-card-unarchive-icon"]');
        await editButton.click();
        await this.page.click('button:has-text("Archive Route")');
    }

    async isRouteModalVisible(){
        const routeHeader=this.page.locator("p",{
            hasText:"Route Details",
        });
        await routeHeader.waitFor({state:"visible",timeout:2000});
        return await routeHeader.isVisible();
    }

    async verifyViewRouteDetails(routeData:RouteData):Promise<boolean>{
        const routeName = await this.page.locator(`h2:has-text("${routeData.routeName}")`).textContent();
        const startPoint = await this.page.locator(`h4:has-text("${routeData.startLocation}")`).textContent();
        const endPoint = await this.page.locator(`h4:has-text("${routeData.endLocation}")`).textContent();
        const startAddress = await this.page.locator(`p:has-text("${routeData.startaddress}")`).textContent();
        const endAddress = await this.page.locator(`p:has-text("${routeData.endaddress}")`).textContent();

        const nameMatch = routeName?.trim() === routeData.routeName?.trim();
        const startPointMatch = startPoint?.trim() === routeData.startLocation?.trim();
        const endPointMatch = endPoint?.trim() === routeData.endLocation?.trim();
        const startAddressMatch = startAddress?.trim() === routeData.startaddress?.trim();
        const endAddressMatch = endAddress?.trim() === routeData.endaddress?.trim();

        return nameMatch && startPointMatch && endPointMatch && startAddressMatch && endAddressMatch;
    }

    async openFilterDialog(){
        await this.filterUtils.openFilterDialog();
    }

    async selectNoOfStopsFilter(value:string){
        await this.filterUtils.selectRadioFilter("No of Stops",value);

    }

    async selectTotalDistanceFilter(value:string){
        await this.filterUtils.selectRadioFilter("Total Distance",value);
    }

    async selectTotalDurationFilter(value:string){
        await this.filterUtils.selectRadioFilter("Total Duration",value);
    }

    async selectCreatedByFilter(value:string){
        await this.filterUtils.selectDropdownFilter("Created By",value);
    }

    async clickApplyFilters(){
        await this.filterUtils.applyFilters();}

    async clickClearAllFilters(){
        await this.filterUtils.clearAllFilters();
    }

    async closeFilterDialog(){
        await this.filterUtils.closeFilterDialog();}

    async haveActiveFilters(): Promise<boolean> {
        return await this.filterUtils.hasActiveFilters();
    }

    async isFilterReset(filtername:string):Promise<boolean>{
        return await this.filterUtils.isFilterReset(filtername);
    }

async clickApplyFilter() {
    await this.filterUtils.applyFilters();
  }



  async openSortDropdown() {
    await this.page.locator('button[data-testid="routes-main-sort-dropdown"]').click();
  }
  async closeSortDropdown(){
     await this.page.locator('button[data-testid="routes-main-sort-dropdown"]').click();
  }

  async getSortOptions(): Promise<string[]> {
    return await this.sortUtils.getSortOptions();
  }

  async selectSortOption(sortOption: string) {
    switch(sortOption){
        case "Oldest":
             this.page.locator('span:has-text("Oldest")').click();
             break;
        case "Shortest Distance":
             this.page.locator('button[data-testid="routes-main-sort-option-shortest"]').click();
             break;
        case "Longest Distance":
             this.page.locator('button[data-testid="routes-main-sort-option-longest"]').click();
             break;
        case "Most Stops":
             this.page.locator('button[data-testid="routes-main-sort-option-most-stops"]').click();
             break;
        case "Fewest Stops":
             this.page.locator('button[data-testid="routes-main-sort-option-fewest-stops"]').click();
             break;
        default:
            console.log("Unknown sort option");
    }
  }

  async getSortIndicator(): Promise<string | null> {
    return await this.sortUtils.getSortIndicator();
  }

  async verifySortApplied(sortOption: string): Promise<boolean> {
    return await this.sortUtils.isSortApplied(sortOption);
  }

  async verifyRoutesSortedBy(sortOption: "Newest"|"Oldest" | "Shortest Distance" |"Longest Distance"| "Fewest Stops" | "Most Stops" | "id" =
        "id",apiResponse:any): Promise<boolean> {
    const routeCards=await this.page.locator('[data-testid="routes-main-route-card"]').all();
    const apiAssert=new ApiAssertUtils(this.page);
   return await apiAssert.assertRoutesMatchApi(routeCards,apiResponse,sortOption);
    

  }

  async verifyFilteredResults(filterCriteria: FilterCriteria,filterApiData:any): Promise<boolean> {
    // Get all route cards
    const routeCards = await this.page.locator('[data-testid="routes-main-route-card"]').all();
    // console.log(`${routeCards.length},${filterApiData.count} route card(s) found on the page.`);
    
    if (routeCards.length === 0) {
      if(filterApiData.count=="0"){
        console.log(`${filterApiData.count} routes found in api.`);
        console.log('No route cards displayed as expected for applied filters.');
      return true;}
    }

    console.log(`Found ${routeCards.length} route card(s). Verifying against filters...`);

    for (let i = 0; i < routeCards.length; i++) {
      const card = routeCards[i];
      
      // Extract points count (e.g., "3 points")
      const pointsText = await card.locator('span:has-text("Points")').textContent();
      const pointsMatch = pointsText?.match(/(\d+)\s+points/);
      const noOfPoints = pointsMatch ? parseInt(pointsMatch[1]) : 0;
      console.log(`Card ${i + 1}: ${noOfPoints} points`);

      // Extract distance (e.g., "8555.07Km")
      const statsText = await card.locator('.text-sm.text-\\[var\\(--text-muted\\)\\]').nth(0).textContent();
      const distanceMatch = statsText?.match(/(\d+(?:\.\d+)?)\s*Km/);
      const distance = distanceMatch ? parseFloat(distanceMatch[1]) : 0;
      console.log(`Card ${i + 1}: ${distance} Km`);

      // Extract duration (e.g., "112hr 5m (est)")
      const durationMatch = statsText?.match(/(\d+)hr\s+(\d+)m/);
      const durationHours = durationMatch ? parseInt(durationMatch[1]) : 0;
      console.log(`Card ${i + 1}: ${durationHours} hr`);

      // Extract created by (e.g., "Created by Test")
      const createdByBadge = await card.locator('span:has-text("Created by")').textContent();
      const createdByMatch = createdByBadge?.match(/Created by (.+)/);
      const createdBy = createdByMatch ? createdByMatch[1].trim() : '';
      console.log(`Card ${i + 1}: Created by ${createdBy}`);

      // Verify each filter criteria
      let cardMatchesFilters = true;

      // Check No of Stops
      if (filterCriteria.noOfStops) {
        const matches = this.verifyNoOfStopsFilter(noOfPoints, filterCriteria.noOfStops);
        if (!matches) {
          console.log(`Card ${i + 1}: No of Stops filter mismatch. Expected: ${filterCriteria.noOfStops}, Got: ${noOfPoints} points`);
          cardMatchesFilters = false;
        }
      }

      // Check Total Distance
      if (filterCriteria.totalDistance) {
        const matches = this.verifyTotalDistanceFilter(distance, filterCriteria.totalDistance);
        if (!matches) {
          console.log(`Card ${i + 1}: Total Distance filter mismatch. Expected: ${filterCriteria.totalDistance}, Got: ${distance}Km`);
          cardMatchesFilters = false;
        }
      }

      // Check Total Duration
      if (filterCriteria.totalDuration) {
        const matches = this.verifyTotalDurationFilter(durationHours, filterCriteria.totalDuration);
        if (!matches) {
          console.log(`Card ${i + 1}: Total Duration filter mismatch. Expected: ${filterCriteria.totalDuration}, Got: ${durationHours}hr`);
          cardMatchesFilters = false;
        }
      }

      // Check Created By
      if (filterCriteria.createdBy) {
        if (createdBy !== filterCriteria.createdBy) {
          console.log(`Card ${i + 1}: Created By filter mismatch. Expected: ${filterCriteria.createdBy}, Got: ${createdBy}`);
          cardMatchesFilters = false;
        }
      }

      if (!cardMatchesFilters) {
        return false;
      }
      
      console.log(`✓ Card ${i + 1} matches all filters`);
    }

    console.log('All route cards match the applied filters');
    return true;
  }

  private verifyNoOfStopsFilter(actualPoints: number, filterValue: string): boolean {
    switch (filterValue) {
      case '2-5':
        return actualPoints >= 2 && actualPoints <= 5;
      case '6-10':
        return actualPoints >= 6 && actualPoints <= 10;
      case '10+':
        return actualPoints > 10;
      default:
        return false;
    }
  }

  private verifyTotalDistanceFilter(actualDistance: number, filterValue: string): boolean {
    switch (filterValue) {
      case '<50 km':
        return actualDistance < 50;
      case '50-200 km':
        return actualDistance >= 50 && actualDistance <= 200;
      case '200+ km':
        return actualDistance > 200;
      default:
        return false;
    }
  }

  private verifyTotalDurationFilter(actualHours: number, filterValue: string): boolean {
    switch (filterValue) {
      case '<1h':
        return actualHours < 1;
      case '1-4h':
        return actualHours >= 1 && actualHours <= 4;
      case '4-8h':
        return actualHours >= 4 && actualHours <= 8;
      case '8h+':
        return actualHours > 8;
      default:
        return false;
    }
  }
 


};