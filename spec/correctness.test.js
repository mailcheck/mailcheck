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
