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
    <div className="rounded-2xl border border-white/12 bg-surface/90 shadow-[0_20px_60px_-44px_rgba(15,23,42,0.6)] overflow-hidden divide-y divide-[color:var(--color-border)]">
      {items.map((it) => {
        const isOpen = openId === it.id;
        const panelId = `${it.id}-panel`;
        const triggerId = `${it.id}-trigger`;
        return (
          <div key={it.id} className="transition-colors">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left sm:px-6 sm:py-5"
              id={triggerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenId(isOpen ? null : it.id)}
            >
              <span className="font-medium">{it.question}</span>
              <span aria-hidden="true" className="text-secondary-text">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
              className="px-5 pb-5 text-sm leading-relaxed text-secondary-text mt-2 sm:mt-3 sm:px-6"
            >
              {it.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
