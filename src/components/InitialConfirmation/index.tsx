import path from 'path';
import React from 'react';
import { Box, Newline, Text } from 'ink';
import SelectInput, { ItemProps } from 'ink-select-input';

import {
  GIT_FILTER_SCRIPT_FILENAME,
  ENV_FROM_FILE_FILENAME,
  ENV_MODULE_FILENAME,
  GITATTRIBUTES_FILE,
  PACKAGE_NAME,
} from '../../helpers/constants';

const ItemComponent = ({ isSelected, label }: ItemProps) => (
  <Text color={isSelected ? 'cyanBright' : 'white'} bold={isSelected}>
    {label}
  </Text>
);

const InitialConfirmation = ({
  confirm,
  scriptsDir,
  envModuleDir,
}: {
  confirm: (resp: boolean) => void;
  scriptsDir: string;
  envModuleDir: string;
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
        <Newline />
        This tool will generate the following files:
        <Newline />· A script for use by git:{' '}
        <Text color="yellowBright">
          {path.resolve(scriptsDir, GIT_FILTER_SCRIPT_FILENAME)}
        </Text>
        <Newline />· Two files,{' '}
        <Text color="yellowBright">
          {path.resolve(envModuleDir, ENV_FROM_FILE_FILENAME)}
        </Text>{' '}
        and{' '}
        <Text color="yellowBright">
          {path.resolve(envModuleDir, ENV_MODULE_FILENAME)}
        </Text>
        <Newline />
        <Newline />
        This tool will also modify the following files:
        <Newline />· <Text color="yellowBright">{GITATTRIBUTES_FILE}</Text>{' '}
        (should be checked in to git)
        <Newline />· <Text color="yellowBright">.git/config</Text> (is not
        checked in to git)
        <Newline />
        <Newline />
        NOTE: if you would like to adjust the directories used for the above
        files, run <Text color="cyanBright">npx {PACKAGE_NAME} --help</Text>
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
