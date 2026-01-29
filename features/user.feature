Feature: Users Management

  Background:
    Given the user is logged in and the user navigates through the sidebar to the User and Role page


 

  Scenario: Verify Users tab default view
    Given the admin is on the Users tab
    Then the Users table is displayed
    And the Invite User button is visible
    And search, filter, and sort options are available


  Scenario: User invites a new user and verifies it is shown in the table
    When the user clicks Invite User
    And the user fills the new user form
    And the user clicks Send Invite
    Then the toast message "Invitation sent to user successfully!" should be displayed
    And the user should be displayed in the table with status Pending


  Scenario: Verify that new user exists using search bar
    When the user searches using the new user name
    Then the new user should be displayed in the table


  Scenario: Edit new user info and verify it in the table
    When the user clicks the edit user icon
    And the user updates the new user details
    And the user clicks Save Changes
    Then the update should be visible in the table


  Scenario: Verify that the invite is resent
    When the user clicks the resend button
    And the user confirms the Resend Invite modal
    Then the toast message "Invitation resent to user successfully!" should be displayed


  Scenario: Search users by name, email, or role
    Given the admin is on the Users tab
    When the admin searches for a valid user keyword
    Then only users matching Name, Email, or Role are displayed


  Scenario: Users search returns no results
    Given the admin is on the Users tab
    When the admin searches with an invalid keyword
    Then the empty state message is displayed "No users found"
    And a Clear all filters button is visible


  @Negative
  Scenario: Submit empty form when adding a new user
    When the user clicks Invite User
    And the user submits the form without filling required fields
    Then Send Invite button should be disabled


 

  Scenario: Verify all user filter options are available and selectable
    When the user opens the filter dialog on the users table
    And the user selects user filter "Role" with value "Driver"
    And the user selects user filter "Status" with value "Pending"
    And the user clicks Apply in the user filter dialog
    Then the users table should display filtered results based on the applied filters

  Scenario: Verify all user sort options are available and selectable
    When the user opens the user sort dropdown on the users table
    Then the user sort dropdown menu should contain the following options:
      | Newest                    |
      | Oldest                    |
      | Email (A-Z)               |
      | Email (Z-A)               |
      | Last Login (Most Recent)  |
      | Last Login (Least Recent) |
    When the user selects "Email (A-Z)" from the user sort dropdown
    Then the users table should be sorted by "Email (A-Z)"
    When the user selects "Last Login (Most Recent)" from the user sort dropdown
    Then the users table should be sorted by "Last Login (Most Recent)"