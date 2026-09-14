const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const PACKAGE_FILES = [
  'package.json', 'README.md', 'LICENSE', 'bower.json', 'mailcheck.jquery.json',
  'index.d.ts', 'jquery.d.ts', 'src/mailcheck.js',
  'src/mailcheck.d.ts', 'src/mailcheck.min.d.ts'
];
const HELP = `Usage: ./cut_release.sh VERSION [--dry-run]

Examples:
  ./cut_release.sh 2.0.0-beta.1
  ./cut_release.sh 2.0.0

Builds Releases/mailcheck-VERSION.tgz from the current checkout, including local
changes. Version metadata and the minified build are updated in a temporary copy.
Only runtime files, declarations, manifests, README, and license are packaged.

No publishing, login, commits, tags, pushes, or source-version changes.
Requires the development dependencies already installed. Never overwrites an
existing archive. --dry-run prints the output path without building anything.
`;

function parseArgs(args) {
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) return { help: true };
  let version;
  let dryRun = false;
  for (const arg of args) {
    if (arg === '--dry-run' && !dryRun) dryRun = true;
    else if (arg.startsWith('-') || version) throw new Error('Unexpected argument. Run ./cut_release.sh --help.');
    else version = arg;
  }
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(version || '');
  if (!match || match.slice(1, 4).some(n => !Number.isSafeInteger(Number(n))) ||
      (match[4] || '').split('.').some(id => /^0\d+$/.test(id))) {
    throw new Error('Use an exact MAJOR.MINOR.PATCH[-PRERELEASE] version, without a v prefix or build metadata.');
  }
  return { version, dryRun };
}

function cutRelease(args, { root = path.join(__dirname, '..'), log = console.log } = {}) {
  const options = parseArgs(args);
  if (options.help) { log(HELP); return; }
  const destination = path.join(root, 'Releases', 'mailcheck-' + options.version + '.tgz');
  if (options.dryRun) { log('Would create ' + destination + '. Nothing changed.'); return destination; }
  if (fs.existsSync(destination)) throw new Error('Archive already exists; refusing to overwrite ' + destination);
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'mailcheck-package-'));
  try {
    const staging = path.join(temporary, 'package');
    for (const file of PACKAGE_FILES) {
      fs.mkdirSync(path.dirname(path.join(staging, file)), { recursive: true });
      fs.copyFileSync(path.join(root, file), path.join(staging, file));
    }
    const pkgPath = path.join(staging, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const jqueryPath = path.join(staging, 'mailcheck.jquery.json');
    const jquery = JSON.parse(fs.readFileSync(jqueryPath, 'utf8'));
    const sourcePath = path.join(staging, 'src/mailcheck.js');
    const source = fs.readFileSync(sourcePath, 'utf8');
    const banners = source.match(/^ \* v [^\r\n]+/gm) || [];
    if (pkg.name !== 'mailcheck' || jquery.version !== pkg.version ||
        banners.length !== 1 || banners[0] !== ' * v ' + pkg.version) {
      throw new Error('Package, jQuery manifest, and source version metadata must agree before packaging.');
    }
    pkg.version = jquery.version = options.version;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    fs.writeFileSync(jqueryPath, JSON.stringify(jquery, null, 2) + '\n');
    fs.writeFileSync(sourcePath, source.replace(/^ \* v [^\r\n]+/m, ' * v ' + options.version));
    require('./build')(staging);
    const result = execFileSync('npm', [
      'pack', '--offline', '--ignore-scripts', '--json', '--pack-destination', temporary
    ], {
      cwd: staging, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, npm_config_update_notifier: 'false' }
    });
    const packed = JSON.parse(result);
    const expectedName = path.basename(destination);
    if (packed.length !== 1 || packed[0].name !== 'mailcheck' ||
        packed[0].version !== options.version || packed[0].filename !== expectedName) {
      throw new Error('npm produced an unexpected package artifact.');
    }
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(temporary, expectedName), destination, fs.constants.COPYFILE_EXCL);
    const archive = fs.readFileSync(destination);
    log('Created ' + destination + ' (' + archive.length + ' bytes)');
    log('SHA-256: ' + crypto.createHash('sha256').update(archive).digest('hex'));
    return destination;
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

if (require.main === module) {
  try { cutRelease(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { parseArgs, cutRelease, PACKAGE_FILES };
