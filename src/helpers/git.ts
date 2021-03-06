import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

import {
  GITATTRIBUTES_FILE,
  GIT_FILTER_SCRIPT_FILENAME,
  GIT_FILTER_SCRIPT_CONTENTS,
  GIT_FILTER_NAME,
  GITATTRIBUTES_COMMENT_PREFIX,
} from './constants';

export const checkForGitRepo = (): string | undefined => {
  try {
    execSync('git status'); // Throws error if no git repo
    return undefined;
  } catch {
    return "This directory doesn't seem to be a git repository.";
  }
};

export const checkForCleanWorkingTree = (): string | undefined => {
  const output = execSync('git status --porcelain', { encoding: 'utf-8' });
  if (output.length > 0) {
    return `Git working tree must be clean before 'install' can be run. Please commit or stash your changes. The current working tree:\n${output}`;
  }
  return undefined;
};

export const createGitFilterScript = (scriptsDir: string) => {
  const fullpath = path.resolve(scriptsDir, GIT_FILTER_SCRIPT_FILENAME);

  fs.mkdirSync(scriptsDir, { recursive: true });
  fs.writeFileSync(fullpath, GIT_FILTER_SCRIPT_CONTENTS);
  fs.chmodSync(fullpath, '755');
};

export const writeGitattributes = ({
  envFromFileRelativePath,
  scriptsDir,
}: {
  envFromFileRelativePath: string;
  scriptsDir: string;
}) => {
  let contents = '';
  if (fs.existsSync(GITATTRIBUTES_FILE)) {
    contents = `${fs.readFileSync(GITATTRIBUTES_FILE, 'utf-8')}`;
  }

  const addition = [
    `${envFromFileRelativePath} filter=${GIT_FILTER_NAME}`,
    `${GITATTRIBUTES_COMMENT_PREFIX} script=${scriptsDir}`,
  ].join('\n');

  // If this line isn't in .gitattributes yet, add it:
  if (!contents.includes(addition)) {
    fs.writeFileSync(GITATTRIBUTES_FILE, `${contents}\n${addition}\n`);
  }
};

// Add this filter to .git/config:
export const enableGitFilter = (scriptsDir: string) => {
  const scriptFullpath = path.resolve(scriptsDir, GIT_FILTER_SCRIPT_FILENAME);

  execSync(
    `git config --local filter.${GIT_FILTER_NAME}.clean ${scriptFullpath}`,
  );
};

// Stage a file:
export const gitStage = (filename: string) => {
  execSync(`git add ${filename}`);
};

// Get git config:
export const getGitConfig = () =>
  execSync('git config --list --local', { encoding: 'utf-8' });

// Get git root dir:
export const getGitRepoRootDir = () =>
  execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();

// Remove git filter:
export const removeGitFilter = () =>
  execSync(`git config --local --unset-all filter.${GIT_FILTER_NAME}.clean`);
