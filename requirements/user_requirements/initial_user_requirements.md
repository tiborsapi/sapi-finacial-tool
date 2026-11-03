# Initial user requirements for the MVP (web application)

## 1. Purpose and scope

This document defines the initial user requirements for a personal finance management web application. The goal is to help an individual track income, expenses, and invoice-related transactions in a simple, secure, and efficient way through a browser-based interface.

The minimum viable product (MVP) focuses on the core functionality required for personal financial tracking for a single user. The system is intended for one account owner and does not include bank synchronization, shared accounts, or multi-user collaboration.

## 2. Product objective

The web application should enable the user to:

- record and review personal financial transactions;
- distinguish between income and expenses;
- track invoice-related entries;
- understand monthly cash flow at a high level;
- protect personal and financial information through secure application design.

## 3. MVP scope

### In scope

- adding, editing, and deleting transactions;
- recording income and expense entries;
- tracking invoice information;
- categorizing transactions;
- viewing a simple summary of financial activity;
- storing user data securely in the application environment;
- protecting personal and financial information.

### Out of scope for MVP

- bank account integration or banking API synchronization;
- cloud-based multi-device sync;
- multi-user authentication or team accounts;
- investment portfolio tracking;
- budget forecasting and AI-generated recommendations;
- family or business collaboration features.

## 4. User requirements

### UR-01: Personal financial tracking

The system shall allow the user to track personal financial activities, including income, expenses, and invoice-related transactions.

### UR-02: Transaction recording

The system shall allow the user to create transactions with at least the following fields:

- date;
- type (income or expense);
- amount;
- category;
- description or notes;
- invoice reference, when applicable.

### UR-03: Income entry

The system shall allow the user to record income entries, including regular salary, one-time payments, and other sources of personal income.

### UR-04: Expense entry

The system shall allow the user to record expense entries, including recurring and one-time costs.

### UR-05: Invoice tracking

The system shall allow the user to enter and manage invoice-related transactions, including invoice amount, date, and description.

### UR-06: Data modification

The system shall allow the user to edit or delete an existing transaction if it is incorrect or no longer relevant.

### UR-07: Financial summary

The system shall provide a basic summary of the user’s financial activity, such as total income, total expenses, and net balance over a selected period.

### UR-08: Data protection

The system shall protect the user's personal identity and financial data from unauthorized access and shall store data securely in compliance with privacy best practices.

### UR-09: Data persistence

The system shall retain user-entered financial data between sessions so that records remain available after closing and reopening the application.

### UR-10: Data validation

The system shall validate entered values to prevent invalid or incomplete financial records, such as negative amounts, missing dates, or empty transaction types.

## 5. Functional priorities

### Must have for MVP

- transaction creation;
- income and expense tracking;
- invoice tracking;
- secure data storage;
- financial summary overview;
- edit and delete functionality.

### Nice to have later (not MVP)

- recurring transactions;
- CSV or PDF export;
- charts and analytics;
- spending categories and budgets;
- mobile application version.

## 6. Technical requirements

### Security

- personal and financial data shall be stored and processed using secure application practices;
- sensitive information shall not be exposed in plain text where avoidable;
- the web application shall handle user data with privacy in mind.

### Usability

- the application shall be easy to use for a single-user personal finance workflow;
- users shall be able to add a transaction quickly without unnecessary steps.

### Reliability

- the application shall save user entries reliably;
- financial data shall remain consistent after edits or deletions.

### Accessibility

- the web application shall support standard browser usability and keyboard-accessible controls as far as practical;
- content shall remain readable and easy to navigate on common desktop and laptop screen sizes.

## 7. Acceptance criteria

1. A user can add an income transaction with a valid date, amount, and type.
2. A user can add an expense transaction with a valid date, amount, and type.
3. A user can record invoice-related information and associate it with a financial entry.
4. The system stores the data in a secure application environment and preserves it after reloading or revisiting the app.
5. The user can edit or delete a previously entered transaction.
6. The system displays a summary of total income, total expenses, and resulting balance for a selected period.
7. Invalid data, such as a missing amount or date, is rejected or flagged before saving.

## 8. Summary

This MVP delivers a secure, browser-based personal finance tracker focused on basic transaction management and simple financial visibility. It provides the minimum required functionality to support personal financial organization without expanding into broader banking, accounting, or collaboration features.
