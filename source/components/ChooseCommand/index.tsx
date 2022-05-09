import React from 'react';
import { Box, Text } from 'ink';
import SelectInput, { ItemProps } from 'ink-select-input';

const ItemComponent = ({ isSelected, label }: ItemProps) => (
  <Text color={isSelected ? 'cyanBright' : 'white'} bold={isSelected}>
    {label}
  </Text>
);

const ChooseCommand = ({
  setCommand,
}: {
  setCommand: (c: Command) => void;
}) => {
  const items: { value: Command; label: string }[] = [
    {
      value: 'setup',
      label: 'Setup',
    },
    {
      value: 'watch',
      label: 'Watch',
    },
  ];

  return (
    <Box flexDirection="column">
      <Text color="green">Choose a command:</Text>
      <SelectInput
        items={items}
        onSelect={({ value }) => setCommand(value)}
        itemComponent={ItemComponent}
      />
    </Box>
  );
};

export default ChooseCommand;
