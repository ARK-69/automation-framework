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
    Then only users matching Name, Email, or Role are displayed dynamically


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
    When the user opens the sort dropdown on the users table
    Then the sort dropdown menu should contain the following options:
      | Newest                    |
      | Oldest                    |
      | Email (A-Z)               |
      | Email (Z-A)               |
      | Last Login (Most Recent)  |
      | Last Login (Least Recent) |
    When the user selects "Name (A-Z)" from the sort dropdown
    Then the users table should be sorted by "Name (A-Z)"
    When the user selects "Behavior Score (Highest First)" from the sort dropdown
    Then the users table should be sorted by "Behavior Score (Highest First)"


  Scenario: Apply filters and sort together on users table
    When the user opens the filter dialog on the users table
    And the user selects user filter "Role" with value "Driver"
    And the user selects user filter "Status" with value "Pending"
    And the user clicks Apply in the user filter dialog
    Then the users table should display filtered results
    When the user sorts by "Email (A-Z)"
    Then all displayed users should have Role "Driver"
    And all displayed users should have Status "Pending"
    And the users table should be sorted by "Email (A-Z)"
    When the user changes the sort to "Oldest"
    Then the users table should be sorted by "Oldest"
    And the filter indicator should show applied filter count


  Scenario: Reset user filters
    When the user opens the filter dialog on the users table
    And the user selects user filter "Role" with value "Driver"
    And the user selects user filter "Status" with value "Pending"
    And the user clicks Apply in the user filter dialog
    Then the users table should display filtered results
    And the filter indicator should show active filters
    When the user clears all user filters
    Then all user filters should be cleared
    And the users table should display all users


  Scenario: Delete user and verify removal
    When the user clicks the delete button
    And the user confirms the delete action
    Then a success toast message should be displayed
    And the user should not be visible in the table



  Scenario: Verify Roles & Permissions tab default view
    When the admin selects the "Roles & Permissions" tab
    Then the Roles table is displayed
    And the Add Role button is visible
    And the table is pre-populated with system roles
    And search, filter, and sort options are available


  Scenario: Add custom role and verify it in the table
    When the user clicks Add Role
    And the user fills the custom role details
    And the user clicks Save Role
    Then the custom role should be displayed in the table


  Scenario: View role details
    When the user clicks View Role
    And the Role Details page opens
    Then the role details should be displayed


  Scenario: Edit role and verify update
    When the user clicks the Edit Role button
    And the user updates the role details
    Then the updated role should be visible in the table


  Scenario: Search roles by role name or type
    Given the admin is on the Roles & Permissions tab
    When the admin searches with a valid role keyword
    Then only matching roles are displayed dynamically


  Scenario: Roles search returns no results
    Given the admin is on the Roles & Permissions tab
    When the admin searches with an invalid keyword
    Then the empty state message is displayed:
      """
      No results found. We couldn't find any role matching your current search and filters.
      """
    And a Clear all filters button is visible


  @Negative
  Scenario: Submit empty form when adding a new role
    When the user opens the Add New Role form
    And the user submits the form without filling any fields
    Then validation error messages should be displayed for all required fields




  Scenario: Verify all role filter options are available and selectable
    When the user opens the filter dialog on the roles table
    And the user selects role filter "Type" with value "System"
    And the user clicks Apply in the role filter dialog
    Then the role table should display filtered results


  Scenario: Verify all role sort options are available and selectable
    When the user opens the sort dropdown on the roles table
    Then the sort dropdown menu should contain the following options:
      | Newest                          |
      | Oldest                          |
      | Role Name (A-Z)                 |
      | Role Name (Z-A)                 |
      | Last Updated (Most Recent)      |
      | Last Updated (Least Recent)     |
    When the user selects "Role Name (A-Z)"
    Then the role table should be sorted by "Role Name (A-Z)"
    When the user selects "Last Updated (Most Recent)"
    Then the role table should be sorted by "Last Updated (Most Recent)"


  Scenario: Apply filters and sort together on roles table
    When the user opens the filter dialog on the roles table
    And the user selects role filter "Type" with value "System"
    And the user clicks Apply in the role filter dialog
    Then the role table should display filtered results
    When the user sorts by "Role Name (A-Z)"
    Then all displayed roles should have Type "System"
    And the role table should be sorted by "Role Name (A-Z)"
    When the user changes the sort to "Last Updated (Most Recent)"
    Then the role table should be sorted by "Last Updated (Most Recent)"
    And the filter indicator should show applied filter count


  Scenario: Reset role filters
    When the user opens the filter dialog on the roles table
    And the user selects role filter "Type" with value "System"
    And the user clicks Apply in the role filter dialog
    Then the role table should display filtered results
    And the filter indicator should show active filters
    When the user clears all role filters
    Then all role filters should be cleared
    And the role table should display all roles


  Scenario: Delete role and verify removal
    When the user clicks the delete role button
    And the user confirms the delete action
    Then a success toast message should be displayed
    And the role should not be visible in the table
