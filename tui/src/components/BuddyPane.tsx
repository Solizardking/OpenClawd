import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { Buddy, moodOf, tickBuddyDecay } from '../store/buddies.js';
import { ClawdSpinner } from '../spinners/Spinner.js';
import { LOBSTER_RED, SOLANA_GREEN, SOLANA_PURPLE } from '../theme/colors.js';

function bar(value: number, max = 100, width = 10, color = SOLANA_GREEN): React.ReactNode {
  const f = Math.max(0, Math.min(width, Math.round((value / max) * width)));
  return (
    <Text color={color}>
      [{'█'.repeat(f)}{'░'.repeat(width - f)}]
    </Text>
  );
}

function pickSpinner(b: Buddy): string {
  if (b.energy < 20) return 'sleeping';
  if (b.hunger > 80) return 'think';
  if (b.degen > 7) return 'trading';
  if (b.happiness > 85) return 'excited';
  return 'idle';
}

export function BuddyPane({ buddy, onTick }: { buddy: Buddy; onTick: (b: Buddy) => void }) {
  const [b, setB] = useState<Buddy>(buddy);
  useEffect(() => setB(buddy), [buddy]);

  useEffect(() => {
    const id = setInterval(() => {
      const updated = tickBuddyDecay(b.id);
      if (updated) {
        setB(updated);
        onTick(updated);
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [b.id, onTick]);

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={LOBSTER_RED} paddingX={1}>
      <Box>
        <Text color={LOBSTER_RED} bold>🦞 {b.name}</Text>
        <Text color="gray">  ({b.species})  </Text>
        <Text color={SOLANA_PURPLE}>lvl {b.level}</Text>
        <Text color="gray">  ·  </Text>
        <Text color={SOLANA_GREEN}>{moodOf(b)}</Text>
      </Box>
      <Box marginTop={1}>
        <ClawdSpinner type={pickSpinner(b)} intervalMs={250} />
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Box><Text color="gray">HP      </Text>{bar(b.hp, 100, 10, SOLANA_GREEN)}<Text>  {b.hp}</Text></Box>
        <Box><Text color="gray">Hunger  </Text>{bar(b.hunger, 100, 10, '#FFA500')}<Text>  {b.hunger}</Text></Box>
        <Box><Text color="gray">Energy  </Text>{bar(b.energy, 100, 10, SOLANA_PURPLE)}<Text>  {b.energy}</Text></Box>
        <Box><Text color="gray">Joy     </Text>{bar(b.happiness, 100, 10, '#FFD700')}<Text>  {b.happiness}</Text></Box>
      </Box>
      <Box marginTop={1}>
        <Text color="gray">STR </Text><Text color={SOLANA_GREEN}>{b.strength}</Text>
        <Text color="gray">  INT </Text><Text color={SOLANA_GREEN}>{b.intel}</Text>
        <Text color="gray">  LCK </Text><Text color={SOLANA_GREEN}>{b.luck}</Text>
        <Text color="gray">  DGN </Text><Text color={LOBSTER_RED}>{b.degen}</Text>
        <Text color="gray">  XP </Text><Text>{b.xp}/{b.level * 100}</Text>
      </Box>
    </Box>
  );
}
