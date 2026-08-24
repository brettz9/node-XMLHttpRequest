# CHANGES for `local-xmlhttprequest`

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
