import fs from 'fs';
import {
  ENV_FROM_FILE_COMMENT,
  ENV_FROM_FILE_TEMPLATE,
  ENV_MODULE_COMMENT,
  ENV_MODULE_TEMPLATE,
} from './constants';

const fileChecker =
  (patternToCheck: string) =>
  (filePath: string): string | undefined => {
    const hasFileAlready = fs.existsSync(filePath);

    if (hasFileAlready) {
      const contents = fs.readFileSync(filePath, 'utf-8');
      if (!contents.includes(patternToCheck)) {
        return `You already have a file at ${filePath}, and that file would be overwritten by this tool. Please remove it.`;
      }
    }
    return undefined;
  };

/* Can't already have a .envFromFile.[js|ts] file, unless it was generated by this tool. */
export const checkForExistingEnvFromFile = fileChecker(ENV_FROM_FILE_COMMENT);

/* Can't already have a env.[js|ts] file, unless it was generated by this tool. */
export const checkForExistingEnvModule = fileChecker(ENV_MODULE_COMMENT);

export const writeEnvFromFileInit = (envFromFile: string): void => {
  fs.writeFileSync(envFromFile, ENV_FROM_FILE_TEMPLATE);
};

export const writeEnvModuleInit = (envModule: string): void => {
  fs.writeFileSync(envModule, ENV_MODULE_TEMPLATE);
};