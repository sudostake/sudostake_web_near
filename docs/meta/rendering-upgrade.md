Markdown rendering upgrade

Goal: replace the regex-based renderer in `app/docs/[...slug]/page.tsx` with a pipeline that supports tables, callouts, internal anchors, and consistent styling—without shipping heavy client bundles.

Recommended stack

- `remark` + `rehype` via `next-mdx-remote` (server-side) for markdown → HTML. This keeps docs authored in `.md(x)` files and avoids shipping a client-side parser.
- Plugins:
  - `remark-gfm` for tables, strikethrough, and task lists.
  - `remark-frontmatter` to read metadata (title, description, audience).
  - `rehype-slug` + `rehype-autolink-headings` for anchor links.
  - Optional: `rehype-pretty-code` for syntax highlighting.
- Store shared components (e.g., callouts, glossary tooltips) as MDX shortcodes. Use a safe allowlist when serializing so only approved components render.

Why this path

- Server rendering keeps lighthouse scores high; no runtime markdown parsing.
- MDX lets us gradually introduce richer formatting without rewriting all docs at once.
- The plugin ecosystem already solves tables and callouts; no custom regex maintenance.

Migration outline

1. Core setup
   - Install `next-mdx-remote`, `remark-gfm`, `remark-frontmatter`, `rehype-slug`, `rehype-autolink-headings`.
   - Build a utility (`lib/docs/render.ts`) that loads markdown, parses frontmatter, and returns serialized MDX + metadata.
   - Update `app/docs/[...slug]/page.tsx` to call the utility and render with `<MDXRemote />`, passing custom components (Callout, CodeBlock, GlossaryTerm).
2. Styling
   - Wrap docs in a `DocsLayout` that sets typographic scale, max-width, and table styles.
   - Add callout and table components under `app/docs/components/`.
3. Backfill metadata
   - Add frontmatter (`title`, `summary`, `audience`, `updated`) to each doc.
   - Surface summary + audience chips on the index cards in `DocsIndexClient.tsx`.
4. Content pass
   - Convert priority docs to MDX only if they need components; `.md` files continue to work.
   - Validate tables, callouts, and code blocks render correctly on desktop and mobile.
5. Automation
   - Add lint script (`pnpm lint:docs`) that runs `remark-lint`, checks frontmatter fields, and verifies internal links.
   - Update CI to run the script and block merges on failures.

Fallback option

If MDX is too heavy, use `remark-parse` + `remark-gfm` + `rehype-stringify` without MDX. You lose inline React components but still gain standard markdown features. Start with this minimal pipeline and layer MDX later if needed.
