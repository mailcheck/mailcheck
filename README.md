mailcheck.js
=========

The jQuery plugin that suggests a right domain when your users misspell it in an email address. We use it at Kicksend to [reduce sign up confirmation email bounces by 50%](http://blog.kicksend.com/how-we-decreased-sign-up-confirmation-email-b).

What does it do?
----------------

When your user types in "user@hotnail.con", Mailcheck will suggest "user@hotmail.com".

At [Kicksend](http://kicksend.com), we use Mailcheck to help reduce typos in email addresses during sign ups.

![diagram](http://github.com/Kicksend/mailcheck/raw/master/doc/example.png?raw=true)

See it live in action [here](http://kicksend.com/join).

Installation
------------

- For instant use, download `src/jquery.mailcheck.min.js` into javascripts directory. Use `src/jquery.mailcheck.js` if you want to hack on it, or have your own minimizer.

- For hacking, fork the repo or git clone it.

Usage
-----
First, include jQuery and Mailcheck into the page.

    <script src="jquery.min.js"></script>
    <script src="jquery.mailcheck.min.js"></script>

Have a text field.

    <input id="email" name="email" type="text" />

Now, attach Mailcheck to the text field. Remember to declare an array of domains you want to check against.

    <script>
      var domains = ['hotmail.com', 'gmail.com', 'aol.com'];
      $('#email').on('blur', function() {
        $(this).mailcheck({
          domains: domains,   // optional
          suggested: function(element, suggestion) {
            // callback code
          },
          empty: function(element) {
            // callback code
          }
        });
      });
    </script>

Mailcheck takes in two callbacks, `suggested` and `empty`. We recommend you supply both.

`suggested` is called when there's a suggestion. Mailcheck passes in the target element and the suggestion. The suggestion is an object with the following members:

    {
      address: 'test',          // the address; part before the @ sign
      domain: 'hotmail.com',    // the suggested domain
      full: 'test@hotmail.com'  // the full suggested email
    }

`empty` is called when there's no suggestion. Mailcheck just passes in the target element.

You can use the callbacks to display the appropriate visual feedback to the user.

Domains
-------
The Mailcheck jQuery plugin defaults to a list of top email domains if the `domain` option isn't provided. We still recommend supplying your own domains based on the distribution of your users.

The included default domains are: yahoo.com, google.com, hotmail.com, gmail.com, me.com, aol.com, mac.com, live.com, comcast.net, googlemail.com, msn.com, hotmail.co.uk, yahoo.co.uk.

Customization
-------------
The Mailcheck jQuery plugin wraps Kicksend.mailcheck. The prime candidates for customization are the methods
`Kicksend.mailcheck.findClosestDomain` and `Kicksend.mailcheck.stringDistance`.

Mailcheck currently uses the [sift3](http://siderite.blogspot.com/2007/04/super-fast-and-accurate-string-distance.html) string similarity algorithm by [Siderite](http://siderite.blogspot.com/).

Since Mailcheck runs client side, keep in mind file size, memory usage, and performance.

Tests
-----

Mailcheck is tested with [Jasmine](http://pivotal.github.com/jasmine/). Load `spec/spec_runner.html` in your browser to run the tests.

Contributing
------------

Let's make Mailcheck awesome. We're on the lookout for contributors.

And do send in those pull requests! To get them accepted, please:

- Test your code. Add test cases to `spec/mailcheckSpec.js`, and run it across browsers (yes, including IE).

- Minify the plugin. [Google's Closure Compiler](http://closure-compiler.appspot.com/home) is a good one.

Upcoming features, bugs and feature requests are managed in Issues.

Who's using Mailcheck?
-----------------------

- [Kicksend](http://kicksend.com/)
- [Flotype](http://flotype.com/)
- [Prispy](http://prispy.com/)
- [SB Nation](http://sbnation.com/)
- [Show Space](http://show-space.com/)
- [The Verge](http://theverge.com/)

Do you use Mailcheck? [Tweet me](http://twitter.com/derrickko) your link.

Author
-------

Derrick Ko ([@derrickko](http://twitter.com/derrickko))

License
-------

Copyright (c) 2012 [Receivd, Inc.](http://kicksend.com)

Licensed under the MIT License.
