mailcheck.js
=========

A jQuery plugin that suggests a right domain when your users misspell it in an email address.

What does it do?
----------------

When your user types in "user@hotnail.con", Mailcheck will suggest "user@hotmail.com".

At [Kicksend](http://kicksend.com), we use Mailcheck to help reduce typos in email addresses during sign ups.

![diagram](http://github.com/Kicksend/mailcheck/raw/master/doc/example.png?raw=true)

See it live in action [here](http://kicksend.com/join).

Installation
------------

- For instant use, download `src/jquery.mailcheck.min.js` into javascripts directory. Use `src/jquery.mailcheck.js` if you want to hack on it, or you are using your own minimizer.

- For hacking, fork the repo or git clone it.

Usage
-----
First, include jQuery and Mailcheck into the page.

    <script type="text/javascript" src="jquery.min.js"></script>
    <script type="text/javascript" src="jquery.mailcheck.min.js"></script>

Have a text field.

    <input id="email" name="email" type="text" />

Now, attach Mailcheck to the text field. Remember to declare an array of domains you want to check against.

    <script type="text/javascript">
      var domains = ['hotmail.com', 'gmail.com', 'aol.com'];

      $('input#email').mailcheck(domains, {
        suggested: function(element, suggestion) {
          // callback code
        },
        empty: function(element) {
          // callback code
        }
      })
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

Customization
-------------
The Mailcheck jQuery plugin wraps Kicksend.mailcheck. The prime candidates for customization are the methods
`Kicksend.mailcheck.findClosestDomain` and `Kicksend.mailcheck.stringDistance`.

Mailcheck currently uses the [sift3](http://siderite.blogspot.com/2007/04/super-fast-and-accurate-string-distance.html) string similarity algorithm by [Siderite](http://siderite.blogspot.com/).

Since Mailcheck is a client-side operation, keep in mind file size, memory usage, and performance.

Tests
-----

Mailcheck is tested with [Jasmine](http://pivotal.github.com/jasmine/). Load `spec/spec_runner.html` in your browser to run the tests.

Author
-------

Derrick Ko ([@derrickko](http://twitter.com/derrickko))

License
-------

Copyright (c) 2012 [Receivd, Inc.](http://kicksend.com)

Licensed under the MIT License.
