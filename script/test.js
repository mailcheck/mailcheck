// Run the existing browser-compatible specs with the vendored Jasmine release.
// No dependency installation or browser is needed for the core suite.
var jasmine = require('../spec/lib/jasmine-1.2.0/jasmine');
Object.keys(jasmine).forEach(function(key) { global[key] = jasmine[key]; });
if (process.env.MAILCHECK_SOURCE) {
  global.Mailcheck = require(require('path').resolve(process.env.MAILCHECK_SOURCE));
}
require('../spec/mailcheckSpec');
jasmine.jasmine.getEnv().addReporter({
  reportSpecResults: function(spec) {
    if (!spec.results().passed()) {
      console.error(spec.getFullName());
      spec.results().getItems().forEach(function(item) {
        if (!item.passed()) console.error(item.message);
      });
    }
  },
  reportRunnerResults: function(runner) {
    var results = runner.results();
    console.log('Legacy Jasmine: ' + results.passedCount + '/' + results.totalCount + ' assertions passed');
    process.exitCode = results.passed() ? 0 : 1;
  }
});
jasmine.jasmine.getEnv().execute();
