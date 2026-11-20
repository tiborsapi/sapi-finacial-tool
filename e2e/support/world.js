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

async function dockerAvailable() {
  try {
    await execFileAsync('docker', ['--version'], { windowsHide: true, timeout: 5_000 });
    return true;
  } catch (error) {
    return false;
  }
}

setDefaultTimeout(30_000);

class FinanceWorld {
  constructor() {
    this.baseUrl = process.env.E2E_BASE_URL || 'http://localhost:8081';
    this.databaseUrl =
      process.env.E2E_DATABASE_URL ||
      'postgres://finance:finance_dev_password@localhost:5433/finance_db';
    this.sourcePrefix = `bdd-${randomUUID()}`;
    this.recordIds = new Map();
    this.amounts = new Map();
  }

  sourceFor(alias) {
    return `${this.sourcePrefix}-${alias}`;
  }

  /** `table` is a trusted constant ('incomes' or 'expenses'), never user input. */
  async findRecord(table, alias) {
    const result = await this.database.query(
      `SELECT id, amount_cents, source, category, description, received_on FROM ${table} WHERE source = $1`,
      [this.sourceFor(alias)],
    );
    return result.rows[0];
  }

  async backendLogs() {
    if (!(await dockerAvailable())) return '';
    const { stdout, stderr } = await execFileAsync(
      'docker',
      ['compose', 'logs', '--no-color', '--since=20m', 'backend'],
      { cwd: repositoryRoot, timeout: 15_000, windowsHide: true },
    );
    return `${stdout}\n${stderr}`;
  }
}

setWorldConstructor(FinanceWorld);

Before(async function () {
  this.dockerAvailable = await dockerAvailable();
  if (!browser) browser = await chromium.launch({ headless: process.env.PWDEBUG !== '1' });
  const database = new Client({ connectionString: this.databaseUrl });
  await database.connect();
  await database.query('SELECT 1 FROM incomes LIMIT 0');
  await database.query('SELECT 1 FROM expenses LIMIT 0');
  this.database = database;
  this.context = await browser.newContext();
  this.page = await this.context.newPage();
});

After(async function () {
  let cleanupError;
  if (this.database) {
    try {
      for (const table of ['incomes', 'expenses']) {
        await this.database.query(`DELETE FROM ${table} WHERE source LIKE $1`, [
          `${this.sourcePrefix}-%`,
        ]);
      }
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
