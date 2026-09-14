import Mailcheck = require('./');

/** Type-only opt-in: import type {} from 'mailcheck/jquery'. Load the runtime plugin separately. */
export interface JQueryOptions<TElement = HTMLElement> extends Mailcheck.Options {
  suggested?: (element: JQuery<TElement>, suggestion: Mailcheck.Suggestion) => void;
  empty?: (element: JQuery<TElement>) => void;
}

declare global {
  interface JQuery<TElement = HTMLElement> {
    /** The existing plugin returns void, not a chainable JQuery instance. */
    mailcheck(options: JQueryOptions<TElement>): void;
  }
}
