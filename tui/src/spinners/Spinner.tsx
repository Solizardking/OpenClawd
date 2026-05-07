import React, { useEffect, useState } from 'react';
import { Text } from 'ink';
import { SPINNER_REGISTRY } from './frames.js';
import { LOBSTER_RED, SOLANA_GREEN, SOLANA_PURPLE } from '../theme/colors.js';

interface Props {
  type?: keyof typeof SPINNER_REGISTRY | string;
  intervalMs?: number;
  color?: string;
  label?: string;
}

export function ClawdSpinner({
  type = 'idle',
  intervalMs = 200,
  color = LOBSTER_RED,
  label,
}: Props) {
  const frames = SPINNER_REGISTRY[type] || SPINNER_REGISTRY.idle;
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % frames.length), intervalMs);
    return () => clearInterval(id);
  }, [frames.length, intervalMs]);

  return (
    <Text color={color}>
      {frames[frame]}
      {label ? <Text color={SOLANA_GREEN}> {label}</Text> : null}
    </Text>
  );
}

export function CandleBar({ width = 12 }: { width?: number }) {
  const [bars, setBars] = useState<number[]>(Array(width).fill(0));
  useEffect(() => {
    const id = setInterval(() => {
      setBars((b) => [...b.slice(1), Math.floor(Math.random() * 8) + 1]);
    }, 250);
    return () => clearInterval(id);
  }, [width]);
  const glyphs = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  return (
    <Text color={SOLANA_PURPLE}>
      {bars.map((b) => glyphs[b % glyphs.length]).join('')}
    </Text>
  );
}
