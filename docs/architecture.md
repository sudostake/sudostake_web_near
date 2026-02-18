# Architecture overview

## TL;DR
- NEAR is source of truth for vault state.
- Firestore mirrors vault state for fast UI reads.
- Next.js API routes handle RPC proxying, reads, and indexing writes.

## Main pieces
- Frontend (Next.js app): landing, dashboard, discover, vault, docs.
- Wallet layer: NEAR Wallet Selector for sign-in and transaction approval.
- Data mirror: Firestore documents keyed by factory ID and vault ID.
- API layer: `/api/rpc`, list/read routes, and indexing routes.

## Runtime flow
1. User opens app and optionally connects wallet.
2. By default, UI subscribes to Firestore for vaults, pending requests, and lender positions.
3. User approves a transaction in wallet.
4. App triggers indexing via `/api/index_vault` (and best-effort enqueue).
5. Firestore subscribers update Discover, dashboard, and vault views.

## Why this model
- Fast list/detail rendering from indexed documents.
- Clear wallet approval boundary for state-changing actions.
- Deterministic recovery path through retry indexing.

## Data source notes
- Pending requests and lender positions can use REST polling.
- Enable polling with `NEXT_PUBLIC_PENDING_USE_API=true` and `NEXT_PUBLIC_LENDING_USE_API=true`.
- Vault detail views always subscribe directly to Firestore.

## Related docs
- [Playbook](./playbook.md)
- [Data model](./reference/data-model.md)
- [Indexing](./operations/indexing.md)
