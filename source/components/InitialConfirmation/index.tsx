import React from 'react';
import { Box, Newline, Text } from 'ink';
import SelectInput, { ItemProps } from 'ink-select-input';

import { GIT_FILTER_SCRIPT_FULLPATH } from '../../helpers/constants';

const ItemComponent = ({ isSelected, label }: ItemProps) => (
  <Text color={isSelected ? 'cyanBright' : 'white'} bold={isSelected}>
    {label}
  </Text>
);

const InitialConfirmation = ({
  confirm,
}: {
  confirm: (resp: boolean) => void;
}) => {
  const items: { value: boolean; label: string }[] = [
    {
      value: true,
      label: 'Yes',
    },
    {
      value: false,
      label: 'No',
    },
  ];

  return (
    <Box flexDirection="column">
      <Text>
        <Text color="magentaBright">Warning!</Text>
        <Newline />
        This tool will generate the following files:
        <Newline />· A script for use by git:{' '}
        <Text color="yellowBright">{GIT_FILTER_SCRIPT_FULLPATH}</Text>
        <Newline />· A <Text color="yellowBright">env.ts</Text> or{' '}
        <Text color="yellowBright">env.js</Text> file in the directory of your
        choosing
        <Newline />
        <Newline />
        This tool will also modify the following files:
        <Newline />· <Text color="yellowBright">.gitattributes</Text> (should be
        checked in to git)
        <Newline />· <Text color="yellowBright">.git/config</Text> (is not
        checked in to git)
        <Newline />
        <Newline />
        Would you like to continue?
      </Text>
      <SelectInput
        items={items}
        onSelect={({ value }) => confirm(value)}
        itemComponent={ItemComponent}
      />
    </Box>
  );
};

export default InitialConfirmation;
