# Architecture overview

## TL;DR
- SudoStake is a Next.js app that reads on-chain vault data from NEAR and mirrors it in Firestore so the UI feels instant.
- Wallet Selector manages every wallet connection; all blockchain calls flow through the `/api/rpc` proxy so we can swap networks safely.
- Each factory contract gets its own Firestore collection—one document per vault—so the UI can stream updates or fall back to REST endpoints.
- Vault owners and lenders consume the same data; the UI simply gates actions based on viewer role.

## Before you dive in
- **Follow the playbook:** Need the high-level journey for vault owners and lenders? Start with the [SudoStake playbook](./playbook.md).
- **Pick a network:** Testnet and mainnet are both supported. Factory IDs and RPC hosts live in [networks and RPC](./reference/networks.md).
- **Skim the data model:** Each Firestore document is a `VaultDocument`. See [data model](./reference/data-model.md) for the exact fields.
- **Remember the toggle flags:** `NEXT_PUBLIC_PENDING_USE_API` and `NEXT_PUBLIC_LENDING_USE_API` switch pages between realtime Firestore and REST polling.

## How the pieces fit
### Wallets
- Wallet Selector handles connect, sign, and transaction sends.
- The global provider lives in `app/providers.tsx`. It shares the selected account with navigation, dashboards, and hooks.

### Chain access
- Every on-chain read or write travels through `/api/rpc`. The route wraps NEAR JSON-RPC calls and swaps network IDs for you, so we stay clear of CORS issues.
- Server-side routes use `near-api-js`. Client components rely on hooks that call the proxy.

### Firestore mirror
- A background task (or an explicit “Retry indexing” click) calls `get_vault_state` on NEAR, transforms the response, and writes a `VaultDocument` to Firestore.
- Collections are named after the factory account (`nzaza.testnet`, `sudostake.near`). Documents are keyed by the vault account ID.
- Views subscribe in realtime via Firebase SDK or call REST endpoints that read the same documents on demand.

### When data looks stale
- After a transaction, Firestore may lag the chain by a few seconds. The UI blocks risky actions and shows a “Retry indexing” button that hits `/api/index_vault`.
- Operations runbook: [Indexing and consistency](./operations/indexing.md).

## Supporting services
### Firebase
- **Client:** `firebase/app` and `firebase/firestore` stream live updates to dashboards.
- **Server:** `firebase-admin` powers API routes that read or write Firestore securely.

### RPC proxy
- `POST /api/rpc` forwards JSON-RPC calls to the active NEAR network.
- Centralising the proxy gives us a single place to enforce allowlists, add retries, or capture metrics.

## Where to look in the code
- `utils/indexing/service.ts` — fetch, transform, and store vault state.
- `utils/db/vaults.ts` — Firestore helpers.
- `app/api/index_vault/route.ts` — manual indexing endpoint.
- `app/components` and `hooks/` — feature-level hooks and UI components that consume the mirrored data.

## Related docs
- [Viewer roles](./reference/roles.md) — who sees what in the UI.
- [Tokens and balances](./features/tokens.md) — how we cache token metadata and balances.
- [Vault lifecycle](./features/vaults.md) — the journey from creating a vault to repaying a loan.
