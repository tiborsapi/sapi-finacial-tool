#!/usr/bin/env bash
# Runs the performance test at several data sizes and prints one table per size.
#   ./perf/run.sh                      # 1k, 10k and 100k rows per table
#   SIZES="10000" ./perf/run.sh        # one size
#   ITER=50 P95_MS=200 ./perf/run.sh   # fewer iterations, tighter limit
# Needs Docker. Uses an optimised backend on its own database (finance_perf) so
# your development data is never touched. Results: perf/results/summary-<rows>.json
set -euo pipefail
cd "$(dirname "$0")/.."

SIZES="${SIZES:-1000 10000 100000}"
compose=(docker compose --profile perf)

"${compose[@]}" up -d --wait db
if ! "${compose[@]}" exec -T db psql -U finance -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='finance_perf'" | grep -q 1; then
  "${compose[@]}" exec -T db psql -U finance -d postgres -c "CREATE DATABASE finance_perf" >/dev/null
fi

"${compose[@]}" up -d --build backend-release
printf 'Waiting for the backend'
until curl -fsS http://localhost:8090/health >/dev/null 2>&1; do printf '.'; sleep 1; done
echo

status=0
for rows in $SIZES; do
  echo; echo "=== Seeding $rows rows per table ==="
  "${compose[@]}" exec -T db psql -q -U finance -d finance_perf -v rows="$rows" -f - < perf/seed.sql
  "${compose[@]}" run --rm -e ROWS="$rows" -e ITER="${ITER:-100}" -e P95_MS="${P95_MS:-300}" k6 run /perf/perf.js || status=$?
done
exit $status
