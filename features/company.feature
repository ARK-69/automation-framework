Feature: Company Configuration Management
  As a logged-in user, the user should be able to update customer details and company branding.

  Background:
    Given the user is logged in and navigates to the Company page
@Positive
  Scenario: Update Customer Information
    When the user click the edit icon on the Customer information
    And the user update the Admin Name to ""
    And the user update the Admin Phone to ""
    And the user select "" as the country
    And the user select "" as the industry
    And the user select "" as the business type
    And the user change the address to ""
   Then The customer information changes are saved successfully

  Scenario: Update Branding Configuration
    When the user click the edit icon for the branding configuration
    And the user click the delete icon to remove the current logo
    And the user click the delete icon to remove favicon
    And the user upload "" company logos
    And the user change the primary color to ""
    And the user change the secondary color to ""
    Then The branding changes are saved successfully

  @Negative
  Scenario: Update Company Information with empty Admin Name
    When the user click the edit icon on the Customer information
    And the user leave the Admin Name empty
    And the user fills rest of the field
    Then The admin name field should give validation error
   

