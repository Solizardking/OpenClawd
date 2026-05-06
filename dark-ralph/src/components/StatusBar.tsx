// ═══════════════════════════════════════════════════════════════════════════════
// DARK RALPH TUI - Status Bar Component
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box, Text } from 'ink';

interface ApiStatus {
  name: string;
  connected: boolean;
  latency?: number;
}

interface StatusBarProps {
  mode: 'autonomous' | 'interactive';
  recursionDepth: number;
  thoughts: number;
  apiCalls: number;
  apis: ApiStatus[];
  currentTime: Date;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  mode,
  recursionDepth,
  thoughts,
  apiCalls,
  apis,
  currentTime,
}) => {
  const connectedApis = apis.filter((api) => api.connected).length;
  const totalApis = apis.length;

  return (
    <Box
      borderStyle="single"
      borderColor="green"
      paddingX={1}
      flexDirection="row"
      justifyContent="space-between"
    >
      {/* Left side - Status */}
      <Box>
        <Text color="green">● </Text>
        <Text color="greenBright">ONLINE</Text>
        <Text color="gray"> │ </Text>
        <Text color="cyan">[MODE] </Text>
        <Text color={mode === 'autonomous' ? 'magenta' : 'yellow'}>{mode.toUpperCase()}</Text>
      </Box>

      {/* Center - Stats */}
      <Box>
        <Text color="magenta">[RECURSION] </Text>
        <Text color="white">{recursionDepth}</Text>
        <Text color="gray"> │ </Text>
        <Text color="yellow">[THOUGHTS] </Text>
        <Text color="white">{thoughts}</Text>
        <Text color="gray"> │ </Text>
        <Text color="cyan">[API] </Text>
        <Text color="white">{apiCalls}</Text>
      </Box>

      {/* Right side - APIs and Time */}
      <Box>
        <Text color="green">[APIS] </Text>
        <Text color={connectedApis === totalApis ? 'green' : 'yellow'}>
          {connectedApis}/{totalApis}
        </Text>
        <Text color="gray"> │ </Text>
        <Text color="gray">{currentTime.toLocaleTimeString()}</Text>
      </Box>
    </Box>
  );
};

// Detailed API Status Panel
export const ApiStatusPanel: React.FC<{ apis: ApiStatus[] }> = ({ apis }) => {
  return (
    <Box flexDirection="column" borderStyle="single" borderColor="green" paddingX={1}>
      <Box marginBottom={1}>
        <Text color="greenBright" bold>
          ╔═══ API STATUS ═══╗
        </Text>
      </Box>

      {apis.map((api) => (
        <Box key={api.name}>
          <Text color={api.connected ? 'green' : 'red'}>{api.connected ? '●' : '○'} </Text>
          <Text color="white">{api.name.padEnd(12)}</Text>
          <Text color={api.connected ? 'green' : 'red'}>{api.connected ? 'CONNECTED' : 'OFFLINE'}</Text>
          {api.latency !== undefined && api.connected && (
            <Text color="gray"> ({api.latency}ms)</Text>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default StatusBar;
