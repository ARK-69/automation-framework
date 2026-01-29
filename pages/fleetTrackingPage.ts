import { Page } from "playwright";
import { DropdownUtils } from "../utils/dropdownUtils";
import { createFileUploadUtils } from "../utils/fileUploadUtils";
import { createDatePickerUtils } from "../utils/datePickerUtils";
import { FilterUtils } from "../utils/filterUtils";
import { SortUtils } from "../utils/sortUtils";
import { ApiAssertUtils } from "../utils/apiAssertUtils";

export interface FilterCriteria {
    fleetGroup?: string; 
    Status?: string; 
    
}

export class FleetTrackingPage {
      private filterUtils: FilterUtils;
    private sortUtils: SortUtils;
    constructor(private page: Page) {
        this.filterUtils = new FilterUtils(this.page);
        this.sortUtils = new SortUtils(this.page);
    }
       async getTitle(){
        return await this.page.locator("h1, .page-title").textContent(); 
    }
    async searchRoute(routeName:string){
        await this.page.fill('input[placeholder="Search"]', routeName);
        await this.page.waitForTimeout(2000);
    }

    async applyFleetGroupFilter(fleetGroup: string) {
        
    }
    async applyStatusFilter(status: string) {}
    async switchToHistoryTab() {}
    async applyVehicleFilter(vehicleId: string) {}
    async applyDateFilter(startDate: string) {}
    async checkEmptyStateMessage(){}
};