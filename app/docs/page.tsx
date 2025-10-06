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
    buildSection("architecture", "Architecture", [linkIfFile("architecture.md", "Architecture overview")!].filter(Boolean) as DocLink[]),
    buildSection(
      "features",
      "Features",
      [
        linkIfFile("features/authentication.md", "Authentication"),
        linkIfFile("features/authentication-signin-flow.md", "Sign-in flow"),
        linkIfFile("features/discover.md", "Discover: pending requests"),
        linkIfFile("features/lender-positions.md", "Lender positions"),
        linkIfFile("features/vaults.md", "Vaults: lifecycle and ops"),
        linkIfFile("features/tokens.md", "Tokens and balances"),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "guides",
      "Guides",
      [
        linkIfFile("guides/opening-liquidity-request.md", "Open a liquidity request"),
        linkIfFile("guides/repay-loan.md", "Repay a loan"),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "reference",
      "Reference",
      [
        linkIfFile("reference/api.md", "API reference"),
        linkIfFile("reference/data-model.md", "Data model"),
        linkIfFile("reference/networks.md", "Networks and RPC"),
        linkIfFile("reference/token-registration.md", "Token registration (NEP-141)"),
        linkIfFile("reference/roles.md", "Viewer roles"),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection("operations", "Operations", [linkIfFile("operations/indexing.md", "Indexing and consistency")!].filter(Boolean) as DocLink[]),
  ].filter(Boolean) as Section[];

  return (
    <div className="py-8">
      <Container>
        <h1 className="text-2xl font-semibold mb-4">Documentation</h1>
        <p className="text-secondary-text mb-4">Architecture, features, guides, and reference for the SudoStake web app.</p>
        <DocsIndexClient sections={sections} />
      </Container>
    </div>
  );
}
