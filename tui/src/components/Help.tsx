import React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import { COMMANDS } from '../commands/registry.js';
import { GRADIENT_SOLANA, LOBSTER_RED, SOLANA_GREEN, SOLANA_PURPLE } from '../theme/colors.js';

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  buddy:   { label: 'BLOCKCHAIN BUDDIES', emoji: '🦞' },
  market:  { label: 'MARKET',             emoji: '📊' },
  trade:   { label: 'TRADING',            emoji: '💰' },
  wallet:  { label: 'WALLET',             emoji: '👛' },
  agent:   { label: 'AGENTS',             emoji: '🤖' },
  system:  { label: 'SYSTEM',             emoji: '⚙️' },
};

export function Help() {
  const grouped = new Map<string, typeof COMMANDS>();
  for (const c of COMMANDS) {
    if (!grouped.has(c.category)) grouped.set(c.category, []);
    grouped.get(c.category)!.push(c);
  }

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={SOLANA_PURPLE} paddingX={1}>
      <Gradient colors={GRADIENT_SOLANA}>
        <Text bold>🦞  $CLAWD COMMAND DECK  🦞</Text>
      </Gradient>
      <Text color="gray">prefix: / or !  ·  args: &lt;required&gt;  ·  [optional]</Text>
      {[...grouped.entries()].map(([cat, cmds]) => {
        const meta = CATEGORY_LABELS[cat] || { label: cat.toUpperCase(), emoji: '·' };
        return (
          <Box key={cat} flexDirection="column" marginTop={1}>
            <Text color={LOBSTER_RED}>
              {meta.emoji}  {meta.label}
            </Text>
            {cmds.map((c) => (
              <Box key={c.name}>
                <Text color={SOLANA_GREEN}>  /{c.name.padEnd(11)}</Text>
                <Text>{c.description}</Text>
              </Box>
            ))}
          </Box>
        );
      })}
      <Box marginTop={1} flexDirection="column">
        <Text color="gray">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
        <Text color={SOLANA_GREEN}>📞 hotline: 909-413-5567</Text>
        <Text color={SOLANA_GREEN}>📦 npm i clawd-code-cli</Text>
        <Text color={SOLANA_GREEN}>🌐 solanaclawd.com · $CLAWD on OpenRouter</Text>
      </Box>
    </Box>
  );
}
