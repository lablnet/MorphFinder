import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = dirname(fileURLToPath(import.meta.url));

const script = process.platform === 'darwin'
  ? join(directory, 'macos', 'build.mjs')
  : process.platform === 'win32' || process.platform === 'linux'
    ? join(directory, 'windows-linux', 'build.mjs')
    : null;

if (script === null) {
  console.log(`No MorphNative build is configured for ${process.platform}; skipping.`);
  process.exit(0);
}

const result = spawnSync(process.execPath, [script], { stdio: 'inherit' });
process.exit(result.status ?? 1);
