/**
 * An HTTPS counterpart to `echo-server.js`, run in its own process for the
 * same reason: a synchronous `send()` busy-waits its own process, so it
 * can't also host the server it's talking to.
 */
/* eslint-disable n/no-sync -- Reading fixture cert files at startup */
import https from 'node:https';
import fs from 'node:fs';

// eslint-disable-next-line no-shadow -- Convenient
const __dirname = import.meta.dirname;

const server = https.createServer(
  {
    key: fs.readFileSync(__dirname + '/localhost-key.pem'),
    cert: fs.readFileSync(__dirname + '/localhost-cert.pem')
  },
  /**
   * @param {import('node:http').IncomingMessage} req
   * @param {import('node:http').ServerResponse} res
   * @returns {void}
   */
  (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello Sync HTTPS');
  }
).listen(0, () => {
  const {port} = /** @type {import('node:net').AddressInfo} */ (
    server.address()
  );
  /** @type {(msg: unknown) => void} */ (process.send)({port});
});

process.on('message', (msg) => {
  if (msg === 'shutdown') {
    server.close(() => {
      process.exit(0);
    });
  }
});
