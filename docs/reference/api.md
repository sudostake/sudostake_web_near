# API reference

## TL;DR
- All routes live under `/api` inside the Next.js app, so they share the same origin as the UI.
- Use them when you need fresh Firestore data, a JSON-RPC proxy for NEAR, or helper lookups that keep wallets light.
- Routes are safe defaults: authenticated by platform secrets, rate-limited by Vercel/hosting, and return friendly errors when inputs are missing.

## Quick lookup

| Route | Method | What it does | Notes |
| ----- | ------ | ------------ | ----- |
| `/api/rpc` | `POST` | Forwards a single NEAR JSON-RPC request to testnet or mainnet. | Pass `network` in the query string (`testnet` default). Keeps CORS simple and lets us add retries. |
| `/api/view_pending_liquidity_requests` | `GET` | Lists vaults with `state=pending`. | Requires `factory_id`; optional `limit` (max 500). Powers Discover. |
| `/api/view_lender_positions` | `GET` | Lists vaults funded by a lender. | Requires `factory_id` and `lender_id`. Sorted newest first. |
| `/api/get_user_vaults` | `GET` | Returns vault IDs owned by an account. | Provide `owner` and `factory_id`. Handy for dashboards. |
| `/api/validators` | `GET` | Returns the curated validator list per network. | Pass `network=testnet|mainnet`. |
| `/api/index_vault` | `POST` | Re-indexes a vault after a transaction. | Body: `{ factory_id, vault, tx_hash? }`. Triggers `get_vault_state` → Firestore write. |

## How to call them
- **Same-origin fetch:** from the Next.js app, use `fetch("/api/…")`. Cookies and environment secrets stay on the server.
- **Server to server:** include the route on an allowlist and set the same environment variables (`FIREBASE_SERVICE_ACCOUNT_KEY`) before you invoke it.
- **Error handling:** each route returns standard HTTP status codes with JSON payloads like `{ error: "message" }`. The UI helpers translate these into user-facing toasts.

## Authentication and safety
- Wallet sessions stay client-side; API routes rely on server credentials. Keep private actions on the server when they modify Firestore.
- Guardrails live in the handlers:
  - Factory IDs and network names are validated.
  - Query limits have sensible max values.
  - The indexer rejects vault IDs that don’t belong to the supplied factory.

## When to build a new route
- You need to combine Firestore documents in a way the client cannot (e.g., admin-only filters).
- You want to batch NEAR JSON-RPC calls without leaking implementation details to the browser.
- The action should always run on secure infrastructure (secret keys, service accounts, audit logging).

If you add a route, document it here using the same pattern so everyday readers know when to use it.
