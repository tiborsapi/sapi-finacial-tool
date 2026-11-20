Feature: Category lists
  As a finance management user
  I want every category the form offers to be accepted when I save
  So that I never pick a category the server then refuses

  Scenario Outline: Every offered category is accepted by the API
    Given the <kind> dashboard is open
    Then every category offered by the <kind> form is accepted by the API

    Examples:
      | kind    |
      | income  |
      | expense |
