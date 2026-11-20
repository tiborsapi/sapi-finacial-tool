const { defineParameterType, defineStep, Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('../../support/world');

// "income" or "expense" in a step selects this configuration, so one set of steps covers both.
const KINDS = {
  income: {
    noun: 'income',
    title: 'Income',
    route: '/',
    apiPath: '/api/incomes',
    table: 'incomes',
    sign: '+',
    seedCategory: 'Salary',
    foreignCategory: 'Rent',
  },
  expense: {
    noun: 'expense',
    title: 'Expenses',
    route: '/expenses',
    apiPath: '/api/expenses',
    table: 'expenses',
    sign: '−',
    seedCategory: 'Rent',
    foreignCategory: 'Salary',
  },
};

defineParameterType({
  name: 'kind',
  regexp: /income|expense/,
  transformer: (noun) => KINDS[noun],
});

async function fillRecordForm(world, kind, alias, amount, category) {
  await world.page.getByRole('button', { name: `Add ${kind.noun}`, exact: false }).first().click();
  const dialog = world.page.getByRole('dialog');
  await dialog.getByLabel('Source').fill(world.sourceFor(alias));
  await dialog.getByLabel(/Amount/).fill(amount);
  if (category) await dialog.getByLabel('Category').selectOption(category);
  return dialog;
}

async function addRecord(world, kind, alias, amount, category) {
  const source = world.sourceFor(alias);
  const dialog = await fillRecordForm(world, kind, alias, amount, category);
  await dialog.getByRole('button', { name: `Add ${kind.noun}` }).click();
  await world.page.getByLabel(`Search ${kind.noun}`).fill(source);
  await expect(world.page.getByRole('row').filter({ hasText: source })).toBeVisible();
  world.amounts.set(alias, Math.round(Number(amount) * 100));
}

Given('the {kind} dashboard is open', async function (kind) {
  const response = await this.page.goto(`${this.baseUrl}${kind.route}`);
  expect(response, 'The same-origin development site must be reachable').not.toBeNull();
  expect(response.status(), 'The development site should return HTTP 200').toBe(200);
  await expect(this.page.locator('h1')).toContainText(kind.title);
  const apiResponse = await this.page.request.get(`${this.baseUrl}${kind.apiPath}`);
  expect(apiResponse.status(), `The same-origin ${kind.noun} API should return HTTP 200`).toBe(200);
});

defineStep(
  'I add a {string} {kind} of {string} in category {string}',
  async function (alias, kind, amount, category) {
    await addRecord(this, kind, alias, amount, category);
  },
);

Then('the {string} {kind} is displayed', async function (alias, kind) {
  const source = this.sourceFor(alias);
  await expect(this.page.getByRole('row').filter({ hasText: source })).toBeVisible();
});

Then('the {string} {kind} is saved in the database', async function (alias, kind) {
  const row = await this.findRecord(kind.table, alias);
  expect(row, `Expected ${this.sourceFor(alias)} to be stored`).toBeDefined();
  this.recordIds.set(alias, row.id);
  expect(row.source).toBe(this.sourceFor(alias));
  expect(Number(row.amount_cents)).toBe(this.amounts.get(alias));
});

When(
  'I update the {string} {kind} to {string} for {string}',
  async function (oldAlias, kind, newAlias, amount) {
    const oldSource = this.sourceFor(oldAlias);
    const row = await this.findRecord(kind.table, oldAlias);
    expect(row, `Expected ${oldSource} to exist before editing`).toBeDefined();
    this.recordIds.set(newAlias, row.id);

    await this.page.getByRole('button', { name: `Edit ${oldSource}` }).click();
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel('Source').fill(this.sourceFor(newAlias));
    await dialog.getByLabel(/Amount/).fill(amount);
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await this.page.getByLabel(`Search ${kind.noun}`).fill(this.sourceFor(newAlias));
    await expect(
      this.page.getByRole('row').filter({ hasText: this.sourceFor(newAlias) }),
    ).toBeVisible();
    this.amounts.set(newAlias, Math.round(Number(amount) * 100));
  },
);

When('I delete the {string} {kind}', async function (alias, kind) {
  const source = this.sourceFor(alias);
  const row = await this.findRecord(kind.table, alias);
  expect(row, `Expected ${source} to exist before deleting`).toBeDefined();
  this.recordIds.set(alias, row.id);
  this.page.once('dialog', (dialog) => dialog.accept());
  await this.page.getByRole('button', { name: `Delete ${source}` }).click();
  await expect(this.page.getByRole('row').filter({ hasText: source })).toHaveCount(0);
});

Then('the {string} {kind} is absent from the database', async function (alias, kind) {
  const row = await this.findRecord(kind.table, alias);
  expect(row).toBeUndefined();
});

Then(
  'the backend logs {string} for the {string} {kind}',
  async function (eventName, alias, kind) {
    if (!this.dockerAvailable) {
      return 'skipped'; // shown as skipped, not as a pass, when Docker is unavailable
    }

    const recordId = this.recordIds.get(alias);
    expect(recordId, `No database id was captured for ${alias}`).toBeDefined();

    await expect
      .poll(
        async () => {
          const logs = await this.backendLogs();
          return logs.includes(eventName) && logs.includes(recordId);
        },
        { message: `Expected backend logs to contain ${eventName} for ${recordId}`, timeout: 10_000 },
      )
      .toBe(true);
  },
);

When('I seed 9 {kind} records through the API', async function (kind) {
  for (let index = 1; index <= 9; index += 1) {
    const day = String(index).padStart(2, '0');
    const response = await this.page.request.post(`${this.baseUrl}${kind.apiPath}`, {
      data: {
        amount_cents: index * 100,
        source: this.sourceFor(`batch-${day}`),
        category: kind.seedCategory,
        description: `BDD pagination record ${day}`,
        received_on: `2026-01-${day}`,
      },
    });
    expect(response.status(), `Creating seeded record ${day}`).toBe(201);
  }
});

When('I reload the {kind} dashboard', async function (kind) {
  await this.page.reload();
  await expect(this.page.getByRole('heading', { name: `${kind.title} records` })).toBeVisible();
  await this.page.getByLabel(`Search ${kind.noun}`).fill(this.sourcePrefix);
  await expect(this.page.locator('tbody tr')).toHaveCount(8);
});

Then('the first page contains {int} {kind} records', async function (count, kind) {
  await expect(this.page.locator('tbody tr')).toHaveCount(count);
  await expect(this.page.getByText(/Page\s+1\s+of\s+2/i)).toBeVisible();
});

When('I go to the next page', async function () {
  const nextPageButton = this.page.getByRole('button', { name: 'Next page' });
  await expect(nextPageButton).toBeEnabled();
  await nextPageButton.click();
  await expect(this.page.getByText(/Page\s+2\s+of\s+2/i)).toBeVisible({ timeout: 10_000 });
});

Then('the second page contains {int} {kind} record', async function (count, kind) {
  await expect(this.page.getByText(/Page\s+2\s+of\s+2/i)).toBeVisible();
  await expect.poll(async () => this.page.locator('tbody tr').count(), { timeout: 10_000 }).toBe(count);
});

When('I filter the {kind} category to {string}', async function (kind, category) {
  await this.page.getByLabel('Filter by category').selectOption(category);
});

Then('{int} matching {kind} records are found', async function (count, kind) {
  await expect(this.page.getByText(`${count} ${count === 1 ? 'record' : 'records'}`, { exact: true })).toBeVisible();
  await expect(this.page.locator('tbody tr')).toHaveCount(Math.min(count, 8));
});

When('I sort {kind} by amount from highest to lowest', async function (kind) {
  await this.page.getByRole('button', { name: /AMOUNT/ }).click();
});

Then('the first {kind} amount is {string}', async function (kind, amount) {
  await expect(this.page.locator('tbody .amount-cell').first()).toHaveText(`${kind.sign}${amount}`);
});

When(
  'I set the {kind} date range from {string} to {string}',
  async function (kind, start, end) {
    await this.page.getByLabel('Start date').fill(start);
    await this.page.getByLabel('End date').fill(end);
  },
);

When(
  'I try to add a {string} {kind} of {string}',
  async function (alias, kind, amount) {
    const dialog = await fillRecordForm(this, kind, alias, amount);
    await dialog.getByRole('button', { name: `Add ${kind.noun}` }).click();
  },
);

Then('the form shows the message {string}', async function (message) {
  await expect(this.page.getByRole('dialog').getByRole('alert')).toContainText(message);
});

When('I reload the page', async function () {
  await this.page.reload();
});

Then('the {string} {kind} is still displayed', async function (alias, kind) {
  const source = this.sourceFor(alias);
  await this.page.getByLabel(`Search ${kind.noun}`).fill(source);
  await expect(this.page.getByRole('row').filter({ hasText: source })).toBeVisible();
});

// ---------- the UI's category lists must match what the API accepts ----------

Then('every category offered by the {kind} form is accepted by the API', async function (kind) {
  await this.page.getByRole('button', { name: `Add ${kind.noun}` }).first().click();
  const formCategories = await this.page
    .getByRole('dialog')
    .getByLabel('Category')
    .locator('option')
    .allTextContents();
  await this.page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
  const filterCategories = (
    await this.page.getByLabel('Filter by category').locator('option').allTextContents()
  ).filter((name) => name !== 'All categories');

  expect(formCategories.length, 'The form should offer categories').toBeGreaterThan(0);
  expect(filterCategories).toEqual(formCategories);

  for (const category of formCategories) {
    const response = await this.page.request.post(`${this.baseUrl}${kind.apiPath}`, {
      data: {
        amount_cents: 100,
        source: this.sourceFor(`category-${category}`),
        category,
        description: null,
        received_on: '2026-02-01',
      },
    });
    expect(response.status(), `The API should accept the offered category "${category}"`).toBe(201);
  }
});
