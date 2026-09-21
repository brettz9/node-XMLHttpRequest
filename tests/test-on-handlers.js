import assert from 'node:assert';
import http from 'node:http';
import getXMLHttpRequest from '../src/XMLHttpRequest.js';

const XMLHttpRequest = getXMLHttpRequest();
const xhr = new XMLHttpRequest();

let onreadystatechangeCalled = false;
let onloadstartCalled = false;
let onloadCalled = false;
let onloadendCalled = false;

// Deliberately using the direct `on*` properties (rather than
//   `addEventListener`) here, since that's the specific dispatch path
//   under test. These are only ever assigned dynamically (via
//   `this['on' + event]`) inside the class, so TS doesn't know about them
//   as declared properties -- same as the source's own dynamic-dispatch
//   code, which needs the same `@ts-expect-error` treatment.
// eslint-disable-next-line unicorn/prefer-add-event-listener -- See above
xhr.onreadystatechange = function () {
  onreadystatechangeCalled = true;
};
// @ts-expect-error -- Safe now, see comment above
// eslint-disable-next-line unicorn/prefer-add-event-listener -- See above
xhr.onloadstart = function () {
  onloadstartCalled = true;
};
// @ts-expect-error -- Safe now, see comment above
// eslint-disable-next-line unicorn/prefer-add-event-listener -- See above
xhr.onload = function () {
  onloadCalled = true;
};
/**
 * @this {import('../src/XMLHttpRequest.js').LocalXMLHttpRequestInstance}
 * @returns {void}
 */
function onLoadEnd () {
  onloadendCalled = true;

  assert.equal(onreadystatechangeCalled, true);
  assert.equal(onloadstartCalled, true);
  assert.equal(onloadCalled, true);
  assert.equal(onloadendCalled, true);

  // The `response` property mirrors `responseText` (no `responseType`
  //   support beyond the default `"text"` behavior). It's added via
  //   `Object.defineProperty` on the prototype after the class body, so
  //   TS doesn't see it as part of the class's own shape either.
  // @ts-expect-error -- Safe now, see comment above
  assert.equal(this.response, this.responseText);

  // eslint-disable-next-line no-console -- Testing
  console.log('done');
}
// @ts-expect-error -- Safe now, see comment above
xhr.onloadend = onLoadEnd;

http.createServer(
  /**
   * @this {http.Server}
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @returns {void}
   */
  function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World');
    this.close();
  }
).listen(8000);

xhr.open('GET', 'http://localhost:8000/');
xhr.send();
