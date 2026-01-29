import { Page } from "playwright";
import { createDropdownUtils, DropdownUtils } from "../utils/dropdownUtils";
import { createFileUploadUtils } from "../utils/fileUploadUtils";
import { createDatePickerUtils } from "../utils/datePickerUtils";
import { FilterUtils } from "../utils/filterUtils";
import { SortUtils } from "../utils/sortUtils";

export interface userData{
    fullName?:string;
    email?:string;
    phoneNumber?:string;
    role?:"Driver"|"Fleet Admin"|"Fleet Manager"|"Organization Admin"|"Security Admin"}

export interface roleData{
    roleName?:string;
    roleDescription?:string;
    permissions?:string[];
}

export class UserAndRolesPage {
    private filterUtils: FilterUtils;
    private sortUtils: SortUtils;
    constructor(private page: Page) {
        this.filterUtils = new FilterUtils(this.page);
        this.sortUtils = new SortUtils(this.page);
       
    }
    async getTitle(){
        return await this.page.locator("h1, .page-title").textContent(); 
    }
    async clickInviteUser(){
        await this.page.click('button:has-text("Invite User")');

    }

       async verifyTripAddToastMessage(message:string):Promise<boolean>{
        const toastLocator=await this.page.locator(`li:has-text("${message}")`);
        if (toastLocator){
            return true;
        }
        return false;
    }

    async fillUserData(userData:userData){
        const dropdownUtils=new DropdownUtils(this.page); 

         await this.page.waitForSelector('p:has-text("Invite new user"),h2:has-text("Edit Trip")');
         await this.page.waitForTimeout(1000);

           if (userData.fullName){
            await this.page.fill('input[placeholder="Enter full name"]',userData.fullName||"");
         }
        if (userData.email){
            await this.page.fill('input[placeholder="Enter email address"]',userData.email);
        }
        
            await this.page.fill('input[type="tel"]',userData.phoneNumber||"");
        
        if (userData.role){
             await this.page.getByRole('button', { name: 'Select Role(s)' }).click();
            await this.page.getByText('Fleet AdminSystem').click();
        }
 
    }
    async submitUserForm(){
        await this.page.click('button:has-text("Send Invite"),button:has-text("Save Changes")');
    }

     async searchUser(name: string) {
    await this.page.locator('input[placeholder="Search"]').fill(name);
    await this.page.waitForTimeout(2000);
  }

  async isUserInTable(name: string) {
    await this.page.waitForTimeout(4000);
    const rows = this.page.locator(`tr:has-text("${name}")`);
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      if (await rows.nth(i).isVisible()) {
        return true;
      }
    }
    return false;
  }
   async getNoUsersMessage() {
    return await this.page.locator("text=No users found").textContent();
  }

 
  async clickEditUser(name: string) {
   

    const row = this.page.locator(`tr:has-text("${name}"):visible`).first();
const editButton = row.locator("button").first();

    await editButton.click();
    await this.page.waitForTimeout(3000);
  }

  async updateUserFullName(name: string) {
    await this.page.locator('input[placeholder="Enter full name"]').fill(name);
  }

  async saveEdit() {
    await this.page.click('button:has-text("Save Changes")');
    await this.page.waitForTimeout(1500);
  }

    async clickDeleteUser(name: string) {
    await this.searchUser(name);
    await this.page.waitForTimeout(500);

    const row = this.page.locator(`tr:has-text("${name}"):visible`).first();
    const deleteButton = row.locator("button").nth(2);

    await deleteButton.click();
    await this.page.waitForTimeout(500);
  }
  async confirmDelete() {
    await this.page.click('button:has-text("Delete Invite")');
    await this.page.waitForTimeout(1500);
  }
  async getNotification() {
    await this.page.waitForTimeout(2000);

    const notification = this.page
      .locator("text=/successfully|updated|deleted|created|added/i")
      .first();

    return await notification.textContent();
  }

   async openFilterDialog() {
    await this.filterUtils.openFilterDialog();
  }

    async selectRoleFilter(value: string) {
         const dropdownUtils = new DropdownUtils(this.page);
        await this.filterUtils.selectDropdownFilter("Role", value);

    }
async selectStatusFilter(value: string) {
    await this.filterUtils.selectCheckboxFilter("Status", value);
}

  async clickClearAllFilters() {
    await this.filterUtils.clearAllFilters();
  }

    async hasActiveFilters(): Promise<boolean> {
    return this.filterUtils.hasActiveFilters();
  }

  async isFilterReset(filterLabel: string): Promise<boolean> {
    return this.filterUtils.isFilterReset(filterLabel);
  }
  async applyFilters() {
    await this.filterUtils.applyFilters();
  }

    async verifyFilteredResults(filterCriteria: {
    role?: string;
    status?: string;
    
  }): Promise<boolean> {
    await this.page.waitForTimeout(1500);
    const rows = this.page
      .locator("tbody tr")
      .filter({ hasNot: this.page.locator(':has-text("No users")') });
    const count = await rows.count();
    if (count === 0) {
      return this.page.locator("text=No users found").isVisible();
    }
    for (let i = 0; i < Math.min(count, 10); i++) {
      const row = rows.nth(i);
      const text = (await row.textContent())?.toLowerCase() ?? "";
      if (
        filterCriteria.role &&
        !text.includes(filterCriteria.role.toLowerCase())
      )
        return false;
      if (
        filterCriteria.status &&
        !text.includes(filterCriteria.status.toLowerCase())
      )
        return false;
    
        return false;
    }
    return true;
  }

    async openSortDropdown() {
    await this.sortUtils.openSortDropdown();
  }

  async getSortOptions(): Promise<string[]> {
    return this.sortUtils.getSortOptions();
  }

  async selectSortOption(sortOption: string) {
    await this.sortUtils.selectSortOption(sortOption);
  }

  async getSortIndicator(): Promise<string | null> {
    return this.sortUtils.getSortIndicator();
  }

  async verifySortApplied(sortOption: string): Promise<boolean> {
    return this.sortUtils.verifySort(sortOption);
  }

  async 

  async verifyDriversSorted(
    sortOption: string,
    columnIndex: number
  ): Promise<boolean> {
    return this.sortUtils.verifySortOrder(sortOption, columnIndex);
  }
 async getVisibleRows(): Promise<
    {
      index?: string;
      driverName?: string;
      vehicle?: string;
      isPrimaryDriver?: boolean;
      behaviorScore?: number | null;
      authorizationStatus?: string;
    }[]
  > {
    await this.page.waitForTimeout(1500);

    const tableRows = this.page
      .locator('tbody tr, [role="row"]:not([role="columnheader"])')
      .filter({ hasNot: this.page.locator(':has-text("No drivers found")') });

    const rowCount = await tableRows.count();
    const rowsData: {
      index?: string;
      role?: string;
      status?: string;
 
    }[] = [];

    for (let i = 0; i < rowCount; i++) {
      const row = tableRows.nth(i);
      const cells = row.locator("td");
      const cellCount = await cells.count();
      const texts: string[] = [];

      for (let j = 0; j < cellCount; j++) {
        const text = (await cells.nth(j).textContent())?.trim() ?? "";
        texts.push(text);
      }

      const rowData = {
        index: texts[0],
        driverName: texts[1],
        vehicle: texts[2] || "-",
        isPrimaryDriver: /yes/i.test(texts[3]),
        behaviorScore:
          texts[4] === "-" || texts[4] === "" ? null : parseFloat(texts[4]),
        authorizationStatus: texts[5] || "",
      };

      rowsData.push(rowData);
    }

    console.log(
      " Extracted Driver Table Rows (first 5):",
      JSON.stringify(rowsData.slice(0, 5), null, 2)
    );

    return rowsData;
  }
async clickUserPageTabs(tabname:string){
    if(tabname==="Users"){
        await this.page.locator('span[data-testid="routes-main-tabs-count"]').first().click();
    }
    else{
        await this.page.locator('span[data-testid="routes-main-tabs-count"]').last().click();
    }
    
}
    async isUsersTableDisplayed():Promise<boolean>{
        await this.page.waitForTimeout(2000);
        return await this.page.locator('div[data-slot="table-container"]').isVisible();
    }
    async isInviteButtonVisible():Promise<boolean>{
        return await this.page.locator('button:has-text("Invite User")').isVisible();   
    }

    async isSearchVisible():Promise<boolean>{
        return await this.page.locator('input[placeholder="Search"]').isVisible();
    }
    async isFilterVisible():Promise<boolean>{
        return await this.page.locator('button:has-text("Filter")').isVisible();
    }
    async isSortVisible():Promise<boolean>{ 
        return await this.page.locator('button:has-text("Sort")').isVisible();
    }

    async clickResendInvite(name:string){
         await this.searchUser(name);
    await this.page.waitForTimeout(500);

    const row = this.page.locator(`tr:has-text("${name}"):visible`).first();
    const editButton = row.locator("button").nth(1);

    await editButton.click();
    await this.page.waitForTimeout(3000);


    }

    async confirmInvite(){
        await this.page.click('button:has-text("Resend")');
    }
    async clearFilterButtonVisible():Promise<boolean>{
        return await this.page.locator('button:has-text("Clear all filters")').isVisible();}

    async isSendInviteButtonDisabled():Promise<boolean>{
        return await this.page.locator('button:has-text("Send Invite")').isDisabled();
    }

    }   