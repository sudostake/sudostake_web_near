"use client";

import React from "react";
import Link from "next/link";

type SocialLink = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

function GithubIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.61-3.37-1.34-3.37-1.34-.46-1.15-1.12-1.46-1.12-1.46-.92-.64.07-.63.07-.63 1.02.07 1.55 1.05 1.55 1.05.9 1.55 2.36 1.1 2.93.84.09-.66.35-1.1.63-1.35-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.26.1-2.62 0 0 .84-.27 2.75 1.02A9.58 9.58 0 0 1 12 7.07c.85.004 1.71.12 2.51.35 1.9-1.29 2.74-1.02 2.74-1.02.56 1.36.21 2.37.1 2.62.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.67.92.67 1.86v2.76c0 .26.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M4 4h3.6l4.7 6.8L17 4h3.7l-6.7 9.2L21 20h-3.7l-5.1-7.3L7.1 20H3.4l6.9-9.4L4 4Z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M21.53 2.47a1.1 1.1 0 0 0-1.14-.16L2.7 10.16c-.48.2-.76.65-.7 1.12.07.48.44.86.95.95l4.62.83 1.98 6.02c.14.43.5.72.95.76h.08c.41 0 .78-.22.98-.6l2.28-4.2 4.57 3.45c.22.17.48.25.75.25.18 0 .36-.04.53-.12.39-.17.66-.52.74-.94l3.17-15.9c.09-.47-.1-.94-.52-1.21Zm-5.33 14.68-2.98-2.27c-.2-.15-.44-.23-.68-.23-.08 0-.16 0-.25.02-.32.07-.6.29-.75.58l-1.58 2.91-1.35-4.1 7.68-6.08-9.78 5.3-3.71-.66L19.5 5.13l-3.3 12.02Z" />
    </svg>
  );
}

const LINKS: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/sudostake",
    icon: <GithubIcon />,
  },
  {
    label: "X",
    href: "https://x.com/sudostake",
    icon: <XIcon />,
  },
  {
    label: "Telegram",
    href: "https://t.me/sudostake",
    icon: <TelegramIcon />,
  },
];

export function SocialStrip() {
  return (
    <section className="mt-24 border-t pt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Connect with SudoStake</h2>
          <p className="mt-1 text-sm text-secondary-text">
            Follow product updates, protocol news, and community discussions.
          </p>
        </div>
        <ul className="flex flex-wrap gap-3">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-2 text-sm text-secondary-text hover:text-primary transition-colors"
              >
                <span aria-hidden>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
