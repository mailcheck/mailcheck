const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { test } = require('node:test');
const { parseArgs, cutRelease, PACKAGE_FILES } = require('../script/cut-release');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mailcheck-package-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const sourceRoot = path.join(__dirname, '..');
  const version = require('../package.json').version;
  fs.mkdirSync(path.join(root, 'src'));
  for (const file of ['src/mailcheck.js', 'src/mailcheck.d.ts', 'src/mailcheck.min.d.ts', 'index.d.ts', 'jquery.d.ts']) {
    fs.copyFileSync(path.join(sourceRoot, file), path.join(root, file));
  }
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({
    name: 'mailcheck', version, main: 'src/mailcheck.js', types: 'index.d.ts',
    scripts: { prepack: 'node -e "throw new Error(\'lifecycle scripts must not run\')"' }
  }));
  fs.writeFileSync(path.join(root, 'mailcheck.jquery.json'), JSON.stringify({ name: 'mailcheck', version }));
  fs.writeFileSync(path.join(root, 'bower.json'), JSON.stringify({ name: 'mailcheck', main: 'src/mailcheck.js' }));
  fs.writeFileSync(path.join(root, 'README.md'), 'Synthetic packaging fixture.\n');
  fs.writeFileSync(path.join(root, 'LICENSE'), 'Synthetic license fixture.\n');
  fs.writeFileSync(path.join(root, 'src/mailcheck.min.js'), 'original checkout build');
  fs.writeFileSync(path.join(root, 'package-lock.json'), JSON.stringify({ version }));
  fs.mkdirSync(path.join(root, 'spec'));
  fs.writeFileSync(path.join(root, 'spec/unshipped.js'), 'test-only file');
  const originals = new Map([...PACKAGE_FILES, 'src/mailcheck.min.js', 'package-lock.json'].map(file =>
    [file, fs.readFileSync(path.join(root, file), 'utf8')]
  ));
  return { root, originals, log: () => {} };
}

function unchanged(f) {
  for (const [file, content] of f.originals) assert.equal(fs.readFileSync(path.join(f.root, file), 'utf8'), content, file);
}

test('accepts exact prerelease and regular versions, rejects publishing and Git flags', () => {
  assert.deepEqual(parseArgs(['2.0.0-beta.1']), { version: '2.0.0-beta.1', dryRun: false });
  assert.deepEqual(parseArgs(['2.0.0', '--dry-run']), { version: '2.0.0', dryRun: true });
  for (const args of [[], ['v2.0.0'], ['2.0'], ['2.00.0'], ['2.0.0-beta.01'], ['2.0.0+build'],
    ['2.0.0;echo bad'], ['2.0.0', '--execute'], ['2.0.0', '--publish'], ['2.0.0', '--remote', 'upstream']]) {
    assert.throws(() => parseArgs(args));
  }
});

test('dry-run works without Git, npm authentication, or creating output', t => {
  const f = fixture(t);
  const destination = cutRelease(['2.0.0-beta.1', '--dry-run'], f);
  assert.equal(destination, path.join(f.root, 'Releases/mailcheck-2.0.0-beta.1.tgz'));
  assert.equal(fs.existsSync(path.join(f.root, 'Releases')), false);
  unchanged(f);
});

for (const releaseVersion of ['2.0.0-beta.1', '2.0.0']) {
  test('creates a real offline npm archive for ' + releaseVersion + ' without changing source versions', t => {
    const f = fixture(t);
    const destination = cutRelease([releaseVersion], f);
    assert.equal(destination, path.join(f.root, 'Releases', 'mailcheck-' + releaseVersion + '.tgz'));
    assert.ok(fs.statSync(destination).size > 0);
    unchanged(f);
    const contents = execFileSync('tar', ['-tzf', destination], { encoding: 'utf8' }).trim().split('\n').sort();
    assert.deepEqual(contents, [...PACKAGE_FILES, 'src/mailcheck.min.js'].map(file => 'package/' + file).sort());
    const extracted = path.join(f.root, 'extracted');
    fs.mkdirSync(extracted);
    execFileSync('tar', ['-xzf', destination, '-C', extracted]);
    const packageRoot = path.join(extracted, 'package');
    assert.equal(JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'))).version, releaseVersion);
    assert.equal(JSON.parse(fs.readFileSync(path.join(packageRoot, 'mailcheck.jquery.json'))).version, releaseVersion);
    assert.ok(fs.readFileSync(path.join(packageRoot, 'src/mailcheck.js'), 'utf8').includes(' * v ' + releaseVersion + '\n'));
    assert.ok(fs.readFileSync(path.join(packageRoot, 'src/mailcheck.min.js'), 'utf8').startsWith('/*! mailcheck v' + releaseVersion + ' '));
    for (const file of ['src/mailcheck.js', 'src/mailcheck.min.js']) {
      assert.equal(require(path.join(packageRoot, file)).run({ email: 'sample@gmail' }).full, 'sample@gmail.com');
    }
  });
}

test('never overwrites an existing release archive', t => {
  const f = fixture(t);
  fs.mkdirSync(path.join(f.root, 'Releases'));
  const destination = path.join(f.root, 'Releases/mailcheck-2.0.0.tgz');
  fs.writeFileSync(destination, 'existing archive');
  assert.throws(() => cutRelease(['2.0.0'], f), /refusing to overwrite/);
  assert.equal(fs.readFileSync(destination, 'utf8'), 'existing archive');
  unchanged(f);
});

test('inconsistent version metadata produces no archive and preserves the checkout', t => {
  const f = fixture(t);
  const file = path.join(f.root, 'mailcheck.jquery.json');
  fs.writeFileSync(file, JSON.stringify({ name: 'mailcheck', version: '0.0.0' }));
  assert.throws(() => cutRelease(['2.0.0'], f), /metadata must agree/);
  assert.equal(fs.existsSync(path.join(f.root, 'Releases')), false);
  assert.equal(JSON.parse(fs.readFileSync(file)).version, '0.0.0');
  assert.equal(fs.readFileSync(path.join(f.root, 'package.json'), 'utf8'), f.originals.get('package.json'));
});

test('the shell entry point supports help and preview from another directory', () => {
  const script = path.join(__dirname, '../cut_release.sh');
  const help = execFileSync('bash', [script, '--help'], { cwd: os.tmpdir(), encoding: 'utf8' });
  assert.match(help, /No publishing, login, commits, tags, pushes/);
  const preview = execFileSync('bash', [script, '2.0.0-beta.1', '--dry-run'], { cwd: os.tmpdir(), encoding: 'utf8' });
  assert.match(preview, /Releases\/mailcheck-2\.0\.0-beta\.1\.tgz/);
  assert.match(preview, /Nothing changed/);
});
