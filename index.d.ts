export = Mailcheck;
export as namespace Mailcheck;

/** Offline email-domain typo suggestions, not validation or deliverability checks. */
declare namespace Mailcheck {
  interface Suggestion {
    /** Local-part case is preserved. run() applies the existing encodeEmail() encoding. */
    address: string;
    domain: string;
    /** Render with textContent, never innerHTML. */
    full: string;
  }

  interface EmailParts {
    address: string;
    domain: string;
    secondLevelDomain: string;
    topLevelDomain: string;
  }

  type DistanceFunction = (left: string, right: string) => number;

  interface Options {
    /** Lowercase full-domain correction targets; replaces the defaults. */
    domains?: readonly string[];
    /** Lowercase second-level correction targets; replaces the defaults. */
    secondLevelDomains?: readonly string[];
    /** Lowercase suffix correction targets, including compound suffixes such as co.uk. */
    topLevelDomains?: readonly string[];
    distanceFunction?: DistanceFunction;
  }

  interface RunOptions<SuggestedResult = Suggestion, EmptyResult = undefined> extends Options {
    email: string;
    suggested?: (suggestion: Suggestion) => SuggestedResult;
    empty?: () => EmptyResult;
  }

  /** Returns a suggestion or undefined by default; callbacks replace their respective return values. */
  function run<SuggestedResult = Suggestion, EmptyResult = undefined>(
    options: RunOptions<SuggestedResult, EmptyResult>
  ): SuggestedResult | EmptyResult;

  /** Low-level API: correction lists are explicit, unlike run(). No match returns false. */
  function suggest(
    email: string,
    domains?: readonly string[],
    secondLevelDomains?: readonly string[],
    topLevelDomains?: readonly string[],
    distanceFunction?: DistanceFunction
  ): Suggestion | false;

  /** Splits an address; not a full RFC email validator or public-suffix parser. */
  function splitEmail(email: string): EmailParts | false;

  /** Equal-distance ties return false. A zero threshold permits exact matches only. */
  function findClosestDomain(
    domain: string,
    domains?: readonly string[],
    distanceFunction?: DistanceFunction,
    threshold?: number
  ): string | false;

  function sift4Distance(left: string, right: string, maxOffset?: number): number;

  /** @deprecated Legacy URI encoding only. This is NOT an HTML sanitizer. */
  function encodeEmail(email: string): string;

  let domainThreshold: number;
  let secondLevelThreshold: number;
  let topLevelThreshold: number;
  let defaultDomains: string[];
  let defaultSecondLevelDomains: string[];
  let defaultTopLevelDomains: string[];
}
