# Finance Management

## Development with Docker

The development stack runs the Rust/Axum backend, the Vite frontend, and a PostgreSQL database in Docker. Docker Compose and Docker Engine are required.

Start both applications (and the database) from the repository root:

```sh
docker compose up --build
```

Or start just one application. Starting the backend also starts its database:

```sh
docker compose up --build backend
docker compose up --build frontend
```

The same commands are available through scripts:

```powershell
./scripts/dev.ps1 up
./scripts/dev.ps1 backend
./scripts/dev.ps1 frontend
```

```sh
./scripts/dev.sh up
./scripts/dev.sh backend
./scripts/dev.sh frontend
```

The same-origin development site is at <http://localhost:8081>. The reverse proxy routes the frontend and its Vite hot-reload websocket to the Vite container, and `/api/*` and `/health` to the backend. The direct development ports remain available at <http://localhost:5173> (frontend) and <http://localhost:8080> (backend). The backend watcher recompiles and restarts the server when Rust source changes.

The local database is available on port `5433` with database `finance_db`, user `finance`, and password `finance_dev_password` (for development only). Income records are stored in PostgreSQL and the backend applies the schema on startup. The income screen supports create, edit, delete, search, category and date filters, sortable columns, and pagination; amounts are stored in cents and displayed in USD.

The API is available under `/api/incomes`: `GET` lists records (with `q`, `category`, `from`, `to`, `page`, `per_page`, `sort_by`, and `sort_order` query parameters); `POST` creates; `GET /api/incomes/:id` reads one; `PUT` updates; and `DELETE` removes a record. Use `amount_cents` in request bodies to avoid floating-point rounding.

Expenses work the same way under `/api/expenses` (same fields, query parameters and responses) and are shown on the Expenses page at <http://localhost:8081/expenses>. The two kinds are stored in separate tables (`incomes`, `expenses`) and have separate category lists: income uses Salary, Freelance, Investments, Business and Other; expenses use Rent, Food, Transport, Utilities, Health and Other. The backend logs `income_*` and `expense_*` audit events. Expenses reuse the income field names `source` (who or what was paid) and `received_on` (the date of the expense).

Stop the containers with `./scripts/dev.ps1 down` on PowerShell or `./scripts/dev.sh down` on macOS/Linux. To follow logs, use the `logs` action. The PostgreSQL data volume is retained when containers stop; remove it only when you want to reset local development data:

```sh
docker compose down --volumes
```

## Continuous integration

The GitHub Actions workflow in `.github/workflows/ci.yml` runs for every push, pull request, and manual dispatch. It checks Rust formatting and Clippy, runs backend tests and builds the release backend, runs frontend tests and builds the production frontend, runs the PostgreSQL database BDD tests against the project migration, and builds the Docker Compose stack before running the browser E2E suite.

The workflow checks out the public project submodules, uses disposable PostgreSQL databases, and tears down its Docker Compose stack after the browser tests.

## Local development

- Backend: from `backend`, run `cargo run` with `DATABASE_URL=postgresql://finance:finance_dev_password@localhost:5433/finance_db` and optionally `PORT` (defaults to `8080`) and `RUST_LOG` (defaults to `info`).
- Frontend: from `frontend`, run `npm ci`, then `npm run dev`.

The frontend dev server proxies `/api` requests to `http://localhost:8080` by default. Set `VITE_API_PROXY_TARGET` when the backend is hosted elsewhere. When using Docker Compose, use <http://localhost:8081> to serve the frontend and backend under the same origin; the direct ports are optional shortcuts.

If the income API returns `404` after updating the code, recreate the development containers so the backend routes and frontend proxy configuration are refreshed:

```sh
docker compose up --build --force-recreate backend frontend
```

## Backend and frontend tests

These unit and component tests do not require Docker or a running database.

Run the backend tests from the repository root:

```powershell
cargo test --manifest-path backend/Cargo.toml
```

Run the frontend component tests:

```powershell
cd frontend
npm ci
npm test
```

The backend tests cover input normalization and validation, listing filter and pagination constraints, sort-field allowlisting, and API error status mapping, for both incomes and expenses.

The backend also has HTTP-level API tests that run the real router against PostgreSQL (CRUD, filters, sorting, pagination, validation errors, SQL-injection input, and isolation between incomes and expenses). Each test gets its own throwaway database, so they need a PostgreSQL server where `DATABASE_URL` can create databases, and are marked `#[ignore]` so plain `cargo test` still needs no database. With the Compose stack running:

```sh
docker compose exec backend cargo test -- --include-ignored
```

or, from the host:

```sh
DATABASE_URL=postgres://finance:finance_dev_password@localhost:5433/finance_db \
  cargo test --manifest-path backend/Cargo.toml -- --include-ignored
``` The frontend tests exercise create/edit/delete UI flows, amount validation, and search, category/date filtering, sorting, and pagination using a mocked API. Use the E2E suite below to test the integrated application against PostgreSQL and a real browser.

## PostgreSQL database integration tests

The `db-integration` suite uses Cucumber/Gherkin and connects directly to PostgreSQL. It verifies the migrated income and expense tables, their constraints and indexes, rejection of non-positive amounts, and rejection of missing required fields. Persistence behaviour (create, update, delete, listing, and re-applying the migrations) is covered by the backend API tests, which run against PostgreSQL. Tests insert records with unique `dbbdd-*` source prefixes and remove only those records during cleanup.

Start the backend and its database from the repository root in one terminal. Backend startup applies the database migration:

```powershell
docker compose up --build backend
```

In another terminal, install the suite dependencies and run the scenarios:

```powershell
cd db-integration
npm ci
npm test
```

The default connection uses the local Compose database at `localhost:5433` and the development credentials in `compose.yaml`. Set `DB_TEST_DATABASE_URL` to use a dedicated test database, for example in PowerShell:

```powershell
$env:DB_TEST_DATABASE_URL = "postgres://finance:test_password@localhost:5433/finance_test_db"
npm test
Remove-Item Env:DB_TEST_DATABASE_URL
```

The selected database must already have the backend migration applied. Use a disposable or dedicated test database; do not point this suite at production.

## Performance test

A k6 latency test measures p50/p95/p99 for every income and expense endpoint at 1k, 10k and 100k rows per table, against an optimised backend and a separate `finance_perf` database (your development data is not touched):

```sh
./perf/run.sh
```

It needs Docker and builds a release-mode backend image on the first run. See [perf/README.md](./perf/README.md) for what is measured, the baseline numbers, how to clean up, and how it runs in CI (a small smoke run on every push, the full run nightly).

## Gherkin end-to-end tests

The `e2e` suite uses Cucumber (Gherkin), Playwright, and PostgreSQL. It drives the app through the same-origin proxy, verifies the resulting database rows, and checks backend audit logs for create, update, and delete events. The scenarios also exercise search filtering, sorting, date filters, and pagination.

### Run without opening a browser (headless mode)

This is the default and recommended mode for normal local runs and CI.

1. Start the development stack in a terminal:

   ```sh
   docker compose up --build
   ```

2. In another terminal, install the E2E dependencies and Chromium once:

   ```sh
   cd e2e
   npm ci
   npx playwright install chromium
   ```

3. Run all Gherkin scenarios in headless mode:

   ```sh
   npm test
   ```

4. Or run just the income feature:

   ```sh
   npm run test:income
   ```

### Run with a visible browser (headed mode)

Use headed mode when you want to watch the browser interactions while the tests run.

1. Start the stack as above.
2. Install dependencies if needed:

   ```sh
   cd e2e
   npm ci
   npx playwright install chromium
   ```

3. Run Playwright in headed mode:

   ```sh
   PWDEBUG=1 npm test
   ```

4. To run the income feature with the browser visible:

   ```sh
   PWDEBUG=1 npm run test:income
   ```

   In PowerShell, set the environment variable before running the test:

   ```powershell
   $env:PWDEBUG = "1"
   npm run test:income
   Remove-Item Env:PWDEBUG
   ```

   To show the browser while running all scenarios, use `npm test` instead. The environment variable applies to commands in the current PowerShell session; remove it afterward to return to headless mode.

### Environment notes

The defaults expect the app at `http://localhost:8081` and the development database at `postgresql://finance:finance_dev_password@localhost:5433/finance_db`.
Override these with `E2E_BASE_URL` and `E2E_DATABASE_URL` when using a dedicated test stack/database. Scenarios create uniquely prefixed `bdd-*` records and remove only those records during cleanup. Run against a disposable or dedicated test database, not production. Backend log assertions read `docker compose logs backend`, so run the test command from this repository's `e2e` directory while the Compose stack is available.

The Gherkin scenarios are in [e2e/features/income.feature](./e2e/features/income.feature), [e2e/features/expense.feature](./e2e/features/expense.feature), and [e2e/features/categories.feature](./e2e/features/categories.feature) (which checks that every category the forms offer is accepted by the API); their Playwright, PostgreSQL, and Docker log steps are in [e2e/features/step_definitions/records.steps.js](./e2e/features/step_definitions/records.steps.js). The audit-log steps are reported as skipped when Docker is not available.
