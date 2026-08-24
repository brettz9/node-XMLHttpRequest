'use strict';

let
  assert = require('assert'),
  XMLHttpRequest = require('../lib/XMLHttpRequest')(),
  xhr;

xhr = new XMLHttpRequest();

xhr.addEventListener('readystatechange', function () {
  if (this.readyState == 4) {
    assert.equal('Hello World', this.responseText);
    runSync();
  }
});

// Async
var url = 'file://' + __dirname + '/testdata.txt';
xhr.open('GET', url);
xhr.send();

// Sync
var runSync = function () {
  xhr = new XMLHttpRequest();

  xhr.addEventListener('readystatechange', function () {
    if (this.readyState == 4) {
      assert.equal('Hello World', this.responseText);
      console.log('done');
    }
  });
  xhr.open('GET', url, false);
  xhr.send();
};
