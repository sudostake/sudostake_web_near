Lender positions

Overview

Shows vaults funded by a given lender (accepted_offer.lender = account). Works with realtime Firestore or a REST endpoint.

What works

- Realtime subscription by lender id
- Optional REST list, ordered by acceptance time (newest first)

Configuration

- NEXT_PUBLIC_LENDING_USE_API
  - false (default): use realtime Firestore
  - true: use REST fetch

API

- GET /api/view_lender_positions?factory_id=<factoryId>&lender_id=<accountId>

Related code

- utils/data/lending.ts – Realtime vs REST and polling
- app/api/view_lender_positions/route.ts – REST handler
- utils/db/vaults.ts – Firestore helpers
