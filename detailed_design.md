# Finance Management Detailed Design

## 1. Purpose

This document defines the detailed design for the current Finance Management application, aligned to the requirements in the project repository and the implemented income-focused MVP. It describes the functional decomposition, system architecture, data model, API contracts, and the test traceability used to validate the design.

The design follows the architecture described in the project requirements and architecture documents, with the implemented scope focusing on income tracking, validation, filtering, sorting, pagination, and persistence.

## 2. Scope and implementation status

### In scope for the current implementation

- Create income records
- Edit income records
- Delete income records
- Search by source or description
- Filter by category and date range
- Sort by source, category, date, or amount
- Paginate income rows
- Persist records in PostgreSQL
- Validate incoming API payloads
- Log create, update, and delete audit events
- Create, edit, delete, search, filter, sort, and paginate expense records (separate `expenses` table and `/api/expenses` routes sharing the income validation and listing code)

### Outside the current implementation

- authentication and user accounts
- invoice management
- multi-user access control
- monthly financial summary beyond the income dashboard
- advanced reporting and analytics

This is intentionally a subset of the broader product vision in the user requirements; the codebase implements the currently prioritized income workflow.

## 3. Design drivers and constraints

### Functional drivers

- user must be able to enter and manage income records quickly;
- the interface should reflect real income lifecycle operations;
- the backend should enforce validation before persisting data;
- filtered and sorted lists should remain consistent with the database state.

### Quality drivers

- reliability of create/update/delete operations;
- consistent validation rules on both client and server;
- maintainability through separation of UI and API responsibilities;
- easy testability via Cucumber, Vitest, and Rust unit tests.

### Constraints

- single-user MVP versus multi-user application;
- browser-based UI using React and Vite;
- Rust backend with Axum and SQLx;
- PostgreSQL in development and local integration stack;
- dev stack is containerized through Docker Compose.

## 4. System context

The system is structured as a three-tier application:

1. Presentation tier
   - React frontend using Vite
   - dashboard and modal form
   - client-side validation and formatting

2. Application tier
   - Rust/Axum API
   - income routes and validation logic
   - persistence and logging

3. Data tier
   - PostgreSQL database
   - incomes table for records and audit-friendly metadata

The frontend and backend are exposed via the same-origin proxy at http://localhost:8081 in the local environment, while the backend is also directly available at http://localhost:8080.

## 5. Detailed architecture

### 5.1 Frontend architecture

The frontend entry point is the React app in `frontend/src/App.tsx`.

Key responsibilities:

- render the dashboard shell and summary cards;
- manage filter state (`q`, `category`, `from`, `to`, `sort_by`, `sort_order`, `page`);
- trigger API requests through the `incomeApi` module;
- render the add/edit modal form;
- handle create, edit, and delete flows;
- show loading, empty, and error states.

Important elements:

- `DashboardPage` - contains list state, filters, pagination, search, and actions
- `IncomeForm` - handles data entry and validation for source, amount, category, date, and note
- `amountToCents` - converts user-entered decimal values to integer cents, preventing floating-point rounding issues
- `listIncomes` / `createIncome` / `updateIncome` / `deleteIncome` - central API client layer

### 5.2 Backend architecture

The backend implements REST endpoints in `backend/src/api/incomes.rs`.

Routes:

- `GET /api/incomes` - list, filter, sort, and paginate income records
- `POST /api/incomes` - create an income
- `GET /api/incomes/:id` - read a specific income
- `PUT /api/incomes/:id` - update an income
- `DELETE /api/incomes/:id` - delete an income

Key backend responsibilities:

- validate input values, string lengths, categories, page size, and date ordering;
- normalize string values and strip leading/trailing whitespace;
- map invalid inputs to structured 422 error responses;
- execute SQL queries against PostgreSQL with SQLx;
- compute totals and pagination metadata;
- log audit events using `tracing::info!`.

### 5.3 Data model

The application stores income records in a PostgreSQL table similar to:

- id
- amount_cents
- source
- category
- description
- received_on
- created_at
- updated_at

The implementation validates these values on server side and prepares consistent values for storage. The design supports future extension to a broader transaction model without changing the UI contract.

### 5.4 Observability and audit trail

The implemented backend logs events for operational confirmation:

- `income_created`
- `income_updated`
- `income_deleted`

These logs are used by the end-to-end tests to validate that the persistence flow not only updates the row, but also produces the expected activity record in the backend logs.

## 6. Detailed functional design

### 6.1 Create income flow

1. User clicks “Add income”.
2. `IncomeForm` opens in dialog mode.
3. User enters source, amount, category, received date, and optional note.
4. Client validates amount as positive and decimal-safe.
5. Frontend sends a POST request to `/api/incomes`.
6. Backend validates request body and category membership.
7. Backend inserts the row and returns the created record.
8. Frontend refreshes the list and closes the modal.

### 6.2 Update income flow

1. User clicks “Edit” for existing row.
2. Form is pre-populated with current data.
3. User changes source or amount and saves.
4. Frontend sends a PUT request to `/api/incomes/:id`.
5. Backend validates and updates the row.
6. Backend logs `income_updated`.
7. Frontend refreshes the record list.

### 6.3 Delete income flow

1. User clicks “Delete”.
2. Browser confirms deletion before proceeding.
3. Frontend calls `DELETE /api/incomes/:id`.
4. Backend removes the row and returns `204`.
5. Backend logs `income_deleted`.
6. UI refreshes or adjusts pagination if the removed row was the last record on the current page.

### 6.4 List, search, filter, sort, and pagination

The list endpoint accepts filtering and sorting parameters:

- `q` for textual search across source and description
- `category` for exact category match
- `from` and `to` for received date bounds
- `page` and `per_page` for pagination
- `sort_by` for `received_on`, `amount`, `source`, `category`, or `created_at`
- `sort_order` for `asc` or `desc`

The backend builds a dynamic WHERE clause and a dynamic ORDER BY statement. Pagination metadata is returned in the payload alongside the current records.

## 7. Design decisions and rationale

### 7.1 Why React + Vite?

The frontend uses React and Vite for fast development iteration, small component architecture, and straightforward integration with Playwright-based browser tests.

### 7.2 Why Rust + Axum?

Rust provides strong type safety, memory safety, and predictable runtime behavior. Axum is a lightweight and idiomatic web framework for API development, which fits the project’s technical requirements.

### 7.3 Why PostgreSQL?

PostgreSQL provides transactional safety, SQL validation, relational integrity, and a mature ecosystem for SQLx-based application development.

### 7.4 Why cents for money?

The frontend and backend use integer cents to avoid floating-point precision errors. This is essential when entering financial amounts such as 4200.50.

## 8. Security and reliability design

### Security controls

- server-side validation of all incoming values;
- strict category allowlist rather than arbitrary user input;
- input string trimming and length limits;
- API error responses that do not expose internal server details;
- no secret values are embedded in application logic; environment variables are used for local configuration.

### Reliability controls

- idempotent API flows through consistent update and delete semantics;
- database queries validate rows affected after delete and update;
- frontend refreshes state after successful mutation;
- pagination adjusts when records are removed from the current page;
- E2E tests validate the database row after mutation, not just the UI state.

## 9. Test strategy and validation

The project uses three complementary layers of validation:

1. Backend unit tests
   - income input normalization and invalid-field rejection
   - listing filter, date-range, and page-size constraints
   - sort-field allowlisting and API error status mapping

2. Frontend component tests
   - create, update, and delete flows through mocked fetch calls
   - amount validation before API submission
   - search, category/date filtering, sorting, and pagination state

3. Database integration tests
   - migrated PostgreSQL schema, check constraint, and lookup indexes
   - persisted insert/update/delete operations
   - rejection of invalid amounts by the database

4. End-to-end browser tests
   - real browser navigation through the app
   - database verification and backend log verification

This layered approach validates the database contract separately from the API/browser flow, as well as end-to-end persistence and auditing.

## 10. Traceability overview

The requirement-to-design traceability for the implemented income subsystem is recorded in the CSV file `traceability_matrix.csv` in the repository root. It links:

- user requirements (
  UR-01 to UR-10)
- technical requirements (
  FR-xx, NFR-xx, TAR-xx, QR-xx)
- design elements (D-01 to D-08)
- tests and test status

This traceability matrix is the authoritative record tying specification, design, and verification evidence together.
