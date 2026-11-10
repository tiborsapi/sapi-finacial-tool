const { defineStep, Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('../../support/world');

async function addIncome(world, alias, amount, category) {
  const source = world.sourceFor(alias);
  await world.page.getByRole('button', { name: /Add income/ }).click();
  const dialog = world.page.getByRole('dialog');
  await dialog.getByLabel('Source').fill(source);
  await dialog.getByLabel(/Amount/).fill(amount);
  await dialog.getByLabel('Category').selectOption(category);
  await dialog.getByRole('button', { name: 'Add income' }).click();
  await world.page.getByLabel('Search income').fill(source);
  await expect(world.page.getByRole('row').filter({ hasText: source })).toBeVisible();
  world.incomeAmounts.set(alias, Math.round(Number(amount) * 100));
}

Given('the income dashboard is open', async function () {
  const response = await this.page.goto(this.baseUrl);
  expect(response, 'The same-origin development site must be reachable').not.toBeNull();
  expect(response.status(), 'The development site should return HTTP 200').toBe(200);
  await expect(this.page.getByRole('heading', { name: 'Income', exact: true })).toBeVisible();
  const apiResponse = await this.page.request.get(`${this.baseUrl}/api/incomes`);
  expect(apiResponse.status(), 'The same-origin income API should return HTTP 200').toBe(200);
});

defineStep(
  'I add a {string} income of {string} in category {string}',
  async function (alias, amount, category) {
    await addIncome(this, alias, amount, category);
  },
);

Then('the {string} income is displayed', async function (alias) {
  const source = this.sourceFor(alias);
  await expect(this.page.getByRole('row').filter({ hasText: source })).toBeVisible();
});

Then('the {string} income is saved in the database', async function (alias) {
  const row = await this.findIncome(alias);
  expect(row, `Expected ${this.sourceFor(alias)} to be stored`).toBeDefined();
  this.incomeIds.set(alias, row.id);
  expect(row.source).toBe(this.sourceFor(alias));
  expect(Number(row.amount_cents)).toBe(this.incomeAmounts.get(alias));
});

When(
  'I update the {string} income to {string} for {string}',
  async function (oldAlias, newAlias, amount) {
    const oldSource = this.sourceFor(oldAlias);
    const row = await this.findIncome(oldAlias);
    expect(row, `Expected ${oldSource} to exist before editing`).toBeDefined();
    this.incomeIds.set(newAlias, row.id);

    await this.page.getByRole('button', { name: `Edit ${oldSource}` }).click();
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel('Source').fill(this.sourceFor(newAlias));
    await dialog.getByLabel(/Amount/).fill(amount);
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await this.page.getByLabel('Search income').fill(this.sourceFor(newAlias));
    await expect(
      this.page.getByRole('row').filter({ hasText: this.sourceFor(newAlias) }),
    ).toBeVisible();
    this.incomeAmounts.set(newAlias, Math.round(Number(amount) * 100));
  },
);

When('I delete the {string} income', async function (alias) {
  const source = this.sourceFor(alias);
  const row = await this.findIncome(alias);
  expect(row, `Expected ${source} to exist before deleting`).toBeDefined();
  this.incomeIds.set(alias, row.id);
  this.page.once('dialog', (dialog) => dialog.accept());
  await this.page.getByRole('button', { name: `Delete ${source}` }).click();
  await expect(this.page.getByRole('row').filter({ hasText: source })).toHaveCount(0);
});

Then('the {string} income is absent from the database', async function (alias) {
  const row = await this.findIncome(alias);
  expect(row).toBeUndefined();
});

Then(
  'the backend logs {string} for the {string} income',
  async function (eventName, alias) {
    const incomeId = this.incomeIds.get(alias);
    expect(incomeId, `No database id was captured for ${alias}`).toBeDefined();

    await expect
      .poll(
        async () => {
          const logs = await this.backendLogs();
          return logs.includes(eventName) && logs.includes(incomeId);
        },
        { message: `Expected backend logs to contain ${eventName} for ${incomeId}`, timeout: 10_000 },
      )
      .toBe(true);
  },
);

When('I seed 9 income records through the API', async function () {
  for (let index = 1; index <= 9; index += 1) {
    const day = String(index).padStart(2, '0');
    const response = await this.page.request.post(`${this.baseUrl}/api/incomes`, {
      data: {
        amount_cents: index * 100,
        source: this.sourceFor(`batch-${day}`),
        category: 'Salary',
        description: `BDD pagination record ${day}`,
        received_on: `2026-01-${day}`,
      },
    });
    expect(response.status(), `Creating seeded record ${day}`).toBe(201);
  }
});

When('I reload the income dashboard', async function () {
  await this.page.reload();
  await expect(this.page.getByRole('heading', { name: 'Income records' })).toBeVisible();
  await this.page.getByLabel('Search income').fill(this.sourcePrefix);
  await expect(this.page.locator('tbody tr')).toHaveCount(8);
});

Then('the first page contains {int} income records', async function (count) {
  await expect(this.page.locator('tbody tr')).toHaveCount(count);
  await expect(this.page.getByText('Page 1 of 2')).toBeVisible();
});

When('I go to the next page', async function () {
  await this.page.getByRole('button', { name: 'Next page' }).click();
});

Then('the second page contains {int} income record', async function (count) {
  await expect(this.page.locator('tbody tr')).toHaveCount(count);
  await expect(this.page.getByText('Page 2 of 2')).toBeVisible();
});

When('I filter the income category to {string}', async function (category) {
  await this.page.getByLabel('Filter by category').selectOption(category);
});

Then('{int} matching income records are found', async function (count) {
  await expect(this.page.getByText(`${count} ${count === 1 ? 'record' : 'records'}`, { exact: true })).toBeVisible();
  await expect(this.page.locator('tbody tr')).toHaveCount(Math.min(count, 8));
});

When('I sort income by amount from highest to lowest', async function () {
  await this.page.getByRole('button', { name: /AMOUNT/ }).click();
});

Then('the first income amount is {string}', async function (amount) {
  await expect(this.page.locator('tbody .amount-cell').first()).toHaveText(`+${amount}`);
});

When(
  'I set the income date range from {string} to {string}',
  async function (start, end) {
    await this.page.getByLabel('Start date').fill(start);
    await this.page.getByLabel('End date').fill(end);
  },
);
