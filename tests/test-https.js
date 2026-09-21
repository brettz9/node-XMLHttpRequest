/* eslint-disable n/no-process-env -- Test-only, scoped to this process */
/* eslint-disable n/no-sync -- Reading fixture cert files at test startup */
import assert from 'node:assert';
import https from 'node:https';
import fs from 'node:fs';
import getXMLHttpRequest from '../src/XMLHttpRequest.js';

// eslint-disable-next-line no-shadow -- Convenient
const __dirname = import.meta.dirname;

// This process only ever talks to its own self-signed test server, so
//   relaxing certificate validation here is safe and keeps the fixture
//   self-contained (no CA setup required).
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const XMLHttpRequest = getXMLHttpRequest();
const xhr = new XMLHttpRequest();

https.createServer(
  {
    key: fs.readFileSync(__dirname + '/fixtures/localhost-key.pem'),
    cert: fs.readFileSync(__dirname + '/fixtures/localhost-cert.pem')
  },
  /**
   * @this {https.Server}
   * @param {import('node:http').IncomingMessage} req
   * @param {import('node:http').ServerResponse} res
   * @returns {void}
   */
  function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello HTTPS');
    this.close();
  }
).listen(8007);

xhr.addEventListener(
  'readystatechange',
  /**
   * @this {import('../src/XMLHttpRequest.js').LocalXMLHttpRequestInstance}
   * @returns {void}
   */
  function () {
    if (this.readyState === 4) {
      assert.equal(this.status, 200);
      assert.equal(this.responseText, 'Hello HTTPS');
      // eslint-disable-next-line no-console -- Testing
      console.log('done');
    }
  }
);
xhr.open('GET', 'https://localhost:8007/');
xhr.send();
