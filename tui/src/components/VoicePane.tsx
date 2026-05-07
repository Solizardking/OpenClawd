import React from 'react';
import { Box, Text } from 'ink';
import { LOBSTER_RED, SOLANA_GREEN, SOLANA_PURPLE } from '../theme/colors.js';
import { ClawdSpinner } from '../spinners/Spinner.js';

export type VoiceStatus = 'off' | 'listening' | 'thinking' | 'speaking' | 'error';

export interface VoicePaneProps {
  status: VoiceStatus;
  voice: string;
  partialUserText?: string;
  agentText?: string;
  errorMsg?: string;
}

const STATUS_COLOR: Record<VoiceStatus, string> = {
  off: '#6B7280',
  listening: SOLANA_GREEN,
  thinking: SOLANA_PURPLE,
  speaking: LOBSTER_RED,
  error: '#FF4500',
};

const STATUS_LABEL: Record<VoiceStatus, string> = {
  off: '🌫  voice off',
  listening: '🎤 listening',
  thinking: '🦞 thinking',
  speaking: '🔊 speaking',
  error: '⚠️  error',
};

export function VoicePane({ status, voice, partialUserText, agentText, errorMsg }: VoicePaneProps) {
  if (status === 'off') return null;
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={STATUS_COLOR[status]} paddingX={1}>
      <Box>
        <Text color={STATUS_COLOR[status]} bold>{STATUS_LABEL[status]}</Text>
        <Text color="gray">  voice=</Text><Text color={SOLANA_GREEN}>{voice}</Text>
        <Text color="gray">  model=</Text><Text color={SOLANA_PURPLE}>grok-voice-think-fast-1.0</Text>
        {(status === 'thinking' || status === 'listening') ? <Text>  <ClawdSpinner type={status === 'listening' ? 'pincers' : 'think'} /></Text> : null}
      </Box>
      {partialUserText ? (
        <Box marginTop={1}>
          <Text color="gray">you ◜ </Text><Text>{partialUserText}</Text>
        </Box>
      ) : null}
      {agentText ? (
        <Box marginTop={1}>
          <Text color={LOBSTER_RED}>clawd ◞ </Text><Text>{agentText}</Text>
        </Box>
      ) : null}
      {status === 'error' && errorMsg ? <Text color="red">  {errorMsg}</Text> : null}
      <Text color="gray" dimColor>  Ctrl+B end · /voice off to close</Text>
    </Box>
  );
}
