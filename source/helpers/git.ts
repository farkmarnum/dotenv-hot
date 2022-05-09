import fs from 'fs';
import { exec } from 'child_process';

import {
  GIT_FILTER_SCRIPT_DIR,
  GIT_FILTER_SCRIPT_FULLPATH,
  GIT_FILTER_SCRIPT_CONTENTS,
  GIT_FILTER_NAME,
  WORKING_DIR,
} from './constants';

export const createGitFilterScript = () => {
  fs.mkdirSync(GIT_FILTER_SCRIPT_DIR, { recursive: true });
  fs.writeFileSync(GIT_FILTER_SCRIPT_FULLPATH, GIT_FILTER_SCRIPT_CONTENTS);
};

const GITATTRIBUTES_FILE = `${WORKING_DIR}/.gitattributes`;

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

// Add this filter to .git/config
export const enableGitFilter = () => {
  exec(
    `git config --local filter.${GIT_FILTER_NAME}.clean ${GIT_FILTER_SCRIPT_FULLPATH}`,
  );
};
