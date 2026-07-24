import * as nodePath from 'node:path';
import { fileExists } from './fileUtils';

export async function detectPackageManager(dirPath: string): Promise<string | null> {
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
