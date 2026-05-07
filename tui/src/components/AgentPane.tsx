import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { ClawdSpinner } from '../spinners/Spinner.js';
import type { RunningAgent } from '../agents/types.js';
import { LOBSTER_RED, SOLANA_GREEN, SOLANA_PURPLE, STATUS_DIM } from '../theme/colors.js';

export function AgentPane({ agent, max = 8 }: { agent: RunningAgent; max?: number }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const events = agent.events.slice(-max);
  const dotColor =
    agent.status === 'running' ? SOLANA_GREEN : agent.status === 'error' ? LOBSTER_RED : STATUS_DIM;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={dotColor}
      paddingX={1}
      marginTop={1}
    >
      <Box>
        <Text color={dotColor}>●</Text>
        <Text color={SOLANA_PURPLE}>  {agent.name}</Text>
        <Text color="gray">  [{agent.id}]  </Text>
        <Text color="gray">{agent.status}</Text>
        {agent.status === 'running' ? (
          <>
            <Text>  </Text>
            <ClawdSpinner type="solana" intervalMs={250} />
          </>
        ) : null}
      </Box>
      <Box flexDirection="column" marginTop={1}>
        {events.map((e, i) => {
          const color =
            e.level === 'error' ? LOBSTER_RED :
            e.level === 'warn' ? '#FFA500' :
            e.level === 'signal' ? SOLANA_GREEN :
            STATUS_DIM;
          const t = new Date(e.ts);
          const ts = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`;
          return (
            <Box key={`${e.ts}-${i}`}>
              <Text color={STATUS_DIM}>{ts}</Text>
              <Text color={color}>  {e.level.padEnd(7)}</Text>
              <Text>{e.msg}</Text>
            </Box>
          );
        })}
        {events.length === 0 ? <Text color={STATUS_DIM}>(no events yet — tick {tick})</Text> : null}
      </Box>
    </Box>
  );
}
