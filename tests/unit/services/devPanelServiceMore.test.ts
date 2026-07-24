import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isValidDevScript, scanProject } from '../../../src/main/services/devPanelService';

vi.mock('../../../src/main/services/gitService', () => ({
  getGitStatus: vi.fn(async () => ({
    isRepo: true,
    branch: 'main',
    statusMap: { 'src/index.ts': 'modified' },
  })),
}));

let root: string;

async function createFixture(name: string): Promise<string> {
  const dir = join(root, name);
  await mkdir(dir, { recursive: true });
  return dir;
}

describe('dev panel service scanners', () => {
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'morph-dev-panel-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('scans Node projects with env files, lockfiles, dependency warnings, and health checks', async () => {
    const dir = await createFixture('node-app');
    await writeFile(join(dir, 'pnpm-lock.yaml'), 'lockfileVersion: 9');
    await writeFile(join(dir, '.env'), 'API_TOKEN="secret"\nEMPTY\n# comment\n');
    await writeFile(join(dir, '.env.example'), 'API_TOKEN=\nMISSING_KEY=\n');
    await writeFile(join(dir, 'package.json'), JSON.stringify({
      name: 'node-app',
      version: '1.2.3',
      description: 'demo',
      license: 'MIT',
      engines: { node: '>=20' },
      scripts: { dev: 'vite', test: 'vitest' },
      dependencies: { react: 'latest', localpkg: 'workspace:*' },
      devDependencies: { vitest: '^3.0.0' },
    }));

    const info = await scanProject(dir);
    expect(info).toMatchObject({
      hasProject: true,
      projectType: 'node',
      name: 'node-app',
      version: '1.2.3',
      packageManager: 'pnpm',
      gitBranch: 'main',
      gitIsDirty: true,
    });
    expect(info.scripts.map((script) => script.name)).toEqual(['dev', 'test']);
    expect(info.envVars).toEqual([
      { key: 'API_TOKEN', value: 'secret' },
      { key: 'EMPTY', value: '' },
    ]);
    expect(info.envChecklist).toEqual([
      { key: 'API_TOKEN', present: true, source: '.env.example' },
      { key: 'MISSING_KEY', present: false, source: '.env.example' },
    ]);
    expect(info.dependencyWarnings.map((warning) => warning.packageName)).toEqual(['react', 'localpkg']);
    expect(info.healthChecks.some((check) => check.id === 'env' && check.status === 'fail')).toBe(true);
  });

  it('scans Rust, Python, Go, Dart, and TypeScript-only manifests', async () => {
    const rust = await createFixture('rust-app');
    await writeFile(join(rust, 'Cargo.lock'), '');
    await writeFile(join(rust, 'Cargo.toml'), '[package]\nname = "rust-app"\nversion = "0.1.0"\nrust-version = "1.80"\n[dependencies]\nserde = "1"\n[dev-dependencies]\ninsta = "1"\n');
    expect(await scanProject(rust)).toMatchObject({ projectType: 'rust', name: 'rust-app', packageManager: 'cargo' });

    const python = await createFixture('python-app');
    await writeFile(join(python, 'poetry.lock'), '');
    await writeFile(join(python, 'pyproject.toml'), '[project]\nname = "python-app"\nversion = "0.2.0"\ndescription = "py"\n');
    await writeFile(join(python, 'requirements.txt'), 'requests>=2\n# skip\npytest\n');
    const pyInfo = await scanProject(python);
    expect(pyInfo).toMatchObject({ projectType: 'python', name: 'python-app', packageManager: 'poetry' });
    expect(pyInfo.dependencies.map((dep) => dep.name)).toEqual(['requests', 'pytest']);

    const go = await createFixture('go-app');
    await writeFile(join(go, 'go.sum'), '');
    await writeFile(join(go, 'go.mod'), 'module example.com/app\n\ngo 1.23\nrequire (\n\tgithub.com/a/b v1.2.3\n)\n');
    expect(await scanProject(go)).toMatchObject({ projectType: 'go', name: 'example.com/app', packageManager: 'go' });

    const dart = await createFixture('dart-app');
    await writeFile(join(dart, 'pubspec.yaml'), 'name: dart_app\nversion: 1.0.0\ndescription: dart\n\ndependencies:\n  path: ^1.9.0\n');
    expect(await scanProject(dart)).toMatchObject({ projectType: 'dart', name: 'dart_app' });

    const ts = await createFixture('ts-only');
    await writeFile(join(ts, 'tsconfig.json'), '{}');
    expect(await scanProject(ts)).toMatchObject({ projectType: 'typescript', name: 'ts-only' });
  });

  it('scans mobile/native/backend manifests and empty directories', async () => {
    const flutter = await createFixture('flutter-app');
    await writeFile(join(flutter, 'pubspec.yaml'), 'name: flutter_app\nflutter:\n  uses-material-design: true\ndependencies:\n  flutter:\n    sdk: flutter\n');
    expect(await scanProject(flutter)).toMatchObject({ projectType: 'flutter', name: 'flutter_app' });

    const android = await createFixture('android-app');
    await mkdir(join(android, 'app', 'src', 'main'), { recursive: true });
    await writeFile(join(android, 'build.gradle'), 'plugins { id "com.android.application" }');
    await writeFile(join(android, 'app', 'src', 'main', 'AndroidManifest.xml'), '<manifest />');
    expect(await scanProject(android)).toMatchObject({ projectType: 'android', name: 'android-app' });

    const ios = await createFixture('ios-app');
    await mkdir(join(ios, 'Demo.xcodeproj'));
    expect(await scanProject(ios)).toMatchObject({ projectType: 'ios', name: 'Demo' });

    const macos = await createFixture('macos-app');
    await mkdir(join(macos, 'Desk.xcworkspace'));
    await writeFile(join(macos, 'macos.entitlements'), '');
    expect(await scanProject(macos)).toMatchObject({ projectType: 'macos-native', name: 'Desk' });

    const ruby = await createFixture('ruby-app');
    await writeFile(join(ruby, 'Gemfile'), 'gem "rails", "~> 7"\n');
    await writeFile(join(ruby, 'ruby-app.gemspec'), 's.name = "gem-name"\ns.version = "1.0.0"\n');
    expect(await scanProject(ruby)).toMatchObject({ projectType: 'ruby', name: 'gem-name', version: '1.0.0' });

    const php = await createFixture('php-app');
    await writeFile(join(php, 'composer.lock'), '{}');
    await writeFile(join(php, 'composer.json'), JSON.stringify({ name: 'vendor/pkg', version: '1.0.0', require: { php: '^8.2', monolog: '^3' }, 'require-dev': { pestphp: '^2' } }));
    expect(await scanProject(php)).toMatchObject({ projectType: 'php', name: 'vendor/pkg', packageManager: 'composer' });

    const kotlin = await createFixture('kotlin-app');
    await writeFile(join(kotlin, 'build.gradle.kts'), 'plugins { kotlin("jvm") }');
    expect(await scanProject(kotlin)).toMatchObject({ projectType: 'kotlin', name: 'kotlin-app' });

    const java = await createFixture('java-app');
    await writeFile(join(java, 'pom.xml'), '<project />');
    expect(await scanProject(java)).toMatchObject({ projectType: 'java', name: 'java-app' });

    const dotnet = await createFixture('dotnet-app');
    await writeFile(join(dotnet, 'App.csproj'), '<Project />');
    expect(await scanProject(dotnet)).toMatchObject({ projectType: 'dotnet', name: 'App' });

    const cpp = await createFixture('cpp-app');
    await writeFile(join(cpp, 'CMakeLists.txt'), 'project(CoolApp)\n');
    expect(await scanProject(cpp)).toMatchObject({ projectType: 'cpp', name: 'CoolApp' });

    const empty = await createFixture('empty');
    const emptyInfo = await scanProject(empty);
    expect(emptyInfo.hasProject).toBe(false);
    expect(emptyInfo.projectType).toBe('unknown');
  });

  it('detects monorepos and scans subprojects in apps/packages folders', async () => {
    const mono = await createFixture('monorepo-root');
    await writeFile(join(mono, 'pnpm-workspace.yaml'), 'packages:\n  - "apps/*"\n');

    const appA = join(mono, 'apps', 'web');
    await mkdir(appA, { recursive: true });
    await writeFile(join(appA, 'package.json'), JSON.stringify({ name: 'resomix-web', version: '1.0.0' }));

    const appB = join(mono, 'apps', 'api');
    await mkdir(appB, { recursive: true });
    await writeFile(join(appB, 'package.json'), JSON.stringify({ name: 'resomix-api', version: '2.0.0' }));

    const info = await scanProject(mono);
    expect(info.hasProject).toBe(true);
    expect(info.projectType).toBe('monorepo');
    expect(info.subProjects).toBeDefined();
    expect(info.subProjects?.length).toBe(2);

    const names = info.subProjects?.map((s) => s.name).sort();
    expect(names).toEqual(['resomix-api', 'resomix-web']);
  });

  it('validates dev scripts conservatively', () => {
    expect(isValidDevScript('pnpm test')).toBe(true);
    expect(isValidDevScript('test:unit')).toBe(true);
    expect(isValidDevScript('')).toBe(false);
    expect(isValidDevScript('pnpm test && rm -rf /')).toBe(false);
    expect(isValidDevScript('echo $TOKEN')).toBe(false);
  });
});
