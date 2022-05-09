import fs from 'fs';
import { execSync } from 'child_process';

import {
  GIT_FILTER_SCRIPT_DIR,
  GIT_FILTER_SCRIPT_FULLPATH,
  GIT_FILTER_SCRIPT_CONTENTS,
  GIT_FILTER_NAME,
} from './constants';

const GITATTRIBUTES_FILE = '.gitattributes';

export const checkForGitRepo = (): string | undefined => {
  const isGitRepository = fs.existsSync('.git');
  if (!isGitRepository) {
    return "This directory doesn't seem to be a git repository (couldn't find .git)";
  }
  return undefined;
};

export const checkForCleanWorkingTree = (): string | undefined => {
  const output = execSync('git status --porcelain', { encoding: 'utf-8' });
  if (output.length > 0) {
    return "Git working tree must be clean before 'setup' can be run. Please commit or stash your changes.";
  }
  return undefined;
};

export const createGitFilterScript = () => {
  fs.mkdirSync(GIT_FILTER_SCRIPT_DIR, { recursive: true });
  fs.writeFileSync(GIT_FILTER_SCRIPT_FULLPATH, GIT_FILTER_SCRIPT_CONTENTS);
  fs.chmodSync(GIT_FILTER_SCRIPT_FULLPATH, '755');
};

export const writeGitattributes = (envModuleDir: string) => {
  let contents = '';
  if (fs.existsSync(GITATTRIBUTES_FILE)) {
    contents = `${fs.readFileSync(GITATTRIBUTES_FILE, 'utf-8')}\n`;
  }

  const addition = `${envModuleDir} filter=${GIT_FILTER_NAME}`;

  // If this line isn't in .gitattributes yet, add it:
  if (!contents.includes(addition)) {
    contents += addition;
    contents += '\n';
  }

  fs.writeFileSync(GITATTRIBUTES_FILE, contents);
};

// Add this filter to .git/config:
export const enableGitFilter = () => {
  execSync(
    `git config --local filter.${GIT_FILTER_NAME}.clean ${GIT_FILTER_SCRIPT_FULLPATH}`,
  );
};

// Stage all files:
export const gitStageAll = () => {
  execSync('git add .');
};
