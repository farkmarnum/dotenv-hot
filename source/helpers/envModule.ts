import fs from 'fs';
import { ENV_MODULE_COMMENT } from './constants';

export const writeEnvModuleInit = (envFile: string): void => {
  fs.writeFileSync(envFile, ENV_MODULE_COMMENT);
};
