import { ShieldCheck, Sparkles, WalletCards } from "lucide-react";

import { buildLocaleAlternates } from "@/lib/locale-routing";

import { BuddyMintForm } from "@/components/buddy-mint-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Birth a Blockchain Buddy | Blockchain Buddies",
  description:
    "Mint a Blockchain Buddy as a registered Metaplex Agent on Solana using OpenClawd and Helius RPC.",
  alternates: buildLocaleAlternates("/birth"),
};

export default function BirthPage() {
  return (
    <main className="petdex-cloud min-h-dvh bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-5 pb-14 md:px-8">
        <SiteHeader />

        <header className="mt-8 grid gap-8 md:grid-cols-[1fr_420px] md:items-end">
          <div>
            <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
              Onchain birth certificate
            </p>
            <h1 className="mt-3 max-w-3xl text-5xl leading-tight font-semibold tracking-tight md:text-7xl">
              Mint a Blockchain Buddy on Solana.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-2">
              Each buddy is created as an MPL Core asset and registered through
              the Metaplex Agent Registry in one atomic transaction. Helius RPC
              powers submission, OpenClawd supplies the agent framework, and the
              returned Core asset address becomes the buddy&apos;s permanent
              onchain identity.
            </p>
          </div>

          <div className="rounded-3xl border border-border-base bg-surface/80 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-foreground">
              Before minting
            </p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-2">
              <li className="flex gap-2">
                <WalletCards className="mt-1 size-4 shrink-0 text-brand" />
                Fund the server mint authority with SOL for Core asset rent and
                transaction fees.
              </li>
              <li className="flex gap-2">
                <ShieldCheck className="mt-1 size-4 shrink-0 text-brand" />
                Set `HELIUS_RPC_URL` and `BUDDIES_MINT_AUTHORITY_SECRET_KEY` in
                the deployment environment.
              </li>
              <li className="flex gap-2">
                <Sparkles className="mt-1 size-4 shrink-0 text-brand" />
                Host metadata JSON publicly before birth; Metaplex stores the
                URI on the Core asset.
              </li>
            </ul>
          </div>
        </header>

        <BuddyMintForm />
      </section>
      <SiteFooter />
    </main>
  );
}
