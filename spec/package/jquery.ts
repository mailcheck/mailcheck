import $ = require('jquery');
import type {} from 'mailcheck/jquery';

const input = $('<input type="email">') as JQuery<HTMLInputElement>;
const result: void = input.mailcheck({
  domains: ['gmail.com'],
  suggested(element, suggestion) {
    const field: HTMLInputElement | undefined = element.get(0);
    const text: string = suggestion.full;
    $('#suggestion').text(text);
  },
  empty(element) {
    const field: HTMLInputElement | undefined = element.get(0);
    $('#suggestion').empty();
  }
});
// @ts-expect-error the existing plugin is not chainable
input.mailcheck({}).val();
// @ts-expect-error the plugin reads the input, not an email option
input.mailcheck({ email: 'person@gmil.con' });
