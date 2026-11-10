const { randomUUID } = require('node:crypto');
const { execFile } = require('node:child_process');
const path = require('node:path');
const { promisify } = require('node:util');
const {
  setWorldConstructor,
  setDefaultTimeout,
  Before,
  After,
  AfterAll,
} = require('@cucumber/cucumber');
const { chromium, expect } = require('@playwright/test');
const { Client } = require('pg');

const execFileAsync = promisify(execFile);
const repositoryRoot = path.resolve(__dirname, '..', '..');
let browser;

setDefaultTimeout(30_000);

class IncomeWorld {
  constructor() {
    this.baseUrl = process.env.E2E_BASE_URL || 'http://localhost:8081';
    this.databaseUrl =
      process.env.E2E_DATABASE_URL ||
      'postgres://finance:finance_dev_password@localhost:5433/finance_db';
    this.sourcePrefix = `bdd-${randomUUID()}`;
    this.incomeIds = new Map();
    this.incomeAmounts = new Map();
  }

  sourceFor(alias) {
    return `${this.sourcePrefix}-${alias}`;
  }

  async findIncome(alias) {
    const result = await this.database.query(
      'SELECT id, amount_cents, source, category, description, received_on FROM incomes WHERE source = $1',
      [this.sourceFor(alias)],
    );
    return result.rows[0];
  }

  async backendLogs() {
    const { stdout, stderr } = await execFileAsync(
      'docker',
      ['compose', 'logs', '--no-color', '--since=20m', 'backend'],
      { cwd: repositoryRoot, timeout: 15_000, windowsHide: true },
    );
    return `${stdout}\n${stderr}`;
  }
}

setWorldConstructor(IncomeWorld);

Before(async function () {
  if (!browser) browser = await chromium.launch({ headless: true });
  const database = new Client({ connectionString: this.databaseUrl });
  await database.connect();
  await database.query('SELECT 1 FROM incomes LIMIT 0');
  this.database = database;
  this.context = await browser.newContext();
  this.page = await this.context.newPage();
});

After(async function () {
  let cleanupError;
  if (this.database) {
    try {
      await this.database.query('DELETE FROM incomes WHERE source LIKE $1', [
        `${this.sourcePrefix}-%`,
      ]);
    } catch (error) {
      cleanupError = error;
    } finally {
      await this.database.end();
    }
  }
  if (this.context) await this.context.close();
  if (cleanupError) throw cleanupError;
});

AfterAll(async () => {
  if (browser) await browser.close();
});

module.exports = { expect };
