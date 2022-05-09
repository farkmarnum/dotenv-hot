import fs from 'fs';
import { WORKING_DIR, ENV_MODULE_COMMENT } from './constants';

/* Must be a git repo */
export const guardGit = (): string | undefined => {
  const isGitRepository = fs.existsSync(`${WORKING_DIR}/.git`);
  if (!isGitRepository) {
    return "This directory doesn't seem to be a git repository (couldn't find .git)";
  }
  return undefined;
};

/* Can't already have a env.js or env.ts file, unless it was generated by this tool. */
export const guardEnvModule = (envModulePath: string): string | undefined => {
  const hasEnvModuleAlready = fs.existsSync(envModulePath);

  if (hasEnvModuleAlready) {
    const contents = fs.readFileSync(envModulePath, 'utf-8');
    if (!contents.includes(ENV_MODULE_COMMENT)) {
      return `You already have a file at ${envModulePath}, and that file would be overwritten by this tool. Please remove it.`;
    }
  }
  return undefined;
};
