"use client";

import React from "react";

export type AccordionItem = {
  id: string;
  question: string;
  answer: React.ReactNode;
};

type Props = {
  items: AccordionItem[];
};

export function Accordion({ items }: Props) {
  const [openId, setOpenId] = React.useState<string | null>(null);
  return (
    <div className="divide-y border rounded bg-surface">
      {items.map((it) => {
        const isOpen = openId === it.id;
        const panelId = `${it.id}-panel`;
        const triggerId = `${it.id}-trigger`;
        return (
          <div key={it.id} className="px-4 py-3 sm:px-5 sm:py-4">
            <button
              type="button"
              className="w-full text-left flex items-center justify-between gap-3"
              id={triggerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenId(isOpen ? null : it.id)}
            >
              <span className="font-medium">{it.question}</span>
              <span aria-hidden="true" className="text-secondary-text">{isOpen ? "−" : "+"}</span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
              className="mt-3 max-w-[70ch] text-sm leading-relaxed text-secondary-text"
            >
              {it.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
