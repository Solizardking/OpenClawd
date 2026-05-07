import React from 'react';
import { Box, Text } from 'ink';
import { LOBSTER_RED, SOLANA_GREEN, SOLANA_PURPLE, STATUS_DIM } from '../theme/colors.js';

interface Props {
  model: string;
  tokens: { used: number; max: number };
  costUsd: number;
  uptimeSec: number;
  buddyName?: string;
  buddyMood?: string;
}

function fmtTokens(n: number): string {
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}K`;
  return `${(n / 1_000_000).toFixed(2)}M`;
}

function fmtUptime(s: number): string {
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h${m % 60}m`;
  if (m > 0) return `${m}m${s % 60}s`;
  return `${s}s`;
}

function bar(pct: number, width = 10): string {
  const filled = Math.max(0, Math.min(width, Math.round((pct / 100) * width)));
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function ctxColor(pct: number): string {
  if (pct < 50) return SOLANA_GREEN;
  if (pct < 80) return '#FFD700';
  if (pct < 95) return '#FFA500';
  return LOBSTER_RED;
}

export function StatusBar({ model, tokens, costUsd, uptimeSec, buddyName, buddyMood }: Props) {
  const pct = Math.min(100, Math.round((tokens.used / Math.max(1, tokens.max)) * 100));
  const truncatedModel = model.length > 26 ? model.slice(0, 23) + '...' : model;
  return (
    <Box>
      <Text color={SOLANA_GREEN}>⚕ </Text>
      <Text color={SOLANA_PURPLE}>{truncatedModel}</Text>
      <Text color={STATUS_DIM}> │ </Text>
      <Text>
        {fmtTokens(tokens.used)}/{fmtTokens(tokens.max)}
      </Text>
      <Text color={STATUS_DIM}> │ </Text>
      <Text color={ctxColor(pct)}>[{bar(pct)}] {pct}%</Text>
      <Text color={STATUS_DIM}> │ </Text>
      <Text color={SOLANA_GREEN}>${costUsd.toFixed(2)}</Text>
      <Text color={STATUS_DIM}> │ </Text>
      <Text color={LOBSTER_RED}>{fmtUptime(uptimeSec)}</Text>
      {buddyName ? (
        <>
          <Text color={STATUS_DIM}> │ </Text>
          <Text color={LOBSTER_RED}>🦞 {buddyName}</Text>
          {buddyMood ? <Text color={SOLANA_GREEN}> {buddyMood}</Text> : null}
        </>
      ) : null}
    </Box>
  );
}
