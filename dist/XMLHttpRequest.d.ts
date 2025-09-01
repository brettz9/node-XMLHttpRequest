declare namespace _exports {
    export { Integer };
}
declare function _exports(cfg?: {
    basePath?: string | false;
}): {
    new (): {
        /**
         * Private variables.
         */
        _request: http.ClientRequest | null | undefined;
        /** @type {http.IncomingMessage|undefined} */
        _response: http.IncomingMessage | undefined;
        /**
         * @type {{
         *   method?: string,
         *   url?: string,
         *   async?: boolean,
         *   user?: string|null,
         *   password?: string|null
         * }}
         */
        _settings: {
            method?: string;
            url?: string;
            async?: boolean;
            user?: string | null;
            password?: string | null;
        };
        _disableHeaderCheck: boolean;
        _headers: http.OutgoingHttpHeaders;
        _sendFlag: boolean;
        _errorFlag: boolean;
        /** @type {{[key: string]: ((e?: Event) => any)[]}} */
        _listeners: {
            [key: string]: ((e?: Event) => any)[];
        };
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
        /** @type {(() => void)|null} */
        onreadystatechange: (() => void) | null;
        responseText: string;
        responseXML: string;
        status: number | null;
        statusText: Error | null;
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
         * @param {boolean} async Asynchronous connection. Default is true.
         * @param {string} user Username for basic authentication (optional)
         * @param {string} password Password for basic authentication (optional)
         */
        open(method: string, url: string, async: boolean, user: string, password: string): void;
        /**
         * Disables or enables isAllowedHttpHeader() check the request. Enabled by default.
         * This does not conform to the W3C spec.
         *
         * @param {boolean} state Enable or disable header checking.
         */
        setDisableHeaderCheck(state: boolean): void;
        /**
         * Sets a header for the request.
         *
         * @param {string} header Header name
         * @param {string} value Header value
         */
        setRequestHeader(header: string, value: string): void;
        /**
         * Gets a header from the server response.
         *
         * @param {string} header Name of header to get.
         * @returns {string|string[]|null|undefined} Text of the header or null if it doesn't exist.
         */
        getResponseHeader(header: string): string | string[] | null | undefined;
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
         * @returns {string|number|string[]} Returns the request header or empty string if not set
         */
        getRequestHeader(name: string): string | number | string[];
        /**
         * Sends the request to the server.
         *
         * @param {string|null} data Optional data to send as request body.
         */
        send(data: string | null): void;
        /**
         * Called when an error is encountered to deal with it.
         * @param {Error} error
         */
        handleError(error: Error): void;
        /**
         * Aborts a request.
         */
        abort(): void;
        /**
         * Adds an event listener. Preferred method of binding to events.
         * @param {string} event
         * @param {(e?: Event) => any} callback
         */
        addEventListener(event: string, callback: (e?: Event) => any): void;
        /**
         * Remove an event callback that has already been bound.
         * Only works on the matching function, cannot be a copy.
         * @param {string} event
         * @param {(e: Event) => any} callback
         */
        removeEventListener(event: string, callback: (e: Event) => any): void;
        /**
         * Dispatch any events, including both "on" methods and events attached using addEventListener.
         * @param {"readystatechange"|"load"|"loadend"|"loadstart"} event
         */
        dispatchEvent(event: "readystatechange" | "load" | "loadend" | "loadstart"): void;
    };
};
export = _exports;
type Integer = number;
import http = require("http");
//# sourceMappingURL=XMLHttpRequest.d.ts.map