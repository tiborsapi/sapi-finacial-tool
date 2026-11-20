const { randomUUID } = require('node:crypto');
const {
  setWorldConstructor,
  setDefaultTimeout,
  Before,
  After,
} = require('@cucumber/cucumber');
const { Client } = require('pg');

const defaultDatabaseUrl = 'postgres://finance:finance_dev_password@localhost:5433/finance_db';

setDefaultTimeout(15_000);

const TABLES = ['incomes', 'expenses'];

class DatabaseWorld {
  constructor() {
    this.databaseUrl = process.env.DB_TEST_DATABASE_URL || defaultDatabaseUrl;
    this.sourcePrefix = `dbbdd-${randomUUID()}`;
    this.recordIds = new Map();
    this.recordData = new Map();
  }

  sourceFor(alias) {
    return `${this.sourcePrefix}-${alias}`;
  }
}

setWorldConstructor(DatabaseWorld);

Before(async function () {
  this.database = new Client({ connectionString: this.databaseUrl });
  try {
    await this.database.connect();
    for (const table of TABLES) {
      await this.database.query(`SELECT 1 FROM public.${table} LIMIT 0`);
    }
  } catch (error) {
    await this.database.end().catch(() => {});
    throw new Error(
      `Unable to access the migrated PostgreSQL incomes and expenses tables. Check DB_TEST_DATABASE_URL and start the backend to apply migrations: ${error.message}`,
      { cause: error },
    );
  }
});

After(async function () {
  if (!this.database) return;

  let cleanupError;
  try {
    for (const table of TABLES) {
      await this.database.query(`DELETE FROM public.${table} WHERE source LIKE $1`, [
        `${this.sourcePrefix}-%`,
      ]);
      const remaining = await this.database.query(
        `SELECT COUNT(*)::int AS count FROM public.${table} WHERE source LIKE $1`,
        [`${this.sourcePrefix}-%`],
      );
      if (remaining.rows[0].count !== 0) {
        throw new Error(`Database BDD cleanup left ${remaining.rows[0].count} test rows in ${table}`);
      }
    }
  } catch (error) {
    cleanupError = error;
  }
  try {
    await this.database.end();
  } catch (error) {
    cleanupError ??= error;
  }
  if (cleanupError) throw cleanupError;
});
