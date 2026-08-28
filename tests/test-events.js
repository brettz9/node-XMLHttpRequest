import assert from 'node:assert';
import http from 'node:http';
import getXMLHttpRequest from '../lib/XMLHttpRequest.js';

const XMLHttpRequest = getXMLHttpRequest();

// Test server
http.createServer(function (req, res) {
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
  assert.equal(onreadystatechange, true);
  assert.equal(readystatechange, true);
  assert.equal(removed, true);
  // eslint-disable-next-line no-console -- Testing
  console.log('done');
  this.close();
}).listen(8000);

const xhr = new XMLHttpRequest();

// Track event calls
let onreadystatechange = false;
let readystatechange = false;
let removed = true;
const removedEvent = function () {
  removed = false;
};

xhr.addEventListener('readystatechange', function () {
  onreadystatechange = true;
});

xhr.addEventListener('readystatechange', function () {
  readystatechange = true;
});

// This isn't perfect, won't guarantee it was added in the first place
xhr.addEventListener('readystatechange', removedEvent);
xhr.removeEventListener('readystatechange', removedEvent);

xhr.open('GET', 'http://localhost:8000');
xhr.send();
