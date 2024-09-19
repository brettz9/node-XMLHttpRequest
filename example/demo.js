'use strict';

const {XMLHttpRequest} = require('xmlhttprequest');

const xhr = new XMLHttpRequest();

xhr.addEventListener('readystatechange', function () {
  console.log('State: ' + this.readyState);

  if (this.readyState === 4) {
    console.log('Complete.\nBody length: ' + this.responseText.length);
    console.log('Body:\n' + this.responseText);
  }
});

xhr.open('GET', 'https://driverdan.com');
xhr.send();
