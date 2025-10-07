import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/app/components/layout/Container";
import { renderJsonDoc, renderMarkdownDoc, type RenderedDoc } from "../lib/docRenderer";
import { Card } from "@/app/components/ui/Card";

type ResolvedDoc = { file: string; type: "md" | "json" };

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const resolved = safeJoinDocs(slug || []);
  if (!resolved) notFound();

  const content = fs.readFileSync(resolved.file, "utf8");
  const rendered: RenderedDoc =
    resolved.type === "md" ? renderMarkdownDoc(content) : renderJsonDoc(content, slug || []);
  const hasToc = rendered.toc.length > 1;

  const renderTocItems = (prefix: string) =>
    rendered.toc.map((entry) => {
      const indent = tocIndent(entry.level);
      return (
        <li key={`${prefix}-${entry.id}`}>
          <a
            href={`#${entry.id}`}
            className={`block rounded px-2 py-1 transition-colors hover:bg-foreground/10 ${indent}`}
          >
            {entry.title}
          </a>
        </li>
      );
    });

  return (
    <div className="min-h-screen bg-background pb-24">
      <Container className="pt-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
          <article className="flex-1 space-y-6">
            <Link href="/docs" className="inline-flex items-center gap-1 text-sm text-secondary-text hover:text-primary">
              <span aria-hidden>←</span>
              Back to docs
            </Link>
            {hasToc ? (
              <nav className="lg:hidden" aria-label="Page sections">
                <Card className="space-y-3 text-sm" role="region">
                  <details className="docs-toc" open>
                    <summary className="flex cursor-pointer items-center justify-between gap-3">
                      <span className="font-semibold text-foreground">On this page</span>
                      <svg aria-hidden className="docs-toc__icon h-4 w-4 text-secondary-text transition-transform duration-200" viewBox="0 0 20 20">
                        <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
                      </svg>
                    </summary>
                    <div className="mt-2 border-t border-foreground/10 pt-3">
                      <ul className="space-y-1">{renderTocItems("mobile")}</ul>
                    </div>
                  </details>
                </Card>
              </nav>
            ) : null}
            <Card className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: rendered.html }} />
            </Card>
          </article>
          {hasToc ? (
            <aside className="mt-6 hidden w-64 flex-shrink-0 lg:block" aria-label="Page sections">
              <Card className="sticky top-[calc(var(--nav-height,56px)+24px)] space-y-3 text-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-secondary-text">On this page</div>
                <ul className="space-y-1">{renderTocItems("desktop")}</ul>
              </Card>
            </aside>
          ) : null}
        </div>
      </Container>
    </div>
  );
}

function docsRoot() {
  return path.join(process.cwd(), "docs");
}

function safeJoinDocs(slug: string[]): ResolvedDoc | null {
  const rel = slug.length ? slug.join("/") : "README";
  const candidates: Array<{ p: string; t: "md" | "json" }> = [
    { p: path.join(docsRoot(), rel + ".md"), t: "md" },
    { p: path.join(docsRoot(), rel + ".json"), t: "json" },
    { p: path.join(docsRoot(), "reference", rel + ".md"), t: "md" },
    { p: path.join(docsRoot(), "reference", rel + ".json"), t: "json" },
    { p: path.join(docsRoot(), "features", rel + ".md"), t: "md" },
    { p: path.join(docsRoot(), "features", rel + ".json"), t: "json" },
    { p: path.join(docsRoot(), "guides", rel + ".md"), t: "md" },
    { p: path.join(docsRoot(), "guides", rel + ".json"), t: "json" },
    { p: path.join(docsRoot(), "operations", rel + ".md"), t: "md" },
    { p: path.join(docsRoot(), "operations", rel + ".json"), t: "json" },
  ];

  const root = docsRoot();
  for (const { p: abs, t } of candidates) {
    const normalized = path.normalize(abs);
    if (!normalized.startsWith(root)) continue;
    try {
      const stat = fs.statSync(normalized);
      if (stat.isFile()) return { file: normalized, type: t };
    } catch {
      // ignore
    }
  }
  return null;
}

function tocIndent(level: number) {
  if (level <= 2) return "";
  if (level === 3) return "pl-3";
  if (level === 4) return "pl-5";
  return "pl-7";
}
