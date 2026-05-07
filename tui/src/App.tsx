import React, { useEffect, useState } from 'react';
import { Box, useApp, useInput } from 'ink';
import { Banner } from './components/Banner.js';
import { StatusBar } from './components/StatusBar.js';
import { Conversation, Line } from './components/Conversation.js';
import { Input } from './components/Input.js';
import { Help } from './components/Help.js';
import { BuddyPane } from './components/BuddyPane.js';
import { AgentPane } from './components/AgentPane.js';
import { LeviathanPane } from './components/LeviathanPane.js';
import { VoicePane, type VoiceStatus } from './components/VoicePane.js';
import { ThreeLawsGate } from './gates/ThreeLawsGate.js';
import { AsciiOcean } from './oceanview/AsciiOcean.js';
import { dispatch } from './commands/dispatch.js';
import { tryExtras } from './commands/dispatch-extras.js';
import { findCommand } from './commands/registry.js';
import { getActiveBuddy, moodOf, Buddy } from './store/buddies.js';
import { appendMessage, createSession, getSession, Session } from './store/sessions.js';
import { loadEnv, optEnv } from './services/env.js';
import { streamChat } from './services/xai-stream.js';
import type { RunningAgent } from './agents/types.js';
import type { GrokVoice } from './voice/tts.js';
import type { RealtimeSession } from './voice/realtime.js';

interface Props {
  yolo: boolean;
  resumeId?: string;
}

const TRADING = new Set(['buy', 'sell', 'ape', 'long', 'short', 'launch']);

export function App({ yolo, resumeId }: Props) {
  loadEnv();
  const [model, setModel] = useState<string>(optEnv('GROK_MODEL', 'grok-4-1-fast'));
  const [chain, setChain] = useState('solana');
  const [lines, setLines] = useState<Line[]>([]);
  const [buddy, setBuddy] = useState<Buddy | null>(null);
  const [agents, setAgents] = useState<RunningAgent[]>([]);
  const [busy, setBusy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showOcean, setShowOcean] = useState(false);
  const [tokens, setTokens] = useState({ used: 0, max: 200_000 });
  const [costUsd, setCostUsd] = useState(0);
  const [uptimeSec, setUptimeSec] = useState(0);
  const [session, setSession] = useState<Session | null>(null);

  // Voice state
  const [voiceVoice, setVoiceVoice] = useState<GrokVoice>('eve');
  const [voiceSession, setVoiceSession] = useState<RealtimeSession | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('off');
  const [voiceUserText, setVoiceUserText] = useState('');
  const [voiceAgentText, setVoiceAgentText] = useState('');
  const [voiceErr, setVoiceErr] = useState('');

  // Pending three-laws gate
  const [pendingTrade, setPendingTrade] = useState<{ name: string; raw: string } | null>(null);

  const { exit } = useApp();

  useEffect(() => {
    const s = resumeId ? getSession(resumeId) : null;
    const finalSession = s || createSession(model);
    setSession(finalSession);
    const b = getActiveBuddy();
    if (b) setBuddy(b);
    setLines((l) => [
      ...l,
      { kind: 'system', text: `🦞 you surface in the deep. session ${finalSession.id} ${s ? '(resumed)' : '(new)'}` },
      { kind: 'system', text: `type /help for the command deck · /voice for realtime · /leviathan to see your shell` },
    ]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = setInterval(() => setUptimeSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const [interruptArmed, setInterruptArmed] = useState(false);
  useInput((_input, key) => {
    if (key.ctrl && _input === 'c') {
      if (pendingTrade) { setPendingTrade(null); print('system', '🌫  drift'); return; }
      if (voiceSession) { void voiceSession.stop(); setVoiceSession(null); setVoiceStatus('off'); print('system', '🌫  voice closed'); return; }
      if (interruptArmed) exit();
      else {
        setInterruptArmed(true);
        setLines((l) => [...l, { kind: 'system', text: 'Press Ctrl+C again within 2s to return to the trench.' }]);
        setTimeout(() => setInterruptArmed(false), 2000);
      }
    }
    if (key.ctrl && _input === 'd') exit();
    if (key.ctrl && _input === 'b') {
      // Ctrl+B → toggle voice
      if (voiceSession) { void voiceSession.stop(); setVoiceSession(null); setVoiceStatus('off'); print('system', '🌫  voice closed'); }
      else void runExtras('voice', '');
    }
    if (pendingTrade) {
      if (_input === 'y' || _input === 'Y') {
        const t = pendingTrade;
        setPendingTrade(null);
        void runTrade(t.name, t.raw);
      } else if (_input === 'n' || _input === 'N') {
        setPendingTrade(null);
        print('system', '🌫  drift — Law I respected.');
      }
    }
  });

  const print = (kind: Line['kind'], text: string) => {
    setLines((l) => [...l, { kind, text }]);
    if (session) appendMessage(session.id, kind === 'user' ? 'user' : 'assistant', text);
  };

  const ctxBase = () => ({
    buddy, setBuddy,
    agents, setAgents,
    model, setModel,
    chain, setChain,
    yolo,
    print,
    setShowHelp,
    exit,
  });

  const ctxExtras = () => ({
    print,
    setShowHelp,
    setShowOcean,
    showOcean,
    voiceVoice, setVoiceVoice,
    voiceSession, setVoiceSession,
    setVoiceStatus,
    setVoiceUserText,
    setVoiceAgentText,
    setVoiceErr,
    model,
    yolo,
    exit,
  });

  const runExtras = async (cmd: string, raw: string): Promise<boolean> => tryExtras(cmd, raw, ctxExtras());

  const runTrade = async (cmd: string, raw: string) => {
    setBusy(true);
    try { await dispatch(cmd, raw, ctxBase()); }
    catch (e: any) { print('error', e?.message ?? String(e)); }
    finally { setBusy(false); }
  };

  const handleSubmit = async (text: string) => {
    setLines((l) => [...l, { kind: 'user', text }]);
    if (session) appendMessage(session.id, 'user', text);

    if (text.startsWith('/') || text.startsWith('!')) {
      setShowHelp(false);
      const stripped = text.slice(1);
      const [cmd, ...rest] = stripped.split(/\s+/);
      const raw = rest.join(' ');
      if (!findCommand(cmd)) { print('error', `🪨 unknown command "${cmd}". try /help`); return; }

      // Three-laws gate for trading commands
      if (TRADING.has(cmd) && !yolo) {
        setPendingTrade({ name: cmd, raw });
        print('system', '🦞 the shell asks: Law I clear? press y to strike, n to drift.');
        return;
      }

      // Forward voice message → realtime session text turn
      if (voiceSession && voiceSession.isOpen() && cmd === 'say') {
        voiceSession.sendText(raw);
        return;
      }

      setBusy(true);
      try {
        if (await runExtras(cmd, raw)) return;
        await dispatch(cmd, raw, ctxBase());
      } catch (e: any) {
        print('error', e?.message ?? String(e));
      } finally {
        setBusy(false);
      }
      return;
    }

    // Freeform → streaming /clawd
    setBusy(true);
    print('tool', `🦞 (◜°v°◝) streaming via ${model}...`);
    let acc = '';
    try {
      for await (const chunk of streamChat(text, model)) {
        if (!chunk.text) continue;
        acc += chunk.text;
      }
      if (acc) print('agent', acc);
      const tokensIn = Math.ceil(text.length / 4);
      const tokensOut = Math.ceil(acc.length / 4);
      setTokens((t) => ({ used: t.used + tokensIn + tokensOut, max: t.max }));
      setCostUsd((c) => c + tokensOut * 0.00001);
    } catch (e: any) {
      print('error', e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box flexDirection="column">
      <Banner model={model} version="1.0.0" />
      <Box flexDirection="row">
        <Box flexDirection="column" width="100%" paddingRight={1}>
          {showHelp ? <Help /> : <Conversation lines={lines} />}
        </Box>
      </Box>
      {pendingTrade ? (
        <Box marginTop={1}>
          <ThreeLawsGate
            command={pendingTrade.name}
            args={pendingTrade.raw}
            onConfirm={() => { const t = pendingTrade; setPendingTrade(null); void runTrade(t.name, t.raw); }}
            onCancel={() => { setPendingTrade(null); print('system', '🌫  drift — Law I respected.'); }}
          />
        </Box>
      ) : null}
      {showOcean ? <Box marginTop={1}><AsciiOcean count={6} /></Box> : null}
      {voiceStatus !== 'off' ? (
        <Box marginTop={1}>
          <VoicePane status={voiceStatus} voice={voiceVoice} partialUserText={voiceUserText} agentText={voiceAgentText} errorMsg={voiceErr} />
        </Box>
      ) : null}
      <Box marginTop={1}><LeviathanPane /></Box>
      {buddy ? (
        <Box marginTop={1}>
          <BuddyPane buddy={buddy} onTick={(b) => setBuddy(b)} />
        </Box>
      ) : null}
      {agents.map((a) => (
        <AgentPane key={a.id} agent={a} />
      ))}
      <Box marginTop={1}>
        <StatusBar
          model={model}
          tokens={tokens}
          costUsd={costUsd}
          uptimeSec={uptimeSec}
          buddyName={buddy?.name}
          buddyMood={buddy ? moodOf(buddy) : undefined}
        />
      </Box>
      <Box marginTop={1}>
        <Input onSubmit={handleSubmit} busy={busy} />
      </Box>
    </Box>
  );
}
