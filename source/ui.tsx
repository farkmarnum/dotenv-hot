import React, { useState, useEffect } from 'react';
import { Box } from 'ink';
import ChooseCommand from './components/ChooseCommand';
import Setup from './components/Setup';
import Watch from './components/Watch';
import { COMMANDS } from './helpers/constants';

const parseCommand = (args: string[]): Command | undefined => {
  const [command] = args;
  if (command === undefined || COMMANDS.includes(command as Command)) {
    return undefined;
  }
  return command as Command;
};

const App: React.FC<{ args: string[] }> = ({ args }) => {
  const [command, setCommand] = useState<Command | undefined>();

  useEffect(() => {
    const commandFromArgs = parseCommand(args);
    if (commandFromArgs) {
      setCommand(commandFromArgs);
    }
  }, []);

  return (
    <Box>
      {command === undefined && <ChooseCommand setCommand={setCommand} />}
      {command === 'setup' && <Setup />}
      {command === 'watch' && <Watch />}
    </Box>
  );
};

export default App;
