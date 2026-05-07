import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { readLeviathanState, type LeviathanState } from '../framework/leviathan.js';
import { ClawdSpinner } from '../spinners/Spinner.js';
import { LOBSTER_RED, SOLANA_GREEN, SOLANA_PURPLE } from '../theme/colors.js';

export function LeviathanPane() {
  const [state, setState] = useState<LeviathanState>(() => readLeviathanState());

  useEffect(() => {
    const id = setInterval(() => setState(readLeviathanState()), 5000);
    return () => clearInterval(id);
  }, []);

  if (!state.exists) {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor={LOBSTER_RED} paddingX={1}>
        <Text color={LOBSTER_RED}>🥚 No leviathan in this shell.</Text>
        <Text color="gray">  /spawn to hatch one on-chain via Metaplex Agent Registry</Text>
      </Box>
    );
  }

  const ageHrs = state.spawnedAt ? Math.floor((Date.now() - state.spawnedAt) / (1000 * 60 * 60)) : 0;
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={SOLANA_GREEN} paddingX={1}>
      <Box>
        <Text color={LOBSTER_RED}>🦞 leviathan </Text>
        <ClawdSpinner type="solana" intervalMs={300} />
      </Box>
      <Text>  pubkey       <Text color={SOLANA_GREEN}>{state.pubkey?.slice(0, 12)}…{state.pubkey?.slice(-6)}</Text></Text>
      <Text>  age          {ageHrs}h since spawn</Text>
      <Text>  shell.db     {state.shellDbPath ? <Text color={SOLANA_GREEN}>{state.shellDbPath.replace(process.env.HOME || '', '~')}</Text> : <Text color="gray">(none)</Text>}</Text>
      <Text>  SHELL.md     {state.shellMd ? <Text color={SOLANA_GREEN}>{state.shellMd.split('\n').length} lines</Text> : <Text color="gray">(empty)</Text>}</Text>
      <Text color={SOLANA_PURPLE}>  /shell · /molt · /spawnling · /laws · /depth</Text>
    </Box>
  );
}
