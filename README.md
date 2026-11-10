# Finance Management

## Development with Docker

The development stack runs the Rust/Axum backend, the Vite frontend, and a
PostgreSQL database in Docker. Docker Compose and Docker Engine are required.

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
.\scripts\dev.ps1 up
.\scripts\dev.ps1 backend
.\scripts\dev.ps1 frontend
```

```sh
./scripts/dev.sh up
./scripts/dev.sh backend
./scripts/dev.sh frontend
```

The same-origin development site is at <http://localhost:8081>. The reverse
proxy routes the frontend and its Vite hot-reload websocket to the Vite
container, and `/api/*` and `/health` to the backend. The direct development
ports remain available at <http://localhost:5173> (frontend) and
<http://localhost:8080> (backend). The backend watcher recompiles and restarts
the server when Rust source changes.
The local database is available on port `5433` with database `finance_db`,
user `finance`, and password `finance_dev_password` (for development only).
Income records are stored in PostgreSQL and the backend applies the schema on
startup. The income screen supports create, edit, delete, search, category and
date filters, sortable columns, and pagination; amounts are stored in cents
and displayed in USD.

The API is available under `/api/incomes`: `GET` lists records (with
`q`, `category`, `from`, `to`, `page`, `per_page`, `sort_by`, and `sort_order`
query parameters); `POST` creates; `GET /api/incomes/:id` reads one; `PUT`
updates; and `DELETE` removes a record. Use `amount_cents` in request bodies
to avoid floating-point rounding.

Stop the containers with `.\scripts\dev.ps1 down` on PowerShell or
`./scripts/dev.sh down` on macOS/Linux. To follow logs, use the `logs` action.
The PostgreSQL data volume is retained when containers stop; remove it only
when you want to reset local development data:

```sh
docker compose down --volumes
```

## Local development

- Backend: from `backend`, run `cargo run` with
  `DATABASE_URL=postgres://finance:finance_dev_password@localhost:5433/finance_db`
  and optionally `PORT` (defaults to `8080`) and `RUST_LOG` (defaults to `info`).
- Frontend: from `frontend`, run `npm ci`, then `npm run dev`.

The frontend dev server proxies `/api` requests to `http://localhost:8080` by
default. Set `VITE_API_PROXY_TARGET` when the backend is hosted elsewhere.
When using Docker Compose, use <http://localhost:8081> to serve the frontend
and backend under the same origin; the direct ports are optional shortcuts.

If the income API returns `404` after updating the code, recreate the
development containers so the backend routes and frontend proxy configuration
are refreshed:

```sh
docker compose up --build --force-recreate backend frontend
```

## Gherkin end-to-end tests

The `e2e` suite uses Cucumber (Gherkin), Playwright, and PostgreSQL. It drives
the app through the same-origin proxy, verifies the resulting database rows,
and checks backend audit logs for create, update, and delete events. The
scenarios also exercise search filtering, sorting, date filters, and
pagination.

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

3. Run all Gherkin scenarios:

   ```sh
   npm test
   ```

The defaults expect the app at `http://localhost:8081` and the development
database at `postgres://finance:finance_dev_password@localhost:5433/finance_db`.
Override these with `E2E_BASE_URL` and `E2E_DATABASE_URL` when using a
dedicated test stack/database. Scenarios create uniquely prefixed `bdd-*`
records and remove only those records during cleanup. Run against a
disposable or dedicated test database, not production. Backend log assertions
read `docker compose logs backend`, so run the test command from this
repository's `e2e` directory while the Compose stack is available.

The Gherkin scenarios are in [e2e/features/income.feature](./e2e/features/income.feature);
their Playwright, PostgreSQL, and Docker log steps are in
[e2e/features/step_definitions/income.steps.js](./e2e/features/step_definitions/income.steps.js).
