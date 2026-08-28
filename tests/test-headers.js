import assert from 'node:assert';
import http from 'node:http';
import getXMLHttpRequest from '../src/XMLHttpRequest.js';

const XMLHttpRequest = getXMLHttpRequest();
const xhr = new XMLHttpRequest();

// Test server
http.createServer(
  /**
   * @this {http.Server}
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @returns {void}
   */
  function (req, res) {
    // Test setRequestHeader
    assert.equal('Foobar', req.headers['x-test']);
    // Test non-conforming allowed header
    assert.equal('node-XMLHttpRequest-test', req.headers['user-agent']);
    // Test header set with blacklist disabled
    assert.equal('https://github.com', req.headers.referer);

    const body = 'Hello World';
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(body),
      // Set cookie headers to see if they're correctly suppressed
      // Actual values don't matter
      'Set-Cookie': 'foo=bar',
      'Set-Cookie2': 'bar=baz',
      Date: 'Thu, 30 Aug 2012 18:17:53 GMT',
      Connection: 'close'
    });
    res.write('Hello World');
    res.end();

    this.close();
  }
).listen(8000);

xhr.addEventListener(
  'readystatechange',
  /**
   * @this {import('../src/XMLHttpRequest.js').LocalXMLHttpRequestInstance}
   * @returns {void}
   */
  function () {
    if (this.readyState === 4) {
      // Test getAllResponseHeaders()
      const headers = `content-type: text/plain\r
content-length: 11\r
date: Thu, 30 Aug 2012 18:17:53 GMT\r
connection: close`;

      assert.equal(headers, this.getAllResponseHeaders());

      // Test case insensitivity
      assert.equal('text/plain', this.getResponseHeader('Content-Type'));
      assert.equal('text/plain', this.getResponseHeader('Content-type'));
      assert.equal('text/plain', this.getResponseHeader('content-Type'));
      assert.equal('text/plain', this.getResponseHeader('content-type'));

      // Test aborted getAllResponseHeaders
      this.abort();
      assert.equal('', this.getAllResponseHeaders());
      assert.equal(null, this.getResponseHeader('Connection'));

      // eslint-disable-next-line no-console -- Testing
      console.log('done');
    }
  }
);

assert.equal(null, xhr.getResponseHeader('Content-Type'));
try {
  xhr.open('GET', 'http://localhost:8000/');
  // Valid header
  xhr.setRequestHeader('X-Test', 'Foobar');
  // Invalid header
  xhr.setRequestHeader('Content-Length', '0');
  // Allowed header outside of specs
  xhr.setRequestHeader('user-agent', 'node-XMLHttpRequest-test');
  // Test getRequestHeader
  assert.equal('Foobar', xhr.getRequestHeader('X-Test'));
  // Test invalid header
  assert.equal('', xhr.getRequestHeader('Content-Length'));

  // Test allowing all headers
  xhr.setDisableHeaderCheck(true);
  xhr.setRequestHeader('Referer', 'https://github.com');
  assert.equal('https://github.com', xhr.getRequestHeader('Referer'));

  xhr.send();
} catch (e) {
  // eslint-disable-next-line no-console -- Testing
  console.log('ERROR: Exception raised', e);
}
