/**
 * A tiny echo server run in its own process (via `fork()`), so that a
 * synchronous `XMLHttpRequest#send()` in the parent process -- which
 * busy-waits and so can't service its own event loop -- has a server to
 * talk to that keeps running regardless.
 */
import http from 'node:http';

const server = http.createServer(
  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @returns {void}
   */
  (req, res) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end(req.method + ':' + body);
    });
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
