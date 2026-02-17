# API routes

## TL;DR
- App API routes live under `/api`.
- They provide RPC proxying, indexed data reads, and indexing operations.
- UI features call these routes directly with same-origin fetches.

## Routes in active use

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/rpc` | `POST` | Proxy a NEAR JSON-RPC request to selected network |
| `/api/view_pending_liquidity_requests` | `GET` | Read pending requests for Discover |
| `/api/view_lender_positions` | `GET` | Read lender positions by account |
| `/api/get_user_vaults` | `GET` | Read vault IDs owned by account |
| `/api/index_vault` | `POST` | Re-index a vault document from on-chain state |
| `/api/validators` | `GET` | Read validator list by network |

## Common parameters
- `factory_id`: identifies the vault collection / factory contract context.
- `lender_id` or `owner`: account filters for list endpoints.
- `network`: `testnet` or `mainnet` for RPC/validator calls.

## Notes
- Frontend hooks wrap these endpoints, so prefer using hooks in UI code.
- Indexing endpoints update Firestore mirror data after transactions.
