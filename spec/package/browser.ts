/// <reference types="mailcheck" />
// Compile-only browser consumer: the page supplies the existing Mailcheck global.
const result: Mailcheck.Suggestion | undefined = Mailcheck.run({ email: 'Person@gmial.com' });
