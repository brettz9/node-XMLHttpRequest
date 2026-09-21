import assert from 'node:assert';
import path from 'node:path';
import getXMLHttpRequest from '../src/XMLHttpRequest.js';

// eslint-disable-next-line no-shadow -- Convenient
const __dirname = import.meta.dirname;

// 1. A relative (protocol-less) URL with no `basePath` configured falls back
//    to inspecting the call stack for a "user" file outside of
//    `node_modules` to resolve against. In this repo's own test suite,
//    nothing in the stack lives under `node_modules`, so the heuristic
//    can't identify a caller and resolves against the wrong directory --
//    exercising that fallback path (and its resulting file-read error)
//    rather than a successful load.
const DefaultXHR = getXMLHttpRequest();
const xhr1 = new DefaultXHR();
xhr1.addEventListener(
  'readystatechange',
  /**
   * @this {import('../src/XMLHttpRequest.js').LocalXMLHttpRequestInstance}
   * @returns {void}
   */
  function () {
    if (this.readyState === 4) {
      assert.equal(this.status, 503);
      runBasePathTests();
    }
  }
);
xhr1.open('GET', 'testdata.txt');
xhr1.send();

// 2. With an explicit `basePath`, resolution is immediate (no stack
//    inspection) and should succeed for a relative URL.
/**
 * @returns {void}
 */
function runBasePathTests () {
  const BasePathXHR = getXMLHttpRequest({basePath: __dirname});
  const xhr2 = new BasePathXHR();
  xhr2.addEventListener(
    'readystatechange',
    /**
     * @this {import('../src/XMLHttpRequest.js').LocalXMLHttpRequestInstance}
     * @returns {void}
     */
    function () {
      if (this.readyState === 4) {
        assert.equal(this.status, 200);
        assert.equal(this.responseText, 'Hello World');
        // A local (protocol-less/`file:`) read never populates
        //   `_response`, so there's no headers list -- matching how a
        //   real browser has no response headers to report for `file:`
        //   access either.
        assert.equal(this.getAllResponseHeaders(), '');
        runPostToLocalTest(BasePathXHR);
      }
    }
  );
  xhr2.open('GET', 'testdata.txt');
  xhr2.send();
}

// 3. Only `GET` is supported for local (protocol-less/`file:`) resources.
/**
 * @param {ReturnType<typeof getXMLHttpRequest>} BasePathXHR
 * @returns {void}
 */
function runPostToLocalTest (BasePathXHR) {
  const xhr3 = new BasePathXHR();
  xhr3.open('POST', 'testdata.txt');
  let threw = false;
  try {
    xhr3.send();
  } catch {
    threw = true;
  }
  assert.equal(threw, true);
  runSyncErrorTest();
}

// 4. A synchronous (`async: false`) request for a nonexistent `file:` URL
//    should route through the synchronous local error-handling branch.
/**
 * @returns {void}
 */
function runSyncErrorTest () {
  const XMLHttpRequest = getXMLHttpRequest();
  const xhr4 = new XMLHttpRequest();
  xhr4.open(
    'GET', 'file://' + path.join(__dirname, 'does-not-exist.txt'), false
  );
  xhr4.send();
  assert.equal(xhr4.status, 503);

  // eslint-disable-next-line no-console -- Testing
  console.log('done');
}
