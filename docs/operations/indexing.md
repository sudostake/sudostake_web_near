# Indexing: keeping Firestore fresh

## TL;DR
- Indexing bridges the gap between on-chain state (instant) and Firestore (eventually consistent).
- After important transactions, the UI triggers `/api/index_vault` to re-fetch the vault and rewrite the Firestore document.
- If indexing stalls, users see a blocker with a retry button so they never act on stale data.

## When indexing runs
1. You send a transaction that changes vault state (request, accept, repay, stake, etc.).
2. The UI waits for the wallet confirmation.
3. We fire `/api/index_vault` with `{ factory_id, vault, tx_hash? }`.
4. The endpoint calls `get_vault_state`, transforms the response, and saves the new `VaultDocument`.
5. Components that watch Firestore update in real time and the blocker disappears.

## What the blocker does
- Displays a small modal explaining that fresh data is required.
- Stores outstanding jobs in `localStorage`, so a page refresh can resume the retry cycle.
- Gives users a visible **Retry indexing** button so they stay in control.

## Server safeguards
- Rejects vault IDs that don’t belong to the supplied factory.
- Retries for a short period when the chain hasn’t finalised the vault yet.
- Adds timestamps and the last processed transaction hash to the document for easy debugging.

## Where to tweak
- `hooks/useIndexingBlocker.tsx` — UI state machine for blockers and retries.
- `app/api/index_vault/route.ts` — entry point that validates input and triggers the service.
- `utils/indexing/service.ts` — fetch-transform-save pipeline shared across manual and automated calls.
- `utils/db/vaults.ts` — Firestore helper functions, including typed document writes.

## Troubleshooting tips
- Indexed document missing fields? Check the raw `get_vault_state` response in the API logs—it may be new contract data that needs mapping.
- Retry spinning forever? Inspect network responses for `/api/index_vault`; look for permission errors or unexpected HTTP codes.
- Heavy traffic expected? Consider queueing requests or backoff logic in the service to avoid hitting rate limits.
