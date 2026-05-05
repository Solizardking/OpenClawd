import { html } from "lit";
import {
  OPENCLAWD_PACKAGES,
  PACKAGE_ARTICLE_GITHUB,
  PACKAGE_GITHUB_INDEX,
  PACKAGE_README_GITHUB,
  type OpenClawdPackage,
} from "../data/openclawd-packages";

type PackageFilter = "all" | OpenClawdPackage["group"];

const GROUPS: PackageFilter[] = ["all", "wallet", "trading", "payments", "memory", "runtime", "operator"];

export type PackagesProps = {
  filter: string;
  onFilterChange: (next: string) => void;
};

export function renderPackages(props: PackagesProps) {
  const raw = props.filter.trim().toLowerCase();
  const group = GROUPS.includes(raw as PackageFilter) ? (raw as PackageFilter) : "all";
  const packages = OPENCLAWD_PACKAGES.filter((pkg) => group === "all" || pkg.group === group);
  const counts = summarizePackages();

  return html`
    <section class="stack-hero">
      <div>
        <div class="eyebrow">Package Layer</div>
        <h2>OpenClawd modules, connection surfaces, and GitHub paths.</h2>
        <p>
          Wallets, Solana execution, x402 payments, memory services, and internal runtime contracts
          are split into package boundaries so each agent surface can connect to the part it needs.
        </p>
      </div>
      <div class="stack-actions">
        <a class="btn" href=${PACKAGE_GITHUB_INDEX} target="_blank" rel="noreferrer">GitHub packages</a>
        <a class="btn" href=${PACKAGE_README_GITHUB} target="_blank" rel="noreferrer">README</a>
        <a class="btn" href=${PACKAGE_ARTICLE_GITHUB} target="_blank" rel="noreferrer">Article</a>
      </div>
    </section>

    <section class="grid grid-cols-4 stack-metrics" style="margin-top: 16px;">
      <div class="card stat-card">
        <div class="stat-label">Packages</div>
        <div class="stat-value">${OPENCLAWD_PACKAGES.length}</div>
        <div class="muted">Tracked package directories.</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Public</div>
        <div class="stat-value ok">${counts.public}</div>
        <div class="muted">Published or public-facing surfaces.</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Private</div>
        <div class="stat-value">${counts.private}</div>
        <div class="muted">Internal runtime contracts.</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">High Risk</div>
        <div class="stat-value warn">${counts.highRisk}</div>
        <div class="muted">Wallet, payment, or trading paths.</div>
      </div>
    </section>

    <section class="card" style="margin-top: 16px;">
      <div class="row" style="justify-content: space-between; align-items: flex-start;">
        <div>
          <div class="card-title">Packages</div>
          <div class="card-sub">Filter by subsystem and open local/GitHub package targets.</div>
        </div>
        <div class="segmented-control" role="tablist" aria-label="Package group">
          ${GROUPS.map(
            (entry) => html`
              <button
                class=${entry === group ? "active" : ""}
                @click=${() => props.onFilterChange(entry)}
              >
                ${entry}
              </button>
            `,
          )}
        </div>
      </div>

      <div class="package-grid" style="margin-top: 16px;">
        ${packages.map((pkg) => renderPackageCard(pkg))}
      </div>
    </section>

    <section class="card" style="margin-top: 16px;">
      <div class="card-title">Connection Checklist</div>
      <div class="card-sub">
        Use this as the frontend handoff between package docs and live gateway configuration.
      </div>
      <div class="connection-grid" style="margin-top: 14px;">
        <div>
          <div class="note-title">1. Runtime URLs</div>
          <div class="muted">
            Set gateway and local service URLs through config or the service registry package.
          </div>
        </div>
        <div>
          <div class="note-title">2. Read-only data</div>
          <div class="muted">
            Connect Helius, Birdeye, Jupiter quote, Honcho, and Membrain read paths first.
          </div>
        </div>
        <div>
          <div class="note-title">3. Execution gates</div>
          <div class="muted">
            Enable wallet signing, x402 settlement, and trading only after approval policy is visible.
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderPackageCard(pkg: OpenClawdPackage) {
  return html`
    <article class="package-card package-card--${pkg.group}">
      <div class="package-card__head">
        <div>
          <div class="package-card__name">${pkg.name}</div>
          <div class="package-card__npm">${pkg.npmName}</div>
        </div>
        <span class="chip ${pkg.status === "private" ? "chip-warn" : "chip-ok"}">${pkg.status}</span>
      </div>
      <p>${pkg.summary}</p>
      <div class="package-card__meta">
        <span>${pkg.group}</span>
        <span>${pkg.scale}</span>
      </div>
      <div class="package-card__connect">
        <span>Connect:</span>
        ${pkg.connection}
      </div>
      ${
        pkg.primaryEnv.length
          ? html`
              <div class="env-list">
                ${pkg.primaryEnv.map((env) => html`<code>${env}</code>`)}
              </div>
            `
          : html`<div class="muted" style="font-size: 12px;">No required env surface.</div>`
      }
      <div class="package-card__links">
        <a href=${pkg.githubPath} target="_blank" rel="noreferrer">GitHub</a>
        ${pkg.docsPath
          ? html`<a href=${pkg.githubPath.replace("/tree/main/", "/blob/main/") + "/README.md"} target="_blank" rel="noreferrer">Docs</a>`
          : ""}
      </div>
      <div class="package-card__path mono">${pkg.localPath}</div>
    </article>
  `;
}

function summarizePackages() {
  return OPENCLAWD_PACKAGES.reduce(
    (acc, pkg) => {
      if (pkg.status === "public") acc.public += 1;
      if (pkg.status === "private") acc.private += 1;
      if (pkg.group === "wallet" || pkg.group === "trading" || pkg.group === "payments") {
        acc.highRisk += 1;
      }
      return acc;
    },
    { public: 0, private: 0, highRisk: 0 },
  );
}
