import React, { useEffect } from 'react';
import { Box, useApp } from 'ink';
import Setup from './components/Setup';
import Watch from './components/Watch';
import { COMMANDS, PACKAGE_NAME } from './helpers/constants';

const App: React.FC<{ args: string[] }> = ({ args }) => {
  const [command] = args;

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

  return (
    <Box>
      {command === 'setup' && <Setup />}
      {command === 'watch' && <Watch />}
    </Box>
  );
};

export default App;
