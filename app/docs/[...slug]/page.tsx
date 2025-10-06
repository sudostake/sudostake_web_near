import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { Container } from "@/app/components/layout/Container";

function docsRoot() {
  return path.join(process.cwd(), "docs");
}

type ResolvedDoc = { file: string; type: "md" | "json" };

function safeJoinDocs(slug: string[]): ResolvedDoc | null {
  // Allow only .md files within the docs directory; default to README.md for empty slug
  const rel = slug.length ? slug.join("/") : "README";
  const candidates: Array<{ p: string; t: "md" | "json" }> = [
    { p: path.join(docsRoot(), rel + ".md"), t: "md" },
    { p: path.join(docsRoot(), rel + ".json"), t: "json" },
    // Fallbacks for legacy short links (e.g., /docs/token-registration)
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
    } catch {}
  }
  return null;
}

function toHtml(md: string): string {
  // Minimal markdown rendering: headings, code fences, inline code, lists, paragraphs.
  // This is intentionally simple to avoid adding deps.
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // code fences ```
  html = html.replace(/```([\s\S]*?)```/g, (_m, code) => `<pre class="rounded bg-foreground/5 p-3 overflow-x-auto"><code>${code}</code></pre>`);
  // headings
  html = html.replace(/^######\s+(.*)$/gm, '<h6 class="text-sm font-semibold mt-6 mb-2">$1</h6>');
  html = html.replace(/^#####\s+(.*)$/gm, '<h5 class="text-base font-semibold mt-6 mb-2">$1</h5>');
  html = html.replace(/^####\s+(.*)$/gm, '<h4 class="text-lg font-semibold mt-6 mb-2">$1</h4>');
  html = html.replace(/^###\s+(.*)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-2">$1</h3>');
  html = html.replace(/^##\s+(.*)$/gm, '<h2 class="text-2xl font-semibold mt-6 mb-2">$1</h2>');
  html = html.replace(/^#\s+(.*)$/gm, '<h1 class="text-3xl font-semibold mt-6 mb-2">$1</h1>');
  // bold and italics (basic)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  // inline code
  html = html.replace(/`([^`]+)`/g, '<code class="px-1 rounded bg-foreground/10">$1</code>');
  // markdown links [text](url)
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" class="underline" target="_blank" rel="noreferrer noopener">$1</a>');
  // unordered lists
  html = html.replace(/^(?:-\s+.*(?:\n|$))+?/gm, (block) => {
    const items = block
      .trim()
      .split(/\n/)
      .map((l) => l.replace(/^[\-\*][\s]+/, "").trim())
      .map((li) => `<li class="ml-5 list-disc">${li}</li>`) 
      .join("");
    return `<ul class="my-3">${items}</ul>`;
  });
  // tables (GFM-like): header |---| separator, then rows
  html = html.replace(/(^\|.*\|\s*\n\|[ \-:\|]+\|\s*\n(?:\|.*\|\s*\n?)+)/gm, (block) => {
    const lines = block.trim().split(/\n/);
    if (lines.length < 2) return block;
    const header = lines[0];
    const rows = lines.slice(2);
    const parseRow = (line: string) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split(/\|/).map((c) => c.trim());
    const ths = parseRow(header).map((h) => `<th class="px-2 py-1 border border-foreground/20 bg-surface text-left">${escapeHtml(h)}</th>`).join("");
    const trs = rows
      .map((r) => {
        const tds = parseRow(r).map((c) => `<td class="px-2 py-1 border border-foreground/20">${escapeHtml(c)}</td>`).join("");
        return `<tr>${tds}</tr>`;
      })
      .join("");
    return `<table class="table-auto w-full text-sm border-collapse my-3 border border-foreground/20"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
  });
  // autolink plain URLs (best-effort)
  html = linkifyHtml(html);
  // paragraphs (simple: wrap non-empty lines that are not already tags)
  html = html
    .split(/\n\n+/)
    .map((b) => (b.match(/^\s*</) ? b : `<p class="my-3 leading-7">${b.replace(/\n/g, " ")}</p>`))
    .join("");
  return html;
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const resolved = safeJoinDocs(slug || []);
  if (!resolved) notFound();
  const content = fs.readFileSync(resolved.file, "utf8");
  const html =
    resolved.type === "md"
      ? toHtml(content)
      : renderJsonDoc(content, slug);
  return (
    <div className="py-8">
      <Container>
        <Breadcrumbs slug={slug} />
        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      </Container>
    </div>
  );
}

function titleCase(s: string) {
  return s
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w|\s\w/g, (m) => m.toUpperCase());
}

function renderJsonDoc(raw: string, slug: string[]): string {
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    return `<h1 class="text-2xl font-semibold mb-3">Document</h1><p class="my-3">This document is not valid JSON.</p>`;
  }

  const guessTitle = () => data.title || data.name || titleCase(slug[slug.length - 1] || "Document");
  const title = String(guessTitle());
  const description = typeof data.description === "string" ? data.description : undefined;

  // Build high-level sections without exposing internal structure.
  const sections: Array<{ heading: string; body: string[] }> = [];

  // Overview
  const overview: string[] = [];
  if (description) overview.push(description);
  if (typeof data.summary === "string") overview.push(data.summary);
  if (Array.isArray(data.tags) && data.tags.length) overview.push(`Tags: ${data.tags.join(", ")}`);
  if (overview.length) sections.push({ heading: "Overview", body: overview });

  // Features / What it does
  const features: string[] = [];
  const featSrc = data.features || data.capabilities || data.highlights;
  if (Array.isArray(featSrc)) {
    for (const f of featSrc) {
      if (typeof f === "string") features.push(f);
      else if (f && typeof f === "object" && typeof f.title === "string") features.push(f.title);
    }
  }
  if (features.length) sections.push({ heading: "What it does", body: features });

  // Endpoints / Actions (keep high-level)
  const actions: string[] = [];
  const endpoints = data.endpoints || data.routes || data.actions;
  if (Array.isArray(endpoints)) {
    for (const e of endpoints) {
      if (typeof e === "string") actions.push(e);
      else if (e && typeof e === "object") {
        const method = e.method || e.type || "";
        const name = e.name || e.path || e.id || "endpoint";
        const desc = e.description || e.summary || "";
        const line = [method, name, desc].filter(Boolean).join(" – ");
        actions.push(line);
      }
    }
  }
  if (actions.length) sections.push({ heading: "Endpoints", body: actions });

  // Usage / Notes
  const notes: string[] = [];
  if (typeof data.usage === "string") notes.push(data.usage);
  if (Array.isArray(data.notes)) notes.push(...data.notes.filter((n: any) => typeof n === "string"));
  if (notes.length) sections.push({ heading: "Notes", body: notes });

  // Fallback: if no sections, show a short message
  if (sections.length === 0) {
    sections.push({ heading: "Overview", body: ["This document provides a high-level description."] });
  }

  const bodyHtml = sections
    .map((s) => {
      const lis = s.body.map((b) => `<li class="ml-5 list-disc">${formatText(String(b))}</li>`).join("");
      return `<h2 class="text-xl font-semibold mt-6 mb-2">${escapeHtml(s.heading)}</h2><ul class="my-3">${lis}</ul>`;
    })
    .join("");

  return `<h1 class="text-2xl font-semibold mb-3">${escapeHtml(title)}</h1>${description ? `<p class="my-3 leading-7">${formatText(description)}</p>` : ""}${bodyHtml}`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function linkifyHtml(s: string) {
  return s.replace(/(https?:\/\/[^\s<]+[^\s<\.])/g, '<a href="$1" class="underline" target="_blank" rel="noreferrer noopener">$1</a>');
}

function formatText(s: string) {
  return linkifyHtml(escapeHtml(s));
}

function Breadcrumbs({ slug }: { slug: string[] }) {
  const parts = Array.isArray(slug) ? slug : [];
  const crumbs: Array<{ name: string; href: string }> = [];
  crumbs.push({ name: "Docs", href: "/docs" });
  let acc = "";
  for (let i = 0; i < parts.length; i++) {
    acc += "/" + parts[i];
    const nameMap: Record<string, string> = {
      features: "Features",
      reference: "Reference",
      guides: "Guides",
      operations: "Operations",
    };
    const name = nameMap[parts[i]] || titleCase(parts[i]);
    crumbs.push({ name, href: "/docs" + acc });
  }
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-secondary-text mb-4">
      {crumbs.map((c, i) => (
        <span key={c.href}>
          {i > 0 ? <span className="mx-1">/</span> : null}
          <a href={c.href} className="hover:underline">{c.name}</a>
        </span>
      ))}
    </nav>
  );
}
