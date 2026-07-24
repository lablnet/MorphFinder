import * as fs from 'node:fs/promises';
import * as nodePath from 'node:path';
import type { EnvChecklistItem, EnvVar } from '@shared/types/devPanel';
import { fileExists } from './fileUtils';

export async function parseEnvFile(dirPath: string): Promise<EnvVar[]> {
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

export async function parseEnvChecklist(dirPath: string, envVars: EnvVar[]): Promise<EnvChecklistItem[]> {
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
