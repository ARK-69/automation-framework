                                                                                                                    Feature: Route Management

  Background:
    Given the user has logged in and has navigated to Routes

    Scenario: Add route and verify it in the list
        When the user click Add Route button
        And the user has filled the route form
        And the user has clicked Save Route button
        Then the route should appear in the Routes list

    Scenario: Edit the route and verify the changes
        When the user clicks the edit icon for the new Route
        And the user has changed the route information
        Then the new route information should be visible in the Routes list
    
    Scenario: Archive the Route
        When the user searches the route with route name
        And the user is the owner of the Route
        And the user has clicked Archive button
        Then the Routes should appear in the Archive Route

    Scenario: Unarchive the route
        When the user searches the route with route name
        And the user is the owner of the Route
        Then the user clicked unarchive button
        Then the Route should be remove from Archived Routes
    
    Scenario: Verify the Routes details
        When the user press the view icon on a route
        Then that routes detailed information should be displayed
        
    Scenario: Verify Route detail can only be edit by the owner
        When the user logs in with another account
        Then the routes that are created by other users are not editable
    
    Scenario: Verify Route can only be archived by the owner
        When the user logs in with another account
        Then the routes that are created by other users cannot be archived

    Scenario: Verify that 

    Scenario: verify all filter options are available and can be selected
        When the user opens the filter dialog on the routes page
        And the user selects "No of Stops" route filter with value "2-5"
        And the user selects "Total Distance" route filter with value "200+ km"
        And the user selects "Total Duration" route filter with value "1-4h"
        And the user selects "Created By" route filter with value "check"
        And the user clicks Apply button in the routes filter dialog
        Then the routes table should display filtered results based on the applied filters

    Scenario: Verify all sort options are available and can be selected
        When the user opens the sort dropdown on the Routes table
        Then the route sort dropdown menu should contain the following options:
          | Newest            |
          | Oldest            |
          | Shortest Distance  |
          | Longest Distance   |
          | Fewest Stops       |
          | Most Stops         |

        
        And the user selects "Oldest" from the route sort dropdown menu
        Then the Routes table should be sorted by "Oldest"

        When the user opens the sort dropdown on the Routes table
        And the user selects "Shortest Distance" from the route sort dropdown menu
        Then the Routes table should be sorted by "Shortest Distance"

        When the user opens the sort dropdown on the Routes table
        And the user selects "Longest Distance" from the route sort dropdown menu
        Then the Routes table should be sorted by "Longest Distance"

        When the user opens the sort dropdown on the Routes table
        And the user selects "Fewest Stops" from the route sort dropdown menu
        Then the Routes table should be sorted by "Fewest Stops"

        When the user opens the sort dropdown on the Routes table
        And the user selects "Most Stops" from the route sort dropdown menu
        Then the Routes table should be sorted by "Most Stops"