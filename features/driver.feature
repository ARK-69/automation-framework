Feature: Driver Management

  Background:
    Given the user has logged in and has navigated to the Drivers page

  Scenario: Add a driver and verify it appears in search results
    When the user adds a new driver with valid details
    Then a "Driver added successfully!" notification should be displayed
    Then the user searches for the new driver's name in the drivers table
    And the new driver should be listed in the search results

  Scenario: Search for 'xyz' and verify that no drivers are found
    When the user searches for "xyz" in the drivers table
    Then a "No drivers found" message should be displayed

  Scenario: View the added driver and verify the correct modal appears
    When the user clicks the view icon for the new driver
    Then the driver details modal should be displayed
    And the modal should show the correct driver details

  Scenario: Edit the newly added driver and verify that edits have been saved successfully
    When the user clicks the edit icon for the new driver
    And the user edits the driver's details and saves the changes
    Then a "Driver updated successfully" notification should be displayed

  Scenario: Delete the added driver and verify that it is removed
    When the user clicks the delete icon for the new driver
    And the user confirms the deletion
    Then a "Driver deleted successfully" notification should be displayed
    And the driver should no longer appear in the drivers table

    
  @Negative
  Scenario: Submit empty form when adding a new driver and verify all required field validations are displayed
    When the user opens the Add New Driver form
    And the user submits the form without filling any fields
    Then validation error messages should be displayed for all required fields

  Scenario: verify all filter options are available and can be selected
    When the user opens the filter dialog on the Drivers table
    And the user selects driver filter "Vehicle Assigned" with value "Yes"
    And the user selects driver filter "Primary Driver" with value "Yes"
    And the user selects driver filter "Behaviour Score" with value "80-100"
    And the user click Apply button in the driver filter dialog
    Then the Drivers table should display filtered results based on the applied filters

  Scenario: Verify all sort options are available and can be selected
    When the user opens the sort dropdown on the Drivers table
    Then the sort dropdown menu should contain the following options:
      | Newest                          |
      | Oldest                          |
      | Name (A-Z)                      |
      | Name (Z-A)                      |
      | Behavior Score (Highest First) |
      | Behavior Score (Lowest First)  |
    And the user selects "Name (A-Z)" from the sort dropdown menu
    Then the Drivers table should be sorted by "Name (A-Z)"
    When the user opens the sort dropdown on the Drivers table
    And the user selects "Behavior Score (Highest First)" from the sort dropdown menu
    Then the Drivers table should be sorted by "Behavior Score (Highest First)"

  Scenario: Apply filters and sort together and verify combined results
    When the user opens the filter dialog on the Drivers table
    And the user selects driver filter "Vehicle Assigned" with value "Yes"
    And the user selects driver filter "Primary Driver" with value "Yes"
    And the user selects driver filter "Behaviour Score" with value "80-100"
    And the user click Apply button in the driver filter dialog
    Then the Drivers table should display filtered results based on the applied filters
    When the user opens the sort dropdown on the Drivers table
    And the user selects "Name (A-Z)" from the sort dropdown menu
    Then the filtered Drivers table should be sorted by "Name (A-Z)"
    And all displayed Drivers should have Vehicle Assigned "Yes"
    And all displayed Drivers should have Behaviour Score "80-100"
    And the Drivers table should be sorted by "Name (A-Z)"
    When the user change the sort to "Behavior Score (Highest First)"
    Then the Drivers table should be sorted by "Behavior Score (Highest First)"
    And the filter should show applied filter count


  Scenario: Reset filters and verify all filters are cleared
    When the user opens the filter dialog on the Drivers table
    And the user selects driver filter "Vehicle Assigned" with value "Yes"
    And the user selects driver filter "Primary Driver" with value "Yes"
    And the user selects driver filter "Behaviour Score" with value "80-100"
    And the user click Apply button in the driver filter dialog
    Then the Drivers table should display filtered results based on the applied filters
    And the driver filter should show active filters in the filter indicator
    When the user opens the filter dialog on the Drivers table
    And the user "Clear All" all the applied driver filters
    Then all driver filters should be cleared
    And the Drivers table should display all Drivers without any filters applied


