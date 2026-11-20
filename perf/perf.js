// Single-user latency test: one virtual user calls every endpoint repeatedly against a
// seeded database and reports p50/p95/p99 per endpoint. Not a load test.
//
//   k6 run -e BASE_URL=http://localhost:8090 -e ROWS=10000 perf.js
//
// Environment:
//   BASE_URL   backend address                                (default http://localhost:8090)
//   ROWS       rows seeded per table, for labelling only      (default unknown)
//   ITER       iterations; each calls every endpoint once     (default 100)
//   P95_MS     p95 threshold for every endpoint, milliseconds (default 300)
import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8090';
const ROWS = __ENV.ROWS || 'unknown';
const ITER = Number(__ENV.ITER || 100);
const P95_MS = Number(__ENV.P95_MS || 300);

const KINDS = [
  { name: 'incomes', category: 'Salary', otherCategory: 'Other', source: 'Employer' },
  { name: 'expenses', category: 'Rent', otherCategory: 'Other', source: 'Shop' },
];
const READS = [
  'list_default',
  'list_search_hit',
  'list_search_miss',
  'list_filtered',
  'list_sort_amount',
  'list_sort_source',
  'list_last_page',
  'get_by_id',
];
const WRITES = ['create', 'update', 'delete'];
const endpoints = KINDS.flatMap((kind) => [...READS, ...WRITES].map((name) => `${kind.name}.${name}`));

// A threshold has to exist for k6 to keep a per-endpoint sub-metric.
const thresholds = { checks: ['rate==1'] };
for (const endpoint of endpoints) {
  thresholds[`http_req_duration{endpoint:${endpoint}}`] = [`p(95)<${P95_MS}`];
}

export const options = {
  scenarios: {
    single_user: { executor: 'shared-iterations', vus: 1, iterations: ITER, maxDuration: '30m' },
  },
  thresholds,
  summaryTrendStats: ['med', 'p(95)', 'p(99)', 'max'],
};

const headers = { 'Content-Type': 'application/json' };

function call(endpoint, method, path, body) {
  const response = http.request(method, `${BASE_URL}${path}`, body ? JSON.stringify(body) : null, {
    headers,
    tags: { endpoint },
  });
  return response;
}

function newRecord(kind, n) {
  return {
    amount_cents: 1000 + (n % 5000),
    source: `${kind.source} perf-${n}`,
    category: kind.category,
    description: 'performance test record',
    received_on: '2026-03-15',
  };
}

// Find a real row to read, and where the last page is, before measuring.
export function setup() {
  const info = {};
  for (const kind of KINDS) {
    const first = http.get(`${BASE_URL}/api/${kind.name}?per_page=20`).json();
    if (!first.data || first.data.length === 0) {
      throw new Error(`No ${kind.name} found: seed the database first (perf/seed.sql)`);
    }
    info[kind.name] = { id: first.data[0].id, lastPage: first.pagination.total_pages, total: first.pagination.total_items };
    // Warm up connections, caches and the planner before anything is timed.
    for (let i = 0; i < 5; i += 1) http.get(`${BASE_URL}/api/${kind.name}?per_page=20&page=${info[kind.name].lastPage}`);
  }
  return info;
}

export default function (info) {
  const n = __ITER;
  for (const kind of KINDS) {
    const base = `/api/${kind.name}`;
    const e = (name) => `${kind.name}.${name}`;
    const known = info[kind.name];
    const responses = [
      call(e('list_default'), 'GET', `${base}`),
      call(e('list_search_hit'), 'GET', `${base}?q=${encodeURIComponent(`${kind.source} 42`)}`),
      call(e('list_search_miss'), 'GET', `${base}?q=zzzzzz`),
      call(e('list_filtered'), 'GET', `${base}?category=${kind.category}&from=2022-01-01&to=2023-12-31&sort_by=amount&sort_order=desc`),
      call(e('list_sort_amount'), 'GET', `${base}?sort_by=amount&sort_order=asc`),
      call(e('list_sort_source'), 'GET', `${base}?sort_by=source&sort_order=asc`),
      call(e('list_last_page'), 'GET', `${base}?per_page=20&page=${known.lastPage}`),
      call(e('get_by_id'), 'GET', `${base}/${known.id}`),
    ];
    check(responses, { 'reads return 200': (all) => all.every((r) => r.status === 200) });

    // Create, edit, delete: leaves the table the size it was.
    const created = call(e('create'), 'POST', base, newRecord(kind, n));
    check(created, { 'create returns 201': (r) => r.status === 201 });
    const id = created.json('id');
    const updated = call(e('update'), 'PUT', `${base}/${id}`, { ...newRecord(kind, n), category: kind.otherCategory });
    check(updated, { 'update returns 200': (r) => r.status === 200 });
    const deleted = call(e('delete'), 'DELETE', `${base}/${id}`);
    check(deleted, { 'delete returns 204': (r) => r.status === 204 });
  }
}

const pad = (value, width) => String(value).padEnd(width);
const ms = (value) => (value === undefined ? '-' : `${value.toFixed(1)}`.padStart(8));

export function handleSummary(data) {
  const lines = [`Performance, ${ROWS} rows per table, ${ITER} iterations, p95 limit ${P95_MS} ms`, ''];
  lines.push(`${pad('endpoint', 28)}${'p50 ms'.padStart(9)}${'p95 ms'.padStart(9)}${'p99 ms'.padStart(9)}${'max ms'.padStart(9)}  status`);
  const rows = {};
  for (const endpoint of endpoints) {
    const metric = data.metrics[`http_req_duration{endpoint:${endpoint}}`];
    if (!metric) continue;
    const v = metric.values;
    const failed = (metric.thresholds || {})[`p(95)<${P95_MS}`] ? metric.thresholds[`p(95)<${P95_MS}`].ok === false : false;
    rows[endpoint] = { p50: v.med, p95: v['p(95)'], p99: v['p(99)'], max: v.max };
    lines.push(`${pad(endpoint, 28)}${ms(v.med)} ${ms(v['p(95)'])} ${ms(v['p(99)'])} ${ms(v.max)}  ${failed ? 'SLOW' : 'ok'}`);
  }
  const failedChecks = data.metrics.checks ? data.metrics.checks.values.fails : 0;
  lines.push('', `failed checks: ${failedChecks}`);
  return {
    stdout: `${lines.join('\n')}\n`,
    [`/results/summary-${ROWS}.json`]: JSON.stringify({ rows: ROWS, iterations: ITER, p95Limit: P95_MS, endpoints: rows }, null, 2),
  };
}
