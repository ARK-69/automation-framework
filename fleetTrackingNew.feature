Feature: Fleet Live and History Management

    Background:
        Given the user has logged in and has navigated to Fleet Tracking

    Scenario: Verify vehicle cards, sorting, and pagination
    When the user opens the Live tab
    Then exactly 6 vehicle cards should be displayed
    When more than 6 vehicles exist
    And the user clicks the pagination controls
    Then the next or previous set of 6 vehicles should be displayed 

  Scenario: Apply Fleet Group and Status filters on Live tab
    When the user opens the Live tab
    And the user selects "Test Name" Fleet Group from the Fleet Group dropdown
    And the user selects "Offline" Status from the Status dropdown
    Then the vehicle cards panel should display only vehicles matching the applied filters
    And the map should display only the filtered vehicles
  
  Scenario: Clear filters and verify all vehicles appear
    Given the user is viewing filtered vehicle results on the Live tab
    When the user clears all applied filters
    Then the vehicle cards panel should display all vehicles
    And the map should display all vehicles
  

  Scenario: View Live empty state before filters
    When the user opens the Live tab
    Then the Route Log should display "Select fleet group, vehicle, and date to view history."
    And the map should be empty
    Then the Vehicle and Date dropdowns should be disabled

  Scenario: View empty state before filters
    When the user opens the History tab
    Then the Route Log should display "Select fleet group, vehicle, and date to view history."
    And the map should be empty
    Then the Vehicle and Date dropdowns should be disabled

  Scenario: Select filters and load trip history
    When the user selects a Fleet Group
    Then the Vehicle and Date dropdowns should become enabled
    When the user selects a Vehicle and Date
    Then the Route Log should display the trip history
    And the map should display the complete journey route
    And the Trip Summary Card should appear

 Scenario: Filter empty state
    Given Fleet Group, Vehicle, and Date are selected
    When no trip data exists
    Then the Route Log should display "No data found. We couldn't find any trip history matching your current filters."
    And the "Clear All Filters" button should appear
    And the map should remain empty

  Scenario: Clear filters from the History tab
    Given no trip data is found
    When the user clicks "Clear All Filters"
    Then all filters should be reset
    And the Vehicle and Date dropdowns should be disabled
    And the empty state should be displayed
  
  Scenario: Verify that search bar fetches correct vehicle
    Given the vehicle "URO-1234" is part of fleet group
    And the the user types "URO-1234" in the search bar
    Then the search bar should fetch the correct vehicle

  Scenario: View route legend for off-route vehicle
    Given at least one vehicle has exited its geofence
    When the user selects an off-route vehicle
    Then the map legend should display:
      | Solid green line | Live Route     |
      | Dotted red line  | Deviating Path |