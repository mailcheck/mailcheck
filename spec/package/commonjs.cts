import Mailcheck = require('mailcheck');
import direct = require('mailcheck/src/mailcheck.js');
import minified = require('mailcheck/src/mailcheck.min.js');

function check(condition: boolean): asserts condition {
  if (!condition) throw new Error('CommonJS package consumer assertion failed');
}

const options: Mailcheck.RunOptions = { email: 'Person+Tag@gmial.com', domains: ['gmail.com'] as const };
const result: Mailcheck.Suggestion | undefined = Mailcheck.run(options);
check(result?.full === 'Person+Tag@gmail.com');
const completion: Mailcheck.Suggestion | undefined = Mailcheck.run({ email: 'sample@gmail' });
check(completion?.full === 'sample@gmail.com');
check(direct === Mailcheck);
check(minified.run({ email: 'person@hey.com' }) === undefined);
const callbackResult: number | null = Mailcheck.run({
  email: 'person@gmil.con', suggested: suggestion => suggestion.full.length, empty: () => null
});
check(callbackResult === 'person@gmail.com'.length);
check(Mailcheck.suggest('person@hey.com', Mailcheck.defaultDomains) === false);

// These compile-time checks are unreachable at runtime.
if (false) {
  // @ts-expect-error keep the existing option surface
  Mailcheck.run({ email: 'x@gmil.con', validTopLevelDomains: ['com'] });
  // @ts-expect-error suggest still takes five arguments
  Mailcheck.suggest('x@gmil.con', [], [], [], undefined, []);
  // @ts-expect-error callers must handle the empty result
  const unchecked: string = Mailcheck.run({ email: 'x@hey.com' }).full;
}
