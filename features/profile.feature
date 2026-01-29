Feature: Profile and Account Management

  Background:
    Given the user has logged in and has navigated to My profile

  Scenario: Edit personal information and verify the changes
    When the user opens the Personal Information edit section
    And the user edits the name, phone number, and uploads a new profile picture
    And the user saves the changes in personal information
    Then a "Profile updated Successfully" message should be displayed

Scenario: Successfully change the user password and verify login with new password and revert it
    When the user clicks on Change Password
    And the user enters the current password
    And the user enters the new password in the New Password and Confirm New Password fields
    And the user saves the password changes
    And the user logs out of the system
    Then the user should be able to log in again with email and the new password
    When the user clicks on Change Password
    And the user enters a new password
    And the user enters the previous password
    And the user saves the password changes
  @Negative
  Scenario: saving profile without entering username
    When the user opens the Personal information edit section
    And the user removes the name
    Then the save Changes button should be disabled
  @Negative
  Scenario: changing the password to the current password
    When the user clicks on Change Password
    And the user enters the current password
    And the user enters the current password in New Password field
    Then the new password should display the validation error