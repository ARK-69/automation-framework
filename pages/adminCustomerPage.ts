import { Page } from "playwright";
import { DropdownUtils } from "../utils/dropdownUtils";
import { createFileUploadUtils } from "../utils/fileUploadUtils";
import { FilterUtils } from "../utils/filterUtils";
import { createDatePickerUtils } from "../utils/datePickerUtils";

import { SortUtils } from "../utils/sortUtils";

export interface CustomerFormData {
    customerName?: string    ;
    adminEmail?: string;
    adminName?: string;
    adminPhoneNumber?: string;
    country?: string;
    industry?: string;
    businessType?: string;
    address?:string;
    licenseType?:string;
    maxUsers?:number;
    maxVehicles?:number;
    featureAccess?: string[];
    setDefault: boolean;
    customerLogoPath?: string;
    faviconPath?: string;
    primaryColor?: string;
    secondaryColor?: string;
    subdomain?:string
}

export class AdminCustomerPage {

private filterUtils: FilterUtils;
  private sortUtils: SortUtils;
  constructor(private page: Page) {
    this.filterUtils = new FilterUtils(page);
    this.sortUtils = new SortUtils(page);
  }

    async getpageTitle(){
        return this.page.locator('h1').textContent();
    }
    async clickAddCustomer(){
        await this.page.locator('button:has-text("Add Customer")').click();
    }
    async fillCustomerForm(data: CustomerFormData){
        const dropdownUtils = new DropdownUtils(this.page);
        const uploadUtils = createFileUploadUtils(this.page);
        const filterutils= new FilterUtils(this.page);

      
        
        await this.page.fill("#companyName",data.customerName||"");
        await this.page.fill("#adminEmail",data.adminEmail||"");
        await this.page.fill("#adminName",data.adminName||"");
        await this.page.fill("#adminPhoneNumber",data.adminPhoneNumber||"");

        await dropdownUtils.selectDropdownOption("Country", 
            data.country ?? "United States");
        await dropdownUtils.selectDropdownOption("Industry",
            data.industry ?? "Transportation");
        await dropdownUtils.selectDropdownOption("Business Type",
            data.businessType ?? "Startup");
        
        await this.page.fill("#address",data.address ?? "123 Main St, Anytown, USA");

       await this.page.getByText(`${data.licenseType}`).click();
        await this.page.fill('input[name=maxUsers]', data.maxUsers?.toString() ?? "50");
        await this.page.fill('input[name=maxVehicles]', data.maxVehicles?.toString() ?? "100");
        
        for (const feature of data.featureAccess ?? ["Vehicle Tracking", "Route Planning", "Reporting", "Maintenance", "Fuel & Engine", "SOS Alerts", "Car Sharing", "Dashboard"]) {
            
            await this.page.getByText(`${feature}`).locator('..').locator('button[role="switch"]').click();
        }
          if (data.setDefault) {
            await this.page.locator('input[type="checkbox"][name="setAsDefault"]').check();
        }
        if (data.customerLogoPath) {
            await uploadUtils.uploadFile('customerLogo-upload', data.customerLogoPath);
        }
        if (data.faviconPath) {
            await uploadUtils.uploadFile('favicon-upload', data.faviconPath);
        }
        if (data.primaryColor) {
            await this.setPrimaryColor( data.primaryColor);
        }
        if (data.secondaryColor) {
            await this.setSecondaryColor( data.secondaryColor);
        }
        await this.page.fill("input[name=subdomain]",data.subdomain|| "customer");
    }

     async submitCustomerForm() {
    await this.page.click('button:has-text("Create Customer")');
    await this.page.waitForTimeout(2000);
  }
    async searchCustomer(customerName: string) {
    await this.page.locator('input[placeholder="Search"]').fill(customerName);
    await this.page.waitForTimeout(2000);
  }
  async getNotification() {
    await this.page.waitForTimeout(2000);
    const notification = this.page
      .locator("text=/successfully|updated|deleted|created|added/i")
      .first();
    return await notification.textContent();
  }
   async isinCustomerTable(customerName: string) {
    await this.page.waitForTimeout(4000);
    return await this.page.locator(`tr:has-text("${customerName}")`).isVisible();
  }
  async setPrimaryColor(primaryColor: string) {
    const primaryColorInput = this.page.locator('input[name="primaryColor"]');
    await primaryColorInput.waitFor({ state: "visible", timeout: 10000 });
    await primaryColorInput.click();
    const primaryColorInputForm = this.page.locator(
      'input[id="rc-editable-input-1"]'
    );
    await primaryColorInputForm.waitFor({ state: "visible", timeout: 10000 });
    await primaryColorInputForm.fill(primaryColor.replace("#", ""));
  }
  async setSecondaryColor(secondaryColor: string) {
    const secondaryColorInput = this.page.locator(
      'input[name="secondaryColor"]'
    );
    await secondaryColorInput.waitFor({ state: "visible", timeout: 30000 });
    await secondaryColorInput.click();
    await secondaryColorInput.click();
    const secondaryColorInputForm = this.page.locator(
      'input[id="rc-editable-input-6"]'
    );
    await secondaryColorInputForm.waitFor({ state: "visible", timeout: 30000 });
    await secondaryColorInputForm.fill(secondaryColor.replace("#", ""));
  }
  async getNoCustomerMessage(){
    return await this.page.locator("text=No customers found").textContent();
  }
   async isCustomerModalVisible() {
    const customerHeader = this.page.locator("h1", {
      hasText: "View Customer Details",
    });
    await customerHeader.waitFor({ state: "visible", timeout: 5000 });
    return await customerHeader.isVisible();
  }

  async verifyCustomerDetailsPresent(details:{customerName:string,adminEmail:string})
{
 const modal = await this.waitForCustomerDetailsModal();
    const modalContainer = modal.locator("..").locator("..").locator("..");
////*[@id="root"]/div/div[2]/main/div/div[2]/div[1]
////*[@id="root"]/div/div[2]/main/div/div[2]/div[1]/div[2]
//*[@id="root"]/div/div[2]/main/div/div[2]/div[1]/div[1]/div/h3
    
    await modalContainer.waitFor({ state: "visible", timeout: 5000 });
    const modalText = await modalContainer.textContent();
    if (!modalText) throw new Error("Modal text content not found");
    const text = modalText.toLowerCase();
    console.log(` Modal text content: ${modalText}`);
    const customerNameFound = text.includes(details.customerName.toLowerCase());
    const adminEmailFound = text.includes(details.adminEmail.toLowerCase());
    if (!customerNameFound || !adminEmailFound) {
      throw new Error(
        `Expected details not found in modal.\n` +
          `Found text: ${modalText}\n` +
          `Expected customerName: ${details.customerName}, adminEmail: ${details.adminEmail}`
      );
    }
    console.log(`  Verified Customer modal shows correct customerName and adminEmail.`);
}

  async waitForCustomerDetailsModal() {
    const modal = this.page.locator('h3:has-text("Customer information")');
    await modal.waitFor({ state: "visible", timeout: 10000 });
    return modal;
  }
   async updateCustomerAdminEmail(adminEmail: string) {
    await this.page.locator('input[name="adminEmail"]').fill(adminEmail);
  }
  async saveEdit() {
    await this.page.click('button:has-text("Update Customer")');
    await this.page.waitForTimeout(1500);
  }
  async clickDeleteCustomer(customerName:string){
    await this.searchCustomer(customerName)
    await this.page.waitForTimeout(500);
    const row = this.page.locator(`tr:has-text("${customerName}"):visible`).first();
    const deleteButton = row.locator("button").nth(2);
    await deleteButton.click();
    await this.page.waitForTimeout(500);
  }
   async confirmDelete() {
       await this.page.waitForTimeout(3000);
    await this.page.fill('input[placeholder="DELETE"]', "DELETE");
    await this.page.click('button:has-text("Delete Permanently")');
    await this.page.waitForTimeout(1500);
  }
    async clickEditCustomer(customerName: string) {
    await this.searchCustomer(customerName);
    await this.page.waitForTimeout(500);
    const row = this.page.locator(`tr:has-text("${customerName}"):visible`).first();
    const editButton = row.locator("button").nth(1);
    await editButton.click();
    await this.page.waitForTimeout(3000);
  }

    async clickViewCustomer(customerName: string) {
    await this.searchCustomer(customerName);
    await this.page.waitForTimeout(500);
    const row = this.page.locator(`tr:has-text("${customerName}"):visible`).first();
    const viewButton = row.locator("button").first();
    await viewButton.click();
    await this.page.waitForTimeout(500);
  }
  async submitEmptyCustomerForm(licenseType:string)
{
    await this.page.getByText(`${licenseType}`).click();
    await this.page.waitForTimeout(5000);
    await this.submitCustomerForm();
}
  async validRequiredFieldErrors(){

    const errorMessages=[
    "Company name is required",
    "Admin email is required",
    "Admin name is required",
    "Subdomain is required"
    ]
    for (const msg of errorMessages){  
        const errorLocator=this.page.locator(`text=${msg}`);
        
        const isVisible= await errorLocator.isVisible();
        if (!isVisible){
            return false;
        }
    }
    return true;
  }

  async openFilterDialog(){
     await this.filterUtils.openFilterDialog();
  }

  async selectDeploymentTypeFilter(value: "SaaS" | "On-Premise"){
    await this.filterUtils.selectCheckboxFilter("Deployment Type",value);
  }

  
   async clickApplyFilter() {
    await this.filterUtils.applyFilters();
  }
   async waitForCustomersApiResponse(): Promise<any> {
    const response = await this.page.waitForResponse(
      (resp) => {
        return (
          resp.url().includes("/core/api/v1/organizations") &&
          resp.request().method() === "GET" &&
          resp.ok()
        );
      },
      { timeout: 30000 }
    );

    return await response.json();
  }
    async clickClearAllFilters() {
    await this.filterUtils.clearAllFilters();
  }

  async getVisibleRows() {
  await this.page.waitForTimeout(1500);

    const tableRows = this.page
      .locator('tbody tr')
      

    const rowCount = await tableRows.count();
    const rowsData: {
        customerName?: string;
        adminName?: string;
    }[] = [];

    for (let i = 0; i < rowCount; i++) {
      const row = tableRows.nth(i);
     
      
      const texts: string[] = [];
//*[@id="root"]/div/div[2]/main/div/div[3]/div/div/div/table/tbody/tr[1]
//*[@id="root"]/div/div[2]/main/div/div[3]/div/div/div/table/tbody/tr[1]/td[3]/div/span[1]
//*[@id="root"]/div/div[2]/main/div/div[3]/div/div/div/table/tbody/tr[1]/td[2]/div/div/span[1]
      
        const customertext = (await row.locator('xpath=./td[2]/div/div/span[1]').textContent())?.trim() ?? "";
        const admintext = (await row.locator('xpath=./td[3]/div/span[1]').textContent())?.trim() ?? "";
      

      const rowData = {
        
        customerName: customertext??"",
        adminName: admintext?? "-",
       
      };

      rowsData.push(rowData);
    }

    console.log(
      " Extracted Customer Table Rows (first 5):",
      JSON.stringify(rowsData.slice(0, 5), null, 2)
    );


    return rowsData;
  }
    async hasActiveFilters(): Promise<boolean> {
    return await this.filterUtils.hasActiveFilters();
  }
  async verifyAllcustomerDisplayed (){
   
    await this.page.waitForTimeout(1500);
    const noCustomersMessage = await this.page
      .locator("text=/No customers found /i")
      .isVisible();
    return !noCustomersMessage;
  
  }

    async isFilterReset(filterName: string): Promise<boolean> {
    return await this.filterUtils.isFilterReset(filterName);
  }
   async openSortDropdown() {
    await this.sortUtils.openSortDropdown();
  }
   async getSortOptions(): Promise<string[]> {
    return await this.sortUtils.getSortOptions();
  }

  async selectSortOption(sortOption: string) {
    await this.sortUtils.selectSortOption(sortOption);
  }

  async getSortIndicator(): Promise<string | null> {
    return await this.sortUtils.getSortIndicator();
  }
  async verifySortApplied(sortOption: string): Promise<boolean> {
    return await this.sortUtils.isSortApplied(sortOption);
  }

}