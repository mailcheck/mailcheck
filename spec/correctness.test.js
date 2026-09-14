const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const Mailcheck = require(process.env.MAILCHECK_SOURCE ? path.resolve(process.env.MAILCHECK_SOURCE) : '../');

const typos = [
  ['person@gmil.con', 'person@gmail.com'],
  ['Person.Name+Tag@gmial.com', 'Person.Name+Tag@gmail.com'],
  ['person@hotmial.com', 'person@hotmail.com'],
  ['person@yahooo.cmo', 'person@yahoo.com'],
  ['person@randomsmallcompany.cmo', 'person@randomsmallcompany.com'],
  ['person@con-artists.con', 'person@con-artists.com'],
  ['person@gmail.con', 'person@gmail.com'],
];
const legitimate = [
  'person@gmail.com', 'person@company.ai', 'person@company.io',
  'person@company.app', 'person@company.dev', 'person@company.zip',
  'person@company.co', 'person@company.design', 'person@company.museum',
  'person@proton.me', 'person@protonmail.com', 'person@pm.me',
  'person@hey.com', 'person@fastmail.com', 'person@tuta.com',
  'person@gmail.co', 'person@hotmail.co', 'person@gmil.ai',
  'person@mail.example.com', 'person@example.co.uk',
  'person@bücher.de', 'person@xn--bcher-kva.de', 'person@example.рф'
];

for (const [input, expected] of typos) {
  test('corrects ' + input, () => assert.equal(Mailcheck.run({ email: input }).full, expected));
}
for (const email of legitimate) {
  test('leaves ' + email + ' alone', () => assert.equal(Mailcheck.run({ email }), undefined));
}

test('completes an exact known domain name with a missing ending', () => {
  for (const [email, full] of [
    ['sample@gmail', 'sample@gmail.com'],
    ['Sample+Tag@GMAIL', 'Sample+Tag@gmail.com'],
    ['sample@gmail.', 'sample@gmail.com'],
    ['person@icloud', 'person@icloud.com'],
    ['person@proton', 'person@proton.me']
  ]) {
    const suggestion = Mailcheck.run({ email });
    assert.equal(suggestion.full, full);
    assert.equal(Mailcheck.run({ email: suggestion.full }), undefined);
  }
});

test('completion uses existing domain lists and the existing suggested callback', () => {
  assert.deepEqual(Mailcheck.suggest('sample@gmail', ['gmail.com']), {
    address: 'sample', domain: 'gmail.com', full: 'sample@gmail.com'
  });
  assert.equal(Mailcheck.run({ email: 'sample@gmail', domains: [] }), undefined);
  assert.equal(Mailcheck.run({ email: 'sample@gmail', domains: ['custom.com'] }), undefined);
  assert.equal(Mailcheck.run({
    email: 'Person@custom', domains: ['custom.co.uk'],
    suggested: suggestion => suggestion.full,
    empty: () => 'empty'
  }), 'Person@custom.co.uk');
});

test('completion abstains on ambiguous endings, prefixes, and unknown names', () => {
  for (const domains of [['gmail.com', 'gmail.co.uk'], ['gmail.co.uk', 'gmail.com']]) {
    assert.equal(Mailcheck.run({ email: 'sample@gmail', domains }), undefined);
    assert.equal(Mailcheck.run({ email: 'sample@gmail.', domains }), undefined);
  }
  assert.equal(Mailcheck.run({ email: 'sample@gmail', domains: ['gmail.com', 'gmail.com'] }).full, 'sample@gmail.com');
  for (const domain of ['g', 'gm', 'gmai', 'gmial', 'unknowncompany', 'gmail..', 'gmail.-', '-gmail', 'gmail-', 'xn--bcher-kva']) {
    assert.equal(Mailcheck.run({ email: 'sample@' + domain }), undefined, domain);
  }
  // Respect an explicitly configured single-label domain rather than extending it.
  assert.equal(Mailcheck.run({ email: 'sample@gmail', domains: ['gmail', 'gmail.com'] }), undefined);
});

test('completion retains the encoding contract of both entry points', () => {
  const local = '<tag>Sample+Tag';
  assert.equal(Mailcheck.suggest(local + '@gmail', ['gmail.com']).address, local);
  assert.equal(Mailcheck.run({ email: local + '@gmail' }).address, Mailcheck.encodeEmail(local));
});

test('preserves local-part case and the existing encoding contract of each entry point', () => {
  for (const local of ['Person.Name+Tag', 'François', 'a%%^^``{{||}}', '"Foo@Bar"', '<script>alert("x")</script>']) {
    const email = local + '@gmial.com';
    assert.equal(Mailcheck.run({ email }).address, Mailcheck.encodeEmail(local));
    assert.equal(Mailcheck.suggest(email, Mailcheck.defaultDomains).full, local + '@gmail.com');
  }
});

test('every bundled provider is left alone and suggestions are stable', () => {
  for (const domain of Mailcheck.defaultDomains) {
    assert.equal(Mailcheck.run({ email: 'Person@' + domain }), undefined, domain);
  }
  for (const [email] of typos) {
    const suggestion = Mailcheck.run({ email });
    assert.equal(Mailcheck.run({ email: suggestion.full }), undefined, suggestion.full);
  }
});

test('domain matching is case-insensitive', () => {
  assert.equal(Mailcheck.run({ email: ' Person.Name@GMIAL.COM ' }).full, 'Person.Name@gmail.com');
});

test('malformed, missing and unsupported domains abstain without throwing', () => {
  for (const email of [null, undefined, 123, '', 'person', '@gmail.com', 'person@',
    'person@gm', 'person@gmai', 'person@#gmail.com', 'person@gmail..com',
    'person@-gmail.com', 'person@gmail-.com', 'person@[127.0.0.1]']) {
    assert.equal(Mailcheck.run({ email }), undefined, String(email));
    assert.equal(Mailcheck.splitEmail(null), false);
  }
});

test('public object keys and function signatures match the original API', () => {
  const methods = { run: 1, suggest: 5, findClosestDomain: 4, sift4Distance: 3, splitEmail: 1, encodeEmail: 1 };
  assert.deepEqual(Object.keys(Mailcheck).sort(), [
    'domainThreshold', 'secondLevelThreshold', 'topLevelThreshold',
    'defaultDomains', 'defaultSecondLevelDomains', 'defaultTopLevelDomains',
    ...Object.keys(methods)
  ].sort());
  for (const [name, arity] of Object.entries(methods)) {
    assert.equal(Mailcheck[name].length, arity, name);
  }
});

test('custom suffixes use the existing topLevelDomains option', () => {
  assert.equal(Mailcheck.run({ email: 'person@company.corp', topLevelDomains: ['corp'] }), undefined);
  assert.equal(Mailcheck.run({
    email: 'person@custmo.com', domains: ['custom.com'], secondLevelDomains: [], topLevelDomains: []
  }).full, 'person@custom.com');
});

test('equally close candidates abstain regardless of order, duplicates do not cause ambiguity', () => {
  assert.equal(Mailcheck.findClosestDomain('cat.com', ['bat.com', 'hat.com']), false);
  assert.equal(Mailcheck.findClosestDomain('cat.com', ['hat.com', 'bat.com']), false);
  assert.equal(Mailcheck.findClosestDomain('cat.com', ['bat.com', 'bat.com']), 'bat.com');
  assert.equal(Mailcheck.findClosestDomain('cat.com', ['bat.com', 'cat.com']), 'cat.com');
  assert.equal(Mailcheck.run({ email: 'person@cat.com', domains: ['bat.com', 'hat.com'], secondLevelDomains: [] }), undefined);
  assert.equal(Mailcheck.run({ email: 'person@gmial.com', domains: ['gmail.com', 'gmiel.com'] }), undefined);
});

test('zero threshold means exact matches only', () => {
  assert.equal(Mailcheck.findClosestDomain('gmial.com', ['gmail.com'], undefined, 0), false);
  assert.equal(Mailcheck.findClosestDomain('gmail.com', ['gmail.com'], undefined, 0), 'gmail.com');
});

test('custom distance and callback return values remain supported', () => {
  let calls = 0;
  assert.equal(Mailcheck.run({
    email: 'person@typo.com', domains: ['custom.com'], secondLevelDomains: [],
    distanceFunction: () => { calls++; return 1; },
    suggested: suggestion => suggestion.full, empty: () => 'empty'
  }), 'person@custom.com');
  assert.ok(calls > 0);
  assert.equal(Mailcheck.run({ email: 'person@hey.com', empty: () => 'empty' }), 'empty');
});

test('callbacks retain their argument counts, result keys, and exactly-once dispatch', () => {
  const suggestedCalls = [];
  const emptyCalls = [];
  const options = {
    email: 'Person@gmial.com',
    suggested: function() { suggestedCalls.push(Array.from(arguments)); return 'suggested-result'; },
    empty: function() { emptyCalls.push(Array.from(arguments)); return 'empty-result'; }
  };
  assert.equal(Mailcheck.run(options), 'suggested-result');
  assert.deepEqual(suggestedCalls, [[{ address: 'Person', domain: 'gmail.com', full: 'Person@gmail.com' }]]);
  assert.deepEqual(emptyCalls, []);
  options.email = 'Person@hey.com';
  assert.equal(Mailcheck.run(options), 'empty-result');
  assert.equal(suggestedCalls.length, 1);
  assert.deepEqual(emptyCalls, [[]]);
  assert.equal(Mailcheck.suggest(options.email, Mailcheck.defaultDomains), false);
  assert.equal(Mailcheck.run({ email: options.email }), undefined);
});

test('empty correction lists replace defaults without changing global lists', () => {
  const originalDomains = Mailcheck.defaultDomains.slice();
  const originalSecondLevels = Mailcheck.defaultSecondLevelDomains.slice();
  const originalSuffixes = Mailcheck.defaultTopLevelDomains.slice();
  const domains = [];
  const options = { email: 'person@gmial.com', domains, secondLevelDomains: [], topLevelDomains: [] };
  assert.equal(Mailcheck.run(options), undefined);
  assert.equal(options.domains, domains);
  assert.deepEqual(Mailcheck.defaultDomains, originalDomains);
  assert.deepEqual(Mailcheck.defaultSecondLevelDomains, originalSecondLevels);
  assert.deepEqual(Mailcheck.defaultTopLevelDomains, originalSuffixes);
  assert.equal(Mailcheck.run({ email: options.email }).full, 'person@gmail.com');
});

test('modern and regional endings stay protected independently of correction-list order', () => {
  const roots = ['ai', 'io', 'app', 'dev', 'me', 'co', 'om', 'zip', 'mov', 'xyz', 'tech',
    'cloud', 'email', 'design', 'photography', 'solutions', 'museum', 'travel', 'uk',
    'nz', 'au', 'sg', 'br', 'za', 'in', 'is', 'tv', 'gg', 'ly', 'cc'];
  for (const root of roots) {
    for (const domains of [['gmail.com', 'outlook.com'], ['outlook.com', 'gmail.com']]) {
      assert.equal(Mailcheck.run({ email: 'Person@independentcompany.' + root, domains }), undefined, root);
    }
  }
  for (const suffix of ['co.uk', 'com.au', 'co.nz', 'com.tw', 'co.jp', 'co.il']) {
    assert.equal(Mailcheck.run({ email: 'Person@independentcompany.' + suffix }), undefined, suffix);
  }
});

test('low-level suggestions preserve raw local parts while run retains URI encoding', () => {
  const local = '<tag>François+Tag';
  const raw = Mailcheck.suggest(local + '@gmial.com', ['gmail.com']);
  assert.deepEqual(raw, { address: local, domain: 'gmail.com', full: local + '@gmail.com' });
  const encoded = Mailcheck.run({ email: local + '@gmial.com' });
  assert.equal(encoded.address, Mailcheck.encodeEmail(local));
  assert.equal(encoded.full, Mailcheck.encodeEmail(local) + '@gmail.com');
  assert.notEqual(encoded.address, raw.address);
});

test('Node ESM default import exposes the same runtime', async () => {
  const source = process.env.MAILCHECK_SOURCE ? path.resolve(process.env.MAILCHECK_SOURCE) : require.resolve('../');
  const imported = await import(require('node:url').pathToFileURL(source).href);
  assert.equal(imported.default, Mailcheck);
  assert.equal(imported.default.run({ email: 'Person@gmial.com' }).full, 'Person@gmail.com');
});

test('browser global, AMD and jQuery wrap the corrected core', () => {
  const jquery = function() {};
  jquery.fn = {};
  let amd;
  const define = (name, dependencies, value) => { amd = value(); };
  define.amd = {};
  const source = process.env.MAILCHECK_SOURCE ? path.resolve(process.env.MAILCHECK_SOURCE) : path.join(__dirname, '../src/mailcheck.js');
  const context = { window: { jQuery: jquery }, jQuery: jquery, define };
  vm.runInNewContext(fs.readFileSync(source, 'utf8'), context);
  assert.equal(amd, context.Mailcheck);
  assert.equal(context.Mailcheck.run({ email: 'Person@gmial.com' }).full, 'Person@gmail.com');
  assert.deepEqual(Object.keys(context).sort(), ['Mailcheck', 'define', 'jQuery', 'window']);
  const element = { val: () => 'Person@gmial.com' };
  let suggested = false;
  jquery.fn.mailcheck.call(element, {
    suggested: (actualElement, suggestion) => {
      assert.equal(actualElement, element);
      assert.equal(suggestion.full, 'Person@gmail.com');
      suggested = true;
    }
  });
  assert.equal(suggested, true);
  let empty = false;
  jquery.fn.mailcheck.call({ val: () => 'person@hey.com' }, { empty: () => { empty = true; } });
  assert.equal(empty, true);
});
