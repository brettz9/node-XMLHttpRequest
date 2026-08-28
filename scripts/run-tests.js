/* eslint-disable n/no-sync -- Build only */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

// eslint-disable-next-line no-shadow -- Convenient
const __dirname = import.meta.dirname;

const testsDir = path.join(__dirname, '..', 'tests');

const testFiles = fs.readdirSync(testsDir).
  filter((file) => file.startsWith('test-') && file.endsWith('.js')).
  toSorted((a, b) => a.localeCompare(b));

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

console.log(
  `\n${testFiles.length - failures}/${testFiles.length} test files passed.`
);

if (failures > 0) {
  process.exitCode = 1;
}
