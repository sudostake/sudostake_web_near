"use client";

import React from "react";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import { getKnownTokens } from "@/utils/tokens";
import { getActiveNetwork } from "@/utils/networks";

export type PendingFilters = {
  q: string;
  token: string | null; // NEP-141 id or null for all
  minAmount: string; // display units
  maxDays: string;
  sort: "updated_desc" | "amount_desc" | "apr_desc" | "term_asc";
};

export function PendingFilters({ value, onChange }: { value: PendingFilters; onChange: (v: PendingFilters) => void }) {
  const network = getActiveNetwork();
  const tokens = getKnownTokens(network);

  const set = (patch: Partial<PendingFilters>) => onChange({ ...value, ...patch });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <Input
        label="Search"
        placeholder="Vault or owner"
        value={value.q}
        onChange={(e) => set({ q: e.target.value })}
        className="h-9"
      />
      <Select
        label="Token"
        value={value.token ?? ""}
        onChange={(e) => set({ token: (e.target as HTMLSelectElement).value || null })}
      >
        <option value="">All</option>
        {tokens.map((t) => (
          <option key={t.id} value={t.id}>{t.symbol} — {t.id}</option>
        ))}
      </Select>
      <Input
        label="Min amount"
        type="number"
        inputMode="decimal"
        placeholder="0.0"
        value={value.minAmount}
        onChange={(e) => set({ minAmount: e.target.value })}
        className="h-9"
        hint="Token display units"
      />
      <Input
        label="Max term (days)"
        type="number"
        inputMode="numeric"
        placeholder="30"
        value={value.maxDays}
        onChange={(e) => set({ maxDays: e.target.value })}
        className="h-9"
      />
      <Select
        label="Sort"
        className="sm:col-span-2"
        value={value.sort}
        onChange={(e) => set({ sort: (e.target as HTMLSelectElement).value as PendingFilters["sort"] })}
      >
        <option value="updated_desc">Newest</option>
        <option value="amount_desc">Amount (desc)</option>
        <option value="apr_desc">APR (desc)</option>
        <option value="term_asc">Term (asc)</option>
      </Select>
    </div>
  );
}
