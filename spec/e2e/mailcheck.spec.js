const { test, expect } = require('./fixtures');
const Mailcheck = require('../..');

async function enterAndBlur(page, email) {
  await page.locator('#email').fill(email);
  // Chromium normalizes Unicode domains in type=email before the blur handler.
  const browserValue = await page.locator('#email').inputValue();
  await page.locator('#email').press('Tab');
  return browserValue;
}

for (const build of ['mailcheck.js', 'mailcheck.min.js']) {
  test.describe(build, () => {
    test.use({ build });

    test('plain JavaScript suggests on blur, never rewrites input, and clears stale suggestions', async ({ page, serverURL }) => {
      await page.goto(serverURL + '/vanilla.html');
      await enterAndBlur(page, 'Person.Name+Tag@gmial.com');
      await expect(page.locator('#suggestion')).toHaveText('Did you mean Person.Name+Tag@gmail.com?');
      await expect(page.locator('#email')).toHaveValue('Person.Name+Tag@gmial.com');
      for (const email of ['person@company.ai', 'person@company.io', 'person@company.app', 'person@proton.me',
        'person@hey.com', 'person@gmail.co', 'person@bücher.de', 'person@mail.example.com', '', 'person@']) {
        const browserValue = await enterAndBlur(page, email);
        await expect(page.locator('#suggestion')).toBeEmpty();
        await expect(page.locator('#email')).toHaveValue(browserValue);
      }
      await enterAndBlur(page, 'person@gmil.con');
      await expect(page.locator('#suggestion')).toHaveText('Did you mean person@gmail.com?');
    });

    test('plain JavaScript suggests missing endings without changing the input', async ({ page, serverURL }) => {
      await page.goto(serverURL + '/vanilla.html');
      for (const email of ['sample@gmail', 'sample@gmail.']) {
        await enterAndBlur(page, email);
        await expect(page.locator('#suggestion')).toHaveText('Did you mean sample@gmail.com?');
        await expect(page.locator('#email')).toHaveValue(email);
      }
      await enterAndBlur(page, 'sample@unknowncompany');
      await expect(page.locator('#suggestion')).toBeEmpty();
      await enterAndBlur(page, 'sample@gmail.com');
      await expect(page.locator('#suggestion')).toBeEmpty();
    });

    test('plain JavaScript renders encoded local parts as text without executing markup', async ({ page, serverURL }) => {
      await page.goto(serverURL + '/vanilla.html');
      const local = '<img/src=x/onerror=window.mailcheckInjected=1>';
      await enterAndBlur(page, local + '@gmial.com');
      await expect(page.locator('#suggestion')).toHaveText('Did you mean ' + Mailcheck.encodeEmail(local) + '@gmail.com?');
      await expect(page.locator('#suggestion img')).toHaveCount(0);
      expect(await page.evaluate(() => window.mailcheckInjected)).toBeUndefined();
    });

    for (const jqueryVersion of ['legacy', 'current']) {
      test.describe('jQuery ' + jqueryVersion, () => {
        test.use({ jqueryVersion });

        test('the real example handles suggestion, empty, and repeated blur events', async ({ page, serverURL }) => {
          await page.goto(serverURL + '/examples/index.html');
          expect(await page.evaluate(() => jQuery.fn.jquery)).toBe(jqueryVersion === 'legacy' ? '1.12.4' : '3.7.1');
          await enterAndBlur(page, 'Person@gmial.com');
          await expect(page.locator('#suggestion')).toHaveText('Did you mean Person@gmail.com?');
          await expect(page.locator('#suggestion b i')).toHaveText('Person@gmail.com');
          await expect(page.locator('#email')).toHaveValue('Person@gmial.com');
          for (const email of ['person@company.ai', 'person@proton.me', 'person@hey.com', '', 'person@gmail.com']) {
            await enterAndBlur(page, email);
            await expect(page.locator('#suggestion')).toHaveText('No Suggestions :(');
          }
          await enterAndBlur(page, 'person@gmail.con');
          await expect(page.locator('#suggestion')).toHaveText('Did you mean person@gmail.com?');
        });

        test('the real example completes a missing ending through the existing plugin', async ({ page, serverURL }) => {
          await page.goto(serverURL + '/examples/index.html');
          for (const email of ['sample@gmail', 'sample@gmail.']) {
            await enterAndBlur(page, email);
            await expect(page.locator('#suggestion b i')).toHaveText('sample@gmail.com');
            await expect(page.locator('#email')).toHaveValue(email);
          }
          await enterAndBlur(page, 'sample@gmai');
          await expect(page.locator('#suggestion')).toHaveText('No Suggestions :(');
        });

        test('the real example preserves encoded text without creating markup', async ({ page, serverURL }) => {
          await page.goto(serverURL + '/examples/index.html');
          const local = '<img/src=x/onerror=window.mailcheckInjected=1>';
          await enterAndBlur(page, local + '@gmail.con');
          await expect(page.locator('#suggestion')).toHaveText('Did you mean ' + Mailcheck.encodeEmail(local) + '@gmail.com?');
          await expect(page.locator('#suggestion img')).toHaveCount(0);
          expect(await page.evaluate(() => window.mailcheckInjected)).toBeUndefined();
        });
      });
    }

    test('the original Jasmine browser suite passes with real jQuery', async ({ page, serverURL }) => {
      await page.goto(serverURL + '/spec/spec_runner.html');
      await page.waitForFunction(() => window.console_reporter && ['success', 'fail'].includes(console_reporter.status));
      const results = await page.evaluate(() => {
        const runner = jasmine.getEnv().currentRunner();
        return {
          status: console_reporter.status,
          failed: runner.specs().filter(spec => !spec.results().passed()).map(spec => ({
            name: spec.getFullName(),
            messages: spec.results().getItems().filter(item => !item.passed()).map(item => item.message)
          }))
        };
      });
      expect(results).toEqual({ status: 'success', failed: [] });
    });
  });
}
