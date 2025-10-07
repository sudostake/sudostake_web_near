"use client";

import React from "react";
import { Input } from "@/app/components/ui/Input";
import { Card } from "@/app/components/ui/Card";

export type DocLink = { title: string; href: string; description?: string };
export type Section = { id: string; title: string; items: DocLink[] };

// Keep this component very simple: filter sections by a basic search and render anchors.

export default function DocsIndexClient({ sections }: { sections: Section[] }) {
  const [query, setQuery] = React.useState("");
  const normalized = query.trim().toLowerCase();
  const filtered = React.useMemo(() => {
    if (!normalized) return sections;
    return sections
      .map((s) => ({
        ...s,
        items: s.items.filter((it) =>
          [it.title, it.description || ""].some((t) => t.toLowerCase().includes(normalized))
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [sections, normalized]);

  // No scrollspy, no persistence, no smooth scrolling. Simplicity first.

  return (
    <>
      <Input
        id="docs-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search docs…"
        containerClassName="mb-4"
      />
      {/* Mobile nav */}
      <nav className="md:hidden mb-4 text-sm flex flex-wrap gap-2">
        {filtered.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full border border-foreground/10 bg-surface px-3 py-1 hover:border-primary/40 hover:text-primary"
          >
            {s.title}
          </a>
        ))}
      </nav>
      <div className="md:flex md:items-start md:gap-6">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-[calc(var(--nav-height,56px)+16px)] hidden self-start md:block md:w-56 lg:w-64">
          <nav className="text-sm">
            <ul className="space-y-1">
              {filtered.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block rounded-full px-3 py-1 text-secondary-text transition-colors hover:bg-foreground/10 hover:text-foreground"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        {/* Main content */}
        <div className="flex-1 space-y-8">
          {filtered.map((s) => (
            <section key={s.id} id={s.id}>
              <h2 className="mb-3 text-xl font-semibold">{s.title}</h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {s.items.map((item) => (
                  <li key={item.href}>
                    <Card className="h-full transition-colors hover:border-primary/30 hover:shadow-md">
                      <a href={item.href} className="block space-y-1">
                        <div className="text-sm font-semibold text-foreground">{item.title}</div>
                        {item.description ? (
                          <p className="text-sm text-secondary-text">{item.description}</p>
                        ) : null}
                      </a>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
