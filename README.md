mailcheck.js
=========

[![TravisCI Build Status](https://secure.travis-ci.org/Kicksend/mailcheck.png?branch=master)](https://travis-ci.org/Kicksend/mailcheck)

The Javascript library and jQuery plugin that suggests a right domain when your users misspell it in an email address.

What does it do?
----------------

When your user types in "user@hotnail.con", Mailcheck will suggest "user@hotmail.com".

Mailcheck will offer up suggestions for top level domains too, and suggest ".com" when a user types in "user@hotmail.cmo".

At [Kicksend](http://kicksend.com), we use Mailcheck to help reduce typos in email addresses during sign ups. It has [reduced our sign up confirmation email bounces by 50%](http://blog.kicksend.com/how-we-decreased-sign-up-confirmation-email-b).

![diagram](http://github.com/Kicksend/mailcheck/raw/master/doc/example.png?raw=true)

See it live in action [here](http://kicksend.com/join).

Installation
------------

For instant use, download the minified library [mailcheck.min.js](https://raw.github.com/Kicksend/mailcheck/master/src/mailcheck.min.js) into your javascripts directory. [mailcheck.js](https://raw.github.com/Kicksend/mailcheck/master/src/mailcheck.js) is also available unminimised if you want to hack on it, or have your own minimizer.

#### Bower ####

```
> bower install --save mailcheck
```

#### Node/Browserify ####

```
> npm install --save mailcheck
```

Usage with jQuery
-----

First, include jQuery and Mailcheck into the page.

```html
<script src="jquery.min.js"></script>
<script src="mailcheck.min.js"></script>
```

Have a text field.

```html
<input id="email" name="email" type="email" />
```

Now, attach Mailcheck to the text field. You can declare an array of domains and top level domains you want to check against.

```html
<script>
var domains = ['hotmail.com', 'gmail.com', 'aol.com'];
var topLevelDomains = ["com", "net", "org"];

var superStringDistance = function(string1, string2) {
  // a string distance algorithm of your choosing
}

$('#email').on('blur', function() {
  $(this).mailcheck({
    domains: domains,                       // optional
    topLevelDomains: topLevelDomains,       // optional
    distanceFunction: superStringDistance,  // optional
    suggested: function(element, suggestion) {
      // callback code
    },
    empty: function(element) {
      // callback code
    }
  });
});
</script>
```

Mailcheck takes in two callbacks, `suggested` and `empty`. We recommend you supply both.

`suggested` is called when there's a suggestion. Mailcheck passes in the target element and the suggestion. The suggestion is an object with the following members:

```js
{
  address: 'test',          // the address; part before the @ sign
  domain: 'hotmail.com',    // the suggested domain
  topLevelDomain: 'com',    // the suggested top level domain
  full: 'test@hotmail.com'  // the full suggested email
}
```
Mailcheck does not want to get in the way of how you can show suggestions. Use the suggestion object to display suggestions in your preferred manner.

`empty` is called when there's no suggestion. Mailcheck just passes in the target element. It is a good idea to use this callback to clear an existing suggestion.

Usage without jQuery
--------------------

Mailcheck is decoupled from jQuery, so its usage without jQuery is almost identical.

Using the example from above, you would call `Kicksend.mailcheck.run` instead.

```html
<script>
Kicksend.mailcheck.run({
  email: yourTextInput.value,
  domains: domains,                       // optional
  topLevelDomains: topLevelDomains,       // optional
  distanceFunction: superStringDistance,  // optional
  suggested: function(suggestion) {
    // callback code
  },
  empty: function() {
    // callback code
  }
});
</script>
```

The rest works similarly. In fact, the Mailcheck jQuery plugin just wraps `Kicksend.mailcheck.run`.

Usage on Node.js
----------------

If you're running this on Node.js, you can just `require('mailcheck')` to get the `mailcheck` object, and call `run` on that:

```js
var mailcheck = require('mailcheck');

mailcheck.run({
  // see 'usage without jQuery' above.
});
```

Domains
-------

Mailcheck has inbuilt defaults if the `domains` or `topLevelDomains` options aren't provided. We still recommend supplying your own domains based on the distribution of your users.

#### Default Domains ####

* yahoo.com
* google.com
* hotmail.com
* gmail.com
* me.com
* aol.com
* mac.com
* live.com
* comcast.net
* googlemail.com
* msn.com
* hotmail.co.uk
* yahoo.co.uk
* facebook.com
* verizon.net
* sbcglobal.net
* att.net
* gmx.com
* mail.com
* outlook.com
* icloud.com

#### Default Top-Level Domains ####

* .co.jp
* .co.uk
* .com
* .net
* .org
* .info
* .edu
* .gov
* .mil
* .ca

#### Adding your own Domains ####

You can replace Mailcheck's default domain/TLD suggestions by supplying replacements to `mailcheck.run`:

```js
Kicksend.mailcheck.run({
  domains: ['customdomain.com', 'anotherdomain.net'], // replaces existing domains
  topLevelDomains: ['com.au', 'ru'] // replaces existing TLDs
});
```

Alternatively, you can *extend* Mailcheck's global set of default domains & TLDs by adding items to `Kicksend.mailcheck.defaultDomains` and `Kicksend.mailcheck.defaultTopLevelDomains`:

```js
Kicksend.mailcheck.defaultDomains.push('customdomain.com', 'anotherdomain.net') // extend existing domains
Kicksend.mailcheck.defaultTopLevelDomains.push('com.au', 'ru') // extend existing TLDs
```

Customization
-------------

The Mailcheck jQuery plugin wraps Kicksend.mailcheck. The prime candidates for customization are the methods
`Kicksend.mailcheck.findClosestDomain` and `Kicksend.mailcheck.stringDistance`.

Mailcheck currently uses the [sift3](http://siderite.blogspot.com/2007/04/super-fast-and-accurate-string-distance.html) string similarity algorithm by [Siderite](http://siderite.blogspot.com/). You can modify the inbuilt string distance function, or pass in your own when calling Mailcheck.

Since Mailcheck runs client side, keep in mind file size, memory usage and performance.

Tests
-----

Mailcheck is tested with [Jasmine](http://pivotal.github.com/jasmine/). Load `spec/spec_runner.html` in your browser to run the tests or run `npm test` from the commandline to test in node.

Contributing
------------

Let's make Mailcheck awesome. We're on the lookout for maintainers and [contributors](https://github.com/Kicksend/mailcheck/contributors).

And do send in those pull requests! To get them accepted, please:

- Test your code. Add test cases to `spec/mailcheckSpec.js`, and run it across browsers (yes, including IE).
- Minify the plugin by running `grunt` in the Mailcheck directory.

Upcoming features, bugs and feature requests are managed in [Issues](https://github.com/Kicksend/mailcheck/issues).

Who's using Mailcheck?
-----------------------

- [Kicksend](http://kicksend.com/)
- [Dropbox](http://dropbox.com/)
- [Flotype](http://flotype.com/)
- [Kickstarter](http://kickstarter.com/)
- [Kippt](http://kippt.com/)
- [Minecraft](http://minecraft.net/)
- [Prispy](http://prispy.com/)
- [SB Nation](http://sbnation.com/)
- [Show Space](http://show-space.com/)
- [The Verge](http://theverge.com/)
- [Uber](http://uber.com/)
- [Khan Academy](http://khanacademy.org/)
- [Paperless Post](http://www.paperlesspost.com/)

Do you use Mailcheck? [Tweet me](http://twitter.com/derrickko) your link.

Related Links
-------------

- [Two ways to reduce bounced welcome emails](http://blog.postmarkapp.com/post/19685472721/two-ways-to-reduce-bounced-welcome-emails) by [Postmark](http://postmark.com)
- [MooTools port](https://github.com/DimitarChristoff/mailcheck) by [Dimitar Christoff](https://github.com/DimitarChristoff)
- [WordPress Plugin](https://github.com/bmoredrew/mailcheck-wordpress-plugin/) by [Drew Poland](https://github.com/bmoredrew)
- [WordPress e-Commerce Plugin](http://wordpress.org/extend/plugins/e-commerce-mailcheck/)
- [Mailcheck for Drupal](http://drupal.org/project/Mailcheck) by [Martin Elvar](https://twitter.com/MartinElvar)

Core Team
-------

- Derrick Ko, [Kicksend](http://kicksend.com), [@derrickko](http://twitter.com/derrickko). Created Mailcheck.
- Wei Lu, [neo](http://neo.com), [@luweidewei](http://twitter.com/luweidewei).

License
-------

Copyright (c) 2012 [Receivd, Inc.](http://kicksend.com)

Licensed under the MIT License.
