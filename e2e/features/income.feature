Feature: Income tracking
  As a finance management user
  I want to manage income records
  So that my earnings are accurate and easy to review

  Background:
    Given the income dashboard is open

  Scenario: Create income and persist it with an audit log
    When I add a "monthly-salary" income of "4200.50" in category "Salary"
    Then the "monthly-salary" income is displayed
    And the "monthly-salary" income is saved in the database
    And the backend logs "income_created" for the "monthly-salary" income

  Scenario: Update an income and persist the changes
    Given I add a "contract-work" income of "750.00" in category "Freelance"
    When I update the "contract-work" income to "consulting-work" for "900.25"
    Then the "consulting-work" income is displayed
    And the "consulting-work" income is saved in the database
    And the backend logs "income_updated" for the "consulting-work" income

  Scenario: Delete an income and remove it from storage
    Given I add a "one-time-bonus" income of "125.00" in category "Other"
    When I delete the "one-time-bonus" income
    Then the "one-time-bonus" income is absent from the database
    And the backend logs "income_deleted" for the "one-time-bonus" income

  Scenario: Filter, sort, and paginate income records
    When I seed 9 income records through the API
    And I reload the income dashboard
    Then the first page contains 8 income records
    When I go to the next page
    Then the second page contains 1 income record
    When I filter the income category to "Salary"
    Then 9 matching income records are found
    When I sort income by amount from highest to lowest
    Then the first income amount is "$9.00"
    When I set the income date range from "2026-01-03" to "2026-01-06"
    Then 4 matching income records are found
