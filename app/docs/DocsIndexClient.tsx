"use client";

import React from "react";

export type DocLink = { title: string; href: string; description?: string };
export type Section = { id: string; title: string; items: DocLink[] };

function useActiveSection(ids: string[]) {
  const [active, setActive] = React.useState<string>(ids[0] ?? "");
  React.useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const handler: IntersectionObserverCallback = (entries) => {
      // Pick the entry closest to the top that is intersecting
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (a.boundingClientRect.top || 0) - (b.boundingClientRect.top || 0));
      if (visible.length) {
        const id = (visible[0].target as HTMLElement).id;
        if (id) setActive(id);
      }
    };
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: "0px 0px -60% 0px", // trigger when heading is in top 40% of viewport
      threshold: [0, 0.1, 0.5, 1],
    };
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(handler, options);
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [ids.join(",")]);
  return active;
}

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

  const activeId = useActiveSection(filtered.map((s) => s.id));

  return (
    <>
      <div className="mb-4">
        <label className="block text-sm text-secondary-text mb-1" htmlFor="docs-search">
          Search
        </label>
        <input
          id="docs-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter topics…"
          className="w-full rounded border bg-background px-3 py-2 text-sm"
        />
      </div>
      {/* Mobile nav */}
      <nav className="md:hidden mb-4 text-sm flex flex-wrap gap-2">
        {filtered.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={
              "rounded border px-2.5 py-1 " +
              (activeId === s.id ? "bg-primary text-primary-text" : "bg-surface hover:bg-surface/90")
            }
          >
            {s.title}
          </a>
        ))}
      </nav>
      <div className="md:flex md:items-start md:gap-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block md:w-56 lg:w-64 sticky top-[calc(var(--nav-height,56px)+16px)] self-start">
          <nav className="text-sm">
            <ul className="space-y-1">
              {filtered.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={
                      "block rounded px-2 py-1 hover:bg-foreground/10 " +
                      (activeId === s.id ? "text-primary font-medium" : "")
                    }
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
              <h2 className="text-xl font-medium mb-3">{s.title}</h2>
              <ul className="grid sm:grid-cols-2 gap-2">
                {s.items.map((item) => (
                  <li key={item.href} className="rounded border bg-surface hover:bg-surface/90 transition-colors">
                    <a href={item.href} className="block px-3 py-2">
                      <div className="font-medium">{item.title}</div>
                      {item.description ? (
                        <div className="text-sm text-secondary-text">{item.description}</div>
                      ) : null}
                    </a>
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

