const { test: base, expect } = require('@playwright/test');
const path = require('node:path');
const { startServer } = require('./server');

const test = base.extend({
  build: ['mailcheck.js', { option: true }],
  serverURL: [async ({}, use) => {
    const server = await startServer();
    try { await use(server.url); } finally { await server.close(); }
  }, { scope: 'worker' }],
  page: async ({ page, context, serverURL, build }, use) => {
    const errors = [];
    const unexpectedRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === serverURL) {
        if (url.pathname === '/src/mailcheck.js') {
          await route.fulfill({
            path: path.join(__dirname, '../../src', build),
            contentType: 'text/javascript'
          });
        } else {
          await route.continue();
        }
      } else if (url.href === 'https://code.jquery.com/jquery-3.7.1.min.js') {
        // Exercise the real example offline against its declared jQuery version.
        await route.fulfill({
          path: require.resolve('jquery/dist/jquery.js'),
          contentType: 'text/javascript'
        });
      } else {
        unexpectedRequests.push(url.href);
        await route.abort();
      }
    });
    await use(page);
    expect(errors, 'uncaught browser errors').toEqual([]);
    expect(unexpectedRequests, 'unexpected external requests').toEqual([]);
  }
});

module.exports = { test, expect };
