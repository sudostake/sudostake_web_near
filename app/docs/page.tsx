import fs from "fs";
import path from "path";
import Link from "next/link";
import { Container } from "@/app/components/layout/Container";

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
        {/* Mobile nav */}
        <nav className="md:hidden mb-4 text-sm flex flex-wrap gap-2">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="rounded border bg-surface px-2.5 py-1 hover:bg-surface/90">
              {s.title}
            </a>
          ))}
        </nav>
        <div className="md:flex md:items-start md:gap-6">
          {/* Sidebar (desktop) */}
          <aside className="hidden md:block md:w-56 lg:w-64 sticky top-[calc(var(--nav-height,56px)+16px)] self-start">
            <nav className="text-sm">
              <ul className="space-y-1">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="block rounded px-2 py-1 hover:bg-foreground/10">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          {/* Main content */}
          <div className="flex-1 space-y-8">
            {sections.map((s) => (
              <section key={s.id} id={s.id}>
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
        </div>
      </Container>
    </div>
  );
}
