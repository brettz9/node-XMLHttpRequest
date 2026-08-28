export default [
  {
    input: 'src/XMLHttpRequest.js',
    external: [
      'node:http', 'node:https', 'node:path', 'node:child_process',
      'node:fs'
    ],
    output: {
      file: `dist/XMLHttpRequest.cjs`,
      format: 'cjs',
      sourcemap: true
    }
  }
];
