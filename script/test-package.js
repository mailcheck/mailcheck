const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createRequire } = require('node:module');

const root = path.join(__dirname, '..');
const npm = process.env.npm_execpath;
if (!npm) throw new Error('Run this check with npm run test:package.');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'mailcheck-consumer-'));
const consumer = path.join(temporary, 'consumer');
const packDirectory = path.join(temporary, 'pack');
const lockedPackages = require('../package-lock.json').packages;
const consumerDependencies = ['jquery', '@types/jquery', '@types/sizzle'].map(name =>
  lockedPackages['node_modules/' + name].resolved
);

function run(args, cwd, capture = false) {
  return execFileSync(process.execPath, args, {
    cwd,
    stdio: capture ? 'pipe' : 'inherit',
    encoding: 'utf8',
    env: { ...process.env, NODE_PATH: '' }
  });
}

try {
  fs.mkdirSync(consumer);
  fs.mkdirSync(packDirectory);
  fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({
    name: 'mailcheck-consumer-fixture', version: '1.0.0', private: true
  }));
  const packed = JSON.parse(run([
    npm, 'pack', '--ignore-scripts', '--json', '--pack-destination', packDirectory
  ], root, true));
  assert.equal(packed.length, 1);
  // This is a real offline install of the tarball, not a symlink or TS path alias.
  // Use the lockfile's exact tarball URLs, not registry version queries: npm ci
  // warms the tarball cache but need not fetch registry manifests on a clean CI run.
  run([
    npm, 'install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false',
    path.join(packDirectory, packed[0].filename),
    ...consumerDependencies
  ], consumer);
  const consumerRequire = createRequire(path.join(consumer, 'package.json'));
  const installedRoot = path.join(consumer, 'node_modules/mailcheck');
  assert.equal(fs.realpathSync(consumerRequire.resolve('mailcheck')), path.join(fs.realpathSync(installedRoot), 'src/mailcheck.js'));
  assert.deepEqual(consumerRequire('mailcheck/package.json').dependencies, {});
  for (const entry of ['mailcheck', 'mailcheck/src/mailcheck.js', 'mailcheck/src/mailcheck.min.js']) {
    const mailcheck = consumerRequire(entry);
    assert.equal(mailcheck.run({ email: 'Person@gmial.com' }).full, 'Person@gmail.com', entry);
    assert.equal(mailcheck.run({ email: 'person@proton.me' }), undefined, entry);
  }

  fs.cpSync(path.join(root, 'spec/package'), path.join(consumer, 'src'), { recursive: true });
  run([require.resolve('typescript/bin/tsc'), '-p', 'src/tsconfig.json'], consumer);
  run(['dist/commonjs.cjs'], consumer);
  run(['dist/esm.mjs'], consumer);
  console.log('Packed consumer: CommonJS, ESM, direct/minified imports, browser types, and real jQuery types passed.');
} finally {
  // Only remove the isolated directory created by this invocation.
  fs.rmSync(temporary, { recursive: true, force: true });
}
