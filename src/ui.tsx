import path from 'path';
import React, { useEffect } from 'react';
import { Box, useApp } from 'ink';
import Setup from './components/Setup';
import Watch from './components/Watch';
import { COMMANDS, PACKAGE_NAME } from './helpers/constants';
import { getGitRepoRootDir } from './helpers/git';

const GIT_ROOT_DIR = getGitRepoRootDir();
const CWD = process.cwd();

const DEFAULTS = {
  envModuleDir: 'src',
  scriptsDir: 'scripts',
  shouldSkipConfirmations: false,
};

const App: React.FC<{
  command?: string;
  envModuleDir?: string;
  scriptsDir?: string;
  shouldSkipConfirmations?: boolean;
}> = ({ command, envModuleDir, scriptsDir, shouldSkipConfirmations }) => {
  const { exit } = useApp();

  useEffect(() => {
    if (command === undefined || !COMMANDS.includes(command as Command)) {
      console.error(
        [
          `USAGE: npx ${PACKAGE_NAME} [command]`,
          `Try npx ${PACKAGE_NAME} --help`,
        ].join('\n\n'),
      );
      exit();
    }
  }, []);

  const envModuleDirFull = path.join(
    GIT_ROOT_DIR,
    envModuleDir || DEFAULTS.envModuleDir,
  );
  const envModuleDirRelative = path.relative(CWD, envModuleDirFull);

  const scriptsDirFull = path.join(
    GIT_ROOT_DIR,
    scriptsDir || DEFAULTS.scriptsDir,
  );
  const scriptsDirRelative = path.relative(CWD, scriptsDirFull);

  return (
    <Box>
      {command === 'setup' && (
        <Setup
          envModuleDir={envModuleDirRelative}
          scriptsDir={scriptsDirRelative}
          shouldSkipConfirmations={
            shouldSkipConfirmations || DEFAULTS.shouldSkipConfirmations
          }
        />
      )}
      {command === 'watch' && <Watch />}
    </Box>
  );
};

export default App;
