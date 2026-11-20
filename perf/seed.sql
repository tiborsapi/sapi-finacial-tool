-- Fills the disposable performance database with a deterministic data set.
--   psql -v rows=100000 -f seed.sql
-- Both tables get `rows` records. Replaces whatever was there.
-- Values are derived from the row number (no randomness), so every run sees the same data:
--   ~500 distinct sources, 5 or 6 categories, dates spread over about seven years.
\set ON_ERROR_STOP on

TRUNCATE incomes, expenses;

INSERT INTO incomes (id, amount_cents, source, category, description, received_on)
SELECT gen_random_uuid(),
       100 + (n * 7919) % 500000,
       'Employer ' || (n % 500),
       (ARRAY['Salary', 'Freelance', 'Investments', 'Business', 'Other'])[1 + n % 5],
       CASE WHEN n % 3 = 0 THEN NULL ELSE 'Invoice ' || n || ' for project ' || (n % 97) END,
       DATE '2020-01-01' + (n % 2500)
FROM generate_series(1, :rows) AS n;

INSERT INTO expenses (id, amount_cents, source, category, description, received_on)
SELECT gen_random_uuid(),
       100 + (n * 6007) % 300000,
       'Shop ' || (n % 500),
       (ARRAY['Rent', 'Food', 'Transport', 'Utilities', 'Health', 'Other'])[1 + n % 6],
       CASE WHEN n % 3 = 0 THEN NULL ELSE 'Receipt ' || n || ' for item ' || (n % 97) END,
       DATE '2020-01-01' + (n % 2500)
FROM generate_series(1, :rows) AS n;

-- Fresh planner statistics, as autovacuum would have produced on a long-lived table.
ANALYZE incomes;
ANALYZE expenses;
SELECT 'incomes' AS "table", COUNT(*) AS "rows" FROM incomes
UNION ALL SELECT 'expenses', COUNT(*) FROM expenses;
