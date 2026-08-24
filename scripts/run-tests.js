'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const testsDir = path.join(__dirname, '..', 'tests');

const testFiles = fs.readdirSync(testsDir).
  filter((file) => file.startsWith('test-') && file.endsWith('.js')).
  sort();

let failures = 0;

for (const file of testFiles) {
  const filePath = path.join(testsDir, file);
  console.log(`\n--- ${file} ---`);
  const {status} = spawnSync(process.execPath, [filePath], {stdio: 'inherit'});
  if (status !== 0) {
    failures++;
    console.error(`FAILED: ${file}`);
  }
}

console.log(`\n${testFiles.length - failures}/${testFiles.length} test files passed.`);

if (failures > 0) {
  process.exitCode = 1;
}
