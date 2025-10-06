import fs from "fs";
import path from "path";
import Link from "next/link";
import { Container } from "@/app/components/layout/Container";

type DocLink = { title: string; href: string; description?: string };

function exists(p: string) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function buildSection(title: string, items: DocLink[]): { title: string; items: DocLink[] } | null {
  if (items.length === 0) return null;
  return { title, items };
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
    buildSection("Architecture", [linkIfFile("architecture.md", "Architecture overview")!].filter(Boolean) as DocLink[]),
    buildSection(
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
      "Guides",
      [
        linkIfFile("guides/opening-liquidity-request.md", "Open a liquidity request"),
        linkIfFile("guides/repay-loan.md", "Repay a loan"),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection(
      "Reference",
      [
        linkIfFile("reference/api.md", "API reference"),
        linkIfFile("reference/data-model.md", "Data model"),
        linkIfFile("reference/networks.md", "Networks and RPC"),
        linkIfFile("reference/token-registration.md", "Token registration (NEP-141)"),
        linkIfFile("reference/roles.md", "Viewer roles"),
      ].filter(Boolean) as DocLink[]
    ),
    buildSection("Operations", [linkIfFile("operations/indexing.md", "Indexing and consistency")!].filter(Boolean) as DocLink[]),
  ].filter(Boolean) as Array<{ title: string; items: DocLink[] }>;

  return (
    <div className="py-8">
      <Container>
        <h1 className="text-2xl font-semibold mb-4">Documentation</h1>
        <p className="text-secondary-text mb-6">Architecture, features, guides, and reference for the SudoStake web app.</p>
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-xl font-medium mb-3">{s.title}</h2>
              <ul className="grid sm:grid-cols-2 gap-2">
                {s.items.map((item) => (
                  <li key={item.href} className="rounded border bg-surface hover:bg-surface/90 transition-colors">
                    <Link href={item.href} className="block px-3 py-2">
                      <div className="font-medium">{item.title}</div>
                      {item.description ? (
                        <div className="text-sm text-secondary-text">{item.description}</div>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
}

