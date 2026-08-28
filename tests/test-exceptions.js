import getXMLHttpRequest from '../lib/XMLHttpRequest.js';

const XMLHttpRequest = getXMLHttpRequest();
const xhr = new XMLHttpRequest();

// Test request methods that aren't allowed
try {
  xhr.open('TRACK', 'http://localhost:8000/');
  // eslint-disable-next-line no-console -- Testing
  console.log('ERROR: TRACK should have thrown exception');
} catch {}
try {
  xhr.open('TRACE', 'http://localhost:8000/');
  // eslint-disable-next-line no-console -- Testing
  console.log('ERROR: TRACE should have thrown exception');
} catch {}
try {
  xhr.open('CONNECT', 'http://localhost:8000/');
  // eslint-disable-next-line no-console -- Testing
  console.log('ERROR: CONNECT should have thrown exception');
} catch {}
// Test valid request method
try {
  xhr.open('GET', 'http://localhost:8000/');
} catch (e) {
  // eslint-disable-next-line no-console -- Testing
  console.log('ERROR: Invalid exception for GET', e);
}

// Test forbidden headers
const forbiddenRequestHeaders = [
  'accept-charset',
  'accept-encoding',
  'access-control-request-headers',
  'access-control-request-method',
  'connection',
  'content-length',
  'content-transfer-encoding',
  'cookie',
  'cookie2',
  'date',
  'expect',
  'host',
  'keep-alive',
  'origin',
  'referer',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'user-agent',
  'via'
];

for (const header of forbiddenRequestHeaders) {
  try {
    xhr.setRequestHeader(header, 'Test');
    // eslint-disable-next-line no-console -- Testing
    console.log('ERROR: ' + header + ' should have thrown exception');
  } catch {
  }
}

// Try valid header
xhr.setRequestHeader('X-Foobar', 'Test');

// eslint-disable-next-line no-console -- Testing
console.log('Done');
