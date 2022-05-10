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
  GIT_FILTER_SCRIPT_FILENAME,
  GIT_FILTER_NAME,
  PACKAGE_NAME,
  ENV_MODULE_FILENAME,
  IS_TYPESCRIPT,
} from '../../helpers/constants';
import { getGitConfig, enableGitFilter, gitStage } from '../../helpers/git';

const showWarning = (msg: string) => {
  console.error(
    `${chalk.red('ERROR:')} ${chalk.yellow(
      msg,
    )} -- have you run ${chalk.cyanBright(`npx ${PACKAGE_NAME} setup`)} yet?`,
  );
};

const ensureGitFilter = ({ scriptsDir }: { scriptsDir: string }) => {
  const gitConfigPattern = RegExp(
    `filter.${GIT_FILTER_NAME}.clean=.*${GIT_FILTER_SCRIPT_FILENAME}`,
    'm',
  );
  const gitConfig = getGitConfig();

  const gitFilterNotEnabled = !gitConfigPattern.test(gitConfig);

  if (gitFilterNotEnabled) {
    enableGitFilter(scriptsDir);
  }
};

const ensureThatSetupHasHappened = ({
  envModuleDir,
  scriptsDir,
}: {
  envModuleDir: string;
  scriptsDir: string;
}) => {
  // Ensure that necessary files are present:
  [
    `${envModuleDir}/${ENV_FILENAME}`,
    `${scriptsDir}/${GIT_FILTER_SCRIPT_FILENAME}`,
  ].forEach((filename) => {
    if (!fs.existsSync(filename)) {
      showWarning(`Could not find ${filename}`);
      process.exit(1);
    }
  });

  // Ensure that git filter is enabled
  ensureGitFilter({ scriptsDir });
};

const getDataFromGitattributes = () => {
  let gitattributes: string = '';

  try {
    gitattributes = fs.readFileSync(GITATTRIBUTES_FILE, 'utf-8');
  } catch (err) {
    if ((err as Record<string, string>).code === 'ENOENT') {
      showWarning(`Could not find ${GITATTRIBUTES_FILE}`);
      process.exit(1);
    }
  }

  const pattern = RegExp(
    `^(?<envModuleDir>.*)${ENV_FROM_FILE_FILENAME} filter=(.*)# script=(?<scriptsDir>.*)`,
    'm',
  );
  const match = gitattributes.match(pattern);

  if (
    !match ||
    !match.groups ||
    !match.groups.envModuleDir ||
    !match.groups.scriptsDir
  ) {
    console.error(
      `ERROR: could not the relevant data in ${GITATTRIBUTES_FILE}`,
    );
    process.exit();
  }

  const { envModuleDir, scriptsDir } = match.groups;

  return { envModuleDir, scriptsDir };
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

    // NOTE: sometimes the `git` working tree looks like it should be clean, but there appears to be a modification made to the `envFromFile` file -- running `git add` fixes it:
    gitStage(`${envModuleDir}${ENV_FROM_FILE_FILENAME}`);

    const envModuleFullpath = `${envModuleDir}${ENV_MODULE_FILENAME}`;
    warnIfMissing({ parsedEnv, setWarnings, envModuleFullpath });
  };

const watchFileOptions = { interval: 1000 };

const Watch = () => {
  const [isWatching, setIsWatching] = useState(false);
  const [warnings, setWarnings] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const { envModuleDir, scriptsDir } = getDataFromGitattributes();

    ensureThatSetupHasHappened({ envModuleDir, scriptsDir });

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
