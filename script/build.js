const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

function build(root, check = false) {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const output = `/*! mailcheck v${pkg.version} @license MIT */\n` + esbuild.transformSync(
    fs.readFileSync(path.join(root, 'src/mailcheck.js'), 'utf8'),
    { minify: true, target: 'es5', legalComments: 'none' }
  ).code;
  const destination = path.join(root, 'src/mailcheck.min.js');
  if (check) return fs.readFileSync(destination, 'utf8') === output;
  fs.writeFileSync(destination, output);
  return true;
}

if (require.main === module) {
  const check = process.argv.includes('--check');
  if (!build(path.join(__dirname, '..'), check)) {
    console.error('Minified build is stale. Run npm run build.');
    process.exitCode = 1;
  } else {
    console.log(check ? 'Minified build is current.' : 'Built src/mailcheck.min.js');
  }
}

module.exports = build;
