Feature: Device Management

  Background:
    Given the user is logged in and the user navigates through the sidebar to the Devices page  

  @Positive
  Scenario: Add a new device and verify that it appears
    When the user adds a new device
    Then a "Device created successfully!" notification should be displayed
    And the added device should appear in the devices table

  Scenario: Search for the added device and verify that it appears
    When the user searches for the added device in the devices table
    Then the added device should be listed in the search results

  Scenario: Search for 'xyz' and verify that no devices are found
    When the user searches for "xyz" in the devices table
    Then a "No devices found matching your criteria." message should be displayed

  Scenario: Edit the newly added device and verify that the device's information changed
    When the user edits the model of the added device
    Then a "Changes saved successfully!" notification should be displayed
    And the updated device should appear in the devices table
  @Negative
  Scenario: Delete the newly added device and verify that it is removed
    When the user deletes the added device
    Then a "Device deleted successfully" notification should be displayed and the deleted device should no longer appear in the table

    Scenario: Verify all filter options are available and can be selected
    When the user opens the filter dialog on the devices table
    When the user selects device filter "Device Assigned" with value "Yes"
    And the user selects device filter "Manufacturer" with value "Teltonika"
    And the user selects device filter "Model" with value "FMB920"
    And the user selects device filter "Status" with value "Online"
    And the user clicks Apply button in the device filter dialog
    Then the devices table should display filtered results based on the applied filters
    And the filter should show active device filters in the filter indicator

  Scenario: Verify all sort options are available and can be selected
    When the user opens the sort dropdown on the devices table
    Then the sort dropdown should contain the following options:
      | Newest                  |
      | Oldest                  |
      | Manufacturer (A-Z)      |
      | Manufacturer (Z-A)      |
      | Model (A-Z)             |
      | Model (Z-A)             |
      | Assigned Vehicle (A-Z)  |
      | Assigned Vehicle (Z-A)  |
    When the user selects "Manufacturer (A-Z)" from the sort dropdown
    Then the devices table should display results sorted according to the applied sort
    Then the devices table should be sorted by "Manufacturer (A-Z)"
    And the sort indicator should show "Sort: Manufacturer (A-Z)"
    And the user selects "Model (Z-A)" from the sort dropdown
    Then the devices table should display results sorted according to the applied sort
    Then the devices table should be sorted by "Model (Z-A)"
    And the sort indicator should show "Sort: Model (Z-A)"

  Scenario: Apply filters and sort together and verify combined results
  When the user opens the filter dialog on the devices table
   When the user selects device filter "Device Assigned" with value "Yes"
    And the user selects device filter "Manufacturer" with value "Teltonika"
    And the user selects device filter "Model" with value "FMB920"
    And the user selects device filter "Status" with value "Online"
    And the user clicks Apply button in the device filter dialog
    Then the devices table should display filtered results based on the applied filters
    When the user opens the sort dropdown on the devices table
    And the user selects "Model (A-Z)" from the sort dropdown
    Then the filtered devices table should be sorted by "Model (A-Z)"
    And all displayed devices should have manufacturer "Teltonika"
    And all displayed devices should have model "FMB920"
    And all displayed devices should have status "Online"
    And the devices should be sorted in ascending order by model
    
  @Negative
  Scenario: Adding device without entering IMEI number and Phone number
    When the user opens the add device form
    And the user fill the form without IMEI number, Phone number, username, password
    Then all the required fields should show validation error


