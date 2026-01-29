Feature: Scheduling Feature

  Background:
    Given the user has logged in and has navigated to scheduling


  # ----------------------------
  # Trip Creation
  # ----------------------------

  Scenario: Organization Admin adds a new trip and verify it in the calender [DONE]
    When the user clicks the New Trip button
    And the user fills the trip form and submit the form
    And a success toast "Trip scheduled successfully" is shown
    Then the trip should appear in the calendar with all its recurrences

  Scenario: Fleet Manager adds a new trip and verify it in the calender  
    When the user logs in as Fleet Manager
    And the user clicks the New Trip button
    And the Fleet Manager fills the trip form and submit the form
    And a success toast "Trip scheduled successfully" is shown
    Then the trip scheduled by fleet manager should appear in the calendar with all its recurrences

  @Negative
  Scenario: Add Trip with missing required fields    [DONE]
    When the user opens New Trip Modal
    And user click save without filling required fields 
    Then inline validation errors should appear
        

  # ----------------------------
  # Viewing & Default Behavior
  # ----------------------------

  Scenario:Organization Admin open Trip Details from calendar  [DONE]
    When the Trip Details view is open
    Then the trip Details modal opens with correct trip details

  Scenario: Fleet Manager opens Trip Details for own Fleet Group  [PORTAL]
    When the user logs in as Fleet Manager
    When the Trip Details view is open
    Then the trip Details modal opens with correct trip details

  # ----------------------------
  # Editing Trips
  # ----------------------------

  Scenario: Organization Admin opens Edit Trip modal  [DONE]
    When the Trip Details view is open
    And the user clicks Edit
    And the user fills the trip form and submit the changes
    And a success toast "Trip updated successfully" is shown
    Then the updated trip should appear in the calendar with all its recurrences

  Scenario: Fleet Manager opens Edit Trip modal for assigned Fleet Group   [DONE]
    When the user logs in as Fleet Manager
    When the Trip Details view is open
    And the user clicks Edit
    And the fleet manager fills the trip form and submit the changes
    And a success toast "Trip updated successfully" is shown
    Then the updated trip scheduled by fleet manager should appear in the calendar with all its recurrences

  @Negative
  Scenario: Edit Trip with missing required fields  [DONE]
    when the Edit Trip modal is open
    And user click save without filling required fields 
    Then inline validation errors should appear


  # ----------------------------
  # Filtering
  # ----------------------------

  Scenario: Filter trips by Fleet Group                   [DONE]
    When the user selects Fleet Group filter with value "Test Name" 
    Then only trips belonging to the selected Fleet Groups are shown

  Scenario: Filter trips by Vehicle  [DONE]
    When the user selects Vehicle filter with value "SSA-9835" 
    Then only trips belonging to the selected Vehicle are shown

  

  Scenario: Filter trips by Driver      [DONE]
    When the user selects Driver filter with value "awd"
    Then only trips belonging to the selected Driver are shown

  

  Scenario: Filter trips by Route   [DONE]
    When the user selects Routes filter with value "Route"
    Then only trips belonging to the selected Route are shown

  

  Scenario: Apply multiple filters together                     [DONE]
    When the user selects Fleet Group filter with value "Test Name"
    When the user selects Vehicle filter with value "SSA-9835"
    When the user selects Driver filter with value "awd"
    When the user selects Routes filter with value "Route"
    Then only trips belonging to the selected Filters are shown

  Scenario: Filters persist across calendar interactions      [DONE]
    When the user selects Fleet Group filter with value "Test Name"  
    When the user selects Vehicle filter with value "SSA-9835"
    When the user selects Driver filter with value "awd"
    When the user selects Routes filter with value "Route"
    Then the filter should persist after user switches between Day, Week, and Month views
   

  Scenario: Removing individual filters                       [DONE]
    When the user selects Fleet Group filter with value "Test Name"
    When the user selects Vehicle filter with value "SSA-9835"
    When the user selects Driver filter with value "awd"
    When the user selects Routes filter with value "Route"
    And the user remove the Driver Filter
    Then the calendar updates to reflect remaining filters


  # ----------------------------
  # Deletion
  # ----------------------------

  Scenario: Organization Admin initiates trip deletion          [DONE]
    When the Trip Details view is open
    And the user clicks Delete button
    And user confirms deletion of the trip
    And a success toast "Trip deleted successfully" is shown
    Then the trip is no longer visible in the calendar


  Scenario: Fleet Manager initiates trip deletion for assigned Fleet Group       [DONE]
    Given the user logs in as Fleet Manager
    When the Trip Details view is open
    And the user clicks Delete button
    And user confirms deletion of the trip
    And a success toast "Trip deleted successfully" is shown
    Then the trip is no longer visible in the calendar



  
