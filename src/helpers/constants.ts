import packageInfo from '../../package.json';
import { isTypescript } from './util';

export const PACKAGE_NAME = packageInfo.name;

export const ENV_FILENAME = '.env';

export const IS_TYPESCRIPT = isTypescript();

const EXTENSION = IS_TYPESCRIPT ? 'ts' : 'js';

const ENV_FROM_FILE_PREFIX = '.envFromFile';

export const ENV_FROM_FILE_FILENAME = `${ENV_FROM_FILE_PREFIX}.${EXTENSION}`;
export const ENV_FROM_FILE_COMMENT = `// THIS FILE IS AUTOGENERATED BY ${PACKAGE_NAME} -- DO NOT MODIFY`;
export const ENV_FROM_FILE_TEMPLATE = `${ENV_FROM_FILE_COMMENT}

export default {}${IS_TYPESCRIPT ? ' as Record<string, string>' : ''};
`;

export const ENV_MODULE_FILENAME = `env.${EXTENSION}`;
export const ENV_MODULE_COMMENT = `This module lets us import variables from .env (via ${ENV_FROM_FILE_FILENAME}) with a fallback on process.env.`;
export const ENV_MODULE_TEMPLATE = `/**
 * ${ENV_MODULE_COMMENT}
 *  - In development, this loads new values in a way that is compatible with hot reloading.
 *  - In production, ${ENV_FROM_FILE_FILENAME} will be empty, so we'll just be relying on process.env.
 */
import envFromFile from "./${ENV_FROM_FILE_PREFIX}";

/**
 * To ingest values from .env in prod, run 'yarn add dotenv' add uncomment the code below.
 */
// import dotenv from 'dotenv';
// if (process.env.NODE_ENV === 'production') {
//   dotenv.config();
// }

/**
 * NOTE: when adding environment variables, add a new line like this to export the variable:
 *   export const VAR_NAME = envFromFile.VAR_NAME || process.env.VAR_NAME;
 */
`;

export const COMMANDS = ['setup', 'watch'] as const;

export const GIT_FILTER_NAME = 'dotenv-hot-env-module';

export const GIT_FILTER_SCRIPT_FILENAME = `git-filter-${GIT_FILTER_NAME}.sh`;

export const GIT_FILTER_SCRIPT_CONTENTS = `echo "${ENV_FROM_FILE_TEMPLATE}"`;

export const GITATTRIBUTES_FILE = '.gitattributes';
