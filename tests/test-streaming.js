import assert from 'node:assert';
import http from 'node:http';
import getXMLHttpRequest from '../lib/XMLHttpRequest.js';

// Test server

/**
 * @param {http.ServerResponse<http.IncomingMessage> & {
 *   req: http.IncomingMessage;
 * }} res
 * @param {http.Server} server
 * @param {string[]} body
 * @returns {void}
 */
function completeResponse (res, server, body) {
  res.end();
  assert.equal(onreadystatechange, true);
  assert.equal(readystatechange, true);
  assert.equal(removed, true);
  assert.equal(loadCount, body.length);
  // eslint-disable-next-line no-console -- Testing
  console.log('done');
  server.close();
}

// function push (res, piece) {
//   res.write(piece);
// }

http.createServer(function (req, res) {
  const body = (req.method !== 'HEAD' ? ['Hello', 'World', 'Stream'] : []);

  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Length': Buffer.byteLength(body.join(''))
  });

  let nextPiece = 0;

  const interval = setInterval(() => {
    if (nextPiece < body.length) {
      res.write(body[nextPiece]);
      nextPiece++;
    } else {
      completeResponse(res, this, body);
      clearInterval(interval);
    }
  // nagle may put writes together, if it happens rise the interval time
  }, 100);
}).listen(8000);

const XMLHttpRequest = getXMLHttpRequest();
const xhr = new XMLHttpRequest();

// Track event calls
let onreadystatechange = false;
let readystatechange = false;
let removed = true;
let loadCount = 0;
const removedEvent = function () {
  removed = false;
};

xhr.addEventListener('readystatechange', function () {
  onreadystatechange = true;
});

xhr.addEventListener('readystatechange', function () {
  readystatechange = true;
  if (xhr.readyState === xhr.LOADING) {
    loadCount++;
  }
});

// This isn't perfect, won't guarantee it was added in the first place
xhr.addEventListener('readystatechange', removedEvent);
xhr.removeEventListener('readystatechange', removedEvent);

xhr.open('GET', 'http://localhost:8000');
xhr.send();
