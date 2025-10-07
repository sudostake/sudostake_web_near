import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/app/components/layout/Container";

type TocEntry = { id: string; title: string; level: number };
type ResolvedDoc = { file: string; type: "md" | "json" };
type RenderedDoc = { html: string; toc: TocEntry[] };

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const resolved = safeJoinDocs(slug || []);
  if (!resolved) notFound();

  const content = fs.readFileSync(resolved.file, "utf8");
  const rendered = resolved.type === "md" ? renderMarkdownDoc(content) : renderJsonDoc(content, slug || []);
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
    <div className="py-8">
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12">
          <article className="flex-1 max-w-3xl">
            <Link href="/docs" className="inline-flex items-center gap-1 text-sm text-secondary-text hover:text-foreground">
              <span aria-hidden="true">←</span>
              Back to docs
            </Link>
            {hasToc ? (
              <nav className="mt-6 mb-10 lg:hidden" aria-label="Page sections">
                <details className="docs-toc overflow-hidden rounded-lg border border-foreground/10 bg-surface/70 text-sm" open>
                  <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 font-medium text-foreground transition-colors hover:bg-surface/90">
                    <span>On this page</span>
                    <svg
                      aria-hidden="true"
                      className="docs-toc__icon h-4 w-4 text-secondary-text transition-transform duration-200"
                      focusable="false"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
                    </svg>
                  </summary>
                  <div className="border-t border-foreground/5 px-4 py-3">
                    <ul className="space-y-1">{renderTocItems("mobile")}</ul>
                  </div>
                </details>
              </nav>
            ) : null}
            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: rendered.html }} />
          </article>
          {hasToc ? (
            <aside className="mt-10 hidden w-64 flex-shrink-0 lg:mt-0 lg:block" aria-label="Page sections">
              <nav className="sticky top-[calc(var(--nav-height,56px)+24px)]">
                <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-secondary-text">On this page</div>
                <ul className="space-y-1 text-sm">{renderTocItems("desktop")}</ul>
              </nav>
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

function renderMarkdownDoc(raw: string): RenderedDoc {
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return { html: '<p class="text-sm text-secondary-text">This document is empty.</p>', toc: [] };
  }

  const lines = normalized.split("\n");
  if (lines[0] && !lines[0].trim().startsWith("#")) {
    lines[0] = `# ${lines[0].trim()}`;
  }

  const toc: TocEntry[] = [];
  const slugCounts = new Map<string, number>();
  const parts: string[] = [];

  let paragraphLines: string[] = [];
  let inCodeBlock = false;
  let codeLang = "plaintext";
  let codeLines: string[] = [];
  let currentList: { type: "ul" | "ol"; items: string[]; start?: number } | null = null;

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    const text = paragraphLines.join(" ");
    parts.push(`<p>${formatInline(text)}</p>`);
    paragraphLines = [];
  };

  const flushList = () => {
    if (!currentList) return;
    const items = currentList.items.map((item) => `<li>${formatInline(item)}</li>`).join("");
    if (currentList.type === "ol") {
      const startAttr = currentList.start && currentList.start > 1 ? ` start="${currentList.start}"` : "";
      parts.push(`<ol${startAttr}>${items}</ol>`);
    } else {
      parts.push(`<ul>${items}</ul>`);
    }
    currentList = null;
  };

  const flushCode = () => {
    const code = codeLines.join("\n");
    const safe = escapeHtml(code);
    const languageClass = codeLang ? ` language-${sanitizeCodeLang(codeLang)}` : "";
    parts.push(
      `<pre class="not-prose rounded-xl bg-foreground/10 px-4 py-3 text-sm leading-6 overflow-x-auto"><code class="font-mono${languageClass}">${safe}</code></pre>`
    );
    codeLines = [];
    codeLang = "plaintext";
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i] ?? "";
    const trimmed = rawLine.trim();

    if (inCodeBlock) {
      if (trimmed.startsWith("```")) {
        flushCode();
        inCodeBlock = false;
      } else {
        codeLines.push(rawLine);
      }
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushParagraph();
      flushList();
      inCodeBlock = true;
      codeLang = trimmed.slice(3).trim() || "plaintext";
      codeLines = [];
      continue;
    }

    // Tables (GitHub-style)
    const nextLine = lines[i + 1]?.trim() ?? "";
    const isTableHeader = trimmed.startsWith("|") && trimmed.endsWith("|");
    const isDividerLine = nextLine.startsWith("|") && /^(\|\s*:?-{3,}:?\s*)+\|$/.test(nextLine);
    if (isTableHeader && isDividerLine) {
      flushParagraph();
      flushList();
      const tableLines = [trimmed];
      let j = i + 2;
      while (j < lines.length) {
        const candidate = lines[j]?.trim() ?? "";
        if (!(candidate.startsWith("|") && candidate.endsWith("|"))) break;
        tableLines.push(candidate);
        j++;
      }
      i = j - 1;
      parts.push(renderTable(tableLines));
      continue;
    }

    if (trimmed === "") {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = headingMatch[1].length;
      const headingText = headingMatch[2].trim();
      parts.push(renderHeading(level, headingText, toc, slugCounts));
      continue;
    }

    if (/^[-*_]{3,}$/.test(trimmed)) {
      flushParagraph();
      flushList();
      parts.push('<hr class="my-6 border-foreground/10" />');
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph();
      flushList();
      const quoteLines: string[] = [];
      let j = i;
      while (j < lines.length && (lines[j]?.trim().startsWith(">") ?? false)) {
        quoteLines.push((lines[j] ?? "").replace(/^>\s?/, ""));
        j++;
      }
      i = j - 1;
      parts.push(renderCalloutOrQuote(quoteLines.join("\n")));
      continue;
    }

    const orderedMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [], start: Number(orderedMatch[1]) };
      }
      currentList.items.push(orderedMatch[2]);
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(unorderedMatch[1]);
      continue;
    }

    if (currentList) {
      flushList();
    }
    paragraphLines.push(trimmed);
  }

  if (inCodeBlock) {
    flushCode();
    inCodeBlock = false;
  }

  flushParagraph();
  flushList();

  if (!parts.length) {
    parts.push('<p class="text-sm text-secondary-text">This document is empty.</p>');
  }

  const html = parts.join("\n");
  const tocEntries = toc.filter((entry) => entry.level > 1);
  return { html, toc: tocEntries };
}

function renderJsonDoc(raw: string, slug: string[]): RenderedDoc {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      html: '<h1 class="text-3xl font-semibold tracking-tight mb-6">Document</h1><p>This document is not valid JSON.</p>',
      toc: [],
    };
  }

  const data: Record<string, unknown> = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  const getString = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);
  const getArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
  const isObj = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object";

  const title =
    getString(data.title) || getString(data.name) || titleCase(slug[slug.length - 1] || "Document");
  const description = getString(data.description);

  const sections: Array<{ heading: string; body: string[] }> = [];

  const overview: string[] = [];
  const summary = getString(data.summary);
  if (description) overview.push(description);
  if (summary) overview.push(summary);
  const tags = getArray(data.tags).filter((t): t is string => typeof t === "string");
  if (tags.length) overview.push(`Tags: ${tags.join(", ")}`);
  if (overview.length) sections.push({ heading: "Overview", body: overview });

  const features: string[] = [];
  const featureSource = getArray(data.features ?? data.capabilities ?? data.highlights);
  for (const f of featureSource) {
    if (typeof f === "string") {
      features.push(f);
    } else if (isObj(f)) {
      const heading = getString(f.title);
      const detail = getString(f.description) || getString(f.summary);
      features.push([heading, detail].filter(Boolean).join(" – "));
    }
  }
  if (features.length) sections.push({ heading: "What it does", body: features });

  const actions: string[] = [];
  const endpoints = getArray(data.endpoints ?? data.routes ?? data.actions);
  for (const endpoint of endpoints) {
    if (typeof endpoint === "string") {
      actions.push(endpoint);
    } else if (isObj(endpoint)) {
      const method = getString(endpoint.method) || getString(endpoint.type);
      const path = getString(endpoint.path) || getString(endpoint.name) || getString(endpoint.id);
      const detail = getString(endpoint.description) || getString(endpoint.summary);
      actions.push([method, path, detail].filter(Boolean).join(" – "));
    }
  }
  if (actions.length) sections.push({ heading: "Endpoints", body: actions });

  const notes: string[] = [];
  const usage = getString(data.usage);
  if (usage) notes.push(usage);
  const notesArr = getArray(data.notes).filter((n): n is string => typeof n === "string");
  if (notesArr.length) notes.push(...notesArr);
  if (notes.length) sections.push({ heading: "Notes", body: notes });

  if (!sections.length) {
    sections.push({ heading: "Overview", body: ["This document provides a high-level description."] });
  }

  const toc: TocEntry[] = [];
  const slugCounts = new Map<string, number>();
  const parts: string[] = [];

  parts.push(renderHeading(1, title, toc, slugCounts));
  if (description) {
    parts.push(`<p>${formatInline(description)}</p>`);
  }

  for (const section of sections) {
    parts.push(renderHeading(2, section.heading, toc, slugCounts));
    const items = section.body.map((line) => `<li>${formatInline(line)}</li>`).join("");
    parts.push(`<ul>${items}</ul>`);
  }

  const html = parts.join("\n");
  const tocEntries = toc.filter((entry) => entry.level > 1);
  return { html, toc: tocEntries };
}

function renderHeading(level: number, rawText: string, toc: TocEntry[], slugCounts: Map<string, number>) {
  const plain = stripFormatting(rawText);
  const id = uniqueSlug(plain, slugCounts);
  toc.push({ id, title: plain, level });
  return `<h${level} id="${id}" class="${headingClass(level)}">${formatInline(rawText)}</h${level}>`;
}

function renderTable(lines: string[]): string {
  if (lines.length < 2) return "";
  const headerCells = splitTableRow(lines[0]);
  const alignmentLine = splitTableRow(lines[1]);
  const alignments = alignmentLine.map((cell) => {
    const trimmed = cell.trim();
    const left = trimmed.startsWith(":");
    const right = trimmed.endsWith(":");
    if (left && right) return "center";
    if (right) return "right";
    if (left) return "left";
    return undefined;
  });

  const thead = `<thead><tr>${headerCells
    .map((cell, idx) => `<th${alignments[idx] ? ` style="text-align:${alignments[idx]};"` : ""}>${formatInline(cell)}</th>`)
    .join("")}</tr></thead>`;

  const tbodyRows = lines.slice(2).map((line) => {
    const cells = splitTableRow(line);
    return `<tr>${cells
      .map((cell, idx) => `<td${alignments[idx] ? ` style="text-align:${alignments[idx]};"` : ""}>${formatInline(cell)}</td>`)
      .join("")}</tr>`;
  });

  return `<div class="docs-table__wrapper"><table class="docs-table">${thead}<tbody>${tbodyRows.join("")}</tbody></table></div>`;
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function headingClass(level: number) {
  switch (level) {
    case 1:
      return "text-3xl font-semibold tracking-tight mb-6";
    case 2:
      return "mt-10 text-2xl font-semibold mb-3";
    case 3:
      return "mt-8 text-xl font-semibold mb-2";
    case 4:
      return "mt-6 text-lg font-semibold mb-2";
    case 5:
    case 6:
      return "mt-5 text-base font-semibold mb-1";
    default:
      return "mt-6 text-lg font-semibold mb-2";
  }
}

function renderCalloutOrQuote(raw: string) {
  const block = raw.replace(/\r\n/g, "\n").trim();
  if (!block) return "";

  const lines = block.split("\n");
  const first = lines[0]?.trim() ?? "";
  const calloutMatch = first.match(/^(Heads up|Tip|Note|Warning|Reminder|Info|Success|Alert):\s*(.*)$/i);

  if (calloutMatch) {
    const key = calloutMatch[1].toLowerCase();
    const config = CALLOUT_STYLES[key] ?? DEFAULT_CALLOUT;
    const remainder = [calloutMatch[2], ...lines.slice(1)].join("\n").trim();
    const body = remainder
      ? remainder
          .split(/\n{2,}/)
          .map((part) => `<p class="text-sm leading-6">${formatInline(part)}</p>`)
          .join("")
      : "";
    return `<div class="${config.wrapper}"><div class="${config.titleClass}">${config.label}</div>${
      body ? `<div class="mt-2 space-y-2">${body}</div>` : ""
    }</div>`;
  }

  const paragraphs = block
    .split(/\n{2,}/)
    .map((part) => `<p class="text-sm leading-6">${formatInline(part)}</p>`)
    .join("");
  return `<blockquote class="border-l-2 border-foreground/20 pl-4 italic">${paragraphs}</blockquote>`;
}

const CALLOUT_STYLES: Record<string, { label: string; wrapper: string; titleClass: string }> = {
  "heads up": {
    label: "Heads up",
    wrapper: "rounded-lg border-l-4 border-amber-400 bg-amber-500/10 px-4 py-3",
    titleClass: "text-sm font-semibold text-amber-500",
  },
  warning: {
    label: "Warning",
    wrapper: "rounded-lg border-l-4 border-amber-500 bg-amber-500/10 px-4 py-3",
    titleClass: "text-sm font-semibold text-amber-600",
  },
  alert: {
    label: "Alert",
    wrapper: "rounded-lg border-l-4 border-red-500 bg-red-500/10 px-4 py-3",
    titleClass: "text-sm font-semibold text-red-500",
  },
  tip: {
    label: "Tip",
    wrapper: "rounded-lg border-l-4 border-emerald-500 bg-emerald-500/10 px-4 py-3",
    titleClass: "text-sm font-semibold text-emerald-500",
  },
  note: {
    label: "Note",
    wrapper: "rounded-lg border-l-4 border-foreground/20 bg-foreground/5 px-4 py-3",
    titleClass: "text-sm font-semibold text-secondary-text",
  },
  info: {
    label: "Info",
    wrapper: "rounded-lg border-l-4 border-primary bg-primary/10 px-4 py-3",
    titleClass: "text-sm font-semibold text-primary",
  },
  reminder: {
    label: "Reminder",
    wrapper: "rounded-lg border-l-4 border-primary bg-primary/10 px-4 py-3",
    titleClass: "text-sm font-semibold text-primary",
  },
  success: {
    label: "Success",
    wrapper: "rounded-lg border-l-4 border-emerald-500 bg-emerald-500/10 px-4 py-3",
    titleClass: "text-sm font-semibold text-emerald-500",
  },
};

const DEFAULT_CALLOUT = {
  label: "Note",
  wrapper: "rounded-lg border-l-4 border-foreground/20 bg-foreground/5 px-4 py-3",
  titleClass: "text-sm font-semibold text-secondary-text",
};

function formatInline(raw: string): string {
  let text = escapeHtml(raw);

  text = text.replace(
    /`([^`]+)`/g,
    (_match, code) =>
      `<code class="rounded bg-foreground/10 px-1 py-[1px] font-mono text-[0.85em]">${code}</code>`
  );
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  text = text.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
    const cleanHref = sanitizeHref(decodeHtmlEntities(href.trim()));
    const external = /^https?:\/\//.test(cleanHref);
    const attrs = external ? ' target="_blank" rel="noreferrer noopener"' : "";
    return `<a href="${cleanHref}" class="underline decoration-dotted hover:decoration-solid"${attrs}>${label}</a>`;
  });

  return linkifyHtml(text);
}

function stripFormatting(text: string) {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/<\/?[^>]+>/g, "")
    .trim();
}

function uniqueSlug(base: string, counts: Map<string, number>) {
  const normalized =
    base
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || "section";
  const current = counts.get(normalized) ?? 0;
  counts.set(normalized, current + 1);
  return current === 0 ? normalized : `${normalized}-${current}`;
}

function sanitizeCodeLang(value: string) {
  return value.replace(/[^a-z0-9+#.-]/gi, "").toLowerCase() || "plaintext";
}

function sanitizeHref(href: string) {
  if (!href) return "#";

  const trimmed = href.trim();
  if (trimmed.startsWith("#")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;

  const protocolMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (protocolMatch) {
    const protocol = protocolMatch[1].toLowerCase();
    if (protocol === "http" || protocol === "https" || protocol === "mailto") {
      return trimmed;
    }
    return "#";
  }

  const normalized = trimmed.replace(/\\/g, "/").replace(/^\.\//, "");
  const safeParts = normalized.split("/").filter((segment) => segment !== ".." && segment !== ".");
  const withoutExt = safeParts.join("/").replace(/\.md$/i, "");
  return `/docs/${withoutExt}`;
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function linkifyHtml(value: string) {
  return value.replace(/(^|[\s>])(https?:\/\/[^\s<]+)/g, (match, prefix, url) => {
    if (prefix.endsWith("=")) return match;
    return `${prefix}<a href="${url}" class="underline decoration-dotted hover:decoration-solid" target="_blank" rel="noreferrer noopener">${url}</a>`;
  });
}

function titleCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w|\s\w/g, (m) => m.toUpperCase());
}

function tocIndent(level: number) {
  if (level <= 2) return "";
  if (level === 3) return "pl-3";
  if (level === 4) return "pl-5";
  return "pl-7";
}
