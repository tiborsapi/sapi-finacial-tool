const { When, Then, defineParameterType } = require('@cucumber/cucumber');
const assert = require('node:assert/strict');

// "income" or "expense" in a step maps to its table, so one set of steps covers both.
defineParameterType({
  name: 'kind',
  regexp: /income|expense/,
  transformer: (kind) => (kind === 'income' ? 'incomes' : 'expenses'),
});

// The Before hook (support/world.js) already checks both migrated tables exist.

When('I inspect the {kind} database schema', async function (table) {
  const columns = await this.database.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [table],
  );
  this.columnNames = new Set(columns.rows.map((row) => row.column_name));

  const indexes = await this.database.query(
    `SELECT indexname
     FROM pg_indexes
     WHERE schemaname = 'public' AND tablename = $1`,
    [table],
  );
  this.indexNames = new Set(indexes.rows.map((row) => row.indexname));

  const constraints = await this.database.query(
    `SELECT pg_get_constraintdef(constraint_row.oid) AS definition
     FROM pg_constraint AS constraint_row
     JOIN pg_class AS table_row ON table_row.oid = constraint_row.conrelid
     JOIN pg_namespace AS schema_row ON schema_row.oid = table_row.relnamespace
     WHERE schema_row.nspname = 'public' AND table_row.relname = $1`,
    [table],
  );
  this.constraintDefinitions = constraints.rows.map((row) => row.definition);
});

Then('the {kind} table has the required columns', function (table) {
  for (const column of [
    'id',
    'amount_cents',
    'source',
    'category',
    'description',
    'received_on',
    'created_at',
    'updated_at',
  ]) {
    assert.ok(this.columnNames.has(column), `Expected ${table}.${column} to exist`);
  }
  assert.ok(
    this.constraintDefinitions.some((definition) =>
      /CHECK\s*\(\(*\s*amount_cents\s*>\s*0\s*\)*\)/i.test(definition),
    ),
    'Expected the database to enforce a positive amount_cents value',
  );
});

Then('the {kind} table has the expected lookup indexes', function (table) {
  assert.ok(this.indexNames.has(`${table}_received_on_idx`));
  assert.ok(this.indexNames.has(`${table}_category_idx`));
});

When(
  'I attempt to insert a {string} {kind} of {int} cents',
  async function (alias, table, amountCents) {
    try {
      await this.database.query(
        `INSERT INTO ${table} (id, amount_cents, source, category, received_on)
         VALUES (gen_random_uuid(), $1, $2, 'Other', CURRENT_DATE)`,
        [amountCents, this.sourceFor(alias)],
      );
      this.insertError = undefined;
    } catch (error) {
      this.insertError = error;
    }
  },
);

Then('the database rejects the {kind} because its amount must be positive', function (table) {
  assert.ok(this.insertError, 'Expected the insert to fail');
  assert.equal(this.insertError.code, '23514');
  assert.equal(this.insertError.constraint, `${table}_amount_cents_check`);
});

When('I attempt to insert one {kind} without its {word}', async function (table, missingColumn) {
  const values = {
    id: 'gen_random_uuid()',
    amount_cents: '100',
    source: `'${this.sourceFor('missing-field')}'`,
    category: `'Other'`,
    received_on: 'CURRENT_DATE',
  };
  assert.ok(missingColumn in values, `Unknown column ${missingColumn}`);
  delete values[missingColumn];
  try {
    await this.database.query(
      `INSERT INTO ${table} (${Object.keys(values).join(', ')})
       VALUES (${Object.values(values).join(', ')})`,
    );
    this.insertError = undefined;
  } catch (error) {
    this.insertError = error;
  }
});

Then('the database rejects the {kind} because {word} is required', function (table, column) {
  assert.ok(this.insertError, 'Expected the insert to fail');
  assert.equal(this.insertError.code, '23502', this.insertError.message);
  assert.equal(this.insertError.column, column);
});
