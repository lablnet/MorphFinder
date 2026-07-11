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

const require = createRequire(import.meta.url);
const builder = require('node-swift');
const hasFullXcode = spawnSync('xcodebuild', ['-version'], { stdio: 'ignore' }).status === 0;
const config = {
  product: 'MorphNative',
  packagePath: directory,
  buildPath: join(directory, '.build'),
  napi: 8,
  static: true,
  ...(hasFullXcode
    ? {
        builder: {
          type: 'xcode',
          destinations: ['generic/platform=macOS'],
          settings: ['ARCHS=arm64 x86_64', 'ONLY_ACTIVE_ARCH=NO'],
        },
      }
    : {}),
};

process.chdir(directory);
await builder.clean(config);
await builder.build('release', config);

const built = join(directory, '.build', 'release', 'MorphNative.node');
const output = join(directory, 'MorphNative.node');
await copyFile(built, output);
const details = await stat(output);
console.log(`Built ${output} (${details.size} bytes)`);
