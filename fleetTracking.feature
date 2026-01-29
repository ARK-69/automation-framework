Feature: Fleet Live and History Management

    Background:
        Given the user has logged in and has navigated to Fleet Tracking

  Scenario: Apply Fleet Group and Status filters on Live tab
    When the user opens the Live tab
    And the user selects a Fleet Group from the Fleet Group dropdown
    And the user selects a Status from the Status dropdown
    Then the vehicle cards panel should display only vehicles matching the applied filters
    And the map should display only the filtered vehicles

  Scenario: Clear filters and verify all vehicles appear
    Given the user is viewing filtered vehicle results on the Live tab
    When the user clears all applied filters
    Then the vehicle cards panel should display all vehicles
    And the map should display all vehicles

  Scenario: Verify vehicle cards, sorting, and pagination
    When the user opens the Live tab
    Then exactly 6 vehicle cards should be displayed
    When more than 6 vehicles exist
    And the user clicks the pagination controls
    Then the next or previous set of 6 vehicles should be displayed

  Scenario: Select a vehicle card and verify map and card sync
    When the user selects a vehicle from the left cards panel
    Then the selected card should be highlighted
    And the map should center on the selected vehicle
    And the map should display the selected vehicle’s live route
    And the map should display the single-vehicle info card

  Scenario: Navigate clusters and view individual vehicles
    Given the map is zoomed out on the Live tab
    When multiple vehicles are close together
    Then they should appear as clusters showing the vehicle count
    When the user clicks a cluster or zooms in
    Then the cluster should expand into individual vehicle indicators

  Scenario: Select a vehicle on the map and verify card sync
    When the user selects a vehicle indicator on the map
    Then the map should display the vehicle’s route path
    And the single-vehicle info card should appear
    And the corresponding vehicle card should be highlighted

  Scenario: Verify real-time updates on Live tab
    Given the user is viewing the Live tab
    When vehicles update their position or status in real time
    Then the "Last Update" timestamps on the vehicle cards should update
    And the map indicators should update their positions and status colors

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

  Scenario: Expand an active route segment and view it on the map
    When the user expands an Active segment in the Route Log
    Then the segment should be highlighted
    And the map should display only that segment with event icons

  Scenario: Expand a geofence exit segment and view deviation
    When the user expands a Geofence Exit segment in the Route Log
    Then the segment should be highlighted
    And the map should display only the off-route segment as a red dotted line
    And exit and re-entry icons should be visible

  Scenario: View idle events
    When the Route Log displays idle entries
    Then each idle entry should show timestamp, location, and idle duration
    And the corresponding idle point should appear on the map with an idle icon

  Scenario: Hover event icons on the route map
    When the user hovers over any event icon on the map
    Then a tooltip should display the event time and location details

  Scenario: View Trip Summary Card details
    When the Trip Summary Card is displayed
    Then it should show driver details, start and end addresses, total distance, total time, safety concerns, fuel consumption, average speed, and idle time
    When the user hovers over the "Total Safety Concerns" info icon
    Then a tooltip with the breakdown should appear

  Scenario: Focus a segment and return to full route
    When the user selects a segment (Active or Geofence Exit)
    Then the map should zoom into and highlight only that segment
    When the user collapses the segment or selects another segment
    Then the map should return to showing the full journey route

  Scenario: Vehicle out of geofence should display alert and display on top
    When a vehicle exits its assigned geofence
    Then a red alert "Vehicle exited geofence area." should be displayed on the vehicle card
    And the exited vehicle should move to the top of the vehicle list

  Scenario: Select an off-route vehicle and verify deviation information
    Given a vehicle has exited the geofence
    When the user selects that vehicle
    Then the map should display the live route as a solid green line
    And the deviating path as a dotted red line
    And the vehicle marker should display a red blinking ring
    And the map info card should display the deviation message with distance and location

  Scenario: Vehicle re-enters geofence and remove alerts
    Given a vehicle is outside the geofence with a red alert displayed
    When the vehicle re-enters the geofence
    Then a green alert "Vehicle re-entered geofence area." should be displayed for 5 seconds
    When 5 seconds pass
    Then the green alert should disappear
    And the vehicle card should return to its default sorted position
    And the red blinking ring should be removed from the map indicator

  Scenario: Verify multiple off-route vehicles are grouped at the top
    Given multiple vehicles exit their geofences
    When the user views the vehicle list
    Then all off-route vehicles should appear at the top with red alerts

  Scenario: Filters applied while off-route vehicles exist
    Given some vehicles are off-route
    When the user applies Fleet Group or Status filters
    Then only off-route vehicles matching the filters should appear at the top
    And only filtered vehicles should appear on the map

  Scenario: View route legend for off-route vehicle
    Given at least one vehicle has exited its geofence
    When the user selects an off-route vehicle
    Then the map legend should display:
      | Solid green line | Live Route     |
      | Dotted red line  | Deviating Path |

  Scenario: Verify real-time deviation distance updates
    Given a vehicle is outside the geofence and selected
    When the vehicle moves further from or closer to the geofence
    Then the deviation distance on the map info card should update in real time
    And the deviating path on the map should update as well