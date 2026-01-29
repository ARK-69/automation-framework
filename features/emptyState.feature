Feature: Empty State Validation
  As a user
  I want to see correct empty-state messages
  So I know no data exists in each module

  Background:
    Given the user logs in using empty-state credentials

  Scenario: Vehicle empty state
    When the user navigates to the Vehicle tab
    Then the page should display the message "No vehicles added yet"

  Scenario: Drivers empty state
    When the user navigates to the Drivers tab
    Then the page should display the message "No drivers added yet"

  Scenario: Devices empty state
    When the user navigates to the Devices tab
    Then the page should display the message "No devices added yet"

  Scenario: Fleet Group empty state
    When the user navigates to the Fleet Group tab
    Then the page should display the message "No fleet groups created yet"