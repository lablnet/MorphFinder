import { copyFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const directory = dirname(fileURLToPath(import.meta.url));

if (process.platform !== 'win32' && process.platform !== 'linux') {
  console.log('MorphNative Rust addon is for Windows/Linux; skipping native build.');
  process.exit(0);
}

const cargoCheck = spawnSync('cargo', ['--version'], { stdio: 'ignore' });
if (cargoCheck.status !== 0) {
  console.error('Rust Cargo is required to build native/windows-linux/MorphNative.node.');
  process.exit(1);
}

console.log('Building MorphNative Windows/Linux addon via Cargo...');
const buildResult = spawnSync('cargo', ['build', '--release'], {
  cwd: directory,
  stdio: 'inherit',
});

if (buildResult.status !== 0) {
  console.error('Rust native build failed.');
  process.exit(1);
}

const libraryName = process.platform === 'win32'
  ? 'morph_native_core.dll'
  : 'libmorph_native_core.so';
const built = join(directory, 'target', 'release', libraryName);

if (!existsSync(built)) {
  console.error(`Could not find compiled ${libraryName}`);
  process.exit(1);
}

const output = join(directory, 'MorphNative.node');
await mkdir(dirname(output), { recursive: true });
await copyFile(built, output);
const details = await stat(output);
console.log(`Built ${output} (${details.size} bytes)`);
