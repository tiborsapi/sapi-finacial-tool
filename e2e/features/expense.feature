Feature: Expense tracking
  As a finance management user
  I want to manage expense records
  So that I know where my money goes

  Background:
    Given the expense dashboard is open

  Scenario: Create expense and persist it with an audit log
    When I add a "weekly-groceries" expense of "84.50" in category "Food"
    Then the "weekly-groceries" expense is displayed
    And the "weekly-groceries" expense is saved in the database
    And the backend logs "expense_created" for the "weekly-groceries" expense

  Scenario: Update and delete an expense with an audit log
    Given I add a "bus-pass" expense of "30.00" in category "Transport"
    When I update the "bus-pass" expense to "train-pass" for "45.25"
    Then the "train-pass" expense is saved in the database
    And the backend logs "expense_updated" for the "train-pass" expense
    When I delete the "train-pass" expense
    Then the "train-pass" expense is absent from the database
    And the backend logs "expense_deleted" for the "train-pass" expense
