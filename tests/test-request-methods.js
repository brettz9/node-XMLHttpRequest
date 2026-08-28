import assert from 'node:assert';
import http from 'node:http';
import getXMLHttpRequest from '../src/XMLHttpRequest.js';

const XMLHttpRequest = getXMLHttpRequest();

// Test standard methods
const methods = ['GET', 'POST', 'HEAD', 'PUT', 'DELETE'];
let curMethod = 0;

// Test server
http.createServer(
  /**
   * @this {http.Server}
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @returns {void}
   */
  function (req, res) {
    // Check request method and URL
    assert.equal(methods[curMethod], req.method);
    assert.equal('/' + methods[curMethod], req.url);

    const body = (req.method !== 'HEAD' ? 'Hello World' : '');

    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(body)
    });
    // HEAD has no body
    if (req.method !== 'HEAD') {
      res.write(body);
    }
    res.end();

    if (curMethod === methods.length - 1) {
      this.close();
      // eslint-disable-next-line no-console -- Testing
      console.log('done');
    }
  }
).listen(8000);

/**
 * @param {string} method
 * @returns {void}
 */
function start (method) {
  // Reset each time
  const xhr = new XMLHttpRequest();

  xhr.addEventListener(
    'readystatechange',
    /**
     * @this {import('../src/XMLHttpRequest.js').LocalXMLHttpRequestInstance}
     * @returns {void}
     */
    function () {
      if (this.readyState === 4) {
        if (method === 'HEAD') {
          assert.equal('', this.responseText);
        } else {
          assert.equal('Hello World', this.responseText);
        }

        curMethod++;

        if (curMethod < methods.length) {
          // eslint-disable-next-line no-console -- Testing
          console.log('Testing ' + methods[curMethod]);
          start(methods[curMethod]);
        }
      }
    }
  );

  const url = 'http://localhost:8000/' + method;
  xhr.open(method, url);
  xhr.send();
}

// eslint-disable-next-line no-console -- Testing
console.log('Testing ' + methods[curMethod]);
start(methods[curMethod]);
