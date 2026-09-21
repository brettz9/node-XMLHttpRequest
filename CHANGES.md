# CHANGES for `local-xmlhttprequest`

## 4.0.1

- fix: shared mutable headers — this._headers = defaultHeaders aliased one module-level object across every instance, so setRequestHeader on one XHR leaked into all others created afterward. Fixed to clone ({...defaultHeaders}).
- fix: Basic Auth with no password sent literally "user:null" instead of "user:", because open() normalizes an omitted password to null but send()'s default-to-'' check only tested for undefined.
- fix: The synchronous (async: false) request path over http/https always hung forever — the spawned helper process's options was double-JSON-stringified into a string (crashing the helper), a stray } broke its response-error handler, and the written status line was missing a comma the parser required (this.status always came out NaN).
- fix: Marked one genuinely dead branch (findLast always matches the outermost node:internal/... stack frame first, so its node_modules-detection branch can never run) with a documented c8 ignore rather than papering over it or risking a speculative behavioral rewrite.

## 4.0.0

- feat: native ESM
- feat: TypeScript

## 3.0.0

(Shouldn't be breaking, but didn't verify in detail.)

- feat: support blob:/relative-POST URLs
- feat: add missing constants and `response` property
- fix: response-handling bugs

## 2.0.0

- Update: Node APIs
- Breaking change: Exports method allowing config object (including
  basePath) to be passed in
- Enhancement: Expose public methods on `prototype` to allow monkey-patching
- Linting (Markdown): remarkrc
- Linting (ESLint): rc to specify node; lint demo; override new "standard" rule
- Docs: Add CHANGES.md
- npm: Add `package-lock.json` and `.npmignore`
- npm: Add license (MIT per original repo)
