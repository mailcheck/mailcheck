import Mailcheck = require('../..');

const options: Mailcheck.RunOptions = { email: 'Person@gmial.com', domains: ['gmail.com'] as const };
const result: Mailcheck.Suggestion | undefined = Mailcheck.run(options);
if (result) {
  const address: string = result.address;
  const domain: string = result.domain;
  const full: string = result.full;
}
const callbacks: number | 'empty' = Mailcheck.run({
  email: 'person@gmial.com',
  suggested: suggestion => suggestion.full.length,
  empty: () => 'empty' as const
});
const suggestedOnly: string | undefined = Mailcheck.run({ email: 'x@gmil.con', suggested: s => s.full });
const emptyOnly: Mailcheck.Suggestion | null = Mailcheck.run({ email: 'x@hey.com', empty: () => null });
const voidCallback: void | undefined = Mailcheck.run({ email: 'x@gmil.con', suggested: () => {} });
const suggestion: Mailcheck.Suggestion | false = Mailcheck.suggest('x@gmil.con', ['gmail.com']);
const parts: Mailcheck.EmailParts | false = Mailcheck.splitEmail('x@gmail.com');
if (parts) { const suffix: string = parts.topLevelDomain; }
const distance: Mailcheck.DistanceFunction = (a, b) => Math.abs(a.length - b.length);
const closest: string | false = Mailcheck.findClosestDomain('gmial.com', ['gmail.com'], distance, 0);
Mailcheck.defaultTopLevelDomains.push('corp');
Mailcheck.domainThreshold = 1;
Mailcheck.sift4Distance('one', 'two', 5);
Mailcheck.encodeEmail('x@gmail.com');

// @ts-expect-error recognition is internal, not a new caller option
Mailcheck.run({ email: 'x@gmil.con', validTopLevelDomains: ['com'] });
// @ts-expect-error the original suggest signature has five parameters
Mailcheck.suggest('x@gmil.con', [], [], [], distance, ['com']);
// @ts-expect-error no new public defaults are exposed
Mailcheck.defaultValidTopLevelDomains;
// @ts-expect-error email is required
Mailcheck.run({});
// @ts-expect-error email is a string
Mailcheck.run({ email: 123 });
// @ts-expect-error distances must be numbers
Mailcheck.run({ email: 'x@gmil.con', distanceFunction: () => 'close' });
// @ts-expect-error suggestions have no confidence score
Mailcheck.run({ email: 'x@gmil.con', suggested: s => s.confidence });
// @ts-expect-error callbacks can return a number, not necessarily a suggestion
const wrongCallback: Mailcheck.Suggestion | undefined = Mailcheck.run({ email: 'x@gmil.con', suggested: () => 42 });
// @ts-expect-error no-match result must be narrowed
const unchecked: string = Mailcheck.run({ email: 'x@hey.com' }).full;
// @ts-expect-error low-level no-match is false, not undefined
const wrongEmpty: Mailcheck.Suggestion | undefined = Mailcheck.suggest('x@hey.com');
