import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

export class ApiAssertUtils {
  constructor(private page: Page) {}

  private async waitForApiResponse(
    endpoint: string,
    queryIncludes: string,
    trigger: () => Promise<void>,
    timeout = 30000
  ): Promise<any> {
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes(endpoint) &&
          res.url().includes(queryIncludes) &&
          res.ok(),
        { timeout }
      ),
      trigger(),
    ]);

    console.log(` API captured successfully for ${endpoint}:`, response.url());
    const json = await response.json();

    return json;
  }

  async waitForDevicesApi(sortParam: string, trigger: () => Promise<void>) {
    return await this.waitForApiResponse(
      "/core/api/v1/devices",
      sortParam,
      trigger
    );
  }

  async waitForDriversApi(
    trigger: () => Promise<void>,
    queryIncludes: string = "sorts="
  ): Promise<any> {
    return await this.waitForApiResponse(
      "/core/api/v1/drivers",
      queryIncludes,
      trigger
    );
  }

  async assertDevicesTableMatchesApiResults(
    uiRows: { manufacturer?: string; model?: string; id?: number }[],
    apiResults: any[],
    sortKey: "model" | "manufacturer" | "id"
  ) {
    const uiValues = uiRows.map((r) => r[sortKey]?.toString().trim() ?? "");
    const apiValues = apiResults.map(
      (r) => r[sortKey]?.toString().trim() ?? ""
    );

    console.log(" Comparing UI vs API data");
    console.log(" Sort key:", sortKey);
    console.log(" UI values (first 10):", uiValues.slice(0, 10));
    console.log(" API values (first 10):", apiValues.slice(0, 10));
    console.log(
      "🔹 Total UI rows:",
      uiValues.length,
      "| API results:",
      apiValues.length
    );

    if (apiValues.length === 0) {
      const noDevices = await this.page
        .locator("text=/No devices|No results/i")
        .isVisible();
      expect(
        noDevices,
        "Expected no devices in UI if API returned 0 results"
      ).toBeTruthy();
      return;
    }

    const allMatch = uiValues.every((val, i) => val === apiValues[i]);
    if (!allMatch) {
      console.warn(" UI and API sort mismatch detected!");
      console.warn(" UI first 10:", uiValues.slice(0, 10));
      console.warn(" API first 10:", apiValues.slice(0, 10));
    }

    expect(allMatch, "UI and API sort mismatch detected").toBeTruthy();
  }

  async assertDriversTableMatchesApiResults(
    uiRows: {
      name?: string;
      email?: string;
      behaviorScore?: number;
      isPrimaryDriver?: boolean;
    }[],
    apiResults: {
      id: number;
      firstName: string;
      email: string;
      behaviorScore: number;
      isPrimaryDriver: boolean;
    }[],
    sortKey: "firstName" | "id" | "behaviorScore"
  ) {
    const uiValues = uiRows.map((r) => {
      if (sortKey === "firstName") return r.name?.trim().toLowerCase() ?? "";
      if (sortKey === "behaviorScore") return r.behaviorScore?.toString() ?? "";
      return "";
    });

    const apiValues = apiResults.map((r) => {
      if (sortKey === "firstName")
        return r.firstName?.trim().toLowerCase() ?? "";
      if (sortKey === "behaviorScore") return r.behaviorScore?.toString() ?? "";
      return r.id?.toString() ?? "";
    });

    console.log(" Comparing UI vs API (Drivers)");
    console.log(" Sort key:", sortKey);
    console.log(" UI:", uiValues.slice(0, 10));
    console.log("API:", apiValues.slice(0, 10));

    if (apiValues.length === 0) {
      const noDrivers = await this.page
        .locator("text=/No drivers|No results/i")
        .isVisible();
      expect(
        noDrivers,
        "Expected empty table when API returned no results"
      ).toBeTruthy();
      return;
    }

    const allMatch = uiValues.every((val, i) => val === apiValues[i]);
    if (!allMatch) {
      console.warn("UI and API mismatch detected (Drivers)");
      console.warn("UI:", uiValues.slice(0, 10));
      console.warn("API:", apiValues.slice(0, 10));
    }

    expect(
      allMatch,
      "UI and API results mismatch for Drivers table"
    ).toBeTruthy();
  }

  async waitForFleetGroupsApi(
    trigger: () => Promise<void>,
    queryIncludes: string = "filters="
  ) {
    return await this.waitForApiResponse(
      "/core/api/v1/groups",
      queryIncludes,
      trigger
    );
  }

  async assertFleetGroupsMatchApi(
    uiRows: {
      groupName?: string;
      manager?: string;
      vehicles?: number | string;
    }[],
    apiResults: any[],
    sortKey: "groupName" | "count"
  ) {
    console.log("🔹 Comparing UI vs API (Fleet Groups)");
    console.log("🔹 Sort key:", sortKey);

    if (apiResults.length === 0) {
      const emptyVisible = await this.page
        .locator("text=/No results|No groups/i")
        .isVisible();

      expect(
        emptyVisible,
        "Expected empty state ('No results found') when API returned 0 results"
      ).toBeTruthy;

      return;
    }

    const uiValues = uiRows.map((r) => {
      if (sortKey === "count") return r.vehicles?.toString() ?? "";
      return r.groupName?.trim().toLowerCase() ?? "";
    });

    const apiValues = apiResults.map((r) => {
      if (sortKey === "count") return r.count?.toString() ?? "";
      return r.groupName?.trim().toLowerCase() ?? "";
    });

    console.log("🔹 UI:", uiValues.slice(0, 10));
    console.log("🔹 API:", apiValues.slice(0, 10));

    const allMatch = uiValues.every((val, i) => val === apiValues[i]);

    if (!allMatch) {
      console.warn("UI and API mismatch detected (Fleet Groups)");
      console.warn("UI:", uiValues.slice(0, 10));
      console.warn("API:", apiValues.slice(0, 10));
    }

    expect(allMatch, "UI and API results mismatch for Fleet Groups").toBeTruthy;
  }

  async waitForVehiclesApi(
    trigger: () => Promise<void>,
    queryIncludes: string = "sorts="
  ): Promise<any> {
    return await this.waitForApiResponse(
      "/core/api/v1/vehicles",
      queryIncludes,
      trigger
    );
  }

  async assertVehicleMatchApi(
    uiRows: {
      plateNo?: string;
      assignedTo?: string;
      status?: string;
      insurancePolicyNumber?: string;
      registrationNumber?: string;
      policyExpiry?: string;
      registrationExpiry?: string;
    }[],
    apiResults: any[],
    sortKey:
      | "Vehicle Plate No."
      | "Assigned To"
      | "id"
      | "Policy Expiry"
      | "Registration Expiry"
  ) {
    console.log("Comparing UI vs API (Vehicles)");
    console.log("Sort key:", sortKey);

    if (apiResults.length === 0) {
      const emptyVisible = await this.page
        .locator("text=/No vehicles found|No results/i")
        .isVisible();

      expect(emptyVisible).toBeTruthy;
      return;
    }

    const toDateString = (date: Date | null): string => {
      if (!date || isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    };

    const parseUiDate = (text: string | undefined): string => {
      if (!text) return "";

      const trimmed = text.trim();

      if (trimmed.toLowerCase().includes("expires in")) {
        const days = parseInt(trimmed.match(/\d+/)?.[0] || "0", 10);
        const d = new Date();
        d.setDate(d.getDate() + days);
        return toDateString(d);
      }

      const match = trimmed.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (match) {
        const day = match[1].padStart(2, "0");
        const month = match[2].padStart(2, "0");
        const year = match[3];
        return `${year}-${month}-${day}`;
      }

      const d = new Date(trimmed);
      return isNaN(d.getTime()) ? "" : toDateString(d);
    };

    const uiValues = uiRows.map((r) => {
      switch (sortKey) {
        case "Vehicle Plate No.":
          return r.plateNo?.trim().toLowerCase() ?? "";
        case "Assigned To":
          return (r.assignedTo || "Unassigned").trim().toLowerCase();
        case "Policy Expiry":
          return parseUiDate(r.policyExpiry);
        case "Registration Expiry":
          return parseUiDate(r.registrationExpiry);

        default:
      }
    });

    const apiValues = apiResults.map((r) => {
      switch (sortKey) {
        case "Vehicle Plate No.":
          return (r.plateNo || r.licensePlate || "")
            .toString()
            .trim()
            .toLowerCase();
        case "Assigned To":
          return (r.driver?.name || r.assignedTo || "Unassigned")
            .toString()
            .trim()
            .toLowerCase();
        case "Policy Expiry":
          return r.policyExpiryDate
            ? toDateString(new Date(r.policyExpiryDate))
            : "";
        case "Registration Expiry":
          return r.registrationExpiryDate
            ? toDateString(new Date(r.registrationExpiryDate))
            : "";
        default:
          return "";
      }
    });

    console.log("UI:", uiValues.slice(0, 10));
    console.log("API:", apiValues.slice(0, 10));

    const allMatch = uiValues.every((val, i) => val === apiValues[i]);

    if (!allMatch) {
      console.warn("UI and API mismatch detected (Vehicles)");
      console.warn("UI:", uiValues.slice(0, 10));
      console.warn("API:", apiValues.slice(0, 10));
    }

    expect(allMatch).toBeTruthy;
  }

   async waitForCustomersApi(
    trigger: () => Promise<void>,
    queryIncludes: string = "sorts="
  ): Promise<any> {
    return await this.waitForApiResponse(
      "/core/api/v1/organizations",
      queryIncludes,
      trigger
    );
  }
    async assertCustomerMatchApi(
    uiRows: {
      customerName?: string;
      adminName?: string;
  
      
    }[],
    apiResults: any[],
    sortKey:
      | "Customer Name"
      | "Admin Name"
      | "id"

  ) {
    console.log("Comparing UI vs API (Customer)");
    console.log("Sort key:", sortKey);

    if (apiResults.length === 0) {
      const emptyVisible = await this.page
        .locator("text=/No customers found|No results/i")
        .isVisible();

      expect(emptyVisible).toBeTruthy;
      return;
    }

    const toDateString = (date: Date | null): string => {
      if (!date || isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    };

    const parseUiDate = (text: string | undefined): string => {
      if (!text) return "";

      const trimmed = text.trim();

      if (trimmed.toLowerCase().includes("expires in")) {
        const days = parseInt(trimmed.match(/\d+/)?.[0] || "0", 10);
        const d = new Date();
        d.setDate(d.getDate() + days);
        return toDateString(d);
      }

      const match = trimmed.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (match) {
        const day = match[1].padStart(2, "0");
        const month = match[2].padStart(2, "0");
        const year = match[3];
        return `${year}-${month}-${day}`;
      }

      const d = new Date(trimmed);
      return isNaN(d.getTime()) ? "" : toDateString(d);
    };

    const uiValues = uiRows.map((r) => {
      switch (sortKey) {
        case "Customer Name":
          return r.customerName?.trim().toLowerCase() ?? "";
        case "Admin Name":
          return r.adminName?.trim().toLowerCase()??"";


        default:
      }
    });

    const apiValues = apiResults.map((r) => {
      switch (sortKey) {
        case "Customer Name":
          return (r.companyName )
            .toString()
            .trim()
            .toLowerCase();
        case "Admin Name":
          return (r.orgAdmin?.name)
            .toString()
            .trim()
            .toLowerCase();
        default:
          return "";
      }
    });

    console.log("UI:", uiValues.slice(0, 10));
    console.log("API:", apiValues.slice(0, 10));

    const allMatch = uiValues.every((val, i) => val === apiValues[i]);

    if (!allMatch) {
      console.warn("UI and API mismatch detected (Customer Name)");
      console.warn("UI:", uiValues.slice(0, 10));
      console.warn("API:", apiValues.slice(0, 10));
    }

    expect(allMatch).toBeTruthy;
  }

async waitForRoutesApi(
  trigger: () => Promise<void>,
  queryIncludes:string="sorts="
): Promise<any> {
  const response = await Promise.all([
    this.page.waitForResponse(res =>
      res.request().method() === 'GET' &&
      res.url().includes('/core/api/v1/routes')
    ),
    trigger(),
  ]).then(([res]) => res);

  return await response.json();
}
async waitForScheduleApi(
  trigger: () => Promise<void>,
  expectedQuery:string="startDate"
): Promise<any> {
  const response = await Promise.all([
    this.page.waitForResponse(res =>
      res.request().method() === 'GET' &&
      res.url().includes('/core/api/v1/schedules')&&
      res.url().includes(expectedQuery)
    ),
    trigger(),
  ]).then(([res]) => res);

  return await response.json();
}

  async assertRoutesMatchApi(
    routeCards:any[],
    apiResults: any[],
    sortKey:"Newest"|"Oldest" | "Shortest Distance" |"Longest Distance"| "Fewest Stops" | "Most Stops" | "id" =
        "id"
  ):Promise<boolean>{
      console.log("Comparing UI vs API (Vehicles)");
    console.log("Sort key:", sortKey);

    if (apiResults.length === 0) {
      const emptyVisible = await this.page
        .locator("text=/No routes found|No results/i")
        .isVisible();
        return true;
    

  }

  const routeValues=await Promise.all( routeCards.map(async (r)=>{
    switch(sortKey){
      case "Oldest":
        const routeNameText = await r.locator('h3').first().textContent();
    const routeName = routeNameText?.trim() || '';
    return routeName.toLowerCase()||"";
      case "Shortest Distance":
      const shortestStatsText = await r.locator('.text-sm.text-\\[var\\(--text-muted\\)\\]').nth(0).textContent();
      const shortestDistanceMatch = shortestStatsText?.match(/(\d+(?:\.\d+)?)\s*Km/);
      const shortestDistance = shortestDistanceMatch ? parseFloat(shortestDistanceMatch[1]) : 0;
      return shortestDistance||0;
      case "Longest Distance":
        const statsText =await r.locator('.text-sm.text-\\[var\\(--text-muted\\)\\]').nth(0).textContent();
      const distanceMatch = statsText?.match(/(\d+(?:\.\d+)?)\s*Km/);
      const distance = distanceMatch ? parseFloat(distanceMatch[1]) : 0;
      return distance||0;
      case "Fewest Stops":
      const fewestPointsText = await r.locator('span:has-text("Points")').textContent();
      const fewestPointsMatch = fewestPointsText?.match(/(\d+)\s+points/);
      const fewestnoOfPoints = fewestPointsMatch ? parseInt(fewestPointsMatch[1]) : 0;
      return fewestnoOfPoints||0;
      case "Most Stops":
             const pointsText =await r.locator('span:has-text("Points")').textContent();
      const pointsMatch = pointsText?.match(/(\d+)\s+points/);
      const noOfPoints = pointsMatch ? parseInt(pointsMatch[1]) : 0;
      return noOfPoints||0;
      default:
        return false;
    }
  }));

  const apiValues= apiResults.map((r)=>{
    switch(sortKey){
      case "Oldest":
        return (r.name ).toString().trim().toLowerCase() ??"";
      case "Shortest Distance":
        return Math.round((r.distance/1000)*100)/100||0;
      case "Longest Distance":
        return Math.round((r.distance/1000)*100)/100||0;
      case "Fewest Stops":
        return r.numberOfStops || 0;
      case "Most Stops":
        return r.numberOfStops || 0;
      default:
        return r.id?.toString() ??"";
    }});

    console.log("UI:", routeValues.slice(0, 10));
    console.log("API:", apiValues.slice(0, 10));

    const allMatch = routeValues.every((val, i) => val === apiValues[i]);

    if (!allMatch) {
      console.warn("UI and API mismatch detected (Routes)");
      console.warn("UI:", routeValues.slice(0, 10));
      console.warn("API:", apiValues.slice(0, 10));
      return false;
    }
    return true;
}
}
