Feature: Customer Management

    Background: 
		Given the admin user is logged in

    Scenario: Add a customer and verify it appears in search results
        When the user add a new customer with valid details
        Then a customer created sucessfully should appear
        Then the customer searches for the new customer's name in the customer table
        And the new customer should be listed in the search results

    Scenario: Search for 'xyz' and verify that no customers are found
        When the user searches for "xyz" in the customers table
        Then a "No customers found" message should be displayed

    Scenario: View the added customer and verify the correct modal appears
        When the user clicks the view icon for the new customer
        Then the customer details modal should be displayed
        And the modal should show the correct customer details

     Scenario: Edit the newly added customer and verify that edits have been saved successfully
        When the user clicks the edit icon for the new customer
        And the user edits the customer's details and saves the changes
        Then a "Customer updated successfully!" notification should be displayed

    Scenario: Delete the added customer and verify that it is removed
        When the user clicks the delete icon for the new customer
        And the user confirms the deletion of the added customer
        Then a "Customer deleted successfully" notification should be displayed
        And the customer should no longer appear in the customers table
    
    
    
    Scenario: verify all filter options are available and can be selected
        When the user opens the filter dialog on the Customers table
        And the user selects customer filter "Deployment Type" with value "SaaS"
        And the user click Apply button in the customer filter dialog
        Then the Customers table should display filtered results based on the applied filters
    
    Scenario: Verify all sort options are available and can be selected
        When the user opens the sort dropdown on the Customers table
        Then the Customer sort dropdown menu should contain the following options:
        | Newest                          |
        | Oldest                          |
        | Customer Name (A-Z)             |
        | Customer Name (Z-A)             |
        | Admin Name (A-Z)                |
        | Admin Name (Z-A)                |
        Then the user opens the sort dropdown on the Customers table
        And the user selects "Customer Name (A-Z)" from the Customer sort dropdown menu
        Then the Customers table should be sorted by "Customer Name (A-Z)"
        Then the customer table should display results sorted according to the applied sort
        And the user selects "Admin Name (A-Z)" from the Customer sort dropdown menu
        Then the Customers table should be sorted by "Admin Name (A-Z)"
        Then the customer table should display results sorted according to the applied sort
    
    Scenario: Apply filters and sort together and verify combined results
        When the user opens the filter dialog on the Customers table
        And the user selects customer filter "Deployment Type" with value "SaaS"
        And the user click Apply button in the customer filter dialog
        Then the Customers table should display filtered results based on the applied filters
        
        And the user selects "Customer Name (A-Z)" from the Customer sort dropdown menu
        Then the Customers table should be sorted by "Customer Name (A-Z)"
        Then the customer table should display results sorted according to the applied sort
        And the user selects "Admin Name (A-Z)" from the Customer sort dropdown menu
        Then the Customers table should be sorted by "Admin Name (A-Z)"
        Then the customer table should display results sorted according to the applied sort
