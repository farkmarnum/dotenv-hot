import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

const SearchQuery = () => {
  const [query, setQuery] = useState('');
  console.log(query);

  return (
    <Box>
      <Box marginRight={1}>
        <Text>Enter your query:</Text>
      </Box>

      <TextInput value={query} onChange={setQuery} />
    </Box>
  );
};

const Setup = () => <SearchQuery />;

export default Setup;
