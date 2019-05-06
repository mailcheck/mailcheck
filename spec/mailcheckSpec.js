describe("mailcheck", function() {
  var domains = ['google.com', 'gmail.com', 'emaildomain.com', 'comcast.net', 'facebook.com', 'msn.com'];
  var secondLevelDomains = ["yahoo", "hotmail", "mail", "live", "outlook", "gmx"];
  var topLevelDomains = ['co.uk', 'com', 'org', 'info', 'fr'];
  var prioritizedTopLevelDomains = ['com', 'net', 'de', 'fr', 'es', 'it', 'nl', 'be', 'at', 'sv', 'pl'];

  describe("Mailcheck", function(){
    var mailcheck;

    beforeEach(function(){
      // We may be running in a CommonJS environment.
      // If so, mailcheck won't be in a global Kicksend object.
      mailcheck = typeof Mailcheck !== 'undefined' ? Mailcheck : require('../');
    });

    describe("run", function () {
      var suggestedSpy, emptySpy;

      beforeEach(function () {
        suggestedSpy = jasmine.createSpy();
        emptySpy = jasmine.createSpy();
      });

      it("calls the 'suggested' callback with the element and result when there's a suggestion", function () {
        mailcheck.run({
          email: 'test@gmail.co',
          suggested:suggestedSpy,
          empty:emptySpy
        });

        expect(suggestedSpy).toHaveBeenCalledWith({
          address:'test',
          domain:'gmail.com',
          full:'test@gmail.com'
        });

        expect(emptySpy).not.toHaveBeenCalled();
      });

      it("calls the 'empty' callback with the element when there's no suggestion", function () {
        mailcheck.run({
          email: 'contact@kicksend.com',
          suggested: suggestedSpy,
          empty: emptySpy
        });

        expect(suggestedSpy).not.toHaveBeenCalled();

        expect(emptySpy).toHaveBeenCalled();
      });

      it("returns the result when 'suggested' callback is not defined", function () {
        var result = mailcheck.run({
          email: 'test@gmail.co'
        });

        expect(result).toEqual({
          address:'test',
          domain:'gmail.com',
          full:'test@gmail.com'
        })
      })

      it("takes in an array of specified domains", function () {
        mailcheck.run({
          email: 'test@emaildomain.con',
          suggested:suggestedSpy,
          empty:emptySpy,
          domains:domains
        });

        expect(suggestedSpy).toHaveBeenCalledWith({
          address:'test',
          domain:'emaildomain.com',
          full:'test@emaildomain.com'
        });
      });
    });

    describe("encodeEmail", function () {
      it("escapes the element's value", function () {
        var result = mailcheck.encodeEmail('<script>alert("a")</script>@emaildomain.con');
        expect(result).not.toMatch(/<script>/);
      });

      it("allows valid special characters", function() {
        var result = mailcheck.encodeEmail( " g1!#$%&'*+-/=?^_`{|}@gmai.com")
        expect(result).toEqual(" g1!#$%&'*+-/=?^_`{|}@gmai.com");
      });
    });

    describe("return value", function () {
      it("is a hash representing the email address", function () {
        var result = mailcheck.suggest('test@gmail.co', domains);

        expect(result).toEqual({
          address: 'test',
          domain: 'gmail.com',
          full: 'test@gmail.com'
        });
      });

      it("is false when no suggestion is found", function() {
        expect(mailcheck.suggest('contact@kicksend.com', domains)).toBeFalsy();
      });

      it("is false when an incomplete email is provided", function(){
        expect(mailcheck.suggest('contact', domains)).toBeFalsy();
      });
    });

    describe("cases", function () {
      it("pass", function () {
        expect(mailcheck.suggest('test@gmailc.om', domains).domain).toEqual('gmail.com');
        expect(mailcheck.suggest('test@emaildomain.co', domains).domain).toEqual('emaildomain.com');
        expect(mailcheck.suggest('test@gmail.con', domains).domain).toEqual('gmail.com');
        expect(mailcheck.suggest('test@gnail.con', domains).domain).toEqual('gmail.com');
        expect(mailcheck.suggest('test@GNAIL.con', domains).domain).toEqual('gmail.com');
        expect(mailcheck.suggest('test@#gmail.com', domains).domain).toEqual('gmail.com');
        expect(mailcheck.suggest('test@comcast.nry', domains).domain).toEqual('comcast.net');

        expect(mailcheck.suggest('test@homail.con', domains, secondLevelDomains, topLevelDomains).domain).toEqual('hotmail.com');
        expect(mailcheck.suggest('test@hotmail.co', domains, secondLevelDomains, topLevelDomains).domain).toEqual('hotmail.com');
        expect(mailcheck.suggest('test@yajoo.com', domains, secondLevelDomains, topLevelDomains).domain).toEqual('yahoo.com');
        expect(mailcheck.suggest('test@randomsmallcompany.cmo', domains, secondLevelDomains, topLevelDomains).domain).toEqual('randomsmallcompany.com');

        // Ensure we do not touch the second level domain when suggesting new top level domain
        expect(mailcheck.suggest('test@con-artists.con', domains, secondLevelDomains, topLevelDomains).domain).toEqual('con-artists.com');

        expect(mailcheck.suggest('', domains)).toBeFalsy();
        expect(mailcheck.suggest('test@', domains)).toBeFalsy();
        expect(mailcheck.suggest('test', domains)).toBeFalsy();

        /* This test is for illustrative purposes as the splitEmail function should return a better
         * representation of the true top-level domain in the case of an email address with subdomains.
         * mailcheck will be unable to return a suggestion in the case of this email address.
         */
        expect(mailcheck.suggest('test@mail.randomsmallcompany.cmo', domains, secondLevelDomains, topLevelDomains).domain).toBeFalsy();
      });

      it("will not offer a suggestion that itself leads to another suggestion", function() {
        var suggestion = mailcheck.suggest('test@yahooo.cmo', domains, secondLevelDomains, topLevelDomains);
        expect(suggestion.domain).toEqual('yahoo.com');
      });

      it("will not offer suggestions for valid 2ld-tld combinations", function() {
        expect(
            mailcheck.suggest('test@yahoo.co.uk', domains, secondLevelDomains, topLevelDomains)
        ).toBeFalsy();
      });

      it("will not offer suggestions for valid 2ld-tld even if theres a close fully-specified domain", function() {
        expect(
            mailcheck.suggest('test@gmx.fr', domains, secondLevelDomains, topLevelDomains)
        ).toBeFalsy();
      });

      it("will not offer suggestions for unrecognised 2ld's without a tld", function() {
        expect(mailcheck.suggest('test@gm', domains, secondLevelDomains, prioritizedTopLevelDomains, topLevelDomains)).toBeFalsy();
        expect(mailcheck.suggest('test@gma', domains, secondLevelDomains, prioritizedTopLevelDomains, topLevelDomains)).toBeFalsy();
        expect(mailcheck.suggest('test@gmai', domains, secondLevelDomains, prioritizedTopLevelDomains, topLevelDomains)).toBeFalsy();
      });      
    });

    describe("mailcheck.splitEmail", function () {
      it("returns a hash of the address, the domain, and the top-level domain", function () {
        expect(mailcheck.splitEmail('test@example.com')).toEqual({
          address:'test',
          domain:'example.com',
          topLevelDomain:'com',
          secondLevelDomain: 'example'
        });

        expect(mailcheck.splitEmail('test@example.co.uk')).toEqual({
          address:'test',
          domain:'example.co.uk',
          topLevelDomain:'co.uk',
          secondLevelDomain: 'example'
        });

        /* This test is for illustrative purposes as the splitEmail function should return a better
         * representation of the true top-level domain in the case of an email address with subdomains.
         */
        expect(mailcheck.splitEmail('test@mail.randomsmallcompany.co.uk')).toEqual({
          address:'test',
          domain:'mail.randomsmallcompany.co.uk',
          topLevelDomain:'randomsmallcompany.co.uk',
          secondLevelDomain: 'mail'
        });
      });

      it("splits RFC compliant emails", function () {
        expect(mailcheck.splitEmail('"foo@bar"@example.com')).toEqual({
          address:'"foo@bar"',
          domain:'example.com',
          topLevelDomain:'com',
          secondLevelDomain: 'example'

        });
        expect(mailcheck.splitEmail('containsnumbers1234567890@example.com')).toEqual({
          address:'containsnumbers1234567890',
          domain:'example.com',
          topLevelDomain:'com',
          secondLevelDomain: 'example'
        });
        expect(mailcheck.splitEmail('contains+symbol@example.com')).toEqual({
          address:'contains+symbol',
          domain:'example.com',
          topLevelDomain:'com',
          secondLevelDomain: 'example'
        });
        expect(mailcheck.splitEmail('contains-symbol@example.com')).toEqual({
          address:'contains-symbol',
          domain:'example.com',
          topLevelDomain:'com',
          secondLevelDomain: 'example'
        });
        expect(mailcheck.splitEmail('contains.symbol@domain.contains.symbol')).toEqual({
          address:'contains.symbol',
          domain:'domain.contains.symbol',
          topLevelDomain:'contains.symbol',
          secondLevelDomain: 'domain'
        });
        expect(mailcheck.splitEmail('"contains.and\ symbols"@example.com')).toEqual({
          address:'"contains.and\ symbols"',
          domain:'example.com',
          topLevelDomain:'com',
          secondLevelDomain: 'example'
        });
        expect(mailcheck.splitEmail('"contains.and.@.symbols.com"@example.com')).toEqual({
          address:'"contains.and.@.symbols.com"',
          domain:'example.com',
          topLevelDomain:'com',
          secondLevelDomain: 'example'
        });
        expect(mailcheck.splitEmail('"()<>[]:;@,\\\"!#$%&\'*+-/=?^_`{}|\ \ \ \ \ ~\ \ \ \ \ \ \ ?\ \ \ \ \ \ \ \ \ \ \ \ ^_`{}|~.a"@allthesymbols.com')).toEqual({
          address:'"()<>[]:;@,\\\"!#$%&\'*+-/=?^_`{}|\ \ \ \ \ ~\ \ \ \ \ \ \ ?\ \ \ \ \ \ \ \ \ \ \ \ ^_`{}|~.a"',
          domain:'allthesymbols.com',
          topLevelDomain:'com',
          secondLevelDomain: 'allthesymbols'
        });
        expect(mailcheck.splitEmail('postbox@com')).toEqual({
          address:'postbox',
          domain:'com',
          topLevelDomain:'com',
          secondLevelDomain: ''
        });
      });

      it("returns false for email addresses that are not RFC compliant", function () {
        expect(mailcheck.splitEmail('example.com')).toBeFalsy();
        expect(mailcheck.splitEmail('abc.example.com')).toBeFalsy();
        expect(mailcheck.splitEmail('@example.com')).toBeFalsy();
        expect(mailcheck.splitEmail('test@')).toBeFalsy();
      });

      it("trims spaces from the start and end of the string", function () {
        expect(mailcheck.splitEmail(' postbox@com')).toEqual({
          address:'postbox',
          domain:'com',
          topLevelDomain:'com',
          secondLevelDomain: ''
        });
        expect(mailcheck.splitEmail('postbox@com ')).toEqual({
          address:'postbox',
          domain:'com',
          topLevelDomain:'com',
          secondLevelDomain: ''
        });
      });
    });

    describe("mailcheck.findClosestDomain", function () {
      it("returns the most similar domain", function () {
        expect(mailcheck.findClosestDomain('google.com', domains)).toEqual('google.com');
        expect(mailcheck.findClosestDomain('gmail.com', domains)).toEqual('gmail.com');
        expect(mailcheck.findClosestDomain('emaildoman.com', domains)).toEqual('emaildomain.com');
        expect(mailcheck.findClosestDomain('gmsn.com', domains)).toEqual('msn.com');
        expect(mailcheck.findClosestDomain('gmaik.com', domains)).toEqual('gmail.com');
      });

      it("returns the most similar second-level domain", function () {
        expect(mailcheck.findClosestDomain('hotmial', secondLevelDomains)).toEqual('hotmail');
        expect(mailcheck.findClosestDomain('tahoo', secondLevelDomains)).toEqual('yahoo');
        expect(mailcheck.findClosestDomain('livr', secondLevelDomains)).toEqual('live');
        expect(mailcheck.findClosestDomain('outllok', secondLevelDomains)).toEqual('outlook');
      });

      it("returns the most similar top-level domain", function () {
        expect(mailcheck.findClosestDomain('cmo', topLevelDomains)).toEqual('com');
        expect(mailcheck.findClosestDomain('ogr', topLevelDomains)).toEqual('org');
        expect(mailcheck.findClosestDomain('ifno', topLevelDomains)).toEqual('info');
        expect(mailcheck.findClosestDomain('com.uk', topLevelDomains)).toEqual('co.uk');
      });
      it("returns the most similar prioritized top-level domain", function () {
        expect(mailcheck.findClosestDomain('cmo', prioritizedTopLevelDomains)).toEqual('com');
        expect(mailcheck.findClosestDomain('net', prioritizedTopLevelDomains)).toEqual('net');
        expect(mailcheck.findClosestDomain('de', prioritizedTopLevelDomains)).toEqual('de');
        expect(mailcheck.findClosestDomain('es', prioritizedTopLevelDomains)).toEqual('es');
        expect(mailcheck.findClosestDomain('sv', prioritizedTopLevelDomains)).toEqual('sv');
      });
    });
  });

  // Browser-only code below:

  if (typeof window === 'undefined') {
      return;
  }

  describe("jquery.mailcheck", function () {
    var suggestedSpy, emptySpy;

    beforeEach(function() {
      $('body').append('<div id="playground"></div>');

      suggestedSpy = jasmine.createSpy();
      emptySpy = jasmine.createSpy();

      $('#playground').append('<input type="text" id="test-input"/>');
    });

    afterEach(function() {
      $('#playground').remove();
    });

    it("calls the 'suggested' callback with the element and result when there's a suggestion", function () {
      $("#test-input").val('test@gmail.co').mailcheck({
        suggested: suggestedSpy,
        empty: emptySpy
      });

      expect(suggestedSpy).toHaveBeenCalledWith($("#test-input"),{
        address: 'test',
        domain: 'gmail.com',
        full: 'test@gmail.com'
      });

      expect(emptySpy).not.toHaveBeenCalled();
    });

    it("calls the 'empty' callback with the element when there's no suggestion", function () {
      $("#test-input").val('contact@kicksend.com').mailcheck({
        suggested: suggestedSpy,
        empty: emptySpy
      });

      expect(suggestedSpy).not.toHaveBeenCalled();

      expect(emptySpy).toHaveBeenCalledWith($("#test-input"));
    });
  });
});
