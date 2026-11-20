# Performance test

A single-user latency test, not a load test. One virtual user ([k6](https://k6.io), run in Docker) calls
every income and expense endpoint repeatedly against a seeded database and reports p50, p95 and p99 per
endpoint. Run it at several table sizes to see how each endpoint grows.

```sh
./perf/run.sh                      # 1k, 10k and 100k rows per table
SIZES="10000" ./perf/run.sh        # one size
ITER=50 P95_MS=200 ./perf/run.sh   # fewer iterations, tighter p95 limit
```

Needs Docker (the script is bash; on Windows run it from WSL or Git Bash). The first run builds an
optimised backend image, which takes a few minutes. Nothing is installed locally and your development data
is never touched: the test uses its own `finance_perf` database and a release-mode backend on port 8090.
To remove it afterwards:

```sh
docker compose --profile perf rm -sf backend-release k6
docker compose exec db psql -U finance -d postgres -c "DROP DATABASE finance_perf"
docker image rm grafana/k6:0.54.0 finance-management-backend:release   # optional
```

## What it measures

Per kind (incomes and expenses): list with defaults, search with matches, search with no matches,
category and date filter, sort by amount, sort by source, the last page, get by id, and create, update
and delete (which leave the table the size it was). Each iteration calls every endpoint once; 5 untimed
last-page requests per kind (in `setup()`) warm things up first. The run fails if any endpoint's p95 exceeds `P95_MS` (default 300 ms) or
any response has the wrong status.

`seed.sql` generates the data from the row number alone, so every run sees the same rows: about 500
distinct sources, 5 or 6 categories, dates spread over roughly seven years.

## Baseline

Milliseconds, p95, incomes (expenses are within a few percent). Treat the absolute numbers as indicative;
the growth is what matters. The full p50/p95/p99/max per endpoint, for both kinds, is in
`baseline/summary-<rows>.json`; `results/` (gitignored) holds your own runs.

### How this baseline was run

- Date: 2026-11-20, one run per size, sizes in order 1k, 10k, 100k, started with `./perf/run.sh` (defaults).
- Load: 1 virtual user, 100 iterations per size (each iteration calls every endpoint once, so 100
  samples per endpoint), no think time, p95 limit 300 ms. Before measuring, `setup()` makes 5 untimed
  last-page requests per kind to warm connections, caches and the planner.
- Data: `seed.sql`, 1,000 / 10,000 / 100,000 rows in each of `incomes` and `expenses`, re-seeded from
  scratch before each size, followed by `ANALYZE`. The default list returns 10 rows per page; the
  last-page request uses 20.
- Host: MacBook with Apple M4 (10 cores, 16 GB), macOS 27.0.1, Docker Engine 29.4.3 (Docker Desktop VM:
  10 CPUs, 3.8 GiB, linux/arm64). Backend, PostgreSQL and k6 all ran in that VM, so network time is
  loopback only and k6 competes with the backend for CPU.
- Backend: release build (`docker/backend/Dockerfile`, `rust:1-slim-bookworm` toolchain current at build time), log level
  `warn`, the expenses work (backend commit `d495d2e` on `feature/expenses`, on top of `d49f4ae`).
- Database: `postgres:16-alpine` (16.16), default configuration (no tuning), data on a Docker volume.
  Fresh `finance_perf` database with only the two migrations applied.
- k6: `grafana/k6:0.54.0`.

A different machine will give different absolute numbers. To compare, rerun `./perf/run.sh` on the same
machine before and after a change.

| endpoint | 1k rows | 10k rows | 100k rows |
|---|---:|---:|---:|
| list, defaults | 0.4 | 1.6 | 5.5 |
| list, search with matches | 1.3 | 9.6 | 53.4 |
| list, search with no matches | 1.1 | 8.8 | 115.1 |
| list, category and date filter | 0.4 | 0.8 | 7.8 |
| list, sort by amount | 0.3 | 1.3 | 11.6 |
| list, sort by source | 0.3 | 1.5 | 12.2 |
| list, last page | 0.4 | 2.3 | 32.7 |
| get by id | 0.1 | 0.2 | 0.3 |
| create / update / delete | 0.2 to 0.4 | 0.3 to 0.4 | 0.5 to 0.8 |

Reading it: single-record operations stay flat. Everything that lists grows roughly linearly with table
size, because each list request also computes `COUNT(*)` and `SUM(amount_cents)` over the filtered rows
for the pagination totals. Search is the steepest (`ILIKE '%term%'` cannot use the existing B-tree
indexes, so it scans every row); deep pages also pay for `OFFSET`.

## In CI

- Every push and pull request: a smoke run with 10,000 rows per table, 50 iterations and a 100 ms p95
  limit (roughly 10 times the local baseline, to absorb slow shared runners). It only catches gross
  regressions, such as an accidental full table scan.
- Nightly at 03:00 UTC and on demand (Actions, "Performance", Run workflow): 100,000 rows with a 500 ms
  limit. This is the run to compare over time. Results are uploaded as a build artifact.

The workflow is `.github/workflows/performance.yml`.
