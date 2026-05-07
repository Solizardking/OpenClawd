#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './App.js';
import { getMostRecent } from './store/sessions.js';

const args = process.argv.slice(2);
const yolo = args.includes('--yolo');
const continueFlag = args.includes('-c') || args.includes('--continue');
const resumeIdx = Math.max(args.indexOf('-r'), args.indexOf('--resume'));
const resumeArg = resumeIdx >= 0 ? args[resumeIdx + 1] : undefined;

let resumeId: string | undefined = resumeArg;
if (continueFlag) {
  const last = getMostRecent();
  if (last) resumeId = last.id;
}

if (args.includes('-h') || args.includes('--help') || args[0] === 'help') {
  console.log(`
🦞 clawd — OpenClawd TUI · Sovereign Lobster Cockpit

USAGE
  clawd                         Start interactive TUI
  clawd -c, --continue          Resume most recent session
  clawd -r <id|title>           Resume specific session
  clawd --yolo                  Skip Three-Laws gate on trading commands
  clawd -h, --help              Show help
  clawd version                 Show version

INSIDE THE TUI — 50+ slash commands
  /help            full command deck (categorized)
  /buddy hatch X   hatch a Blockchain Buddy pet
  /leviathan       on-chain identity, depth, balances, reign
  /spawn           hatch a leviathan via Metaplex Agent Registry
  /molt            molt the leviathan (audit-logged, git-versioned)
  /shell           view / append SHELL.md
  /laws            read the three laws
  /examples        list 9 runnable framework examples
  /example <id>    run one (live stdout streams in)
  /clawd <msg>     STREAMING xAI chat
  /voice           full-duplex realtime voice (grok-voice-think-fast-1.0, eve voice)
  /listen [sec]    record + STT + reply + TTS in one shot
  /speak <text>    xAI TTS (eve)
  /voiceset <v>    pick voice: eve | ara | rex | sal | leo
  /ocean           toggle in-TUI ASCII ocean view
  /ocean3d         open the R3F live demo in browser
  /article         open ARTICLE.md in $PAGER
  /skills          list the 61 skills
  /bot status      check ClawdBot @clawddevs status
  /env             show env validation report

KEYBINDINGS
  Ctrl+B           toggle realtime voice
  Ctrl+C           cancel pending action / drift / 2x = exit
  Ctrl+D           exit

🦞 hotline 909-413-5567 · npm i clawd-code-cli · solanaclawd.com
$CLAWD: 8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump
`);
  process.exit(0);
}

if (args[0] === 'version' || args.includes('-v') || args.includes('--version')) {
  console.log('clawd-code-cli v1.0.0');
  process.exit(0);
}

render(<App yolo={yolo} resumeId={resumeId} />);
