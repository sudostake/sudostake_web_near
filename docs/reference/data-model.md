# Data model (Firestore mirror)

## TL;DR
- Each vault is mirrored into Firestore for fast UI reads.
- Factory ID maps to collection name; vault account ID maps to document ID.
- Indexed fields drive Discover, vault views, and positions.

## Collection layout
- Collection key: factory ID (`nzaza.testnet` or `sudostake.near`).
- Document key: vault account ID (for example `vault-12.nzaza.testnet`).

## Core fields used by UI
- `owner`
- `state` (`idle`, `pending`, `active`)
- `liquidity_request` (token, amount, interest, collateral, duration)
- `accepted_offer` (lender, accepted_at)
- `liquidation`
- `unstake_entries`
- `current_epoch`
- indexing metadata (`updated_at`, tx hash, factory id)

## Refresh model
- On key mutations, the app re-reads on-chain vault state and rewrites the document.
- If data appears stale, retry indexing from the UI.
