import Link from "next/link";

import {
  CheckCircle2,
  Fingerprint,
  KeyRound,
  Link2,
  type LucideIcon,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { buildLocaleAlternates } from "@/lib/locale-routing";

import { GuidesActions } from "@/components/guides-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Guides · Blockchain Buddies",
  description:
    "Implementation guides for Blockchain Buddies authentication, Web3, and Solana account flows.",
  alternates: buildLocaleAlternates("/guides"),
  openGraph: {
    title: "Blockchain Buddies Guides",
    description:
      "Implementation guides for authentication, Web3, Solana wallets, and account linking.",
    images: ["/og.png"],
  },
};

type GuideStep = {
  title: string;
  body: string;
  icon: LucideIcon;
  checks: string[];
};

type ConfigRow = {
  label: string;
  value: string;
  note?: string;
  secret?: boolean;
};

const CLERK_CONFIG: ConfigRow[] = [
  {
    label: "Application",
    value: "openclawd",
    note: "Clerk OAuth application name.",
  },
  {
    label: "Scopes",
    value: "email profile offline_access",
    note: "Keep scopes narrow and visible on the consent screen.",
  },
  {
    label: "Redirect URI",
    value: "https://buddies.solanaclawd.com/auth/callback",
    note: "OAuth redirect URI must match exactly.",
  },
  {
    label: "Client ID",
    value: "blBaewfJdzdQKptU",
    note: "Public OAuth client identifier.",
  },
  {
    label: "Client Secret",
    value: "server env only",
    note: "Do not publish or bundle in browser code.",
    secret: true,
  },
  {
    label: "Discovery URL",
    value: "https://clerk.solanaclawd.com/.well-known/openid-configuration",
  },
  {
    label: "Authorize URL",
    value: "https://clerk.solanaclawd.com/oauth/authorize",
  },
  {
    label: "Token URL",
    value: "https://clerk.solanaclawd.com/oauth/token",
  },
  {
    label: "User Info URL",
    value: "https://clerk.solanaclawd.com/oauth/userinfo",
  },
];

const GUIDE_STEPS: GuideStep[] = [
  {
    title: "Create or select a Clerk application",
    body: "Start with the Clerk app that owns the hosted Account Portal, OAuth application, and production callback policy.",
    icon: ShieldCheck,
    checks: [
      "Clerk application exists.",
      "Account Portal is enabled.",
      "Development and production domains are configured.",
    ],
  },
  {
    title: "Enable Solana as a Web3 provider",
    body: "In Clerk Dashboard, open Web3 and enable Solana. Users authenticate with their base58 Solana wallet address instead of an Ethereum wallet-specific strategy.",
    icon: Wallet,
    checks: [
      "Web3 page shows Solana enabled.",
      "Sign-in page displays Solana as an option.",
      "Wallet provider choice appears during authentication.",
    ],
  },
  {
    title: "Use Authorization Code with PKCE",
    body: "Keep the OAuth app usable by public clients. PKCE lets browser, native, and mobile clients authenticate without storing a client secret.",
    icon: KeyRound,
    checks: [
      "Public client flow is enabled.",
      "Consent screen is enabled.",
      "Scopes remain email, profile, and offline_access.",
    ],
  },
  {
    title: "Test with the Account Portal",
    body: "Visit the Clerk Account Portal sign-in URL before wiring custom UI. This is the fastest smoke test for Solana login.",
    icon: Fingerprint,
    checks: [
      "Development URL resembles https://your-domain.accounts.dev/sign-in.",
      "Production URL resembles https://accounts.your-domain.com/sign-in.",
      "Successful sign-in redirects to the configured callback.",
    ],
  },
  {
    title: "Collect profile information only when needed",
    body: "A Solana wallet address is enough for private Web3 identity. Ask for email, phone, or username only when a product flow needs a human-readable identifier.",
    icon: CheckCircle2,
    checks: [
      "Required sign-up attributes are intentional.",
      "Optional fields remain optional.",
      "Onboarding copy explains why fields are requested.",
    ],
  },
  {
    title: "Connect Solana to an existing account",
    body: "Users can attach a Solana wallet from the Account Portal user profile, so email-first users do not need to create a duplicate wallet-first account.",
    icon: Link2,
    checks: [
      "User profile exposes Web3 wallet connection.",
      "Existing account keeps the same Clerk user id.",
      "App checks linked wallet addresses before creating a duplicate user.",
    ],
  },
];

const TEST_CHECKS = [
  "Open Clerk Dashboard, then Account Portal.",
  "Select Visit next to the Sign-in URL.",
  "Confirm Solana appears as a sign-in option.",
  "Sign in with a Solana wallet and approve the signature.",
  "Verify the redirect lands on /auth/callback.",
  "Confirm the app resolves Clerk user id plus Solana wallet address.",
  "Link a Solana wallet from an existing account profile.",
  "Verify the OAuth client secret is absent from client bundles.",
];

function buildMarkdown() {
  const configRows = CLERK_CONFIG.map((row) => {
    const value = row.secret ? "[server env only]" : row.value;
    return `| ${row.label} | ${value} | ${row.note ?? ""} |`;
  }).join("\n");

  const steps = GUIDE_STEPS.map((step, index) => {
    const checks = step.checks.map((check) => `  - [ ] ${check}`).join("\n");
    return `### ${index + 1}. ${step.title}\n\n${step.body}\n\n${checks}`;
  }).join("\n\n");

  const tests = TEST_CHECKS.map((check) => `- [ ] ${check}`).join("\n");

  return `# Guide: Clerk Solana Authentication for Blockchain Buddies

## Goal

Enable users to sign in and sign up with any Solana-enabled wallet through Clerk, then connect that wallet identity to Blockchain Buddies account, profile, and pet ownership flows.

## Authentication strategy

- Use Clerk as the identity provider.
- Enable Solana under Clerk Web3 providers.
- Prefer Authorization Code with PKCE for public clients.
- Keep client secrets server-side only.
- Use the Clerk Account Portal for the first smoke test.

## OAuth configuration

| Setting | Value | Notes |
|---|---|---|
${configRows}

## Implementation steps

${steps}

## Test checklist

${tests}

## Product notes

- Wallet address is the primary Web3 identifier.
- Additional email, phone, or username fields should be collected only when the flow needs them.
- Existing users should connect Solana from the account profile instead of creating another account.
`;
}

export default function GuidesPage() {
  const markdown = buildMarkdown();

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-5 md:px-8">
        <SiteHeader />
      </section>

      <section className="petdex-cloud relative overflow-hidden border-y border-border-base">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-14 md:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
          <div>
            <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
              Guides · Authentication flows · Web3 · Solana
            </p>
            <h1 className="mt-3 max-w-4xl text-balance text-[42px] leading-[1] font-semibold tracking-tight md:text-[68px]">
              Clerk Solana authentication for Blockchain Buddies
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-1 md:text-lg">
              Enable Solana as a Web3 provider, test Account Portal login,
              collect optional profile data, and connect Solana wallets to
              existing accounts without exposing OAuth secrets to the browser.
            </p>
            <div className="mt-6">
              <GuidesActions markdown={markdown} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-border-base bg-surface/85 p-5 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold tracking-tight">
              Guide index
            </h2>
            <div className="mt-4 space-y-2 text-sm">
              <IndexLink href="#enable-solana">
                Enable Solana provider
              </IndexLink>
              <IndexLink href="#configuration">OAuth configuration</IndexLink>
              <IndexLink href="#steps">Implementation steps</IndexLink>
              <IndexLink href="#testing">Test authentication</IndexLink>
              <IndexLink href="#security">Security notes</IndexLink>
            </div>
          </div>
        </div>
      </section>

      <section
        id="enable-solana"
        className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-12 md:px-8 lg:grid-cols-4"
      >
        {[
          ["Solana Web3", "Primary wallet identity"],
          ["OAuth + PKCE", "Public client flow"],
          ["Account Portal", "Fastest smoke test"],
          ["Profile linking", "Bridge Web2 to Web3"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-3xl border border-border-base bg-surface p-5"
          >
            <p className="font-mono text-xs tracking-[0.18em] text-brand uppercase">
              {label}
            </p>
            <p className="mt-2 text-lg font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section
        id="configuration"
        className="mx-auto grid w-full max-w-7xl gap-8 px-5 pb-12 md:px-8 lg:grid-cols-[260px_1fr]"
      >
        <div>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Application configuration
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-2">
            Enter these values in the identity provider or server environment.
            The client secret is intentionally redacted.
          </p>
        </div>

        <div className="grid gap-2">
          {CLERK_CONFIG.map((row) => (
            <div
              key={row.label}
              className="grid gap-2 rounded-2xl border border-border-base bg-surface p-4 md:grid-cols-[180px_1fr]"
            >
              <div className="font-mono text-xs tracking-[0.18em] text-muted-3 uppercase">
                {row.label}
              </div>
              <div>
                <code className="break-all text-sm">
                  {row.secret ? "server env only" : row.value}
                </code>
                {row.note ? (
                  <p className="mt-1 text-xs text-muted-2">{row.note}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="steps"
        className="mx-auto grid w-full max-w-7xl gap-4 px-5 pb-12 md:grid-cols-2 md:px-8 xl:grid-cols-3"
      >
        {GUIDE_STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <article
              key={step.title}
              className="rounded-[2rem] border border-border-base bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-11 place-items-center rounded-2xl bg-brand-tint text-brand dark:bg-brand-tint-dark">
                  <Icon className="size-5" />
                </div>
                <span className="font-mono text-xs text-muted-3">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-2">{step.body}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-2">
                {step.checks.map((check) => (
                  <li key={check} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" />
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      <section
        id="testing"
        className="mx-auto grid w-full max-w-7xl gap-8 px-5 pb-12 md:px-8 lg:grid-cols-[1fr_320px]"
      >
        <div className="rounded-[2rem] border border-border-base bg-surface p-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Test authentication
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-2">
            Test the Clerk Account Portal before custom UI. This validates the
            Solana provider, consent screen, callback, and linked wallet data.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {TEST_CHECKS.map((check) => (
              <div
                key={check}
                className="flex gap-2 rounded-2xl border border-border-base bg-background/50 p-3 text-sm"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" />
                <span>{check}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          id="security"
          className="rounded-[2rem] border border-border-base bg-surface p-6"
        >
          <h2 className="text-xl font-semibold tracking-tight">
            Security notes
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-muted-2">
            <p>
              The OAuth client secret belongs in server environment variables
              only. Do not place it in public env vars or frontend code.
            </p>
            <p>
              Keep the consent screen enabled so users can review email,
              profile, and offline access before authorizing the app.
            </p>
            <p>
              Use the base58 Solana address as the Web3 identifier, then collect
              email or username only when a flow needs it.
            </p>
          </div>
          <Link
            href="/docs#authenticate"
            className="mt-5 inline-flex h-10 items-center rounded-full border border-border-base bg-background px-4 text-sm font-medium transition hover:border-border-strong"
          >
            Read CLI auth docs
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function IndexLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="block rounded-2xl px-3 py-2 text-muted-2 transition hover:bg-background hover:text-foreground"
    >
      {children}
    </a>
  );
}
