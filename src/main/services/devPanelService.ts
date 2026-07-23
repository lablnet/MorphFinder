/**
 * devPanelService.ts
 *
 * Scans a directory for well-known project manifests and returns rich developer
 * metadata without spawning any external process (except reusing gitService).
 * All file reads use node:fs/promises so they are non-blocking.
 */

import * as fs from 'node:fs/promises';
import * as nodePath from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type {
  DevPanelInfo,
  DevScript,
  DevDependency,
  EnvVar,
  DevToolchain,
  DependencyWarning,
  EnvChecklistItem,
  ProjectHealthCheck,
} from '@shared/types/devPanel';
import { getGitStatus } from './gitService';

const execAsync = promisify(exec);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function readJsonFile(filePath: string): Promise<unknown> {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as unknown;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// .env parser
// ---------------------------------------------------------------------------

async function parseEnvFile(dirPath: string): Promise<EnvVar[]> {
  const envPath = nodePath.join(dirPath, '.env');
  if (!(await fileExists(envPath))) return [];
  try {
    const raw = await fs.readFile(envPath, 'utf8');
    const vars: EnvVar[] = [];
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) {
        vars.push({ key: trimmed, value: '' });
      } else {
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (key.length > 0) vars.push({ key, value });
      }
    }
    return vars;
  } catch {
    return [];
  }
}

async function parseEnvChecklist(dirPath: string, envVars: EnvVar[]): Promise<EnvChecklistItem[]> {
  const candidates = [
    { fileName: '.env.example', source: '.env.example' as const },
    { fileName: '.env.sample', source: '.env.sample' as const },
    { fileName: '.env.template', source: '.env.template' as const },
  ];
  const presentKeys = new Set(envVars.map((item) => item.key));

  for (const candidate of candidates) {
    const templatePath = nodePath.join(dirPath, candidate.fileName);
    if (!(await fileExists(templatePath))) continue;
    try {
      const raw = await fs.readFile(templatePath, 'utf8');
      return raw
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith('#'))
        .map((line) => line.split('=')[0]?.trim() ?? '')
        .filter((key) => key.length > 0)
        .map((key) => ({ key, present: presentKeys.has(key), source: candidate.source }));
    } catch {
      return [];
    }
  }

  return [];
}

async function detectPackageManager(dirPath: string): Promise<string | null> {
  const lockfiles: Array<[string, string]> = [
    ['pnpm-lock.yaml', 'pnpm'],
    ['yarn.lock', 'yarn'],
    ['package-lock.json', 'npm'],
    ['bun.lockb', 'bun'],
    ['bun.lock', 'bun'],
    ['Cargo.lock', 'cargo'],
    ['poetry.lock', 'poetry'],
    ['Pipfile.lock', 'pipenv'],
    ['go.sum', 'go'],
    ['composer.lock', 'composer'],
    ['Gemfile.lock', 'bundler'],
  ];
  for (const [fileName, manager] of lockfiles) {
    if (await fileExists(nodePath.join(dirPath, fileName))) return manager;
  }
  if (await fileExists(nodePath.join(dirPath, 'package.json'))) return 'npm';
  if (await fileExists(nodePath.join(dirPath, 'Cargo.toml'))) return 'cargo';
  if (await fileExists(nodePath.join(dirPath, 'requirements.txt'))) return 'pip';
  return null;
}

function createDependencyWarnings(dependencies: DevDependency[]): DependencyWarning[] {
  return dependencies.flatMap((dependency) => {
    const warnings: DependencyWarning[] = [];
    if (dependency.version === '*' || dependency.version === 'latest') {
      warnings.push({
        packageName: dependency.name,
        severity: 'warn',
        message: 'Version is not pinned.',
      });
    }
    if (/file:|link:|workspace:/.test(dependency.version)) {
      warnings.push({
        packageName: dependency.name,
        severity: 'info',
        message: 'Uses a local/workspace reference.',
      });
    }
    return warnings;
  });
}

function createHealthChecks(info: DevPanelInfo, packageManager: string | null, envChecklist: EnvChecklistItem[]): ProjectHealthCheck[] {
  const missingEnvCount = envChecklist.filter((item) => !item.present).length;
  return [
    {
      id: 'scripts',
      label: 'Runnable scripts',
      status: info.scripts.length > 0 ? 'pass' : 'warn',
      detail: info.scripts.length > 0 ? `${info.scripts.length} script${info.scripts.length === 1 ? '' : 's'} detected.` : 'No scripts detected.',
    },
    {
      id: 'package-manager',
      label: 'Package manager',
      status: packageManager === null ? 'warn' : 'pass',
      detail: packageManager === null ? 'No lockfile/package manager detected.' : `${packageManager} detected.`,
    },
    {
      id: 'git',
      label: 'Git workspace',
      status: info.gitBranch === null ? 'warn' : info.gitIsDirty ? 'warn' : 'pass',
      detail: info.gitBranch === null ? 'Not inside a Git repository.' : info.gitIsDirty ? `Branch ${info.gitBranch} has changes.` : `Branch ${info.gitBranch} is clean.`,
    },
    {
      id: 'env',
      label: '.env completeness',
      status: envChecklist.length === 0 ? 'warn' : missingEnvCount === 0 ? 'pass' : 'fail',
      detail: envChecklist.length === 0 ? 'No env template found.' : missingEnvCount === 0 ? 'All template keys are present.' : `${missingEnvCount} env key${missingEnvCount === 1 ? '' : 's'} missing.`,
    },
  ];
}

// ---------------------------------------------------------------------------
// TOML parser — minimal hand-rolled for Cargo.toml / pyproject.toml
// (no external deps; only reads [package] / [project] sections)
// ---------------------------------------------------------------------------

function parseSimpleToml(raw: string): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  let currentSection = '__root__';
  result[currentSection] = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const sectionMatch = /^\[([^\]]+)\]$/.exec(trimmed);
    if (sectionMatch) {
      currentSection = sectionMatch[1]!.trim();
      if (!result[currentSection]) result[currentSection] = {};
      continue;
    }
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const rawVal = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      (result[currentSection] ??= {})[key] = rawVal;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Node.js / package.json
// ---------------------------------------------------------------------------

async function scanNode(dirPath: string): Promise<Partial<DevPanelInfo> | null> {
  const pkgPath = nodePath.join(dirPath, 'package.json');
  if (!(await fileExists(pkgPath))) return null;

  let pkg: Record<string, unknown>;
  try {
    pkg = (await readJsonFile(pkgPath)) as Record<string, unknown>;
  } catch {
    return null;
  }

  const rawScripts = (pkg['scripts'] as Record<string, string> | undefined) ?? {};
  const scripts: DevScript[] = Object.entries(rawScripts).map(([name, command]) => ({ name, command }));

  const rawDeps = (pkg['dependencies'] as Record<string, string> | undefined) ?? {};
  const rawDevDeps = (pkg['devDependencies'] as Record<string, string> | undefined) ?? {};
  const dependencies: DevDependency[] = [
    ...Object.entries(rawDeps).map(([name, version]) => ({ name, version, isDev: false })),
    ...Object.entries(rawDevDeps).map(([name, version]) => ({ name, version, isDev: true })),
  ];

  const engines = pkg['engines'] as Record<string, string> | undefined;
  const toolchain: DevToolchain = {
    runtime: 'node',
    requiredVersion: engines?.['node'] ?? null,
  };

  const allDepNames = [...Object.keys(rawDeps), ...Object.keys(rawDevDeps)];
  const isElectron = allDepNames.some((d) => d === 'electron');
  const isReactNative = allDepNames.includes('react-native');

  const projectType = isElectron ? 'electron' : isReactNative ? 'react-native' : 'node';

  return {
    projectType,
    name: typeof pkg['name'] === 'string' ? pkg['name'] : null,
    version: typeof pkg['version'] === 'string' ? pkg['version'] : null,
    description: typeof pkg['description'] === 'string' ? pkg['description'] : null,
    license: typeof pkg['license'] === 'string' ? pkg['license'] : null,
    toolchain,
    scripts,
    dependencies,
    hasProject: true,
  };
}

// ---------------------------------------------------------------------------
// Rust / Cargo.toml
// ---------------------------------------------------------------------------

async function scanRust(dirPath: string): Promise<Partial<DevPanelInfo> | null> {
  const cargoPath = nodePath.join(dirPath, 'Cargo.toml');
  if (!(await fileExists(cargoPath))) return null;

  let raw: string;
  try {
    raw = await fs.readFile(cargoPath, 'utf8');
  } catch {
    return null;
  }

  const toml = parseSimpleToml(raw);
  const pkg = toml['package'] ?? {};

  // Parse [dependencies] section — values may be strings or inline tables
  const depsSection = toml['dependencies'] ?? {};
  const dependencies: DevDependency[] = Object.entries(depsSection).map(([name, version]) => ({
    name,
    version: typeof version === 'string' ? version : '*',
    isDev: false,
  }));

  const devDepsSection = toml['dev-dependencies'] ?? {};
  const devDeps: DevDependency[] = Object.entries(devDepsSection).map(([name, version]) => ({
    name,
    version: typeof version === 'string' ? version : '*',
    isDev: true,
  }));

  let rustcVersion: string | null = null;
  try {
    const { stdout } = await execAsync('rustc --version');
    rustcVersion = stdout.split(' ')[1]?.trim() ?? null;
  } catch { /* rustc not installed — soft failure */ }

  return {
    projectType: 'rust',
    name: pkg['name'] ?? null,
    version: pkg['version'] ?? null,
    description: pkg['description'] ?? null,
    license: pkg['license'] ?? null,
    toolchain: { runtime: 'rustc', requiredVersion: pkg['rust-version'] ?? rustcVersion },
    scripts: [
      { name: 'build', command: 'cargo build' },
      { name: 'run', command: 'cargo run' },
      { name: 'test', command: 'cargo test' },
      { name: 'clippy', command: 'cargo clippy' },
      { name: 'fmt', command: 'cargo fmt' },
    ],
    dependencies: [...dependencies, ...devDeps],
    hasProject: true,
  };
}

// ---------------------------------------------------------------------------
// Python / pyproject.toml or requirements.txt
// ---------------------------------------------------------------------------

async function scanPython(dirPath: string): Promise<Partial<DevPanelInfo> | null> {
  const pyprojectPath = nodePath.join(dirPath, 'pyproject.toml');
  const requirementsPath = nodePath.join(dirPath, 'requirements.txt');

  const hasPyproject = await fileExists(pyprojectPath);
  const hasRequirements = await fileExists(requirementsPath);
  if (!hasPyproject && !hasRequirements) return null;

  let name: string | null = null;
  let version: string | null = null;
  let description: string | null = null;
  const dependencies: DevDependency[] = [];

  if (hasPyproject) {
    try {
      const raw = await fs.readFile(pyprojectPath, 'utf8');
      const toml = parseSimpleToml(raw);
      const project = toml['project'] ?? toml['tool.poetry'] ?? {};
      name = project['name'] ?? null;
      version = project['version'] ?? null;
      description = project['description'] ?? null;
    } catch { /* ignore */ }
  }

  if (hasRequirements) {
    try {
      const raw = await fs.readFile(requirementsPath, 'utf8');
      for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const match = /^([A-Za-z0-9_.-]+)([>=<!~^]+.+)?$/.exec(trimmed);
        if (match) {
          dependencies.push({ name: match[1]!, version: match[2]?.trim() ?? '*', isDev: false });
        }
      }
    } catch { /* ignore */ }
  }

  let pythonVersion: string | null = null;
  try {
    const { stdout } = await execAsync('python3 --version');
    pythonVersion = stdout.trim().replace('Python ', '');
  } catch { /* python not installed */ }

  return {
    projectType: 'python',
    name,
    version,
    description,
    license: null,
    toolchain: { runtime: 'python', requiredVersion: pythonVersion },
    scripts: [
      { name: 'run', command: 'python3 main.py' },
      { name: 'test', command: 'pytest' },
      { name: 'install', command: 'pip install -r requirements.txt' },
    ],
    dependencies,
    hasProject: true,
  };
}

// ---------------------------------------------------------------------------
// Go / go.mod
// ---------------------------------------------------------------------------

async function scanGo(dirPath: string): Promise<Partial<DevPanelInfo> | null> {
  const goModPath = nodePath.join(dirPath, 'go.mod');
  if (!(await fileExists(goModPath))) return null;

  let raw: string;
  try {
    raw = await fs.readFile(goModPath, 'utf8');
  } catch {
    return null;
  }

  let name: string | null = null;
  let goVersion: string | null = null;
  const dependencies: DevDependency[] = [];

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('module ')) name = trimmed.replace('module ', '').trim();
    if (trimmed.startsWith('go ')) goVersion = trimmed.replace('go ', '').trim();
    // require block lines look like: <tab>module version
    const reqMatch = /^\s+([^\s]+)\s+v([^\s]+)/.exec(trimmed);
    if (reqMatch) {
      dependencies.push({ name: reqMatch[1]!, version: `v${reqMatch[2]}`, isDev: false });
    }
  }

  return {
    projectType: 'go',
    name,
    version: null,
    description: null,
    license: null,
    toolchain: { runtime: 'go', requiredVersion: goVersion },
    scripts: [
      { name: 'run', command: 'go run .' },
      { name: 'build', command: 'go build ./...' },
      { name: 'test', command: 'go test ./...' },
      { name: 'vet', command: 'go vet ./...' },
      { name: 'tidy', command: 'go mod tidy' },
    ],
    dependencies,
    hasProject: true,
  };
}

// ---------------------------------------------------------------------------
// Flutter / Dart — pubspec.yaml
// ---------------------------------------------------------------------------

async function scanFlutterOrDart(dirPath: string): Promise<Partial<DevPanelInfo> | null> {
  const pubspecPath = nodePath.join(dirPath, 'pubspec.yaml');
  if (!(await fileExists(pubspecPath))) return null;

  let raw: string;
  try { raw = await fs.readFile(pubspecPath, 'utf8'); } catch { return null; }

  const nameMatch = /^name:\s*(.+)$/m.exec(raw);
  const versionMatch = /^version:\s*(.+)$/m.exec(raw);
  const descMatch = /^description:\s*(.+)$/m.exec(raw);
  const isFlutter = /^flutter:/m.test(raw);

  const dependencies: DevDependency[] = [];
  let inDeps = false;
  for (const line of raw.split('\n')) {
    if (/^dependencies:/.test(line)) { inDeps = true; continue; }
    if (/^\w/.test(line) && !/^dependencies:/.test(line)) { inDeps = false; }
    if (inDeps) {
      const m = /^  ([A-Za-z0-9_]+):\s*(.+)$/.exec(line);
      if (m) dependencies.push({ name: m[1]!, version: m[2]!.trim(), isDev: false });
    }
  }

  return {
    projectType: isFlutter ? 'flutter' : 'dart',
    name: nameMatch?.[1]?.trim() ?? null,
    version: versionMatch?.[1]?.trim() ?? null,
    description: descMatch?.[1]?.trim() ?? null,
    license: null,
    toolchain: { runtime: isFlutter ? 'flutter' : 'dart', requiredVersion: null },
    scripts: isFlutter
      ? [
          { name: 'run', command: 'flutter run' },
          { name: 'build apk', command: 'flutter build apk' },
          { name: 'build ios', command: 'flutter build ios' },
          { name: 'test', command: 'flutter test' },
          { name: 'pub get', command: 'flutter pub get' },
        ]
      : [
          { name: 'run', command: 'dart run' },
          { name: 'test', command: 'dart test' },
          { name: 'pub get', command: 'dart pub get' },
        ],
    dependencies,
    hasProject: true,
  };
}

// ---------------------------------------------------------------------------
// Android — build.gradle or settings.gradle
// ---------------------------------------------------------------------------

async function scanAndroid(dirPath: string): Promise<Partial<DevPanelInfo> | null> {
  const gradlePaths = [
    nodePath.join(dirPath, 'build.gradle'),
    nodePath.join(dirPath, 'build.gradle.kts'),
    nodePath.join(dirPath, 'settings.gradle'),
    nodePath.join(dirPath, 'settings.gradle.kts'),
  ];
  const hasGradle = (await Promise.all(gradlePaths.map(fileExists))).some(Boolean);
  if (!hasGradle) return null;

  // Distinguish Android from a generic Java/Kotlin Gradle project
  const androidManifest = nodePath.join(dirPath, 'app', 'src', 'main', 'AndroidManifest.xml');
  if (!(await fileExists(androidManifest))) return null;

  return {
    projectType: 'android',
    name: nodePath.basename(dirPath),
    version: null,
    description: 'Android Application',
    license: null,
    toolchain: { runtime: 'gradle', requiredVersion: null },
    scripts: [
      { name: 'build', command: './gradlew build' },
      { name: 'assembleDebug', command: './gradlew assembleDebug' },
      { name: 'assembleRelease', command: './gradlew assembleRelease' },
      { name: 'test', command: './gradlew test' },
      { name: 'lint', command: './gradlew lint' },
    ],
    dependencies: [],
    hasProject: true,
  };
}

// ---------------------------------------------------------------------------
// iOS / macOS native — Xcode project
// ---------------------------------------------------------------------------

async function scanXcode(dirPath: string): Promise<Partial<DevPanelInfo> | null> {
  let entries: string[];
  try { entries = await fs.readdir(dirPath); } catch { return null; }

  const xcodeproj = entries.find((e) => e.endsWith('.xcodeproj') || e.endsWith('.xcworkspace'));
  if (!xcodeproj) return null;

  const projectName = xcodeproj.replace(/\.(xcodeproj|xcworkspace)$/, '');

  // Heuristic: if there is a 'TargetMembership' for macOS SDK files it's a macOS project
  const isMac = entries.some((e) => /macos/i.test(e));

  return {
    projectType: isMac ? 'macos-native' : 'ios',
    name: projectName,
    version: null,
    description: null,
    license: null,
    toolchain: { runtime: 'xcodebuild', requiredVersion: null },
    scripts: [
      { name: 'build', command: 'xcodebuild build' },
      { name: 'test', command: 'xcodebuild test' },
      { name: 'clean', command: 'xcodebuild clean' },
    ],
    dependencies: [],
    hasProject: true,
  };
}

// ---------------------------------------------------------------------------
// Ruby — Gemfile
// ---------------------------------------------------------------------------

async function scanRuby(dirPath: string): Promise<Partial<DevPanelInfo> | null> {
  const gemfilePath = nodePath.join(dirPath, 'Gemfile');
  if (!(await fileExists(gemfilePath))) return null;

  let raw: string;
  try { raw = await fs.readFile(gemfilePath, 'utf8'); } catch { return null; }

  const dependencies: DevDependency[] = [];
  for (const line of raw.split('\n')) {
    const m = /^\s*gem\s+['"]([^'"]+)['"](?:,\s*['"]([^'"]+)['"])?/.exec(line);
    if (m) dependencies.push({ name: m[1]!, version: m[2] ?? '*', isDev: false });
  }

  // Try Gemspec for name/version
  let name: string | null = nodePath.basename(dirPath);
  let version: string | null = null;
  try {
    const dirEntries = await fs.readdir(dirPath);
    const gemspec = dirEntries.find((e) => e.endsWith('.gemspec'));
    if (gemspec) {
      const spec = await fs.readFile(nodePath.join(dirPath, gemspec), 'utf8');
      const nm = /\.name\s*=\s*['"]([^'"]+)['"]/.exec(spec);
      const vm = /\.version\s*=\s*['"]([^'"]+)['"]/.exec(spec);
      if (nm) name = nm[1]!;
      if (vm) version = vm[1]!;
    }
  } catch { /* ignore */ }

  return {
    projectType: 'ruby',
    name,
    version,
    description: null,
    license: null,
    toolchain: { runtime: 'ruby', requiredVersion: null },
    scripts: [
      { name: 'bundle install', command: 'bundle install' },
      { name: 'rspec', command: 'bundle exec rspec' },
      { name: 'rubocop', command: 'bundle exec rubocop' },
      { name: 'rails server', command: 'bundle exec rails server' },
    ],
    dependencies,
    hasProject: true,
  };
}

// ---------------------------------------------------------------------------
// PHP — composer.json
// ---------------------------------------------------------------------------

async function scanPhp(dirPath: string): Promise<Partial<DevPanelInfo> | null> {
  const composerPath = nodePath.join(dirPath, 'composer.json');
  if (!(await fileExists(composerPath))) return null;

  let pkg: Record<string, unknown>;
  try { pkg = (await readJsonFile(composerPath)) as Record<string, unknown>; } catch { return null; }

  const rawDeps = (pkg['require'] as Record<string, string> | undefined) ?? {};
  const rawDevDeps = (pkg['require-dev'] as Record<string, string> | undefined) ?? {};
  const dependencies: DevDependency[] = [
    ...Object.entries(rawDeps).filter(([k]) => k !== 'php').map(([name, version]) => ({ name, version, isDev: false })),
    ...Object.entries(rawDevDeps).map(([name, version]) => ({ name, version, isDev: true })),
  ];

  return {
    projectType: 'php',
    name: typeof pkg['name'] === 'string' ? pkg['name'] : null,
    version: typeof pkg['version'] === 'string' ? pkg['version'] : null,
    description: typeof pkg['description'] === 'string' ? pkg['description'] : null,
    license: typeof pkg['license'] === 'string' ? pkg['license'] : null,
    toolchain: { runtime: 'php', requiredVersion: (rawDeps['php'] as string | undefined) ?? null },
    scripts: [
      { name: 'install', command: 'composer install' },
      { name: 'test', command: 'composer test' },
      { name: 'lint', command: 'composer lint' },
    ],
    dependencies,
    hasProject: true,
  };
}

// ---------------------------------------------------------------------------
// Java / Kotlin — pom.xml or build.gradle[.kts]
// ---------------------------------------------------------------------------

async function scanJavaKotlin(dirPath: string): Promise<Partial<DevPanelInfo> | null> {
  const pomPath = nodePath.join(dirPath, 'pom.xml');
  const gradlePath = nodePath.join(dirPath, 'build.gradle');
  const gradleKtsPath = nodePath.join(dirPath, 'build.gradle.kts');

  const [hasPom, hasGradle, hasGradleKts] = await Promise.all([
    fileExists(pomPath),
    fileExists(gradlePath),
    fileExists(gradleKtsPath),
  ]);

  if (!hasPom && !hasGradle && !hasGradleKts) return null;

  const isKotlin = hasGradleKts || (hasGradle && (await fs.readFile(gradlePath, 'utf8').catch(() => '')).includes('kotlin'));

  return {
    projectType: isKotlin ? 'kotlin' : 'java',
    name: nodePath.basename(dirPath),
    version: null,
    description: null,
    license: null,
    toolchain: { runtime: isKotlin ? 'kotlin' : 'java', requiredVersion: null },
    scripts: hasPom
      ? [
          { name: 'install', command: 'mvn install' },
          { name: 'test', command: 'mvn test' },
          { name: 'package', command: 'mvn package' },
          { name: 'clean', command: 'mvn clean' },
        ]
      : [
          { name: 'build', command: './gradlew build' },
          { name: 'test', command: './gradlew test' },
          { name: 'jar', command: './gradlew jar' },
          { name: 'clean', command: './gradlew clean' },
        ],
    dependencies: [],
    hasProject: true,
  };
}

// ---------------------------------------------------------------------------
// .NET — *.csproj / *.sln
// ---------------------------------------------------------------------------

async function scanDotnet(dirPath: string): Promise<Partial<DevPanelInfo> | null> {
  let entries: string[];
  try { entries = await fs.readdir(dirPath); } catch { return null; }

  const csproj = entries.find((e) => e.endsWith('.csproj') || e.endsWith('.fsproj') || e.endsWith('.sln'));
  if (!csproj) return null;

  return {
    projectType: 'dotnet',
    name: csproj.replace(/\.(csproj|fsproj|sln)$/, ''),
    version: null,
    description: null,
    license: null,
    toolchain: { runtime: 'dotnet', requiredVersion: null },
    scripts: [
      { name: 'build', command: 'dotnet build' },
      { name: 'run', command: 'dotnet run' },
      { name: 'test', command: 'dotnet test' },
      { name: 'publish', command: 'dotnet publish -c Release' },
      { name: 'restore', command: 'dotnet restore' },
    ],
    dependencies: [],
    hasProject: true,
  };
}

// ---------------------------------------------------------------------------
// C / C++ — CMakeLists.txt or Makefile
// ---------------------------------------------------------------------------

async function scanCpp(dirPath: string): Promise<Partial<DevPanelInfo> | null> {
  const [hasCmake, hasMake] = await Promise.all([
    fileExists(nodePath.join(dirPath, 'CMakeLists.txt')),
    fileExists(nodePath.join(dirPath, 'Makefile')),
  ]);
  if (!hasCmake && !hasMake) return null;

  let name: string | null = nodePath.basename(dirPath);
  if (hasCmake) {
    try {
      const raw = await fs.readFile(nodePath.join(dirPath, 'CMakeLists.txt'), 'utf8');
      const m = /project\(([^)\s]+)/i.exec(raw);
      if (m) name = m[1]!;
    } catch { /* ignore */ }
  }

  return {
    projectType: 'cpp',
    name,
    version: null,
    description: null,
    license: null,
    toolchain: { runtime: hasCmake ? 'cmake' : 'make', requiredVersion: null },
    scripts: hasCmake
      ? [
          { name: 'configure', command: 'cmake -B build' },
          { name: 'build', command: 'cmake --build build' },
          { name: 'test', command: 'ctest --test-dir build' },
        ]
      : [
          { name: 'build', command: 'make' },
          { name: 'clean', command: 'make clean' },
          { name: 'test', command: 'make test' },
        ],
    dependencies: [],
    hasProject: true,
  };
}

// ---------------------------------------------------------------------------
// TypeScript-only — tsconfig.json without package.json
// ---------------------------------------------------------------------------

async function scanTypeScript(dirPath: string): Promise<Partial<DevPanelInfo> | null> {
  const tsconfigPath = nodePath.join(dirPath, 'tsconfig.json');
  const pkgPath = nodePath.join(dirPath, 'package.json');
  const [hasTsconfig, hasPkg] = await Promise.all([fileExists(tsconfigPath), fileExists(pkgPath)]);
  // Only treat as pure-TS when there's no package.json (Node scanner handles that)
  if (!hasTsconfig || hasPkg) return null;

  return {
    projectType: 'typescript',
    name: nodePath.basename(dirPath),
    version: null,
    description: 'TypeScript project',
    license: null,
    toolchain: { runtime: 'tsc', requiredVersion: null },
    scripts: [
      { name: 'build', command: 'tsc' },
      { name: 'watch', command: 'tsc --watch' },
    ],
    dependencies: [],
    hasProject: true,
  };
}

// ---------------------------------------------------------------------------
// Git status overlay
// ---------------------------------------------------------------------------

async function getGitInfo(dirPath: string): Promise<{ branch: string | null; isDirty: boolean }> {
  try {
    const status = await getGitStatus(dirPath);
    if (!status.isRepo) return { branch: null, isDirty: false };
    const isDirty = Object.keys(status.statusMap).length > 0;
    return { branch: status.branch || null, isDirty };
  } catch {
    return { branch: null, isDirty: false };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const EMPTY_RESULT: DevPanelInfo = {
  path: '',
  projectType: 'unknown',
  name: null,
  version: null,
  description: null,
  license: null,
  toolchain: null,
  packageManager: null,
  scripts: [],
  dependencies: [],
  envVars: [],
  envChecklist: [],
  healthChecks: [],
  dependencyWarnings: [],
  gitBranch: null,
  gitIsDirty: false,
  hasProject: false,
};

export async function scanProject(dirPath: string): Promise<DevPanelInfo> {
  // Run all scanners concurrently — every scanner does only cheap fs.access checks
  // until a manifest file is confirmed, so this is fast even for large directories.
  const [
    nodeResult,
    rustResult,
    pythonResult,
    goResult,
    flutterResult,
    androidResult,
    xcodeResult,
    rubyResult,
    phpResult,
    javaResult,
    dotnetResult,
    cppResult,
    tsResult,
    envVars,
    packageManager,
    gitInfo,
  ] = await Promise.all([
    scanNode(dirPath),
    scanRust(dirPath),
    scanPython(dirPath),
    scanGo(dirPath),
    scanFlutterOrDart(dirPath),
    scanAndroid(dirPath),        // Before Java/Kotlin — uses AndroidManifest.xml as disambiguator
    scanXcode(dirPath),
    scanRuby(dirPath),
    scanPhp(dirPath),
    scanJavaKotlin(dirPath),
    scanDotnet(dirPath),
    scanCpp(dirPath),
    scanTypeScript(dirPath),     // Last — only matches when package.json is absent
    parseEnvFile(dirPath),
    detectPackageManager(dirPath),
    getGitInfo(dirPath),
  ]);

  const envChecklist = await parseEnvChecklist(dirPath, envVars);

  // Priority: more-specific ecosystems before generic ones
  const detected: Partial<DevPanelInfo> | null =
    nodeResult ??
    rustResult ??
    pythonResult ??
    goResult ??
    flutterResult ??
    androidResult ??
    xcodeResult ??
    rubyResult ??
    phpResult ??
    javaResult ??
    dotnetResult ??
    cppResult ??
    tsResult;

  if (!detected) {
    return {
      ...EMPTY_RESULT,
      path: dirPath,
      envVars,
      envChecklist,
      packageManager,
      gitBranch: gitInfo.branch,
      gitIsDirty: gitInfo.isDirty,
      healthChecks: createHealthChecks({ ...EMPTY_RESULT, path: dirPath, envVars, envChecklist, packageManager, gitBranch: gitInfo.branch, gitIsDirty: gitInfo.isDirty }, packageManager, envChecklist),
      hasProject: false,
    };
  }

  const result = {
    ...EMPTY_RESULT,
    ...detected,
    path: dirPath,
    envVars,
    envChecklist,
    packageManager,
    gitBranch: gitInfo.branch,
    gitIsDirty: gitInfo.isDirty,
    hasProject: true,
  };
  return {
    ...result,
    healthChecks: createHealthChecks(result, packageManager, envChecklist),
    dependencyWarnings: createDependencyWarnings(result.dependencies),
  };
}

/** Validates whether a command is a safe dev script free from shell injection metacharacters. */
export function isValidDevScript(command: string): boolean {
  if (!command || typeof command !== 'string') return false;
  const trimmed = command.trim();
  if (trimmed.length === 0) return false;

  // Reject shell injection metacharacters & path traversal metacharacters
  if (/[\;&|\`\$\>\<\r\n\0]/g.test(trimmed)) return false;

  // Match allowed command prefixes or clean identifier
  const ALLOWED_BINARIES = new Set([
    'npm', 'pnpm', 'yarn', 'bun', 'cargo', 'go', 'make', 'python', 'python3',
    'ruby', 'flutter', 'dotnet', 'gradle', 'mvn', 'npx', 'tsx'
  ]);

  const parts = trimmed.split(/\s+/);
  const bin = parts[0]?.toLowerCase() ?? '';

  if (ALLOWED_BINARIES.has(bin)) return true;

  // Single script identifier like "dev", "build", "test:unit"
  if (/^[a-zA-Z0-9_\-:]+$/.test(trimmed)) return true;

  return false;
}

export async function runScript(cwd: string, command: string): Promise<void> {
  if (!isValidDevScript(command)) {
    throw new Error(`Execution rejected: command contains unallowed or unsafe script syntax.`);
  }

  const { spawn } = await import('node:child_process');
  const trimmed = command.trim();
  const parts = trimmed.split(/\s+/);
  
  let bin = parts[0] ?? '';
  let args = parts.slice(1);

  // If passed a simple script name like "dev", wrap as "pnpm run <script>"
  if (parts.length === 1 && !['npm', 'pnpm', 'yarn', 'bun', 'make', 'cargo'].includes(bin)) {
    bin = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
    args = ['run', trimmed];
  } else if (process.platform === 'win32' && ['npm', 'pnpm', 'yarn', 'npx', 'tsx'].includes(bin)) {
    bin = `${bin}.cmd`;
  }

  const child = spawn(bin, args, {
    cwd,
    detached: true,
    stdio: 'ignore',
    shell: false,
    env: { ...process.env },
  });
  child.unref();
}

