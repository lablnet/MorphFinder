import type {
  DependencyWarning,
  DevDependency,
  DevPanelInfo,
  EnvChecklistItem,
  ProjectHealthCheck,
} from '@shared/types/devPanel';

export function createDependencyWarnings(dependencies: DevDependency[]): DependencyWarning[] {
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

export function createHealthChecks(
  info: DevPanelInfo,
  packageManager: string | null,
  envChecklist: EnvChecklistItem[],
): ProjectHealthCheck[] {
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
