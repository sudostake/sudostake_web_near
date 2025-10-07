# Data model

## TL;DR
- Every factory gets its own Firestore collection. Each vault becomes a single document keyed by the vault account ID.
- Documents mirror the contract response from `get_vault_state`, with a few extras for indexing and analytics.
- Common queries filter by owner, state, or lender—keep those fields indexed to make dashboards instant.

## Collections
- `nzaza.testnet`, `sudostake.near`, and any other factory IDs map 1:1 to Firestore collections.
- Documents are stored as `{ vaultAccountId: VaultDocument }`.
- Testnet and mainnet live side by side. Switching networks swaps collections automatically.

## Document shape
| Field | Type | Description |
| ----- | ---- | ----------- |
| `factory_id` | `string` | Factory that minted the vault. |
| `account_id` | `string` | Vault NEAR account ID (document ID). |
| `owner` | `string` | Current vault owner. |
| `state` | enum | One of `idle`, `pending`, or `active`. |
| `liquidity_request` | object or `null` | Token, amount, interest, collateral, duration, `created_at`. |
| `accepted_offer` | object or `null` | Lender account, token, amount, interest, `accepted_at`. |
| `unstake_entries` | array | Outstanding undelegations by validator. |
| `current_epoch` | number | Latest epoch reported by the contract. |
| `liquidation` | object or `null` | When liquidation has started. |
| `tx_hash` | string or `null` | Last transaction hash processed (helps trace re-indexing). |
| `created_at` | string | ISO timestamp when the document was first written. |
| `updated_at` | string | ISO timestamp of the most recent successful index. |

> Need the full TypeScript definitions? See `utils/indexing/types.ts` and `utils/db/vaults.ts`.

## Transform pipeline
1. Call `get_vault_state` from the contract.
2. Convert raw values into UI-friendly shapes (`TransformedVaultState`).
3. Merge metadata (factory ID, timestamps, transaction hash) and save as `VaultDocument`.

Helpers live in `utils/indexing/service.ts`. They keep the transformation logic consistent between on-demand indexing and background jobs.

## Common queries
- **My vaults:** `where("owner", "==", accountId)` — used on the dashboard.
- **Discover page:** `where("state", "==", "pending")` with ordering by `liquidity_request.created_at`.
- **Lender positions:** `where("accepted_offer.lender", "==", accountId)` sorted by `accepted_offer.accepted_at` desc.

Add indexes in Firestore for these combinations to avoid slow queries. The repo contains a `firestore.indexes.json` template when you need to expand coverage.
