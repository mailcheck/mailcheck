mailcheck.js
=========

[![TravisCI Build Status](https://secure.travis-ci.org/mailcheck/mailcheck.png?branch=master)](https://travis-ci.org/mailcheck/mailcheck)

The Javascript library and jQuery plugin that suggests a right domain when your users misspell it in an email address.

mailcheck.js is part of the [Mailcheck family](http://getmailcheck.org), and we're always on the lookout for more ports and adaptions. Get in touch!

Correctness-first update (unreleased)
------------------------------------

This fork's working tree includes stricter suggestions and bundled TypeScript
interfaces over the **unchanged caller API**: the same methods, options, callback
arguments, return shapes, and module loading. There is no wrapper to adopt and no
new domain-recognition option. These changes are **not yet published to npm**.
They intentionally improve some 1.1.2 matching behavior:

- Recognized domain endings are never changed to another ending. `company.ai`,
  `company.io`, `company.app`, and even `gmail.co` are left alone. `.co` and `.om`
  are real endings; Mailcheck now prefers a missed typo over a false suggestion.
- Recognition uses an offline [IANA root-zone snapshot](https://data.iana.org/TLD/tlds-alpha-by-domain.txt),
  version **2026091400**, containing **1,438** root endings. This is separate from
  the much smaller list of fuzzy correction targets. It does not prove that a
  domain exists or accepts email. Snapshot updates require a new build; no
  network calls are made at runtime.
- Proton, HEY, Fastmail, and Tuta addresses are included in the provider defaults.
- Equally close candidates produce no suggestion rather than depending on list order.
- Local-part case is preserved; only the domain is lowercased. `run()` still uses
  the existing `encodeEmail()` path, while low-level `suggest()` receives the
  caller's string directly. Outer whitespace is trimmed.
- Malformed domains, Unicode/punycode domains, and unrecognized subdomain layouts
  produce no suggestion. This is conservative abstention, not a claim of invalidity.
  Listed compound suffixes such as `co.uk` still work. This is not a public-suffix parser.
- A distance threshold of zero now means exact matches only.

There is no new rendering contract: `run()` retains its existing URI-encoding
step. As before, URI encoding is not a general HTML sanitizer. Use `textContent`,
jQuery `.text()`, or your framework's normal escaped text rendering when showing
user input, especially when using the low-level `suggest()` method.

Mailcheck is a typo suggester, **not an email validator or deliverability check**.
Never silently replace an address or block signup when a suggestion is declined.
It still uses zero runtime dependencies and makes no external requests.

What does it do?
----------------

When your user types in "user@gmil.con", Mailcheck will suggest "user@gmail.com".

Mailcheck will offer up suggestions for second and top level domains too. For example, when a user types in "user@hotmail.cmo", "hotmail.com" will be suggested. Similarly, if only the second level domain is misspelled, it will be corrected independently of the top level domain.

![diagram](https://raw.githubusercontent.com/mailcheck/mailcheck/master/doc/example.png)

See it live in action [here](https://www.kickstarter.com/signup).

Installation
------------

For this fork's unreleased version, use [mailcheck.min.js](src/mailcheck.min.js)
or [mailcheck.js](src/mailcheck.js) from this checkout. The npm/Bower commands
below install the published upstream package, not these unreleased changes.

#### Bower ####

```
> bower install --save mailcheck
```

#### Node/Browserify ####

```
> npm install --save mailcheck
```

Usage with jQuery
-----

First, include jQuery and Mailcheck into the page.

```html
<script src="jquery.min.js"></script>
<script src="mailcheck.min.js"></script>
```

Have a text field.

```html
<input id="email" name="email" type="email" />
```

Now, attach Mailcheck to the text field. You can declare an array of domains, second level domains and top level domains you want to check against.

```html
<script>
var domains = ['gmail.com', 'aol.com'];
var secondLevelDomains = ['hotmail']
var topLevelDomains = ["com", "net", "org"];

var superStringDistance = function(string1, string2) {
  // a string distance algorithm of your choosing
}

$('#email').on('blur', function() {
  $(this).mailcheck({
    domains: domains,                       // optional
    secondLevelDomains: secondLevelDomains, // optional
    topLevelDomains: topLevelDomains,       // optional
    distanceFunction: superStringDistance,  // optional
    suggested: function(element, suggestion) {
      // callback code
    },
    empty: function(element) {
      // callback code
    }
  });
});
</script>
```

Mailcheck takes in two callbacks, `suggested` and `empty`. We recommend you supply both.

`suggested` is called when there's a suggestion. Mailcheck passes in the target element and the suggestion. The suggestion is an object with the following members:

```js
{
  address: 'test',          // the address; part before the @ sign
  domain: 'gmail.com',    // the suggested domain
  full: 'test@gmail.com'  // the full suggested email
}
```
Mailcheck does not want to get in the way of how you can show suggestions. Use the suggestion object to display suggestions in your preferred manner.

`empty` is called when there's no suggestion. Mailcheck just passes in the target element. It is a good idea to use this callback to clear an existing suggestion.

Usage without jQuery
--------------------

Mailcheck is decoupled from jQuery, so its usage without jQuery is almost identical.

Using the example from above, you would call `Mailcheck.run` instead.

```html
<script>
Mailcheck.run({
  email: yourTextInput.value,
  domains: domains,                       // optional
  topLevelDomains: topLevelDomains,       // optional
  secondLevelDomains: secondLevelDomains, // optional
  distanceFunction: superStringDistance,  // optional
  suggested: function(suggestion) {
    // callback code
  },
  empty: function() {
    // callback code
  }
});
</script>
```

The rest works similarly. In fact, the Mailcheck jQuery plugin just wraps `Mailcheck.run`.

Usage on Node.js
----------------

If you're running this on Node.js, you can just `require('mailcheck')` to get the `mailcheck` object, and call `run` on that:

```js
var mailcheck = require('mailcheck');

mailcheck.run({
  // see 'usage without jQuery' above.
});
```

TypeScript
----------

Types are bundled in `index.d.ts`; no separate `@types/mailcheck` package is
needed for this fork. Remove that package if it conflicts with the bundled types.

```ts
import Mailcheck from 'mailcheck';
import type { Suggestion, RunOptions } from 'mailcheck';

const options: RunOptions = {
  email: 'Person.Name+Tag@gmial.com',
  domains: ['gmail.com', 'proton.me', 'hey.com'],
};

const suggestion: Suggestion | undefined = Mailcheck.run(options);
if (suggestion) {
  // Person.Name+Tag@gmail.com — retain the user's local part.
  output.textContent = `Did you mean ${suggestion.full}?`;
}
```

The default import uses CommonJS interop (supported by Node ESM and TypeScript
with `esModuleInterop`). For CommonJS TypeScript, use
`import Mailcheck = require('mailcheck')`. A browser-script `Mailcheck` global
is also declared. This adds types, not a separate runtime or native ESM build.

`run()` returns `Suggestion | undefined` without callbacks. Callback return
values are inferred independently:

```ts
const result = Mailcheck.run({
  email: 'person@gmil.con',
  suggested: suggestion => suggestion.full,
  empty: () => null,
}); // string | null
```

The lower-level `suggest()` and `findClosestDomain()` return `false` on no match,
not `undefined`. Their correction lists remain explicit, unlike `run()` defaults.
Types also cover custom distance functions, readonly option lists, split results,
and mutable default lists/thresholds.

For the existing jQuery plugin, opt into its declaration alongside your normal
jQuery types: `import type {} from 'mailcheck/jquery'`. This is type-only; load
jQuery and Mailcheck's runtime as before. The plugin returns `void`, not a chainable
jQuery instance, and its callbacks receive the element followed by the suggestion.

Domains
-------

Mailcheck has inbuilt defaults if the `domains`, `secondLevelDomains` or `topLevelDomains` options aren't provided. We still recommend supplying your own domains based on the distribution of your users.

#### Adding your own Domains ####

You can replace Mailcheck's default domain/TLD suggestions by supplying replacements to `mailcheck.run`:

```js
Mailcheck.run({
  domains: ['customdomain.com', 'anotherdomain.net'], // replaces existing domains
  secondLevelDomains: ['domain', 'yetanotherdomain'], // replaces existing SLDs
  topLevelDomains: ['com.au', 'ru'] // replaces existing TLDs
});
```

Alternatively, you can *extend* Mailcheck's global set of default domains and TLDs by adding items to `Mailcheck.defaultDomains` and `Mailcheck.defaultTopLevelDomains`:

```js
Mailcheck.defaultDomains.push('customdomain.com', 'anotherdomain.net') // extend existing domains
Mailcheck.defaultSecondLevelDomains.push('domain', 'yetanotherdomain') // extend existing SLDs
Mailcheck.defaultTopLevelDomains.push('com.au', 'ru') // extend existing TLDs
```

#### Recognized endings versus correction targets ####

The existing `topLevelDomains` option supplies correction targets. The IANA
recognition list is an implementation detail, not a new public option or default
property. Replacing correction targets does not discard internal recognition.

All configured domains and endings should be lowercase. Option arrays replace
the corresponding defaults, so concatenate the defaults when extending them.
Exact suffixes in `topLevelDomains` also receive protection; use that same
existing option for custom endings. An ending outside the fuzzy correction list
does not justify inventing a provider/ending combination.

Customization
-------------

The Mailcheck jQuery plugin wraps Mailcheck. The prime candidates for customization are the methods
`Mailcheck.findClosestDomain` and `Mailcheck.sift4Distance`.

Mailcheck currently uses the [sift4](https://siderite.blogspot.com/2014/11/super-fast-and-accurate-string-distance.html) string similarity algorithm by [Siderite](http://siderite.blogspot.com/). You can modify the inbuilt string distance function, or pass in your own when calling Mailcheck.

Since Mailcheck runs client side, keep in mind file size, memory usage and performance.

Tests
-----

With Node 20.19+:

- `npm test`: run the existing vendored Jasmine core specs and the new correctness
  cases against both source and minified builds. No install is needed for these tests.
- `npm run test:types`: check strict CommonJS, ESM, browser-global, and opt-in jQuery
  type fixtures, including expected compile errors (requires dev dependencies).
- `npm run build`: regenerate `src/mailcheck.min.js` with the pinned esbuild version.
- `npm run build:check`: fail if the checked-in browser build is stale.

Install dev dependencies with `npm install` before building or checking types.
The original `spec/spec_runner.html` remains available for browser Jasmine tests.
The Node tests exercise the browser/AMD/jQuery adapter in an isolated JavaScript
context, not a real browser.

Contributing
------------

Let's make Mailcheck awesome. We're on the lookout for maintainers and [contributors](https://github.com/mailcheck/mailcheck/contributors).

And do send in those pull requests! To get them accepted, please:

- Test your code. Add test cases to `spec/mailcheckSpec.js`, and run it across browsers (yes, including IE).
- Run `npm run build`, `npm test`, and `npm run test:types`. Commit the regenerated
  minified file with source changes. Keep legitimate-address fixtures alongside
  typo fixtures; never improve typo recall by silently accepting false suggestions.

Upcoming features, bugs and feature requests are managed in [Issues](https://github.com/mailcheck/mailcheck/issues).

Who uses Mailcheck?
-----------------------

- [Dropbox](http://dropbox.com/)
- [Hack Design](https://hackdesign.org/)
- [Kicksend](http://kicksend.com/)
- [Kickstarter](http://kickstarter.com/)
- [Khan Academy](http://khanacademy.org/)
- [Lyft](http://lyft.com/)
- [Minecraft](http://minecraft.net/)
- [SB Nation](http://sbnation.com/)
- [The Verge](http://theverge.com/)

Do you use Mailcheck? [Tweet me](http://twitter.com/derrickko) your link.

Related Links
-------------

- [Official Mailcheck Ports](https://github.com/mailcheck/)
- [Two ways to reduce bounced welcome emails](http://blog.postmarkapp.com/post/19685472721/two-ways-to-reduce-bounced-welcome-emails) by [Postmark](http://postmark.com)
- [MooTools port](https://github.com/DimitarChristoff/mailcheck) by [Dimitar Christoff](https://github.com/DimitarChristoff)
- [WordPress Plugin](https://github.com/bmoredrew/mailcheck-wordpress-plugin/) by [Drew Poland](https://github.com/bmoredrew)
- [WordPress e-Commerce Plugin](http://wordpress.org/extend/plugins/e-commerce-mailcheck/)
- [Mailcheck for Drupal](http://drupal.org/project/Mailcheck) by [Martin Elvar](https://twitter.com/MartinElvar)

Core Team
-------

- Derrick Ko, [@derrickko](http://twitter.com/derrickko). Created Mailcheck.
- Wei Lu, [Hive](https://www.hivewallet.com/), [@luweidewei](http://twitter.com/luweidewei).

License
-------

Released under the MIT License.
