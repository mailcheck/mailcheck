import $ = require('jquery');
import type {} from '../../jquery';

// Merge with the real @types/jquery declarations, not a substitute interface.
const input = $('<input type="email">') as JQuery<HTMLInputElement>;
const result: void = input.mailcheck({
  domains: ['gmail.com'],
  suggested(element, suggestion) {
    const field: HTMLInputElement | undefined = element.get(0);
    const full: string = suggestion.full;
  },
  empty(element) { const field: HTMLInputElement | undefined = element.get(0); }
});
// @ts-expect-error plugin reads the input value; it does not take an email option
input.mailcheck({ email: 'x@gmil.con' });
// @ts-expect-error plugin is not chainable
input.mailcheck({}).get(0);
