export default [
  {
    input: 'lib/XMLHttpRequest.js',
    external: [
      'node:http', 'node:https', 'node:path', 'node:child_process',
      'node:fs'
    ],
    output: {
      file: `dist/XMLHttpRequest.js`,
      format: 'cjs',
      sourcemap: true
    }
  }
];
