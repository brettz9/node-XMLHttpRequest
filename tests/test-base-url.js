import assert from 'node:assert';
import http from 'node:http';
import getXMLHttpRequest from '../src/XMLHttpRequest.js';

// A relative URL with a non-`GET` method is resolved against `cfg.baseURL`
//   (a protocol-less relative URL otherwise only makes sense for reading a
//   local file, which only supports `GET`).
const XMLHttpRequest = getXMLHttpRequest({baseURL: 'http://localhost:8006'});
const xhr = new XMLHttpRequest();

http.createServer(
  /**
   * @this {http.Server}
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @returns {void}
   */
  function (req, res) {
    assert.equal(req.method, 'POST');
    assert.equal(req.url, '/some/path');

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      assert.equal(body, 'relative-post-body');
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('ok');
      this.close();
    });
  }
).listen(8006);

xhr.addEventListener(
  'readystatechange',
  /**
   * @this {import('../src/XMLHttpRequest.js').LocalXMLHttpRequestInstance}
   * @returns {void}
   */
  function () {
    if (this.readyState === 4) {
      assert.equal(this.responseText, 'ok');
      // eslint-disable-next-line no-console -- Testing
      console.log('done');
    }
  }
);
xhr.open('POST', '/some/path');
xhr.send('relative-post-body');
