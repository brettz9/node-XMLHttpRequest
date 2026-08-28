import getXMLHttpRequest from 'xmlhttprequest';

const XMLHttpRequest = getXMLHttpRequest();

const xhr = new XMLHttpRequest();

xhr.addEventListener('readystatechange', function () {
  // eslint-disable-next-line no-console -- Demo
  console.log('State: ' + this.readyState);

  if (this.readyState === 4) {
    // eslint-disable-next-line no-console -- Demo
    console.log('Complete.\nBody length: ' + this.responseText.length);
    // eslint-disable-next-line no-console -- Demo
    console.log('Body:\n' + this.responseText);
  }
});

xhr.open('GET', 'https://driverdan.com');
xhr.send();
