import assert from 'node:assert';
import http from 'node:http';
import getXMLHttpRequest from '../src/XMLHttpRequest.js';

const XMLHttpRequest = getXMLHttpRequest();

/**
 * @typedef {{
 *   method: string,
 *   url: string,
 *   async?: boolean,
 *   user?: string,
 *   password?: string,
 *   data?: string|Buffer<ArrayBufferLike>,
 *   presetContentType?: string,
 *   check: (
 *     req: http.IncomingMessage, body: string
 *   ) => void
 * }} Step
 */

/** @type {Step[]} */
const steps = [
  // Basic Auth with both a user and a password.
  {
    method: 'GET',
    url: 'http://localhost:8000/',
    async: true,
    user: 'alice',
    password: 'secret',
    check (req) {
      assert.equal(
        req.headers.authorization,
        'Basic ' + Buffer.from('alice:secret').toString('base64')
      );
    }
  },
  // Basic Auth with a user but no password (defaults to an empty string).
  {
    method: 'GET',
    url: 'http://localhost:8000/',
    async: true,
    user: 'bob',
    check (req) {
      assert.equal(
        req.headers.authorization,
        'Basic ' + Buffer.from('bob:', 'utf8').toString('base64')
      );
    }
  },
  // POST with string data and no preset Content-Type: Content-Length and a
  //   default Content-Type are both derived.
  {
    method: 'POST',
    url: 'http://localhost:8000/',
    data: 'hello=world',
    check (req, body) {
      assert.equal(req.headers['content-type'], 'text/plain;charset=UTF-8');
      assert.equal(req.headers['content-length'], '11');
      assert.equal(body, 'hello=world');
    }
  },
  // PUT with `Buffer` data and a preset Content-Type: the preset wins, and
  //   the length is computed via `Buffer#length`.
  {
    method: 'PUT',
    url: 'http://localhost:8000/',
    data: Buffer.from('binary-body'),
    presetContentType: 'application/octet-stream',
    check (req, body) {
      assert.equal(req.headers['content-type'], 'application/octet-stream');
      assert.equal(req.headers['content-length'], '11');
      assert.equal(body, 'binary-body');
    }
  }
];
let stepIndex = 0;

const server = http.createServer(
  /**
   * @this {http.Server}
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @returns {void}
   */
  function (req, res) {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      steps[stepIndex].check(req, body);
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('ok');
    });
  }
).listen(8000, () => {
  runStep();
});

/**
 * @returns {void}
 */
function runStep () {
  if (stepIndex === steps.length) {
    server.close();
    // eslint-disable-next-line no-console -- Testing
    console.log('done');
    return;
  }

  const step = steps[stepIndex];
  const xhr = new XMLHttpRequest();
  xhr.addEventListener(
    'readystatechange',
    /**
     * @this {import('../src/XMLHttpRequest.js').LocalXMLHttpRequestInstance}
     * @returns {void}
     */
    function () {
      if (this.readyState === 4) {
        assert.equal(this.responseText, 'ok');
        stepIndex++;
        runStep();
      }
    }
  );
  xhr.open(step.method, step.url, step.async, step.user, step.password);
  if (step.presetContentType) {
    xhr.setRequestHeader('Content-Type', step.presetContentType);
  }
  xhr.send(step.data);
}
