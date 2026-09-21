import assert from 'node:assert';
import http from 'node:http';
import getXMLHttpRequest from '../src/XMLHttpRequest.js';

const XMLHttpRequest = getXMLHttpRequest();

// 1. `setRequestHeader` before `open()` (readyState is `UNSENT`).
const xhr1 = new XMLHttpRequest();
assert.throws(() => {
  xhr1.setRequestHeader('X-Test', '1');
});

// 2. `send()` without a prior `open()`.
const xhr2 = new XMLHttpRequest();
assert.throws(() => {
  xhr2.send();
});

// 3. `setRequestHeader`/`send()` while the send flag is already set (i.e.,
//    a second call before the in-flight async request has completed).
http.createServer(
  /**
   * @this {http.Server}
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @returns {void}
   */
  function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('ok');
    this.close();
  }
).listen(8000, () => {
  const xhr3 = new XMLHttpRequest();
  xhr3.open('GET', 'http://localhost:8000/');
  xhr3.send();

  assert.throws(() => {
    xhr3.setRequestHeader('X-Test', '1');
  });
  assert.throws(() => {
    xhr3.send();
  });

  xhr3.addEventListener(
    'readystatechange',
    /**
     * @this {import('../src/XMLHttpRequest.js').LocalXMLHttpRequestInstance}
     * @returns {void}
     */
    function () {
      if (this.readyState === 4) {
        // eslint-disable-next-line no-console -- Testing
        console.log('done');
      }
    }
  );
});
