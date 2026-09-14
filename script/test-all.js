const { spawnSync } = require('node:child_process');
const path = require('node:path');
const root = path.join(__dirname, '..');
const sources = process.argv.includes('--min') ? ['mailcheck.min.js'] : ['mailcheck.js', 'mailcheck.min.js'];
for (const source of sources) {
  console.log('\nTesting src/' + source);
  for (const args of [['script/test.js'], ['--test', 'spec/correctness.test.js']]) {
    const result = spawnSync(process.execPath, args, {
      cwd: root,
      env: { ...process.env, MAILCHECK_SOURCE: path.join(root, 'src', source) },
      stdio: 'inherit'
    });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status || 1);
  }
}
