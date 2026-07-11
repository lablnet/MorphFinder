import { useState, useEffect, useCallback } from 'react';
import { ipc } from '@renderer/services/ipc';
import type { ProjectType } from '@shared/types/devPanel';

export interface ProjectDetectorResult {
  /** Whether a project manifest was found in the current directory. */
  hasProject: boolean;
  /** The detected project type, or null if no project was found. */
  projectType: ProjectType | null;
  /** The name field from the manifest, if readable. */
  projectName: string | null;
}

const VIRTUAL_PREFIX = 'morph://';

/**
 * Lightweight hook that detects whether a project manifest exists in the given
 * directory, without doing a full devpanel scan. Designed for status-bar use
 * where we only need a boolean + a project type label.
 *
 * Implementation: it calls devpanel:scan but only reads the top-level fields —
 * the scan is already fast (concurrent fs.access checks) so reusing it keeps
 * the code DRY.
 */
export function useProjectDetector(path: string | null): ProjectDetectorResult {
  const [result, setResult] = useState<ProjectDetectorResult>({
    hasProject: false,
    projectType: null,
    projectName: null,
  });

  const detect = useCallback(async (dirPath: string): Promise<void> => {
    try {
      const info = await ipc.invoke('devpanel:scan', { path: dirPath });
      setResult({
        hasProject: info.hasProject,
        projectType: info.hasProject ? info.projectType : null,
        projectName: info.name,
      });
    } catch {
      setResult({ hasProject: false, projectType: null, projectName: null });
    }
  }, []);

  useEffect(() => {
    if (!path || path.startsWith(VIRTUAL_PREFIX)) {
      setResult({ hasProject: false, projectType: null, projectName: null });
      return;
    }
    void detect(path);
  }, [path, detect]);

  return result;
}
