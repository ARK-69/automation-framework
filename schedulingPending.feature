  Scenario: Removing filters      [Clear filter does not fire api]
    When the user selects Driver filter with value "awd"
    And the user remove the Driver Filter
    Then all accessible trips are displayed on the calendar

  # ----------------------------
  # Conflicts
  # ----------------------------

  Scenario: Edit Trip with vehicle conflict      [PORTAL]
    Given the Edit Trip modal is open
    And all required fields are filled
    When the selected vehicle has a conflicting trip
    Then a vehicle conflict banner is displayed
  

  Scenario: Edit Trip with driver conflict   [PORTAL]
    Given the Edit Trip modal is open
    And all required fields are filled
    When the selected driver has a conflicting trip
    Then a driver conflict banner is displayed
  

  Scenario: Edit Trip with vehicle and driver conflict   [PORTAL]
    Given the Edit Trip modal is open
    And all required fields are filled
    When both vehicle and driver have conflicts
    Then a combined conflict banner is displayed
  

  Scenario: Vehicle conflict during new trip   [PORTAL]
    When the user clicks the New Trip button
    And the user fills the trip form with confilicting vehicle values
    Then a vehicle conflict banner is displayed
  

  Scenario: Driver conflict during new trip   [PORTAL]
    When the user clicks the New Trip button
    And the user fills the trip form with confilicting Driver values
    Then a driver conflict banner is displayed
  

  Scenario: Both vehicle and driver conflict during new trip   [PORTAL]
    When the user clicks the New Trip button
    And the user fills the trip form with confilicting vehicle and driver values
    Then a combined conflict banner is displayed
  


  Scenario: Edit Trip with vehicle conflict   [PORTAL]
    When the user logs in as Fleet Manager
    And the Edit Trip modal is open
    And all required fields are filled
    When the selected vehicle has a conflicting trip
    Then a vehicle conflict banner is displayed
  

  Scenario: Edit Trip with driver conflict   [PORTAL]
    When the user logs in as Fleet Manager
    And the Edit Trip modal is open
    And all required fields are filled
    When the selected driver has a conflicting trip
    Then a driver conflict banner is displayed
  

  Scenario: Edit Trip with vehicle and driver conflict   [PORTAL]
    When the user logs in as Fleet Manager
    And the Edit Trip modal is open
    And all required fields are filled
    When both vehicle and driver have conflicts
    Then a combined conflict banner is displayed
  

  Scenario: Vehicle conflict during new trip   [PORTAL]
    When the user logs in as Fleet Manager
    When the user clicks the New Trip button
    And the user fills the trip form with confilicting vehicle values
    Then a vehicle conflict banner is displayed
  

  Scenario: Driver conflict during new trip   [PORTAL]
    When the user logs in as Fleet Manager
    When the user clicks the New Trip button
    And the user fills the trip form with confilicting Driver values
    Then a driver conflict banner is displayed
  

  Scenario: Both vehicle and driver conflict during new trip   [PORTAL]
    When the user logs in as Fleet Manager
    When the user clicks the New Trip button
    And the user fills the trip form with confilicting vehicle and driver values
    Then a combined conflict banner is displayed




  # ----------------------------
  # Calendar Views & Overflow
  # ----------------------------

  Scenario: Switch to Day View
    Given the calendar is visible
    When the user selects Day View
    Then the calendar displays a single day with all trips for that day

  Scenario: Switch to Week View
    Given the calendar is visible
    When the user selects Week View
    Then the calendar displays seven days (Sunday to Saturday)

  Scenario: Switch to Month View
    Given the calendar is visible
    When the user selects Month View
    Then the calendar displays the entire month

  Scenario: Week View displays four or fewer trips per slot
    Given the user is viewing Week View
    When a time slot has four or fewer trips
    Then all trips are displayed within the slot

  Scenario: Week View displays overflow indicator for more than four trips
    Given the user is viewing Week View
    When a time slot has more than four trips
    Then only four trips are displayed
    And a "+n more" indicator is shown

  Scenario: Open overflow trips in Week View
    Given a "+n more" indicator is visible
    When the user clicks "+n more"
    Then the calendar switches to Day View for that date
    And all trips for that slot are displayed
    And horizontal scrolling is available if needed

  Scenario: Month View displays two or fewer trips per day
    Given the user is viewing Month View
    When a day has two or fewer trips
    Then all trips are displayed for that day

  Scenario: Month View displays overflow indicator for more than two trips
    Given the user is viewing Month View
    When a day has more than two trips
    Then only two trips are displayed
    And a "+n more" indicator is shown

  Scenario: Open overflow trips in Month View
    Given a "+n more" indicator is visible in Month View
    When the user clicks "+n more"
    Then a modal opens displaying all trips for that day

  # ----------------------------
  # Permissions
  # ----------------------------

  Scenario: Organization Admin calendar permissions     
    Given the user is logged in as Organization Admin
    When the Trip Details view is open
    Then the trip Details modal opens with correct trip details
    And the user clicks Edit
    And the user fills the trip form and submit the changes
    And a success toast "Trip updated successfully" is shown
    And the user can delete all trips


  Scenario: Fleet Manager cannot view trips from other Fleet Groups or Organization Admin
    Given the user is logged in as Fleet Manager
    And trips exist for unassigned Fleet Groups
    When the user views the calendar
    Then trips from different Fleet Groups or Organization Admin are not visible
