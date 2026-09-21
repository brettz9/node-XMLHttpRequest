import assert from 'node:assert';
import getXMLHttpRequest from '../src/XMLHttpRequest.js';

/** @type {Record<string, {type: string, bytes: string|Buffer}>} */
const blobs = {
  'blob:string-blob': {type: 'text/plain', bytes: 'Hello Blob'},
  'blob:buffer-blob': {
    type: 'application/octet-stream', bytes: Buffer.from('Buffered Blob')
  },
  'blob:no-type': {type: '', bytes: 'No Type Blob'}
};

const XMLHttpRequest = getXMLHttpRequest({
  /**
   * @param {string} url
   * @returns {{type: string, bytes: string|Buffer}|false}
   */
  resolveBlobURL (url) {
    return blobs[url] || false;
  }
});

let completed = 0;
/**
 * @returns {void}
 */
function maybeDone () {
  completed++;
  if (completed === 5) {
    // eslint-disable-next-line no-console -- Testing
    console.log('done');
  }
}

/**
 * @this {import('../src/XMLHttpRequest.js').LocalXMLHttpRequestInstance}
 * @returns {void}
 */
function assertBlobStringResult () {
  if (this.readyState === 4) {
    assert.equal(this.status, 200);
    assert.equal(this.responseText, 'Hello Blob');
    assert.equal(this.getResponseHeader('content-type'), 'text/plain');
    maybeDone();
  }
}

/**
 * @this {import('../src/XMLHttpRequest.js').LocalXMLHttpRequestInstance}
 * @returns {void}
 */
function assertBlobBufferResult () {
  if (this.readyState === 4) {
    assert.equal(this.status, 200);
    assert.equal(
      this.responseText, Buffer.from('Buffered Blob').toString('binary')
    );
    maybeDone();
  }
}

/**
 * @this {import('../src/XMLHttpRequest.js').LocalXMLHttpRequestInstance}
 * @returns {void}
 */
function assertBlobMissingResult () {
  if (this.readyState === 4) {
    assert.equal(this.status, 503);
    maybeDone();
  }
}

/**
 * @this {import('../src/XMLHttpRequest.js').LocalXMLHttpRequestInstance}
 * @returns {void}
 */
function assertBlobNoTypeResult () {
  if (this.readyState === 4) {
    assert.equal(this.status, 200);
    assert.equal(this.responseText, 'No Type Blob');
    assert.equal(this.getResponseHeader('content-type'), '');
    maybeDone();
  }
}

// 1. Async GET of a resolvable `blob:` URL with string bytes.
const xhr1 = new XMLHttpRequest();
xhr1.addEventListener('readystatechange', assertBlobStringResult);
xhr1.open('GET', 'blob:string-blob');
xhr1.send();

// 2. Async GET of a resolvable `blob:` URL with `Buffer` bytes.
const xhr2 = new XMLHttpRequest();
xhr2.addEventListener('readystatechange', assertBlobBufferResult);
xhr2.open('GET', 'blob:buffer-blob');
xhr2.send();

// 3. Async GET of an unresolvable `blob:` URL.
const xhr3 = new XMLHttpRequest();
xhr3.addEventListener('readystatechange', assertBlobMissingResult);
xhr3.open('GET', 'blob:missing-blob');
xhr3.send();

// 4. Sync GET of a resolvable `blob:` URL (response is set before `send()`
//    returns).
const xhr4 = new XMLHttpRequest();
xhr4.open('GET', 'blob:string-blob', false);
xhr4.send();
assert.equal(xhr4.status, 200);
assert.equal(xhr4.responseText, 'Hello Blob');
maybeDone();

// 5. A resolved blob with no `type` falls back to an empty Content-Type.
const xhr6 = new XMLHttpRequest();
xhr6.addEventListener('readystatechange', assertBlobNoTypeResult);
xhr6.open('GET', 'blob:no-type');
xhr6.send();

// 6. Only `GET` is supported for `blob:` URLs.
const xhr5 = new XMLHttpRequest();
xhr5.open('POST', 'blob:string-blob');
let threw = false;
try {
  xhr5.send();
} catch {
  threw = true;
}
assert.equal(threw, true);
