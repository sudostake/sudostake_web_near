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
  },
  {
    href: "/docs/guides/create-vault",
    title: "Borrower quickstart",
  },
  {
    href: "/docs/guides/fund-liquidity-request",
    title: "Lender quickstart",
  },
] satisfies Array<{ href: string; title: string }>;

export default function DocsIndex() {
  const sections = [
    buildSection(
      "learn",
      "Start",
      [
        linkIfFile("README.md", "Docs home"),
        linkIfFile("playbook.md", "Playbook"),
        linkIfFile("architecture.md", "Architecture overview"),
        linkIfFile("reference/networks.md", "Networks"),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "get-ready",
      "Connection and setup",
      [
        linkIfFile("features/authentication.md", "Connect your wallet"),
        linkIfFile("features/authentication-signin-flow.md", "Sign-in flow"),
        linkIfFile("features/tokens.md", "Tokens and balances"),
        linkIfFile("reference/token-registration.md", "Token registration"),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "owners",
      "Borrower path",
      [
        linkIfFile("guides/create-vault.md", "Create a vault"),
        linkIfFile("guides/opening-liquidity-request.md", "Open a request"),
        linkIfFile("guides/repay-loan.md", "Repay a loan"),
        linkIfFile("features/vaults.md", "Vault actions"),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "lenders",
      "For lenders",
      [
        linkIfFile("guides/fund-liquidity-request.md", "Fund a request"),
        linkIfFile("features/discover.md", "Discover marketplace"),
        linkIfFile("features/lender-positions.md", "Lender positions"),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "reference",
      "Reference and operations",
      [
        linkIfFile("reference/roles.md", "Viewer roles"),
        linkIfFile("reference/data-model.md", "Data model"),
        linkIfFile("reference/api.md", "API routes"),
        linkIfFile("operations/indexing.md", "Indexing and consistency"),
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

function DocQuickLink({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-5 py-5 transition-all hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:px-6"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-base font-semibold text-foreground">{title}</span>
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
