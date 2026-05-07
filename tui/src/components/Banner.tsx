import React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import { GRADIENT_SOLANA, LOBSTER_RED, SOLANA_GREEN, SOLANA_PURPLE } from '../theme/colors.js';

const LOBSTER_ART = [
  '          🦞🦞🦞          ',
  '       ／／＼∀／＼＼       ',
  '      ／  ◉   ◉  ＼      ',
  '     ｜    ⋃    ｜     ',
  '      ＼____／＼____／      ',
  '         ╱│  │╲         ',
];

const TITLE = [
  '╔═══════════════════════════════════════════════════════════╗',
  '║   ╔═╗╦  ╔═╗╦ ╦╔╦╗     $CLAWD on Solana 🦞                 ║',
  '║   ║  ║  ╠═╣║║║ ║║      hotline 909-413-5567               ║',
  '║   ╚═╝╩═╝╩ ╩╚╩╝═╩╝     npm i clawd-code-cli                ║',
  '╚═══════════════════════════════════════════════════════════╝',
];

export function Banner({ model, version }: { model: string; version: string }) {
  return (
    <Box flexDirection="column" paddingLeft={1} marginBottom={1}>
      {LOBSTER_ART.map((line, i) => (
        <Text key={`art-${i}`} color={LOBSTER_RED}>{line}</Text>
      ))}
      <Box flexDirection="column" marginTop={1}>
        {TITLE.map((line, i) => (
          <Gradient key={`t-${i}`} colors={GRADIENT_SOLANA}>
            <Text>{line}</Text>
          </Gradient>
        ))}
      </Box>
      <Box marginTop={1}>
        <Text color={SOLANA_GREEN}>⚕</Text>
        <Text color={SOLANA_PURPLE}> {model}</Text>
        <Text color="gray">  │  </Text>
        <Text color={SOLANA_GREEN}>Solana mainnet</Text>
        <Text color="gray">  │  </Text>
        <Text color={LOBSTER_RED}>v{version}</Text>
      </Box>
    </Box>
  );
}
