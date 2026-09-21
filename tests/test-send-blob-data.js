import assert from 'node:assert';
import http from 'node:http';
import getXMLHttpRequest from '../src/XMLHttpRequest.js';

/**
 * @typedef {{__isTestBlob: true, type: string, content: string}} TestBlob
 */

const XMLHttpRequest = getXMLHttpRequest({
  /**
   * @param {unknown} data
   * @returns {{type: string, bytes: Buffer}|false}
   */
  readBlobSync (data) {
    const blob = /** @type {TestBlob} */ (data);
    return (blob && blob.__isTestBlob)
      ? {type: blob.type, bytes: Buffer.from(blob.content)}
      : false;
  }
});

/**
 * @typedef {{
 *   data: string|TestBlob,
 *   presetContentType: string|undefined,
 *   expectedContentType: string,
 *   expectedBody: string
 * }} Step
 */

/** @type {Step[]} */
const steps = [
  // A `Blob`-like object with no pre-set `Content-Type`: the blob's own
  //   type should be used.
  {
    data: {__isTestBlob: true, type: 'text/csv', content: 'a,b,c'},
    presetContentType: undefined,
    expectedContentType: 'text/csv',
    expectedBody: 'a,b,c'
  },
  // A `Blob`-like object where a `Content-Type` was already set explicitly:
  //   the existing header should win.
  {
    data: {__isTestBlob: true, type: 'text/csv', content: 'd,e,f'},
    presetContentType: 'application/x-custom',
    expectedContentType: 'application/x-custom',
    expectedBody: 'd,e,f'
  },
  // Data that `readBlobSync` doesn't recognize as a blob: falls through
  //   unchanged.
  {
    data: 'plain string body',
    presetContentType: undefined,
    expectedContentType: 'text/plain;charset=UTF-8',
    expectedBody: 'plain string body'
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
      const step = steps[stepIndex];
      assert.equal(req.headers['content-type'], step.expectedContentType);
      assert.equal(body, step.expectedBody);
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
  xhr.open('POST', 'http://localhost:8000/');
  if (step.presetContentType) {
    xhr.setRequestHeader('Content-Type', step.presetContentType);
  }
  // `send()`'s declared signature doesn't include our test-only "blob"
  //   shape (that's the whole point of the `readBlobSync` config hook).
  // @ts-expect-error -- Test-only data shape, see comment above
  xhr.send(step.data);
}
