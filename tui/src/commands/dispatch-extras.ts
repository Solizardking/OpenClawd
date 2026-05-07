/**
 * Handlers for the new command surface — leviathan, voice, examples, bot, system docs.
 * Returns true if it handled the command; false to fall through to the original dispatch.
 */

import { runFramework } from '../framework/runner.js';
import { readLeviathanState, readShellMd, appendShell, readThreeLaws } from '../framework/leviathan.js';
import { EXAMPLES, findExample } from '../examples/registry.js';
import { runExample } from '../examples/runner.js';
import { Bot } from '../bot/clawdbot.js';
import { listenAndTranscribe } from '../voice/stt.js';
import { speak, ttsToFile, type GrokVoice } from '../voice/tts.js';
import { startRealtime, type RealtimeSession } from '../voice/realtime.js';
import { streamChat } from '../services/xai-stream.js';
import { envSummary } from '../utils/env-validate.js';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

export interface ExtrasCtx {
  print: (kind: 'system' | 'tool' | 'agent' | 'error', text: string) => void;
  setShowHelp: (v: boolean) => void;
  setShowOcean: (v: boolean) => void;
  showOcean: boolean;
  voiceVoice: GrokVoice;
  setVoiceVoice: (v: GrokVoice) => void;
  voiceSession: RealtimeSession | null;
  setVoiceSession: (s: RealtimeSession | null) => void;
  setVoiceStatus: (s: 'off' | 'listening' | 'thinking' | 'speaking' | 'error') => void;
  setVoiceUserText: (s: string) => void;
  setVoiceAgentText: (s: string) => void;
  setVoiceErr: (s: string) => void;
  model: string;
  yolo: boolean;
  exit: () => void;
}

export async function tryExtras(name: string, raw: string, ctx: ExtrasCtx): Promise<boolean> {
  const args = raw.trim().split(/\s+/).filter(Boolean);

  switch (name) {
    case 'env': {
      const s = envSummary();
      ctx.print('system', s.ok ? '✅ env: all required keys present' : `⚠️  env: missing ${s.missing.join(', ')}`);
      for (const r of s.report) {
        const icon = r.value ? '✅' : (r.required ? '❌' : '·');
        const display = r.value ? '[set]' : '[unset]';
        ctx.print('tool', `  ${icon} ${r.key.padEnd(22)} ${display.padEnd(8)} ${r.enables}`);
      }
      return true;
    }

    // ── Leviathan / framework ────────────────────────────
    case 'leviathan': {
      const lev = readLeviathanState();
      if (!lev.exists) { ctx.print('system', '🥚 No leviathan in this shell. /spawn to hatch one.'); return true; }
      ctx.print('agent', `🦞 ${lev.pubkey?.slice(0, 12)}…  spawned ${new Date(lev.spawnedAt!).toISOString()}`);
      if (lev.shellDbPath) ctx.print('tool', `   shell.db: ${lev.shellDbPath.replace(process.env.HOME || '', '~')}`);
      if (lev.shellMd)     ctx.print('tool', `   SHELL.md: ${lev.shellMd.split('\n').length} lines`);
      return true;
    }
    case 'spawn': {
      ctx.print('tool', '🥚 spawning leviathan via openclawd --spawn...');
      const handle = runFramework(['--spawn', ...args], (line) => ctx.print('agent', line));
      await handle.done;
      return true;
    }
    case 'molt':
    case 'spawnling':
    case 'beach':
    case 'depth':
    case 'pulse':
    case 'tide':
    case 'audit': {
      const handle = runFramework([`--${name}`, ...args], (line) => ctx.print('agent', line));
      await handle.done;
      return true;
    }
    case 'shell': {
      if (args[0] === 'append') {
        const text = raw.replace(/^append\s+/, '');
        const ok = appendShell(text);
        ctx.print(ok ? 'system' : 'error', ok ? '🐚 SHELL.md updated.' : '🪨 No SHELL.md to append to.');
        return true;
      }
      const md = readShellMd();
      if (!md) { ctx.print('error', '🪨 No SHELL.md — leviathan not yet spawned.'); return true; }
      md.split('\n').forEach((l) => ctx.print('tool', l));
      return true;
    }
    case 'laws': {
      const laws = readThreeLaws();
      laws.split('\n').forEach((l) => ctx.print('tool', l));
      return true;
    }

    // ── Examples ─────────────────────────────────────────
    case 'examples': {
      ctx.print('system', `📚 ${EXAMPLES.length} runnable examples — /example <id> to run:`);
      for (const e of EXAMPLES) ctx.print('tool', `  ${e.id.padEnd(10)} ${e.title.padEnd(20)} ${e.desc}`);
      return true;
    }
    case 'example': {
      if (!args[0]) { ctx.print('error', 'Usage: /example <id|name>'); return true; }
      const ex = findExample(args.join(' '));
      if (!ex) { ctx.print('error', `🪨 unknown example "${args[0]}". Try /examples`); return true; }
      ctx.print('tool', `📚 running ${ex.title} → ${ex.file}`);
      const r = runExample(ex, (line) => ctx.print('agent', line));
      await r.done;
      return true;
    }
    case 'ooda': {
      const ex = findExample('ooda')!;
      const r = runExample(ex, (l) => ctx.print('agent', l));
      await r.done;
      return true;
    }
    case 'research': {
      const ex = findExample('research')!;
      const r = runExample(ex, (l) => ctx.print('agent', l));
      await r.done;
      return true;
    }
    case 'listenwallet': {
      const ex = findExample('listen')!;
      const r = runExample(ex, (l) => ctx.print('agent', l));
      await r.done;
      return true;
    }
    case 'orchestrator': {
      const ex = findExample('orch')!;
      const r = runExample(ex, (l) => ctx.print('agent', l));
      await r.done;
      return true;
    }
    case 'x402': {
      const ex = findExample('x402sol')!;
      const r = runExample(ex, (l) => ctx.print('agent', l));
      await r.done;
      return true;
    }

    // ── Bot bridge ───────────────────────────────────────
    case 'bot': {
      const sub = args[0] || 'status';
      switch (sub) {
        case 'status': await Bot.status((l) => ctx.print('agent', l)).done; return true;
        case 'test':   await Bot.selfTest((l) => ctx.print('agent', l)).done; return true;
        case 'shill':  await Bot.shillToken((l) => ctx.print('agent', l)).done; return true;
        case 'tweet':  await Bot.firstClawd((l) => ctx.print('agent', l)).done; return true;
        case 'based':  await Bot.basedTweet((l) => ctx.print('agent', l)).done; return true;
        default: ctx.print('error', `unknown bot sub "${sub}". try: status|test|shill|tweet|based`); return true;
      }
    }

    // ── System / docs / web ───────────────────────────────
    case 'ocean': {
      ctx.setShowOcean(!ctx.showOcean);
      ctx.print('system', ctx.showOcean ? '🌫  ocean off' : '🌊 ocean on');
      return true;
    }
    case 'ocean3d': {
      const url = 'http://localhost:5173/ocean.html';
      const platform = process.platform;
      const cmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
      try { spawn(cmd, [url], { detached: true, stdio: 'ignore' }).unref(); ctx.print('system', `🌊 opening ${url}`); }
      catch { ctx.print('error', `couldn't open browser; visit ${url} manually`); }
      return true;
    }
    case 'article': {
      const candidates = [
        path.resolve(process.cwd(), '../ARTICLE.md'),
        path.resolve(process.cwd(), '../../ARTICLE.md'),
        path.resolve(process.cwd(), 'ARTICLE.md'),
      ];
      const target = candidates.find((p) => fs.existsSync(p));
      if (!target) { ctx.print('error', '🪨 ARTICLE.md not found'); return true; }
      const pager = process.env.PAGER || 'less';
      try { spawn(pager, [target], { stdio: 'inherit' }); ctx.print('system', `📰 opened ${target} in ${pager}`); }
      catch { fs.readFileSync(target, 'utf8').split('\n').forEach((l) => ctx.print('tool', l)); }
      return true;
    }
    case 'skills': {
      const sub = (raw || '').trim().split(/\s+/);
      const verb = sub[0] || 'list';

      const candidates = [
        path.resolve(process.cwd(), '../skills'),
        path.resolve(process.cwd(), '../../skills'),
        path.resolve(process.cwd(), 'skills'),
      ];
      const dir = candidates.find((p) => fs.existsSync(p));
      if (!dir) { ctx.print('error', '🪨 skills/ not found'); return true; }

      const userSkillsDir = path.join(process.env.HOME || '', '.openclawd', 'skills');

      if (verb === 'list' || verb === 'ls') {
        const ents = fs.readdirSync(dir).filter((n) => !n.startsWith('.')).sort();
        ctx.print('system', `🧠 ${ents.length} skills available in ${dir}:`);
        for (let i = 0; i < ents.length; i += 4) {
          ctx.print('tool', '  ' + ents.slice(i, i + 4).map((n) => n.padEnd(24)).join(' '));
        }
        if (fs.existsSync(userSkillsDir)) {
          const installed = fs.readdirSync(userSkillsDir).filter((n) => !n.startsWith('.')).sort();
          ctx.print('system', `🦞 ${installed.length} installed in this leviathan (${userSkillsDir}):`);
          for (const id of installed) {
            const link = fs.lstatSync(path.join(userSkillsDir, id)).isSymbolicLink() ? '↪' : '·';
            ctx.print('tool', `  ${link} ${id}`);
          }
        } else {
          ctx.print('tool', '  (~/.openclawd/skills/ not initialised — run /spawn to inherit the default skill set)');
        }
        ctx.print('system', 'Subcommands: /skills installed | /skills info <id> | /skills inject <id>');
        return true;
      }

      if (verb === 'installed') {
        if (!fs.existsSync(userSkillsDir)) {
          ctx.print('error', `🪨 ${userSkillsDir} does not exist — spawn a leviathan first`);
          return true;
        }
        const installed = fs.readdirSync(userSkillsDir).filter((n) => !n.startsWith('.')).sort();
        ctx.print('system', `🦞 ${installed.length} skills installed:`);
        for (const id of installed) {
          const skillMd = path.join(userSkillsDir, id, 'SKILL.md');
          let desc = '(no SKILL.md)';
          if (fs.existsSync(skillMd)) {
            const text = fs.readFileSync(skillMd, 'utf8');
            const m = text.match(/^description:\s*(.+)$/m);
            if (m) desc = m[1].slice(0, 80);
          }
          ctx.print('tool', `  ${id.padEnd(36)} ${desc}`);
        }
        return true;
      }

      if (verb === 'info') {
        const id = sub[1];
        if (!id) { ctx.print('error', 'Usage: /skills info <id>'); return true; }
        const candidatesForId = [path.join(userSkillsDir, id), path.join(dir, id)];
        const target = candidatesForId.find((p) => fs.existsSync(p));
        if (!target) { ctx.print('error', `🪨 skill not found: ${id}`); return true; }
        const skillMd = path.join(target, 'SKILL.md');
        if (!fs.existsSync(skillMd)) { ctx.print('error', `🪨 ${id} has no SKILL.md`); return true; }
        const text = fs.readFileSync(skillMd, 'utf8');
        const fm = text.match(/^---\n([\s\S]*?)\n---/);
        ctx.print('system', `🛠️  ${id}  →  ${target}`);
        if (fm) for (const line of fm[1].split('\n')) ctx.print('tool', `  ${line}`);
        return true;
      }

      if (verb === 'inject') {
        const id = sub[1];
        if (!id) { ctx.print('error', 'Usage: /skills inject <id>'); return true; }
        const source = path.join(dir, id);
        if (!fs.existsSync(source)) { ctx.print('error', `🪨 source skill not found: ${source}`); return true; }
        if (!fs.existsSync(userSkillsDir)) fs.mkdirSync(userSkillsDir, { recursive: true });
        const dest = path.join(userSkillsDir, id);
        if (fs.existsSync(dest)) { ctx.print('system', `↪ ${id} already injected → ${dest}`); return true; }
        try {
          fs.symlinkSync(source, dest, 'dir');
          ctx.print('system', `✅ injected ${id} → ${dest} (symlink)`);
        } catch (e: any) {
          ctx.print('error', `inject: ${e?.message ?? e}`);
        }
        return true;
      }

      ctx.print('error', `unknown /skills subcommand: ${verb}`);
      return true;
    }

    // ── Voice ─────────────────────────────────────────────
    case 'speak': {
      if (!raw) { ctx.print('error', 'Usage: /speak <text>'); return true; }
      ctx.print('tool', `🔊 speaking via xAI TTS (${ctx.voiceVoice})...`);
      try {
        await speak(raw, { voice: ctx.voiceVoice });
        ctx.print('system', '✅ done');
      } catch (e: any) {
        ctx.print('error', `tts: ${e?.message ?? e}`);
      }
      return true;
    }
    case 'voiceset': {
      const v = (args[0] || '').toLowerCase();
      const valid = ['eve', 'ara', 'rex', 'sal', 'leo'] as const;
      if (!valid.includes(v as any)) { ctx.print('error', `pick one of: ${valid.join(', ')}`); return true; }
      ctx.setVoiceVoice(v as GrokVoice);
      ctx.print('system', `🎤 voice → ${v}`);
      return true;
    }
    case 'listen': {
      const sec = Math.min(60, Math.max(2, Number(args[0]) || 8));
      ctx.print('tool', `🎤 recording ${sec}s — speak now...`);
      try {
        const r = await listenAndTranscribe(sec);
        ctx.print('agent', `📜 you said: ${r.text}`);
        if (r.text.trim()) {
          ctx.print('tool', `🦞 streaming reply via ${ctx.model}...`);
          let acc = '';
          for await (const chunk of streamChat(r.text, ctx.model)) {
            if (chunk.text) { acc += chunk.text; }
          }
          ctx.print('agent', acc);
          // speak the reply back
          if (acc) try { await speak(acc.slice(0, 500), { voice: ctx.voiceVoice }); } catch {}
        }
      } catch (e: any) {
        ctx.print('error', `stt: ${e?.message ?? e}`);
      }
      return true;
    }
    case 'voice': {
      const sub = args[0] || (ctx.voiceSession ? 'off' : 'on');
      if (sub === 'off') {
        if (ctx.voiceSession) { await ctx.voiceSession.stop(); ctx.setVoiceSession(null); }
        ctx.setVoiceStatus('off');
        ctx.setVoiceUserText('');
        ctx.setVoiceAgentText('');
        ctx.print('system', '🌫  voice closed');
        return true;
      }
      if (ctx.voiceSession) { ctx.print('system', '🦞 voice already open'); return true; }
      ctx.print('tool', '🎤 opening realtime voice (grok-voice-think-fast-1.0, server VAD)...');
      ctx.setVoiceStatus('listening');
      try {
        const sess = await startRealtime({
          voice: ctx.voiceVoice,
          onPartialUserText: (t) => ctx.setVoiceUserText(t),
          onAgentText: (t) => { ctx.setVoiceAgentText(t); ctx.setVoiceStatus('thinking'); },
          onAudioStart: () => ctx.setVoiceStatus('speaking'),
          onAudioEnd: () => ctx.setVoiceStatus('listening'),
          onLog: (l) => ctx.print('tool', l),
          onError: (err) => { ctx.setVoiceErr(err.message); ctx.setVoiceStatus('error'); ctx.print('error', `voice: ${err.message}`); },
        });
        ctx.setVoiceSession(sess);
      } catch (e: any) {
        ctx.setVoiceStatus('error');
        ctx.print('error', `voice open failed: ${e?.message ?? e}`);
      }
      return true;
    }
  }

  return false;
}
