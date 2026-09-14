import Mailcheck from '../../src/mailcheck.js';
import type { Suggestion, RunOptions } from '../../src/mailcheck.js';

const options: RunOptions = { email: 'Person@gmial.com', topLevelDomains: ['com', 'ai'] };
const result: Suggestion | undefined = Mailcheck.run(options);
// @ts-expect-error typed options reject misspelled property names
Mailcheck.run({ email: 'x@gmil.con', topLevelDomain: ['com'] });
