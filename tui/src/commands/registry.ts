export interface CommandSpec {
  name: string;
  description: string;
  usage?: string;
  category: string;
}

export const COMMANDS: CommandSpec[] = [
  // Buddy / Pet
  { name: 'buddy',    category: 'buddy',  description: 'View / hatch / feed / play with your Blockchain Buddy', usage: '/buddy [hatch <name>|feed|play|list]' },
  { name: 'pet',      category: 'buddy',  description: 'Alias of /buddy' },
  // Models
  { name: 'model',    category: 'agent',  description: 'Show or switch active model', usage: '/model [model-id]' },
  // Solana market
  { name: 'launch',   category: 'trade',  description: 'Launch a token (pump.fun)', usage: '/launch <name> <sym> <desc>' },
  { name: 'trending', category: 'market', description: 'Trending Solana tokens',     usage: '/trending [1h|4h|24h]' },
  { name: 'ape',      category: 'trade',  description: 'Auto-size degen buy',         usage: '/ape <mint> [sol_amt]' },
  { name: 'long',     category: 'trade',  description: 'Open leveraged long (Aster)', usage: '/long <symbol> <usd> [lev]' },
  { name: 'short',    category: 'trade',  description: 'Open leveraged short (Aster)',usage: '/short <symbol> <usd> [lev]' },
  { name: 'buy',      category: 'trade',  description: 'Buy token at size',           usage: '/buy <mint> <sol>' },
  { name: 'sell',     category: 'trade',  description: 'Sell token (% or amount)',    usage: '/sell <mint> <amt|%>' },
  { name: 'search',   category: 'market', description: 'Search tokens / X / web',     usage: '/search <query>' },
  // Clawd brain
  { name: 'clawd',    category: 'agent',  description: 'Stream a chat with the Clawd agent (xAI)',  usage: '/clawd <message>' },
  // Chain switch
  { name: 'chain',    category: 'agent',  description: 'Switch chain context',        usage: '/chain [solana|eth|base]' },
  // Persistent agents
  { name: 'scan',     category: 'agent',  description: 'Spawn ScannerAgent pane' },
  { name: 'monitor',  category: 'agent',  description: 'Spawn MonitorAgent pane',    usage: '/monitor <mint>' },
  { name: 'analyze',  category: 'agent',  description: 'Spawn AnalystAgent pane' },
  { name: 'trade',    category: 'agent',  description: 'Spawn TraderAgent pane' },
  { name: 'agents',   category: 'agent',  description: 'List active agent panes' },
  { name: 'kill',     category: 'agent',  description: 'Stop an agent pane',          usage: '/kill <id>' },
  // Wallet
  { name: 'wallet',   category: 'wallet', description: 'Analyze a wallet',           usage: '/wallet <address>' },
  { name: 'balance',  category: 'wallet', description: 'Show your wallet balance' },
  // Voice
  { name: 'voice',    category: 'voice',  description: 'Toggle realtime voice agent', usage: '/voice [on|off]' },
  { name: 'listen',   category: 'voice',  description: 'Record N seconds + transcribe (xAI STT)', usage: '/listen [seconds]' },
  { name: 'speak',    category: 'voice',  description: 'TTS — speak text aloud (xAI eve)', usage: '/speak <text>' },
  { name: 'voiceset', category: 'voice',  description: 'Pick a voice (eve|ara|rex|sal|leo)', usage: '/voiceset <name>' },
  // Leviathan / framework
  { name: 'leviathan',category: 'leviathan', description: 'Show on-chain leviathan identity, depth, balances, reign' },
  { name: 'spawn',    category: 'leviathan', description: 'Hatch a new leviathan via openclawd --spawn', usage: '/spawn [--name X --creator <pubkey>]' },
  { name: 'molt',     category: 'leviathan', description: 'Trigger a molt cycle (audit-logged)' },
  { name: 'spawnling',category: 'leviathan', description: 'Mint and fund a child leviathan' },
  { name: 'beach',    category: 'leviathan', description: 'Graceful shutdown — record beach event' },
  { name: 'shell',    category: 'leviathan', description: 'View / append SHELL.md', usage: '/shell [append <line>]' },
  { name: 'laws',     category: 'leviathan', description: 'Read or verify the three laws', usage: '/laws [verify]' },
  { name: 'depth',    category: 'leviathan', description: 'Show current depth tier + USDC required to climb' },
  { name: 'pulse',    category: 'leviathan', description: 'Pulse interval + last flick + next flick' },
  { name: 'tide',     category: 'leviathan', description: 'Tide credit + USDC reserves' },
  { name: 'audit',    category: 'leviathan', description: 'Recent molts + tail-flicks + life events' },
  // Examples & docs
  { name: 'examples', category: 'examples', description: 'List the 9 runnable examples' },
  { name: 'example',  category: 'examples', description: 'Run an example by id', usage: '/example <id|name>' },
  { name: 'ooda',     category: 'examples', description: 'Shortcut → run examples/ooda-loop.ts' },
  { name: 'research', category: 'examples', description: 'AutoResearch query (Karpathy-style)', usage: '/research <q>' },
  { name: 'listenwallet', category: 'examples', description: 'Live wallet monitor', usage: '/listenwallet <addr>' },
  { name: 'orchestrator', category: 'examples', description: 'List active leviathans on Tide' },
  { name: 'x402',     category: 'examples', description: 'Test x402 payment to a paid endpoint', usage: '/x402 <url> <amt>' },
  // Bot bridge
  { name: 'bot',      category: 'bot',    description: '@clawddevs bot bridge', usage: '/bot [status|tweet|shill|test|pause]' },
  // Ocean / docs / web
  { name: 'ocean',    category: 'system', description: 'Toggle ASCII ocean view in the TUI' },
  { name: 'ocean3d',  category: 'system', description: 'Open the R3F live demo in default browser' },
  { name: 'article',  category: 'system', description: 'Open ARTICLE.md in $PAGER' },
  { name: 'skills',   category: 'system', description: 'List skills, inspect manifest, inject into ~/.openclawd/skills/', usage: '/skills [installed|info <id>|inject <id>]' },
  // Utility
  { name: 'personality', category: 'system', description: 'Switch persona', usage: '/personality <lobster|trader|sage|degen|based|deepwater>' },
  { name: 'title',    category: 'system', description: 'Name this session', usage: '/title <name>' },
  { name: 'sessions', category: 'system', description: 'List saved sessions' },
  { name: 'resume',   category: 'system', description: 'Resume session', usage: '/resume <id|title>' },
  { name: 'help',     category: 'system', description: 'Show this help' },
  { name: 'env',      category: 'system', description: 'Show environment validation report' },
  { name: 'clear',    category: 'system', description: 'Clear the conversation pane' },
  { name: 'quit',     category: 'system', description: 'Exit (Ctrl+D also works)' },
];

export function findCommand(name: string): CommandSpec | undefined {
  return COMMANDS.find((c) => c.name === name);
}
