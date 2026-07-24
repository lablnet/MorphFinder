export function parseSimpleToml(raw: string): Record<string, Record<string, string>> {
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
