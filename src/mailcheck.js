/* globals define, module, jQuery */

/*
 * Mailcheck https://github.com/mailcheck/mailcheck
 * Author
 * Derrick Ko (@derrickko)
 *
 * Released under the MIT License.
 *
 * v 1.1.2
 */

var Mailcheck = {
  domainThreshold: 2,
  secondLevelThreshold: 2,
  prioritizedTopLevelThreshold: 2,
  topLevelThreshold: 2,

  defaultDomains: ['msn.com', 'bellsouth.net',
    'telus.net', 'comcast.net', 'optusnet.com.au',
    'earthlink.net', 'qq.com', 'sky.com', 'icloud.com',
    'mac.com', 'sympatico.ca', 'googlemail.com',
    'att.net', 'xtra.co.nz', 'web.de',
    'cox.net', 'gmail.com', 'ymail.com',
    'aim.com', 'rogers.com', 'verizon.net',
    'rocketmail.com', 'google.com', 'optonline.net',
    'sbcglobal.net', 'aol.com', 'me.com', 'btinternet.com',
    'charter.net', 'shaw.ca', 'stadt-nuernberg.de'],

  defaultSecondLevelDomains: ["yahoo", "hotmail", "mail", "live", "outlook", "gmx", "stadt-nuernberg"],

  defaultPrioritizedTopLevelDomains: ["com"],

  defaultTopLevelDomains: ["com", "com.au", "com.tw", "ca", "co.nz", "co.uk", "de",
    "fr", "it", "ru", "net", "org", "edu", "gov", "jp", "nl", "kr", "se", "eu",
    "ie", "co.il", "us", "at", "be", "dk", "hk", "es", "gr", "ch", "no", "cz",
    "in", "net", "net.au", "info", "biz", "mil", "co.jp", "sg", "hu"],

  run: function(opts) {
    opts.domains = opts.domains || Mailcheck.defaultDomains;
    opts.secondLevelDomains = opts.secondLevelDomains || Mailcheck.defaultSecondLevelDomains;
    opts.prioritizedTopLevelDomains = opts.prioritizedTopLevelDomains || Mailcheck.defaultPrioritizedTopLevelDomains;
    opts.topLevelDomains = opts.topLevelDomains || Mailcheck.defaultTopLevelDomains;
    opts.distanceFunction = opts.distanceFunction || Mailcheck.sift4Distance;

    var defaultCallback = function(result){ return result; };
    var suggestedCallback = opts.suggested || defaultCallback;
    var emptyCallback = opts.empty || defaultCallback;

    var result = Mailcheck.suggest(Mailcheck.encodeEmail(opts.email), opts.domains, opts.secondLevelDomains, opts.prioritizedTopLevelDomains, opts.topLevelDomains, opts.distanceFunction);

    return result ? suggestedCallback(result) : emptyCallback();
  },

  suggest: function(
    email,
    domains,
    secondLevelDomains,
    prioritizedTopLevelDomains,
    topLevelDomains,
    distanceFunction
  ) {
    email = email.toLowerCase();

    var emailParts = this.splitEmail(email);

    if (secondLevelDomains && prioritizedTopLevelDomains && topLevelDomains) {
        // If the email is a valid 2nd-level + top-level, do not suggest anything.
        if (
          secondLevelDomains.indexOf(emailParts.secondLevelDomain) !== -1 &&
          prioritizedTopLevelDomains.indexOf(emailParts.topLevelDomain) !== -1 &&
          topLevelDomains.indexOf(emailParts.topLevelDomain) !== -1
        ) {
            return false;
        }
    }

    var closestDomain = this.findClosestDomain(emailParts.domain, domains, distanceFunction, this.domainThreshold);

    if (closestDomain) {
      if (closestDomain == emailParts.domain) {
        // The email address exactly matches one of the supplied domains; do not return a suggestion.
        return false;
      } else {
        // The email address closely matches one of the supplied domains; return a suggestion
        return { address: emailParts.address, domain: closestDomain, full: emailParts.address + "@" + closestDomain };
      }
    }

    // The email address does not closely match one of the supplied domains
    var closestSecondLevelDomain = this.findClosestDomain(emailParts.secondLevelDomain, secondLevelDomains, distanceFunction, this.secondLevelThreshold);
    var closestPrioritizedTopLevelDomain = this.findClosestDomain(emailParts.topLevelDomain, prioritizedTopLevelDomains, distanceFunction, this.prioritizedTopLevelThreshold);
    var closestTopLevelDomain = this.findClosestDomain(emailParts.topLevelDomain, topLevelDomains, distanceFunction, this.topLevelThreshold);

    if (emailParts.domain && emailParts.secondLevelDomain) {
      closestDomain = emailParts.domain;
      var rtrn = false;

      if(closestSecondLevelDomain && closestSecondLevelDomain != emailParts.secondLevelDomain) {
        // The email address may have a mispelled second-level domain; return a suggestion
        closestDomain = closestDomain.replace(emailParts.secondLevelDomain, closestSecondLevelDomain);
        rtrn = true;
      }

      if(
        closestPrioritizedTopLevelDomain &&
        closestPrioritizedTopLevelDomain != emailParts.topLevelDomain &&
        closestTopLevelDomain != emailParts.topLevelDomain
      ) {
        closestDomain = closestDomain.replace('.' + emailParts.topLevelDomain, '.' + closestPrioritizedTopLevelDomain);
        rtrn = true;
      } else if(closestTopLevelDomain && closestTopLevelDomain != emailParts.topLevelDomain) {
        // The email address may have a mispelled top-level domain; return a suggestion
        closestDomain = closestDomain.replace('.' + emailParts.topLevelDomain, '.' + closestTopLevelDomain);
        rtrn = true;
      }

      if (rtrn == true) {
        return { address: emailParts.address, domain: closestDomain, full: emailParts.address + "@" + closestDomain };
      }
    }

    /* The email address exactly matches one of the supplied domains, does not closely
     * match any domain and does not appear to simply have a mispelled top-level domain,
     * or is an invalid email address; do not return a suggestion.
     */
    return false;
  },

  findClosestDomain: function(domain, domains, distanceFunction, threshold) {
    threshold = threshold || this.topLevelThreshold;
    var dist;
    var minDist = 99;
    var closestDomain = null;

    if (!domain || !domains) {
      return false;
    }
    if(!distanceFunction) {
      distanceFunction = this.sift4Distance;
    }

    for (var i = 0; i < domains.length; i++) {
      if (domain === domains[i]) {
        return domain;
      }
      dist = distanceFunction(domain, domains[i]);
      if (dist < minDist) {
        minDist = dist;
        closestDomain = domains[i];
      }
    }

    if (minDist <= threshold && closestDomain !== null) {
      return closestDomain;
    } else {
      return false;
    }
  },

  sift4Distance: function(s1, s2) {
      if (!s1||!s1.length) {
          if (!s2) {
              return 0;
          }
          return s2.length;
      }

      if (!s2||!s2.length) {
          return s1.length;
      }

      var l1=s1.length;
      var l2=s2.length;

      var c1 = 0;  //cursor for string 1
      var c2 = 0;  //cursor for string 2
      var lcss = 0;  //largest common subsequence
      var local_cs = 0; //local common substring
      var maxOffset = 5;

      while ((c1 < l1) && (c2 < l2)) {
          if (s1.charAt(c1) == s2.charAt(c2)) {
              local_cs++;
          } else {
              lcss+=local_cs;
              local_cs=0;
              if (c1!=c2) {
                  c1=c2=Math.max(c1,c2); //using max to bypass the need for computer transpositions ('ab' vs 'ba')
              }
              for (var i = 0; i < maxOffset && (c1+i<l1 || c2+i<l2); i++) {
                  var matches1 = (c1 + i < l1) && (s1.charAt(c1 + i) == s2.charAt(c2));
                  var matches2 = (c2 + i < l2) && (s1.charAt(c1) == s2.charAt(c2 + i));
                  if (matches1 || matches2) {
                    if (matches1) {
                      local_cs++;
                      c1 += i;
                      if (i == 0) {
                        break;
                      }
                    }
                    if (matches2) {
                      local_cs += matches1 ? 0.5 : 1;
                      c2 += i;
                    }
                    break;
                  }
              }
          }
          c1++;
          c2++;
      }
      lcss+=local_cs;
      return Math.max(l1,l2)- lcss;
  },

  splitEmail: function(email) {
    var parts = email.trim().split('@');

    if (parts.length < 2) {
      return false;
    }

    for (var i = 0; i < parts.length; i++) {
      if (parts[i] === '') {
        return false;
      }
    }

    var domain = parts.pop();
    var domainParts = domain.split('.');
    var sld = '';
    var tld = '';

    if (domainParts.length === 0) {
      // The address does not have a top-level domain
      return false;
    } else if (domainParts.length == 1) {
      // The address has only a top-level domain (valid under RFC)
      tld = domainParts[0];
    } else {
      // The address has a domain and a top-level domain
      sld = domainParts[0];
      for (var j = 1; j < domainParts.length; j++) {
        tld += domainParts[j] + '.';
      }
      tld = tld.substring(0, tld.length - 1);
    }

    return {
      topLevelDomain: tld,
      secondLevelDomain: sld,
      domain: domain,
      address: parts.join('@')
    };
  },

  // Encode the email address to prevent XSS but leave in valid
  // characters, following this official spec:
  // http://en.wikipedia.org/wiki/Email_address#Syntax
  encodeEmail: function(email) {
    var result = encodeURI(email);
    result = result.replace('%20', ' ').replace('%25', '%').replace('%5E', '^')
                   .replace('%60', '`').replace('%7B', '{').replace('%7C', '|')
                   .replace('%7D', '}');
    return result;
  }
};

// Export the mailcheck object if we're in a CommonJS env (e.g. Node).
// Modeled off of Underscore.js.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Mailcheck;
}

// Support AMD style definitions
// Based on jQuery (see http://stackoverflow.com/a/17954882/1322410)
if (typeof define === "function" && define.amd) {
  define("mailcheck", [], function() {
    return Mailcheck;
  });
}

if (typeof window !== 'undefined' && window.jQuery) {
  (function($){
    $.fn.mailcheck = function(opts) {
      var self = this;
      if (opts.suggested) {
        var oldSuggested = opts.suggested;
        opts.suggested = function(result) {
          oldSuggested(self, result);
        };
      }

      if (opts.empty) {
        var oldEmpty = opts.empty;
        opts.empty = function() {
          oldEmpty.call(null, self);
        };
      }

      opts.email = this.val();
      Mailcheck.run(opts);
    };
  })(jQuery);
}
