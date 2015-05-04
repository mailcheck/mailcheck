mailcheck.js
=========

[![TravisCI Build Status](https://secure.travis-ci.org/mailcheck/mailcheck.png?branch=master)](https://travis-ci.org/mailcheck/mailcheck)

The Javascript library and jQuery plugin that suggests a right domain when your users misspell it in an email address.

What does it do?
----------------

When your user types in "user@gmil.con", Mailcheck will suggest "user@gmail.com".

Mailcheck will offer up suggestions for second and top level domains too. For example when a user types in "user@hotmail.cmo" then "hotmail.com" will be suggested. Similarly if only the second level domain is miss-spelled then it will be corrected independently of the top level domain allowing for fine resolution tweaking if desired.

At [Kicksend](http://kicksend.com), we use Mailcheck to help reduce typos in email addresses during sign ups. It has [reduced our sign up confirmation email bounces by 50%](http://blog.kicksend.com/how-we-decreased-sign-up-confirmation-email-b).

![diagram](https://raw.githubusercontent.com/mailcheck/mailcheck/master/doc/example.png)

See it live in action [here](http://kicksend.com/join).

Installation
------------

For instant use, download the minified library [mailcheck.min.js](https://raw.githubusercontent.com/mailcheck/mailcheck/d25dc9a119ca844bb35b1baf341cca0a634e4ac9/src/mailcheck.min.js) into your javascripts directory. [mailcheck.js](https://raw.githubusercontent.com/mailcheck/mailcheck/d25dc9a119ca844bb35b1baf341cca0a634e4ac9/src/mailcheck.js) is also available unminimised if you want to hack on it, or have your own minimizer.

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

Now, attach Mailcheck to the text field. You can declare an array of domains, second level domains and top level domains you want to check against.

```html
<script>
var domains = ['gmail.com', 'aol.com'];
var secondLevelDomains = ['hotmail']
var topLevelDomains = ["com", "net", "org"];

var superStringDistance = function(string1, string2) {
  // a string distance algorithm of your choosing
}

$('#email').on('blur', function() {
  $(this).mailcheck({
    domains: domains,                       // optional
    secondLevelDomains: secondLevelDomains, // optional
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
  domain: 'gmail.com',    // the suggested domain
  full: 'test@gmail.com'  // the full suggested email
}
```
Mailcheck does not want to get in the way of how you can show suggestions. Use the suggestion object to display suggestions in your preferred manner.

`empty` is called when there's no suggestion. Mailcheck just passes in the target element. It is a good idea to use this callback to clear an existing suggestion.

Usage without jQuery
--------------------

Mailcheck is decoupled from jQuery, so its usage without jQuery is almost identical.

Using the example from above, you would call `Mailcheck.run` instead.

```html
<script>
Mailcheck.run({
  email: yourTextInput.value,
  domains: domains,                       // optional
  topLevelDomains: topLevelDomains,       // optional
  secondLevelDomains: secondLevelDomains, // optional
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

The rest works similarly. In fact, the Mailcheck jQuery plugin just wraps `Mailcheck.run`.

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

Mailcheck has inbuilt defaults if the `domains`, `secondLevelDomains` or `topLevelDomains` options aren't provided. We still recommend supplying your own domains based on the distribution of your users.

#### Adding your own Domains ####

You can replace Mailcheck's default domain/TLD suggestions by supplying replacements to `mailcheck.run`:

```js
Mailcheck.run({
  domains: ['customdomain.com', 'anotherdomain.net'], // replaces existing domains
  secondLevelDomains: ['domain', 'yetanotherdomain'], // replaces existing SLDs
  topLevelDomains: ['com.au', 'ru'] // replaces existing TLDs
});
```

Alternatively, you can *extend* Mailcheck's global set of default domains & TLDs by adding items to `Mailcheck.defaultDomains` and `Mailcheck.defaultTopLevelDomains`:

```js
Mailcheck.defaultDomains.push('customdomain.com', 'anotherdomain.net') // extend existing domains
Mailcheck.defaultSecondLevelDomains.push('domain', 'yetanotherdomain') // extend existing SLDs
Mailcheck.defaultTopLevelDomains.push('com.au', 'ru') // extend existing TLDs
```

Customization
-------------

The Mailcheck jQuery plugin wraps Mailcheck. The prime candidates for customization are the methods
`Mailcheck.findClosestDomain` and `Mailcheck.stringDistance`.

Mailcheck currently uses the [sift3](http://siderite.blogspot.com/2007/04/super-fast-and-accurate-string-distance.html) string similarity algorithm by [Siderite](http://siderite.blogspot.com/). You can modify the inbuilt string distance function, or pass in your own when calling Mailcheck.

Since Mailcheck runs client side, keep in mind file size, memory usage and performance.

Tests
-----

Mailcheck is tested with [Jasmine](https://jasmine.github.io/). Load `spec/spec_runner.html` in your browser to run the tests or run `npm test` from the command line to test in node.

Contributing
------------

Let's make Mailcheck awesome. We're on the lookout for maintainers and [contributors](https://github.com/mailcheck/mailcheck/contributors).

And do send in those pull requests! To get them accepted, please:

- Test your code. Add test cases to `spec/mailcheckSpec.js`, and run it across browsers (yes, including IE).
- Minify the plugin by running `grunt` in the Mailcheck directory.

Upcoming features, bugs and feature requests are managed in [Issues](https://github.com/mailcheck/mailcheck/issues).

Developing on Nitrous.IO
---------------------

Start contributing to Mailcheck instantly on [Nitrous.IO](https://www.nitrous.io/?utm_source=github.com&utm_campaign=kicksend-mailcheck&utm_medium=hackonnitrous):

[![Hack mailcheck/mailcheck on Nitrous.IO](https://d3o0mnbgv6k92a.cloudfront.net/assets/hack-l-v1-d464cf470a5da050619f6f247a1017ec.png)](https://www.nitrous.io/hack_button?source=embed&runtime=nodejs&repo=kicksend%2Fmailcheck&file_to_open=README.nitrous.md)


Who have used Mailcheck?
-----------------------

- [Kicksend](http://kicksend.com/)
- [Dropbox](http://dropbox.com/)
- [Kickstarter](http://kickstarter.com/)
- [Uber](http://uber.com/)
- [Khan Academy](http://khanacademy.org/)
- [Minecraft](http://minecraft.net/)
- [Paperless Post](http://www.paperlesspost.com/)
- [The Verge](http://theverge.com/)
- [SB Nation](http://sbnation.com/)
- [Kippt](http://kippt.com/)
- [Shopify](http://shopify.com/)

Do you use Mailcheck? [Tweet me](http://twitter.com/derrickko) your link.

Related Links
-------------

- [Official Mailcheck Ports](https://github.com/mailcheck/)
- [Two ways to reduce bounced welcome emails](http://blog.postmarkapp.com/post/19685472721/two-ways-to-reduce-bounced-welcome-emails) by [Postmark](http://postmark.com)
- [MooTools port](https://github.com/DimitarChristoff/mailcheck) by [Dimitar Christoff](https://github.com/DimitarChristoff)
- [WordPress Plugin](https://github.com/bmoredrew/mailcheck-wordpress-plugin/) by [Drew Poland](https://github.com/bmoredrew)
- [WordPress e-Commerce Plugin](http://wordpress.org/extend/plugins/e-commerce-mailcheck/)
- [Mailcheck for Drupal](http://drupal.org/project/Mailcheck) by [Martin Elvar](https://twitter.com/MartinElvar)

Core Team
-------

- Derrick Ko, [Kicksend](http://kicksend.com), [@derrickko](http://twitter.com/derrickko). Created Mailcheck.
- Wei Lu, [Hive](https://www.hivewallet.com/), [@luweidewei](http://twitter.com/luweidewei).

License
-------

Released under the MIT License.
