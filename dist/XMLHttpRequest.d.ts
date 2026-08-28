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
import http from 'node:http';
export type LocalXMLHttpRequest = ReturnType<typeof localXMLHttpRequest>;
export type LocalXMLHttpRequestInstance = InstanceType<LocalXMLHttpRequest>;
export type Integer = number;
export type AnyResponse = any;
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
declare function localXMLHttpRequest(config?: {
    basePath?: string | false;
    baseURL?: string;
    resolveBlobURL?: (url: string) => {
        type: string;
        bytes: Buffer | string;
    } | undefined | null | false;
    readBlobSync?: (data: unknown) => {
        type: string;
        bytes: Buffer | string;
    } | undefined | null | false;
}): {
    new (): {
        /**
         * Private variables.
         */
        /**
         * @type {{
         *   async?: boolean,
         *   method?: string,
         *   url?: string,
         *   user?: string|null,
         *   password?: string|null
         * }}
         */
        _settings: {
            async?: boolean;
            method?: string;
            url?: string;
            user?: string | null;
            password?: string | null;
        };
        _disableHeaderCheck: boolean;
        /**
         * @type {Record<string, string|undefined>}
         */
        _headers: Record<string, string | undefined>;
        _sendFlag: boolean;
        _errorFlag: boolean;
        /** @type {Record<string, ((e?: Event) => AnyResponse)[]>} */
        _listeners: Record<string, ((e?: Event) => AnyResponse)[]>;
        /**
         * Constants.
         */
        UNSENT: number;
        OPENED: number;
        HEADERS_RECEIVED: number;
        LOADING: number;
        DONE: number;
        /**
         * Public vars.
         */
        readyState: number;
        onreadystatechange: any;
        responseText: string;
        responseXML: string;
        status: number | null | undefined;
        statusText: string | null;
        /**
         * Check if the specified header is allowed.
         *
         * @param {string} header
         * @returns {boolean} False if not allowed, otherwise true
         */
        _isAllowedHttpHeader(header: string): boolean;
        /**
         * Changes readyState and calls onreadystatechange.
         *
         * @param {Integer} state New state
         * @returns {void}
         */
        _setState(state: Integer): void;
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
        open(method: string, url: string, async?: boolean, user?: string, password?: string): void;
        /**
         * Disables or enables isAllowedHttpHeader() check the request. Enabled by
         *   default.
         * This does not conform to the W3C spec.
         *
         * @param {boolean} state Enable or disable header checking.
         * @returns {void}
         */
        setDisableHeaderCheck(state: boolean): void;
        /**
         * Sets a header for the request.
         *
         * @param {string} header Header name
         * @param {string} value Header value
         * @returns {void}
         */
        setRequestHeader(header: string, value: string): void;
        /**
         * Gets a header from the server response.
         *
         * @param {string} header Name of header to get.
         * @returns {string|null} Text of the header or null if it doesn't exist.
         */
        getResponseHeader(header: string): string | null;
        /**
         * Gets all the response headers.
         *
         * @returns {string} A string with all response headers separated by CR+LF
         */
        getAllResponseHeaders(): string;
        /**
         * Gets a request header.
         *
         * @param {string} name Name of header to get
         * @returns {string} Returns the request header or empty string if not set
         */
        getRequestHeader(name: string): string;
        /**
         * Sends the request to the server.
         *
         * @param {null|string|Buffer<ArrayBufferLike>} [data] Optional data to
         *   send as request body.
         * @returns {void}
         */
        send(data?: null | string | Buffer<ArrayBufferLike>): void;
        _response: http.IncomingMessage | {
            headers: Record<string, string>;
        } | undefined;
        _request: http.ClientRequest | null | undefined;
        /**
         * Called when an error is encountered to deal with it.
         * @param {Error} error
         * @returns {void}
         */
        handleError(error: Error): void;
        /**
         * Aborts a request.
         * @returns {void}
         */
        abort(): void;
        /**
         * Adds an event listener. Preferred method of binding to events.
         * @param {string} event
         * @param {(e?: Event) => AnyResponse} callback
         * @returns {void}
         */
        addEventListener(event: string, callback: (e?: Event) => AnyResponse): void;
        /**
         * Remove an event callback that has already been bound.
         * Only works on the matching funciton, cannot be a copy.
         * @param {string} event
         * @param {(e: Event) => AnyResponse} callback
         * @returns {void}
         */
        removeEventListener(event: string, callback: (e: Event) => AnyResponse): void;
        /**
         * Dispatch any events, including both "on" methods and events
         *  attached using `addEventListener`.
         * @param {"readystatechange"|"load"|"loadend"|"loadstart"} event
         * @returns {void}
         */
        dispatchEvent(event: "readystatechange" | "load" | "loadend" | "loadstart"): void;
    };
    UNSENT: number;
    OPENED: number;
    HEADERS_RECEIVED: number;
    LOADING: number;
    DONE: number;
};
export default localXMLHttpRequest;
//# sourceMappingURL=XMLHttpRequest.d.ts.map