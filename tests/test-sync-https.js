/* eslint-disable n/no-process-env -- Test-only, scoped to this process */
import assert from 'node:assert';
import {fork} from 'node:child_process';
import getXMLHttpRequest from '../src/XMLHttpRequest.js';

// eslint-disable-next-line no-shadow -- Convenient
const __dirname = import.meta.dirname;

// This process (and, since it's inherited, the helper process the sync
//   `send()` below spawns) only ever talks to its own self-signed test
//   server, so relaxing certificate validation here is safe.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const XMLHttpRequest = getXMLHttpRequest();

const echoServer = fork(__dirname + '/fixtures/echo-https-server.js');

echoServer.once('message', (msg) => {
  const {port} = /** @type {{port: number}} */ (msg);

  const xhr = new XMLHttpRequest();
  xhr.open('GET', `https://localhost:${port}/`, false);
  xhr.send();
  assert.equal(xhr.status, 200);
  assert.equal(xhr.responseText, 'Hello Sync HTTPS');

  echoServer.send('shutdown');
  // eslint-disable-next-line no-console -- Testing
  console.log('done');
});
