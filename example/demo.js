// import getXMLHttpRequest from 'xmlhttprequest';
import getXMLHttpRequest from '../src/XMLHttpRequest.js';

const XMLHttpRequest = getXMLHttpRequest();

const xhr = new XMLHttpRequest();

xhr.addEventListener(
  'readystatechange',
  /**
   * @this {import('../src/XMLHttpRequest.js').LocalXMLHttpRequestInstance}
   * @returns {void}
   */
  function () {
    // eslint-disable-next-line no-console -- Demo
    console.log('State: ' + this.readyState);

    if (this.readyState === 4) {
      // eslint-disable-next-line no-console -- Demo
      console.log('Complete.\nBody length: ' + this.responseText.length);
      // eslint-disable-next-line no-console -- Demo
      console.log('Body:\n' + this.responseText);
    }
  }
);

xhr.open('GET', './README.md');
xhr.send();
