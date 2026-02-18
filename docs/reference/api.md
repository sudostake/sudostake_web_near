# API routes

## TL;DR
- App API routes live under `/api`.
- They provide RPC proxying, indexed data reads, and indexing operations.
- UI features call these routes directly with same-origin fetches.

## Routes in active use

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/rpc` | `POST` | Proxy a NEAR JSON-RPC request to selected network |
| `/api/get_user_vaults` | `GET` | Read vault IDs owned by account |
| `/api/view_pending_liquidity_requests` | `GET` | Read pending requests for Discover |
| `/api/view_lender_positions` | `GET` | Read lender positions by account |
| `/api/index_vault` | `POST` | Re-index a vault document from on-chain state |
| `/api/indexing/enqueue` | `POST` | Queue indexing job for worker-based recovery |
| `/api/indexing/worker` | `GET`, `POST` | Process queued indexing jobs |
| `/api/validators` | `GET` | Read validator list by network |

## Common parameters
- `factory_id`: identifies the vault collection / factory contract context.
- `lender_id` or `owner`: account filters for list endpoints.
- `network`: `testnet` or `mainnet` for RPC/validator calls.

## Notes
- Factory-scoped routes validate `factory_id` against an allowlist.
- Frontend hooks wrap these endpoints, so prefer using hooks in UI code.
- `useIndexVault` calls `/api/index_vault` directly and also attempts `/api/indexing/enqueue`.
- Pending and lender list hooks can switch to API polling with env flags.
