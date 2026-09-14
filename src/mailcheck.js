/* globals define, module, jQuery */

/*
 * Mailcheck is actively maintained again.
 * Mailcheck 2.0 updates domain matching, adds TypeScript definitions,
 * and keeps the established JavaScript API intact.
 *
 * Releases and contribution details:
 * https://github.com/mailcheck/mailcheck
 */

/*
 * Mailcheck https://github.com/mailcheck/mailcheck
 * Author
 * Derrick Ko (@derrickko)
 *
 * Released under the MIT License.
 *
 * v 1.1.2
 */

var Mailcheck = (function() {
  // IANA root-zone snapshot, version 2026091400 (2026-09-14).
  // https://data.iana.org/TLD/tlds-alpha-by-domain.txt
  // Recognition only: these are NOT fuzzy correction targets. No runtime lookup.
  var validTopLevelDomains = (
    'aaa aarp abb abbott abbvie abc able abogado abudhabi ac academy accenture accountant accountants aco actor ad ads adult ae aeg aero aetna af afl africa ag agakhan agency ai aig airbus airforce airtel akdn al alibaba alipay allfinanz allstate ally alsace alstom am amazon americanexpress americanfamily amex amfam amica amsterdam analytics android anquan anz ao aol apartments app apple aq aquarelle ar arab aramco archi army arpa art arte as asda asia associates at athleta attorney au auction audi audible audio auspost author auto autos aw aws ax axa az azure ' +
    'ba baby baidu banamex band bank bar barcelona barclaycard barclays barefoot bargains baseball basketball bauhaus bayern bb bbc bbt bbva bcg bcn bd be beats beauty beer berlin best bestbuy bet bf bg bh bharti bi bible bid bike bing bingo bio biz bj black blackfriday blockbuster blog bloomberg blue bm bms bmw bn bnpparibas bo boats boehringer bofa bom bond boo book booking bosch bostik boston bot boutique box br bradesco bridgestone broadway broker brother brussels bs bt build builders business buy buzz bv bw by bz bzh ' +
    'ca cab cafe cal call calvinklein cam camera camp canon capetown capital capitalone car caravan cards care career careers cars casa case cash casino cat catering catholic cba cbn cbre cc cd center ceo cern cf cfa cfd cg ch chanel channel charity chase chat cheap chintai christmas chrome church ci cipriani circle cisco citadel citi citic city ck cl claims cleaning click clinic clinique clothing cloud club clubmed cm cn co coach codes coffee college cologne com commbank community company compare computer comsec condos construction consulting contact contractors cooking cool coop corsica country coupon coupons courses cpa cr credit creditcard creditunion cricket crown crs cruise cruises cu cuisinella cv cw cx cy cymru cyou cz ' +
    'dad dance data date dating datsun day dclk dds de deal dealer deals degree delivery dell deloitte delta democrat dental dentist desi design dev dhl diamonds diet digital direct directory discount discover dish diy dj dk dm dnp do docs doctor dog domains dot download drive dtv dubai dupont durban dvag dvr dz ' +
    'earth eat ec eco edeka edu education ee eg email emerck energy engineer engineering enterprises epson equipment er ericsson erni es esq estate et eu eurovision eus events exchange expert exposed express extraspace ' +
    'fage fail fairwinds faith family fan fans farm farmers fashion fast fedex feedback ferrari ferrero fi fidelity fido film final finance financial fire firestone firmdale fish fishing fit fitness fj fk flickr flights flir florist flowers fly fm fo foo food football ford forex forsale forum foundation fox fr free fresenius frl frogans frontier ftr fujitsu fun fund furniture futbol fyi ' +
    'ga gal gallery gallo gallup game games gap garden gay gb gbiz gd gdn ge gea gent genting george gf gg ggee gh gi gift gifts gives giving gl glass gle global globo gm gmail gmbh gmo gmx gn godaddy gold goldpoint golf goodyear goog google gop got gov gp gq gr grainger graphics gratis green gripe grocery group gs gt gu gucci guge guide guitars guru gw gy ' +
    'hair hamburg hangout haus hbo hdfc hdfcbank health healthcare help helsinki here hermes hiphop hisamitsu hitachi hiv hk hkt hm hn hockey holdings holiday homedepot homegoods homes homesense honda horse hospital host hosting hot hotels hotmail house how hr hsbc ht hu hughes hyatt hyundai ' +
    'ibm icbc ice icu id ie ieee ifm ikano il im imamat imdb immo immobilien in inc industries infiniti info ing ink institute insurance insure int international intuit investments io ipiranga iq ir irish is ismaili ist istanbul it itau itv ' +
    'jaguar java jcb je jeep jetzt jewelry jio jll jm jmp jnj jo jobs joburg jot joy jp jpmorgan jprs juegos juniper ' +
    'kaufen kddi ke kerryhotels kerryproperties kfh kg kh ki kia kids kim kindle kitchen kiwi km kn koeln komatsu kosher kp kpmg kpn kr krd kred kuokgroup kw ky kyoto kz ' +
    'la lacaixa lamborghini lamer land landrover lanxess lasalle lat latino latrobe law lawyer lb lc lds lease leclerc lefrak legal lego lexus lgbt li lidl life lifeinsurance lifestyle lighting like lilly limited limo lincoln link live living lk llc llp loan loans locker locus lol london lotte lotto love lpl lplfinancial lr ls lt ltd ltda lu lundbeck luxe luxury lv ly ' +
    'ma madrid maif maison makeup man management mango map market marketing markets marriott marshalls mattel mba mc mckinsey md me med media meet melbourne meme memorial men menu merck merckmsd mg mh miami microsoft mil mini mint mit mitsubishi mk ml mlb mls mm mma mn mo mobi mobile moda moe moi mom monash money monster mormon mortgage moscow moto motorcycles mov movie mp mq mr ms msd mt mtn mtr mu museum music mv mw mx my mz ' +
    'na nab nagoya name navy nba nc ne nec net netbank netflix network neustar new news next nextdirect nexus nf nfl ng ngo nhk ni nico nike nikon ninja nissan nissay nl no nokia norton now nowruz nowtv np nr nra nrw ntt nu nyc nz ' +
    'obi observer office okinawa olayan olayangroup ollo om omega one ong onl online ooo open oracle orange org organic origins osaka otsuka ott ovh ' +
    'pa page panasonic paris pars partners parts party pay pccw pe pet pf pfizer pg ph pharmacy phd philips phone photo photography photos physio pics pictet pictures pid pin ping pink pioneer pizza pk pl place play playstation plumbing plus pm pn pnc pohl poker politie porn post pr praxi press prime pro prod productions prof progressive promo properties property protection pru prudential ps pt pub pw pwc py ' +
    'qa qpon quebec quest racing radio re read realestate realtor realty recipes red redumbrella rehab reise reisen reit reliance ren rent rentals repair report republican rest restaurant review reviews rexroth rich richardli ricoh ril rio rip ro rocks rodeo rogers room rs rsvp ru rugby ruhr run rw rwe ryukyu ' +
    'sa saarland safe safety sakura sale salon samsclub samsung sandvik sandvikcoromant sanofi sap sarl sas save saxo sb sbi sbs sc scb schaeffler schmidt scholarships school schule schwarz science scot sd se search seat secure security seek select sener services seven sew sex sexy sfr sg sh shangrila sharp shell shia shiksha shoes shop shopping shouji show si silk sina singles site sj sk ski skin sky skype sl sling sm smart smile sn sncf so soccer social softbank software sohu solar solutions song sony soy spa space sport spot sr srl ss st stada staples star statebank statefarm stc stcgroup stockholm storage store stream studio study style su sucks supplies supply support surf surgery suzuki sv swatch swiss sx sy sydney systems sz ' +
    'tab taipei talk taobao target tatamotors tatar tattoo tax taxi tc tci td tdk team tech technology tel temasek tennis teva tf tg th thd theater theatre tiaa tickets tienda tips tires tirol tj tjmaxx tjx tk tkmaxx tl tm tmall tn to today tokyo tools top toray toshiba total tours town toyota toys tr trade trading training travel travelers travelersinsurance trust trv tt tube tui tunes tushu tv tvs tw tz ' +
    'ua ubank ubs ug uk unicom university uno uol ups us uy uz va vacations vana vanguard vc ve vegas ventures verisign versicherung vet vg vi viajes video vig viking villas vin vip virgin visa vision viva vivo vlaanderen vn vodka volvo vote voting voto voyage vu ' +
    'wales walmart walter wang wanggou watch watches weather weatherchannel web webcam weber website wed wedding weibo weir wf whoswho wien wiki williamhill win windows wine winners wme woodside work works world wow ws wtc wtf xbox xerox xihuan xin ' +
    'xn--11b4c3d xn--1ck2e1b xn--1qqw23a xn--2scrj9c xn--30rr7y xn--3bst00m xn--3ds443g xn--3e0b707e xn--3hcrj9c xn--3pxu8k xn--42c2d9a xn--45br5cyl xn--45brj9c xn--45q11c xn--4dbrk0ce xn--4gbrim xn--54b7fta0cc xn--55qw42g xn--55qx5d xn--5su34j936bgsg xn--5tzm5g xn--6frz82g xn--6qq986b3xl xn--80adxhks xn--80ao21a xn--80aqecdr1a xn--80asehdb xn--80aswg xn--8y0a063a xn--90a3ac xn--90ae xn--90ais xn--9dbq2a xn--9et52u xn--9krt00a xn--b4w605ferd xn--bck1b9a5dre4c xn--c1avg xn--c2br7g xn--cck2b3b xn--cckwcxetd xn--cg4bki xn--clchc0ea0b2g2a9gcd xn--czr694b xn--czrs0t xn--czru2d xn--d1acj3b xn--d1alf xn--e1a4c xn--eckvdtc9d xn--efvy88h xn--fct429k xn--fhbei xn--fiq228c5hs xn--fiq64b xn--fiqs8s xn--fiqz9s xn--fjq720a xn--flw351e xn--fpcrj9c3d xn--fzc2c9e2c xn--fzys8d69uvgm xn--g2xx48c xn--gckr3f0f xn--gecrj9c xn--gk3at1e xn--h2breg3eve xn--h2brj9c xn--h2brj9c8c xn--hxt814e xn--i1b6b1a6a2e xn--imr513n xn--io0a7i xn--j1aef xn--j1amh xn--j6w193g xn--jlq480n2rg xn--jvr189m xn--kcrx77d1x4a xn--kprw13d xn--kpry57d xn--kput3i xn--l1acc xn--lgbbat1ad8j xn--mgb9awbf xn--mgba3a3ejt xn--mgba3a4f16a xn--mgba7c0bbn0a xn--mgbaam7a8h xn--mgbab2bd xn--mgbah1a3hjkrd xn--mgbai9azgqp6j xn--mgbayh7gpa xn--mgbbh1a xn--mgbbh1a71e xn--mgbc0a9azcg xn--mgbca7dzdo xn--mgbcpq6gpa1a xn--mgberp4a5d4ar xn--mgbgu82a xn--mgbi4ecexp xn--mgbpl2fh xn--mgbt3dhd xn--mgbtx2b xn--mgbx4cd0ab xn--mix891f xn--mk1bu44c xn--mxtq1m xn--ngbc5azd xn--ngbe9e0a xn--ngbrx xn--node xn--nqv7f xn--nqv7fs00ema xn--nyqy26a xn--o3cw4h xn--ogbpf8fl xn--otu796d xn--p1acf xn--p1ai xn--pgbs0dh xn--pssy2u xn--q7ce6a xn--q9jyb4c xn--qcka1pmc xn--qxa6a xn--qxam xn--rhqv96g xn--rovu88b xn--rvc1e0am3e xn--s9brj9c xn--ses554g xn--t60b56a xn--tckwe xn--tiq49xqyj xn--unup4y xn--vermgensberater-ctb xn--vermgensberatung-pwb xn--vhquv xn--vuq861b xn--w4r85el8fhu5dnra xn--w4rs40l xn--wgbh1c xn--wgbl6a xn--xhq521b xn--xkc2al3hye2a xn--xkc2dl3a5ee0h xn--y9a3aq xn--yfro4i67o xn--ygbi2ammx xn--zfr164b ' +
    'xxx xyz yachts yahoo yamaxun yandex ye yodobashi yoga yokohama you youtube yt yun za zappos zara zero zip zm zone zuerich zw'
  ).split(' ');

  var api = {
  domainThreshold: 2,
  secondLevelThreshold: 2,
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
    'charter.net', 'shaw.ca', 'proton.me', 'protonmail.com', 'pm.me',
    'hey.com', 'fastmail.com', 'tuta.com', 'tutanota.com', 'tutamail.com'],

  defaultSecondLevelDomains: ["yahoo", "hotmail", "mail", "live", "outlook", "gmx"],

  defaultTopLevelDomains: ["com", "com.au", "com.tw", "ca", "co.nz", "co.uk", "de",
    "fr", "it", "ru", "net", "org", "edu", "gov", "jp", "nl", "kr", "se", "eu",
    "ie", "co.il", "us", "at", "be", "dk", "hk", "es", "gr", "ch", "no", "cz",
    "in", "net", "net.au", "info", "biz", "mil", "co.jp", "sg", "hu", "uk"],

  run: function(opts) {
    opts.domains = opts.domains || Mailcheck.defaultDomains;
    opts.secondLevelDomains = opts.secondLevelDomains || Mailcheck.defaultSecondLevelDomains;
    opts.topLevelDomains = opts.topLevelDomains || Mailcheck.defaultTopLevelDomains;
    opts.distanceFunction = opts.distanceFunction || Mailcheck.sift4Distance;

    var defaultCallback = function(result){ return result; };
    var suggestedCallback = opts.suggested || defaultCallback;
    var emptyCallback = opts.empty || defaultCallback;

    // Trim before encoding, so trailing whitespace cannot become a domain token.
    var email = opts.email;
    if (typeof email === 'string') {
      email = email.replace(/^\s*/, '').replace(/\s*$/, '');
    }
    var result = Mailcheck.suggest(Mailcheck.encodeEmail(email), opts.domains,
      opts.secondLevelDomains, opts.topLevelDomains, opts.distanceFunction);

    return result ? suggestedCallback(result) : emptyCallback();
  },

  suggest: function(email, domains, secondLevelDomains, topLevelDomains, distanceFunction) {
    var emailParts = this.splitEmail(email);
    if (!emailParts) {
      return false;
    }

    // Preserve the local part verbatim. Only the domain is case-insensitive.
    emailParts.domain = emailParts.domain.toLowerCase();
    emailParts.secondLevelDomain = emailParts.secondLevelDomain.toLowerCase();
    emailParts.topLevelDomain = emailParts.topLevelDomain.toLowerCase();

    // Complete a missing ending only for an exact name with one known full
    // domain. Do not fuzzy-match prefixes or invent name/ending combinations.
    if (/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.?$/.test(emailParts.domain) &&
        emailParts.domain.indexOf('xn--') !== 0) {
      if (domains && domains.indexOf(emailParts.domain) !== -1) {
        return false;
      }
      var prefix = emailParts.domain.replace(/\.$/, '') + '.';
      var completion = false;
      for (var d = 0; domains && d < domains.length; d++) {
        if (domains[d].indexOf(prefix) === 0 && domains[d].length > prefix.length) {
          if (completion && completion !== domains[d]) {
            return false;
          }
          completion = domains[d];
        }
      }
      return completion ? { address: emailParts.address, domain: completion,
        full: emailParts.address + '@' + completion } : false;
    }

    // Do not guess about other malformed, Unicode or punycode domains.
    // Internationalized local parts are safe to preserve without transforming them.
    if (!emailParts.secondLevelDomain ||
        !/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(emailParts.domain) ||
        /(^|\.)-|-(\.|$)|(^|\.)xn--/.test(emailParts.domain)) {
      return false;
    }

    // The legacy splitter does not understand public suffixes or subdomains.
    // Only handle compound suffixes explicitly listed by the caller.
    if (emailParts.topLevelDomain.indexOf('.') !== -1 &&
        (!topLevelDomains || topLevelDomains.indexOf(emailParts.topLevelDomain) === -1)) {
      return false;
    }

    var root = emailParts.domain.substring(emailParts.domain.lastIndexOf('.') + 1);
    var knownTopLevelDomain = validTopLevelDomains.indexOf(root) !== -1 ||
      !!(topLevelDomains && topLevelDomains.indexOf(emailParts.topLevelDomain) !== -1);

    // A recognized suffix must not become a different suffix (e.g. .co -> .com).
    var matchingDomains = domains;
    if (knownTopLevelDomain && domains) {
      matchingDomains = [];
      for (var i = 0; i < domains.length; i++) {
        if (domains[i].substring(domains[i].indexOf('.') + 1) === emailParts.topLevelDomain) {
          matchingDomains.push(domains[i]);
        }
      }
    }

    if (secondLevelDomains && topLevelDomains) {
        // If the email is a valid 2nd-level + top-level, do not suggest anything.
        if (secondLevelDomains.indexOf(emailParts.secondLevelDomain) !== -1 && topLevelDomains.indexOf(emailParts.topLevelDomain) !== -1) {
            return false;
        }
    }

    var domainMatch = mailcheckClosestMatch(emailParts.domain, matchingDomains,
      distanceFunction || this.sift4Distance, this.domainThreshold);
    if (domainMatch.ambiguous) {
      return false;
    }
    var closestDomain = domainMatch.domain;

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
    // A recognized ending outside the correction list is not evidence for a
    // provider combination (e.g. gmil.ai must not turn into mail.ai).
    if (knownTopLevelDomain && (!topLevelDomains || topLevelDomains.indexOf(emailParts.topLevelDomain) === -1)) {
      return false;
    }
    var closestSecondLevelDomain = this.findClosestDomain(emailParts.secondLevelDomain, secondLevelDomains, distanceFunction, this.secondLevelThreshold);
    var closestTopLevelDomain = knownTopLevelDomain ? emailParts.topLevelDomain :
      this.findClosestDomain(emailParts.topLevelDomain, topLevelDomains, distanceFunction, this.topLevelThreshold);

    if (emailParts.domain) {
      closestDomain = emailParts.domain;
      var rtrn = false;

      if(closestSecondLevelDomain && closestSecondLevelDomain != emailParts.secondLevelDomain) {
        // The email address may have a mispelled second-level domain; return a suggestion
        closestDomain = closestDomain.replace(emailParts.secondLevelDomain, closestSecondLevelDomain);
        rtrn = true;
      }

      if(closestTopLevelDomain && closestTopLevelDomain != emailParts.topLevelDomain && emailParts.secondLevelDomain !== '') {
        // The email address may have a mispelled top-level domain; return a suggestion
        closestDomain = closestDomain.substring(0, closestDomain.length - emailParts.topLevelDomain.length) + closestTopLevelDomain;
        rtrn = true;
      }

      if (rtrn) {
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
    return mailcheckClosestMatch(domain, domains, distanceFunction || this.sift4Distance,
      threshold === undefined ? this.topLevelThreshold : threshold).domain;
  },

  sift4Distance: function(s1, s2, maxOffset) {
    // sift4: https://siderite.blogspot.com/2014/11/super-fast-and-accurate-string-distance.html
    if (maxOffset === undefined) {
        maxOffset = 5; //default
    }

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
    var trans = 0;  //number of transpositions ('ab' vs 'ba')
    var offset_arr=[];  //offset pair array, for computing the transpositions

    while ((c1 < l1) && (c2 < l2)) {
        if (s1.charAt(c1) == s2.charAt(c2)) {
            local_cs++;
            var isTrans=false;
            //see if current match is a transposition
            var i=0;
            while (i<offset_arr.length) {
                var ofs=offset_arr[i];
                if (c1<=ofs.c1 || c2 <= ofs.c2) {
                    // when two matches cross, the one considered a transposition is the one with the largest difference in offsets
                    isTrans=Math.abs(c2-c1)>=Math.abs(ofs.c2-ofs.c1);
                    if (isTrans)
                    {
                        trans++;
                    } else
                    {
                        if (!ofs.trans) {
                            ofs.trans=true;
                            trans++;
                        }
                    }
                    break;
                } else {
                    if (c1>ofs.c2 && c2>ofs.c1) {
                        offset_arr.splice(i,1);
                    } else {
                        i++;
                    }
                }
            }
            offset_arr.push({
                c1:c1,
                c2:c2,
                trans:isTrans
            });
        } else {
            lcss+=local_cs;
            local_cs=0;
            if (c1!=c2) {
                c1=c2=Math.min(c1,c2);  //using min allows the computation of transpositions
            }
            //if matching characters are found, remove 1 from both cursors (they get incremented at the end of the loop)
            //so that we can have only one code block handling matches 
            for (var j = 0; j < maxOffset && (c1+j<l1 || c2+j<l2); j++) {
                if ((c1 + j < l1) && (s1.charAt(c1 + j) == s2.charAt(c2))) {
                    c1+= j-1; 
                    c2--;
                    break;
                }
                if ((c2 + j < l2) && (s1.charAt(c1) == s2.charAt(c2 + j))) {
                    c1--;
                    c2+= j-1;
                    break;
                }
            }
        }
        c1++;
        c2++;
        // this covers the case where the last match is on the last token in list, so that it can compute transpositions correctly
        if ((c1 >= l1) || (c2 >= l2)) {
            lcss+=local_cs;
            local_cs=0;
            c1=c2=Math.min(c1,c2);
        }
    }
    lcss+=local_cs;
    return Math.round(Math.max(l1,l2)- lcss +trans); //add the cost of transpositions to the final result
  },

  splitEmail: function(email) {
    if (typeof email !== 'string') {
      return false;
    }
    email = email.replace(/^\s*/, '').replace(/\s*$/, '');
    var parts = email.split('@');

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

  // Legacy URI-encoding helper, retained for compatibility only.
  // NOT an HTML sanitizer. Render suggestions with textContent / jQuery.text().
  // Originally based on:
  // http://en.wikipedia.org/wiki/Email_address#Syntax
  encodeEmail: function(email) {
    var result = encodeURI(email);
    result = result.replace('%20', ' ').replace(/%25/g, '%').replace('%5E', '^')
                   .replace('%60', '`').replace('%7B', '{').replace('%7C', '|')
                   .replace('%7D', '}');
    return result;
  }
};

// Keep ambiguity distinct from no match internally, so fallback cannot turn a
// tied full-domain match into an arbitrary second-level suggestion.
function mailcheckClosestMatch(domain, domains, distanceFunction, threshold) {
  var minDist = Infinity;
  var closestDomain = false;
  var ambiguous = false;
  if (!domain || !domains) {
    return { domain: false, ambiguous: false };
  }
  for (var i = 0; i < domains.length; i++) {
    if (domain === domains[i]) {
      return { domain: domain, ambiguous: false };
    }
    var dist = distanceFunction(domain, domains[i]);
    if (dist < minDist) {
      minDist = dist;
      closestDomain = domains[i];
      ambiguous = false;
    } else if (dist === minDist && domains[i] !== closestDomain) {
      ambiguous = true;
    }
  }
  return {
    domain: minDist <= threshold && !ambiguous ? closestDomain : false,
    ambiguous: minDist <= threshold && ambiguous
  };
}

  return api;
})();

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
