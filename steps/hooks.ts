import { Before, After, setDefaultTimeout } from "@cucumber/cucumber";
import path from "path";
import fetch from "node-fetch";
import * as dotenv from "dotenv";

dotenv.config();

setDefaultTimeout(60 * 1000);

Before(async function () {
  const base = process.env.BASE_URL;
  if (!base)
    throw new Error(
      "BASE_URL is not set. Copy .env.example to .env and set BASE_URL."
    );
  try {
    const res = await fetch(base, { method: "HEAD" });
    if (!res.ok && res.status !== 200) {
      console.warn(
        `Warning: BASE_URL ${base} responded with status ${res.status}`
      );
    }
  } catch (e) {
    console.warn(`Warning: BASE_URL ${base} is not reachable: ${e}`);
  }

  if (!this.browser) await this.init();
});

After(async function (scenario) {
  try {
    if (
      scenario.result?.status === "FAILED" ||
      scenario.result?.status === "UNDEFINED"
    ) {
      const ts = Date.now();
      const p = path.resolve("reports", `failed-${ts}.png`);
      if (this.page) await this.page.screenshot({ path: p, fullPage: true });
    }
  } catch (e) {
  }
  await this.dispose();
});
