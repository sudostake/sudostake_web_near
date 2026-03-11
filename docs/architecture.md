# Architecture overview

## TL;DR
- NEAR is the source of truth for vault state.
- Firestore stores a fast read model for the UI.
- Next.js API routes proxy chain calls and trigger indexing.

## Main pieces
- Frontend: landing page, dashboard, discover, vault pages, and docs.
- Wallet layer: NEAR Wallet Selector handles sign-in and transaction approval.
- Firestore: indexed vault documents for fast list and detail views.
- API layer: `/api/rpc` plus app routes for reads and indexing.

## How data moves
1. User opens the app and optionally connects a wallet.
2. The UI reads Firestore for vaults, pending requests, and lender positions.
3. The user signs a transaction in their wallet.
4. The app calls `/api/index_vault` and related indexing helpers.
5. Firestore updates flow back into Discover, dashboard, and vault pages.

## Why it works this way
- Firestore makes list and detail screens fast.
- Wallet approval stays the clear boundary for state changes.
- Retry indexing gives the app a recovery path after sync failures.

## When data looks stale
- Pending requests and lender positions can switch to REST polling.
- Enable polling with `NEXT_PUBLIC_PENDING_USE_API=true` and `NEXT_PUBLIC_LENDING_USE_API=true`.
- Vault detail pages always read from Firestore.
- If indexing fails after a transaction, the app shows a retry modal.

## Related docs
- [Playbook](./playbook.md)
- [Data model](./reference/data-model.md)
- [Indexing](./operations/indexing.md)
