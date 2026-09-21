import assert from 'node:assert';
import {fork} from 'node:child_process';
import getXMLHttpRequest from '../src/XMLHttpRequest.js';

// eslint-disable-next-line no-shadow -- Convenient
const __dirname = import.meta.dirname;

const XMLHttpRequest = getXMLHttpRequest();

// A synchronous `send()` busy-waits the current process until its helper
//   child process finishes, so the server it talks to must live in a
//   wholly separate process (it can't be this same process -- there'd be
//   no event loop turn left free to service it).
const echoServer = fork(__dirname + '/fixtures/echo-server.js');

echoServer.once('message', (msg) => {
  const {port} = /** @type {{port: number}} */ (msg);

  // 1. Synchronous GET (no data).
  const xhr1 = new XMLHttpRequest();
  xhr1.open('GET', `http://localhost:${port}/`, false);
  xhr1.send();
  assert.equal(xhr1.status, 200);
  assert.equal(xhr1.responseText, 'GET:');

  // 2. Synchronous POST with data.
  const xhr2 = new XMLHttpRequest();
  xhr2.open('POST', `http://localhost:${port}/`, false);
  xhr2.send('sync-body');
  assert.equal(xhr2.status, 200);
  assert.equal(xhr2.responseText, 'POST:sync-body');

  // 3. Synchronous request that fails to connect.
  const xhr3 = new XMLHttpRequest();
  xhr3.open('GET', 'http://localhost:1/', false);
  xhr3.send();
  assert.equal(xhr3.status, 503);

  echoServer.send('shutdown');
  // eslint-disable-next-line no-console -- Testing
  console.log('done');
});
