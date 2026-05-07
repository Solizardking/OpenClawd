import React from 'react';
import { Box, Text } from 'ink';
import { LOBSTER_RED, SOLANA_GREEN, SOLANA_PURPLE, STATUS_DIM } from '../theme/colors.js';

export type Line =
  | { kind: 'user'; text: string }
  | { kind: 'system'; text: string }
  | { kind: 'tool'; text: string }
  | { kind: 'agent'; text: string }
  | { kind: 'error'; text: string };

export function Conversation({ lines }: { lines: Line[] }) {
  return (
    <Box flexDirection="column">
      {lines.slice(-30).map((l, i) => {
        switch (l.kind) {
          case 'user':
            return (
              <Box key={i}>
                <Text color={SOLANA_GREEN}>❯ </Text>
                <Text>{l.text}</Text>
              </Box>
            );
          case 'system':
            return (
              <Box key={i}>
                <Text color={SOLANA_PURPLE}>┊ </Text>
                <Text color={SOLANA_PURPLE}>{l.text}</Text>
              </Box>
            );
          case 'tool':
            return (
              <Box key={i}>
                <Text color={STATUS_DIM}>┊ </Text>
                <Text color={STATUS_DIM}>{l.text}</Text>
              </Box>
            );
          case 'agent':
            return (
              <Box key={i}>
                <Text color={LOBSTER_RED}>🦞 </Text>
                <Text>{l.text}</Text>
              </Box>
            );
          case 'error':
            return (
              <Box key={i}>
                <Text color={LOBSTER_RED}>✗ </Text>
                <Text color={LOBSTER_RED}>{l.text}</Text>
              </Box>
            );
        }
      })}
    </Box>
  );
}
