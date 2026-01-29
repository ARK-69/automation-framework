Feature: Vehicle Management

  Background:
    Given the user has logged in and has navigated to the Vehicles page

  Scenario: Add a vehicle and assert successful addition by search
    When the user adds a new vehicle with valid details
    Then a "Vehicle created and files uploaded successfully" notification should be displayed
    And the user searches for the new vehicle's plate in the vehicles table
    Then the new vehicle should be listed in the search results

  Scenario: Search for 'xyz' and assert no vehicles are found
    When the user searches for "xyz" in the vehicles table
    Then a "No vehicles found" message should be displayed

  Scenario: View the added vehicle and verify that the correct modal opens
    When the user clicks the view icon for the new vehicle
    Then the vehicle details modal should be displayed
    And the modal should show the correct vehicle details

  Scenario: Edit the added vehicle and verify the edits
    When the user clicks the edit icon for the new vehicle
    And the user edits the vehicle's details and saves the changes
    Then a "Vehicle updated successfully" notification should be displayed

  Scenario: Delete the added vehicle and verify that it is removed
    When the user clicks the delete icon for the new vehicle
    And the user confirms deletion of the added vehicle
    Then a "Vehicle deleted successfully" notification should be displayed
    And the vehicle should no longer appear in the vehicles table
  @Negative
  Scenario: Saving the vehicle without filling in required fields
    When the user clicks add vehicle button
    And the user click save vehicle without entering data
    Then the required fields should give validation error
  
  Scenario: verify all filter options are available and can be selected
    When the user opens the filter dialog on the vehicles table
    And the user selects "Driver Assigned" filter with value "Yes"
    And the user selects "Fleet Group" filter with value "Test group"
    And the user selects "Vehicle Type" filter with value "Sedan"
    And the user selects "Fuel Type" filter with value "Gasoline"
    And the user selects "Insurance Policy Expiry" filter with value "Expired"
    And the user selects "Registration Expiry" filter with value "Expired"
    And the user clicks Apply button in the vehicles filter dialog
    Then the vehicles table should display filtered results based on the applied filters
    And the filter should show active vehicle filters in the filter indicator

    Scenario: Verify all sort options are available and can be selected
    When the user opens the sort dropdown on the vehicles table
    Then the vehicle sort dropdown should contain the following options:
      | Newest                  |
      | Oldest                  |
      | Vehicle Plate No. (A-Z)      |
      | Vehicle Plate No. (Z-A)      |
      | Assigned To (A-Z)             |
      | Assigned To (Z-A)             |
      | Policy Expiry (Soon)  |
      | Policy Expiry (Latest)  |
      | Registration Expiry (Soon)  |
      | Registration Expiry (Latest)  |
    When the user selects "Vehicle Plate No. (A-Z)" from the vehicle sort dropdown
    Then the vehicles table should display results sorted according to the applied sort
    Then the vehicles table should be sorted by "Vehicle Plate No. (A-Z)"
    And the vehicle sort indicator should show "Sort: Vehicle Plate No. (A-Z)"
    And the user selects "Policy Expiry (Soon)" from the vehicle sort dropdown
    Then the vehicles table should display results sorted according to the applied sort
    Then the vehicles table should be sorted by "Policy Expiry (Soon)"
    And the vehicle sort indicator should show "Sort: Policy Expiry (Soon)"


  Scenario: Apply filters and sort together and verify combined results
    When the user opens the filter dialog on the vehicles table
    And the user selects "Driver Assigned" filter with value "Yes"
    And the user selects "Fleet Group" filter with value "Test group"
    And the user selects "Vehicle Type" filter with value "Sedan"
    And the user selects "Fuel Type" filter with value "Gasoline"
    And the user selects "Insurance Policy Expiry" filter with value "Expired"
    And the user selects "Registration Expiry" filter with value "Expired"
    And the user clicks Apply button in the vehicles filter dialog
    Then the vehicles table should display filtered results based on the applied filters
    When the user selects "Vehicle Plate No. (A-Z)" from the vehicle sort dropdown
    Then the vehicles table should display results sorted according to the applied sort
    Then the vehicles table should be sorted by "Vehicle Plate No. (A-Z)"
    And the vehicle sort indicator should show "Sort: Vehicle Plate No. (A-Z)"
    And the user selects "Policy Expiry (Soon)" from the vehicle sort dropdown
    Then the vehicles table should display results sorted according to the applied sort
    Then the vehicles table should be sorted by "Policy Expiry (Soon)"
    And the vehicle sort indicator should show "Sort: Policy Expiry (Soon)"


  Scenario: Reset filters and verify all filters are cleared
    When the user opens the filter dialog on the vehicles table
    And the user selects "Driver Assigned" filter with value "Yes"
    And the user selects "Fleet Group" filter with value "Test group"
    And the user selects "Vehicle Type" filter with value "Sedan"
    And the user selects "Fuel Type" filter with value "Gasoline"
    And the user selects "Insurance Policy Expiry" filter with value "Expired"
    And the user selects "Registration Expiry" filter with value "Expired"
    And the user clicks Apply button in the vehicles filter dialog
    Then the vehicles table should display filtered results based on the applied filters
    And the vehicle filter should show active filters in the filter indicator
    When the user opens the filter dialog on the vehicles table
    And the user "Clear All" all the applied vehicle filters
    Then all vehicle filters should be cleared
    And the vehicles table should display all vehicles without any filters applied  
       