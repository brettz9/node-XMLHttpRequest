import assert from 'node:assert';
import http from 'node:http';
import getXMLHttpRequest from '../lib/XMLHttpRequest.js';
const XMLHttpRequest = getXMLHttpRequest();
const xhr = new XMLHttpRequest();

// Test server
http.createServer(function (req, res) {
  if (req.url === '/redirectingResource') {
    res.writeHead(302, {Location: 'http://localhost:8000/'});
    res.end();
    return;
  }

  const body = 'Hello World';
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Length': Buffer.byteLength(body),
    Date: 'Thu, 30 Aug 2012 18:17:53 GMT',
    Connection: 'close'
  });
  res.write('Hello World');
  res.end();

  this.close();
}).listen(8000);

xhr.addEventListener('readystatechange', function () {
  if (this.readyState === 4) {
    assert.equal(xhr.getRequestHeader('Location'), '');
    assert.equal(xhr.responseText, 'Hello World');
    // eslint-disable-next-line no-console -- Testing
    console.log('done');
  }
});

try {
  xhr.open('GET', 'http://localhost:8000/redirectingResource');
  xhr.send();
} catch (e) {
  // eslint-disable-next-line no-console -- Testing
  console.log('ERROR: Exception raised', e);
}
