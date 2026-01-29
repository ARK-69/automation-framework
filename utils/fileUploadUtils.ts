import { Page } from "playwright";
import * as path from "path";

export class FileUploadUtils {
  constructor(private page: Page) {}

  async uploadFile(labelText: string, filePath: string): Promise<void> {
    console.log(` Attempting to upload: ${filePath} for label: "${labelText}"`);

    const label = this.page.locator(`label:has-text("${labelText}"),input[id="${labelText}"]`);
    console.log(`Label count: ${await label.count()}`);

    const container = label.locator("..");
    const fileInput = container.locator('input[type="file"][id]').last();

    console.log(`File input count: ${await fileInput.count()}`);

    await fileInput.setInputFiles(path.resolve(filePath));
    console.log(` File uploaded successfully`);
    await this.page.waitForTimeout(500);
  }

  async uploadMultipleFiles(
    labelText: string,
    filePaths: string[]
  ): Promise<void> {
    const fileInputs = this.page.locator(
      'input[id*="file-upload-additional-files"]'
    );

    if ((await fileInputs.count()) === 0) {
      throw new Error(`No file inputs found for "${labelText}"`);
    }

    const resolvedPaths = filePaths.map((fp) => path.resolve(fp));

    for (
      let i = 0;
      i < Math.min(filePaths.length, await fileInputs.count());
      i++
    ) {
      const fileInput = fileInputs.nth(i);
      console.log(
        `Uploading file ${i + 1}/${filePaths.length}: ${filePaths[i]}`
      );
      await fileInput.setInputFiles([resolvedPaths[i]]);
      await this.page.waitForTimeout(500);
    }

    if (filePaths.length > (await fileInputs.count())) {
      const addMoreButton = this.page
        .locator('button:has-text("Add More")')
        .first();
      for (let i = await fileInputs.count(); i < filePaths.length; i++) {
        await addMoreButton.click();
        await this.page.waitForTimeout(500);

        const newFileInput = this.page
          .locator('input[id*="file-upload-additional-files"]')
          .last();
        console.log(
          `Uploading file ${i + 1}/${filePaths.length}: ${filePaths[i]}`
        );
        await newFileInput.setInputFiles([resolvedPaths[i]]);
        await this.page.waitForTimeout(500);
      }
    }
  }
}

export function createFileUploadUtils(page: Page): FileUploadUtils {
  return new FileUploadUtils(page);
}
