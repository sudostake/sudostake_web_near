import fs from "fs";
import path from "path";
import Link from "next/link";
import { Container } from "@/app/components/layout/Container";
import DocsIndexClient from "./DocsIndexClient";
import { Card } from "@/app/components/ui/Card";

type DocLink = { title: string; href: string; description?: string };
type Section = { id: string; title: string; items: DocLink[] };

function exists(p: string) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function buildSection(id: string, title: string, items: DocLink[]): Section | null {
  if (items.length === 0) return null;
  return { id, title, items };
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
    href: "/docs/playbook",
    title: "Start with the playbook",
    description: "See the full journey for vault owners and lenders in under five minutes.",
  },
  {
    href: "/docs/guides/create-vault",
    title: "Create your vault",
    description: "Mint and prepare your vault so you’re ready to request liquidity.",
  },
  {
    href: "/docs/guides/fund-liquidity-request",
    title: "Fund a request",
    description: "Learn how to review offers, lend safely, and track repayments.",
  },
] satisfies Array<{ href: string; title: string; description: string }>;

export default function DocsIndex() {
  const sections = [
    buildSection(
      "learn",
      "Learn the basics",
      [
        linkIfFile("playbook.md", "See the full journey"),
        linkIfFile("README.md", "What’s in these docs"),
        linkIfFile("architecture.md", "How SudoStake stays in sync"),
        linkIfFile("reference/networks.md", "Choose the right network"),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "get-ready",
      "Get set up",
      [
        linkIfFile("features/authentication.md", "Connect your wallet"),
        linkIfFile("features/authentication-signin-flow.md", "Sign-in step by step"),
        linkIfFile("reference/token-registration.md", "Register with a token"),
        linkIfFile("features/tokens.md", "Check balances and deposits"),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "owners",
      "For vault owners",
      [
        linkIfFile("guides/create-vault.md", "Create your vault"),
        linkIfFile("features/vaults.md", "Manage vault actions"),
        linkIfFile("guides/opening-liquidity-request.md", "Request liquidity"),
        linkIfFile("guides/repay-loan.md", "Repay a loan"),
        linkIfFile("operations/indexing.md", "Keep information fresh"),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "lenders",
      "For lenders",
      [
        linkIfFile("guides/fund-liquidity-request.md", "Fund a request"),
        linkIfFile("features/discover.md", "Browse open requests"),
        linkIfFile("features/lender-positions.md", "Track funded vaults"),
        linkIfFile("guides/repay-loan.md", "See what repayment looks like"),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "reference",
      "Helpful references",
      [
        linkIfFile("reference/data-model.md", "What the app stores"),
        linkIfFile("reference/roles.md", "Who can do what"),
        linkIfFile("reference/networks.md", "Network quick facts"),
      ].filter(Boolean) as DocLink[]
    ),
  ].filter(Boolean) as Section[];

  return (
    <div className="min-h-screen bg-background pb-24">
      <Container className="pt-24 space-y-8">
        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Documentation</p>
          <h1 className="text-[clamp(2rem,4vw,2.6rem)] font-semibold">Docs that get you moving</h1>
          <p className="max-w-3xl text-sm text-secondary-text">
            Choose the path that matches what you want to do—whether you’re preparing a vault or funding a request, each guide walks you through the next step.
          </p>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_LINKS.map((link) => (
            <DocQuickLink key={link.href} {...link} />
          ))}
        </div>
        <Card className="space-y-6">
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
      className="group block rounded-2xl border border-foreground/10 bg-surface px-5 py-4 transition-all hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="font-semibold text-foreground">{title}</span>
        <span
          aria-hidden="true"
          className="text-lg text-secondary-text transition-transform duration-150 group-hover:translate-x-1 group-focus-visible:translate-x-1"
        >
          →
        </span>
      </span>
      <span className="mt-2 block text-sm text-secondary-text leading-6">{description}</span>
    </Link>
  );
}
