import Mailcheck from 'mailcheck';
import minified from 'mailcheck/src/mailcheck.min.js';
import type { Suggestion, RunOptions } from 'mailcheck';

const options: RunOptions = { email: 'Person@gmial.com' };
const result: Suggestion | undefined = Mailcheck.run(options);
if (result?.full !== 'Person@gmail.com') throw new Error('ESM package suggestion failed');
if (minified.run(options)?.full !== result.full) throw new Error('Minified ESM consumer differs');
if (minified.run({ email: 'sample@gmail' })?.full !== 'sample@gmail.com') {
  throw new Error('Minified ESM completion failed');
}
const empty: Suggestion | undefined = Mailcheck.run({ email: 'person@company.ai' });
if (empty !== undefined) throw new Error('ESM package changed a legitimate address');
