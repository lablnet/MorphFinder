import { app } from 'electron';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { DirectoryAnnotation, DirectoryAnnotationTag, DirectoryAnnotationUpdate } from '@shared/types/directoryAnnotations';

interface AnnotationDatabase {
  version: 1;
  annotations: Record<string, DirectoryAnnotation>;
}

const EMPTY_DATABASE: AnnotationDatabase = { version: 1, annotations: {} };

function databasePath(): string {
  return path.join(app.getPath('userData'), 'directory-annotations.json');
}

function emptyAnnotation(targetPath: string): DirectoryAnnotation {
  return {
    path: targetPath,
    tags: [],
    notes: '',
    updatedAt: 0,
  };
}

function cleanTag(tag: DirectoryAnnotationTag): DirectoryAnnotationTag | null {
  const label = tag.label.trim();
  const color = tag.color.trim();
  if (label.length === 0 || color.length === 0) return null;
  return {
    id: tag.id.trim() || `${label.toLowerCase()}-${color.toLowerCase()}`,
    label,
    color,
  };
}

async function readDatabase(): Promise<AnnotationDatabase> {
  try {
    const raw = await readFile(databasePath(), 'utf8');
    const parsed = JSON.parse(raw) as Partial<AnnotationDatabase>;
    if (parsed.version !== 1 || typeof parsed.annotations !== 'object' || parsed.annotations === null) {
      return EMPTY_DATABASE;
    }
    return { version: 1, annotations: parsed.annotations as Record<string, DirectoryAnnotation> };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return EMPTY_DATABASE;
    throw error;
  }
}

async function writeDatabase(database: AnnotationDatabase): Promise<void> {
  const target = databasePath();
  await mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.tmp`;
  await writeFile(temporary, `${JSON.stringify(database, null, 2)}\n`, 'utf8');
  await rename(temporary, target);
}

export async function getDirectoryAnnotation(targetPath: string): Promise<DirectoryAnnotation> {
  const database = await readDatabase();
  return database.annotations[targetPath] ?? emptyAnnotation(targetPath);
}

export async function setDirectoryAnnotation(update: DirectoryAnnotationUpdate): Promise<DirectoryAnnotation> {
  const database = await readDatabase();
  const cleanedTags = update.tags
    .map(cleanTag)
    .filter((tag): tag is DirectoryAnnotationTag => tag !== null);
  const next: DirectoryAnnotation = {
    path: update.path,
    tags: cleanedTags,
    notes: update.notes,
    updatedAt: Date.now(),
  };
  database.annotations[update.path] = next;
  await writeDatabase(database);
  return next;
}
