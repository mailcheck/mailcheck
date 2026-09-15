# Mailcheck 2.0

<p align="center">
  <img src="doc/mailcheck-logo.png" width="200" alt="Mailcheck logo: a turquoise envelope with a checkmark">
</p>

<p align="center">
  <a href="https://github.com/mailcheck/mailcheck/actions/workflows/ci.yml"><img src="https://github.com/mailcheck/mailcheck/actions/workflows/ci.yml/badge.svg" alt="Build status"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license"></a>
</p>

Mailcheck suggests a likely email domain when someone makes a typo. It is a small JavaScript library with an optional jQuery plugin. Mailcheck originated at Kicksend.

```text
sample@gmial.con  →  sample@gmail.com
sample@gmail      →  sample@gmail.com
```

Mailcheck is a typo suggester, not an email validator or a deliverability check. Show a suggestion; do not silently replace an address or block someone from continuing.

## Behavior

- The established JavaScript API remains available: the same methods, options, callbacks, return values, browser global, and jQuery plugin.
- Bundled TypeScript declarations require no separate `@types/mailcheck` package.
- Recognized modern domain endings such as `.ai`, `.io`, `.app`, and `.co` are not rewritten merely because another ending is close.
- Provider defaults include Proton, HEY, Fastmail, and Tuta.
- An exact, unambiguous configured domain with a missing ending can be completed: `sample@gmail` can suggest `sample@gmail.com`.
- Equally close candidates produce no suggestion rather than depending on list order.
- Local-part case and repeated literal percent signs are preserved.
- Mailcheck has no runtime dependencies and makes no network requests.

## Install

### npm

```sh
npm install mailcheck
```

### Browser

Load the browser build before calling `Mailcheck.run`:

```html
<script src="/path/to/mailcheck.min.js"></script>
```

## Use without jQuery

Call `Mailcheck.run()` when the person leaves the email field. Render the suggestion as text, never as HTML.

```html
<input id="email" type="email" autocomplete="email">
<p id="suggestion" aria-live="polite"></p>

<script src="/path/to/mailcheck.min.js"></script>
<script>
  var email = document.getElementById('email');
  var output = document.getElementById('suggestion');

  email.addEventListener('blur', function () {
    Mailcheck.run({
      email: email.value,
      suggested: function (suggestion) {
        output.textContent = 'Did you mean ' + suggestion.full + '?';
      },
      empty: function () {
        output.textContent = '';
      }
    });
  });
</script>
```

`run()` returns the suggestion when no callbacks are supplied:

```js
var suggestion = Mailcheck.run({ email: 'sample@gmial.con' });
// { address: 'sample', domain: 'gmail.com', full: 'sample@gmail.com' }
// or undefined when there is no suggestion
```

Mailcheck does not alter the field value. Let the person choose whether to change it.

## Use with jQuery

Load jQuery first, then Mailcheck:

```html
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="/path/to/mailcheck.min.js"></script>
```

```js
$('#email').on('blur', function () {
  $(this).mailcheck({
    suggested: function (element, suggestion) {
      $('#suggestion').text('Did you mean ' + suggestion.full + '?');
    },
    empty: function () {
      $('#suggestion').empty();
    }
  });
});
```

The plugin passes the jQuery element first and the suggestion second. It returns `void`.

## Node.js and TypeScript

### CommonJS

```js
var Mailcheck = require('mailcheck');
var suggestion = Mailcheck.run({ email: 'sample@gmial.con' });
```

### ESM and TypeScript

```ts
import Mailcheck from 'mailcheck';
import type { Suggestion } from 'mailcheck';

const suggestion: Suggestion | undefined = Mailcheck.run({
  email: 'Sample.Name+Tag@gmial.com'
});
```

The default import uses CommonJS interoperability, supported by Node ESM and TypeScript with `esModuleInterop`. For CommonJS TypeScript, use:

```ts
import Mailcheck = require('mailcheck');
```

To use the existing jQuery plugin types alongside your normal jQuery types:

```ts
import type {} from 'mailcheck/jquery';
```

This adds declarations only. Load the jQuery and Mailcheck runtime scripts as usual.

## Customize domain suggestions

Pass lowercase lists to replace the relevant defaults:

```js
Mailcheck.run({
  email: 'sample@acme.con',
  domains: ['acme.com', 'example.org'],
  secondLevelDomains: ['acme'],
  topLevelDomains: ['com', 'org']
});
```

Or extend the defaults:

```js
Mailcheck.defaultDomains.push('acme.com');
Mailcheck.defaultSecondLevelDomains.push('acme');
Mailcheck.defaultTopLevelDomains.push('org');
```

`domains`, `secondLevelDomains`, and `topLevelDomains` replace their respective defaults when passed to `run()`. The public `topLevelDomains` list contains correction targets; Mailcheck’s internal recognition of real domain endings is not another option to configure.

You can provide a custom distance function:

```js
Mailcheck.run({
  email: 'sample@gmial.con',
  distanceFunction: function (left, right) {
    return Mailcheck.sift4Distance(left, right);
  }
});
```

## Matching rules

Mailcheck deliberately abstains when confidence is low:

- Valid recognized endings remain unchanged. `sample@gmail.co` receives no suggestion because `.co` is real.
- A missing ending is completed only from one exact full-domain target already in `domains`.
- Partial names, unknown domains, malformed layouts, Unicode/punycode domains, and ambiguous matches receive no suggestion.
- A threshold of `0` means exact matches only.
- Mailcheck does not prove that an address exists, accepts mail, or belongs to a person.

The lower-level `Mailcheck.suggest()` accepts explicit correction lists and returns a suggestion object or `false`:

```js
Mailcheck.suggest(
  'sample@gmial.con',
  ['gmail.com'],
  ['gmail'],
  ['com'],
  Mailcheck.sift4Distance
);
```

## Render suggestions safely

`run()` retains the legacy `encodeEmail()` behavior. That encoding is not a general HTML sanitizer. Use `textContent`, jQuery `.text()`, or your framework’s escaped text rendering when displaying suggestions. Do not insert user input with `innerHTML`.

## Test and build

Install the locked development dependencies without lifecycle scripts:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npx --no-install playwright install chromium firefox webkit
npm run test:ci
```

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm run test:ci` | Run the full test suite. |
| `npm test` | Run core, regression, and release-packaging tests. |
| `npm run test:types` | Check TypeScript declarations. |
| `npm run test:package` | Test a packed archive as a separate consumer. |
| `npm run test:e2e` | Run browser tests in Chromium, Firefox, and WebKit. |
| `npm run build` | Regenerate `src/mailcheck.min.js`. |
| `npm run build:check` | Verify that the minified build is current. |
| `npm run test:release` | Test the local release archive workflow. |

When changing behavior, add a focused regression test and regenerate the minified build. The test suite uses synthetic addresses and local test resources only.

## Release archives

```sh
./cut_release.sh VERSION
./cut_release.sh VERSION --dry-run
```

The command writes `Releases/mailcheck-VERSION.tgz` and refuses to overwrite an existing archive. It creates the versioned metadata and minified build in a temporary copy, leaving checkout version files unchanged. The archive includes only runtime files, declarations, manifests, this README, and the license.

## Organizations that have used Mailcheck

Organizations that have used Mailcheck include:

- Dropbox
- Hack Design
- Kicksend
- Kickstarter
- Khan Academy
- Lyft
- Minecraft
- SB Nation
- The Verge
- GOV.UK Pay
- [Jo](https://askjo.ai)

## People

- [Derrick Ko](https://x.com/derrickko) — original author
- [Wei Lu](https://x.com/luweidewei) — maintainer
- [Pradeep Elankumaran](https://x.com/pradeep24) — maintainer ([GitHub](https://github.com/skyfallsin))

Mailcheck has also benefited from its wider contributor community; see the [contributors](https://github.com/mailcheck/mailcheck/contributors) page for the complete history.

## Contributing

- Preserve the public API and module entry points.
- Prefer no suggestion over a wrong one.
- Do not silently rewrite a person’s address.
- Keep new behavior covered in the relevant core, package, type, or browser tests.
- Run `npm run build` and `npm run test:ci` before proposing a change.

See [README-1.x.md](README-1.x.md) for the preserved pre-2.0 README and historical links.

## License

MIT. See [LICENSE](LICENSE).
