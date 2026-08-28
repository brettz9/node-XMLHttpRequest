import assert from 'node:assert';
import getXMLHttpRequest from '../lib/XMLHttpRequest.js';

const XMLHttpRequest = getXMLHttpRequest();
const xhr = new XMLHttpRequest();

// Test constant values
assert.equal(0, xhr.UNSENT);
assert.equal(1, xhr.OPENED);
assert.equal(2, xhr.HEADERS_RECEIVED);
assert.equal(3, xhr.LOADING);
assert.equal(4, xhr.DONE);

// eslint-disable-next-line no-console -- Testing
console.log('done');
