describe("mailcheck", function() {
  var domains = ['yahoo.com', 'yahoo.com.tw', 'google.com','hotmail.com', 'gmail.com', 'me.com', 'aol.com', 'mac.com'];

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
      $("#test-input").val('test@hotmail.co').mailcheck(domains, {
        suggested: suggestedSpy,
        empty: emptySpy
      });

      expect(suggestedSpy).toHaveBeenCalledWith($("#test-input"),{
        address: 'test',
        domain: 'hotmail.com',
        full: 'test@hotmail.com'
      });

      expect(emptySpy).not.toHaveBeenCalled();
    });

    it("calls the 'empty' callback with the element when there's no suggestion", function () {
      $("#test-input").val('contact@kicksend.com').mailcheck(domains, {
        suggested: suggestedSpy,
        empty: emptySpy
      });

      expect(suggestedSpy).not.toHaveBeenCalled();

      expect(emptySpy).toHaveBeenCalledWith($("#test-input"));
    });
  });

  describe("Kicksend.mailcheck", function(){
    var mailcheck;

    beforeEach(function(){
       mailcheck = Kicksend.mailcheck;
    });

    describe("return value", function () {
      it("is a hash representing the email address", function () {
        var result = mailcheck.suggest('test@hotmail.co', domains);

        expect(result).toEqual({
          address: 'test',
          domain: 'hotmail.com',
          full: 'test@hotmail.com'
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
      it("passes", function () {
        expect(mailcheck.suggest('test@hotmail.co', domains).domain).toEqual('hotmail.com');
        expect(mailcheck.suggest('test@gmail.con', domains).domain).toEqual('gmail.com');
        expect(mailcheck.suggest('test@gnail.con', domains).domain).toEqual('gmail.com');
        expect(mailcheck.suggest('test@yahoo.com.tw', domains)).toEqual(false);
        expect(mailcheck.suggest('')).toEqual(false);
      });
    });
  });
});
