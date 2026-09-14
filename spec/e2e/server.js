const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

// Only serve explicit test resources, on an ephemeral loopback port.
const root = path.join(__dirname, '../..');
const routes = {
  '/vanilla.html': 'spec/e2e/fixtures/vanilla.html',
  '/examples/index.html': 'examples/index.html',
  '/src/mailcheck.js': 'src/mailcheck.js',
  '/spec/spec_runner.html': 'spec/spec_runner.html',
  '/spec/mailcheckSpec.js': 'spec/mailcheckSpec.js',
  '/spec/lib/jquery.js': 'spec/lib/jquery.js',
  '/spec/lib/console-runner.js': 'spec/lib/console-runner.js',
  '/spec/lib/jasmine-1.2.0/jasmine.js': 'spec/lib/jasmine-1.2.0/jasmine.js',
  '/spec/lib/jasmine-1.2.0/jasmine-html.js': 'spec/lib/jasmine-1.2.0/jasmine-html.js',
  '/spec/lib/jasmine-1.2.0/jasmine.css': 'spec/lib/jasmine-1.2.0/jasmine.css'
};

exports.startServer = async function() {
  const server = http.createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
    if (pathname === '/favicon.ico') {
      response.writeHead(204).end();
      return;
    }
    const file = routes[pathname];
    if (!file) {
      response.writeHead(404).end('Unknown test resource');
      return;
    }
    try {
      const content = await fs.readFile(path.join(root, file));
      const type = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html';
      response.writeHead(200, { 'Content-Type': type + '; charset=utf-8' }).end(content);
    } catch (error) {
      response.writeHead(500).end('Failed to read test resource');
      console.error(error);
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return {
    url: 'http://127.0.0.1:' + server.address().port,
    close: () => new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
      server.closeIdleConnections();
    })
  };
};
