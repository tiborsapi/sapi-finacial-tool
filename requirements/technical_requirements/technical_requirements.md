# Technical requirements for the Finance Management web application

## 1. Document purpose

This document defines the technical requirements for the personal finance management web application. It translates the approved product and technical direction into a formal set of system requirements, constraints, quality attributes, and acceptance criteria for the MVP.

## 2. Product overview

The application is a browser-based personal finance management system for a single user. It allows the user to record and manage income, expenses, and invoice-related financial activities, and to view a summary of their financial position over a selected period.

The system must support a clean user experience, secure processing of financial data, reliable persistence, and maintainable application architecture.

## 3. Functional requirements

### FR-01: User account and access

The system shall support a single-user authenticated account model for the MVP.

- The user shall be able to register and log in.
- The system shall restrict financial data to the authenticated user.
- The system shall require secure session handling.

### FR-02: Transaction management

The system shall allow the user to create, read, update, and delete financial transactions.

Each transaction shall include:

- date;
- transaction type (income or expense);
- amount;
- category;
- description;
- optional invoice reference.

### FR-03: Income tracking

The system shall allow the user to record income transactions, including salary and other personal income entries.

### FR-04: Expense tracking

The system shall allow the user to record expense transactions, including recurring and one-time costs.

### FR-05: Invoice support

The system shall allow the user to create invoice-related entries and associate them with financial transactions when relevant.

### FR-06: Financial summary

The system shall calculate and display a summary of:

- total income;
- total expenses;
- net balance;
- selected-period totals.

### FR-07: Data validation

The system shall validate transaction data before saving.

The validation shall reject or flag:

- missing date;
- missing amount;
- missing transaction type;
- negative values where invalid;
- invalid date or malformed values.

### FR-08: Data persistence

The system shall persist user-entered financial data across sessions so records remain available after refresh or re-login.

### FR-09: Edit and delete capability

The user shall be able to edit or delete an existing transaction without corrupting the financial summary.

### FR-10: Categorization

The system shall allow the user to assign a category to each transaction to improve organization and reporting.

## 4. Non-functional requirements

### NFR-01: Performance

The system shall respond to standard transaction operations within acceptable time limits for a single-user application.

Expected targets:

- list transactions: under 2 seconds under normal conditions;
- create or update transaction: under 1 second under normal conditions;
- summary calculation: under 1 second under normal conditions.

### NFR-02: Availability

The system shall be available during standard operating periods and shall avoid data loss in normal use.

### NFR-03: Security

The system shall protect user credentials and financial data through secure application and infrastructure practices.

Required controls:

- HTTPS in production;
- hashed password storage;
- input validation on client and server;
- secure session management;
- protected environment variables and secrets;
- rate limiting on public endpoints;
- CORS restrictions;
- secure logs with no sensitive data exposure.

### NFR-04: Reliability

The system shall prevent accidental data loss and keep records consistent after create, update, or delete operations.

### NFR-05: Maintainability

The codebase shall be structured in a modular manner to support future changes and feature additions.

### NFR-06: Usability

The interface shall be simple and intuitive for a non-technical user.

The UI shall support:

- clear labels;
- validation feedback;
- accessible form controls;
- responsive layout for common desktop browsers.

### NFR-07: Scalability

The system architecture shall support future growth without major redesign.

The MVP architecture shall be designed so that additional features such as recurring transactions, exports, and analytics can be added with moderate refactoring.

## 5. Technical architecture requirements

### TAR-01: Frontend

The frontend shall be built as a browser-based application using:

- React;
- TypeScript;
- Vite;
- Tailwind CSS or equivalent styling framework;
- React Router;
- form validation library or schema validation.

### TAR-02: Backend

The backend shall be implemented using Rust and a web framework designed for API development.

The backend shall include:

- Axum for HTTP server and routing;
- SQLx for database access;
- Serde for JSON serialization and deserialization;
- secure configuration management;
- middleware for validation, logging, and request handling.

### TAR-03: Database

The system shall use a relational database for persistent storage.

The MVP shall use:

- PostgreSQL in production;
- SQLite for local development and lightweight testing scenarios.

The database shall store at least:

- users;
- financial transactions;
- categories;
- invoice-related metadata;
- configuration values if required.

### TAR-04: API requirements

The backend shall expose a structured REST API for the following operations:

- create a transaction;
- retrieve all transactions;
- retrieve a specific transaction;
- update a transaction;
- delete a transaction;
- retrieve totals by selected period;
- user authentication endpoints.

### TAR-05: Observability

The system shall provide structured logs and error tracking to support monitoring and debugging.

Required operational capabilities:

- request logging;
- error recording;
- monitoring of API response time;
- alerts for deployment or runtime issues.

## 6. Quality requirements

### QR-01: Code quality

The project shall enforce code quality through automated checks, including:

- formatting;
- linting;
- static analysis;
- build verification.

### QR-02: Test coverage

The project shall include automated tests for core functionality.

Minimum test requirements:

- unit tests for business logic and validation;
- integration tests for API and persistence behavior;
- end-to-end tests for key user flows;
- performance checks for critical API operations.

### QR-03: Deployment quality

The system shall support deployment to a staging environment before production and shall include deployment validation steps.

## 7. Security and privacy requirements

### SPR-01: Data minimization

The system shall collect only the data required for the product to function.

### SPR-02: Confidentiality

The system shall protect personal and financial information against unauthorized access.

### SPR-03: Authentication and authorization

The system shall ensure that each user can access only their own financial data.

### SPR-04: Privacy by design

The system shall be designed to store as little sensitive data as needed and to minimize exposure risk.

## 8. Compliance considerations

The system shall be designed with compliance in mind for the European market.

This includes:

- GDPR awareness;
- transparency on data processing;
- secure handling of personal and financial data;
- clear privacy notice and user consent where required.

## 9. Acceptance criteria

1. The system shall allow an authenticated user to create an income transaction with valid values.
2. The system shall allow an authenticated user to create an expense transaction with valid values.
3. The system shall allow the user to create and store an invoice-related record.
4. The system shall allow the user to update or delete a transaction.
5. The system shall calculate total income, total expenses, and net balance correctly.
6. The system shall reject invalid transaction data before saving.
7. The system shall preserve data after refresh or subsequent login.
8. The system shall expose a working API to support client operations.
9. The system shall run in a secure environment and protect secrets and session state.
10. The system shall include automated tests covering core business functions.

## 10. Out of scope for MVP

The following are explicitly out of scope for this version:

- bank synchronization;
- investment tracking;
- multi-user collaboration;
- team or family shared accounts;
- AI-based financial recommendations;
- automatic cloud sync across devices;
- advanced reporting and forecasting beyond basic summary totals.

## 11. Summary

This technical requirements specification defines the minimum viable architecture and quality standards for a personal finance management web application. The system is designed around a secure, modular, and testable architecture using React on the frontend and Rust on the backend, with PostgreSQL as the main data store. The requirement set ensures that the MVP remains focused on a clear user need while providing a strong base for future enhancements.
