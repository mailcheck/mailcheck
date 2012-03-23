/*
 * Mailcheck https://github.com/Kicksend/mailcheck
 * Author
 * Derrick Ko (@derrickko)
 *
 * License
 * Copyright (c) 2012 Receivd, Inc.
 *
 * Licensed under the MIT License.
 *
 * v 1.0
 */

(function($){
    $.fn.mailcheck = function(opts, optsAlt) {
	var defaultDomains = ["yahoo.com", "google.com", "hotmail.com", "gmail.com", "me.com", "aol.com", "mac.com", "live.com", "comcast.net", "googlemail.com", "msn.com", "hotmail.co.uk", "yahoo.co.uk"];
	
	if (typeof opts === 'object' && optsAlt === undefined) {
	    // only opts is passed in
	    opts.domains = opts.domains || defaultDomains;
	} else {
	    // domains are passed in as opts
	    var domains = opts;
	    opts = optsAlt;
	    opts.domains = domains || defaultDomains;
	}
	
	var result = Kicksend.mailcheck.suggest(encodeURI(this.val()), opts.domains);
	if (result) {
	    if (opts.suggested) {
		opts.suggested(this, result);
	    }
	} else {
	    if (opts.empty) {
		opts.empty(this);
	    }
	}
    };
})(jQuery);

var Kicksend = {
    mailcheck : {
	threshold: 0,
	
	suggest: function(email, domains) {
	    email = email.toLowerCase();
	    
	    var emailParts = this.splitEmail(email);
	    
	    var closestDomain = this.findClosestDomain(emailParts.domain, domains);
	    
	    if (closestDomain) {
		return { address: emailParts.address, domain: closestDomain, full: emailParts.address + "@" + closestDomain }
	    } else {
		return false;
	    }
	},
	
	findClosestDomain: function(domain, domains) {
	    var cosine;
	    var maxCosine = 0;
	    var closestDomain = null;
	    
	    for (var i = 0; i < domains.length; i++) {
		console.log(domain + "  " + domains[i]);
		
              cosine = this.stringCosineDistance(domain, domains[i]);
		
		console.log(cosine);
		
		if (cosine > maxCosine) {
		    maxCosine = cosine;
		    closestDomain = domains[i];
		}
	    }
	    
	    if (maxCosine >= this.threshold && closestDomain !== null && closestDomain !== domain) {
		return closestDomain;
	    } else {
		return false;
	    }
	},
	
	// transforms a given string s in a vector of characters frequency
	toVector: function(s) {
	    var vector = {};
	    var chars = s.split("");
	    for (var i in chars) {
		if (vector[chars[i]] === undefined) {
		    vector[chars[i]] = 1;
		} else {
		    vector[chars[i]] += 1;
		}
	    }
	    return vector;
	},
	
	// based on the Fast Inverse Square Root method
	// http://coffeescriptcookbook.com/chapters/math/fast-inv-square
	sqrt: function(n) {
	    var y = new Float32Array(1);
	    var i = new Int32Array(y.buffer);
	    
	    y[0] = n;
	    i[0] = 0x5f375a86 - (i[0] >> 1);
	    
	    for (var i = 1; i <= 5; i++) {
		y[0] = y[0] * (1.5 - ((n * 0.5) * y[0] * y[0]));
	    }
	    
	    return n * y[0];
	},
	
	// calculates the cosine of two vectors in the space defined by the ASCII characters
	cosine: function(v1, v2) {
	    var power1 = 0, power2 = 0, sum = 0;
	    for (var i in v1) {
		if (v2[i] != undefined) {
		    sum += v1[i] * v2[i];
		}
		power1 += v1[i] * v1[i];
	    }
	    
	    for (var i in v2) {
		power2 += v2[i] * v2[i];
	    }
	    
	    return sum / this.sqrt(power1 * power2);
	},
	
	// cosine distance implementation
	stringCosineDistance: function(s1, s2) {
	    if (s1 == null || s1.length === 0 || s2 == null || s2.length === 0) {
		return 0;
	    }
	    
	    vector1 = this.toVector(s1);
	    vector2 = this.toVector(s2);
	    
	    return this.cosine(vector1, vector2);
	},
	
	splitEmail: function(email) {
	    var parts = email.split('@');
	    
	    if (parts.length < 2) {
		return false;
	    }
	    
	    return {
		domain: parts.pop(),
		address: parts.join('@')
	    }
      }
    }
};