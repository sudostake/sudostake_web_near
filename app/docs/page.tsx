import fs from "fs";
import path from "path";
import { Container } from "@/app/components/layout/Container";
import DocsIndexClient from "./DocsIndexClient";

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

export default function DocsIndex() {
  const sections = [
    buildSection(
      "start",
      "Start here",
      [
        linkIfFile("playbook.md", "SudoStake playbook", "End-to-end tour for vault owners and lenders"),
        linkIfFile("README.md", "Docs home", "Map of every section and how to use it"),
        linkIfFile("architecture.md", "Architecture overview", "How wallets, Firestore, and NEAR connect"),
        linkIfFile("reference/networks.md", "Networks & RPC", "Factory IDs, RPC hosts, and explorer links"),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "prepare",
      "Get ready",
      [
        linkIfFile("features/authentication.md", "Connect your wallet"),
        linkIfFile("features/authentication-signin-flow.md", "Wallet sign-in flow"),
        linkIfFile("reference/token-registration.md", "Token registration", "Why wallets and vaults need storage deposits"),
        linkIfFile("features/tokens.md", "Tokens and balances"),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "owners",
      "Vault owners",
      [
        linkIfFile("guides/create-vault.md", "Mint a vault"),
        linkIfFile("features/vaults.md", "Vault actions overview"),
        linkIfFile("guides/opening-liquidity-request.md", "Open a liquidity request"),
        linkIfFile("guides/repay-loan.md", "Repay a loan"),
        linkIfFile("operations/indexing.md", "Keep data fresh", "Indexing playbook after transactions"),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "lenders",
      "Lenders",
      [
        linkIfFile("guides/fund-liquidity-request.md", "Fund a liquidity request"),
        linkIfFile("features/discover.md", "Discover open requests"),
        linkIfFile("features/lender-positions.md", "Track lender positions"),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "reference",
      "Reference",
      [
        linkIfFile("reference/data-model.md", "Data model"),
        linkIfFile("reference/api.md", "API reference"),
        linkIfFile("reference/roles.md", "Viewer roles"),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "meta",
      "Meta",
      [
        linkIfFile("meta/style-guide.md", "Docs voice & tone guide", "Keep `/docs` friendly for everyday users"),
        linkIfFile("meta/rewrite-backlog.md", "Rewrite backlog", "Prioritized plan for plain-language updates"),
        linkIfFile("meta/rendering-upgrade.md", "Rendering upgrade plan", "Switch to MDX + remark for rich formatting"),
      ].filter(Boolean) as DocLink[]
    ),
  ].filter(Boolean) as Section[];

  return (
    <div className="py-8">
      <Container>
        <h1 className="text-2xl font-semibold mb-4">Documentation</h1>
        <p className="text-secondary-text mb-4">
          Start with the overview, then follow the path for vault owners or lenders. Each section links the next step so newcomers and power users stay in sync.
        </p>
        <DocsIndexClient sections={sections} />
      </Container>
    </div>
  );
}
