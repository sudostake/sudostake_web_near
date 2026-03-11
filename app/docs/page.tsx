import fs from "fs";
import path from "path";
import Link from "next/link";
import { Container } from "@/app/components/layout/Container";
import DocsIndexClient from "./DocsIndexClient";
import { Card } from "@/app/components/ui/Card";

type DocLink = { title: string; href: string; description?: string };
type Section = { id: string; title: string; description?: string; items: DocLink[] };

function exists(p: string) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function buildSection(id: string, title: string, description: string, items: DocLink[]): Section | null {
  if (items.length === 0) return null;
  return { id, title, description, items };
}

function docsRoot() {
  return path.join(process.cwd(), "docs");
}

function linkIfFile(rel: string, title: string, description?: string): DocLink | null {
  const filePath = path.join(docsRoot(), rel);
  return exists(filePath) ? { title, href: `/docs/${rel.replace(/\.md$/i, "")}`, description } : null;
}

const FEATURED_LINKS = [
  {
    href: "/docs/tutorial",
    title: "Start guided tutorial",
    description: "Follow the app the same way a new user would, from public routes into borrower or lender actions.",
  },
  {
    href: "/docs/guides/opening-liquidity-request",
    title: "Borrower track",
    description: "Jump straight to the borrower branch once you are ready to create a vault and open a request.",
  },
  {
    href: "/docs/guides/fund-liquidity-request",
    title: "Lender track",
    description: "Jump straight to the lender branch if you only need the funding path.",
  },
] satisfies Array<{ href: string; title: string; description: string }>;

export default function DocsIndex() {
  const sections = [
    buildSection(
      "start",
      "1. Start here",
      "Read one guided walkthrough first. These pages support each step of that tutorial.",
      [
        linkIfFile(
          "tutorial.md",
          "Guided tutorial",
          "One walkthrough from landing page to dashboard, then into the borrower or lender branch."
        ),
        linkIfFile(
          "features/home.md",
          "Landing page",
          "Route `/`. Start here to connect a wallet, open Discover, or inspect live request previews."
        ),
        linkIfFile(
          "features/discover.md",
          "Discover marketplace",
          "Route `/discover`. Browse open requests, use filters, and open a vault page."
        ),
        linkIfFile(
          "features/authentication.md",
          "Connect your wallet",
          "Where wallet prompts appear and what changes after you connect."
        ),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "borrower",
      "2. Borrower branch",
      "Use these when the tutorial reaches the borrower path inside dashboard and a vault page.",
      [
        linkIfFile(
          "features/dashboard.md",
          "Dashboard workspace",
          "Route `/dashboard`. This is where the borrower path begins after wallet connection."
        ),
        linkIfFile(
          "guides/create-vault.md",
          "Create a vault",
          "Open the creation dialog from dashboard and wait for the new vault to index."
        ),
        linkIfFile(
          "features/vaults.md",
          "Vault page",
          "Route `/dashboard/vault/:id`. This is the main screen for deposits, delegation, requests, and repayment."
        ),
        linkIfFile(
          "guides/opening-liquidity-request.md",
          "Open a liquidity request",
          "Use the vault request dialog to move a vault from `idle` to `pending`."
        ),
        linkIfFile(
          "features/tokens.md",
          "Tokens and balances",
          "See where NEAR and USDC balances appear while you prepare collateral and repayment."
        ),
        linkIfFile(
          "guides/repay-loan.md",
          "Repay a loan",
          "Repay an active request from the vault page before liquidation begins."
        ),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "lender",
      "3. Lender branch",
      "Use these when the tutorial reaches the lender path from Discover into a funded vault.",
      [
        linkIfFile(
          "guides/fund-liquidity-request.md",
          "Fund a liquidity request",
          "Open a request from Discover, satisfy registration checks, and accept it in your wallet."
        ),
        linkIfFile(
          "features/lender-positions.md",
          "Lender positions",
          "Return to `/dashboard` -> `Positions` to reopen vaults where you are the accepted lender."
        ),
        linkIfFile(
          "reference/roles.md",
          "Viewer roles",
          "Understand why a vault shows owner tools, lender actions, or read-only content."
        ),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "blockers",
      "4. Setup and recovery",
      "These pages explain the prompts and retry paths users hit during normal flows.",
      [
        linkIfFile(
          "reference/token-registration.md",
          "Token registration",
          "Why the app sometimes asks a wallet or vault to run `storage_deposit` before USDC moves."
        ),
        linkIfFile(
          "operations/indexing.md",
          "Indexing and consistency",
          "What the retry modal means after a transaction and how indexed views catch up."
        ),
        linkIfFile(
          "features/authentication-signin-flow.md",
          "Sign-in flow",
          "A deeper view of the wallet connection sequence if onboarding gets stuck."
        ),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "reference",
      "5. Deep reference",
      "Use these when you need product-wide context, network details, or implementation internals.",
      [
        linkIfFile("playbook.md", "Playbook", "Product flow in one view for borrowers and lenders."),
        linkIfFile("architecture.md", "Architecture overview", "How NEAR, Firestore, and the app routes fit together."),
        linkIfFile("reference/networks.md", "Networks", "Active network settings and related defaults."),
        linkIfFile("reference/data-model.md", "Data model", "How indexed vault documents are shaped."),
        linkIfFile("reference/api.md", "API routes", "App routes that back reads, indexing, and RPC proxying."),
      ].filter(Boolean) as DocLink[]
    ),
  ].filter(Boolean) as Section[];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pb-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-30vh] h-[58vh] bg-[radial-gradient(ellipse_at_top,rgba(15,118,110,0.2),transparent_65%)]"
      />
      <Container className="relative pt-16 sm:pt-20 space-y-8">
        <Card className="surface-card space-y-4 rounded-4xl px-6 py-8 shadow-card-subtle sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Documentation</p>
          <h1 className="text-[clamp(2rem,4vw,2.6rem)] font-semibold">SudoStake docs</h1>
          <p className="max-w-3xl text-sm text-secondary-text">
            Start with one guided walkthrough, then open the supporting pages only when you need extra detail
            for the step in front of you.
          </p>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_LINKS.map((link) => (
            <DocQuickLink key={link.href} {...link} />
          ))}
        </div>
        <Card className="surface-card space-y-6 rounded-[28px] px-6 py-6 shadow-card-subtle">
          <DocsIndexClient sections={sections} />
        </Card>
      </Container>
    </div>
  );
}

function DocQuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-5 py-5 transition-all hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:px-6"
    >
      <span className="flex items-start justify-between gap-3">
        <span className="space-y-1">
          <span className="block text-base font-semibold text-foreground">{title}</span>
          <span className="block text-sm text-secondary-text">{description}</span>
        </span>
        <span
          aria-hidden="true"
          className="text-lg text-secondary-text transition-transform duration-150 group-hover:translate-x-1 group-focus-visible:translate-x-1"
        >
          →
        </span>
      </span>
    </Link>
  );
}
