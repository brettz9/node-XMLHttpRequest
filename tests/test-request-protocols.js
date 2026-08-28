/* eslint-disable n/no-sync -- Convenient */
import assert from 'node:assert';
import getXMLHttpRequest from '../lib/XMLHttpRequest.js';

// eslint-disable-next-line no-shadow -- Convenient
const __dirname = import.meta.dirname;

const XMLHttpRequest = getXMLHttpRequest();
let xhr = new XMLHttpRequest();

xhr.addEventListener('readystatechange', function () {
  if (this.readyState === 4) {
    assert.equal('Hello World', this.responseText);
    runSync();
  }
});

// Async
const url = 'file://' + __dirname + '/testdata.txt';
xhr.open('GET', url);
xhr.send();

// Sync
const runSync = function () {
  xhr = new XMLHttpRequest();

  xhr.addEventListener('readystatechange', function () {
    if (this.readyState === 4) {
      assert.equal('Hello World', this.responseText);
      // eslint-disable-next-line no-console -- Testing
      console.log('done');
    }
  });
  xhr.open('GET', url, false);
  xhr.send();
};
