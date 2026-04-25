/**
 * solanaclawd-install — Cloudflare Worker
 *
 * Serves:
 *   - https://solanaclawd.com/install.sh  → raw shell script
 *   - https://solanaclawd.com/gateway     → HTML installer gateway
 *   - https://solanaclawd.com/install      → redirect to gateway
 *
 * The install.sh body is embedded in this worker (see ./install-script.ts)
 * so it works even when the openclawd repo is private.
 *
 * Deploy:
 *   cd workers/install-worker && npm install && npx wrangler deploy
 */

import { INSTALL_SCRIPT } from "./install-script";

export interface Env {}

const CACHE_TTL_SECONDS = 300;

const GATEWAY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenClawd · Install Gateway</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
      background: #0a0a0f;
      color: #e0e0e0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .container {
      max-width: 800px;
      width: 100%;
      text-align: center;
    }
    .lobster {
      font-size: 4rem;
      margin-bottom: 1rem;
      animation: wave 2s ease-in-out infinite;
    }
    @keyframes wave {
      0%, 100% { transform: rotate(-5deg); }
      50% { transform: rotate(5deg); }
    }
    h1 {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #ff6b9d, #c44cff, #6b9dff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      color: #888;
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }
    .box {
      background: linear-gradient(135deg, rgba(255,107,157,0.1), rgba(196,76,255,0.1));
      border: 1px solid rgba(255,107,157,0.3);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
    }
    .box h2 {
      color: #ff6b9d;
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }
    .command {
      background: #1a1a24;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 1rem 1.5rem;
      font-size: 1rem;
      margin-bottom: 1.5rem;
      overflow-x: auto;
    }
    .command code {
      color: #6bffb8;
    }
    .copy-btn {
      background: linear-gradient(135deg, #ff6b9d, #c44cff);
      border: none;
      color: white;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .copy-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(255,107,157,0.4);
    }
    .copy-btn:active {
      transform: translateY(0);
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }
    .feature {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: left;
    }
    .feature h3 {
      color: #6b9dff;
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }
    .feature p {
      color: #888;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .token {
      color: #ff6b9d;
      font-size: 0.85rem;
      margin-top: 1rem;
      word-break: break-all;
    }
    .footer {
      margin-top: 3rem;
      color: #555;
      font-size: 0.85rem;
    }
    .footer a {
      color: #6b9dff;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="lobster">🦞</div>
    <h1>OpenClawd</h1>
    <p class="subtitle">Sovereign-lobster Solana agentic framework · lobster edition</p>
    
    <div class="box">
      <h2>Quick Install</h2>
      <div class="command">
        <code>curl -fsSL https://solanaclawd.com/install.sh | bash</code>
      </div>
      <button class="copy-btn" onclick="copyCommand()">Copy Command</button>
      <p class="token">$CLAWD · 8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump</p>
    </div>
    
    <div class="features">
      <div class="feature">
        <h3>🎤 Realtime Voice</h3>
        <p>Full-duplex audio with Grok via WebSocket. Toggle with /voice or Ctrl+B.</p>
      </div>
      <div class="feature">
        <h3>⛓️ On-Chain Leviathan</h3>
        <p>Auto-detects keystore.json. View identity, age, SHELL.md size.</p>
      </div>
      <div class="feature">
        <h3>🤖 50+ Agent Commands</h3>
        <p>Trading, buddies, leviathan framework, ocean view, and more.</p>
      </div>
      <div class="feature">
        <h3>🛡️ Three-Laws Gate</h3>
        <p>Trading commands show constitution and require confirmation.</p>
      </div>
    </div>
    
    <div class="footer">
      <p>📞 909-413-5567 · <a href="https://solanaclawd.com">solanaclawd.com</a> · <a href="https://github.com/x402agent/openclawd">GitHub</a></p>
    </div>
  </div>
  
  <script>
    function copyCommand() {
      const cmd = 'curl -fsSL https://solanaclawd.com/install.sh | bash';
      navigator.clipboard.writeText(cmd).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy Command', 2000);
      });
    }
  </script>
</body>
</html>`;

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { allow: "GET, HEAD" },
      });
    }

    const pathname = url.pathname;

    // Health check
    if (pathname.endsWith("/healthz")) {
      return new Response("ok\n", {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    // Gateway HTML page
    if (pathname === "/gateway" || pathname === "/gateway/" || pathname === "/install") {
      return new Response(GATEWAY_HTML, {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": `public, max-age=${CACHE_TTL_SECONDS}`,
        },
      });
    }

    // Default: serve install.sh
    return new Response(INSTALL_SCRIPT, {
      status: 200,
      headers: {
        "content-type": "text/x-shellscript; charset=utf-8",
        "cache-control": `public, max-age=${CACHE_TTL_SECONDS}`,
        "content-disposition": 'inline; filename="install.sh"',
        "x-robots-tag": "noindex",
      },
    });
  },
} satisfies ExportedHandler<Env>;
