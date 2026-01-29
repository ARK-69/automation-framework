import { Page } from "playwright";

export class DatePickerUtils {
  constructor(private page: Page) {}

  async setDateByLabel(labelText: string, date: string): Promise<void> {
    try {
      const [year, month, day] = date.split("-");
      const dayNumber = parseInt(day);
      const monthNumber = parseInt(month);

      console.log(
        ` Setting date: Day ${dayNumber}, Month ${monthNumber}, Year ${year} for "${labelText}"`
      );

      const label = this.page.locator(`label:has-text("${labelText}")`);
      console.log(`Label found: ${await label.count()}`);

      if ((await label.count()) === 0) {
        throw new Error(`Label "${labelText}" not found`);
      }

      const container = label.locator("..");

      const dateButton = container
        .locator('button[aria-haspopup="dialog"]')
        .first();
      console.log(`Date button found: ${await dateButton.count()}`);

      if ((await dateButton.count()) === 0) {
        throw new Error(
          `Date picker button not found for label "${labelText}"`
        );
      }

      console.log(`Opening calendar...`);
      await dateButton.click();

      await this.page.waitForTimeout(1000);

      let calendarFound = false;
      try {
        await this.page.waitForSelector(
          '[role="dialog"], [role="grid"], button[class*="rdp"]',
          { timeout: 3000 }
        );
        calendarFound = true;
      } catch {
        console.log("Calendar not found with standard selectors");
      }

      if (!calendarFound) {
        throw new Error("Calendar popup did not appear");
      }

      console.log(" Calendar opened");
      await this.page.waitForTimeout(500);

      await this.navigateToMonth(monthNumber, year);

      console.log(`Clicking date ${dayNumber}...`);
      const formattedDataDay = `${monthNumber}/${dayNumber}/${year}`;
      console.log(`Looking for button with data-day="${formattedDataDay}"`);

      const dateCell = this.page.locator(
        `button[data-day="${formattedDataDay}"]`
      );

      if ((await dateCell.count()) === 0) {
        throw new Error(`Could not find date cell for ${formattedDataDay}`);
      }

      console.log(`Found date button, clicking...`);
      await dateCell.click();
      await this.page.waitForTimeout(500);
      console.log(` Date set successfully`);
    } catch (error) {
      console.error(` Error setting date: ${error}`);
      throw error;
    }
  }

async scheduleDatePicker(time:string,date:string,labelText:string){
  try{
  const [year, month, day] = date.split("-");
    const dayNumber = parseInt(day);
    const monthNumber = parseInt(month);
    console.log(
      ` Setting date: Day ${dayNumber}, Month ${monthNumber}, Year ${year} and Time ${time}`
    );
    const label= this.page.locator(`label:has-text("${labelText}")`);
    console.log(`Label found: ${await label.count()}`);

    if ((await label.count()) === 0) {
      throw new Error(`Label "${labelText}" not found`);
    }
    const container = label.locator("..");

    const dateButton = container
      .locator('button[aria-haspopup="dialog"]')
      .first();
    console.log(`Date button found: ${await dateButton.count()}`);  
    if ((await dateButton.count()) === 0) {
      throw new Error(
        `Date picker button not found for label "${labelText}"`
      );
    }
    console.log(`Opening calendar...`);
    await dateButton.click();


    await this.page.waitForTimeout(1000);
    await this.navigateToMonth(monthNumber, year);
    console.log(`Clicking date ${dayNumber}...`);

}
    catch(error){
      console.error(` Error setting date: ${error}`);
      throw error;
    }


}



  async setDateByP(labelText: string, date: string): Promise<void> {
    try {
      const [year, month, day] = date.split("-");
      const dayNumber = parseInt(day);
      const monthNumber = parseInt(month);

      console.log(
        ` Setting date: Day ${dayNumber}, Month ${monthNumber}, Year ${year} for "${labelText}"`
      );

      const label = this.page.locator(
        `label:has(p:has-text("Policy Expiry Date"))`
      );
      console.log(`Label found: ${await label.count()}`);

      if ((await label.count()) === 0) {
        throw new Error(`Label "${labelText}" not found`);
      }

      const container = label.locator("..");

      const dateButton = container
        .locator('button[aria-haspopup="dialog"]')
        .first();
      console.log(`Date button found: ${await dateButton.count()}`);

      if ((await dateButton.count()) === 0) {
        throw new Error(
          `Date picker button not found for label "${labelText}"`
        );
      }

      console.log(`Opening calendar...`);
      await dateButton.click();

      await this.page.waitForTimeout(1000);

      let calendarFound = false;
      try {
        await this.page.waitForSelector(
          '[role="dialog"], [role="grid"], button[class*="rdp"]',
          { timeout: 3000 }
        );
        calendarFound = true;
      } catch {
        console.log("Calendar not found with standard selectors");
      }

      if (!calendarFound) {
        throw new Error("Calendar popup did not appear");
      }

      console.log(" Calendar opened");
      await this.page.waitForTimeout(500);

      await this.navigateToMonth(monthNumber, year);

      console.log(`Clicking date ${dayNumber}...`);
      const formattedDataDay = `${monthNumber}/${dayNumber}/${year}`;
      console.log(`Looking for button with data-day="${formattedDataDay}"`);

      const dateCell = this.page.locator(
        `button[data-day="${formattedDataDay}"]`
      );

      if ((await dateCell.count()) === 0) {
        throw new Error(`Could not find date cell for ${formattedDataDay}`);
      }

      console.log(`Found date button, clicking...`);
      await dateCell.click();
      await this.page.waitForTimeout(500);
      console.log(` Date set successfully`);
    } catch (error) {
      console.error(`Error setting date: ${error}`);
      throw error;
    }
  }
  async setDateByDiv(
    divText: string,
    labelText: string,
    date: string
  ): Promise<void> {
    try {
      const [year, month, day] = date.split("-");
      const dayNumber = parseInt(day);
      const monthNumber = parseInt(month);

      console.log(
        `Setting date: Day ${dayNumber}, Month ${monthNumber}, Year ${year} for "${labelText}"`
      );

      const label = this.page
        .locator(`h3:has-text("${divText}")`)
        .locator("..")
        .locator(`label:has-text("${labelText}")`);
      console.log(`Label found: ${await label.count()}`);

      if ((await label.count()) === 0) {
        throw new Error(`Label "${labelText}" not found`);
      }

      const container = label.locator("..");

      const dateButton = container
        .locator('button[aria-haspopup="dialog"]')
        .first();
      console.log(`Date button found: ${await dateButton.count()}`);

      if ((await dateButton.count()) === 0) {
        throw new Error(
          `Date picker button not found for label "${labelText}"`
        );
      }

      console.log(`Opening calendar...`);
      await dateButton.click();

      await this.page.waitForTimeout(1000);

      let calendarFound = false;
      try {
        await this.page.waitForSelector(
          '[role="dialog"], [role="grid"], button[class*="rdp"]',
          { timeout: 3000 }
        );
        calendarFound = true;
      } catch {
        console.log("Calendar not found with standard selectors");
      }

      if (!calendarFound) {
        throw new Error("Calendar popup did not appear");
      }

      console.log(" Calendar opened");
      await this.page.waitForTimeout(500);

      await this.navigateToMonth(monthNumber, year);

      console.log(`Clicking date ${dayNumber}...`);
      const formattedDataDay = `${monthNumber}/${dayNumber}/${year}`;
      console.log(`Looking for button with data-day="${formattedDataDay}"`);

      const dateCell = this.page.locator(
        `button[data-day="${formattedDataDay}"]`
      );

      if ((await dateCell.count()) === 0) {
        throw new Error(`Could not find date cell for ${formattedDataDay}`);
      }

      console.log(`Found date button, clicking...`);
      await dateCell.click();
      await this.page.waitForTimeout(500);
      console.log(` Date set successfully`);
    } catch (error) {
      console.error(`Error setting date: ${error}`);
      throw error;
    }
  }

  async dateByType(date:string,type:string){
    const [year, month, day] = date.split("-");
    date = `${day}/${month}/${year}`;
   const dateFillBox=await this.page.locator(`label:has-text("${type}")`).locator("..").locator('input[id="date"]');
    await dateFillBox.fill(date);
  }

  private async navigateToMonth(
    targetMonth: number,
    targetYear: string
  ): Promise<void> {
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
        arrow = this.page.locator('button[aria-label="Go to the Next Month"]');
      } else {
        arrow = this.page.locator(
          'button[aria-label="Go to the Previous Month"]'
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

  /**
   * Determine if we should move forward or backward in calendar
   */
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

  /**
   * Get the current selected date
   */
  async getSelectedDate(labelText: string): Promise<string | null> {
    const label = this.page.locator(`label:has-text("${labelText}")`);
    const container = label.locator("..");
    const dateButton = container
      .locator('button[aria-haspopup="dialog"]')
      .first();
    return await dateButton.textContent();
  }
}

export function createDatePickerUtils(page: any): DatePickerUtils {
  return new DatePickerUtils(page);
}


