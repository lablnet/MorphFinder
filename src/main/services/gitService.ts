import { exec } from 'node:child_process';
import { resolve } from 'node:path';
import type { GitStatus, GitCommit, GitFileStatus } from '@shared/types/git';

function runCmd(cmd: string, cwd: string): Promise<string> {
  return new Promise((res, rej) => {
    exec(cmd, { cwd }, (error, stdout) => {
      if (error) {
        rej(error);
      } else {
        res(stdout.trimEnd());
      }
    });
  });
}

async function isGitInstalled(): Promise<boolean> {
  try {
    await runCmd('git --version', process.cwd());
    return true;
  } catch {
    return false;
  }
}

export async function getGitStatus(path: string): Promise<GitStatus> {
  const installed = await isGitInstalled();
  if (!installed) {
    return {
      isInstalled: false,
      isRepo: false,
      branch: '',
      repoRoot: '',
      statusMap: {},
    };
  }

  try {
    // Check if inside a work tree and find root
    const repoRoot = await runCmd('git rev-parse --show-toplevel', path);
    
    // Get current branch
    let branch = '';
    try {
      branch = await runCmd('git branch --show-current', path);
      if (!branch) {
        branch = await runCmd('git rev-parse --abbrev-ref HEAD', path);
      }
    } catch {
      branch = 'HEAD';
    }

    // Get porcelain status
    const statusOutput = await runCmd('git status --porcelain -u', path);
    const statusMap: Record<string, GitFileStatus> = {};

    if (statusOutput) {
      const lines = statusOutput.split('\n');
      for (const line of lines) {
        if (line.length < 4) continue;
        const statusCode = line.substring(0, 2);
        // git status --porcelain outputs path relative to repo root or active cwd
        // Let's resolve the path relative to the repo root
        const fileRelativePath = line.substring(3).trim();
        const absolutePath = resolve(repoRoot, fileRelativePath);

        // Status code interpretation:
        // XY where X is index, Y is work tree
        // '??' = untracked
        // '!!' = ignored
        // 'A ' or ' A' = added / staged add
        // 'M ' or ' M' = modified / staged mod
        let status: GitFileStatus = 'modified';
        if (statusCode === '??') {
          status = 'untracked';
        } else if (statusCode === '!!') {
          status = 'ignored';
        } else if (statusCode.includes('A')) {
          status = 'added';
        } else if (statusCode.startsWith('M')) {
          status = 'staged';
        } else if (statusCode.endsWith('M')) {
          status = 'modified';
        }

        statusMap[absolutePath] = status;
      }
    }

    return {
      isInstalled: true,
      isRepo: true,
      branch,
      repoRoot,
      statusMap,
    };
  } catch {
    // Directory is not a git repository
    return {
      isInstalled: true,
      isRepo: false,
      branch: '',
      repoRoot: '',
      statusMap: {},
    };
  }
}

export async function getGitHistory(path: string): Promise<GitCommit[]> {
  const installed = await isGitInstalled();
  if (!installed) return [];

  try {
    const logOutput = await runCmd('git log -n 30 --pretty=format:"%h|%an|%ad|%s" --date=short', path);
    if (!logOutput) return [];

    const lines = logOutput.split('\n');
    return lines.map((line) => {
      const [hash, author, date, message] = line.split('|');
      return {
        hash: hash ?? '',
        author: author ?? '',
        date: date ?? '',
        message: message ?? '',
      };
    });
  } catch {
    return [];
  }
}
