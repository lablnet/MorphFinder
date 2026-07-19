import { app } from 'electron';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { DirectoryAnnotation, DirectoryAnnotationTag, DirectoryAnnotationUpdate } from '@shared/types/directoryAnnotations';

const CURRENT_VERSION = 1;

interface AnnotationDatabase {
  version: number;
  annotations: Record<string, DirectoryAnnotation>;
}

const EMPTY_DATABASE: AnnotationDatabase = { version: CURRENT_VERSION, annotations: {} };

let cachedDatabase: AnnotationDatabase | null = null;
let writeQueue: Promise<void> = Promise.resolve();

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

function migrateDatabase(parsed: unknown): AnnotationDatabase {
  if (typeof parsed !== 'object' || parsed === null) return { ...EMPTY_DATABASE };
  const db = parsed as Partial<AnnotationDatabase>;
  const version = typeof db.version === 'number' ? db.version : 0;

  let annotations: Record<string, DirectoryAnnotation> = {};
  if (typeof db.annotations === 'object' && db.annotations !== null) {
    annotations = db.annotations as Record<string, DirectoryAnnotation>;
  }

  if (version < 1) {
    // Migration logic for pre-v1 databases if applicable
  }

  return {
    version: CURRENT_VERSION,
    annotations,
  };
}

async function readDatabase(): Promise<AnnotationDatabase> {
  if (cachedDatabase !== null) {
    return cachedDatabase;
  }
  try {
    const raw = await readFile(databasePath(), 'utf8');
    const parsed = JSON.parse(raw);
    cachedDatabase = migrateDatabase(parsed);
    return cachedDatabase;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      cachedDatabase = { ...EMPTY_DATABASE };
      return cachedDatabase;
    }
    throw error;
  }
}

async function writeDatabase(database: AnnotationDatabase): Promise<void> {
  cachedDatabase = database;
  writeQueue = writeQueue.then(async () => {
    const target = databasePath();
    await mkdir(path.dirname(target), { recursive: true });
    const temporary = `${target}.tmp`;
    await writeFile(temporary, `${JSON.stringify(database, null, 2)}\n`, 'utf8');
    await rename(temporary, target);
  });
  await writeQueue;
}

export async function getDirectoryAnnotation(targetPath: string): Promise<DirectoryAnnotation> {
  const database = await readDatabase();
  return database.annotations[targetPath] ?? emptyAnnotation(targetPath);
}

export async function listDirectoryAnnotations(): Promise<DirectoryAnnotation[]> {
  const database = await readDatabase();
  return Object.values(database.annotations);
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
