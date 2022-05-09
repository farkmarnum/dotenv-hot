// import fs from 'fs';

import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';

const Watch = () => {
  useEffect(() => {
    // fs.watch()
  }, []);

  return (
    <Box marginTop={1}>
      <Text>
        Watching <Text color="yellowBright">.env</Text> for changes
      </Text>
      <Spinner type="monkey" />
    </Box>
  );
};

export default Watch;
