'use strict';

var http = require('node:http');
var https = require('node:https');
var path = require('node:path');
var node_child_process = require('node:child_process');
var fs = require('node:fs');

/* eslint-disable n/no-sync, n/prefer-promises/fs -- Polyfilling sync API */
/**
 * Wrapper for built-in http.js to emulate the browser XMLHttpRequest object.
 *
 * This can be used with JS designed for browsers to improve reuse of code and
 * allow the use of existing libraries.
 *
 * Usage: include("XMLHttpRequest.js") and use XMLHttpRequest per W3C specs.
 *
 * @author Dan DeFelippi <dan@driverdan.com>
 * @author David Ellis <d.f.ellis@ieee.org>
 * @license MIT
 */


// eslint-disable-next-line no-shadow -- Convenient
const __dirname$1 = undefined;

/**
 * @typedef {ReturnType<typeof localXMLHttpRequest>} LocalXMLHttpRequest
 */

/**
 * @typedef {InstanceType<LocalXMLHttpRequest>} LocalXMLHttpRequestInstance
 */

/**
 * @typedef {number} Integer
 */

/* eslint-disable jsdoc/reject-any-type -- For user */
/**
 * @typedef {any} AnyResponse
 */
/* eslint-enable jsdoc/reject-any-type -- For user */

// Set some default headers
const defaultHeaders = {
  'User-Agent': 'node-XMLHttpRequest',
  Accept: '*/*'
};

// These headers are not user setable.
// The following are allowed but banned in the spec:
// * user-agent
const forbiddenRequestHeaders = [
  'accept-charset',
  'accept-encoding',
  'access-control-request-headers',
  'access-control-request-method',
  'connection',
  'content-length',
  'content-transfer-encoding',
  'cookie',
  'cookie2',
  'date',
  'expect',
  'host',
  'keep-alive',
  'origin',
  'referer',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'via'
];

// These request methods are not allowed
const forbiddenRequestMethods = [
  'TRACE',
  'TRACK',
  'CONNECT'
];

/**
 * Check if the specified method is allowed.
 *
 * @param {string} method Request method to validate
 * @returns {boolean} False if not allowed, otherwise true
 */
const isAllowedHttpMethod = (method) => {
  return Boolean(method && !forbiddenRequestMethods.includes(method));
};

/**
 * A minimal, non-deprecated stand-in for the legacy `url.parse()`. Like
 * `url.parse()` (but unlike `new URL()`), it never throws: a relative or
 * protocol-less string -- a bare local path, or a redirect `Location`
 * header that omits the origin -- comes back with only `pathname`/
 * `search`/`path` populated and `protocol`/`hostname`/`port` left
 * `undefined`, which is what lets callers below detect "no protocol" and
 * fall through to the local-file handling, or -- for redirects -- keep
 * working (if imperfectly) against an unset host the way this module
 * always has.
 *
 * @param {string} urlString
 * @returns {{
 *   protocol: (string|undefined),
 *   hostname: (string|undefined),
 *   port: (string|undefined),
 *   pathname: string,
 *   search: string,
 *   path: string
 * }}
 */
function parseUrl (urlString) {
  try {
    const {protocol, hostname, port, pathname, search} = new URL(urlString);
    return {
      protocol, hostname, port, pathname, search, path: pathname + search
    };
  } catch {
    const [pathname, search = ''] = urlString.split(/(?=\?)/v, 2);
    return {
      protocol: undefined, hostname: undefined, port: undefined,
      pathname, search, path: pathname + search
    };
  }
}

/* eslint-disable jsdoc/require-returns -- Let TS handle */
/**
 * @param {{
 *   basePath?: string|false,
 *   baseURL?: string,
 *   resolveBlobURL?: (url: string) =>
 *     {type: string, bytes: Buffer|string}|undefined|null|false,
 *   readBlobSync?: (data: unknown) =>
 *     {type: string, bytes: Buffer|string}|undefined|null|false
 * }} [config]
 */
function localXMLHttpRequest (config) {
  /* eslint-enable jsdoc/require-returns -- Let TS handle */
  const cfg = config || {};

  /**
   *
   */
  class XMLHttpRequest {
    // Per spec, these readyState constants live on the constructor itself
    //   (as well as on each instance, set in the constructor above) --
    //   test code commonly checks against the static form, e.g.
    //   `xhr.readyState !== XMLHttpRequest.DONE`.
    static UNSENT = 0;
    static OPENED = 1;
    static HEADERS_RECEIVED = 2;
    static LOADING = 3;
    static DONE = 4;

    /**
     *
     */
    constructor () {
      /**
       * Private variables.
       */

      // Holds http.js objects
      // this._request;
      // this._response;

      /**
       * @type {{
       *   async?: boolean,
       *   method?: string,
       *   url?: string,
       *   user?: string|null,
       *   password?: string|null
       * }}
       */
      this._settings = {};

      // Disable header blacklist.
      // Not part of XHR specs.
      this._disableHeaderCheck = false;

      /**
       * @type {Record<string, string|undefined>}
       */
      this._headers = defaultHeaders;

      // Send flag
      this._sendFlag = false;
      // Error flag, used when errors occur or abort is called
      this._errorFlag = false;

      // Event listeners
      /** @type {Record<string, ((e?: Event) => AnyResponse)[]>} */
      this._listeners = {};

      /**
       * Constants.
       */

      this.UNSENT = 0;
      this.OPENED = 1;
      this.HEADERS_RECEIVED = 2;
      this.LOADING = 3;
      this.DONE = 4;

      /**
       * Public vars.
       */

      // Current state
      this.readyState = this.UNSENT;

      // default ready state change handler in case one is not set or is
      //   set late
      // eslint-disable-next-line unicorn/prefer-add-event-listener -- API
      this.onreadystatechange = null;

      // Result & response
      this.responseText = '';
      this.responseXML = '';
      this.status = null;
      this.statusText = null;

      /**
       * Private methods.
       */
    }

    /**
     * Check if the specified header is allowed.
     *
     * @param {string} header
     * @returns {boolean} False if not allowed, otherwise true
     */
    _isAllowedHttpHeader (header) {
      return this._disableHeaderCheck ||
        Boolean(
          header && !forbiddenRequestHeaders.includes(header.toLowerCase())
        );
    }

    /**
     * Changes readyState and calls onreadystatechange.
     *
     * @param {Integer} state New state
     * @returns {void}
     */
    _setState (state) {
      if (state === this.LOADING || this.readyState !== state) {
        this.readyState = state;

        if (this._settings.async ||
            this.readyState < this.OPENED || this.readyState === this.DONE) {
          this.dispatchEvent('readystatechange');
        }

        if (this.readyState === this.DONE && !this._errorFlag) {
          this.dispatchEvent('load');
          // @TODO figure out InspectorInstrumentation::didLoadXHR(cookie)
          this.dispatchEvent('loadend');
        }
      }
    }

    /**
     * Public methods.
     */

    /**
     * Open the connection. Currently supports local server requests.
     *
     * @param {string} method method Connection method (eg GET, POST)
     * @param {string} url url URL for the connection.
     * @param {boolean} [async] Asynchronous connection. Default is true.
     * @param {string} [user] Username for basic authentication
     * @param {string} [password] Password for basic authentication
     * @returns {void}
     */
    open (method, url, async, user, password) {
      this.abort();
      this._errorFlag = false;

      // Check for valid request method
      if (!isAllowedHttpMethod(method)) {
        throw new Error('SecurityError: Request method not allowed');
      }

      this._settings = {
        method,
        url: url.toString(),
        async: (typeof async !== 'boolean' ? true : async),
        user: user || null,
        password: password || null
      };

      this._setState(this.OPENED);
    }

    /**
     * Disables or enables isAllowedHttpHeader() check the request. Enabled by
     *   default.
     * This does not conform to the W3C spec.
     *
     * @param {boolean} state Enable or disable header checking.
     * @returns {void}
     */
    setDisableHeaderCheck (state) {
      this._disableHeaderCheck = state;
    }

    /**
     * Sets a header for the request.
     *
     * @param {string} header Header name
     * @param {string} value Header value
     * @returns {void}
     */
    setRequestHeader (header, value) {
      if (this.readyState !== this.OPENED) {
        throw new Error(
          'INVALID_STATE_ERR: setRequestHeader can only be ' +
            'called when state is OPEN'
        );
      }
      if (!this._isAllowedHttpHeader(header)) {
        // eslint-disable-next-line no-console -- Feedback
        console.warn('Refused to set unsafe header "' + header + '"');
        return;
      }
      if (this._sendFlag) {
        throw new Error('INVALID_STATE_ERR: send flag is true');
      }
      this._headers[header] = value;
    }

    /**
     * Gets a header from the server response.
     *
     * @param {string} header Name of header to get.
     * @returns {string|null} Text of the header or null if it doesn't exist.
     */
    getResponseHeader (header) {
      if (typeof header === 'string' &&
        this.readyState > this.OPENED &&
        this._response &&
        this._response.headers &&
        Object.hasOwn(this._response.headers, header.toLowerCase()) &&
        !this._errorFlag
      ) {
        return /** @type {string|null} */ (
          this._response.headers[header.toLowerCase()]
        );
      }

      return null;
    }

    /**
     * Gets all the response headers.
     *
     * @returns {string} A string with all response headers separated by CR+LF
     */
    getAllResponseHeaders () {
      if (this.readyState < this.HEADERS_RECEIVED || this._errorFlag) {
        return '';
      }
      let result = '';

      // eslint-disable-next-line @stylistic/max-len -- Long
      // eslint-disable-next-line unicorn/no-unreadable-for-of-expression -- Readable
      for (const [i, header] of Object.entries(this._response?.headers ?? {})) {
        // Cookie headers are excluded
        if (i !== 'set-cookie' && i !== 'set-cookie2') {
          result += i + ': ' + header + '\r\n';
        }
      }
      return result.slice(0, Math.max(0, result.length - 2));
    }

    /**
     * Gets a request header.
     *
     * @param {string} name Name of header to get
     * @returns {string} Returns the request header or empty string if not set
     */
    getRequestHeader (name) {
      // @TODO Make this case insensitive
      if (typeof name === 'string' && Object.hasOwn(this._headers, name)) {
        return /** @type {string} */ (this._headers[name]);
      }

      return '';
    }

    /**
     * Sends the request to the server.
     *
     * @param {null|string|Buffer<ArrayBufferLike>} [data] Optional data to
     *   send as request body.
     * @returns {void}
     */
    send (data) {
      if (this.readyState !== this.OPENED) {
        throw new Error(
          'INVALID_STATE_ERR: connection must be opened before send() is called'
        );
      }

      if (this._sendFlag) {
        throw new Error('INVALID_STATE_ERR: send has already been called');
      }

      // This module has no concept of `Blob`/`File` itself (which
      //   implementation is in play varies by environment), so a `Blob`/
      //   `File` request body is read via a `cfg.readBlobSync(data)`
      //   callback the consumer supplies -- returning `{type, bytes}`, or a
      //   falsy value if `data` isn't one it recognizes (left as-is below).
      if (data && cfg.readBlobSync) {
        const blob = cfg.readBlobSync(data);
        if (blob) {
          if (!this._headers['Content-Type'] && blob.type) {
            this._headers['Content-Type'] = blob.type;
          }
          data = blob.bytes;
        }
      }

      let ssl = false, local = false, blobURL = false;
      let url =
        /**
         * @type {Partial<ReturnType<typeof parseUrl>> &
         *   Required<Pick<Partial<ReturnType<typeof parseUrl>>, "pathname">>}
         */ (
          parseUrl(/** @type {string} */ (this._settings.url))
        );
      let host;

      // A protocol-less (relative) URL normally means "read this path off
      //   the local filesystem" (see the `undefined`/`null`/`''` case below)
      //   -- a deliberate shortcut for reading static test resources without
      //   a server round-trip. That can't work for anything but a GET,
      //   though (there's no such thing as "POSTing" to a file on disk), so
      //   when the method isn't GET and the consumer has supplied a real
      //   server origin via `cfg.baseURL`, resolve against that instead and
      //   let it fall through to the normal http/https handling below.
      if (
        ((!('protocol' in url)) || !url.protocol) &&
        this._settings.method !== 'GET' && cfg.baseURL
      ) {
        url = parseUrl(new URL(
          /** @type {string} */ (this._settings.url),
          cfg.baseURL
        ).href);
      }

      const getStack = () => {
        const orig = Error.prepareStackTrace;
        Error.prepareStackTrace = (_, stack) => {
          return stack;
        };
        // eslint-disable-next-line @stylistic/max-len -- Long
        // eslint-disable-next-line unicorn/error-message -- This is a stack trace
        const err = new Error();
        // // eslint-disable-next-line no-caller -- This is a stack trace
        // Error.captureStackTrace(err, arguments.callee);
        const {stack} = err;
        Error.prepareStackTrace = orig;
        return /** @type {NodeJS.CallSite[]} */ (
          /** @type {unknown} */
          (stack)
        );
      };

      // Determine the server
      switch (/** @type {unknown} */ (url.protocol)) {
      case 'https:':
        ssl = true;
        // SSL & non-SSL both need host, no break here.
        /* falls through */
      case 'http:':
        host = url.hostname;
        break;

      case 'file:':
        local = true;
        break;

      case 'blob:':
        blobURL = true;
        break;

      case undefined:
      case null:
      case '': {
        // `getStack()` temporarily overrides the process-global
        //   `Error.prepareStackTrace` -- only pay that cost (and its small
        //   risk of colliding with some other code's lazy `.stack` access
        //   during the same tick) when `cfg.basePath` isn't already given,
        //   since its result would otherwise go unused.
        const basePath = cfg.basePath ||
          // eslint-disable-next-line @stylistic/wrap-iife -- Why not?
          (function () {
            const dir = getStack().findLast((item) => {
              const filename = /** @type {string} */ (item.getFileName());
              const idx = filename.search(/[\/\\]node_modules[\/\\]/v);
              // Should be a user file, as a node executable like nodeunit
              //   ought to have node_modules in the path
              if (idx === -1) {
                return true;
              }
              // Should be a user file because its last "node_modules"
              //   contains this XMLHttpRequest file (i.e., XMLHttpRequest
              //   is a dependency of some kind)
              return __dirname$1.includes(filename.slice(0, idx));
            })?.getFileName();
            return path.dirname(/** @type {string} */ (dir));
          })();
          // We should support this instead if the config were relative to URL
          // var pathName = new URL(this._settings.url, basePath).pathname;

        const pathName = path.resolve(
          basePath,
          /** @type {string} */
          (this._settings.url)
        );
        url = {pathname: pathName};
        local = true;
        break;
      } default:
        throw new Error('Protocol not supported.');
      }

      // Load files off the local filesystem (file://)
      if (local) {
        if (this._settings.method !== 'GET') {
          throw new Error('XMLHttpRequest: Only GET method is supported');
        }

        if (this._settings.async) {
          // eslint-disable-next-line @stylistic/max-len -- Long
          // eslint-disable-next-line promise/prefer-await-to-callbacks -- Sync API
          fs.readFile(url.pathname, 'utf8', (error, dta) => {
            if (error) {
              this.handleError(error);
            } else {
              this.status = 200;
              this.responseText = dta;
              this._setState(this.DONE);
            }
          });
        } else {
          try {
            this.responseText = fs.readFileSync(url.pathname, 'utf8');
            this.status = 200;
            this._setState(this.DONE);
          } catch (e) {
            this.handleError(/** @type {Error} */ (e));
          }
        }

        return;
      }

      // Serve `blob:` URLs (created via `URL.createObjectURL`) the way a
      //   browser would -- synchronously, without going over the network.
      //   This module has no concept of a `Blob`/`URL.createObjectURL`
      //   registry itself, so it defers to a `cfg.resolveBlobURL(url)`
      //   callback the consumer supplies (returning `{type, bytes}`, or a
      //   falsy value if `url` isn't a `blob:` URL it recognizes).
      if (blobURL) {
        if (this._settings.method !== 'GET') {
          throw new Error(
            'XMLHttpRequest: Only GET method is supported for blob: URLs'
          );
        }

        /**
         * @returns {void}
         */
        const respondWithBlob = () => {
          const resolved = cfg.resolveBlobURL &&
            cfg.resolveBlobURL(/** @type {string} */ (this._settings.url));
          if (!resolved) {
            this.handleError(new Error('Failed to load ' + this._settings.url));
            return;
          }
          this._response = {
            headers: /** @type {Record<string, string>} */ ({
              'content-type': resolved.type || ''
            })
          };
          this.status = 200;
          this.responseText = Buffer.isBuffer(resolved.bytes)
            ? resolved.bytes.toString('binary')
            : resolved.bytes;
          this._setState(this.HEADERS_RECEIVED);
          this._setState(this.DONE);
        };

        if (this._settings.async) {
          queueMicrotask(respondWithBlob);
        } else {
          respondWithBlob();
        }

        return;
      }

      // Default to port 80. If accessing localhost on another port be sure
      // to use http://localhost:port/path
      const port = url.port || (ssl ? 443 : 80);
      // Add query string if one is used
      const uri = url.pathname + (url.search || '');

      // Set the Host header or the server may reject the request
      this._headers.Host = host;
      if (!(port === 80 || (ssl && port === 443))) {
        this._headers.Host += ':' + url.port;
      }

      // Set Basic Auth if necessary
      if (this._settings.user) {
        if (this._settings.password === undefined) {
          this._settings.password = '';
        }
        const authBuf = Buffer.from(
          this._settings.user + ':' + this._settings.password
        );
        this._headers.Authorization = 'Basic ' + authBuf.toString('base64');
      }

      // Set content length header
      if (this._settings.method === 'GET' || this._settings.method === 'HEAD') {
        data = null;
      } else if (data) {
        this._headers['Content-Length'] = String(Buffer.isBuffer(data)
          ? data.length
          : Buffer.byteLength(data));

        if (!this._headers['Content-Type']) {
          this._headers['Content-Type'] = 'text/plain;charset=UTF-8';
        }
      } else if (this._settings.method === 'POST') {
        // For a post with no data set Content-Length: 0.
        // This is required by buggy servers that don't meet the specs.
        this._headers['Content-Length'] = '0';
      }

      const options = {
        host,
        port,
        path: uri,
        method: this._settings.method,
        headers: this._headers,
        agent: false
      };

      /** @type {typeof https.request | typeof http.request} */
      let doRequest;

      // Reset error flag
      this._errorFlag = false;

      // Error handler for the request
      /**
       * @param {Error} error
       */
      const errorHandler = (error) => {
        this.handleError(error);
      };

      /**
       * Handler for the response
       * Called directly as a plain callback by `http(s).request` (not bound
       * to the XHR instance), so it must reference `self` -- a stray
       * `this` here would silently read/write the wrong object.
       * @type {(res: http.IncomingMessage) => void}
       */
      const responseHandler = (resp) => {
        // Set response var to the response we got back
        // This is so it remains accessable outside this scope
        this._response = resp;
        // Check for redirect
        // @TODO Prevent looped redirects
        if ([301, 302, 303, 307].includes(Number(this._response.statusCode))) {
          // Change URL to the redirect location
          this._settings.url = this._response.headers.location;
          url = parseUrl(/** @type {string} */ (this._settings.url));
          // Set host var in case it's used later
          host = url.hostname;
          // Options for the new request
          const newOptions = {
            hostname: url.hostname,
            port: url.port,
            path: url.path,
            method: this._response.statusCode === 303
              ? 'GET'
              : this._settings.method,
            headers: this._headers
          };

          // Issue the new request
          this._request = doRequest(
            newOptions, responseHandler
          ).on('error', errorHandler);
          this._request.end();
          // @TODO Check if an XHR event needs to be fired here
          return;
        }

        this._response.setEncoding('utf8');

        this._setState(this.HEADERS_RECEIVED);
        this.status = this._response.statusCode;

        this._response.on('data', (chunk) => {
          // Make sure there's some data
          if (chunk) {
            this.responseText += chunk;
          }
          // Don't emit state changes if the connection has been aborted.
          if (this._sendFlag) {
            this._setState(this.LOADING);
          }
        });

        this._response.on('end', () => {
          if (this._sendFlag) {
            // Discard the 'end' event if the connection has been aborted
            this._setState(this.DONE);
            this._sendFlag = false;
          }
        });

        this._response.on('error', (error) => {
          this.handleError(error);
        });
      };

      // Handle async requests
      if (this._settings.async) {
        // Use the proper protocol
        doRequest = ssl ? https.request : http.request;

        // Request is being sent, set send flag
        this._sendFlag = true;

        // As per spec, this is called here for historical reasons.
        this.dispatchEvent('readystatechange');

        // Create the request
        this._request = doRequest(
          options, responseHandler
        ).on('error', errorHandler);

        // Node 0.4 and later won't accept empty data. Make sure it's needed.
        if (data) {
          this._request.write(data);
        }

        this._request.end();

        this.dispatchEvent('loadstart');
      } else { // Synchronous
        // Create a temporary file for communication with the other Node process
        const contentFile = '.node-xmlhttprequest-content-' + process.pid;
        const syncFile = '.node-xmlhttprequest-sync-' + process.pid;
        fs.writeFileSync(syncFile, '', 'utf8');
        // The async request the other Node process executes
        const execString = `
import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';

const doRequest = http${ssl ? 's' : ''}.request;
const options = '${JSON.stringify(options)}';

let responseText = '';
const req = doRequest(options, function (response) {
  response.setEncoding('utf8');

  response.on('data', function (chunk) {
    responseText += chunk;
  });

  response.on('end', function () {
    fs.writeFileSync(
      '${contentFile}',
      'NODE-XMLHTTPREQUEST-STATUS:' + response.statusCode +
        responseText,
      'utf8'
    );
    fs.unlinkSync('${syncFile}');
  });
  response.on('error', function(error) {
    fs.writeFileSync(
      '${contentFile}',
      'NODE-XMLHTTPREQUEST-ERROR:' + JSON.stringify(error)},
      'utf8'
    );
    fs.unlinkSync('${syncFile}');
  });
}).on('error', function(error) {
  fs.writeFileSync(
    '${contentFile}',
    'NODE-XMLHTTPREQUEST-ERROR:' + JSON.stringify(error),
    'utf8'
  );
  fs.unlinkSync('${syncFile}');
});
${(data
    ? `req.write('${JSON.stringify(data).slice(
      1, -1
    ).replaceAll("'", String.raw`\'`)}');`
    : ''
  )}
req.end();
`;
        // Start the other Node Process, executing this string
        const syncProc = node_child_process.spawn(process.argv[0], ['-e', execString]);
        while (fs.existsSync(syncFile)) {
          // Wait while the sync file is empty
        }
        this.responseText = fs.readFileSync(contentFile, 'utf8');
        // Kill the child process once the file has data
        syncProc.stdin.end();
        // Remove the temporary file
        fs.unlinkSync(contentFile);
        if ((this.responseText).startsWith('NODE-XMLHTTPREQUEST-ERROR:')) {
          // If the file returned an error, handle it
          const errorObj = new Error(
            this.responseText.replace(/^NODE-XMLHTTPREQUEST-ERROR:/v, '')
          );
          this.handleError(errorObj);
        } else {
          // If the file returned okay, parse its data and move to the
          //   DONE state
          this.status = Number(
            // eslint-disable-next-line prefer-named-capture-group -- Convenient
            this.responseText.replace(/^NODE-XMLHTTPREQUEST-STATUS:(\d*),.*/v, '$1')
          );
          this.responseText = this.responseText.replace(
            // eslint-disable-next-line prefer-named-capture-group -- Convenient
            /^NODE-XMLHTTPREQUEST-STATUS:\d*,(.*)/v, '$1'
          );
          this._setState(this.DONE);
        }
      }
    }

    /**
     * Called when an error is encountered to deal with it.
     * @param {Error} error
     * @returns {void}
     */
    handleError (error) {
      this.status = 503;
      this.statusText = error.message;
      this.responseText = /** @type {string} */ (error.stack);
      this._errorFlag = true;
      this._setState(this.DONE);
    }

    /**
     * Aborts a request.
     * @returns {void}
     */
    abort () {
      if (this._request) {
        this._request.abort();
        this._request = null;
      }

      this._headers = defaultHeaders;
      this.responseText = '';
      this.responseXML = '';

      this._errorFlag = true;

      if (this.readyState !== this.UNSENT &&
          (this.readyState !== this.OPENED || this._sendFlag) &&
          this.readyState !== this.DONE) {
        this._sendFlag = false;
        this._setState(this.DONE);
      }
      this.readyState = this.UNSENT;
    }

    /* eslint-disable promise/prefer-await-to-callbacks -- API */
    /**
     * Adds an event listener. Preferred method of binding to events.
     * @param {string} event
     * @param {(e?: Event) => AnyResponse} callback
     * @returns {void}
     */
    addEventListener (event, callback) {
      /* eslint-enable promise/prefer-await-to-callbacks -- API */
      if (!(Object.hasOwnProperty.call(this._listeners, event))) {
        this._listeners[event] = [];
      }
      // Currently allows duplicate callbacks. Should it?
      this._listeners[event].push(callback);
    }

    /* eslint-disable promise/prefer-await-to-callbacks -- API */
    /**
     * Remove an event callback that has already been bound.
     * Only works on the matching funciton, cannot be a copy.
     * @param {string} event
     * @param {(e: Event) => AnyResponse} callback
     * @returns {void}
     */
    removeEventListener (event, callback) {
      /* eslint-enable promise/prefer-await-to-callbacks -- API */
      if (Object.hasOwnProperty.call(this._listeners, event)) {
        // Filter will return a new array with the callback removed
        this._listeners[event] = this._listeners[event].filter((ev) => {
          return ev !== callback;
        });
      }
    }

    /**
     * Dispatch any events, including both "on" methods and events
     *  attached using `addEventListener`.
     * @param {"readystatechange"|"load"|"loadend"|"loadstart"} event
     * @returns {void}
     */
    dispatchEvent (event) {
      if (
        [
          'readystatechange', 'load', 'loadend', 'loadstart'
        ].includes(event) &&
        // @ts-expect-error -- Safe now
        typeof this['on' + event] === 'function'
      ) {
        // @ts-expect-error -- Safe now
        this['on' + event]();
      }
      let i, len;
      if (Object.hasOwn(this._listeners, event)) {
        for (i = 0, len = this._listeners[event].length; i < len; i++) {
          this._listeners[event][i].call(this);
        }
      }
    }
  }

  // `response` is spec'd to reflect `responseType`; this module only ever
  //   populates `responseText` (no `arraybuffer`/`blob`/`json` support), so
  //   `response` mirrors it -- matching the default (`""`/`"text"`)
  //   `responseType` behavior real browsers use.
  Object.defineProperty(XMLHttpRequest.prototype, 'response', {
    enumerable: true,
    configurable: true,
    get () {
      return this.responseText;
    }
  });

  return XMLHttpRequest;
}

module.exports = localXMLHttpRequest;
//# sourceMappingURL=XMLHttpRequest.cjs.map
