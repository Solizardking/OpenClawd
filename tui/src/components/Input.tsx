import React, { useMemo, useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { COMMANDS } from '../commands/registry.js';
import { LOBSTER_RED, SOLANA_GREEN, STATUS_DIM } from '../theme/colors.js';

interface Props {
  onSubmit: (text: string) => void;
  busy?: boolean;
}

export function Input({ onSubmit, busy }: Props) {
  const [value, setValue] = useState('');

  const suggestion = useMemo(() => {
    if (!value.startsWith('/') && !value.startsWith('!')) return null;
    const stem = value.slice(1).split(/\s/)[0];
    if (!stem) return null;
    const match = COMMANDS.find((c) => c.name.startsWith(stem) && c.name !== stem);
    return match ? `${value[0]}${match.name}` : null;
  }, [value]);

  return (
    <Box flexDirection="column">
      <Box>
        <Text color={busy ? LOBSTER_RED : SOLANA_GREEN}>❯ </Text>
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={(t) => {
            if (!t.trim()) return;
            onSubmit(t);
            setValue('');
          }}
          placeholder={busy ? 'agent working — type to interrupt or queue' : 'type / for commands or chat to clawd'}
        />
      </Box>
      {suggestion ? (
        <Text color={STATUS_DIM}>  ↳ tab: {suggestion}</Text>
      ) : null}
    </Box>
  );
}
