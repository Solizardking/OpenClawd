import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { openClawdCatalog } from "../lib/generated/openclawdCatalog";

export const Route = createFileRoute("/marketplace")({
  component: MarketplaceRoute,
});

type Category =
  | "all"
  | "openclawd"
  | "pumpfun"
  | "solana"
  | "ai"
  | "wurk"
  | "security"
  | "devops";

const CATEGORY_LABELS: Record<Category, string> = {
  all: "All skills",
  openclawd: "OpenClawd Ecosystem",
  pumpfun: "Pump.fun Trading",
  solana: "Solana / Blockchain",
  ai: "AI / Agents",
  wurk: "Wurk x402",
  security: "Security (ClawdVault)",
  devops: "DevOps",
};

function categorize(skill: { name: string; path?: string }): Category {
  const blob = `${skill.name} ${skill.path ?? ""}`.toLowerCase();
  if (/clawd|leviathan|openclawd/.test(blob)) return "openclawd";
  if (/pump\.?fun|sniper|graduation|bonding/.test(blob)) return "pumpfun";
  if (/solana|helius|jupiter|spl|metaplex/.test(blob)) return "solana";
  if (/grok|claude|openai|gemini|agent|llm/.test(blob)) return "ai";
  if (/wurk|x402|social/.test(blob)) return "wurk";
  if (/vault|security|scan|policy/.test(blob)) return "security";
  if (/e2b|sandbox|tmux|gateway|node-ops/.test(blob)) return "devops";
  return "openclawd";
}

const FEATURED_SKILLS = [
  { slug: "openclawd", title: "openclawd", desc: "OODA loop trading + 31 MCP tools on Solana", price: "Free" },
  { slug: "clawd-trader", title: "clawd-trader", desc: "Full $CLAWD ecosystem — perps via Hyperliquid/Aster", price: "Free" },
  { slug: "pumpfun-launcher", title: "pumpfun-launcher", desc: "Launch tokens on Pump.fun with AP2 mandates", price: "$0.10/call" },
  { slug: "wurk-social", title: "wurk-social", desc: "Social campaigns via Wurk.fun x402 on Solana/Base", price: "$0.05/call" },
  { slug: "clawd-vault-scan", title: "clawd-vault-scan", desc: "Security scan for SKILL.md bundles", price: "Free" },
  { slug: "swarm-orchestrator", title: "swarm-orchestrator", desc: "Multi-bot trading swarms on Pump.fun", price: "$0.20/call" },
];

function MarketplaceRoute() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const skills = openClawdCatalog.skills.map((s) => ({ ...s, category: categorize(s) }));

  const counts = useMemo(() => {
    const out: Record<Category, number> = {
      all: skills.length,
      openclawd: 0,
      pumpfun: 0,
      solana: 0,
      ai: 0,
      wurk: 0,
      security: 0,
      devops: 0,
    };
    for (const s of skills) out[s.category]++;
    return out;
  }, [skills]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter((s) => {
      if (activeCategory !== "all" && s.category !== activeCategory) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.path?.toLowerCase().includes(q)
      );
    });
  }, [query, activeCategory, skills]);

  return (
    <main className="section">
      <style>{MARKETPLACE_CSS}</style>

      <header className="hero">
        <div className="hero-copy">
          <span className="hero-badge">hub.solanaclawd.com / marketplace</span>
          <h1 className="hero-title">Skills marketplace</h1>
          <p className="hero-subtitle">
            Browse, install, and publish <code>SKILL.md</code> bundles for the OpenClawd ecosystem.
            {" "}
            <strong>{openClawdCatalog.skillCount}</strong> skills published.
          </p>
          <div className="hero-actions">
            <Link to="/console" className="btn btn-primary">
              🦞 Live Console
            </Link>
            <Link to="/hub" className="btn">
              Catalog browser
            </Link>
            <Link to="/agents" className="btn">
              Agents (49)
            </Link>
          </div>
        </div>
      </header>

      {/* Featured */}
      <section className="mp-section">
        <h2 className="mp-h2">Featured skills</h2>
        <div className="mp-grid">
          {FEATURED_SKILLS.map((f) => (
            <div key={f.slug} className="mp-card">
              <div className="mp-card-head">
                <div className="mp-card-title">{f.title}</div>
                <div className={f.price === "Free" ? "mp-price mp-price-free" : "mp-price"}>{f.price}</div>
              </div>
              <div className="mp-card-desc">{f.desc}</div>
              <div className="mp-card-actions">
                <code className="mp-cmd">npx clawdhub install {f.slug}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category tabs */}
      <section className="mp-section">
        <div className="mp-tabs">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
            <button
              key={cat}
              className={`mp-tab ${activeCategory === cat ? "mp-tab-active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {CATEGORY_LABELS[cat]} <span className="mp-tab-count">{counts[cat]}</span>
            </button>
          ))}
        </div>

        <div className="mp-search">
          <input
            className="mp-input"
            placeholder="Search skills by name or path…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="mp-search-count">{filtered.length} match</span>
        </div>

        {filtered.length === 0 ? (
          <div className="mp-empty">No skills match — try a different query or category.</div>
        ) : (
          <div className="mp-list">
            {filtered.map((s) => (
              <a
                key={s.path ?? s.name}
                className="mp-row"
                href={s.path ? `/hub#${s.name}` : "#"}
              >
                <div className="mp-row-name">{s.name}</div>
                <div className="mp-row-path">{s.path ?? "—"}</div>
                <div className="mp-row-cat">{CATEGORY_LABELS[categorize(s)]}</div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* CLI */}
      <section className="mp-section">
        <h2 className="mp-h2">Install via CLI</h2>
        <div className="mp-cli">
          <pre className="mp-cli-pre">
{`# Install
npx clawdhub install <slug>

# Search
npx clawdhub search solana

# Publish your own
npx clawdhub publish ./my-skill --slug my-skill

# Scan before publishing
npx clawdhub scan ./my-skill`}
          </pre>
        </div>
      </section>
    </main>
  );
}

const MARKETPLACE_CSS = `
  .mp-section { max-width: 1080px; margin: 0 auto; padding: 32px 24px; }
  .mp-h2 { font-size: 18px; font-weight: 700; margin: 0 0 16px; }
  .mp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
  .mp-card { background: var(--clr-card, #131a2e); border: 1px solid var(--clr-border, #1f2942); border-radius: 14px; padding: 18px; transition: border-color .15s; }
  .mp-card:hover { border-color: var(--clr-border-bright, #2c3a60); }
  .mp-card-head { display: flex; gap: 12px; align-items: center; margin-bottom: 8px; }
  .mp-card-title { font-weight: 700; font-size: 15px; flex: 1; color: var(--clr-text, #e6edf7); }
  .mp-price { font-size: 11px; padding: 3px 10px; border-radius: 999px; font-family: 'JetBrains Mono', monospace; background: rgba(255,158,68,.12); color: #ff9e44; font-weight: 700; }
  .mp-price-free { background: rgba(20,241,149,.12); color: #14F195; }
  .mp-card-desc { color: var(--clr-muted, #93a0bd); font-size: 13.5px; margin-bottom: 12px; }
  .mp-card-actions code, .mp-cmd { display: block; background: var(--clr-bg, #0a0e1a); border: 1px solid var(--clr-border, #1f2942); border-radius: 8px; padding: 8px 10px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #14F195; }
  .mp-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
  .mp-tab { background: transparent; border: 1px solid var(--clr-border-bright, #2c3a60); color: var(--clr-text, #e6edf7); padding: 7px 14px; border-radius: 999px; font-size: 13px; cursor: pointer; transition: all .15s; }
  .mp-tab:hover { border-color: #14F195; }
  .mp-tab-active { background: linear-gradient(135deg, #14F195 0%, #9945FF 100%); color: #0a0e1a; border-color: transparent; font-weight: 700; }
  .mp-tab-count { font-family: 'JetBrains Mono', monospace; font-size: 11px; opacity: .7; margin-left: 4px; }
  .mp-search { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; }
  .mp-input { flex: 1; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--clr-border-bright, #2c3a60); background: var(--clr-bg, #0a0e1a); color: var(--clr-text, #e6edf7); font-size: 14px; outline: none; }
  .mp-input:focus { border-color: #14F195; box-shadow: 0 0 0 3px rgba(20,241,149,.15); }
  .mp-search-count { color: var(--clr-mute, #5a6685); font-family: 'JetBrains Mono', monospace; font-size: 12px; }
  .mp-list { display: flex; flex-direction: column; gap: 6px; }
  .mp-row { display: grid; grid-template-columns: 1fr 1.5fr auto; gap: 12px; align-items: center; padding: 10px 14px; background: var(--clr-card, #131a2e); border: 1px solid var(--clr-border, #1f2942); border-radius: 10px; text-decoration: none; color: inherit; transition: border-color .15s; }
  .mp-row:hover { border-color: #14F195; }
  .mp-row-name { font-weight: 600; font-size: 13.5px; }
  .mp-row-path { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--clr-muted, #93a0bd); }
  .mp-row-cat { font-size: 11px; color: var(--clr-mute, #5a6685); padding: 3px 10px; border-radius: 999px; border: 1px solid var(--clr-border, #1f2942); white-space: nowrap; }
  .mp-empty { color: var(--clr-muted, #93a0bd); padding: 24px; text-align: center; background: var(--clr-card, #131a2e); border-radius: 14px; }
  .mp-cli-pre { background: var(--clr-bg, #0a0e1a); border: 1px solid var(--clr-border, #1f2942); border-radius: 12px; padding: 16px 20px; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.7; color: #14F195; overflow-x: auto; }
`;
