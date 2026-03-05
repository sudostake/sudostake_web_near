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
  const containerClassName = [
    "rounded-app",
    "pixel-card",
    "border-2",
    "border-[color:var(--panel-border)]",
    "bg-[color:var(--surface)]",
    "shadow-[var(--pixel-shadow)]",
    "overflow-hidden",
    "divide-y",
    "divide-(color:--color-border)",
  ].join(" ");
  return (
    <div className={containerClassName}>
      {items.map((it) => {
        const isOpen = openId === it.id;
        const panelId = `${it.id}-panel`;
        const triggerId = `${it.id}-trigger`;
        return (
          <div key={it.id} className="transition-colors">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-[color:var(--text-primary)] sm:px-6 sm:py-5"
              id={triggerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenId(isOpen ? null : it.id)}
            >
              <span className="pixel-heading text-sm">{it.question}</span>
              <span aria-hidden="true" className="pixel-heading text-sm text-secondary-text">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
              className="mt-2 px-5 pb-5 text-sm leading-relaxed text-secondary-text sm:mt-3 sm:px-6"
            >
              {it.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
