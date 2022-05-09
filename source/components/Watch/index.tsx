import fs from 'fs';

import React, { useEffect } from 'react';
import { Box, Text, useApp } from 'ink';
import Spinner from 'ink-spinner';
import {
  ENV_FILENAME,
  ENV_MODULE_COMMENT,
  GITATTRIBUTES_FILE,
} from '../../helpers/constants';

const Watch = () => {
  const { exit } = useApp();

  useEffect(() => {
    if (!fs.existsSync(ENV_FILENAME)) {
      console.error(`ERROR: could not find ${ENV_FILENAME}`);
      exit();
    }

    fs.watchFile(ENV_FILENAME, () => {
      const env = fs.readFileSync(ENV_FILENAME, 'utf-8');

      const parsedEnv: [string, string][] = env
        .split('\n')
        .map((str) => str.trim())
        .filter((a) => a.length > 0 && !a.startsWith('#'))
        .map((str) => {
          const [name, ...rest] = str.split('=');

          return [name, rest.join('=')];
        })
        .filter(
          ([name, value]) => name !== undefined && value !== undefined,
        ) as [string, string][]; // TODO remove the type cast and use a type guard

      const newEnvContent = parsedEnv
        .map(([name, value]) =>
          value
            ? `export ${name} = '${value}' || process.env.${name};`
            : `export ${name} = process.env.${name};`,
        )
        .join('\n');

      const envContent = `${ENV_MODULE_COMMENT}\n${newEnvContent}`;

      const gitattributes = fs.readFileSync(GITATTRIBUTES_FILE, 'utf-8');
      const match = gitattributes.match(
        /^(?<envModulePath>.*env\.[jt]s) filter=/,
      );
      if (!match || !match.groups || !match.groups['envModulePath']) {
        console.error(
          `ERROR: could not find env.ts or env.js referenced in ${GITATTRIBUTES_FILE}`,
        );
        exit();
        return;
      }

      const { envModulePath } = match.groups;

      fs.writeFileSync(envModulePath, envContent);
    });
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
