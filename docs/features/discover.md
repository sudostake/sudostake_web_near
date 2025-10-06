Discover: pending liquidity requests

Overview

The Discover page shows vaults that are asking for liquidity (state = pending). It can read data in real time from Firestore or call a REST endpoint.

What works

- Realtime list via Firestore
- Optional REST list via /api/view_pending_liquidity_requests
- Simple client-side sorting (we can move sorting server-side later)

Configuration

- NEXT_PUBLIC_PENDING_USE_API
  - false (default): use realtime Firestore
  - true: use REST polling

API

- GET /api/view_pending_liquidity_requests?factory_id=<factoryId>&limit=<n>
  - factory_id is required and must be approved
  - limit is optional (max 500)

Related code

- utils/data/pending.ts – Realtime vs REST toggle and fetching
- app/api/view_pending_liquidity_requests/route.ts – REST handler
- utils/db/vaults.ts – Firestore helpers
