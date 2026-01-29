import { Page } from "playwright";
import { createFileUploadUtils } from "../utils/fileUploadUtils";

export class ProfilePage {
  constructor(private page: Page) {}

  async openEditPersonalInfo() {
    let customerDiv=await this.page.locator('p:has-text("Personal Information")').locator("..").locator("..");
    let editIcon=customerDiv.locator('[data-slot="button"]');
    await editIcon.click();  
  }

  async editPersonalInfo({
    name,
    phone,
    profilePicture,
  }: {
    name: string;
    phone: string;
    profilePicture: string;
  }) {
    const uploadUtils = createFileUploadUtils(this.page);
    await this.page.fill('input[name="name"]', name);
    await this.page.fill('input[name="phone"]', phone);
    const profilePhotoSection = this.page
      .locator('label:has-text("Profile Photo")')
      .locator("..");
    const deleteButton = profilePhotoSection.locator(
      "button:has(svg.lucide-trash2)"
    );
    await deleteButton.waitFor({ state: "visible", timeout: 10000 });
    await deleteButton.click();
    if (profilePicture) {
      await uploadUtils.uploadFile("Profile Photo", profilePicture);
    }
  }

  async savePersonalInfoChanges() {
    await this.page.click('button:has-text("Save Changes")');
    await this.page.waitForSelector("text=Profile updated successfully", {
      timeout: 8000,
    });
  }

  async getNotification() {
    await this.page.waitForTimeout(2000);

    const notification = this.page
      .locator("text=/successfully|updated|deleted|created|added/i")
      .first();

    return await notification.textContent();
  }

  async getPersonalInfo() {
    const nameLocator = this.page.locator(
      '//span[contains(text(), "Full Name")]/following-sibling::span[1]'
    );
    const phoneLocator = this.page.locator(
      '//span[contains(text(), "Phone")]/following-sibling::span[1]'
    );
    const name = await nameLocator.textContent();
    const phone = await phoneLocator.textContent();
    const picturePresent = await this.page
      .locator('img[alt="Profile Photo"]')
      .isVisible();
    return { name: name?.trim(), phone: phone?.trim(), picturePresent };
  }

  async openChangePassword() {
    const changePasswordBtn = this.page.locator('[data-slot="button"]', {
      hasText: "Change Password",
    });
    await changePasswordBtn.waitFor({ timeout: 5000 });
    await changePasswordBtn.click();
  }

  async enterPasswordCurrent(current: string) {
    await this.page.fill('input[name="currentPassword"]', current);
  }

  async enterPasswordChanged(current: string) {
    await this.page.fill('input[name="currentPassword"]', current);
  }

  async enterPasswordNew(newpass: string, confirm: string) {
    await this.page.fill('input[name="newPassword"]', newpass);
    await this.page.fill('input[name="confirmPassword"]', confirm);
  }

  async enterPasswordPrevious(newpass: string, confirm: string) {
    await this.page.fill('input[name="newPassword"]', newpass);
    await this.page.fill('input[name="confirmPassword"]', confirm);
  }

  async savePasswordChange(): Promise<string> {
    const saveBtn = this.page.locator('[data-slot="button"]', {
      hasText: "Save Changes",
    });
    await saveBtn.waitFor({ timeout: 5000 });
    await saveBtn.click();

    const notification = this.page.locator(
      "text=Password changed successfully"
    );
    await notification.waitFor({ timeout: 8000 });
    return (await notification.textContent())?.trim() ?? "";
  }
  async getNewPasswordError() {
    await this.page.fill('input[name="confirmPassword"]', "");
    const errorMessages = [
      "New password must be different from current password",
      "Please confirm your password",
    ];
    for (const msg of errorMessages) {
      const errorLocator = this.page.locator(`text=${msg}`).isVisible();
      if (!errorLocator) {
        return false;
      }
    }
    return true;
  }
  async clearName() {
    await this.page.fill('input[name="name"]', "");
  }
  async verifyDisabledSaveButton() {
    const saveButton = this.page
      .locator('button:has-text("Save Changes")')
      .isDisabled();
    return saveButton;
  }
}
