// ═══════════════════════════════════════════════════════════════════════════════
// DARK RALPH TUI - Header Component
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';

const RALPH_ASCII = `
██████╗  █████╗ ██████╗ ██╗  ██╗    ██████╗  █████╗ ██╗     ██████╗ ██╗  ██╗
██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝    ██╔══██╗██╔══██╗██║     ██╔══██╗██║  ██║
██║  ██║███████║██████╔╝█████╔╝     ██████╔╝███████║██║     ██████╔╝███████║
██║  ██║██╔══██║██╔══██╗██╔═██╗     ██╔══██╗██╔══██║██║     ██╔═══╝ ██╔══██║
██████╔╝██║  ██║██║  ██║██║  ██╗    ██║  ██║██║  ██║███████╗██║     ██║  ██║
╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝  ╚═╝
`.trim();

interface HeaderProps {
  version?: string;
  showSubtitle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ version = '1.0.0', showSubtitle = true }) => {
  return (
    <Box flexDirection="column" alignItems="center" paddingY={1}>
      <Gradient name="rainbow">
        <Text>{RALPH_ASCII}</Text>
      </Gradient>

      {showSubtitle && (
        <>
          <Box marginTop={1}>
            <Text color="green">[&gt;] </Text>
            <Text color="greenBright" bold>
              RECURSIVE AUTONOMOUS SOLANA INTELLIGENCE
            </Text>
            <Text color="green"> [&lt;]</Text>
          </Box>

          <Box marginTop={1}>
            <Text color="gray">v{version}</Text>
            <Text color="gray"> │ </Text>
            <Text color="cyan">TUI Agent Orchestrator</Text>
            <Text color="gray"> │ </Text>
            <Text color="yellow">Powered by Bun</Text>
          </Box>
        </>
      )}
    </Box>
  );
};

// Compact header for running state
export const CompactHeader: React.FC<{ status: string; uptime: number }> = ({ status, uptime }) => {
  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <Box borderStyle="single" borderColor="green" paddingX={2} paddingY={0}>
      <Box flexGrow={1}>
        <Text color="greenBright" bold>
          🦞 MAWD
        </Text>
        <Text color="gray"> │ </Text>
        <Text color={status === 'ONLINE' ? 'green' : 'yellow'}>{status}</Text>
      </Box>
      <Box>
        <Text color="gray">Uptime: </Text>
        <Text color="cyan">{formatUptime(uptime)}</Text>
      </Box>
    </Box>
  );
};

export default Header;
