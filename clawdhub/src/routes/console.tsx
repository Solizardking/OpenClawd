import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_GATEWAY_BASE,
  OpenClawdGateway,
  readGatewayBase,
  writeGatewayBase,
  type AgentSkill,
  type AssetCard,
  type GatewayHealth,
  type WalletPortfolio,
} from "../lib/openclawd-gateway";

export const Route = createFileRoute("/console")({
  component: ConsoleRoute,
});

const SOLANA_PULSE = [
  "⠀⠀⠀⣀⠀⠀⠀",
  "⠀⠀⣠⣿⣄⠀⠀",
  "⠀⣴⣿⣿⣿⣦⠀",
  "⣾⣿⣿⣿⣿⣿⣷",
  "⠻⣿⣿⣿⣿⣿⠟",
  "⠀⠙⣿⣿⣿⠋⠀",
  "⠀⠀⠙⣿⠋⠀⠀",
  "⠀⠀⠀⠁⠀⠀⠀",
];
const LOBSTER_CLAW = [
  "   _\n  ( v ) c\n   ^^^^",
  "   _\n  ( ^ ) C\n   ^^^^",
  "   _\n  ( v ) c\n   ^^^^",
  "   _\n  ( o ) c\n   ^^^^",
];

function fmtUsd(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  if (a >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (a >= 1e3) return "$" + (n / 1e3).toFixed(2) + "K";
  if (a >= 1) return "$" + n.toFixed(2);
  if (a >= 0.01) return "$" + n.toFixed(4);
  return "$" + n.toPrecision(3);
}
function fmtNum(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (a >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function useSpinnerFrame(frames: readonly string[], interval: number) {
  const [frame, setFrame] = useState(frames[0]);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => setFrame(frames[(i = (i + 1) % frames.length)]), interval);
    return () => clearInterval(t);
  }, [frames, interval]);
  return frame;
}

function ConsoleRoute() {
  const [gwBase, setGwBase] = useState<string>(readGatewayBase());
  const [health, setHealth] = useState<GatewayHealth | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [lookupQ, setLookupQ] = useState("");
  const [lookup, setLookup] = useState<AssetCard | null>(null);
  const [lookupErr, setLookupErr] = useState<string | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [walletQ, setWalletQ] = useState("");
  const [wallet, setWallet] = useState<WalletPortfolio | null>(null);
  const [walletErr, setWalletErr] = useState<string | null>(null);
  const [walletBusy, setWalletBusy] = useState(false);
  const [skills, setSkills] = useState<AgentSkill[]>([]);
  const [skillsErr, setSkillsErr] = useState<string | null>(null);
  const [textPrompt, setTextPrompt] = useState("");
  const [textModel, setTextModel] = useState("");
  const [textOut, setTextOut] = useState("");
  const [textBusy, setTextBusy] = useState(false);

  const pulseFrame = useSpinnerFrame(SOLANA_PULSE, 100);
  const clawFrame = useSpinnerFrame(LOBSTER_CLAW, 220);

  const refreshHealth = useCallback(
    async (base?: string) => {
      try {
        const h = await OpenClawdGateway.health(base ?? gwBase);
        setHealth(h);
        setHealthError(null);
      } catch (err) {
        setHealthError((err as Error).message);
        setHealth(null);
      }
    },
    [gwBase],
  );

  const refreshSkills = useCallback(async () => {
    try {
      const r = await OpenClawdGateway.agentSkills(gwBase);
      setSkills(r.skills ?? []);
      setSkillsErr(null);
    } catch (err) {
      setSkillsErr((err as Error).message);
    }
  }, [gwBase]);

  // Boot + 8s polling
  const polling = useRef<number | null>(null);
  useEffect(() => {
    void refreshHealth();
    void refreshSkills();
    polling.current = window.setInterval(() => void refreshHealth(), 8000);
    return () => {
      if (polling.current) clearInterval(polling.current);
    };
  }, [refreshHealth, refreshSkills]);

  const onGwChange = (next: string) => {
    const normalized = writeGatewayBase(next);
    setGwBase(normalized);
    void refreshHealth(normalized);
  };

  const runLookup = async () => {
    if (!lookupQ.trim()) return;
    setLookupBusy(true);
    setLookupErr(null);
    try {
      setLookup(await OpenClawdGateway.asset(lookupQ.trim(), gwBase));
    } catch (err) {
      setLookupErr((err as Error).message);
      setLookup(null);
    } finally {
      setLookupBusy(false);
    }
  };

  const runWallet = async () => {
    if (!walletQ.trim()) return;
    setWalletBusy(true);
    setWalletErr(null);
    try {
      setWallet(await OpenClawdGateway.walletPortfolio(walletQ.trim(), gwBase));
    } catch (err) {
      setWalletErr((err as Error).message);
      setWallet(null);
    } finally {
      setWalletBusy(false);
    }
  };

  const runText = async () => {
    if (!textPrompt.trim()) return;
    setTextBusy(true);
    setTextOut("🦞 thinking…");
    try {
      const r = await OpenClawdGateway.agentText(
        textPrompt.trim(),
        { model: textModel || undefined },
        gwBase,
      );
      setTextOut(r.text || "(empty)");
    } catch (err) {
      setTextOut("✖ " + (err as Error).message);
    } finally {
      setTextBusy(false);
    }
  };

  const dot = (state: boolean | undefined) =>
    state ? "ok" : state === false ? "err" : "warn";

  const lookupCard = useMemo(() => {
    if (!lookup) return null;
    const tok = lookup.token_info ?? {};
    const meta = lookup.content?.metadata ?? {};
    const symbol = tok.symbol ?? meta.symbol ?? lookup.symbol ?? "?";
    const name = meta.name ?? lookup.name ?? "";
    const decimals = tok.decimals ?? lookup.decimals;
    const supply = tok.supply ?? null;
    const adjusted = supply != null && tok.decimals != null ? supply / Math.pow(10, tok.decimals) : null;
    const price = tok.price_info?.price_per_token ?? lookup.price ?? null;
    const mcap = price != null && adjusted != null ? price * adjusted : lookup.marketCap ?? null;
    const change = lookup.priceChange24hPercent;
    return (
      <div className="cn-result">
        <Kv label="source" value={lookup._source ?? "?"} />
        <Kv label="symbol" value={`$${symbol}`} accent />
        {name && <Kv label="name" value={name} />}
        <Kv
          label="price"
          valueNode={
            <>
              <span className="cn-price">{fmtUsd(price)}</span>
              {change != null && (
                <>
                  <span className="cn-lbl">24h</span>
                  <span className={change >= 0 ? "cn-ok" : "cn-err"}>{change.toFixed(2)}%</span>
                </>
              )}
            </>
          }
        />
        {mcap != null && <Kv label="mcap" value={fmtUsd(mcap)} />}
        {lookup.liquidity != null && <Kv label="liquidity" value={fmtUsd(lookup.liquidity)} />}
        {lookup.v24hUSD != null && <Kv label="vol 24h" value={fmtUsd(lookup.v24hUSD)} />}
        {supply != null && (
          <Kv
            label="supply"
            valueNode={
              <>
                <span>{fmtNum(adjusted ?? supply)}</span>
                <span className="cn-lbl">dec</span>
                <span>{decimals ?? "—"}</span>
              </>
            }
          />
        )}
        {meta.description && <div className="cn-desc">{String(meta.description).slice(0, 240)}</div>}
      </div>
    );
  }, [lookup]);

  const walletCard = useMemo(() => {
    if (!wallet) return null;
    const items = (wallet.items ?? []).filter((i) => (i.valueUsd ?? 0) > 0);
    items.sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0));
    const total = wallet.totalUsd ?? items.reduce((s, i) => s + (i.valueUsd ?? 0), 0);
    const native = wallet.nativeBalance ?? {};
    return (
      <div className="cn-result">
        <Kv label="source" value={wallet.source ?? "birdeye"} />
        <Kv
          label="total USD"
          valueNode={<span className="cn-price">{fmtUsd(total)}</span>}
        />
        <Kv label="tokens" value={String(wallet.items?.length ?? 0)} />
        {native.lamports != null && (
          <Kv
            label="native SOL"
            valueNode={
              <>
                <span>{(native.lamports / 1e9).toFixed(4)} SOL</span>
                {native.total_price != null && (
                  <>
                    <span> ≈ </span>
                    <span className="cn-price">{fmtUsd(native.total_price)}</span>
                  </>
                )}
              </>
            }
          />
        )}
        {items.length > 0 && <div className="cn-sub-head">top holdings</div>}
        {items.slice(0, 10).map((i) => (
          <div key={i.address} className="cn-kv">
            <span className="cn-lbl">${i.symbol ?? "?"}</span>
            <span>{fmtNum(i.uiAmount)}</span>
            <span className="cn-lbl">@</span>
            <span>{fmtUsd(i.priceUsd)}</span>
            <span className="cn-lbl">=</span>
            <span className="cn-price">{fmtUsd(i.valueUsd)}</span>
          </div>
        ))}
      </div>
    );
  }, [wallet]);

  return (
    <main className="section console-section">
      <style>{CONSOLE_CSS}</style>

      <header className="cn-hero">
        <div>
          <span className="hero-badge">live · {gwBase}</span>
          <h1 className="hero-title">
            The lobster<br />is <span className="cn-grad">awake.</span>
          </h1>
          <p className="hero-subtitle">
            Live operational console for the OpenClawd HTTP gateway. Every card is real data — Birdeye,
            Helius DAS, the agent runtime, and the skill registry.
          </p>
          <div className="cn-pills">
            <Pill state={dot(!!health && !healthError)} label="gw" />
            <Pill state={dot(health?.birdeye)} label="bird" />
            <Pill state={dot(health?.helius)} label="hel" />
            <Pill state={dot(health?.srcModules?.runtime === "ok")} label="rt" />
          </div>
          <div className="cn-gw-row">
            <label className="cn-lbl">gateway</label>
            <input
              className="cn-input cn-mono"
              defaultValue={gwBase}
              spellCheck={false}
              onBlur={(e) => onGwChange(e.currentTarget.value)}
              placeholder={DEFAULT_GATEWAY_BASE}
            />
          </div>
        </div>
        <div className="cn-anim">
          <pre className="cn-anim-pulse">{pulseFrame}</pre>
          <pre className="cn-anim-claw">{clawFrame}</pre>
        </div>
      </header>

      {/* Lookup */}
      <section className="card cn-card">
        <div className="cn-card-head">
          <h2>Token / Address Lookup</h2>
          <span className="cn-pill cn-pill-orange">/api/helius/asset</span>
        </div>
        <p className="cn-hint">
          Paste any Solana mint or wallet. Gateway → <code>src/helius/HeliusClient</code> → DAS getAsset, with
          Birdeye fallback.
        </p>
        <div className="cn-row">
          <input
            className="cn-input cn-mono cn-flex"
            placeholder="So11111111111111111111111111111111111111112"
            value={lookupQ}
            onChange={(e) => setLookupQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runLookup()}
          />
          <button className="btn btn-primary" disabled={lookupBusy} onClick={runLookup}>
            {lookupBusy ? "…" : "Look up"}
          </button>
          <button
            className="btn"
            onClick={() => {
              setLookupQ("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263");
              setTimeout(runLookup, 0);
            }}
          >
            BONK
          </button>
          <button
            className="btn"
            onClick={() => {
              setLookupQ("So11111111111111111111111111111111111111112");
              setTimeout(runLookup, 0);
            }}
          >
            SOL
          </button>
        </div>
        {lookupErr && <div className="cn-err">✖ {lookupErr}</div>}
        {lookupCard}
      </section>

      {/* Wallet */}
      <section className="card cn-card">
        <div className="cn-card-head">
          <h2>Wallet Portfolio</h2>
          <span className="cn-pill cn-pill-green">/api/wallet/portfolio</span>
        </div>
        <p className="cn-hint">Birdeye → Helius DAS fallback. Native SOL + ranked USD-valued holdings.</p>
        <div className="cn-row">
          <input
            className="cn-input cn-mono cn-flex"
            placeholder="86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY"
            value={walletQ}
            onChange={(e) => setWalletQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runWallet()}
          />
          <button className="btn btn-primary" disabled={walletBusy} onClick={runWallet}>
            {walletBusy ? "…" : "Fetch"}
          </button>
        </div>
        {walletErr && <div className="cn-err">✖ {walletErr}</div>}
        {walletCard}
      </section>

      {/* Agent runtime */}
      <section className="card cn-card">
        <div className="cn-card-head">
          <h2>Agent Runtime</h2>
          <span className="cn-pill cn-pill-purple">/api/agent/*</span>
        </div>
        <p className="cn-hint">
          Skill registry from <code>src/agents/runtime.ts</code>. Run a prompt through OpenRouter.
        </p>
        <div className="cn-row">
          <button className="btn" onClick={() => void refreshSkills()}>
            Refresh
          </button>
        </div>
        {skillsErr && <div className="cn-err">✖ {skillsErr}</div>}
        <div className="cn-skills">
          {skills.length === 0 ? (
            <span className="cn-lbl">no skills loaded</span>
          ) : (
            skills.map((s) => (
              <div key={s.key} className={`cn-skill ${s.enabled ? "" : "cn-skill-off"}`}>
                <div className="cn-skill-key">{s.key ?? "?"}</div>
                <div className="cn-skill-name">
                  {s.name ?? ""}
                  <div className="cn-skill-meta">{s.description ?? ""}</div>
                </div>
                <div className="cn-skill-kind">{s.kind ?? "misc"}</div>
              </div>
            ))
          )}
        </div>
        <details className="cn-details">
          <summary>Run a prompt through OpenRouter</summary>
          <textarea
            className="cn-input cn-textarea"
            placeholder="Brief one-liner: what's the lobster doing right now?"
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
          />
          <div className="cn-row">
            <input
              className="cn-input cn-mono cn-short"
              placeholder="anthropic/claude-sonnet-4"
              value={textModel}
              onChange={(e) => setTextModel(e.target.value)}
            />
            <button className="btn btn-primary" disabled={textBusy} onClick={runText}>
              {textBusy ? "…" : "Generate"}
            </button>
          </div>
          {textOut && <pre className="cn-result cn-mono">{textOut}</pre>}
        </details>
      </section>

      {/* Health */}
      <section className="card cn-card">
        <div className="cn-card-head">
          <h2>Gateway Health</h2>
          <span className="cn-pill">/health</span>
        </div>
        <pre className="cn-result cn-mono">
          {JSON.stringify(health ?? { error: healthError }, null, 2)}
        </pre>
      </section>
    </main>
  );
}

function Kv({
  label,
  value,
  valueNode,
  accent,
}: {
  label: string;
  value?: string;
  valueNode?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="cn-kv">
      <span className="cn-lbl">{label}</span>
      <span className={accent ? "cn-accent" : ""}>{valueNode ?? value}</span>
    </div>
  );
}

function Pill({ state, label }: { state: "ok" | "err" | "warn"; label: string }) {
  return (
    <span className="cn-pill-dot">
      <span className={`cn-dot cn-dot-${state}`} /> {label}
    </span>
  );
}

const CONSOLE_CSS = `
  .console-section { max-width: 1080px; margin: 0 auto; padding: 32px 24px 64px; }
  .cn-hero { display: grid; grid-template-columns: 1fr auto; gap: 32px; align-items: center; padding: 40px 0 32px; }
  @media (max-width: 720px) { .cn-hero { grid-template-columns: 1fr; } }
  .cn-grad { background: linear-gradient(135deg, #14F195 0%, #9945FF 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .cn-pills { display: flex; gap: 12px; margin-top: 16px; font-size: 12px; color: var(--clr-muted, #93a0bd); font-family: 'JetBrains Mono', monospace; }
  .cn-pill-dot { display: inline-flex; align-items: center; gap: 5px; }
  .cn-dot { width: 9px; height: 9px; border-radius: 50%; background: #5a6685; display: inline-block; }
  .cn-dot-ok { background: #14F195; box-shadow: 0 0 8px rgba(20,241,149,.4); }
  .cn-dot-err { background: #ff5d6c; }
  .cn-dot-warn { background: #ff9e44; }
  .cn-gw-row { display: flex; gap: 8px; align-items: center; margin-top: 14px; }
  .cn-anim { display: flex; flex-direction: column; gap: 14px; align-items: center; }
  .cn-anim-pulse { margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 18px; line-height: 1.1; color: #14F195; text-shadow: 0 0 12px rgba(20,241,149,.4); white-space: pre; }
  .cn-anim-claw { margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 14px; line-height: 1.1; color: #ff9e44; text-shadow: 0 0 10px rgba(255,158,68,.3); white-space: pre; }
  .cn-card { padding: 22px; margin-bottom: 16px; border-radius: 14px; }
  .cn-card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
  .cn-card h2 { margin: 0; font-size: 17px; font-weight: 700; flex: 1; }
  .cn-pill { font-size: 11px; font-weight: 700; letter-spacing: .04em; padding: 3px 10px; border-radius: 999px; background: rgba(255,158,68,.10); color: #ff9e44; font-family: 'JetBrains Mono', monospace; }
  .cn-pill-orange { background: rgba(255,158,68,.10); color: #ff9e44; }
  .cn-pill-green { background: rgba(20,241,149,.10); color: #14F195; }
  .cn-pill-purple { background: rgba(153,69,255,.10); color: #9945FF; }
  .cn-hint { color: var(--clr-muted, #93a0bd); font-size: 13.5px; margin: 6px 0 14px; }
  .cn-hint code { background: rgba(20,241,149,.08); color: #14F195; padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
  .cn-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .cn-input { background: var(--clr-bg, #0a0e1a); border: 1px solid var(--clr-border-bright, #2c3a60); color: inherit; border-radius: 10px; padding: 10px 12px; font-size: 13.5px; outline: none; }
  .cn-input:focus { border-color: #14F195; box-shadow: 0 0 0 3px rgba(20,241,149,.15); }
  .cn-mono { font-family: 'JetBrains Mono', monospace; font-size: 12.5px; }
  .cn-flex { flex: 1; }
  .cn-short { flex: 0 0 220px; }
  .cn-textarea { width: 100%; min-height: 80px; resize: vertical; margin-bottom: 12px; font-family: inherit; }
  .cn-result { background: var(--clr-bg, #0a0e1a); border: 1px solid var(--clr-border, #1f2942); border-radius: 10px; padding: 12px 14px; margin-top: 12px; font-size: 13px; max-height: 460px; overflow: auto; word-break: break-word; }
  .cn-result.cn-mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; white-space: pre-wrap; }
  .cn-kv { margin: 4px 0; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .cn-lbl { color: var(--clr-mute, #5a6685); font-size: 12px; min-width: 90px; display: inline-block; }
  .cn-accent { color: #14F195; font-weight: 700; }
  .cn-price { color: #14F195; font-weight: 700; }
  .cn-ok { color: #14F195; }
  .cn-err { color: #ff5d6c; font-size: 13px; margin-top: 8px; }
  .cn-desc { color: var(--clr-muted, #93a0bd); font-size: 12.5px; margin-top: 8px; }
  .cn-sub-head { color: var(--clr-mute, #5a6685); font-size: 12px; margin-top: 10px; }
  .cn-skills { margin-top: 14px; max-height: 360px; overflow: auto; }
  .cn-skill { display: flex; gap: 12px; align-items: center; background: var(--clr-bg, #0a0e1a); border: 1px solid var(--clr-border, #1f2942); border-radius: 10px; padding: 10px 14px; margin-bottom: 6px; }
  .cn-skill-off { opacity: .55; }
  .cn-skill-key { font-family: 'JetBrains Mono', monospace; font-size: 12.5px; color: #14F195; flex: 0 0 220px; }
  .cn-skill-name { font-size: 13.5px; flex: 1; }
  .cn-skill-meta { color: var(--clr-mute, #5a6685); font-size: 11.5px; margin-top: 2px; }
  .cn-skill-kind { font-size: 11px; color: var(--clr-mute, #5a6685); padding: 2px 8px; border-radius: 999px; border: 1px solid var(--clr-border-bright, #2c3a60); }
  .cn-details { margin-top: 16px; background: var(--clr-bg, #0a0e1a); border: 1px solid var(--clr-border, #1f2942); border-radius: 10px; padding: 12px 14px; }
  .cn-details summary { cursor: pointer; font-size: 13.5px; font-weight: 600; }
  .cn-details[open] summary { margin-bottom: 12px; }
`;
