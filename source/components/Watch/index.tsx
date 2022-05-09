import fs from 'fs';
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import chalk from 'chalk';
import {
  ENV_FILENAME,
  ENV_MODULE_COMMENT,
  GITATTRIBUTES_FILE,
  GIT_FILTER_SCRIPT_FULLPATH,
  GIT_FILTER_NAME,
  PACKAGE_NAME,
} from '../../helpers/constants';
import { getGitConfigConfig } from '../../helpers/git';

const ensureThatSetupHasHappened = () => {
  [GITATTRIBUTES_FILE, GIT_FILTER_SCRIPT_FULLPATH, ENV_FILENAME].forEach(
    (filename) => {
      if (!fs.existsSync(filename)) {
        console.error(
          `ERROR: could not find ${chalk.yellow(
            filename,
          )} -- have you run ${chalk.cyanBright(
            `npx ${PACKAGE_NAME} setup`,
          )} yet?`,
        );
        process.exit(1);
      }
    },
  );

  const gitConfigPattern = RegExp(
    `filter.${GIT_FILTER_NAME}.clean=${GIT_FILTER_SCRIPT_FULLPATH}`,
    'm',
  );
  const gitConfig = getGitConfigConfig();
  if (!gitConfigPattern.test(gitConfig)) {
    console.error(
      `ERROR: git config doesn't have the filter enabled. Have you run \`npx ${PACKAGE_NAME} setup\` yet?`,
    );
    process.exit(1);
  }
};

const getEnvModulePathFromGitattributes = () => {
  const gitattributes = fs.readFileSync(GITATTRIBUTES_FILE, 'utf-8');
  const match = gitattributes.match(/^(?<envModulePath>.*env\.[jt]s) filter=/m);

  if (!match || !match.groups || !match.groups.envModulePath) {
    console.error(
      `ERROR: could not find env.ts or env.js referenced in ${GITATTRIBUTES_FILE}`,
    );
    process.exit();
  }

  const { envModulePath } = match.groups;

  return envModulePath;
};

const slashQuotes = (s: string) => s.replace(/'/g, "\\'");

const updateEnvModuleFactory = (envModulePath: string) => () => {
  const env = fs.readFileSync(ENV_FILENAME, 'utf-8');

  const parsedEnv: Record<string, string> = Object.fromEntries(
    env
      .split('\n')
      .map((str) => str.trim())
      .filter((a) => a.length > 0 && !a.startsWith('#'))
      .map((str) => {
        const [name, ...rest] = str.split('=');

        return [name, rest.join('=')];
      }),
  );

  const newEnvContent = Object.entries(parsedEnv)
    .map(([name, value]) =>
      value
        ? `export const ${name} = '${slashQuotes(
            value,
          )}' || process.env.${name};`
        : `export const ${name} = process.env.${name};`,
    )
    .join('\n');

  const envContent = `${ENV_MODULE_COMMENT}
/* eslint-disable */

${newEnvContent}

/* eslint-enable */
`;

  fs.writeFileSync(envModulePath, envContent);
};

const Watch = () => {
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    ensureThatSetupHasHappened();

    const envModulePath = getEnvModulePathFromGitattributes();
    const updateEnvModule = updateEnvModuleFactory(envModulePath);

    const watcher = fs.watchFile(ENV_FILENAME, updateEnvModule);
    updateEnvModule();

    setIsWatching(true);

    return () => {
      watcher.unref();
    };
  }, []);

  return (
    <Box marginTop={1}>
      {isWatching && (
        <>
          <Text color="cyanBright">
            <Spinner />
          </Text>
          <Box marginLeft={1}>
            <Text>
              Watching <Text color="yellowBright">.env</Text> for changes...
            </Text>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Watch;
