import { copyFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const directory = dirname(fileURLToPath(import.meta.url));

if (process.platform !== 'darwin') {
  console.log('MorphNative is macOS-only; skipping native build.');
  process.exit(0);
}

console.log('Building MorphNative via Swift Package Manager...');
const buildResult = spawnSync('swift', ['build', '-c', 'release', '-Xlinker', '-undefined', '-Xlinker', 'dynamic_lookup'], {
  cwd: directory,
  stdio: 'inherit',
});

if (buildResult.status !== 0) {
  console.error('Swift build failed.');
  process.exit(1);
}

const require = createRequire(import.meta.url);
const fs = require('node:fs');

function findDylib(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file === '.build' || file === 'release' || file.includes('-apple-macosx')) {
        const found = findDylib(fullPath);
        if (found) return found;
      }
    } else if (file === 'libMorphNative.dylib') {
      return fullPath;
    }
  }
  return null;
}

const built = findDylib(directory);
if (!built) {
  console.error('Could not find compiled libMorphNative.dylib');
  process.exit(1);
}

const output = join(directory, 'MorphNative.node');
await copyFile(built, output);
const details = await stat(output);
console.log(`Built ${output} (${details.size} bytes)`);
