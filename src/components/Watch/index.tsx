import fs from 'fs';
import React, { useState, useEffect } from 'react';
import { Box, Newline, Text } from 'ink';
import Spinner from 'ink-spinner';
import chalk from 'chalk';
import stripComments from 'strip-comments';
import {
  ENV_FILENAME,
  ENV_FROM_FILE_COMMENT,
  ENV_FROM_FILE_FILENAME,
  GITATTRIBUTES_FILE,
  GIT_FILTER_SCRIPT_FULLPATH,
  GIT_FILTER_NAME,
  PACKAGE_NAME,
  ENV_MODULE_FILENAME,
  IS_TYPESCRIPT,
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

const getEnvModuleDirFromGitattributes = () => {
  const gitattributes = fs.readFileSync(GITATTRIBUTES_FILE, 'utf-8');
  const pattern = RegExp(
    `^(?<envModulePath>.*)${ENV_FROM_FILE_FILENAME} filter=`,
    'm',
  );
  const match = gitattributes.match(pattern);

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

const parseEnv = (env: string): Record<string, string> =>
  Object.fromEntries(
    env
      .split('\n')
      .map((str) => str.trim())
      .filter((a) => a.length > 0 && !a.startsWith('#'))
      .map((str) => {
        const [name, ...rest] = str.split('=');

        return [name, rest.join('=')];
      }),
  );

const generateEnvContent = (
  variableExports: string,
) => `${ENV_FROM_FILE_COMMENT}

export default {
${variableExports}
}${IS_TYPESCRIPT ? ' as Record<string, string>' : ''};
`;

type SetWarnings = (warnings: React.ReactNode[]) => void;

const warnIfMissing = ({
  parsedEnv,
  setWarnings,
  envModuleFullpath,
}: {
  parsedEnv: Record<string, string>;
  setWarnings: SetWarnings;
  envModuleFullpath: string;
}) => {
  const envModuleContents = fs.readFileSync(envModuleFullpath, 'utf-8');
  const envModuleNoComments = stripComments(envModuleContents);

  setWarnings(
    Object.keys(parsedEnv).reduce((acc, name) => {
      if (!envModuleNoComments.includes(`export const ${name}`)) {
        acc.push(
          <Text>
            <Text color="yellowBright">{envModuleFullpath}</Text> does not
            export <Text color="cyanBright">{name}</Text>, but it is defined in
            your <Text color="yellowBright">.env</Text>.
          </Text>,
        );
      }
      return acc;
    }, [] as React.ReactNode[]),
  );
};

const updateEnvModuleFactory =
  ({
    envModuleDir,
    setWarnings,
  }: {
    envModuleDir: string;
    setWarnings: SetWarnings;
  }) =>
  () => {
    const env = fs.readFileSync(ENV_FILENAME, 'utf-8');
    const parsedEnv = parseEnv(env);

    const variableExports = Object.entries(parsedEnv)
      .map(([name, value]) => `  ${name}: '${slashQuotes(value)}',`)
      .join('\n');

    const envContent = generateEnvContent(variableExports);

    fs.writeFileSync(`${envModuleDir}${ENV_FROM_FILE_FILENAME}`, envContent);

    const envModuleFullpath = `${envModuleDir}${ENV_MODULE_FILENAME}`;
    warnIfMissing({ parsedEnv, setWarnings, envModuleFullpath });
  };

const watchFileOptions = { interval: 1000 };

const Watch = () => {
  const [isWatching, setIsWatching] = useState(false);
  const [warnings, setWarnings] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    ensureThatSetupHasHappened();

    const envModuleDir = getEnvModuleDirFromGitattributes();
    const updateEnvModule = updateEnvModuleFactory({
      envModuleDir,
      setWarnings,
    });

    const envModuleFullpath = `${envModuleDir}${ENV_MODULE_FILENAME}`;
    const watchers = [
      fs.watchFile(ENV_FILENAME, watchFileOptions, updateEnvModule),
      fs.watchFile(envModuleFullpath, watchFileOptions, updateEnvModule),
    ];

    updateEnvModule();

    setIsWatching(true);

    return () => {
      watchers.forEach((watcher) => watcher.unref());
    };
  }, []);

  return (
    <Box marginTop={1}>
      {isWatching && (
        <Box>
          <Text>
            <Text color="green">dotenv-hot</Text>
            <Newline />
            <Text color="green">----------</Text>
            <Newline />
            <Text color="cyanBright">
              <Spinner />
            </Text>{' '}
            Watching <Text color="yellowBright">.env</Text> for changes...
            <Newline />
            <Newline />
            {warnings.map((warning, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <React.Fragment key={i}>
                <Text>
                  <Text color="redBright">🚨 WARNING: </Text>
                  {warning}
                </Text>
                <Newline />
              </React.Fragment>
            ))}
            {warnings.length === 0 && (
              <Text color="greenBright">✅ No warnings</Text>
            )}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default Watch;
