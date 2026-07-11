import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const addon = require('../../native/macos/MorphNative.node');
const fixture = resolve('package.json');

assert.deepEqual(Object.keys(addon).sort(), ['getMetadata', 'getOpenWithApps', 'getThumbnail', 'setTags']);

const metadata = JSON.parse(addon.getMetadata(fixture));
assert.ok(Array.isArray(metadata.tags));
assert.ok(metadata.spotlightKind === null || typeof metadata.spotlightKind === 'string');

const applications = JSON.parse(addon.getOpenWithApps(fixture));
assert.ok(Array.isArray(applications));

const thumbnail = JSON.parse(addon.getThumbnail(fixture, 64, 64, 1));
assert.equal(thumbnail.width, 64);
assert.equal(thumbnail.height, 64);
assert.match(thumbnail.dataUrl, /^data:image\/png;base64,/);

console.log(`MorphNative smoke passed (${applications.length} Open With applications)`);
