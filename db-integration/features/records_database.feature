Feature: Income and expense tables
  As the finance application
  I want the income and expense tables to enforce their schema and constraints
  So that invalid financial data can never be stored, whatever the application does

  Scenario Outline: The table has the migrated columns and indexes
    When I inspect the <kind> database schema
    Then the <kind> table has the required columns
    And the <kind> table has the expected lookup indexes

    Examples:
      | kind    |
      | income  |
      | expense |

  Scenario Outline: The database rejects a non-positive amount
    When I attempt to insert a "<alias>" <kind> of <amount> cents
    Then the database rejects the <kind> because its amount must be positive

    Examples:
      | kind    | alias           | amount |
      | income  | zero-amount     | 0      |
      | income  | negative-amount | -1     |
      | expense | zero-amount     | 0      |
      | expense | negative-amount | -1     |

  Scenario Outline: The database rejects a record with a missing required field
    When I attempt to insert one <kind> without its <column>
    Then the database rejects the <kind> because <column> is required

    Examples:
      | kind    | column       |
      | income  | amount_cents |
      | income  | source       |
      | income  | category     |
      | income  | received_on  |
      | expense | amount_cents |
      | expense | source       |
      | expense | category     |
      | expense | received_on  |
