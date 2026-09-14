const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
const root = path.join(__dirname, '..');
const pkg = require('../package.json');
const output = `/*! mailcheck v${pkg.version} @license MIT */\n` + esbuild.transformSync(
  fs.readFileSync(path.join(root, 'src/mailcheck.js'), 'utf8'),
  { minify: true, target: 'es5', legalComments: 'none' }
).code;
const destination = path.join(root, 'src/mailcheck.min.js');
if (process.argv.includes('--check')) {
  if (fs.readFileSync(destination, 'utf8') !== output) {
    console.error('Minified build is stale. Run npm run build.');
    process.exitCode = 1;
  } else {
    console.log('Minified build is current.');
  }
} else {
  fs.writeFileSync(destination, output);
  console.log('Built src/mailcheck.min.js');
}
