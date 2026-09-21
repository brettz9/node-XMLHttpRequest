import assert from 'node:assert';
import net from 'node:net';
import getXMLHttpRequest from '../src/XMLHttpRequest.js';

const XMLHttpRequest = getXMLHttpRequest();

/* eslint-disable @stylistic/max-len -- Can't wrap a JSDoc type expression */
/**
 * @typedef {import('../src/XMLHttpRequest.js').LocalXMLHttpRequestInstance} LocalXHR
 */
/* eslint-enable @stylistic/max-len -- Can't wrap a JSDoc type expression */

// 1. Connection refused: the request itself errors (no server listening),
//    exercising the request-level error handler.
const xhr1 = new XMLHttpRequest();
xhr1.addEventListener(
  'readystatechange',
  /**
   * @this {LocalXHR}
   * @returns {void}
   */
  function () {
    if (this.readyState === 4) {
      assert.equal(this.status, 503);
      runAbortTest();
    }
  }
);
xhr1.open('GET', 'http://localhost:8001/');
xhr1.send();

// 2. Aborting an in-flight (already-sent) async request should move it
//    straight to `DONE` (with the send flag cleared) before resetting to
//    `UNSENT`.
/**
 * @returns {void}
 */
function runAbortTest () {
  const server = net.createServer(() => {
    // Never respond -- the client aborts before any response arrives.
  }).listen(8002, () => {
    const xhr2 = new XMLHttpRequest();
    xhr2.open('GET', 'http://localhost:8002/');
    xhr2.send();
    assert.equal(xhr2.readyState, xhr2.OPENED);
    xhr2.abort();
    assert.equal(xhr2.readyState, xhr2.UNSENT);
    server.close();
    runResponseErrorTest();
  });
}

// 3. A malformed response (invalid chunked framing) surfaces as an error on
//    the response stream itself, exercising the response-level error
//    handler.
/**
 * @returns {void}
 */
function runResponseErrorTest () {
  const server = net.createServer((socket) => {
    socket.on('data', () => {
      socket.write(
        'HTTP/1.1 200 OK\r\n' +
        'Content-Type: text/plain\r\n' +
        'Transfer-Encoding: chunked\r\n' +
        '\r\n' +
        '5\r\nHello\r\n' +
        'not-a-hex-length\r\n'
      );
    });
  }).listen(8003, () => {
    // The malformed chunk triggers both a request-level error and (once
    //   the already-buffered "Hello" chunk is delivered and the stream
    //   subsequently errors) a response-level error, so `DONE` can be
    //   reached more than once; only act on the first.
    let handled = false;
    const xhr3 = new XMLHttpRequest();
    xhr3.addEventListener(
      'readystatechange',
      /**
       * @this {LocalXHR}
       * @returns {void}
       */
      function () {
        if (!handled && this.readyState === 4) {
          handled = true;
          assert.equal(this.status, 503);
          server.close();
          // eslint-disable-next-line no-console -- Testing
          console.log('done');
        }
      }
    );
    xhr3.open('GET', 'http://localhost:8003/');
    xhr3.send();
  });
}

// 4. A URL with no explicit port falls back to the protocol's default (80
//    for `http:`, 443 for `https:`). The port is computed synchronously
//    within `send()` itself, before any connection is attempted, so an
//    immediate `abort()` is enough to exercise it without needing a real
//    listener on either port.
const xhr4 = new XMLHttpRequest();
xhr4.open('GET', 'http://localhost/');
xhr4.send();
xhr4.abort();

const xhr5 = new XMLHttpRequest();
xhr5.open('GET', 'https://localhost/');
xhr5.send();
xhr5.abort();
