import React from 'react';
import { Box, Newline, Text } from 'ink';
import SelectInput, { ItemProps } from 'ink-select-input';

import {
  GIT_FILTER_SCRIPT_FULLPATH,
  ENV_FROM_FILE_FILENAME,
  ENV_MODULE_FILENAME,
  GITATTRIBUTES_FILE,
} from '../../helpers/constants';

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
        <Newline />· Two files,{' '}
        <Text color="yellowBright">{ENV_FROM_FILE_FILENAME}</Text>and{' '}
        <Text color="yellowBright">{ENV_MODULE_FILENAME}</Text>, in the
        directory of your choosing
        <Newline />
        <Newline />
        This tool will also modify the following files:
        <Newline />· <Text color="yellowBright">{GITATTRIBUTES_FILE}</Text>{' '}
        (should be checked in to git)
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
