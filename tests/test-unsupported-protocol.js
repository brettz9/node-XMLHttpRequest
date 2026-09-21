import getXMLHttpRequest from '../src/XMLHttpRequest.js';

const XMLHttpRequest = getXMLHttpRequest();
const xhr = new XMLHttpRequest();

xhr.open('GET', 'ftp://localhost/foo');

let threw = false;
try {
  xhr.send();
} catch {
  threw = true;
}

if (!threw) {
  // eslint-disable-next-line no-console -- Testing
  console.log('ERROR: unsupported protocol should have thrown exception');
}

// eslint-disable-next-line no-console -- Testing
console.log('done');
