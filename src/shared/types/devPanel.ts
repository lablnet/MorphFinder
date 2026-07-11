export type ProjectType =
  // JS / TS ecosystem
  | 'node'
  | 'typescript'   // tsconfig.json only, no package.json
  | 'electron'     // electron in deps
  | 'react-native' // react-native in deps
  // Mobile / Cross-platform
  | 'flutter'      // pubspec.yaml
  | 'dart'         // pubspec.yaml (non-Flutter)
  | 'android'      // build.gradle / settings.gradle
  | 'ios'          // .xcodeproj / .xcworkspace (iOS target)
  | 'macos-native' // .xcodeproj (macOS target)
  // Systems / Backend
  | 'rust'
  | 'go'
  | 'python'
  | 'ruby'         // Gemfile
  | 'php'          // composer.json
  | 'java'         // pom.xml / build.gradle (non-android)
  | 'kotlin'       // build.gradle.kts
  | 'swift'        // Package.swift without node-swift
  | 'dotnet'       // *.csproj / *.sln
  | 'cpp'          // CMakeLists.txt / Makefile
  | 'unknown';

export interface DevScript {
  name: string;
  command: string;
}

export interface DevDependency {
  name: string;
  version: string;
  isDev: boolean;
}

export interface EnvVar {
  key: string;
  /** Raw value from the .env file. May be empty string if line has no `=`. */
  value: string;
}

export interface EnvChecklistItem {
  key: string;
  present: boolean;
  source: '.env.example' | '.env.sample' | '.env.template';
}

export type ProjectHealthStatus = 'pass' | 'warn' | 'fail';

export interface ProjectHealthCheck {
  id: string;
  label: string;
  status: ProjectHealthStatus;
  detail: string;
}

export interface DependencyWarning {
  packageName: string;
  severity: 'info' | 'warn';
  message: string;
}

export interface DevToolchain {
  /** e.g. ">=18.0.0", "1.79.0", "3.11", etc. */
  requiredVersion: string | null;
  /** e.g. "node", "rustc", "python", "go" */
  runtime: string;
}

export interface DevPanelInfo {
  /** Absolute path that was scanned. */
  path: string;
  projectType: ProjectType;
  /** Display name from the manifest (package name, etc.). */
  name: string | null;
  version: string | null;
  description: string | null;
  license: string | null;
  toolchain: DevToolchain | null;
  packageManager: string | null;
  scripts: DevScript[];
  /** Combined list: prodDeps first, then devDeps. */
  dependencies: DevDependency[];
  envVars: EnvVar[];
  envChecklist: EnvChecklistItem[];
  healthChecks: ProjectHealthCheck[];
  dependencyWarnings: DependencyWarning[];
  /** Populated from gitService if directory is a git repo. */
  gitBranch: string | null;
  gitIsDirty: boolean;
  /** True when at least one manifest file was found. */
  hasProject: boolean;
}
