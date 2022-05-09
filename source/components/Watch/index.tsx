import fs from 'fs';

import React, { useEffect } from 'react';
import { Box, Text, useApp } from 'ink';
import Spinner from 'ink-spinner';
import {
  ENV_FILENAME,
  ENV_MODULE_COMMENT,
  GITATTRIBUTES_FILE,
} from '../../helpers/constants';

const slashQuotes = (s: string) => s.replace(/'/g, "\\'");

const updateEnvModule = () => {
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

  const gitattributes = fs.readFileSync(GITATTRIBUTES_FILE, 'utf-8');
  const match = gitattributes.match(/^(?<envModulePath>.*env\.[jt]s) filter=/m);

  if (!match || !match.groups || !match.groups['envModulePath']) {
    console.error(
      `ERROR: could not find env.ts or env.js referenced in ${GITATTRIBUTES_FILE}`,
    );
    process.exit();
  }

  const { envModulePath } = match.groups;

  fs.writeFileSync(envModulePath, envContent);
};

const Watch = () => {
  const { exit } = useApp();

  useEffect(() => {
    if (!fs.existsSync(ENV_FILENAME)) {
      console.error(`ERROR: could not find ${ENV_FILENAME}`);
      exit();
    }

    const watcher = fs.watchFile(ENV_FILENAME, updateEnvModule);

    updateEnvModule();

    return () => {
      watcher.unref();
    };
  }, [exit]);

  return (
    <Box marginTop={1}>
      <Text color="cyanBright">
        <Spinner />
      </Text>
      <Box marginLeft={1}>
        <Text>
          Watching <Text color="yellowBright">.env</Text> for changes...
        </Text>
      </Box>
    </Box>
  );
};

export default Watch;
