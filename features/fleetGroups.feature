Feature: Fleet Groups Management

  Background:
    Given the user is logged in and on the Fleet Groups page

  Scenario: Add a new fleet group and verify that it appears
    When the user adds a new fleet group
    Then a "Group created successfully" notification should be displayed
    And the user searches for the new group name in the groups table
    Then the new fleet group should be listed in the search results

  Scenario: Search for 'xyz' and verify that no groups are found
    When the user searches for "xyz" in the groups table
    Then a "No results found" message should be displayed

  Scenario: View the added fleet group and verify that the correct modal appears
    When the user clicks the view icon for the new fleet group
    Then the group details modal should be displayed
    And the modal should show the correct group details

  Scenario: Edit the newly added fleet group and verify the update
    When the user clicks the edit icon for the new group
    And the user edits the group's manager and saves the changes
    Then a "Group updated successfully" notification should be displayed

  Scenario: Delete the newly added fleet group and verify that its removed
    When the user clicks the delete icon for the new group
    And the user confirms group deletion
    Then a "Group deleted successfully" notification should be displayed
    And the group should no longer appear in the groups table

  @Negative
  Scenario: Saving fleet manager without entering data
    When the user click create fleet group
    And all the required fields are empty
    Then the save button should be disabled

  Scenario: verify all filter options are available and can be selected
    When the user opens the filter dialog on the Fleet Groups table
    And the user selects Fleet Group filter "Fleet Manager" with value "Test User 01"
    And the user selects Fleet Group filter "Created By" with value "Test Name 01"
    And the user selects Fleet Group filter "No. of Vehicles" with value "1-10"
    And the user clicks Apply to apply filters
    Then the Fleet Groups table should display filtered results based on the applied filters

  Scenario: Verify all sort options are available and can be selected
    When the user opens the sort dropdown on the Fleet Groups table
    Then the fleet group sort dropdown should contain the following options:
      | Newest                  |
      | Oldest                  |
      | Group Name (A-Z)      |
      | Group Name (Z-A)      |
      | Vehicle Count (High → Low)             |
      | Vehicle Count (Low → High)             |
      | Last Updated (Most Recent)  |
      | Last Updated (Least Recent)  |
    And the user select "Group Name (A-Z)" from the sort dropdown
    Then the Fleet Groups table should be sorted by "Group Name (A-Z)"
    When the user opens the sort dropdown on the Fleet Groups table
    And the user select "Last Updated (Most Recent)" from the sort dropdown
    Then the Fleet Groups table should be sorted by "Last Updated (Most Recent)"

  Scenario: Apply filters and sort together and verify combined results
    When the user opens the filter dialog on the Fleet Groups table
    And the user selects Fleet Group filter "Fleet Manager" with value "Test User 01"
    And the user selects Fleet Group filter "Created By" with value "Test Name 01"
    And the user selects Fleet Group filter "No. of Vehicles" with value "1-10"
    And the user clicks Apply to apply filters
    Then the Fleet Groups table should display filtered results based on the applied filters
    When the user opens the sort dropdown on the Fleet Groups table
    And the user select "Group Name (A-Z)" from the sort dropdown
    And the Fleet Groups table should be sorted by "Group Name (A-Z)"
    When the user opens the sort dropdown on the Fleet Groups table
    And the user select "Last Updated (Most Recent)" from the sort dropdown
    Then the Fleet Groups table should be sorted by "Last Updated (Most Recent)"

  Scenario: Reset filters and verify all filters are cleared
    When the user opens the filter dialog on the Fleet Groups table
    And the user selects Fleet Group filter "Fleet Manager" with value "Test User 01"
    And the user selects Fleet Group filter "Created By" with value "Test Name 01"
    And the user selects Fleet Group filter "No. of Vehicles" with value "1-10"
    And the user clicks Apply to apply filters
    Then the Fleet Groups table should display filtered results based on the applied filters
    And the Fleet Groups filter should show active filters in the filter indicator
    When the user opens the filter dialog on the Fleet Groups table
    And the user "Clear All" all the applied Fleet Groups filters
    Then all Fleet Groups filters should be cleared
    And the Fleet Groups table should display all Fleet Groups without any filters applied
 
    
